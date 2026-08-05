import { Line, Pie } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js'
import {
  MdVideocam,
  MdOndemandVideo,
  MdWarningAmber,
  MdGroups,
  MdDirectionsCar,
} from 'react-icons/md'
import StatCard from '../components/StatCard'
import ChartCard from '../components/ChartCard'
import AlertCard from '../components/AlertCard'
import ReportCard from '../components/ReportCard'
import Heatmap from '../components/Heatmap'
import VideoPlayer from '../components/VideoPlayer'
import { CardSkeleton, PageLoader } from '../components/Loader'
import { useFetch } from '../hooks/useFetch'
import {
  getDashboardStats,
  getRecentAlerts,
  getRecentReports,
  getLiveStreamUrl,
  downloadReportPdf,
} from '../services/api'
import toast from 'react-hot-toast'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend)

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { labels: { color: '#94a3b8' } } },
  scales: {
    x: { ticks: { color: '#64748b' }, grid: { color: '#2a2a3d' } },
    y: { ticks: { color: '#64748b' }, grid: { color: '#2a2a3d' } },
  },
}

export default function Dashboard() {
  const { data: stats, loading: statsLoading } = useFetch(getDashboardStats, [], 15000)
  const { data: alerts, loading: alertsLoading } = useFetch(getRecentAlerts, [], 15000)
  const { data: reports, loading: reportsLoading } = useFetch(getRecentReports, [])

  const risk = stats?.risk_distribution || { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 }
  const riskTotal = Object.values(risk).reduce((a, b) => a + b, 0)

  const pieData = {
    labels: ['Critical', 'High', 'Medium', 'Low'],
    datasets: [
      {
        data: [risk.CRITICAL, risk.HIGH, risk.MEDIUM, risk.LOW],
        backgroundColor: ['#ef4444', '#f59e0b', '#3b82f6', '#22c55e'],
        borderWidth: 0,
      },
    ],
  }

  // The backend doesn't expose a time-bucketed "people trend" endpoint yet —
  // this chart is wired to real risk-distribution data above; swap this
  // placeholder series for a real time series once that endpoint exists.
  const trendData = {
    labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'],
    datasets: [
      {
        label: 'Detections (sample)',
        data: [risk.LOW, risk.MEDIUM, risk.HIGH, risk.CRITICAL, risk.MEDIUM, risk.LOW, risk.HIGH],
        borderColor: '#5b5ceb',
        backgroundColor: 'rgba(91,92,235,0.15)',
        tension: 0.4,
        fill: true,
      },
    ],
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {statsLoading ? (
          Array.from({ length: 5 }).map((_, i) => <CardSkeleton key={i} />)
        ) : (
          <>
            <StatCard icon={MdVideocam} label="Total Cameras" value={stats?.total_cameras ?? 0} color="primary" />
            <StatCard icon={MdOndemandVideo} label="Total Videos" value={stats?.total_videos ?? 0} color="info" />
            <StatCard icon={MdWarningAmber} label="Total Alerts" value={stats?.total_alerts ?? 0} color="danger" />
            <StatCard icon={MdGroups} label="Total People Detected" value={stats?.total_people_detected ?? 0} color="success" />
            <StatCard icon={MdDirectionsCar} label="Total Vehicles Detected" value={stats?.total_vehicles_detected ?? 0} color="warning" />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <ChartCard
          title="Live Camera Preview"
          className="xl:col-span-1"
          action={
            <span
              className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                stats?.live_monitoring?.is_running
                  ? stats?.live_monitoring?.is_paused
                    ? 'bg-yellow-500/15 text-yellow-400'
                    : 'bg-success/15 text-success'
                  : 'bg-white/5 text-slate-400'
              }`}
            >
              {stats?.live_monitoring?.is_running
                ? stats?.live_monitoring?.is_paused
                  ? 'Paused'
                  : 'Live'
                : 'Stopped'}
            </span>
          }
        >
          <VideoPlayer src={getLiveStreamUrl()} mode="mjpeg" live />
        </ChartCard>

        <ChartCard title="People Count Trend" className="xl:col-span-2">
          <Line data={trendData} options={chartOptions} />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartCard title={`Risk Distribution (${riskTotal} total)`}>
          <Pie data={pieData} options={{ ...chartOptions, scales: undefined }} />
        </ChartCard>

        <div className="rounded-2xl border border-surface-border bg-surface-card p-5 shadow-card">
          <h3 className="mb-4 text-sm font-semibold text-white">Crowd Heatmap (Zones)</h3>
          <Heatmap
            zones={{
              'Zone A': risk.LOW,
              'Zone B': risk.MEDIUM,
              'Zone C': risk.HIGH,
              'Zone D': risk.CRITICAL,
            }}
          />
        </div>

        <div className="rounded-2xl border border-surface-border bg-surface-card p-5 shadow-card">
          <h3 className="mb-4 text-sm font-semibold text-white">Recent Alerts</h3>
          {alertsLoading ? (
            <PageLoader label="Loading alerts…" />
          ) : (
            <div className="space-y-3">
              {(alerts || []).slice(0, 4).length === 0 && (
                <p className="text-sm text-slate-500">No alerts yet.</p>
              )}
              {(alerts || []).slice(0, 4).map((a) => (
                <AlertCard key={a.id} alert={a} />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-surface-border bg-surface-card p-5 shadow-card">
        <h3 className="mb-4 text-sm font-semibold text-white">Recent Reports</h3>
        {reportsLoading ? (
          <PageLoader label="Loading reports…" />
        ) : (
          <div className="space-y-3">
            {(reports || []).length === 0 && (
              <p className="text-sm text-slate-500">No reports yet — analyze a video to generate one.</p>
            )}
            {(reports || []).slice(0, 5).map((r) => (
              <ReportCard
                key={r.id}
                report={r}
                onDownload={async (report) => {
                  try {
                    await downloadReportPdf(report.video_id)
                  } catch {
                    toast.error('Could not generate the PDF report')
                  }
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
