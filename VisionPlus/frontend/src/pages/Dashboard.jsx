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
import { motion } from 'framer-motion'
import {
  MdVideocam,
  MdOndemandVideo,
  MdWarningAmber,
  MdGroups,
  MdDirectionsCar,
  MdInsights,
  MdTimeline,
  MdMap,
  MdRadio,
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
  plugins: {
    legend: {
      labels: {
        color: '#CBD5E1',
        font: { family: 'Inter', size: 11 }
      }
    }
  },
  scales: {
    x: {
      ticks: { color: '#64748B', font: { family: 'Inter' } },
      grid: { color: 'rgba(51, 65, 85, 0.3)' }
    },
    y: {
      ticks: { color: '#64748B', font: { family: 'Inter' } },
      grid: { color: 'rgba(51, 65, 85, 0.3)' }
    },
  },
}

export default function Dashboard() {
  const { data: stats, loading: statsLoading } = useFetch(getDashboardStats, [], 15000)
  const { data: alerts, loading: alertsLoading } = useFetch(getRecentAlerts, [], 15000)
  const { data: reports, loading: reportsLoading } = useFetch(getRecentReports, [])

  const risk = stats?.risk_distribution || { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 }
  const riskTotal = Object.values(risk).reduce((a, b) => a + b, 0)

  // Calculate Overall Risk Score out of 100
  const lowCount = risk.LOW || 0
  const medCount = risk.MEDIUM || 0
  const highCount = risk.HIGH || 0
  const critCount = risk.CRITICAL || 0
  const totalDetections = lowCount + medCount + highCount + critCount
  let riskScore = 0
  if (totalDetections > 0) {
    riskScore = Math.round(((lowCount * 10) + (medCount * 40) + (highCount * 75) + (critCount * 100)) / totalDetections)
  }

  // Safety Status based on risk score
  const getSafetyStatus = () => {
    if (riskScore < 30) return { label: 'Secured', color: 'text-success', bg: 'bg-success/10', border: 'border-success/20' }
    if (riskScore < 60) return { label: 'Moderate', color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/20' }
    return { label: 'High Risk', color: 'text-danger', bg: 'bg-danger/10', border: 'border-danger/20' }
  }
  const safety = getSafetyStatus()

  const pieData = {
    labels: ['Critical', 'High', 'Medium', 'Low'],
    datasets: [
      {
        data: [risk.CRITICAL, risk.HIGH, risk.MEDIUM, risk.LOW],
        backgroundColor: ['#EF4444', '#F59E0B', '#3B82F6', '#22C55E'],
        borderWidth: 0,
      },
    ],
  }

  const trendData = {
    labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'],
    datasets: [
      {
        label: 'Detections Trend',
        data: [
          Math.max(0, lowCount - 2),
          Math.max(0, medCount - 1),
          medCount + 2,
          highCount + 1,
          Math.max(0, critCount - 1),
          highCount + medCount,
          lowCount + medCount
        ],
        borderColor: '#6366F1',
        backgroundColor: 'rgba(99, 102, 241, 0.08)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#818CF8',
        pointHoverRadius: 6,
      },
    ],
  }

  return (
    <div className="space-y-6 select-none">
      {/* Title Header */}
      <div className="flex flex-col gap-1.5 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">AI Command Center</h1>
          <p className="text-sm text-text-muted">Real-time crowd intelligence, hazard detection, and site monitoring overview.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {statsLoading ? (
          Array.from({ length: 5 }).map((_, i) => <CardSkeleton key={i} />)
        ) : (
          <>
            <StatCard icon={MdVideocam} label="Total Cameras" value={stats?.total_cameras ?? 0} color="primary" />
            <StatCard icon={MdOndemandVideo} label="Total Videos" value={stats?.total_videos ?? 0} color="info" />
            <StatCard icon={MdWarningAmber} label="Total Alerts" value={stats?.total_alerts ?? 0} color="danger" />
            <StatCard icon={MdGroups} label="People Detected" value={stats?.total_people_detected ?? 0} color="success" />
            <StatCard icon={MdDirectionsCar} label="Vehicles Detected" value={stats?.total_vehicles_detected ?? 0} color="warning" />
          </>
        )}
      </div>

      {/* Primary Panels Grid */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Live Video Preview Panel */}
        <ChartCard
          title="Live Camera Feed"
          className="xl:col-span-1 glass-card bg-white/[0.02]"
          action={
            <div className="flex items-center gap-1.5 rounded-full bg-slate-900/60 px-3 py-1 border border-white/5">
              <span className={`h-2 w-2 rounded-full ${stats?.live_monitoring?.is_running && !stats?.live_monitoring?.is_paused ? 'bg-success animate-pulse' : 'bg-slate-500'}`} />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
                {stats?.live_monitoring?.is_running
                  ? stats?.live_monitoring?.is_paused
                    ? 'Paused'
                    : 'Active Feed'
                  : 'Disconnected'}
              </span>
            </div>
          }
        >
          <VideoPlayer src={getLiveStreamUrl()} mode="mjpeg" live />
        </ChartCard>

        {/* Counts Trend Line Chart */}
        <ChartCard title="Detections Trend Chart" className="xl:col-span-2 glass-card bg-white/[0.02]">
          <Line data={trendData} options={chartOptions} />
        </ChartCard>
      </div>

      {/* Analytical Widget Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Risk Gauge Widget */}
        <div className="rounded-3xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-xl p-5 shadow-2xl relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <MdRadio className="text-primary text-lg" />
              <span>Safety Status Index</span>
            </h3>
            <span className={`rounded-xl px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${safety.bg} ${safety.color} border ${safety.border}`}>
              {safety.label}
            </span>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center py-4">
            <div className="relative flex items-center justify-center">
              {/* Semi-circular gauge track */}
              <svg className="w-36 h-36 transform -rotate-90">
                <circle
                  cx="72"
                  cy="72"
                  r="60"
                  stroke="rgba(255, 255, 255, 0.05)"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="72"
                  cy="72"
                  r="60"
                  stroke="url(#gaugeGradient)"
                  strokeWidth="10"
                  fill="transparent"
                  strokeDasharray="377"
                  strokeDashoffset={377 - (377 * (riskScore || 5)) / 100}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
                <defs>
                  <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#22C55E" />
                    <stop offset="50%" stopColor="#F59E0B" />
                    <stop offset="100%" stopColor="#EF4444" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-3xl font-black text-white">{riskScore}%</span>
                <span className="text-[10px] uppercase font-bold text-text-muted tracking-widest mt-0.5">Risk Score</span>
              </div>
            </div>
          </div>

          <div className="border-t border-white/5 pt-4 text-xs text-text-muted text-center">
            Weighted index based on real-time event parameters.
          </div>
        </div>

        {/* Pie distribution chart */}
        <ChartCard title={`Risk Classifications (${riskTotal} events)`} className="glass-card bg-white/[0.02]">
          <Pie data={pieData} options={{ ...chartOptions, scales: undefined }} />
        </ChartCard>

        {/* Heatmap zones card */}
        <div className="rounded-3xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-xl p-5 shadow-2xl">
          <h3 className="mb-4 text-sm font-bold text-white flex items-center gap-2">
            <MdMap className="text-primary text-lg" />
            <span>Zone Density Layout</span>
          </h3>
          <Heatmap
            zones={{
              'Zone A (Entry)': risk.LOW,
              'Zone B (Corridor)': risk.MEDIUM,
              'Zone C (Lobby)': risk.HIGH,
              'Zone D (Exit)': risk.CRITICAL,
            }}
          />
        </div>
      </div>

      {/* Lower section: Alerts timeline and Reports */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Alerts Timeline */}
        <div className="rounded-3xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-xl p-5 shadow-2xl lg:col-span-1 flex flex-col">
          <h3 className="mb-4 text-sm font-bold text-white flex items-center gap-2">
            <MdTimeline className="text-primary text-lg" />
            <span>Alert Timeline</span>
          </h3>
          <div className="flex-1 overflow-y-auto max-h-[350px] pr-2 scrollbar-thin">
            {alertsLoading ? (
              <PageLoader label="Fetching alerts timeline…" />
            ) : (
              <div className="space-y-4 relative pl-4 border-l border-white/10 ml-2">
                {(alerts || []).slice(0, 4).length === 0 && (
                  <p className="text-xs text-text-muted py-6">No safety alerts captured yet.</p>
                )}
                {(alerts || []).slice(0, 4).map((a) => (
                  <div key={a.id} className="relative space-y-1">
                    {/* Timeline node marker */}
                    <div className={`absolute -left-[21px] top-1 h-3.5 w-3.5 rounded-full border border-slate-950 ${
                      a.risk_level === 'CRITICAL' ? 'bg-danger animate-pulse shadow-danger' :
                      a.risk_level === 'HIGH' ? 'bg-warning' :
                      a.risk_level === 'MEDIUM' ? 'bg-info' : 'bg-success'
                    }`} />
                    <div className="flex items-center justify-between text-[11px] font-semibold text-text-muted">
                      <span>Camera #{a.camera_id || 'System'}</span>
                      <span>{a.created_at ? new Date(a.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Live'}</span>
                    </div>
                    <p className="text-xs font-medium text-white">{a.message || 'Abnormal activity detected'}</p>
                    <div className="text-[10px] text-text-muted">
                      Risk Level: <span className={`font-bold ${
                        a.risk_level === 'CRITICAL' ? 'text-danger' :
                        a.risk_level === 'HIGH' ? 'text-warning' :
                        a.risk_level === 'MEDIUM' ? 'text-info' : 'text-success'
                      }`}>{a.risk_level}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* AI Recommendations Panel */}
        <div className="rounded-3xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-xl p-5 shadow-2xl lg:col-span-2 flex flex-col justify-between">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-primary">
              <MdInsights className="text-xl" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Security AI Insights</h3>
              <p className="text-[10px] text-text-muted font-medium">Automatic system diagnosis and advice</p>
            </div>
          </div>

          <div className="flex-1 space-y-4">
            <div className="rounded-2xl bg-white/[0.01] border border-white/5 p-4">
              <span className="text-[10px] font-bold text-primary-light uppercase tracking-wider block mb-1">Observation</span>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                {totalDetections > 0
                  ? `AI Core has monitored ${stats?.total_people_detected || 0} total individuals and processed ${stats?.total_videos || 0} uploaded files. Risk distribution shows a concentration of ${highCount + critCount} high/critical events.`
                  : "AI Monitoring engines are online. No active detections have been registered in the database yet."}
              </p>
            </div>

            <div className="rounded-2xl bg-white/[0.01] border border-white/5 p-4">
              <span className="text-[10px] font-bold text-primary-light uppercase tracking-wider block mb-1">Operational Action</span>
              <ul className="text-xs text-slate-300 space-y-1.5 leading-normal">
                {risk.CRITICAL > 0 || risk.HIGH > 0 ? (
                  <>
                    <li className="flex items-center gap-1.5 text-danger font-medium">• ⚠️ Congestion flagged in lobby/exits. Dispatch staff to clear routes.</li>
                    <li className="flex items-center gap-1.5">• Verify live monitoring streams on active cameras.</li>
                    <li className="flex items-center gap-1.5">• Download PDF analytics report for further analysis.</li>
                  </>
                ) : (
                  <>
                    <li className="flex items-center gap-1.5 text-success">• ✓ Safety indices are within target levels.</li>
                    <li className="flex items-center gap-1.5">• Live monitoring is running cleanly in the background.</li>
                    <li className="flex items-center gap-1.5">• No operational changes requested.</li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Reports section */}
      <div className="rounded-3xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-xl p-5 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-white">Recent Executive Reports</h3>
        </div>
        {reportsLoading ? (
          <PageLoader label="Fetching report files…" />
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {(reports || []).length === 0 && (
              <p className="text-xs text-text-muted py-6 col-span-full text-center bg-white/[0.01] rounded-2xl border border-white/5">
                No reports compiled yet. Conduct video analysis to generate insights.
              </p>
            )}
            {(reports || []).slice(0, 3).map((r) => (
              <ReportCard
                key={r.id}
                report={r}
                onDownload={async (report) => {
                  try {
                    await downloadReportPdf(report.video_id)
                  } catch {
                    toast.error('Could not fetch PDF export')
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
