import { useMemo, useState } from 'react'
import { MdSearch, MdDownload, MdPictureAsPdf, MdTableChart, MdDataObject } from 'react-icons/md'
import toast from 'react-hot-toast'
import { RiskBadge } from '../components/AlertCard'
import { PageLoader } from '../components/Loader'
import { useFetch } from '../hooks/useFetch'
import { getReports, downloadReportPdf, downloadReportCsv, downloadReportJson, resolveMediaUrl } from '../services/api'

export default function Reports() {
  const { data: reports, loading } = useFetch(getReports, [])
  const [search, setSearch] = useState('')
  const [riskFilter, setRiskFilter] = useState('ALL')
  const [downloadingId, setDownloadingId] = useState(null)

  const filtered = useMemo(() => {
    return (reports || []).filter((r) => {
      const matchesSearch = String(r.video_id).includes(search)
      const matchesRisk = riskFilter === 'ALL' || r.highest_risk === riskFilter
      return matchesSearch && matchesRisk
    })
  }, [reports, search, riskFilter])

  const handleDownload = async (videoId, format) => {
    setDownloadingId(`${videoId}-${format}`)
    try {
      if (format === 'pdf') await downloadReportPdf(videoId)
      else if (format === 'csv') await downloadReportCsv(videoId)
      else await downloadReportJson(videoId)
    } catch {
      toast.error(`Could not generate the ${format.toUpperCase()} report`)
    } finally {
      setDownloadingId(null)
    }
  }

  return (
    <div className="rounded-2xl border border-surface-border bg-surface-card p-5 shadow-card">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-white">Reports</h3>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <MdSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by video ID…"
              className="rounded-lg border border-surface-border bg-surface-elevated py-1.5 pl-8 pr-3 text-sm text-white placeholder:text-slate-500 focus:border-primary focus:outline-none"
            />
          </div>
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="rounded-lg border border-surface-border bg-surface-elevated px-3 py-1.5 text-sm text-white focus:border-primary focus:outline-none"
          >
            <option value="ALL">All Risk Levels</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>
      </div>

      {loading ? (
        <PageLoader />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-surface-border text-xs uppercase text-slate-500">
                <th className="px-3 py-2">Video</th>
                <th className="px-3 py-2">Max People</th>
                <th className="px-3 py-2">Avg People</th>
                <th className="px-3 py-2">Max Vehicles</th>
                <th className="px-3 py-2">Highest Risk</th>
                <th className="px-3 py-2">Date</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-3 py-6 text-center text-slate-500">
                    No reports found.
                  </td>
                </tr>
              )}
              {filtered.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-surface-border/60 text-slate-200 hover:bg-white/5"
                >
                  <td className="px-3 py-2.5">Video #{r.video_id}</td>
                  <td className="px-3 py-2.5">{r.maximum_people}</td>
                  <td className="px-3 py-2.5">{Number(r.average_people ?? 0).toFixed(1)}</td>
                  <td className="px-3 py-2.5">{r.maximum_vehicles ?? 0}</td>
                  <td className="px-3 py-2.5">
                    <RiskBadge level={r.highest_risk} />
                  </td>
                  <td className="px-3 py-2.5 text-slate-400">
                    {r.created_at ? new Date(r.created_at).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        title="Download PDF"
                        disabled={downloadingId === `${r.video_id}-pdf`}
                        onClick={() => handleDownload(r.video_id, 'pdf')}
                        className="inline-flex items-center gap-1 rounded-md border border-surface-border px-2 py-1 text-xs text-slate-300 hover:bg-white/5 disabled:opacity-50"
                      >
                        <MdPictureAsPdf /> PDF
                      </button>
                      <button
                        title="Download CSV"
                        disabled={downloadingId === `${r.video_id}-csv`}
                        onClick={() => handleDownload(r.video_id, 'csv')}
                        className="inline-flex items-center gap-1 rounded-md border border-surface-border px-2 py-1 text-xs text-slate-300 hover:bg-white/5 disabled:opacity-50"
                      >
                        <MdTableChart /> CSV
                      </button>
                      <button
                        title="Download JSON"
                        disabled={downloadingId === `${r.video_id}-json`}
                        onClick={() => handleDownload(r.video_id, 'json')}
                        className="inline-flex items-center gap-1 rounded-md border border-surface-border px-2 py-1 text-xs text-slate-300 hover:bg-white/5 disabled:opacity-50"
                      >
                        <MdDataObject /> JSON
                      </button>
                      {r.output_video && (
                        <a
                          href={resolveMediaUrl(r.output_video)}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Open annotated video"
                          className="inline-flex items-center gap-1 rounded-md border border-surface-border px-2 py-1 text-xs text-slate-300 hover:bg-white/5"
                        >
                          <MdDownload /> Video
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
    </div>
  )
}
