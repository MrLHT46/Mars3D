import 'dotenv/config.js';
import postgres from 'postgres';

// Connection string fallback: override this in backend/.env for production
const conn = process.env.DATABASE_URL;

// Configure SSL for cloud providers like Supabase
const sql = postgres(conn, { ssl: process.env.PGSSLMODE === 'require' ? { rejectUnauthorized: false } : false });

async function connectDB() {
  try {
    await sql`SELECT 1`;
    console.log('✅ PostgreSQL (postgres.js) connected to host:', conn.includes('@') ? conn.split('@')[1] : conn);
  } catch (err) {
    console.error('❌ PostgreSQL connection error:', err && (err.message || err));
    throw err;
  }
}

export { sql, connectDB };
