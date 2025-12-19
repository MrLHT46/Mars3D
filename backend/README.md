# Mars3D backend (Express + PostgreSQL)

This is a simple example backend for the Mars3D project. It shows a minimal Express server with a Postgres connection using `pg`. Use it to store and query landmarks (POIs).

## Getting started

1. Create a `.env` file by copying `.env.example` and set `DATABASE_URL` (or use default). For example (Supabase):

```powershell
cd backend
copy .env.example .env
# open .env and set DATABASE_URL and PGSSLMODE
# Example (replace YOUR_PASSWORD):
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.qsftwznznaqcpjxjtncd.supabase.co:5432/postgres
PGSSLMODE=require
```

```powershell
cd backend
copy .env.example .env
# edit .env with your DB credentials
```

2. Start DB (if using docker-compose at repository root):

```powershell
docker-compose up -d
```

3. Install dependencies and run migrations & seed and verify DB connectivity:

```powershell
cd backend
npm install
npm run migrate
npm run seed
npm run dev # or `npm start`
```

4. Verify DB connectivity before starting server (optional but recommended):

```powershell
cd backend
npm run db:check
# exit code 0 = OK; non-zero indicates connection failed
```

4. Endpoints
- `GET /api/ping` -> health
- `GET /api/landmarks` -> list landmarks from DB
- `POST /api/landmarks` -> create a new landmark (JSON payload)
