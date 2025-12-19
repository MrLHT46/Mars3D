import 'dotenv/config.js';
import { sql, connectDB } from './config/db.js';

async function migrateMedia() {
  try {
    await connectDB();

    console.log('🔄 Running media database migrations...');

    // Create table if not exists (non-destructive)
    await sql`
      CREATE TABLE IF NOT EXISTS landmark_media (
        id SERIAL PRIMARY KEY,
        landmark_id INTEGER NOT NULL REFERENCES landmarks(id) ON DELETE CASCADE,
        media_type VARCHAR(50) NOT NULL CHECK (media_type IN ('image', 'video')),
        file_name VARCHAR(255) NOT NULL,
        file_path VARCHAR(500) NOT NULL,
        file_size INTEGER NOT NULL,
        mime_type VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ landmark_media table created/verified');

    // Add missing columns safely
    await sql`ALTER TABLE landmark_media ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0`;
    await sql`ALTER TABLE landmark_media ADD COLUMN IF NOT EXISTS original_file_name VARCHAR(255)`;
    console.log('✅ landmark_media columns ensured (order_index, original_file_name)');

    // Create index for faster queries
    await sql`
      CREATE INDEX IF NOT EXISTS idx_landmark_media_landmark_id 
      ON landmark_media(landmark_id)
    `;
    console.log('✅ Index created for landmark_media');

    console.log('✅ All media migrations completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration error:', err.message);
    process.exit(1);
  }
}

migrateMedia();
