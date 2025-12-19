import 'dotenv/config.js';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fileUpload from 'express-fileupload';
import { connectDB, sql } from './config/db.js';
import landmarksRouter from './routes/landmarks.js';
import mediaRouter from './routes/media.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());
app.use(fileUpload({
  createParentPath: true,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
}));

const port = process.env.PORT || 5000;

app.get('/api/ping', (req, res) => res.json({ status: 'ok' }));

// Routers
app.use('/api/landmarks', landmarksRouter);
app.use('/api/media', mediaRouter);

// Serve static frontend built assets (optional)
if (process.env.SERVE_FRONTEND === '1' || process.env.NODE_ENV === 'production') {
  const staticPath = path.resolve(__dirname, '..', 'frontend', 'dist');
  app.use(express.static(staticPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(staticPath, 'index.html'));
  });
}

async function startServer() {
  try {
    await connectDB();
    console.log('✅ Database connected');
  } catch (err) {
    console.warn('⚠️  Database connection warning (endpoints will fail until DB is available):', err && (err.message || err));
  }
  
  app.listen(port, () => console.log('🚀 Server running on', `http://localhost:${port}`));
}


startServer();

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('SIGINT - closing DB client and exiting');
  try { await sql.end(); } catch(e){}
  process.exit(0);
});
