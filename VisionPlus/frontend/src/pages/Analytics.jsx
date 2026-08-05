import { useState, useEffect, useMemo } from 'react'
import { Bar, Pie, Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from 'chart.js'
import { motion } from 'framer-motion'
import CountUp from 'react-countup'
import {
  MdGroups,
  MdTrendingUp,
  MdWarningAmber,
  MdInsights,
  MdFilterList,
  MdDownload,
  MdMap,
  MdCheckCircle,
} from 'react-icons/md'
import toast from 'react-hot-toast'

import StatCard from '../components/StatCard'
import ChartCard from '../components/ChartCard'
import Heatmap from '../components/Heatmap'
import { CardSkeleton, PageLoader } from '../components/Loader'
import { useFetch } from '../hooks/useFetch'
import { getAnalytics, getCameras } from '../services/api'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend
)

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        color: '#CBD5E1',
        font: { family: 'Inter', size: 11 }
      },
    },
  },
  scales: {
    x: {
      ticks: { color: '#94A3B8', font: { family: 'Inter' } },
      grid: { color: 'rgba(51, 65, 85, 0.3)' },
    },
    y: {
      ticks: { color: '#94A3B8', font: { family: 'Inter' } },
      grid: { color: 'rgba(51, 65, 85, 0.3)' },
    },
  },
}

export default function Analytics() {
  const { data, loading } = useFetch(getAnalytics, [])
  const { data: camerasData } = useFetch(getCameras, [])

  // Filters State
  const [dateRange, setDateRange] = useState('7d')
  const [cameraFilter, setCameraFilter] = useState('ALL')
  const [localStats, setLocalStats] = useState(null)

  // Sync loaded stats to local state to allow filter-simulations
  useEffect(() => {
    if (data) {
      setLocalStats(data)
    }
  }, [data])

  // Simulate filter variations dynamically when filters change
  const filteredData = useMemo(() => {
    if (!localStats) return null

    let multiplier = 1.0
    if (dateRange === '1d') multiplier = 0.4
    if (dateRange === '30d') multiplier = 3.6

    // Adjust based on camera filter
    if (cameraFilter !== 'ALL') {
      const idx = Number(cameraFilter) % 3
      multiplier *= (0.6 + idx * 0.2)
    }

    const origRisk = localStats.risk_distribution || { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 }
    
    return {
      total_people: Math.round((localStats.total_people || 0) * multiplier),
      average_people: (localStats.average_people || 0) * (0.8 + Math.random() * 0.4),
      total_alerts: Math.round((localStats.total_alerts || 0) * multiplier),
      risk_distribution: {
        LOW: Math.round(origRisk.LOW * multiplier),
        MEDIUM: Math.round(origRisk.MEDIUM * multiplier),
        HIGH: Math.round(origRisk.HIGH * multiplier),
        CRITICAL: Math.round(origRisk.CRITICAL * multiplier),
      }
    }
  }, [localStats, dateRange, cameraFilter])

  const risk = filteredData?.risk_distribution || { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 }
  const totalRisk = risk.LOW + risk.MEDIUM + risk.HIGH + risk.CRITICAL

  // Export Analytics Data
  const handleExport = (format) => {
    if (!filteredData) return

    const exportObj = {
      title: "VisionPlus Executive Analytics Export",
      timestamp: new Date().toISOString(),
      filters: { dateRange, cameraFilter },
      data: filteredData
    }

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `analytics_report_${dateRange}.json`
      link.click()
      toast.success("JSON exported successfully")
    } else {
      // CSV format
      let csvContent = "data:text/csv;charset=utf-8,"
      csvContent += "Metric,Value\n"
      csvContent += `Total People,${filteredData.total_people}\n`
      csvContent += `Average People / Frame,${filteredData.average_people.toFixed(2)}\n`
      csvContent += `Total Alerts,${filteredData.total_alerts}\n`
      csvContent += `Low Risk Events,${risk.LOW}\n`
      csvContent += `Medium Risk Events,${risk.MEDIUM}\n`
      csvContent += `High Risk Events,${risk.HIGH}\n`
      csvContent += `Critical Risk Events,${risk.CRITICAL}\n`

      const encodedUri = encodeURI(csvContent)
      const link = document.createElement('a')
      link.setAttribute("href", encodedUri)
      link.setAttribute("download", `analytics_report_${dateRange}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast.success("CSV exported successfully")
    }
  }

  const barData = {
    labels: ['Low', 'Medium', 'High', 'Critical'],
    datasets: [
      {
        label: 'Risk Classification',
        data: [risk.LOW, risk.MEDIUM, risk.HIGH, risk.CRITICAL],
        backgroundColor: ['#22C55E', '#3B82F6', '#F59E0B', '#EF4444'],
        borderRadius: 8,
      },
    ],
  }

  const pieData = {
    labels: ['Low', 'Medium', 'High', 'Critical'],
    datasets: [
      {
        data: [risk.LOW, risk.MEDIUM, risk.HIGH, risk.CRITICAL],
        backgroundColor: ['#22C55E', '#3B82F6', '#F59E0B', '#EF4444'],
        borderWidth: 0,
      },
    ],
  }

  // Trend line chart data representing people count logs over chosen date ranges
  const trendData = useMemo(() => {
    let labels = []
    let dataPoints = []
    
    if (dateRange === '1d') {
      labels = ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00']
      dataPoints = [12, 18, 54, 89, 45, 62]
    } else if (dateRange === '7d') {
      labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      dataPoints = [120, 145, 198, 230, 290, 180, 110]
    } else {
      labels = ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4']
      dataPoints = [890, 1050, 1240, 950]
    }

    if (cameraFilter !== 'ALL') {
      dataPoints = dataPoints.map(v => Math.round(v * 0.4))
    }

    return {
      labels,
      datasets: [
        {
          label: 'Crowd Trend Logs',
          data: dataPoints,
          borderColor: '#06B6D4',
          backgroundColor: 'rgba(6, 182, 212, 0.08)',
          fill: true,
          tension: 0.35,
          pointBackgroundColor: '#06B6D4',
        }
      ]
    }
  }, [dateRange, cameraFilter])

  return (
    <div className="space-y-6 select-none">
      {/* Title + Filter Actions */}
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white sm:text-3xl">Executive Analytics</h1>
          <p className="text-sm text-text-muted">Analyze safety violations, crowd movement histories, and system performance.</p>
        </div>

        {/* Filter Tray */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-1.5 px-3">
            <MdFilterList className="text-slate-400 text-lg" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="bg-transparent text-xs font-semibold text-white outline-none border-none cursor-pointer"
            >
              <option value="1d">Today</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
          </div>

          <div className="flex items-center gap-2 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-1.5 px-3">
            <select
              value={cameraFilter}
              onChange={(e) => setCameraFilter(e.target.value)}
              className="bg-transparent text-xs font-semibold text-white outline-none border-none cursor-pointer"
            >
              <option value="ALL">All Cameras</option>
              {(camerasData || []).map(cam => (
                <option key={cam.id} value={cam.id}>{cam.name || `Camera #${cam.id}`}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleExport('csv')}
              className="flex items-center gap-1 text-xs font-bold text-slate-300 hover:text-white rounded-xl border border-white/10 bg-white/[0.02] px-3.5 py-2.5 transition-all"
            >
              <MdDownload /> CSV
            </button>
            <button
              onClick={() => handleExport('json')}
              className="flex items-center gap-1 text-xs font-bold text-slate-300 hover:text-white rounded-xl border border-white/10 bg-white/[0.02] px-3.5 py-2.5 transition-all"
            >
              <MdDownload /> JSON
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)
        ) : (
          <>
            <StatCard
              icon={MdGroups}
              label="Cumulative Crowd Volume"
              value={filteredData?.total_people ?? 0}
              color="primary"
            />
            <StatCard
              icon={MdTrendingUp}
              label="Mean Detections / Frame"
              value={filteredData ? Number(filteredData.average_people).toFixed(1) : 0}
              color="info"
            />
            <StatCard
              icon={MdWarningAmber}
              label="Violations Triggered"
              value={filteredData?.total_alerts ?? 0}
              color="danger"
            />
          </>
        )}
      </div>

      {/* Main Charts Block */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <ChartCard title="Crowd density timeline logs" className="xl:col-span-2 glass-card bg-white/[0.02]">
          <Line data={trendData} options={chartOptions} />
        </ChartCard>

        <ChartCard title="Zone Safety Index Distribution" className="glass-card bg-white/[0.02]">
          <Pie data={pieData} options={{ ...chartOptions, scales: undefined }} />
        </ChartCard>
      </div>

      {/* Bottom detailed charts block */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <ChartCard title="Violation Level Severity Count" className="glass-card bg-white/[0.02]">
          <Bar data={barData} options={chartOptions} />
        </ChartCard>

        {/* Heatmap zones card */}
        <div className="rounded-3xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-xl p-5 shadow-2xl">
          <h3 className="mb-4 text-sm font-bold text-white flex items-center gap-2">
            <MdMap className="text-primary text-lg" />
            <span>Site Occupancy Grid Layout</span>
          </h3>
          <Heatmap
            zones={{
              'Zone A (Entry Terminal)': risk.LOW,
              'Zone B (Transit Lobby)': risk.MEDIUM,
              'Zone C (Concourse)': risk.HIGH,
              'Zone D (Exit Terminal)': risk.CRITICAL,
            }}
          />
        </div>
      </div>

      {/* AI Automated Diagnosis Summary */}
      <motion.div
        whileHover={{ scale: 1.005 }}
        className="rounded-3xl border border-indigo-500/20 bg-indigo-500/[0.03] p-6 shadow-2xl backdrop-blur-xl"
      >
        <div className="flex items-center gap-3">
          <MdInsights className="text-3xl text-indigo-400" />
          <div>
            <h2 className="text-xl font-bold text-white">System AI Insights Report</h2>
            <p className="text-xs text-slate-400">Continuous automated safety diagnosis engine</p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-slate-950/60 border border-white/5 p-4 flex flex-col justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Identified Risk Events</span>
            <div className="mt-2 text-3xl font-black text-white">{totalRisk}</div>
          </div>

          <div className="rounded-2xl bg-slate-950/60 border border-white/5 p-4 flex flex-col justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Highest Flagged Risk Code</span>
            <div className={`mt-2 text-3xl font-black ${risk.CRITICAL > 0 ? 'text-red-400' : risk.HIGH > 0 ? 'text-yellow-400' : 'text-green-400'}`}>
              {risk.CRITICAL > 0 ? 'CRITICAL' : risk.HIGH > 0 ? 'HIGH' : risk.MEDIUM > 0 ? 'MEDIUM' : 'LOW'}
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-2xl bg-slate-950/40 border border-white/5 p-5">
          <h3 className="font-semibold text-indigo-400 text-sm flex items-center gap-1.5">
            <MdCheckCircle />
            <span>AI Automated Actions and Advice Plan</span>
          </h3>
          <ul className="mt-3 space-y-2 text-xs text-slate-300">
            <li className="flex items-center gap-2">• Monitor pedestrian bottlenecks and exit doors in concourses.</li>
            <li className="flex items-center gap-2">• System recommended deploying secondary guards for high risk zones.</li>
            <li className="flex items-center gap-2">• Generate daily PDF reports of live violations to trace long-term trends.</li>
          </ul>
        </div>
      </motion.div>
    </div>
  )
}