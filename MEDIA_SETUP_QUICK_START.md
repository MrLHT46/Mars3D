# 🚀 Media Gallery - Setup & Testing Guide

**Complete step-by-step guide to set up and test the media gallery feature.**

---

## 📋 Prerequisites

Before starting, ensure you have:
- ✅ Node.js 16+ installed
- ✅ Backend running on port 5000
- ✅ Frontend running on port 8081
- ✅ Database connected and working
- ✅ Location migration completed (`npm run migrate`)

---

## 🔧 Installation Steps

### Step 1: Navigate to Backend
```bash
cd d:\ICDingHoc\Project\Mars3D\ Vue\ 3\backend
```

### Step 2: Install Dependencies
```bash
npm install
```

This will install:
- `express-fileupload` - File upload handling
- All other existing dependencies

**Expected**: No errors, "up to date" or "added packages"

### Step 3: Run Media Migration
```bash
npm run migrate-media
```

**Expected Output**:
```
🔄 Running media database migrations...
✅ landmark_media table created/verified
✅ Index created for landmark_media
✅ All media migrations completed successfully!
```

### Step 4: Verify File Structure
Check these folders exist:
```
backend/
  uploads/
    media/          ← Should exist (created by migration)
```

If `/uploads/media/` doesn't exist, create it:
```bash
mkdir -p uploads/media
```

### Step 5: Start Backend
```bash
npm run dev
```

**Expected Output**:
```
✅ PostgreSQL (postgres.js) connected to host: db.qsftwznznaqcpjxjtncd.supabase.co:5432/postgres
🚀 Server running on http://localhost:5000
```

### Step 6: Start Frontend (New Terminal)
```bash
cd d:\ICDingHoc\Project\Mars3D\ Vue\ 3\frontend
npm run dev
```

**Expected Output**:
```
Local: http://localhost:8081
```

---

## ✅ Verification Checklist

### Backend API Verification
```bash
# Test backend is running
curl http://localhost:5000/api/ping
# Expected: {"status":"ok"}

# List existing landmarks
curl http://localhost:5000/api/landmarks
# Expected: JSON array of landmarks
```

### Database Verification
Check the database has the new table:
```sql
-- Should show landmark_media table
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'landmark_media';

-- Should show columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'landmark_media';
```

Expected columns:
- id (PRIMARY KEY)
- landmark_id (FOREIGN KEY)
- media_type (VARCHAR: 'image' or 'video')
- file_name (VARCHAR)
- file_path (VARCHAR)
- file_size (INTEGER)
- mime_type (VARCHAR)
- order_index (INTEGER)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

### File System Verification
```bash
# Check upload directory exists
ls -la backend/uploads/media/

# Should be empty initially
# After first upload, will contain: landmark_1/, landmark_2/, etc.
```

---

## 🧪 Testing the Feature

### Test 1: Upload Images

**Steps**:
1. Open http://localhost:8081 in browser
2. Click on an existing marker (or create new one)
3. In modal, click "📸 Thư viện Media" tab
4. Click blue "🖼️ Tải ảnh" button
5. Select 2-3 image files (JPG, PNG, GIF, WebP)
6. Wait for upload to complete

**Expected Results**:
- ✅ Progress bar appears and fills
- ✅ Success message: "3 file(s) uploaded successfully"
- ✅ Counter shows "3/5 ảnh"
- ✅ Files appear in `/backend/uploads/media/landmark_X/`
- ✅ Metadata in database table `landmark_media`

**Error Testing**:
- Try uploading 6th image → Should error: "Maximum 5 images allowed"
- Try uploading non-image file (.txt) → Should error: "Invalid image type"

### Test 2: Upload Video

**Steps**:
1. In same modal, click purple "🎬 Tải video" button
2. Select a video file (MP4 recommended, < 50MB)
3. Wait for upload

**Expected Results**:
- ✅ Progress bar appears
- ✅ Success message: "1 file(s) uploaded successfully"
- ✅ Counter shows "1/1 video"
- ✅ Video file in upload folder

**Error Testing**:
- Try uploading 2nd video → Should error: "Maximum 1 video allowed"
- Try uploading 60MB file → Should error: "Video too large"
- Try uploading non-video file → Should error: "Invalid video type"

### Test 3: Desktop Hover Gallery

**Steps**:
1. Close the modal (click ❌ or outside)
2. Hover mouse over the marker
3. Address tooltip should appear
4. Gallery should display with images/video
5. Wait 3 seconds - should auto-advance to next media
6. Click "▶" next button - should jump to next
7. Click "◀" previous button - should go back
8. Click thumbnail - should jump to that media
9. Move mouse away - gallery should hide

**Expected Results**:
- ✅ Tooltip appears after ~200ms
- ✅ Gallery displays with images/video
- ✅ Media counter shows "1/3" etc.
- ✅ Auto-play advances every 3 seconds
- ✅ Manual controls work (previous/next buttons)
- ✅ Thumbnails show all media
- ✅ Scrolling thumbnails shows left/right arrows when needed
- ✅ Gallery hides when mouse leaves marker

### Test 4: Mobile Long-Press Gallery

**Steps (on mobile device or mobile emulator)**:
1. Open http://localhost:8081 on mobile
2. Long-press (hold) on a marker for ~500ms
3. Gallery tooltip should appear centered
4. Should auto-play media
5. Tap "▶" button to navigate
6. Tap thumbnail to jump
7. Tap outside to close

**Expected Results**:
- ✅ Gallery appears after ~500ms press
- ✅ Positioned in center of screen
- ✅ Large, touch-friendly buttons
- ✅ Auto-play starts
- ✅ Manual controls responsive
- ✅ Thumbnails scrollable
- ✅ Easy to close

**How to Test on Desktop**:
- Option 1: Use Chrome DevTools mobile emulation (F12 → Toggle device toolbar)
- Option 2: Use actual mobile device
- Option 3: Trigger manually by adding debug code

### Test 5: Page Reload Persistence

**Steps**:
1. Upload images to a marker
2. Close modal and see gallery
3. Refresh page (Ctrl+R or Cmd+R)
4. Click same marker again
5. Check media tab - images should still be there
6. Hover/long-press marker - gallery should still show

**Expected Results**:
- ✅ Media persists after page reload
- ✅ Database query returns same media
- ✅ File URLs still work
- ✅ Gallery displays correctly

### Test 6: Marker Deletion Cascade

**Steps**:
1. Create a marker with 2-3 images
2. Note the landmark ID (from database)
3. Delete the marker from the app
4. Check database: media for that landmark should be gone
5. Check `/uploads/media/` folder: landmark folder should be gone

**Expected Results**:
- ✅ Media deleted from database (cascade)
- ✅ Files deleted from disk
- ✅ No orphaned files left
- ✅ Landmark folder removed

### Test 7: File Type Validation

**Create test files**:
```bash
# Valid image
echo "fake" > test.jpg
echo "fake" > test.png

# Valid video
echo "fake" > test.mp4

# Invalid
echo "fake" > test.txt
echo "fake" > test.docx
```

**Test Upload**:
1. Try uploading test.jpg → Should work (MIME check)
2. Try uploading test.txt → Should fail (MIME check)

**Expected Validation**:
- ✅ MIME type checked
- ✅ File extension checked
- ✅ Proper error messages

### Test 8: Concurrent Uploads

**Steps**:
1. Open modal with multiple files ready
2. Rapidly click upload buttons
3. Monitor progress bars

**Expected Results**:
- ✅ Uploads queued properly
- ✅ No race conditions
- ✅ All files upload successfully
- ✅ Counter updates correctly

---

## 📊 API Testing

### Using PowerShell or curl

```bash
# Get media for landmark ID 1
curl -X GET http://localhost:5000/api/media/landmark/1

# Upload media (requires multipart form data)
# See complex example below
```

### Upload Media Example (PowerShell)
```powershell
$landmarkId = 1
$imagePath = "C:\path\to\image.jpg"

$form = @{
    images = Get-Item -Path $imagePath
}

Invoke-WebRequest -Uri "http://localhost:5000/api/media/upload/$landmarkId" `
  -Method POST `
  -Form $form
```

---

## 🐛 Troubleshooting

### Migration Fails
**Symptom**: `npm run migrate-media` shows error

**Solutions**:
1. Check database connection: `npm run dev` (should connect first)
2. Check if table already exists (idempotent, should work anyway)
3. Clear any locks: Stop server, wait 10s, try again
4. Check PostgreSQL logs for permission errors

### Upload Button Doesn't Work
**Symptom**: Clicking "🖼️ Tải ảnh" does nothing

**Solutions**:
1. Marker must be saved first (has ID)
2. Close and reopen modal after saving marker
3. Check browser console (F12) for JavaScript errors
4. Verify backend is running on port 5000

### "Error when uploading"
**Symptom**: Upload fails with error message

**Solutions**:
1. Check file size:
   - Images: typically < 5MB
   - Videos: must be < 50MB
2. Check file type:
   - Images: JPG, PNG, GIF, WebP only
   - Videos: MP4, WebM, AVI, MOV, MKV only
3. Check upload count:
   - Max 5 images per marker
   - Max 1 video per marker
4. Check disk space: Need space for files

### Gallery Doesn't Show on Hover
**Symptom**: Tooltip shows but no gallery images

**Solutions**:
1. Verify media was uploaded (check counter in modal)
2. Refresh page (cache issue)
3. Check browser console for fetch errors
4. Verify media files exist in `/backend/uploads/media/`
5. Check database: `SELECT * FROM landmark_media WHERE landmark_id = 1`

### Videos Won't Play
**Symptom**: Video thumbnail shows but won't play

**Solutions**:
1. Check video format is web-compatible (MP4 recommended)
2. Check file isn't corrupted
3. Try another video file
4. Check browser supports video format (usually all browsers support MP4)

### Files Uploaded But Not Showing
**Symptom**: Upload succeeds but no images in gallery

**Solutions**:
1. Refresh page (cache)
2. Check browser console for network errors
3. Verify API endpoint returns media: `curl http://localhost:5000/api/media/landmark/1`
4. Check file paths in database match disk
5. Check `/uploads/media/landmark_1/` folder has files

### "Maximum X allowed per marker" Error Even After Deleting
**Symptom**: Can't upload, says already at max

**Solutions**:
1. Check database for orphaned records:
   ```sql
   SELECT * FROM landmark_media WHERE landmark_id = 1;
   ```
2. Delete manually if needed:
   ```sql
   DELETE FROM landmark_media WHERE landmark_id = 1 AND media_type = 'image';
   ```
3. Refresh page to reload count

### Disk Space Issues
**Symptom**: Upload fails with "No space left on device"

**Solutions**:
1. Check available disk space
2. Delete old media files from `/uploads/media/`
3. Clean up database: Remove old landmark_media records
4. Compress videos before uploading

---

## 🔧 Advanced Configuration

### Change Auto-Play Interval
In `MediaGallery.vue`:
```javascript
:autoPlayInterval="3000"  // milliseconds (currently 3 seconds)
// Change to: :autoPlayInterval="2000"  // 2 seconds
```

### Change Long-Press Duration
In `Mars3DMap.vue`, search for `pointerdownTimer`:
```javascript
const pressDuration = 500;  // milliseconds
// Change to: const pressDuration = 1000;  // 1 second
```

### Change Max Video Size
In `backend/routes/media.js`:
```javascript
const MAX_VIDEO_SIZE = 50 * 1024 * 1024;  // 50MB
// Change to: const MAX_VIDEO_SIZE = 100 * 1024 * 1024;  // 100MB
```

### Change Max Images
In `backend/routes/media.js`:
```javascript
const MAX_IMAGES_PER_MARKER = 5;
// Change to: const MAX_IMAGES_PER_MARKER = 10;
```

---

## 📈 Performance Monitoring

### Check Upload Times
1. Open browser DevTools (F12)
2. Go to Network tab
3. Upload media
4. Check request timing (should be < 5s for typical files)

### Check Memory Usage
1. DevTools → Performance tab
2. Record while viewing gallery
3. Gallery should not cause significant memory leaks

### Check Database Queries
1. Monitor query execution time
2. Should be < 100ms for typical queries
3. Index on `landmark_id` should help

---

## ✅ Final Checklist

Before deploying to production:

- [ ] All migrations run successfully
- [ ] Images upload and display correctly
- [ ] Videos upload (< 50MB) and display
- [ ] Gallery auto-plays on hover/long-press
- [ ] Navigation works (previous, next, thumbnails)
- [ ] Mobile long-press works (~500ms)
- [ ] Page reload persists media
- [ ] Marker deletion cascades to media
- [ ] Error messages clear and helpful
- [ ] No console errors or warnings
- [ ] Upload validation working (size, type, count)
- [ ] Disk storage organized (landmark folders)
- [ ] Database growth manageable
- [ ] Performance acceptable (< 2s load time)
- [ ] Mobile responsive and touch-friendly
- [ ] Tested on multiple browsers

---

## 📚 Additional Resources

- [Feature Guide](./MEDIA_FEATURE_GUIDE.md) - Complete API reference
- [Implementation Details](./MEDIA_IMPLEMENTATION_SUMMARY.md) - Technical deep dive
- [Overview](./MEDIA_OVERVIEW.md) - Quick summary
- [Documentation Index](./_DOCUMENTATION_INDEX.md) - All docs

---

**Status**: ✅ Complete  
**Last Updated**: December 18, 2025  
**Ready for Testing**: ✅ Yes
