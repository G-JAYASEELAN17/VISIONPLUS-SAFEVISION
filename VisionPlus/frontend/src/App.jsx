import { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import ProtectedRoute from './components/ProtectedRoute'
import { PageLoader } from './components/Loader'

import Login from './pages/Login'

// Route-level code splitting (Phase 17 — Performance): the production
// bundle was a single 700KB+ JS chunk with zero splitting. Login stays
// eager (first thing an unauthenticated user needs); everything behind
// auth is lazy-loaded per route so the initial load only pays for what's
// actually shown.
const Dashboard = lazy(() => import('./pages/Dashboard'))
const LiveMonitoring = lazy(() => import('./pages/LiveMonitoring'))
const UploadVideo = lazy(() => import('./pages/UploadVideo'))
const Reports = lazy(() => import('./pages/Reports'))
const Alerts = lazy(() => import('./pages/Alerts'))
const Analytics = lazy(() => import('./pages/Analytics'))
const Investigation = lazy(() => import('./pages/Investigation'))
const Settings = lazy(() => import('./pages/Settings'))

export default function App() {
  return (
    <Suspense fallback={<PageLoader label="Loading…" />}>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/live-monitoring" element={<LiveMonitoring />} />
          <Route path="/upload" element={<UploadVideo />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/investigation" element={<Investigation />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  )
}
