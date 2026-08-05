import { useMemo, useState } from 'react'
import { MdRefresh } from 'react-icons/md'
import AlertCard from '../components/AlertCard'
import { PageLoader } from '../components/Loader'
import { useFetch } from '../hooks/useFetch'
import { getAlerts } from '../services/api'

export default function Alerts() {
  const { data: alerts, loading, refetch } = useFetch(getAlerts, [], 20000)
  const [riskFilter, setRiskFilter] = useState('ALL')

  const filtered = useMemo(() => {
    return (alerts || []).filter(
      (a) => riskFilter === 'ALL' || a.risk_level === riskFilter,
    )
  }, [alerts, riskFilter])

  return (
    <div className="rounded-2xl border border-surface-border bg-surface-card p-5 shadow-card">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-white">Alerts</h3>
        <div className="flex items-center gap-2">
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
          <button
            onClick={refetch}
            className="flex items-center gap-1.5 rounded-lg border border-surface-border px-3 py-1.5 text-xs text-slate-300 hover:bg-white/5"
          >
            <MdRefresh /> Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <PageLoader />
      ) : (
        <div className="space-y-3">
          {filtered.length === 0 && (
            <p className="text-sm text-slate-500">No alerts match this filter.</p>
          )}
          {filtered.map((a) => (
            <AlertCard key={a.id} alert={a} />
          ))}
        </div>
      )}
    </div>
  )
}
