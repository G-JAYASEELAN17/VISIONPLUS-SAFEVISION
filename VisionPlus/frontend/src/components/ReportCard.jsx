import {
  MdDownload,
  MdGroups,
  MdAccessTime,
  MdVideoLibrary,
  MdAnalytics,
} from "react-icons/md";
import { motion } from "framer-motion";
import { RiskBadge } from "./AlertCard";

export default function ReportCard({ report, onDownload }) {
  const createdAt = report?.created_at
    ? new Date(report.created_at)
    : null;

  return (
    <motion.div
      whileHover={{
        y: -5,
        scale: 1.01,
      }}
      transition={{ duration: 0.25 }}
      className="rounded-3xl border border-slate-800 bg-gradient-to-br from-[#111827] to-[#0F172A] p-6 shadow-2xl"
    >
      {/* Header */}

      <div className="flex items-center justify-between">

        <div className="flex items-center gap-4">

          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/20">

            <MdVideoLibrary className="text-3xl text-indigo-400" />

          </div>

          <div>

            <h2 className="text-lg font-bold text-white">

              Video #{report.video_id}

            </h2>

            <p className="text-xs text-slate-500">

              Analysis Report

            </p>

          </div>

        </div>

        <RiskBadge level={report.highest_risk} />

      </div>

      {/* Stats */}

      <div className="mt-6 grid grid-cols-3 gap-4">

        <div className="rounded-2xl bg-slate-900 p-4 text-center">

          <MdGroups className="mx-auto mb-2 text-2xl text-cyan-400" />

          <p className="text-xs text-slate-400">

            Maximum

          </p>

          <h3 className="mt-1 text-2xl font-bold text-white">

            {report.maximum_people}

          </h3>

        </div>

        <div className="rounded-2xl bg-slate-900 p-4 text-center">

          <MdAnalytics className="mx-auto mb-2 text-2xl text-emerald-400" />

          <p className="text-xs text-slate-400">

            Average

          </p>

          <h3 className="mt-1 text-2xl font-bold text-white">

            {Number(report.average_people ?? 0).toFixed(1)}

          </h3>

        </div>

        <div className="rounded-2xl bg-slate-900 p-4 text-center">

          <MdAccessTime className="mx-auto mb-2 text-2xl text-orange-400" />

          <p className="text-xs text-slate-400">

            Date

          </p>

          <h3 className="mt-1 text-sm font-semibold text-white">

            {createdAt
              ? createdAt.toLocaleDateString()
              : "--"}

          </h3>

        </div>

      </div>

      {/* AI Summary */}

      <div className="mt-6 rounded-2xl border border-indigo-500/20 bg-indigo-500/10 p-4">

        <h4 className="font-semibold text-indigo-400">

          🤖 AI Summary

        </h4>

        <p className="mt-2 text-sm text-slate-300">

          Crowd analysis completed successfully.

          Highest detected risk level:

          <span className="ml-1 font-semibold text-white">

            {report.highest_risk}

          </span>

          . Maximum crowd density reached

          <span className="mx-1 font-semibold text-cyan-400">

            {report.maximum_people}

          </span>

          people.

        </p>

      </div>

      {/* Footer */}

      <div className="mt-6 flex items-center justify-between">

        <div className="text-xs text-slate-500">

          SafeVision AI Generated Report

        </div>

        <motion.button
          whileHover={{
            scale: 1.05,
          }}
          whileTap={{
            scale: 0.95,
          }}
          onClick={() => onDownload?.(report)}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500"
        >

          <MdDownload />

          Download

        </motion.button>

      </div>

    </motion.div>
  );
}