# E-motion

A learning management system. Completely separate from The Mambo Guild — its own
repo, its own Vercel project, its own Railway project, its own Supabase database.

## Layout

```
frontend/   Next.js 14 (App Router) + Tailwind + TypeScript   -> Vercel
backend/    FastAPI + SQLAlchemy + Pydantic v2                 -> Railway
            Postgres                                           -> Supabase
```

## Local development

Backend:

```bash
cd backend
python -m venv .venv && .venv/Scripts/activate    # Windows
pip install -r requirements.txt
cp .env.example .env                               # then fill in DATABASE_URL
python -m database                                 # create tables
uvicorn main:app --reload --port 8000
```

Frontend:

```bash
cd frontend
npm install
cp .env.example .env.local                         # then point at the backend
npm run dev
```

Frontend runs on http://localhost:3000, backend on http://localhost:8000.
API docs at http://localhost:8000/docs.

## Deploys

- Push to `main` -> Vercel builds `frontend/`, Railway builds `backend/`.
- Neither has a custom domain yet. Both use their generated platform URLs.
