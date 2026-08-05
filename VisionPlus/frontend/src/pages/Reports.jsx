import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MdSearch,
  MdDownload,
  MdPictureAsPdf,
  MdTableChart,
  MdDataObject,
  MdClose,
  MdViewModule,
  MdViewList,
  MdDescription,
  MdTimeline,
  MdInfoOutline,
} from 'react-icons/md'
import toast from 'react-hot-toast'
import { RiskBadge } from '../components/AlertCard'
import { PageLoader } from '../components/Loader'
import { useFetch } from '../hooks/useFetch'
import {
  getReports,
  downloadReportPdf,
  downloadReportCsv,
  downloadReportJson,
  resolveMediaUrl,
} from '../services/api'

export default function Reports() {
  const { data: reports, loading } = useFetch(getReports, [])
  const [search, setSearch] = useState('')
  const [riskFilter, setRiskFilter] = useState('ALL')
  const [downloadingId, setDownloadingId] = useState(null)
  const [selectedReport, setSelectedReport] = useState(null)
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'

  const filtered = useMemo(() => {
    return (reports || []).filter((r) => {
      const matchesSearch = String(r.video_id).includes(search)
      const matchesRisk = riskFilter === 'ALL' || r.highest_risk === riskFilter
      return matchesSearch && matchesRisk
    })
  }, [reports, search, riskFilter])

  const handleDownload = async (videoId, format, e) => {
    if (e) e.stopPropagation();
    setDownloadingId(`${videoId}-${format}`)
    try {
      if (format === 'pdf') await downloadReportPdf(videoId)
      else if (format === 'csv') await downloadReportCsv(videoId)
      else await downloadReportJson(videoId)
      toast.success(`${format.toUpperCase()} downloaded successfully`)
    } catch {
      toast.error(`Could not download ${format.toUpperCase()}`)
    } finally {
      setDownloadingId(null)
    }
  }

  return (
    <div className="space-y-6 select-none">
      {/* Header controls block */}
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Executive Reports</h1>
          <p className="text-sm text-text-muted">Review, search, and download compiled crowd analytics and safety logs.</p>
        </div>

        {/* Filters Tray */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-base" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by video ID…"
              className="rounded-xl border border-white/10 bg-surface-elevated/40 py-2 pl-9 pr-4 text-xs text-white placeholder:text-slate-500 outline-none focus:border-primary/50 transition-all"
            />
          </div>

          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="rounded-xl border border-white/10 bg-surface-elevated/60 px-3 py-2 text-xs text-white outline-none cursor-pointer focus:border-primary/50 transition-all"
          >
            <option value="ALL">All Risk Levels</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          {/* Toggle View Mode */}
          <div className="flex rounded-xl border border-white/10 bg-white/[0.02] p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`rounded-lg p-1.5 transition-all ${viewMode === 'grid' ? 'bg-primary text-white' : 'text-slate-400 hover:text-white'}`}
              title="Grid View"
            >
              <MdViewModule className="text-lg" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`rounded-lg p-1.5 transition-all ${viewMode === 'list' ? 'bg-primary text-white' : 'text-slate-400 hover:text-white'}`}
              title="List View"
            >
              <MdViewList className="text-lg" />
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <PageLoader label="Fetching report registry…" />
      ) : (
        <>
          {filtered.length === 0 ? (
            <div className="text-center py-12 rounded-3xl border border-white/10 bg-white/[0.01] p-6">
              <p className="text-sm text-text-muted">No reports matching selected filters found.</p>
            </div>
          ) : (
            <>
              {/* GRID VIEW */}
              {viewMode === 'grid' && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filtered.map((r) => (
                    <motion.div
                      key={r.id}
                      whileHover={{ y: -4, scale: 1.01 }}
                      onClick={() => setSelectedReport(r)}
                      className="rounded-3xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04] p-5 shadow-2xl transition-all cursor-pointer flex flex-col justify-between"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary">
                            <MdDescription className="text-lg" />
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-white leading-tight">Report #{r.id}</h3>
                            <p className="text-[10px] text-text-muted">Video ID: {r.video_id}</p>
                          </div>
                        </div>
                        <RiskBadge level={r.highest_risk} />
                      </div>

                      <div className="space-y-2.5 my-4 border-y border-white/5 py-4">
                        <div className="flex justify-between text-xs">
                          <span className="text-text-muted">Max Volume</span>
                          <span className="font-semibold text-white">{r.maximum_people} people</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-text-muted">Average / Frame</span>
                          <span className="font-semibold text-white">{Number(r.average_people ?? 0).toFixed(1)} people</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-text-muted">Max Vehicles</span>
                          <span className="font-semibold text-white">{r.maximum_vehicles ?? 0}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <span className="text-[10px] text-text-muted">
                          {r.created_at ? new Date(r.created_at).toLocaleDateString() : '—'}
                        </span>
                        <div className="flex gap-1.5" onClick={e => e.stopPropagation()}>
                          <button
                            onClick={(e) => handleDownload(r.video_id, 'pdf', e)}
                            disabled={downloadingId === `${r.video_id}-pdf`}
                            className="rounded-lg p-1.5 border border-white/10 hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
                            title="Download PDF"
                          >
                            <MdPictureAsPdf size={16} />
                          </button>
                          <button
                            onClick={(e) => handleDownload(r.video_id, 'csv', e)}
                            disabled={downloadingId === `${r.video_id}-csv`}
                            className="rounded-lg p-1.5 border border-white/10 hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
                            title="Download CSV"
                          >
                            <MdTableChart size={16} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* LIST VIEW */}
              {viewMode === 'list' && (
                <div className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-5 shadow-2xl overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-white/10 text-xs uppercase text-slate-500">
                        <th className="px-4 py-3">Report ID</th>
                        <th className="px-4 py-3">Video ID</th>
                        <th className="px-4 py-3">Max Volume</th>
                        <th className="px-4 py-3">Avg Volume</th>
                        <th className="px-4 py-3">Max Vehicles</th>
                        <th className="px-4 py-3">Highest Risk</th>
                        <th className="px-4 py-3">Created Date</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((r) => (
                        <tr
                          key={r.id}
                          onClick={() => setSelectedReport(r)}
                          className="border-b border-white/5 text-slate-200 hover:bg-white/[0.03] cursor-pointer transition-colors"
                        >
                          <td className="px-4 py-3 font-semibold text-white">#{r.id}</td>
                          <td className="px-4 py-3 text-slate-400">Video #{r.video_id}</td>
                          <td className="px-4 py-3">{r.maximum_people}</td>
                          <td className="px-4 py-3">{Number(r.average_people ?? 0).toFixed(1)}</td>
                          <td className="px-4 py-3">{r.maximum_vehicles ?? 0}</td>
                          <td className="px-4 py-3">
                            <RiskBadge level={r.highest_risk} />
                          </td>
                          <td className="px-4 py-3 text-slate-400">
                            {r.created_at ? new Date(r.created_at).toLocaleDateString() : '—'}
                          </td>
                          <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                disabled={downloadingId === `${r.video_id}-pdf`}
                                onClick={(e) => handleDownload(r.video_id, 'pdf', e)}
                                className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-2.5 py-1.5 text-xs text-slate-300 hover:bg-white/5 disabled:opacity-50"
                              >
                                <MdPictureAsPdf /> <span>PDF</span>
                              </button>
                              <button
                                disabled={downloadingId === `${r.video_id}-csv`}
                                onClick={(e) => handleDownload(r.video_id, 'csv', e)}
                                className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-2.5 py-1.5 text-xs text-slate-300 hover:bg-white/5 disabled:opacity-50"
                              >
                                <MdTableChart /> <span>CSV</span>
                              </button>
                              {r.output_video && (
                                <a
                                  href={resolveMediaUrl(r.output_video)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-2.5 py-1.5 text-xs text-slate-300 hover:bg-white/5"
                                >
                                  <MdDownload /> <span>Video</span>
                                </a>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Report Details Modal */}
      <AnimatePresence>
        {selectedReport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedReport(null)}
              className="absolute inset-0 bg-[#02040a]/85 backdrop-blur-md"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative z-10 w-full max-w-4xl max-h-[85vh] rounded-3xl border border-white/10 bg-surface-card p-6 shadow-2xl overflow-y-auto flex flex-col md:flex-row gap-6 scrollbar-thin"
              role="dialog"
              aria-modal="true"
            >
              {/* Left pane: PDF Mock Document Preview */}
              <div className="flex-1 rounded-2xl border border-slate-700 bg-white p-6 shadow-inner text-slate-900 font-serif flex flex-col justify-between min-h-[380px] select-text">
                <div>
                  <div className="border-b-2 border-slate-900 pb-3 mb-4 flex justify-between items-center">
                    <div>
                      <h2 className="text-xl font-bold uppercase tracking-wider text-slate-900">VisionPlus Report</h2>
                      <span className="text-[9px] uppercase tracking-widest font-sans font-bold text-slate-500">Security & Crowd Control Division</span>
                    </div>
                    <span className="text-[10px] font-sans font-semibold bg-slate-900 text-white px-2 py-0.5 rounded">ID: #{selectedReport.id}</span>
                  </div>

                  <div className="space-y-3 font-sans text-xs">
                    <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-600 border-b border-slate-200 pb-2">
                      <div>Date: <span className="font-semibold text-slate-800">{selectedReport.created_at ? new Date(selectedReport.created_at).toLocaleString() : '—'}</span></div>
                      <div>Source File: <span className="font-semibold text-slate-800">video_{selectedReport.video_id}.mp4</span></div>
                    </div>

                    <div className="pt-2">
                      <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500 block mb-1">Executive Summary</span>
                      <p className="leading-relaxed text-slate-700 text-justify text-[11px] font-serif">
                        SafeVision crowd monitoring engine analyzed the uploaded media footprint. A maximum density peak of <span className="font-bold text-slate-900">{selectedReport.maximum_people} people</span> was registered, accompanied by a localized average density index of <span className="font-bold text-slate-900">{Number(selectedReport.average_people ?? 0).toFixed(1)} people</span>. Peak traffic for auxiliary vehicles was cataloged at <span className="font-bold text-slate-900">{selectedReport.maximum_vehicles ?? 0} units</span>. Evaluated safety registers triggered a <span className="font-bold text-slate-900 underline uppercase">{selectedReport.highest_risk}</span> threat status.
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100">
                      <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500 block mb-1.5">Statistical Breakdown</span>
                      <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                        <div className="bg-slate-100 p-2 rounded border border-slate-200">
                          <div className="text-slate-500">Max Pedestrians</div>
                          <div className="text-sm font-bold text-slate-900">{selectedReport.maximum_people}</div>
                        </div>
                        <div className="bg-slate-100 p-2 rounded border border-slate-200">
                          <div className="text-slate-500">Avg Density</div>
                          <div className="text-sm font-bold text-slate-900">{Number(selectedReport.average_people ?? 0).toFixed(1)}</div>
                        </div>
                        <div className="bg-slate-100 p-2 rounded border border-slate-200">
                          <div className="text-slate-500">Max Vehicles</div>
                          <div className="text-sm font-bold text-slate-900">{selectedReport.maximum_vehicles ?? 0}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-4 mt-6 flex justify-between items-end font-sans text-[8px] text-slate-400 uppercase tracking-widest">
                  <span>Authorized digital signature</span>
                  <div className="border-t border-slate-900 w-24 pt-1 text-center font-bold text-slate-800">AI CORE ENGINE</div>
                </div>
              </div>

              {/* Right pane: Interactive metadata details & actions */}
              <div className="w-full md:w-80 flex flex-col justify-between">
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-white">Report Analytics</h3>
                      <p className="text-[10px] text-text-muted">Interactive dashboard insights</p>
                    </div>
                    <button
                      onClick={() => setSelectedReport(null)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-white/5 hover:text-white transition-colors focus:outline-none"
                    >
                      <MdClose size={20} />
                    </button>
                  </div>

                  {/* Zone analytics indicator */}
                  <div className="space-y-2.5 rounded-2xl bg-white/[0.01] border border-white/5 p-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary-light flex items-center gap-1">
                      <MdInfoOutline /> <span>Active Zone Heat Registers</span>
                    </span>
                    <div className="space-y-2 text-xs">
                      <div>
                        <div className="flex justify-between mb-1 text-[10px]">
                          <span className="text-text-muted">Zone A (Entry)</span>
                          <span className="font-semibold text-white">Active</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-success rounded-full" style={{ width: '80%' }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-1 text-[10px]">
                          <span className="text-text-muted">Zone B (Transit Lobby)</span>
                          <span className="font-semibold text-white">Active</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-info rounded-full" style={{ width: '60%' }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-1 text-[10px]">
                          <span className="text-text-muted">Zone C (Concourse Lobby)</span>
                          <span className="font-semibold text-white">Warning Peak</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-warning rounded-full" style={{ width: '90%' }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Event timeline logs */}
                  <div className="space-y-2 rounded-2xl bg-white/[0.01] border border-white/5 p-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary-light flex items-center gap-1">
                      <MdTimeline /> <span>Incident Timeline Logs</span>
                    </span>
                    <div className="space-y-2.5 text-[11px] max-h-36 overflow-y-auto scrollbar-thin">
                      <div className="flex items-start gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-success shrink-0" />
                        <div>
                          <div className="text-white font-medium">Video Analysis Booted</div>
                          <span className="text-[9px] text-text-muted">Frame index 00:00</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-warning shrink-0" />
                        <div>
                          <div className="text-white font-medium">Pedestrian density spike</div>
                          <span className="text-[9px] text-text-muted">Frame index 00:15</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-info shrink-0" />
                        <div>
                          <div className="text-white font-medium">Final reports compiled</div>
                          <span className="text-[9px] text-text-muted">Frame index 00:45</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions Tray */}
                <div className="mt-6 space-y-2 border-t border-white/5 pt-4">
                  <button
                    disabled={downloadingId === `${selectedReport.video_id}-pdf`}
                    onClick={() => handleDownload(selectedReport.video_id, 'pdf')}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-xs font-semibold text-white shadow-card hover:bg-primary-dark transition-all disabled:opacity-50"
                  >
                    <MdPictureAsPdf /> <span>Download PDF Document</span>
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      disabled={downloadingId === `${selectedReport.video_id}-csv`}
                      onClick={() => handleDownload(selectedReport.video_id, 'csv')}
                      className="flex items-center justify-center gap-1 rounded-xl border border-white/10 bg-white/[0.02] py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/[0.05] transition-all disabled:opacity-50"
                    >
                      <MdTableChart /> <span>Export CSV</span>
                    </button>
                    <button
                      disabled={downloadingId === `${selectedReport.video_id}-json`}
                      onClick={() => handleDownload(selectedReport.video_id, 'json')}
                      className="flex items-center justify-center gap-1 rounded-xl border border-white/10 bg-white/[0.02] py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/[0.05] transition-all disabled:opacity-50"
                    >
                      <MdDataObject /> <span>Export JSON</span>
                    </button>
                  </div>

                  {selectedReport.output_video && (
                    <a
                      href={resolveMediaUrl(selectedReport.output_video)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.02] py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/[0.05] transition-all block text-center"
                    >
                      <MdDownload /> <span>View Annotated Output Video</span>
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
