import express from 'express';
import path from 'path';
import fs from 'fs';
import { sql } from '../config/db.js';

const router = express.Router();

// Allowed media types
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/x-msvideo', 'video/quicktime', 'video/x-matroska'];
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_IMAGES_PER_MARKER = 5;
const MAX_VIDEOS_PER_MARKER = 1;

// GET: Fetch media for a landmark
router.get('/landmark/:landmarkId', async (req, res) => {
  try {
    const { landmarkId } = req.params;
    const media = await sql`
      SELECT id, landmark_id, media_type, file_name, file_path, file_size, 
             mime_type, order_index, created_at
      FROM landmark_media
      WHERE landmark_id = ${landmarkId}
      ORDER BY media_type DESC, order_index ASC
    `;
    
    res.json({ success: true, data: media });
  } catch (err) {
    console.error('❌ Get media error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

function normalizeOriginalName(dbFileName) {
  if (!dbFileName) return '';
  // If stored as "<timestamp>_<original>", strip the leading timestamp.
  // Fallback only; preferred is original_file_name column.
  return dbFileName.replace(/^\d+_/, '');
}

// Helper: Check for duplicate file (same name and size)
async function checkDuplicateFile(landmarkId, originalFileName, fileSize) {
  // Prefer original_file_name if the column exists/populated
  const exact = await sql`
    SELECT id
    FROM landmark_media
    WHERE landmark_id = ${landmarkId}
      AND file_size = ${fileSize}
      AND (
        original_file_name = ${originalFileName}
        OR (original_file_name IS NULL AND ${originalFileName} = regexp_replace(file_name, '^\\d+_', ''))
      )
    LIMIT 1
  `;

  if (exact.length > 0) {
    return { isDuplicate: true, type: 'exact' };
  }

  // Same name but different size → conflict
  const sameName = await sql`
    SELECT id
    FROM landmark_media
    WHERE landmark_id = ${landmarkId}
      AND (
        original_file_name = ${originalFileName}
        OR (original_file_name IS NULL AND ${originalFileName} = regexp_replace(file_name, '^\\d+_', ''))
      )
    LIMIT 50
  `;

  if (sameName.length > 0) {
    return { isDuplicate: false, type: 'sameName', conflictCount: sameName.length };
  }

  return { isDuplicate: false, type: 'none' };
}

// Helper: Generate unique filename with suffix
function generateUniqueFileName(originalFileName, suffix = 1) {
  const ext = path.extname(originalFileName);
  const name = path.basename(originalFileName, ext);
  return `${name}_${suffix}${ext}`;
}

// POST: Upload media for a landmark
router.post('/upload/:landmarkId', async (req, res) => {
  try {
    const { landmarkId } = req.params;

    // Verify landmark exists
    const landmark = await sql`SELECT id FROM landmarks WHERE id = ${landmarkId}`;
    if (landmark.length === 0) {
      return res.status(404).json({ success: false, error: 'Landmark not found' });
    }

    // Check if files uploaded
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ success: false, error: 'No files uploaded' });
    }

    const uploadedFiles = [];
    let images = req.files.images || [];
    let video = req.files.video;

    // Normalize to array
    if (!Array.isArray(images)) {
      images = images ? [images] : [];
    }

    // Get current media counts and existing files
    const mediaCounts = await sql`
      SELECT media_type, COUNT(*) as count
      FROM landmark_media
      WHERE landmark_id = ${landmarkId}
      GROUP BY media_type
    `;

    // postgres.js returns COUNT(*) as string -> must coerce to number
    const imageCount = Number(mediaCounts.find(m => m.media_type === 'image')?.count || 0);
    const videoCount = Number(mediaCounts.find(m => m.media_type === 'video')?.count || 0);

    console.log(`📊 Landmark ${landmarkId}: ${imageCount} images, ${videoCount} videos`);
    console.log(`📥 Incoming: ${images.length} images, ${video ? 1 : 0} video`);

    // Validate image count
    const willExceedLimit = imageCount + images.length > MAX_IMAGES_PER_MARKER;
    const totalWillBe = imageCount + images.length;
    console.log(`🔍 Validation: ${imageCount} + ${images.length} = ${totalWillBe}, max is ${MAX_IMAGES_PER_MARKER}, exceeds? ${willExceedLimit}`);
    
    if (images.length > 0 && willExceedLimit) {
      console.warn(`❌ Image limit exceeded: ${imageCount} + ${images.length} > ${MAX_IMAGES_PER_MARKER}`);
      return res.status(400).json({
        success: false,
        error: `Maximum ${MAX_IMAGES_PER_MARKER} images allowed per marker. Current: ${imageCount}`
      });
    }

    // Validate video count
    if (video && videoCount > 0) {
      console.warn(`❌ Video limit exceeded: ${videoCount} + 1 > ${MAX_VIDEOS_PER_MARKER}`);
      return res.status(400).json({
        success: false,
        error: 'Maximum 1 video allowed per marker'
      });
    }

    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'uploads', 'media', `landmark_${landmarkId}`);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Process images
    for (const image of images) {
      // Validate image type
      if (!ALLOWED_IMAGE_TYPES.includes(image.mimetype)) {
        return res.status(400).json({
          success: false,
          error: `Invalid image type: ${image.mimetype}. Allowed: JPG, PNG, GIF, WebP`
        });
      }

      // Check for duplicates
      const dupCheck = await checkDuplicateFile(landmarkId, image.name, image.size);
      if (dupCheck.isDuplicate && dupCheck.type === 'exact') {
        // Skip exact duplicate
        console.log(`⏭️ Skipping duplicate image: ${image.name} (${image.size} bytes)`);
        continue;
      }

      let fileName = image.name;
      if (dupCheck.type === 'sameName') {
        // Same name but different size: rename with suffix
        fileName = generateUniqueFileName(image.name, dupCheck.conflictCount + 1);
        console.log(`📝 Renamed image due to name conflict: ${image.name} → ${fileName}`);
      }

      const originalFileName = image.name;
      const timestampedName = `${Date.now()}_${fileName}`;
      const filePath = path.join(uploadDir, timestampedName);
      const relativePath = path.relative(process.cwd(), filePath).replace(/\\/g, '/');

      // Save file
      await image.mv(filePath);

      // Get next order index for images
      const lastImageOrder = await sql`
        SELECT MAX(order_index) as max_order
        FROM landmark_media
        WHERE landmark_id = ${landmarkId} AND media_type = 'image'
      `;
      const nextOrder = (lastImageOrder[0]?.max_order || -1) + 1;

      // Save metadata to database
      try {
        const result = await sql`
          INSERT INTO landmark_media 
          (landmark_id, media_type, file_name, original_file_name, file_path, file_size, mime_type, order_index)
          VALUES (${landmarkId}, 'image', ${timestampedName}, ${originalFileName}, ${relativePath}, ${image.size}, ${image.mimetype}, ${nextOrder})
          RETURNING id, file_name, file_path, media_type, file_size
        `;

        uploadedFiles.push({
          id: result[0].id,
          type: 'image',
          fileName: result[0].file_name,
          url: `/api/media/serve/${landmarkId}/${result[0].file_name}`,
          size: result[0].file_size
        });
      } catch (dbErr) {
        console.error('❌ DB insert error for image:', dbErr.message);
        // Clean up the file if DB insert fails
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
        throw dbErr;
      }
    }

    // Process video
    if (video) {
      // Validate video type
      if (!ALLOWED_VIDEO_TYPES.includes(video.mimetype)) {
        return res.status(400).json({
          success: false,
          error: `Invalid video type: ${video.mimetype}. Allowed: MP4, WebM, AVI, MOV, MKV`
        });
      }

      // Validate video size
      if (video.size > MAX_VIDEO_SIZE) {
        return res.status(400).json({
          success: false,
          error: `Video too large: ${(video.size / 1024 / 1024).toFixed(2)}MB. Maximum: 50MB`
        });
      }

      // Check for duplicates
      const dupCheck = await checkDuplicateFile(landmarkId, video.name, video.size);
      if (dupCheck.isDuplicate && dupCheck.type === 'exact') {
        // Skip exact duplicate
        console.log(`⏭️ Skipping duplicate video: ${video.name} (${video.size} bytes)`);
        return res.json({
          success: true,
          message: `${uploadedFiles.length} file(s) uploaded successfully (duplicate video skipped)`,
          files: uploadedFiles
        });
      }

      let fileName = video.name;
      if (dupCheck.type === 'sameName') {
        // Same name but different size: rename with suffix
        fileName = generateUniqueFileName(video.name, dupCheck.conflictCount + 1);
        console.log(`📝 Renamed video due to name conflict: ${video.name} → ${fileName}`);
      }

      const originalFileName = video.name;
      const timestampedName = `${Date.now()}_${fileName}`;
      const filePath = path.join(uploadDir, timestampedName);
      const relativePath = path.relative(process.cwd(), filePath).replace(/\\/g, '/');

      // Save file
      await video.mv(filePath);

      // Save metadata to database
      try {
        const result = await sql`
          INSERT INTO landmark_media 
          (landmark_id, media_type, file_name, original_file_name, file_path, file_size, mime_type, order_index)
          VALUES (${landmarkId}, 'video', ${timestampedName}, ${originalFileName}, ${relativePath}, ${video.size}, ${video.mimetype}, 0)
          RETURNING id, file_name, file_path, media_type, file_size
        `;

        uploadedFiles.push({
          id: result[0].id,
          type: 'video',
          fileName: result[0].file_name,
          url: `/api/media/serve/${landmarkId}/${result[0].file_name}`,
          size: result[0].file_size
        });
      } catch (dbErr) {
        console.error('❌ DB insert error for video:', dbErr.message);
        // Clean up the file if DB insert fails
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
        throw dbErr;
      }
    }

    res.json({
      success: true,
      message: `${uploadedFiles.length} file(s) uploaded successfully`,
      files: uploadedFiles
    });
  } catch (err) {
    console.error('❌ Upload error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET: Serve media file
router.get('/serve/:landmarkId/:fileName', (req, res) => {
  try {
    const { landmarkId, fileName } = req.params;
    const filePath = path.join(process.cwd(), 'uploads', 'media', `landmark_${landmarkId}`, fileName);

    // Security: prevent directory traversal
    if (!filePath.startsWith(path.join(process.cwd(), 'uploads'))) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, error: 'File not found' });
    }

    // Determine content type
    const ext = path.extname(fileName).toLowerCase();
    let contentType = 'application/octet-stream';
    if (['.jpg', '.jpeg'].includes(ext)) contentType = 'image/jpeg';
    else if (ext === '.png') contentType = 'image/png';
    else if (ext === '.gif') contentType = 'image/gif';
    else if (ext === '.webp') contentType = 'image/webp';
    else if (ext === '.mp4') contentType = 'video/mp4';
    else if (ext === '.webm') contentType = 'video/webm';
    else if (ext === '.avi') contentType = 'video/x-msvideo';
    else if (ext === '.mov') contentType = 'video/quicktime';
    else if (ext === '.mkv') contentType = 'video/x-matroska';

    res.setHeader('Content-Type', contentType);
    res.sendFile(filePath);
  } catch (err) {
    console.error('❌ Serve media error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE: Remove media file
router.delete('/:mediaId', async (req, res) => {
  try {
    const { mediaId } = req.params;

    // Get media details
    const media = await sql`
      SELECT id, landmark_id, file_name, file_path
      FROM landmark_media
      WHERE id = ${mediaId}
    `;

    if (media.length === 0) {
      return res.status(404).json({ success: false, error: 'Media not found' });
    }

    const { file_path, landmark_id } = media[0];

    // Delete from database
    await sql`DELETE FROM landmark_media WHERE id = ${mediaId}`;

    // Delete physical file
    const filePath = path.join(process.cwd(), file_path);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.json({ success: true, message: 'Media deleted successfully' });
  } catch (err) {
    console.error('❌ Delete error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT: Update media order
router.put('/reorder/:landmarkId', async (req, res) => {
  try {
    const { landmarkId } = req.params;
    const { mediaOrder } = req.body;

    if (!Array.isArray(mediaOrder)) {
      return res.status(400).json({ success: false, error: 'mediaOrder must be an array' });
    }

    // Update order for each media item
    for (let i = 0; i < mediaOrder.length; i++) {
      await sql`
        UPDATE landmark_media
        SET order_index = ${i}
        WHERE id = ${mediaOrder[i]}
      `;
    }

    res.json({ success: true, message: 'Media order updated' });
  } catch (err) {
    console.error('❌ Reorder error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
