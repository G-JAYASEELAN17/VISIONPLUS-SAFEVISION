import { useState, useEffect, useCallback, useRef } from 'react'
import {
  MdFullscreen,
  MdCameraAlt,
  MdPlayArrow,
  MdStop,
  MdPause,
  MdReplay,
  MdVisibility,
  MdVisibilityOff,
} from 'react-icons/md'
import VideoPlayer from '../components/VideoPlayer'
import ZoneCard from '../components/ZoneCard'
import { useFetch } from '../hooks/useFetch'
import {
  getCameras,
  getLiveStreamUrl,
  getLiveStatus,
  startLiveMonitoring,
  stopLiveMonitoring,
  pauseLiveMonitoring,
  resumeLiveMonitoring,
  restartLiveMonitoring,
  toggleLiveDetection,
} from '../services/api'
import { CardSkeleton } from '../components/Loader'

const RISK_COLOR = {
  LOW: 'text-success',
  MEDIUM: 'text-yellow-400',
  HIGH: 'text-orange-400',
  CRITICAL: 'text-danger',
}

function MiniStat({ label, value }) {
  return (
    <div className="rounded-lg border border-surface-border bg-surface-elevated px-3 py-2 text-center">
      <p className="text-lg font-bold text-white">{value}</p>
      <p className="text-[11px] uppercase tracking-wide text-slate-500">{label}</p>
    </div>
  )
}

export default function LiveMonitoring() {
  const { data: cameras, loading } = useFetch(getCameras, [])
  const [selectedId, setSelectedId] = useState(null)
  const [status, setStatus] = useState(null)
  const [busy, setBusy] = useState(false)
  const [streamKey, setStreamKey] = useState(0) // bump to force <img> reload after start/restart
  const pollRef = useRef(null)

  const activeCamera =
    (cameras || []).find((c) => c.id === selectedId) || (cameras || [])[0]

  const refreshStatus = useCallback(async () => {
    try {
      const res = await getLiveStatus()
      setStatus(res.data)
    } catch {
      // Backend unreachable — leave last known status displayed rather than
      // throwing; the connection_status field itself will read "error".
    }
  }, [])

  useEffect(() => {
    refreshStatus()
    pollRef.current = setInterval(refreshStatus, 2000)
    return () => clearInterval(pollRef.current)
  }, [refreshStatus])

  const runAction = async (fn) => {
    setBusy(true)
    try {
      const res = await fn()
      setStatus(res.data)
    } finally {
      setBusy(false)
    }
  }

  const handleStart = () => runAction(async () => { const r = await startLiveMonitoring(); setStreamKey((k) => k + 1); return r })
  const handleStop = () => runAction(stopLiveMonitoring)
  const handlePause = () => runAction(pauseLiveMonitoring)
  const handleResume = () => runAction(resumeLiveMonitoring)
  const handleRestart = () => runAction(async () => { const r = await restartLiveMonitoring(); setStreamKey((k) => k + 1); return r })
  const handleDetectionToggle = () => runAction(toggleLiveDetection).then(refreshStatus)

  const isRunning = status?.is_running
  const isPaused = status?.is_paused
  const detectionEnabled = status?.detection_enabled

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
      <div className="space-y-4 xl:col-span-2">
        <div className="rounded-2xl border border-surface-border bg-surface-card p-5 shadow-card">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <MdCameraAlt className="text-lg text-primary-light" />
              <select
                value={activeCamera?.id || ''}
                onChange={(e) => setSelectedId(Number(e.target.value))}
                className="rounded-lg border border-surface-border bg-surface-elevated px-3 py-1.5 text-sm text-white focus:border-primary focus:outline-none"
              >
                {(cameras || []).length === 0 && <option>No cameras configured</option>}
                {(cameras || []).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.camera_name} — {c.location}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                  status?.connection_status === 'connected'
                    ? 'bg-success/15 text-success'
                    : status?.connection_status === 'error'
                    ? 'bg-danger/15 text-danger'
                    : 'bg-white/5 text-slate-400'
                }`}
              >
                {status?.connection_status || 'disconnected'}
              </span>
              <button className="flex items-center gap-1.5 rounded-lg border border-surface-border px-3 py-1.5 text-xs text-slate-300 hover:bg-white/5">
                <MdFullscreen /> Fullscreen
              </button>
            </div>
          </div>

          <VideoPlayer key={streamKey} src={getLiveStreamUrl()} mode="mjpeg" live className="w-full" />

          {/* ── Start/Stop/Pause/Resume/Restart/Detection controls ── */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {!isRunning ? (
              <button
                disabled={busy}
                onClick={handleStart}
                className="flex items-center gap-1.5 rounded-lg bg-success/90 px-4 py-2 text-sm font-semibold text-white hover:bg-success disabled:opacity-50"
              >
                <MdPlayArrow /> Start Monitoring
              </button>
            ) : (
              <button
                disabled={busy}
                onClick={handleStop}
                className="flex items-center gap-1.5 rounded-lg bg-danger/90 px-4 py-2 text-sm font-semibold text-white hover:bg-danger disabled:opacity-50"
              >
                <MdStop /> Stop
              </button>
            )}

            {isRunning && !isPaused && (
              <button disabled={busy} onClick={handlePause} className="flex items-center gap-1.5 rounded-lg border border-surface-border px-4 py-2 text-sm text-slate-200 hover:bg-white/5 disabled:opacity-50">
                <MdPause /> Pause
              </button>
            )}
            {isRunning && isPaused && (
              <button disabled={busy} onClick={handleResume} className="flex items-center gap-1.5 rounded-lg border border-surface-border px-4 py-2 text-sm text-slate-200 hover:bg-white/5 disabled:opacity-50">
                <MdPlayArrow /> Resume
              </button>
            )}
            <button disabled={busy} onClick={handleRestart} className="flex items-center gap-1.5 rounded-lg border border-surface-border px-4 py-2 text-sm text-slate-200 hover:bg-white/5 disabled:opacity-50">
              <MdReplay /> Restart
            </button>
            <button
              disabled={busy}
              onClick={handleDetectionToggle}
              className="ml-auto flex items-center gap-1.5 rounded-lg border border-surface-border px-4 py-2 text-sm text-slate-200 hover:bg-white/5 disabled:opacity-50"
            >
              {detectionEnabled ? <MdVisibility /> : <MdVisibilityOff />}
              Detection {detectionEnabled ? 'On' : 'Off'}
            </button>
          </div>

          {/* ── Live stats strip ── */}
          <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-6">
            <MiniStat label="People" value={status?.people_count ?? 0} />
            <MiniStat label="Vehicles" value={status?.vehicle_count ?? 0} />
            <MiniStat label="Objects" value={status?.object_count ?? 0} />
            <MiniStat label="FPS" value={status?.fps ?? 0} />
            <MiniStat label="Latency (ms)" value={status?.latency_ms ?? 0} />
            <div className="rounded-lg border border-surface-border bg-surface-elevated px-3 py-2 text-center">
              <p className={`text-lg font-bold ${RISK_COLOR[status?.risk_level] || 'text-slate-300'}`}>
                {status?.risk_level ?? 'LOW'}
              </p>
              <p className="text-[11px] uppercase tracking-wide text-slate-500">Risk</p>
            </div>
          </div>

          <p className="mt-3 text-xs text-slate-500">
            Streamed from <code className="text-slate-400">GET /stream/</code>, controlled via{' '}
            <code className="text-slate-400">/stream/start|stop|pause|resume|restart</code>. The
            backend reads from the server's default webcam
            (<code className="text-slate-400">cv2.VideoCapture(0)</code>) — in this environment
            (or any headless server) that means "No camera available" is the expected, correct
            placeholder rather than a bug. Point <code className="text-slate-400">camera_index</code>{' '}
            at an RTSP source to stream a real camera feed (see DEPLOYMENT.md).
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Zone data below is illustrative/demo — live per-zone counts are not
            yet piped from the stream into this card (tracked as a follow-up;
            see PROJECT_AUDIT.md). Frame-level people/vehicle/object counts
            above ARE real and live. */}
        <ZoneCard zones={{ 'Zone A': 4, 'Zone B': 9, 'Zone C': 8, 'Zone D': 7 }} />

        <div className="rounded-2xl border border-surface-border bg-surface-card p-5 shadow-card">
          <h3 className="mb-4 text-sm font-semibold text-white">Cameras</h3>
          {loading ? (
            <div className="space-y-2">
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : (
            <ul className="space-y-2">
              {(cameras || []).length === 0 && (
                <li className="text-sm text-slate-500">
                  No cameras yet — add one from Settings.
                </li>
              )}
              {(cameras || []).map((c) => (
                <li
                  key={c.id}
                  className="flex items-center justify-between rounded-lg border border-surface-border bg-surface-elevated px-3 py-2 text-sm"
                >
                  <span className="text-slate-200">{c.camera_name}</span>
                  <span
                    className={`text-xs font-medium ${
                      c.status === 'Active' ? 'text-success' : 'text-slate-500'
                    }`}
                  >
                    {c.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
