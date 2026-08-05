import { motion } from "framer-motion";
import CountUp from "react-countup";
import {
  MdTrendingUp,
  MdArrowForward,
} from "react-icons/md";

const COLOR_MAP = {
  primary: {
    bg: "from-indigo-500/20 to-indigo-700/10",
    icon: "bg-indigo-500/20 text-indigo-400",
    border: "hover:border-indigo-500/40",
    glow: "hover:shadow-indigo-500/20",
  },
  success: {
    bg: "from-emerald-500/20 to-emerald-700/10",
    icon: "bg-emerald-500/20 text-emerald-400",
    border: "hover:border-emerald-500/40",
    glow: "hover:shadow-emerald-500/20",
  },
  danger: {
    bg: "from-red-500/20 to-red-700/10",
    icon: "bg-red-500/20 text-red-400",
    border: "hover:border-red-500/40",
    glow: "hover:shadow-red-500/20",
  },
  warning: {
    bg: "from-yellow-500/20 to-yellow-700/10",
    icon: "bg-yellow-500/20 text-yellow-400",
    border: "hover:border-yellow-500/40",
    glow: "hover:shadow-yellow-500/20",
  },
  info: {
    bg: "from-cyan-500/20 to-cyan-700/10",
    icon: "bg-cyan-500/20 text-cyan-400",
    border: "hover:border-cyan-500/40",
    glow: "hover:shadow-cyan-500/20",
  },
};

export default function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  color = "primary",
}) {
  const theme = COLOR_MAP[color];

  return (
    <motion.div
      whileHover={{
        y: -6,
        scale: 1.02,
      }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.25 }}
      className={`relative overflow-hidden rounded-3xl border border-surface-border bg-gradient-to-br ${theme.bg} p-6 shadow-xl backdrop-blur-lg ${theme.border} ${theme.glow} transition-all duration-300`}
    >
      {/* Decorative Blur */}
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/5 blur-3xl" />

      <div className="relative flex items-center justify-between">
        <div>
          <p className="text-sm font-medium tracking-wide text-slate-400 uppercase">
            {label}
          </p>

          <h2 className="mt-3 text-4xl font-extrabold text-white">
            <CountUp
              end={Number(value) || 0}
              duration={2}
              separator=","
            />
          </h2>

          <div className="mt-3 flex items-center gap-2">
            <MdTrendingUp className="text-emerald-400" />

            <span className="text-xs font-medium text-emerald-400">
              Live Updating
            </span>
          </div>

          {hint && (
            <p className="mt-2 text-xs text-slate-500">
              {hint}
            </p>
          )}
        </div>

        {Icon && (
          <div
            className={`flex h-16 w-16 items-center justify-center rounded-2xl ${theme.icon}`}
          >
            <Icon className="text-3xl" />
          </div>
        )}
      </div>

      {/* Bottom Line */}

      <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-4">
        <span className="text-xs text-slate-500">
          Updated just now
        </span>

        <MdArrowForward className="text-lg text-slate-400 transition group-hover:translate-x-1" />
      </div>
    </motion.div>
  );
}