# VISION+ — PROJECT AUDIT

**Method:** every file in `backend/app` and `frontend/src` was read directly.
Backend was syntax-checked in full (`py_compile`), boot-tested via FastAPI's
`TestClient` against a freshly Alembic-migrated database, and exercised
through 15+ real HTTP requests covering every major feature area. Frontend
was installed (`npm install`) and built (`npm run build`) multiple times as
changes were made. See `TESTING_REPORT.md` for the itemized verification
log this audit is based on.

## Current architecture

```
backend/app/
  ai/            9 files  — YOLO detection, tracking, risk scoring, zones, heatmap,
                             entry/exit, stream processing, detection_classes (new)
  api/          14 routers — auth, camera, video, analyze, report, dashboard, alert,
                             analytics, investigation, events, chatbot, live_stream,
                             system, notifications (new)
  core/          4 files  — config, security, auth dependency (incl. require_admin), deps
  db/            1 file   — SQLAlchemy engine/session (Postgres-scheme-normalizing)
  models/       10 files  — one table per file, incl. Notification (new)
  notifications/ 1 file   — persists real Notification rows (previously log-only)
  schemas/       4 files  — camera, chatbot, user, notification (new)
  services/      9 files  — incl. live_state (new), report_export_service (new)

frontend/src/
  components/   13 files — incl. NotificationPanel rewritten to use real backend data
  pages/         9 files — LiveMonitoring rewritten with full controls; Reports
                            rewritten with PDF/CSV/JSON downloads; Dashboard extended
                            with vehicle counts + live-monitoring status
  services/      1 file  — api.js, extended with 15+ new endpoint helpers
```

## What changed in this pass, by requirement

| Requirement | Status | Where |
|---|---|---|
| Vehicle/object counts | Done | `app/ai/detection_classes.py` (new), wired into `analyze.py` (offline) and `stream_processor.py` (live); `Detection`/`Report` models extended via migration `0002` |
| Live Monitoring start/stop controls | Done | `app/services/live_state.py` (new state machine) + `app/api/live_stream.py` (rewritten with start/stop/pause/resume/restart/detection-toggle/status) + `LiveMonitoring.jsx` (rewritten UI) |
| Report generation/downloads (PDF/CSV/JSON) | Done | `app/services/report_export_service.py` (new) + 3 new endpoints in `report.py` + download wiring in `Reports.jsx`/`Dashboard.jsx` |
| Dashboard/Live Monitoring/Analytics/Investigation share one data model | Done | All keyed on `video_id`; `dashboard.py` now also surfaces `live_monitoring` snapshot + vehicle/object totals; `investigation.py` timeline includes vehicle counts |
| Notification Center | Done | `Notification` model (new) + `app/api/notifications.py` (new) + `NotificationPanel.jsx` rewritten off hardcoded fake data |
| Vercel (frontend) + Render (backend) config | Done | `render.yaml`, `frontend/vercel.json`, Postgres URL-scheme normalization in `database.py`/`alembic/env.py` |
| PostgreSQL via `DATABASE_URL` | Already present, verified working | `psycopg2-binary` in requirements; migration chain run and schema-checked |
| No hardcoded localhost/secrets | Done | `CORS_ALLOWED_ORIGINS`, `VITE_API_BASE_URL`, `SECRET_KEY` all env-driven; `render.yaml` auto-generates `SECRET_KEY`; deployment docs explicitly call out what must be set per-environment |
| RBAC | Partially done | `require_admin` dependency added and applied to `DELETE /camera/{id}` and `DELETE /video/{id}` — the two destructive endpoints. Not applied project-wide; see Known Gaps below |
| Performance (bundle size) | Done | Route-level code splitting via `React.lazy`; verified 700KB single chunk down to per-route 1.5–13KB chunks |

## Known gaps — honestly remaining (not silently dropped)

These require either real infrastructure this sandbox doesn't have, or a
scope decision beyond "fix what's broken" — each is scaffolded/documented
rather than faked:

1. **RTSP/ONVIF camera ingestion.** `GET /stream/` still opens the
   server's local webcam (`cv2.VideoCapture(0)`), not a stored camera's
   `stream_url`. The camera picker in Live Monitoring remains cosmetic
   until this is wired — this needs a real design decision (per-camera
   stream endpoints? a media server like MediaMTX in front of RTSP?) that
   goes beyond a bug fix.
2. **Background job queue.** `POST /analyze/{video_id}` still runs
   synchronously in-request. Fine for short clips; would block on long
   videos. Needs Celery+Redis or at minimum `BackgroundTasks` — not added
   because it changes the response contract (would need a polling/webhook
   pattern) and wasn't in the explicit requirement list.
3. **Project-wide RBAC.** Only destructive camera/video endpoints are
   role-gated. Extending to more routes is mechanical
   (`Depends(require_admin)`) but wasn't done everywhere to avoid silently
   changing behavior on routes the person may not want gated.
4. **Real inference verification.** `torch`/`ultralytics`/`opencv` were not
   installed in this sandbox (see TESTING_REPORT.md). All the code paths
   around detection were verified with the libraries stubbed; the actual
   neural-network forward pass was not exercised here.
5. **Redis for live-monitoring state.** `live_state.py` is a correct
   single-process singleton for Vision+'s current single-instance shape,
   but won't work correctly if the backend is ever scaled to multiple
   workers/dynos — each would have independent start/stop state. Documented
   in `DEPLOYMENT.md`.
6. **Live per-zone counts on the Live Monitoring page.** The `ZoneCard` on
   that page still shows illustrative demo numbers — frame-level
   people/vehicle/object counts and FPS/latency/risk *are* real and live;
   per-zone breakdown from the live stream specifically was not piped
   through (it exists for offline analysis via `zone_analysis.py`/
   `zone_service.py`, just not surfaced from the live endpoint).

## Security notes

- `SECRET_KEY` defaults to a placeholder in `.env.example` but is
  auto-generated by Render's Blueprint and must be set manually for
  Docker/self-hosted deployments — documented in `DEPLOYMENT.md`.
- CORS defaults to localhost for dev; production origins must be set
  explicitly per-environment (never a wildcard) — documented.
- No rate limiting on `/auth/login` — brute-force risk, would need Redis
  or an in-memory limiter to implement properly; flagged, not faked.
- `DEV_MODE` bypasses all authentication when enabled — clearly documented
  as a dev/demo-only switch in the README, `.env.example`, and
  `DEPLOYMENT.md`, with an explicit warning against using it in production.
