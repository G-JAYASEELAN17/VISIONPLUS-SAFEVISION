# VISION+ — AI Surveillance Platform

FastAPI backend + React (Vite) frontend for AI-powered crowd/vehicle
monitoring and video analytics: live monitoring with start/stop controls,
offline video analysis (people/vehicle/object counts, entry/exit, zones,
risk scoring), reports with PDF/CSV/JSON export, a Notification Center, and
a pluggable rule-based/LLM chatbot.

```
VisionPlus/
├── backend/       FastAPI app (auth, cameras, video, analytics, reports, chatbot, live stream)
├── frontend/      React 19 + Vite + Tailwind dashboard
├── docker-compose.yml   Self-hosted single-machine deployment
├── render.yaml           Render Blueprint (backend + managed Postgres)
├── frontend/vercel.json  Vercel config (frontend)
└── .env.example
```

## Quick start — Docker (recommended, uses PostgreSQL)

```bash
cp .env.example .env        # set SECRET_KEY / POSTGRES_PASSWORD
docker compose up --build
```

- Frontend → http://localhost:3000
- Backend API → http://localhost:8000
- API docs → http://localhost:8000/docs (Swagger) and /redoc

## Quick start — local dev (SQLite, no Docker)

```bash
# Backend
cd backend
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload

# Frontend (separate terminal)
cd frontend
npm install
cp .env.example .env
npm run dev
```

Frontend dev server runs on `:5173`, talks to the backend directly via
`VITE_API_BASE_URL` (see `frontend/.env.example`).

### Skip the login screen (Development Mode)

Set `DEV_MODE=true` in `backend/.env` **and** `VITE_DEV_MODE=true` in
`frontend/.env`. The app opens straight to the dashboard as a "Demo
Administrator" — real JWT auth code is untouched and re-enables the moment
both flags go back to `false`. **Never set this in a real deployment** —
it bypasses authentication entirely. See `BUG_FIX_REPORT.md` for how this
was verified.

## Cloud deployment — Vercel (frontend) + Render (backend)

This repo is pre-configured for this path. Full steps in `DEPLOYMENT.md §1`.
Short version:
1. Render: **New → Blueprint** → point at this repo → reads `render.yaml`
   → provisions a Postgres DB + the backend web service automatically.
2. Vercel: **New Project** → root directory `frontend/` → set
   `VITE_API_BASE_URL` to your Render URL → deploy.

## Database

- **Default:** SQLite (`visionplus.db`), zero config, tables auto-created on
  backend startup via `Base.metadata.create_all()`.
- **Production:** set `DATABASE_URL=postgresql://...` (or Render's Postgres
  connection string — `postgres://` URLs are normalized automatically) and
  run migrations instead of relying on auto-create:
  ```bash
  cd backend
  alembic upgrade head
  ```
  The Docker image and Render's start command both run this automatically.

## Feature status (verified, not assumed — see TESTING_REPORT.md)

| Feature | Status |
|---|---|
| Auth (JWT) + Dev Mode bypass | Verified both ways: auth enforced when off, bypassed when on |
| Live Monitoring start/stop/pause/resume/restart/detection-toggle | Verified via real API calls; camera hardware itself not testable in this environment (see limitations) |
| People/vehicle/object detection & counting | Classification logic verified with unit-level tests; full YOLO inference not exercised in this sandbox (no GPU/heavy deps installed here — see TESTING_REPORT.md) |
| Report generation + PDF/CSV/JSON export/download | Verified — real files generated and content-checked |
| Notification Center | Verified — persisted, real API, wired frontend (previously hardcoded fake data) |
| Dashboard/Analytics/Reports/Investigation/Chatbot sharing one data model | All keyed on `video_id`; dashboard now also surfaces live-monitoring + vehicle/object totals |
| RBAC | Partial — `require_admin` enforced on camera/video deletion only; not applied project-wide (see PROJECT_AUDIT.md) |
| RTSP/ONVIF camera ingestion | Not implemented — `GET /stream/` opens the server's local webcam (`cv2.VideoCapture(0)`), not a stored camera's `stream_url`. Scaffolding + what's needed documented in PROJECT_AUDIT.md |
| Background job queue (Celery/Redis) for analysis | Not implemented — analysis runs synchronously in-request |
| Vercel + Render deployment config | `render.yaml` + `frontend/vercel.json` present; Postgres connectivity verified via a real Alembic migration run; not deployed to live Render/Vercel infra from this sandbox (no such access) |

## Known limitations (accurate as of this pass)

1. `require_admin` RBAC is only wired to `DELETE /camera/{id}` and
   `DELETE /video/{id}`. Every other route remains open by design (matches
   the original architecture) — extend `Depends(require_admin)` to more
   routes as needed.
2. The Dashboard's people-count trend chart uses risk-distribution counts
   as a stand-in — there's no time-bucketed "detections over time" endpoint
   yet.
3. Live-monitoring state (`app/services/live_state.py`) is a single-process
   in-memory singleton — correct for the current single-instance deployment
   shape; would need Redis if scaled to multiple backend workers.
4. This development sandbox has no camera hardware and did not install
   `torch`/`ultralytics`/`opencv` (multi-GB, network/time constrained) — the
   detection/tracking/classification *code paths* were verified with the
   heavy CV libraries stubbed out, exercising all control flow except the
   actual neural-network forward pass. Real inference should be verified
   once deployed with a GPU/CPU-adequate host. See TESTING_REPORT.md.

## Verification status

See `TESTING_REPORT.md` for the full, itemized list of what was actually
run and what its output was — this project follows a strict "don't claim
what wasn't verified" policy throughout `BUG_FIX_REPORT.md`,
`PROJECT_AUDIT.md`, and this README.
