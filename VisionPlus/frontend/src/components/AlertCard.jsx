import {
  MdWarning,
  MdGroups,
  MdAccessTime,
  MdLocationOn,
  MdSmartToy,
} from "react-icons/md";
import { motion } from "framer-motion";

const RISK_STYLES = {
  CRITICAL: {
    badge: "bg-red-500/20 text-red-400 border-red-500/30",
    dot: "bg-red-500",
  },
  HIGH: {
    badge: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    dot: "bg-orange-500",
  },
  MEDIUM: {
    badge: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    dot: "bg-yellow-500",
  },
  LOW: {
    badge: "bg-green-500/20 text-green-400 border-green-500/30",
    dot: "bg-green-500",
  },
};

export function RiskBadge({ level }) {
  const style = RISK_STYLES[level] || RISK_STYLES.LOW;

  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-bold tracking-wide ${style.badge}`}
    >
      {level || "LOW"}
    </span>
  );
}

export default function AlertCard({ alert }) {
  const createdAt = alert?.created_at
    ? new Date(alert.created_at)
    : null;

  const style =
    RISK_STYLES[alert?.risk_level] || RISK_STYLES.LOW;

  return (
    <motion.div
      whileHover={{
        y: -4,
        scale: 1.01,
      }}
      transition={{
        duration: 0.25,
      }}
      className="rounded-3xl border border-slate-800 bg-gradient-to-br from-[#111827] to-[#0F172A] p-5 shadow-2xl"
    >
      {/* Header */}

      <div className="flex items-center justify-between">

        <div className="flex items-center gap-3">

          <div
            className={`flex h-12 w-12 items-center justify-center rounded-2xl ${style.badge}`}
          >
            <MdWarning className="text-2xl" />
          </div>

          <div>

            <div className="flex items-center gap-2">

              <RiskBadge level={alert.risk_level} />

              <span
                className={`h-2 w-2 rounded-full animate-pulse ${style.dot}`}
              ></span>

            </div>

            <h2 className="mt-2 text-lg font-bold text-white">
              {alert.message || "Crowd Alert"}
            </h2>

          </div>

        </div>

        {createdAt && (
          <div className="text-right text-xs text-slate-400">
            <MdAccessTime className="inline mr-1" />
            {createdAt.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        )}

      </div>

      {/* Stats */}

      <div className="mt-5 grid grid-cols-2 gap-4">

        <div className="rounded-2xl bg-slate-900 p-4">

          <div className="flex items-center gap-2 text-cyan-400">

            <MdGroups />

            People

          </div>

          <h3 className="mt-2 text-2xl font-bold text-white">
            {alert.people_count}
          </h3>

        </div>

        <div className="rounded-2xl bg-slate-900 p-4">

          <div className="flex items-center gap-2 text-indigo-400">

            <MdLocationOn />

            Camera

          </div>

          <h3 className="mt-2 text-lg font-semibold text-white">
            Video #{alert.video_id}
          </h3>

        </div>

      </div>

      {/* AI Recommendation */}

      <div className="mt-5 rounded-2xl border border-indigo-500/20 bg-indigo-500/10 p-4">

        <div className="flex items-center gap-2">

          <MdSmartToy className="text-indigo-400" />

          <span className="font-semibold text-indigo-400">
            AI Recommendation
          </span>

        </div>

        <p className="mt-2 text-sm text-slate-300">

          {alert.risk_level === "CRITICAL"
            ? "Immediate response required. Dispatch security personnel and monitor the affected zone continuously."
            : alert.risk_level === "HIGH"
            ? "Crowd density is increasing. Increase monitoring and prepare intervention."
            : alert.risk_level === "MEDIUM"
            ? "Maintain surveillance. Monitor crowd movement for further escalation."
            : "Situation is stable. Continue routine monitoring."}

        </p>

      </div>

      {/* Footer */}

      <div className="mt-5 flex items-center justify-between border-t border-slate-800 pt-4">

        <span className="text-xs text-slate-500">
          Frame #{alert.frame_number}
        </span>

        <span className="text-xs font-semibold text-green-400">
          ● Live Detection
        </span>

      </div>

    </motion.div>
  );
}