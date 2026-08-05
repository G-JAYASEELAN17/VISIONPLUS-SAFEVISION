# CHANGELOG

## Added

- **Development Mode** (`DEV_MODE` / `VITE_DEV_MODE`) — skips login for
  local dev/demos, auth code untouched.
- **Vehicle & object detection** — `app/ai/detection_classes.py`, wired
  through offline analysis, live monitoring, reports, dashboard,
  analytics, and investigation. New DB columns via migration `0002`.
- **Live Monitoring control plane** — `/stream/start|stop|pause|resume|
  restart|detection-toggle|status`, backed by a real thread-safe state
  machine (`app/services/live_state.py`). Frontend `LiveMonitoring.jsx`
  rewritten with full controls and a live stats strip (people/vehicles/
  objects/FPS/latency/risk/connection status).
- **Report export** — real PDF (via `reportlab`), CSV, and JSON download
  endpoints (`/reports/{id}/export/{pdf,csv,json}`), wired into
  `Reports.jsx` and `Dashboard.jsx`.
- **Notification Center** — persisted `Notification` model + API
  (list/unread-count/mark-read/mark-all-read), replacing a log-only
  backend stub and a fully hardcoded frontend panel.
- **Minimal RBAC** — `require_admin` dependency, applied to camera/video
  deletion.
- **Vercel + Render deployment configuration** — `render.yaml`,
  `frontend/vercel.json`, Postgres `postgres://`→`postgresql://`
  normalization, `$PORT`-aware Docker `CMD`.
- **Root `.gitignore`** — previously only the frontend had one.
- Route-level code splitting (`React.lazy`) — cut the initial JS bundle
  from a single 700KB+ chunk to per-route chunks of 1.5–13KB.

## Changed

- `Detection`/`Report` models gained vehicle-count columns (migration
  `0002`, additive — existing rows default to 0, nothing breaks).
- `/dashboard/stats` and `/analytics/` now include vehicle/object totals
  and (dashboard only) a live-monitoring snapshot.
- `DELETE /camera/{id}` and `DELETE /video/{id}` now require an admin
  role — previously open to any request with no auth at all.
- `NotificationPanel.jsx` and the backend `notify_admin()` now read/write
  real data instead of hardcoded/log-only placeholders.

## Fixed

- Render/Heroku-style `postgres://` connection strings no longer crash
  SQLAlchemy — normalized to `postgresql://` before engine creation, in
  both the app and Alembic.
- MJPEG stream endpoint no longer unconditionally opens the server's
  webcam on every request — respects Start/Stop state first.

## Verified this pass (see TESTING_REPORT.md for full detail)

- Full backend: 0 Python syntax errors across all files.
- Fresh Alembic migration chain (`0001`→`0002`) applied cleanly.
- 15/15 core endpoints returned correct responses against a real booted
  app instance (auth, dashboard, analytics, cameras, videos, reports +
  all 3 export formats, alerts, notifications, chatbot, full live-stream
  control cycle, Swagger/OpenAPI).
- Frontend: clean `npm install` + `npm run build`, 0 errors, confirmed
  code-splitting in the build output.

## Known, documented gaps (not silently dropped — see PROJECT_AUDIT.md)

- RTSP/ONVIF camera ingestion not implemented (`GET /stream/` still opens
  the local webcam device, not a stored camera URL).
- Video analysis still runs synchronously in-request (no background job
  queue).
- RBAC is not applied project-wide, only to camera/video deletion.
- Real YOLO inference was not exercised in this sandbox (heavy ML deps
  weren't installed); all surrounding application logic was verified with
  the libraries stubbed.
- Live-monitoring state is a single-process singleton; needs Redis if the
  backend is ever scaled to multiple workers.
