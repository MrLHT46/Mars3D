import 'dotenv/config.js';
import { sql, connectDB } from './config/db.js';

async function migrate() {
  try {
    await connectDB();

    console.log('🔄 Running database migrations...');

    // Check if landmarks table exists
    const tableExists = await sql`
      SELECT EXISTS(
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'landmarks'
      )
    `;

    if (!tableExists[0].exists) {
      console.log('📦 Creating landmarks table...');
      
      // Create new landmarks table with all address fields
      await sql`
        CREATE TABLE landmarks (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          lat DECIMAL(10, 6) NOT NULL,
          lng DECIMAL(10, 6) NOT NULL,
          city VARCHAR(255),
          description TEXT,
          house_number_or_office_name VARCHAR(255),
          ward VARCHAR(255) NOT NULL,
          district VARCHAR(255) NOT NULL,
          province VARCHAR(255) NOT NULL,
          country VARCHAR(100) DEFAULT 'Vietnam',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;
      console.log('✅ landmarks table created');
    } else {
      console.log('✓ landmarks table already exists');
      
      // Check if new columns exist and add them if missing
      const columnsCheck = await sql`
        SELECT column_name FROM information_schema.columns 
        WHERE table_name = 'landmarks'
      `;
      const existingColumns = columnsCheck.map(col => col.column_name);

      // Add columns if they don't exist
      if (!existingColumns.includes('house_number_or_office_name')) {
        console.log('📝 Adding house_number_or_office_name column...');
        await sql`ALTER TABLE landmarks ADD COLUMN house_number_or_office_name VARCHAR(255)`;
        console.log('✅ house_number_or_office_name column added');
      }

      if (!existingColumns.includes('ward')) {
        console.log('📝 Adding ward column...');
        await sql`ALTER TABLE landmarks ADD COLUMN ward VARCHAR(255) NOT NULL DEFAULT ''`;
        console.log('✅ ward column added');
      }

      if (!existingColumns.includes('district')) {
        console.log('📝 Adding district column...');
        await sql`ALTER TABLE landmarks ADD COLUMN district VARCHAR(255) NOT NULL DEFAULT ''`;
        console.log('✅ district column added');
      }

      if (!existingColumns.includes('province')) {
        console.log('📝 Adding province column...');
        await sql`ALTER TABLE landmarks ADD COLUMN province VARCHAR(255) NOT NULL DEFAULT ''`;
        console.log('✅ province column added');
      }

      if (!existingColumns.includes('country')) {
        console.log('📝 Adding country column...');
        await sql`ALTER TABLE landmarks ADD COLUMN country VARCHAR(100) DEFAULT 'Vietnam'`;
        console.log('✅ country column added');
      }

      if (!existingColumns.includes('created_at')) {
        console.log('📝 Adding created_at column...');
        await sql`ALTER TABLE landmarks ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`;
        console.log('✅ created_at column added');
      }

      if (!existingColumns.includes('updated_at')) {
        console.log('📝 Adding updated_at column...');
        await sql`ALTER TABLE landmarks ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`;
        console.log('✅ updated_at column added');
      }
    }

    console.log('✅ All migrations completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration error:', err && (err.message || err));
    process.exit(1);
  }
}

migrate();
