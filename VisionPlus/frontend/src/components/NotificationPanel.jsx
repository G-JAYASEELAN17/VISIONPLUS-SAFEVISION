import { useState, useEffect, useCallback, useMemo } from "react";
import {
  MdNotifications,
  MdWarning,
  MdCheckCircle,
  MdErrorOutline,
  MdClose,
  MdDoneAll,
  MdSearch,
} from "react-icons/md";
import { motion, AnimatePresence } from "framer-motion";
import {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationRead,
  markAllNotificationsRead,
} from "../services/api";

function timeAgo(dateString) {
  if (!dateString) return '';
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now - date) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

const getIcon = (level) => {
  switch (level) {
    case "CRITICAL":
    case "HIGH":
      return <MdWarning className="text-lg text-red-400" />;
    case "MEDIUM":
      return <MdErrorOutline className="text-lg text-yellow-400" />;
    default:
      return <MdCheckCircle className="text-lg text-green-400" />;
  }
};

const getBorderColor = (level) => {
  switch (level) {
    case "CRITICAL":
      return "border-l-4 border-l-red-500 border-white/[0.08]";
    case "HIGH":
      return "border-l-4 border-l-orange-500 border-white/[0.08]";
    case "MEDIUM":
      return "border-l-4 border-l-yellow-500 border-white/[0.08]";
    default:
      return "border-l-4 border-l-green-500 border-white/[0.08]";
  }
};

export default function NotificationPanel() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("ALL"); // ALL, UNREAD, CRITICAL

  const refresh = useCallback(async () => {
    try {
      const [listRes, countRes] = await Promise.all([
        getNotifications(false),
        getUnreadNotificationCount(),
      ]);
      setNotifications(listRes.data || []);
      setUnreadCount(countRes.data?.unread_count ?? 0);
    } catch {
      // Keep last known state on error
    }
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 20000);
    return () => clearInterval(interval);
  }, [refresh]);

  const handleOpen = async () => {
    setOpen(true);
    setLoading(true);
    await refresh();
    setLoading(false);
  };

  const handleMarkRead = async (id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    setUnreadCount((c) => Math.max(0, c - 1));
    try {
      await markNotificationRead(id);
    } catch {
      refresh();
    }
  };

  const handleMarkAll = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
    try {
      await markAllNotificationsRead();
    } catch {
      refresh();
    }
  };

  // Filtered notifications
  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            n.message.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterType === "ALL" || 
                            (filterType === "UNREAD" && !n.is_read) ||
                            (filterType === "CRITICAL" && (n.level === "CRITICAL" || n.level === "HIGH"));
      return matchesSearch && matchesFilter;
    });
  }, [notifications, searchQuery, filterType]);

  return (
    <>
      <button
        onClick={handleOpen}
        className="relative rounded-xl p-2 hover:bg-white/10 transition-colors"
        aria-label="Open notifications center"
      >
        <MdNotifications className="text-2xl text-white" />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Overlay backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-[#02040a]/60 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />

            {/* Sidebar drawer panel */}
            <motion.div
              initial={{ x: 384 }}
              animate={{ x: 0 }}
              exit={{ x: 384 }}
              className="fixed right-0 top-0 z-50 h-screen w-96 bg-slate-900 border-l border-white/10 shadow-2xl flex flex-col justify-between"
              role="dialog"
              aria-modal="true"
              aria-label="Notifications panel"
            >
              {/* Drawer Header */}
              <div className="border-b border-white/5 p-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-white">Security Alerts</h2>
                  <div className="flex items-center gap-1.5">
                    {notifications.length > 0 && (
                      <button
                        onClick={handleMarkAll}
                        title="Mark all as read"
                        className="rounded-xl p-2 text-slate-400 hover:bg-white/5 hover:text-white transition"
                        aria-label="Mark all notifications as read"
                      >
                        <MdDoneAll className="text-lg" />
                      </button>
                    )}
                    <button
                      onClick={() => setOpen(false)}
                      className="rounded-xl p-2 text-slate-400 hover:bg-white/5 hover:text-white transition"
                      aria-label="Close notifications panel"
                    >
                      <MdClose className="text-xl" />
                    </button>
                  </div>
                </div>

                {/* Filter and Search options */}
                <div className="mt-4 space-y-3">
                  <div className="relative">
                    <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-base" />
                    <input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search notifications..."
                      className="w-full rounded-xl border border-white/10 bg-slate-950 py-2 pl-9 pr-4 text-xs text-white placeholder:text-slate-500 outline-none focus:border-primary/50 transition-all"
                      aria-label="Search notifications"
                    />
                  </div>

                  <div className="flex gap-1.5 text-[10px] font-bold uppercase tracking-wider">
                    <button
                      onClick={() => setFilterType("ALL")}
                      className={`flex-1 text-center py-1.5 rounded-lg border transition ${filterType === "ALL" ? "bg-primary border-primary text-white" : "border-white/10 text-slate-400 hover:text-white bg-white/[0.01]"}`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setFilterType("UNREAD")}
                      className={`flex-1 text-center py-1.5 rounded-lg border transition ${filterType === "UNREAD" ? "bg-primary border-primary text-white" : "border-white/10 text-slate-400 hover:text-white bg-white/[0.01]"}`}
                    >
                      Unread
                    </button>
                    <button
                      onClick={() => setFilterType("CRITICAL")}
                      className={`flex-1 text-center py-1.5 rounded-lg border transition ${filterType === "CRITICAL" ? "bg-primary border-primary text-white" : "border-white/10 text-slate-400 hover:text-white bg-white/[0.01]"}`}
                    >
                      Critical
                    </button>
                  </div>
                </div>
              </div>

              {/* Notification Cards List Container */}
              <div className="flex-1 overflow-y-auto p-5 space-y-3 scrollbar-thin">
                {loading ? (
                  // Pulse skeletons
                  <div className="space-y-3">
                    {[1, 2, 3].map((v) => (
                      <div key={v} className="animate-pulse rounded-2xl border border-white/5 bg-white/[0.01] p-4 space-y-2">
                        <div className="h-4 bg-white/10 rounded w-1/3" />
                        <div className="h-3 bg-white/5 rounded w-full" />
                        <div className="h-2 bg-white/5 rounded w-1/4" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    {filteredNotifications.length === 0 && (
                      <p className="text-xs text-text-muted py-12 text-center">
                        No notifications match search constraints.
                      </p>
                    )}
                    {filteredNotifications.map((n) => (
                      <motion.div
                        whileHover={{ scale: 1.01 }}
                        key={n.id}
                        onClick={() => !n.is_read && handleMarkRead(n.id)}
                        className={`w-full text-left rounded-2xl border p-4 transition-all flex gap-3 cursor-pointer ${getBorderColor(n.level)} ${
                          n.is_read
                            ? "bg-slate-950/20 opacity-60 hover:opacity-80"
                            : "bg-white/[0.02] hover:bg-white/[0.04]"
                        }`}
                      >
                        <div className="mt-0.5 shrink-0">{getIcon(n.level)}</div>
                        <div className="flex-1 space-y-1">
                          <div className="flex justify-between items-start">
                            <h3 className="font-bold text-white text-xs">{n.title}</h3>
                            {!n.is_read && <span className="h-1.5 w-1.5 rounded-full bg-primary-light shrink-0 ml-1.5 mt-1" />}
                          </div>
                          <p className="text-[11px] text-slate-400 leading-relaxed font-medium">{n.message}</p>
                          <span className="block text-[9px] font-semibold text-slate-500 uppercase tracking-widest pt-1">
                            {timeAgo(n.created_at)}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
