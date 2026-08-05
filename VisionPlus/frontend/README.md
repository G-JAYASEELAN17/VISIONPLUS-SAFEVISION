# SafeVision AI — Frontend

React 19 + Vite + Tailwind frontend for the SafeVision AI backend, built from
the Stitch design export (dark theme, matching the 9-page layout).

## What's here (fully wired to real endpoints)

| Page | Backend routes used |
|---|---|
| Login | `POST /auth/login` |
| Dashboard | `GET /dashboard/stats`, `/dashboard/recent-alerts`, `/dashboard/recent-reports`, `GET /stream/` |
| Live Monitoring | `GET /camera/`, `GET /stream/` |
| Upload Video | `GET /video/`, `POST /video/upload`, `POST /analyze/{video_id}` |
| Reports | `GET /reports/` |
| Alerts | `GET /alerts/` |
| Analytics | `GET /analytics/` |
| Investigation | `GET /video/`, `GET /investigation/{video_id}`, `GET /events/{video_id}` |
| Settings → Cameras | `GET/POST /camera/`, `DELETE /camera/{id}` |
| Floating chatbot | `POST /chatbot/ask` (JWT required) |

I read your actual backend code (not the prompt's assumed route list) and
matched the real paths — e.g. the real login route is `/auth/login`, not
`/login`; dashboard stats are at `/dashboard/stats`, not `/dashboard`; etc.

## Running it

```bash
npm install
cp .env.example .env      # then edit VITE_API_BASE_URL if needed
npm run dev
```

Backend, in a separate terminal:

```bash
uvicorn app.main:app --reload
```

## ✅ Backend changes now included

A companion `safevision-backend.zip` ships alongside this frontend with
three minimal, additive changes to `app/main.py` / `app/api/auth.py` (your
architecture and all existing endpoints are untouched):

1. **CORS middleware** — origins read from `CORS_ALLOWED_ORIGINS` in `.env`,
   defaulting to `http://localhost:5173`.
2. **Static file mounts** — `reports/` and `uploads/videos/` are now served
   at `GET /media/reports/...` and `GET /media/uploads/...`, so the frontend
   can actually preview/download annotated videos instead of holding a bare
   server filesystem path. The frontend's `resolveMediaUrl()` helper
   (`src/services/api.js`) turns a `Report.output_video` path into a real
   URL — used by the Reports page's Download button.
3. **`GET /auth/me`** — returns `{ id, full_name, email, role }` for the
   logged-in user via the existing `get_current_user` JWT dependency. The
   frontend now calls this right after login (and on page reload if a
   token is already stored) instead of guessing the name from the email —
   see `src/context/AuthContext.jsx`.

To run both together:
```bash
# backend
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload

# frontend
cd safevision-frontend
npm install
cp .env.example .env
npm run dev
```

## ⚠️ Still worth checking / not yet wired

I don't have network access in this sandbox, so I could not run
`npm install`/`pip install` or actually boot either server — I hand-wrote
and statically checked every file (a TypeScript pass over all frontend
`.jsx`/`.js` files, and a Python `ast.parse` over all 61 backend files,
both came back with zero syntax errors), but "zero compile/runtime errors"
can only be fully confirmed by you running it. Please run both and send me
any errors — I'll fix them fast.

1. **JWT is only enforced on `/chatbot/*` and the new `/auth/me`** — the
   rest of your endpoints are still open by design (unchanged from your
   original backend). The token is attached to every request via an axios
   interceptor, so nothing breaks if you add `Depends(get_current_user)` to
   more routes later.
2. **Live stream** (`GET /stream/`) reads the *server's* local webcam
   (`cv2.VideoCapture(0)`), not a specific camera's `stream_url` from the
   `cameras` table — the Live Monitoring page's camera picker is cosmetic
   until the backend accepts a camera/RTSP source per request.
3. **Dashboard "People Count Trend" chart** uses risk-distribution counts as
   a stand-in series — there's no time-bucketed detections-over-time
   endpoint yet in the backend.
4. Chatbot requires both a valid JWT **and** `ANTHROPIC_API_KEY` set in the
   backend's `.env` — without it, `chatbot_service.py` returns a friendly
   "not configured" message rather than erroring.
5. `python-multipart` (needed by `UploadFile`) and `python-jose`/`passlib`
   (needed by the JWT/auth code) should already be in `requirements.txt` —
   I didn't modify that file, just double-check it installs cleanly since I
   couldn't run `pip install` myself.

## Project structure

```
src/
  components/   Sidebar, Navbar, Loader, ProtectedRoute, StatCard, ChartCard,
                VideoPlayer, AlertCard, ReportCard, ZoneCard, Heatmap, Chatbot
  layouts/      MainLayout (sidebar + navbar + outlet + floating chatbot)
  pages/        Login, Dashboard, LiveMonitoring, UploadVideo, Reports,
                Alerts, Analytics, Investigation, Settings
  services/     api.js (single axios instance + all endpoint calls)
  context/      AuthContext (JWT session, stored in localStorage)
  hooks/        useAuth, useFetch (polling-capable data fetcher)
```
