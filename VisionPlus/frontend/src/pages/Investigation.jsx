import { useState } from "react";
import { motion } from "framer-motion";
import {
  MdOndemandVideo,
  MdTimeline,
  MdGroups,
  MdWarningAmber,
  MdSmartToy,
} from "react-icons/md";

import { RiskBadge } from "../components/AlertCard";
import { PageLoader } from "../components/Loader";
import { useFetch } from "../hooks/useFetch";
import {
  getVideos,
  getInvestigation,
  getEvents,
} from "../services/api";

export default function Investigation() {
  const { data: videos } = useFetch(getVideos, []);

  const [videoId, setVideoId] = useState(null);

  const activeId = videoId || (videos && videos[0]?.id);

  const { data: investigation, loading: invLoading } =
    useFetch(() => getInvestigation(activeId), [activeId]);

  const { data: events, loading: eventsLoading } =
    useFetch(() => getEvents(activeId), [activeId]);

  if (!activeId) {
    return (
      <div className="rounded-3xl bg-surface-card p-10 text-center text-slate-400">
        No analyzed videos available.
      </div>
    );
  }

  const timeline = investigation?.timeline || [];

  const totalEvents = events?.length || 0;

  const highRisk =
    events?.filter(
      (e) =>
        e.severity === "HIGH" ||
        e.severity === "CRITICAL"
    ).length || 0;

  return (
    <div className="space-y-6">

      {/* Header */}

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-primary/20 bg-primary/10 p-6"
      >
        <div className="flex items-center gap-4">

          <MdSmartToy className="text-5xl text-primary-light" />

          <div>

            <h1 className="text-3xl font-bold text-white">
              AI Investigation Center
            </h1>

            <p className="mt-2 text-slate-400">
              Review crowd incidents, AI detections and
              investigation timeline.
            </p>

          </div>

        </div>

      </motion.div>

      {/* KPI */}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

        <div className="rounded-2xl bg-surface-card p-5">

          <div className="flex items-center gap-2">

            <MdGroups className="text-2xl text-primary-light" />

            <span className="text-slate-400">
              Events
            </span>

          </div>

          <h2 className="mt-3 text-3xl font-bold text-white">
            {totalEvents}
          </h2>

        </div>

        <div className="rounded-2xl bg-surface-card p-5">

          <div className="flex items-center gap-2">

            <MdWarningAmber className="text-2xl text-danger" />

            <span className="text-slate-400">
              High Risk
            </span>

          </div>

          <h2 className="mt-3 text-3xl font-bold text-danger">
            {highRisk}
          </h2>

        </div>

        <div className="rounded-2xl bg-surface-card p-5">

          <div className="flex items-center gap-2">

            <MdTimeline className="text-2xl text-success" />

            <span className="text-slate-400">
              Frames
            </span>

          </div>

          <h2 className="mt-3 text-3xl font-bold text-white">
            {timeline.length}
          </h2>

        </div>

      </div>

      {/* Main */}

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">

        {/* Left */}

        <div className="rounded-3xl bg-surface-card p-5">

          <h3 className="mb-4 flex items-center gap-2 font-semibold text-white">

            <MdOndemandVideo />

            Select Video

          </h3>

          <select
            value={activeId}
            onChange={(e) =>
              setVideoId(Number(e.target.value))
            }
            className="mb-5 w-full rounded-xl bg-surface-elevated p-3 text-white"
          >
            {(videos || []).map((v) => (
              <option key={v.id} value={v.id}>
                {v.filename}
              </option>
            ))}
          </select>

          <h3 className="mb-3 font-semibold text-white">
            AI Events
          </h3>

          {eventsLoading ? (
            <PageLoader />
          ) : (
            <div className="space-y-3">

              {(events || []).map((event) => (

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  key={event.id}
                  className="rounded-xl border border-surface-border bg-surface-elevated p-4"
                >

                  <div className="flex items-center justify-between">

                    <h4 className="font-semibold text-white">
                      {event.event_type}
                    </h4>

                    <RiskBadge
                      level={event.severity}
                    />

                  </div>

                  <p className="mt-2 text-sm text-slate-400">
                    {event.description}
                  </p>

                  <p className="mt-2 text-xs text-slate-500">
                    Frame {event.frame_number}
                  </p>

                </motion.div>

              ))}

            </div>
          )}

        </div>

        {/* Right */}

        <div className="xl:col-span-2 rounded-3xl bg-surface-card p-5">

          <h3 className="mb-5 text-xl font-bold text-white">
            Detection Timeline
          </h3>

          {invLoading ? (
            <PageLoader />
          ) : (
            <div className="overflow-auto">

              <table className="w-full">

                <thead>

                  <tr className="border-b border-surface-border text-left text-slate-400">

                    <th className="p-3">
                      Frame
                    </th>

                    <th className="p-3">
                      People
                    </th>

                    <th className="p-3">
                      Vehicles
                    </th>

                    <th className="p-3">
                      Risk
                    </th>

                    <th className="p-3">
                      Confidence
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {timeline.map((item, index) => (

                    <tr
                      key={index}
                      className="border-b border-surface-border/40 hover:bg-white/5"
                    >

                      <td className="p-3">
                        {item.frame}
                      </td>

                      <td className="p-3">
                        {item.people}
                      </td>

                      <td className="p-3">
                        {item.vehicles ?? 0}
                      </td>

                      <td className="p-3">
                        <RiskBadge
                          level={item.risk}
                        />
                      </td>

                      <td className="p-3">
                        {Number(
                          item.confidence
                        ).toFixed(2)}
                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}