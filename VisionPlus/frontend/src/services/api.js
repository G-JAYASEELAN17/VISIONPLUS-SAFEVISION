import axios from 'axios'

// Base URL comes from .env (VITE_API_BASE_URL). Falls back to localhost:8000
// which is FastAPI's default `uvicorn app.main:app --reload` address.
const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'

export const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
})

// Attach the JWT (if present) to every request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sv_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Centralized 401 handling: clear the session and bounce to /login.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem('sv_token')
      localStorage.removeItem('sv_user')
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  },
)

/* -------------------------------------------------------------------------
 * Endpoint helpers
 * These map 1:1 to the real routes registered in app/main.py.
 * NOTE: only POST /chatbot/ask and GET /chatbot/history currently require
 * a Bearer token server-side (see app/core/deps.py); the rest of the routes
 * are open in the backend as shipped. The token is still attached to every
 * request above so this keeps working the moment you add auth guards to
 * more endpoints.
 * ---------------------------------------------------------------------- */

// Auth
export const login = (email, password) =>
  api.post('/auth/login', { email, password })
export const register = (full_name, email, password) =>
  api.post('/auth/register', { full_name, email, password })
export const getMe = () => api.get('/auth/me')

// Dashboard
export const getDashboardStats = () => api.get('/dashboard/stats')
export const getRecentAlerts = () => api.get('/dashboard/recent-alerts')
export const getRecentReports = () => api.get('/dashboard/recent-reports')

// Cameras
export const getCameras = () => api.get('/camera/')
export const addCamera = (payload) => api.post('/camera/', payload)
export const deleteCamera = (id) => api.delete(`/camera/${id}`)

// Videos
export const getVideos = () => api.get('/video/')
export const uploadVideo = (file, onUploadProgress) => {
  const form = new FormData()
  form.append('file', file)
  return api.post('/video/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress,
  })
}
export const analyzeVideo = (videoId) => api.post(`/analyze/${videoId}`)

// Alerts
export const getAlerts = () => api.get('/alerts/')

// Reports
export const getReports = () => api.get('/reports/')
export const getReport = (videoId) => api.get(`/reports/${videoId}`)

// Events / Investigation
export const getEvents = (videoId) => api.get(`/events/${videoId}`)
export const getInvestigation = (videoId) => api.get(`/investigation/${videoId}`)

// Analytics
export const getAnalytics = () => api.get('/analytics/')

// Live stream (MJPEG). Used directly as an <img src> — exported as a
// constant URL builder rather than an axios call.
export const getLiveStreamUrl = () => `${baseURL}/stream/`

// Live monitoring controls (Start/Stop/Pause/Resume/Restart/Detection toggle)
export const getLiveStatus = () => api.get('/stream/status')
export const startLiveMonitoring = () => api.post('/stream/start')
export const stopLiveMonitoring = () => api.post('/stream/stop')
export const pauseLiveMonitoring = () => api.post('/stream/pause')
export const resumeLiveMonitoring = () => api.post('/stream/resume')
export const restartLiveMonitoring = () => api.post('/stream/restart')
export const toggleLiveDetection = () => api.post('/stream/detection-toggle')

// Report exports — return a browser download via a temporary <a> click,
// since these are file downloads (with Content-Disposition), not JSON.
const downloadFile = async (url, filename) => {
  const response = await api.get(url, { responseType: 'blob' })
  const blobUrl = window.URL.createObjectURL(new Blob([response.data]))
  const link = document.createElement('a')
  link.href = blobUrl
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(blobUrl)
}
export const downloadReportPdf = (videoId) =>
  downloadFile(`/reports/${videoId}/export/pdf`, `report_${videoId}.pdf`)
export const downloadReportCsv = (videoId) =>
  downloadFile(`/reports/${videoId}/export/csv`, `report_${videoId}.csv`)
export const downloadReportJson = (videoId) =>
  downloadFile(`/reports/${videoId}/export/json`, `report_${videoId}.json`)

// Notifications
export const getNotifications = (unreadOnly = false) =>
  api.get('/notifications/', { params: { unread_only: unreadOnly } })
export const getUnreadNotificationCount = () => api.get('/notifications/unread-count')
export const markNotificationRead = (id) => api.post(`/notifications/${id}/read`)
export const markAllNotificationsRead = () => api.post('/notifications/read-all')

// Turns a server filesystem path into a real downloadable/previewable URL,
// now that the backend serves "reports/" and "uploads/videos/" via
// StaticFiles at /media/reports and /media/uploads (see app/main.py).
// e.g. "reports/output_12.mp4" -> "http://.../media/reports/output_12.mp4"
export const resolveMediaUrl = (filepath) => {
  if (!filepath) return null
  const clean = filepath.replace(/^\/+/, '')
  if (clean.startsWith('reports/')) {
    return `${baseURL}/media/reports/${clean.slice('reports/'.length)}`
  }
  if (clean.startsWith('uploads/videos/')) {
    return `${baseURL}/media/uploads/${clean.slice('uploads/videos/'.length)}`
  }
  return `${baseURL}/${clean}`
}

// Chatbot
export const askChatbot = (question) => api.post('/chatbot/ask', { question })
export const getChatHistory = (limit = 50) =>
  api.get('/chatbot/history', { params: { limit } })

// System
export const getHealth = () => api.get('/system/health')
