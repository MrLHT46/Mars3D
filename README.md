# Mars3D + Cesium — Frontend + Backend (PostgreSQL)

Ứng dụng bản đồ 3D (Mars3D/Cesium) với **Vue 3** ở frontend. Dự án có thể kết hợp với một backend Node.js/Express (tùy chọn) dùng **PostgreSQL** để lưu trữ dữ liệu (POIs, annotations, model metadata, v.v.). Sau đây là hướng dẫn cài đặt và khởi chạy cho cả phần frontend và backend, bao gồm hướng dẫn dùng database PostgreSQL (cả local Docker và hosted service).

---

## Tổng quan dự án
- `frontend/` — ứng dụng Vue 3 + Vite (map UI): khởi chạy bằng `npm run dev`.
- `backend/` — (tuỳ chọn) backend Node.js / Express để cung cấp REST API, kết nối PostgreSQL.
- `public/` — static assets (Cesium, textures, workers) cho frontend.

> Lưu ý: repository base hiện chứa `frontend/` đầy đủ. `backend/` là chỗ để đặt source code server (nếu bạn muốn thêm backend). Hướng dẫn dưới đây giả định backend sẽ tương tác với PostgreSQL.

---

## Yêu cầu
- Node.js >= 16 (khuyến nghị 18+ hoặc 20+)
- npm >= 8 (hoặc Yarn)
- Docker & Docker Compose (khuyến khích cho Postgres local)
- Web browser (Chrome/Edge/Firefox) hỗ trợ WebGL

---

## 1) Cài đặt và chạy Frontend (Vue 3)

1. Mở terminal và vào thư mục `frontend/` (nếu bạn đang ở root):

```powershell
cd frontend
npm install
npm run dev
```

2. Mặc định Vite dev server chạy ở `http://localhost:8081` (xem terminal output nếu port thay đổi).

3. Production build:

```powershell
npm run build
npm run preview
```

4. Nếu frontend cần gọi tới backend, bạn có 2 cách:
- Sử dụng proxy trong `frontend/vite.config.js`:
- Cấu hình `server.proxy` để redirect `/api` sang backend, ví dụ:

```js
// vite.config.js
server: {
  port: 8081,
  proxy: {
    '/api': {
      target: 'http://localhost:5000',
      changeOrigin: true,
      secure: false,
    }
  }
}
```

---

## 2) Backend (Node.js + Express) — cài đặt ví dụ & PostgreSQL (local hoặc hosted)

> Ghi chú: project hiện không có backend implementation sẵn; phần này cung cấp hướng dẫn mẫu — nếu bạn đã có backend code, đặt nó vào `backend/`.

**Update:** A minimal `backend/` has been added with example API endpoints, migration and seed scripts. See `backend/README.md` for details.

### 2.1. Example backend setup (tóm tắt)

- Stack đề xuất:
  - Node.js + Express
  - PostgreSQL (pg, pg-promise, knex, sequelize hoặc prisma)
  - dotenv để load biến môi trường
  - CORS config để accept requests từ `frontend`

### 2.2. Env variables (ví dụ `.env` trong `backend/`)

```
PORT=5000
DATABASE_URL=postgresql://appuser:changeme@localhost:5432/mars3d
HF_API_TOKEN=<your-huggingface-api-token>
```

Giải thích:
- `DATABASE_URL` — chuỗi kết nối PostgreSQL (supporting Heroku-style URL or standard `postgresql://`).
- `HF_API_TOKEN` — (tùy chọn) token Hugging Face nếu backend gọi API từ Hugging Face Hub (ví dụ: để load or sync model metadata). Lưu ý: giữ token private, không commit `.env`.

### 2.3. Local Postgres using Docker Compose (recommended)

Tạo `docker-compose.yml` (ở root hoặc `backend/`):

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: appuser
      POSTGRES_PASSWORD: changeme
      POSTGRES_DB: mars3d
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports:
      - '5432:5432'

  pgadmin:
    image: dpage/pgadmin4
    depends_on:
      - postgres
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@example.com
      PGADMIN_DEFAULT_PASSWORD: admin
    ports:
      - '8080:80'

volumes:
  pgdata:
```

Chạy:

```powershell
docker-compose up -d
```

Kiểm tra kết nối: `psql` hoặc `pgAdmin` trên `http://localhost:8080`.

### 2.4. Backend run (dev)

1. Nếu bạn chưa có `backend/` code, tạo một ví dụ minimal server:

```powershell
mkdir backend
cd backend
npm init -y
npm i express pg dotenv cors
```

2. `server.js` (ví dụ nhanh):

```js
// backend/server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { Client } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

const client = new Client({ connectionString: process.env.DATABASE_URL });
client.connect().catch(e => console.error('pg connect error', e));

app.get('/api/ping', (req, res) => res.json({ status: 'ok' }));

// Example: GET /api/landmarks to return POIs from database
app.get('/api/landmarks', async (req, res) => {
  try {
    const r = await client.query('SELECT * FROM landmarks LIMIT 100');
    return res.json(r.rows);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'db error' });
  }
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log('Server running on', port));
```

3. Run backend (dev):

```powershell
cd backend
npm install
node server.js
```

Or add `nodemon` for dev auto-reload:

```powershell
npm i -D nodemon
// package.json script: "dev": "nodemon server.js"
npm run dev
```

If you want to initialize the database and seed the landmarks data (from `frontend/src/data/landmarks.json`) you can use the provided tools:

```powershell
# start Postgres (local) using docker-compose at repo root (optional)
docker-compose up -d

# run migrations & seed
cd backend
npm install
npm run migrate   # will create the 'landmarks' table
npm run seed      # will populate landmarks from frontend data
```

### 2.5. Deploy / Remote DB (Hugging Face or other provider)

- Nếu dùng managed DB (Heroku, AWS RDS, DigitalOcean, Upstash, etc.), set `DATABASE_URL` to the provided connection string.
- **Hugging Face** does not currently provide a managed Postgres product — if your platform is **Hugging Face Spaces** or you leverage HF datasets, the typical pattern is:
  - Store dataset/metadata on HF or another storage (S3/MinIO), and only store relational data in PostgreSQL.
  - Use `HF_API_TOKEN` for the backend to retrieve model/dataset metadata from Hugging Face Hub using their REST API: https://api.huggingface.co

**HuggingFace API example** (Node.js):

```js
const response = await fetch('https://api-inference.huggingface.co/models/<model>', {
  headers: { Authorization: `Bearer ${process.env.HF_API_TOKEN}` }
});
```


---

## Quick start - troubleshooting `npm start` error (ENOENT)

If you ran `npm start` at repository root and got an error such as:

```
npm ERR! enoent Could not read package.json: Error: ENOENT: no such file or directory, open '<repo-root>/package.json'
```

It means there was no root `package.json` at the time. This repo has the frontend inside `./frontend` which contains its own `package.json`. You can either run the frontend directly from that folder, or use the new root script that starts the frontend for convenience.

1) Run frontend via `frontend` folder (recommended):

```powershell
cd frontend
npm install
npm run dev
```

2) Or run from root (we added a root `package.json` to orchestrate frontend/backend):

```powershell
npm install
npm start   # installs frontend/backend deps if needed and starts both frontend (vite) and backend (nodemon) concurrently

If you only want to start the frontend from root (no backend), run:

```powershell
npm run frontend:start
```

If you only want to start the backend from root, run:

```powershell
npm run start:backend
```
```

The root `package.json` adds these helper scripts:
- `npm start` => run frontend dev server (`npm --prefix frontend run dev`)
- `npm run frontend:build` => build frontend
- `npm run frontend:preview` => preview build
- `npm run backend:start` => if you have `backend` code, run `npm --prefix backend run dev`
- `npm run dev` => runs both frontend and backend concurrently (requires root dev deps like `concurrently` / `npx`)

If you still have trouble, check if `frontend/package.json` exists and run `npm install` inside `frontend/` before starting.


## Sử dụng Cursor nhanh
# @Nhập tên file để chọn file
# Chọn tên file copy -> pate
# /