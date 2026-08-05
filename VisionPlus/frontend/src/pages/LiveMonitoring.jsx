import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import {
  MdFullscreen,
  MdCameraAlt,
  MdPlayArrow,
  MdStop,
  MdPause,
  MdReplay,
  MdVisibility,
  MdVisibilityOff,
  MdDashboard,
  MdRadioButtonChecked,
  MdSpeed,
  MdAspectRatio,
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
  LOW: 'text-green-400 border-green-500/30 bg-green-500/10',
  MEDIUM: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10',
  HIGH: 'text-orange-400 border-orange-500/30 bg-orange-500/10',
  CRITICAL: 'text-red-400 border-red-500/30 bg-red-500/10',
}

export default function LiveMonitoring() {
  const { data: cameras, loading } = useFetch(getCameras, [])
  const [selectedId, setSelectedId] = useState(null)
  const [status, setStatus] = useState(null)
  const [busy, setBusy] = useState(false)
  const [streamKey, setStreamKey] = useState(0)
  const containerRef = useRef(null)
  const pollRef = useRef(null)

  const activeCamera = useMemo(() => {
    return (cameras || []).find((c) => c.id === selectedId) || (cameras || [])[0]
  }, [cameras, selectedId])

  const refreshStatus = useCallback(async () => {
    try {
      const res = await getLiveStatus()
      setStatus(res.data)
    } catch {
      // Keep last known status on error
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

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.()
    } else {
      document.exitFullscreen?.()
    }
  }

  return (
    <div className="space-y-6 select-none" ref={containerRef}>
      {/* Title Banner */}
      <div className="flex flex-col gap-1.5 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Surveillance Console</h1>
          <p className="text-sm text-text-muted">Live CCTV feeds, real-time AI object segmentation, and monitoring control telemetry.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Main CCTV Console View */}
        <div className="space-y-6 xl:col-span-2">
          <div className="rounded-3xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-xl p-5 shadow-2xl relative overflow-hidden flex flex-col justify-between">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <MdCameraAlt className="text-lg text-primary" />
                <select
                  value={activeCamera?.id || ''}
                  onChange={(e) => setSelectedId(Number(e.target.value))}
                  className="rounded-xl border border-white/10 bg-slate-900 px-3 py-1.5 text-xs text-white outline-none cursor-pointer focus:border-primary/50 transition-all"
                  aria-label="Select camera feed"
                >
                  {(cameras || []).length === 0 && <option>No active feeds</option>}
                  {(cameras || []).map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.camera_name} — {c.location}
                    </option>
                  ))}
                </select>
              </div>

              {/* Console status tags */}
              <div className="flex items-center gap-2">
                <span
                  className={`rounded-xl border px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
                    status?.connection_status === 'connected'
                      ? 'bg-success/10 text-success border-success/20'
                      : status?.connection_status === 'error'
                      ? 'bg-danger/10 text-danger border-danger/20'
                      : 'bg-white/5 text-slate-400 border-white/10'
                  }`}
                >
                  {status?.connection_status || 'disconnected'}
                </span>
                <button
                  onClick={toggleFullscreen}
                  className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/5 px-3 py-1.5 text-[10px] font-bold text-slate-300 transition"
                  title="Toggle fullscreen view"
                  aria-label="Toggle Fullscreen"
                >
                  <MdFullscreen className="text-sm" /> Fullscreen
                </button>
              </div>
            </div>

            {/* Video feed viewport with metadata HUD overlays */}
            <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-white/5">
              <VideoPlayer key={streamKey} src={getLiveStreamUrl()} mode="mjpeg" live className="w-full h-auto aspect-video object-cover" />
              
              {/* Telemetry overlay hud */}
              <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5 pointer-events-none">
                <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md border border-white/10 px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider text-white">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                  <span>Feed Rec</span>
                </div>
                <div className="bg-black/60 backdrop-blur-md border border-white/10 px-2.5 py-1 rounded-lg text-[9px] font-bold tracking-widest text-slate-300">
                  {status?.fps ?? 0} FPS • {status?.latency_ms ?? 0}ms Latency
                </div>
              </div>

              <div className="absolute bottom-4 right-4 z-10 bg-black/60 backdrop-blur-md border border-white/10 px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest text-slate-300">
                1080P resolution
              </div>
            </div>

            {/* Controls strip */}
            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-white/5 pt-4">
              {!isRunning ? (
                <button
                  disabled={busy}
                  onClick={handleStart}
                  className="flex items-center gap-1.5 rounded-xl bg-success/90 px-4 py-2 text-xs font-bold text-white hover:bg-success transition disabled:opacity-50"
                  aria-label="Start surveillance feed"
                >
                  <MdPlayArrow /> Start Monitoring
                </button>
              ) : (
                <button
                  disabled={busy}
                  onClick={handleStop}
                  className="flex items-center gap-1.5 rounded-xl bg-danger/90 px-4 py-2 text-xs font-bold text-white hover:bg-danger transition disabled:opacity-50"
                  aria-label="Stop surveillance feed"
                >
                  <MdStop /> Stop
                </button>
              )}

              {isRunning && !isPaused && (
                <button
                  disabled={busy}
                  onClick={handlePause}
                  className="flex items-center gap-1.5 rounded-xl border border-white/10 hover:bg-white/5 px-4 py-2 text-xs text-slate-200 transition disabled:opacity-50"
                  aria-label="Pause surveillance feed"
                >
                  <MdPause /> Pause
                </button>
              )}
              {isRunning && isPaused && (
                <button
                  disabled={busy}
                  onClick={handleResume}
                  className="flex items-center gap-1.5 rounded-xl border border-white/10 hover:bg-white/5 px-4 py-2 text-xs text-slate-200 transition disabled:opacity-50"
                  aria-label="Resume surveillance feed"
                >
                  <MdPlayArrow /> Resume
                </button>
              )}
              <button
                disabled={busy}
                onClick={handleRestart}
                className="flex items-center gap-1.5 rounded-xl border border-white/10 hover:bg-white/5 px-4 py-2 text-xs text-slate-200 transition disabled:opacity-50"
                aria-label="Restart surveillance system"
              >
                <MdReplay /> Restart
              </button>
              
              <button
                disabled={busy}
                onClick={handleDetectionToggle}
                className="ml-auto flex items-center gap-1.5 rounded-xl border border-white/10 hover:bg-white/5 px-4 py-2 text-xs text-slate-200 transition disabled:opacity-50"
                aria-label={detectionEnabled ? "Turn AI detection off" : "Turn AI detection on"}
              >
                {detectionEnabled ? <MdVisibility /> : <MdVisibilityOff />}
                Detection {detectionEnabled ? 'On' : 'Off'}
              </button>
            </div>

            {/* Quick stats details summary */}
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-6 border-t border-white/5 pt-5">
              <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-3 text-center">
                <span className="block text-xl font-black text-white">{status?.people_count ?? 0}</span>
                <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">People</span>
              </div>
              <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-3 text-center">
                <span className="block text-xl font-black text-white">{status?.vehicle_count ?? 0}</span>
                <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Vehicles</span>
              </div>
              <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-3 text-center">
                <span className="block text-xl font-black text-white">{status?.object_count ?? 0}</span>
                <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Objects</span>
              </div>
              <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-3 text-center">
                <span className="block text-xl font-black text-white">{status?.fps ?? 0}</span>
                <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">FPS</span>
              </div>
              <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-3 text-center">
                <span className="block text-xl font-black text-white">{status?.latency_ms ?? 0}</span>
                <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Latency</span>
              </div>
              <div className={`border rounded-2xl p-3 text-center ${RISK_COLOR[status?.risk_level] || 'text-slate-300 border-white/5 bg-white/[0.01]'}`}>
                <span className="block text-sm font-bold uppercase tracking-wider pt-0.5">{status?.risk_level ?? 'LOW'}</span>
                <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider mt-0.5 block">Risk</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Info Panels */}
        <div className="space-y-6">
          {isRunning ? (
            <ZoneCard zones={status?.zones ? {
              'Zone A (Main entry)': status.zones['Zone A'] ?? 0,
              'Zone B (Corridor)': status.zones['Zone B'] ?? 0,
              'Zone C (Lobby)': status.zones['Zone C'] ?? 0,
              'Zone D (Exit gate)': status.zones['Zone D'] ?? 0
            } : { 'Zone A (Main entry)': 0, 'Zone B (Corridor)': 0, 'Zone C (Lobby)': 0, 'Zone D (Exit gate)': 0 }} />
          ) : (
            <div className="rounded-3xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-xl p-5 shadow-2xl flex flex-col items-center justify-center min-h-[160px] text-slate-500 text-center">
              <span className="text-sm font-bold block mb-1 text-slate-400">Zone Analytics Offline</span>
              <span className="text-xs">Start monitoring to view live crowd density.</span>
            </div>
          )}

          <div className="rounded-3xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-xl p-5 shadow-2xl">
            <h3 className="mb-4 text-sm font-bold text-white flex items-center gap-2">
              <MdDashboard className="text-primary text-lg" />
              <span>Camera Inventory Status</span>
            </h3>
            {loading ? (
              <div className="space-y-2">
                <CardSkeleton />
                <CardSkeleton />
              </div>
            ) : (
              <ul className="space-y-2">
                {(cameras || []).length === 0 && (
                  <li className="text-xs text-text-muted py-6 text-center bg-white/[0.01] rounded-2xl border border-white/5">
                    No active cameras cataloged. Customize inside Settings.
                  </li>
                )}
                {(cameras || []).map((c) => (
                  <li
                    key={c.id}
                    onClick={() => setSelectedId(c.id)}
                    className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-xs cursor-pointer transition-all ${
                      c.id === activeCamera?.id
                        ? 'border-primary/40 bg-primary/10 text-white font-bold'
                        : 'border-white/5 bg-white/[0.01] hover:bg-white/[0.03] text-slate-300'
                    }`}
                  >
                    <div className="flex flex-col gap-0.5">
                      <span>{c.camera_name}</span>
                      <span className="text-[9px] font-normal text-text-muted">{c.location || 'Local Terminal'}</span>
                    </div>
                    <span
                      className={`text-[9px] font-bold uppercase tracking-wider ${
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
    </div>
  )
}
