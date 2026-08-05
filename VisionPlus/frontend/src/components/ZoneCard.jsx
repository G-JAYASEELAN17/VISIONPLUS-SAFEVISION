import { motion } from "framer-motion";
import {
  MdGroups,
  MdWarning,
  MdTrendingUp,
} from "react-icons/md";

export default function ZoneCard({ zones = {} }) {
  const entries = Object.entries(zones);

  const totalPeople = entries.reduce(
    (sum, [, count]) => sum + count,
    0
  );

  const maxCount = Math.max(...entries.map(([, c]) => c), 1);

  const getColor = (count) => {
    if (count < 5)
      return {
        bg: "bg-green-500",
        text: "text-green-400",
      };

    if (count < 10)
      return {
        bg: "bg-yellow-500",
        text: "text-yellow-400",
      };

    if (count < 20)
      return {
        bg: "bg-orange-500",
        text: "text-orange-400",
      };

    return {
      bg: "bg-red-500",
      text: "text-red-400",
    };
  };

  return (
    <div className="rounded-3xl border border-slate-800 bg-[#111827] p-6 shadow-2xl">

      {/* Header */}

      <div className="mb-6 flex items-center justify-between">

        <div>

          <h2 className="text-lg font-bold text-white">
            Zone Analytics
          </h2>

          <p className="text-xs text-slate-400">
            Live Crowd Density
          </p>

        </div>

        <MdGroups className="text-3xl text-indigo-400" />

      </div>

      {/* Summary */}

      <div className="mb-6 rounded-2xl bg-slate-900 p-4">

        <div className="flex items-center justify-between">

          <span className="text-slate-400">
            Total People
          </span>

          <span className="text-3xl font-bold text-white">
            {totalPeople}
          </span>

        </div>

      </div>

      {/* Zone List */}

      <div className="space-y-5">

        {entries.length === 0 && (
          <p className="text-slate-500">
            No Zone Data
          </p>
        )}

        {entries.map(([zone, count]) => {

          const color = getColor(count);

          return (

            <motion.div
              key={zone}
              whileHover={{
                scale: 1.02,
              }}
              className="rounded-2xl bg-slate-900 p-4"
            >

              <div className="mb-2 flex items-center justify-between">

                <div className="flex items-center gap-2">

                  <span
                    className={`h-3 w-3 rounded-full ${color.bg}`}
                  ></span>

                  <span className="font-medium text-white">
                    {zone}
                  </span>

                </div>

                <span className={`font-bold ${color.text}`}>
                  {count}
                </span>

              </div>

              {/* Progress */}

              <div className="h-3 overflow-hidden rounded-full bg-slate-700">

                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${(count / maxCount) * 100}%`,
                  }}
                  transition={{
                    duration: 1,
                  }}
                  className={`${color.bg} h-full`}
                />

              </div>

              <div className="mt-3 flex items-center justify-between text-xs">

                <span className="flex items-center gap-1 text-slate-400">

                  <MdTrendingUp />

                  Density

                </span>

                <span className={color.text}>

                  {count < 5
                    ? "LOW"
                    : count < 10
                    ? "MEDIUM"
                    : count < 20
                    ? "HIGH"
                    : "CRITICAL"}

                </span>

              </div>

            </motion.div>

          );

        })}

      </div>

      {/* Footer */}

      <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4">

        <div className="flex items-center gap-2">

          <MdWarning className="text-red-400" />

          <span className="font-semibold text-red-400">
            AI Recommendation
          </span>

        </div>

        <p className="mt-2 text-sm text-slate-300">

          Monitor the zone with the highest density.
          Deploy security personnel if crowd
          growth continues.

        </p>

      </div>

    </div>
  );
}