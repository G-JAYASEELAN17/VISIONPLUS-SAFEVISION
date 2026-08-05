import { Bar, Pie } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
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
} from 'react-icons/md'

import StatCard from '../components/StatCard'
import ChartCard from '../components/ChartCard'
import { CardSkeleton } from '../components/Loader'
import { useFetch } from '../hooks/useFetch'
import { getAnalytics } from '../services/api'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
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
      },
    },
  },
  scales: {
    x: {
      ticks: { color: '#94A3B8' },
      grid: { color: '#334155' },
    },
    y: {
      ticks: { color: '#94A3B8' },
      grid: { color: '#334155' },
    },
  },
}

export default function Analytics() {
  const { data, loading } = useFetch(getAnalytics, [])

  const risk = data?.risk_distribution || {
    LOW: 0,
    MEDIUM: 0,
    HIGH: 0,
    CRITICAL: 0,
  }

  const totalRisk =
    risk.LOW +
    risk.MEDIUM +
    risk.HIGH +
    risk.CRITICAL

  const barData = {
    labels: ['Low', 'Medium', 'High', 'Critical'],
    datasets: [
      {
        label: 'Risk Distribution',
        data: [
          risk.LOW,
          risk.MEDIUM,
          risk.HIGH,
          risk.CRITICAL,
        ],
        backgroundColor: [
          '#22C55E',
          '#3B82F6',
          '#F59E0B',
          '#EF4444',
        ],
        borderRadius: 10,
      },
    ],
  }

  const pieData = {
    labels: ['Low', 'Medium', 'High', 'Critical'],
    datasets: [
      {
        data: [
          risk.LOW,
          risk.MEDIUM,
          risk.HIGH,
          risk.CRITICAL,
        ],
        backgroundColor: [
          '#22C55E',
          '#3B82F6',
          '#F59E0B',
          '#EF4444',
        ],
        borderWidth: 0,
      },
    ],
  }

  return (
    <div className="space-y-6">

      {/* KPI */}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))
        ) : (
          <>
            <StatCard
              icon={MdGroups}
              label="Total People"
              value={<CountUp end={data?.total_people || 0} duration={2} />}
              color="primary"
            />

            <StatCard
              icon={MdTrendingUp}
              label="Average / Frame"
              value={
                <CountUp
                  end={data?.average_people || 0}
                  decimals={1}
                  duration={2}
                />
              }
              color="info"
            />

            <StatCard
              icon={MdWarningAmber}
              label="Alerts"
              value={<CountUp end={data?.total_alerts || 0} duration={2} />}
              color="danger"
            />
          </>
        )}

      </div>

      {/* Charts */}

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">

        <motion.div
          whileHover={{ y: -5 }}
        >
          <ChartCard title="Risk Distribution">
            <Bar data={barData} options={chartOptions} />
          </ChartCard>
        </motion.div>

        <motion.div
          whileHover={{ y: -5 }}
        >
          <ChartCard title="Risk Percentage">
            <Pie
              data={pieData}
              options={{
                ...chartOptions,
                scales: undefined,
              }}
            />
          </ChartCard>
        </motion.div>

      </div>

      {/* AI Insight */}

      <motion.div
        whileHover={{ scale: 1.01 }}
        className="rounded-3xl border border-indigo-500/20 bg-indigo-500/10 p-6 shadow-xl"
      >

        <div className="flex items-center gap-3">

          <MdInsights className="text-3xl text-indigo-400" />

          <div>

            <h2 className="text-xl font-bold text-white">

              AI Insights

            </h2>

            <p className="text-slate-400">

              Automatic Crowd Behaviour Analysis

            </p>

          </div>

        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2">

          <div className="rounded-xl bg-slate-900 p-4">

            📊 Total Risk Events

            <div className="mt-2 text-3xl font-bold text-white">

              {totalRisk}

            </div>

          </div>

          <div className="rounded-xl bg-slate-900 p-4">

            🚨 Highest Risk

            <div className="mt-2 text-3xl font-bold text-red-400">

              {risk.CRITICAL > 0
                ? 'CRITICAL'
                : risk.HIGH > 0
                ? 'HIGH'
                : risk.MEDIUM > 0
                ? 'MEDIUM'
                : 'LOW'}

            </div>

          </div>

        </div>

        <div className="mt-6 rounded-2xl bg-slate-900 p-5">

          <h3 className="font-semibold text-indigo-400">

            🤖 Recommendation

          </h3>

          <ul className="mt-3 space-y-2 text-sm text-slate-300">

            <li>• Continue monitoring high-density zones.</li>

            <li>• Deploy security personnel for critical areas.</li>

            <li>• Monitor abnormal crowd movement.</li>

            <li>• Generate reports after each analysis.</li>

          </ul>

        </div>

      </motion.div>

    </div>
  )
}