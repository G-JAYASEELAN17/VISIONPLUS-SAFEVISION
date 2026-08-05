import { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import {
  MdOndemandVideo,
  MdTimeline,
  MdGroups,
  MdWarningAmber,
  MdSmartToy,
  MdSearch,
  MdContentCopy,
  MdFilterList,
} from "react-icons/md";
import toast from "react-hot-toast";

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
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("ALL");

  const activeId = videoId || (videos && videos[0]?.id);

  const fetchInvestigation = useCallback(() => {
    return activeId ? getInvestigation(activeId) : Promise.resolve({ data: {} });
  }, [activeId]);

  const fetchEvents = useCallback(() => {
    return activeId ? getEvents(activeId) : Promise.resolve({ data: [] });
  }, [activeId]);

  const { data: investigation, loading: invLoading } = useFetch(fetchInvestigation, [activeId]);
  const { data: events, loading: eventsLoading } = useFetch(fetchEvents, [activeId]);

  // Filters Events & Timeline
  const filteredEvents = useMemo(() => {
    return (events || []).filter((e) => {
      const matchesSearch = e.event_type.toLowerCase().includes(search.toLowerCase()) || 
                            e.description.toLowerCase().includes(search.toLowerCase());
      const matchesSeverity = severityFilter === "ALL" || e.severity === severityFilter;
      return matchesSearch && matchesSeverity;
    });
  }, [events, search, severityFilter]);

  const timeline = investigation?.timeline || [];

  const totalEvents = events?.length || 0;
  const highRisk =
    events?.filter(
      (e) => e.severity === "HIGH" || e.severity === "CRITICAL"
    ).length || 0;

  // Copy Investigation report data
  const handleCopyDetails = () => {
    if (!investigation) return;
    const reportText = `VisionPlus Safety Investigation Report
Video ID: #${activeId}
Total Capture Logs: ${totalEvents}
High Risk Violations: ${highRisk}
Timeline Frame Points: ${timeline.length}

Events Details:
${(events || []).map(e => `[Frame ${e.frame_number}] [${e.severity}] ${e.event_type}: ${e.description}`).join('\n')}
`;
    navigator.clipboard.writeText(reportText);
    toast.success("Investigation report copied to clipboard!");
  };

  if (!activeId) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-white/5 bg-surface-card py-20 px-10 text-center select-none shadow-2xl">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary mb-4 text-4xl border border-primary/20">
          <MdOndemandVideo />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">No Analysis Data</h2>
        <p className="text-sm text-slate-400 max-w-md">
          There are currently no analyzed video streams available. Upload a video file first to unlock the AI Forensic Investigation tools.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 select-none">
      {/* AI banner header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-indigo-500/20 bg-indigo-500/[0.04] p-6 shadow-2xl backdrop-blur-xl"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/15 border border-indigo-500/25 text-indigo-400 text-2xl">
              <MdSmartToy />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">AI Forensic Investigation</h1>
              <p className="text-sm text-text-muted">Query historical video anomalies, build search queries, and trace target metrics.</p>
            </div>
          </div>
          <button
            onClick={handleCopyDetails}
            className="flex items-center gap-1.5 self-start md:self-center text-xs font-bold text-slate-300 hover:text-white rounded-xl border border-white/10 bg-white/[0.02] px-4 py-2.5 transition"
            title="Copy Report"
            aria-label="Copy report data"
          >
            <MdContentCopy /> <span>Copy Investigation Details</span>
          </button>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-5 shadow-2xl flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Total Triggered Events</span>
            <span className="block mt-2 text-3xl font-black text-white">{totalEvents}</span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center text-xl">
            <MdGroups />
          </div>
        </div>

        <div className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-5 shadow-2xl flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">High/Critical Flags</span>
            <span className={`block mt-2 text-3xl font-black ${highRisk > 0 ? 'text-red-400 animate-pulse' : 'text-slate-300'}`}>{highRisk}</span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-danger/10 border border-danger/20 text-danger flex items-center justify-center text-xl">
            <MdWarningAmber />
          </div>
        </div>

        <div className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-5 shadow-2xl flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Timeline Snapshots</span>
            <span className="block mt-2 text-3xl font-black text-white">{timeline.length}</span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-success/10 border border-success/20 text-success flex items-center justify-center text-xl">
            <MdTimeline />
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        
        {/* Left Side: Video Selector and Event cards */}
        <div className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-5 shadow-2xl flex flex-col gap-4">
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <MdOndemandVideo className="text-primary" />
              <span>Target Source Video</span>
            </h3>
            <select
              value={activeId}
              onChange={(e) => setVideoId(Number(e.target.value))}
              className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-xs text-white outline-none cursor-pointer focus:border-primary/50 transition"
              aria-label="Select source video file"
            >
              {(videos || []).map((v) => (
                <option key={v.id} value={v.id}>
                  {v.filename}
                </option>
              ))}
            </select>
          </div>

          {/* Search/Filters input inside left panel */}
          <div className="space-y-3 pt-3 border-t border-white/5">
            <div className="relative">
              <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-base" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search event type..."
                className="w-full rounded-xl border border-white/10 bg-slate-900/60 py-2 pl-9 pr-4 text-xs text-white placeholder:text-slate-500 outline-none focus:border-primary/50 transition-all"
                aria-label="Search incident reports"
              />
            </div>

            <div className="flex items-center gap-2">
              <MdFilterList className="text-slate-400" />
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="flex-1 rounded-xl border border-white/10 bg-slate-900/60 px-3 py-1.5 text-xs text-white outline-none cursor-pointer focus:border-primary/50 transition-all"
                aria-label="Filter events by severity"
              >
                <option value="ALL">All Severity</option>
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>
          </div>

          <div className="space-y-2 pt-3 border-t border-white/5">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider text-slate-400">Incident Event Cards</h3>
            <div className="space-y-3 overflow-y-auto max-h-[350px] pr-2 scrollbar-thin">
              {eventsLoading ? (
                <PageLoader label="Fetching events..." />
              ) : (
                <>
                  {filteredEvents.length === 0 && (
                    <p className="text-xs text-slate-500 text-center py-6">No incident cards found matching filter.</p>
                  )}
                  {filteredEvents.map((event) => (
                    <motion.div
                      whileHover={{ scale: 1.01 }}
                      key={event.id}
                      className="rounded-2xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] p-4 space-y-2 cursor-pointer transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-white text-xs">{event.event_type}</h4>
                        <RiskBadge level={event.severity} />
                      </div>
                      <p className="text-[11px] text-text-muted leading-relaxed font-medium">{event.description}</p>
                      <div className="text-[10px] text-slate-500 flex justify-between font-semibold">
                        <span>Frame Index: #{event.frame_number}</span>
                        <span>Confidence: {Number(event.confidence || 0.9).toFixed(2)}</span>
                      </div>
                    </motion.div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Timeline Grid & AI Forensic Summary */}
        <div className="xl:col-span-2 space-y-6">
          {/* AI Forensic Diagnosis Summary */}
          <div className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-5 shadow-2xl">
            <h3 className="mb-3 text-sm font-bold text-white flex items-center gap-1.5">
              <MdSmartToy className="text-primary" />
              <span>AI Forensic Summary</span>
            </h3>
            <div className="rounded-2xl bg-white/[0.01] border border-white/5 p-4 text-xs text-slate-300 leading-relaxed font-medium">
              {totalEvents > 0 ? (
                <span>
                  The AI Forensics Engine analyzed Video file #{activeId}. It verified {totalEvents} incident events with {highRisk} flagged as high/critical risk. 
                  Bottlenecks or occupancy surges were highlighted primarily around frames: {events?.filter(e => e.severity === 'CRITICAL' || e.severity === 'HIGH').map(e => `#${e.frame_number}`).slice(0, 5).join(', ') || 'none'}. 
                  Recommendation: review the timeline segments around these frames to verify crowd flow safety compliance.
                </span>
              ) : (
                <span>No incidents cataloged for the active file. Flow parameters are fully compliant.</span>
              )}
            </div>
          </div>

          {/* Grid table showing detail frame timeline */}
          <div className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-5 shadow-2xl">
            <h3 className="mb-4 text-sm font-bold text-white flex items-center gap-1.5">
              <MdTimeline className="text-primary" />
              <span>Live Frame Timeline registers</span>
            </h3>
            {invLoading ? (
              <PageLoader label="Loading timeline records..." />
            ) : (
              <div className="overflow-x-auto max-h-[350px] scrollbar-thin">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 text-slate-500 uppercase font-bold text-[10px]">
                      <th className="p-3">Frame</th>
                      <th className="p-3">People Count</th>
                      <th className="p-3">Vehicle Count</th>
                      <th className="p-3">Confidence</th>
                      <th className="p-3 text-right">Risk Index</th>
                    </tr>
                  </thead>
                  <tbody>
                    {timeline.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-4 text-center text-text-muted">No timeline data available.</td>
                      </tr>
                    )}
                    {timeline.map((item, index) => (
                      <tr
                        key={index}
                        className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="p-3 font-semibold text-white">#{item.frame}</td>
                        <td className="p-3 text-slate-300">{item.people}</td>
                        <td className="p-3 text-slate-300">{item.vehicles ?? 0}</td>
                        <td className="p-3 text-slate-400">{Number(item.confidence || 0).toFixed(2)}</td>
                        <td className="p-3 text-right">
                          <RiskBadge level={item.risk} />
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
    </div>
  );
}