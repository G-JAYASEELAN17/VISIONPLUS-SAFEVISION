import { useState, useEffect, useCallback } from "react";
import {
  MdNotifications,
  MdWarning,
  MdCheckCircle,
  MdErrorOutline,
  MdClose,
  MdDoneAll,
} from "react-icons/md";
import { motion, AnimatePresence } from "framer-motion";
import {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationRead,
  markAllNotificationsRead,
} from "../services/api";

// Previously this component rendered 3 hardcoded fake notifications with no
// backend call at all. Now backed by the real Notification Center API
// (app/api/notifications.py + app/models/notification.py), which is
// populated whenever a HIGH/CRITICAL risk alert fires during analysis.

const icon = (level) => {
  switch (level) {
    case "CRITICAL":
    case "HIGH":
      return <MdWarning className="text-xl text-red-500" />;
    case "MEDIUM":
      return <MdErrorOutline className="text-xl text-yellow-500" />;
    default:
      return <MdCheckCircle className="text-xl text-green-500" />;
  }
};

export default function NotificationPanel() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const [listRes, countRes] = await Promise.all([
        getNotifications(false),
        getUnreadNotificationCount(),
      ]);
      setNotifications(listRes.data || []);
      setUnreadCount(countRes.data?.unread_count ?? 0);
    } catch {
      // Backend unreachable — leave last-known state rather than crashing
      // the navbar.
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
      refresh(); // reconcile with server on failure
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

  return (
    <>
      <button
        onClick={handleOpen}
        className="relative rounded-full p-2 hover:bg-white/10"
      >
        <MdNotifications className="text-2xl text-white" />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setOpen(false)}
            />

            <motion.div
              initial={{ x: 350 }}
              animate={{ x: 0 }}
              exit={{ x: 350 }}
              className="fixed right-0 top-0 z-50 h-screen w-96 bg-surface-card shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-surface-border p-5">
                <h2 className="text-xl font-bold text-white">Notifications</h2>
                <div className="flex items-center gap-2">
                  {notifications.length > 0 && (
                    <button
                      onClick={handleMarkAll}
                      title="Mark all as read"
                      className="rounded-full p-1.5 text-slate-400 hover:bg-white/10 hover:text-white"
                    >
                      <MdDoneAll className="text-lg" />
                    </button>
                  )}
                  <button onClick={() => setOpen(false)}>
                    <MdClose className="text-2xl text-white" />
                  </button>
                </div>
              </div>

              <div className="space-y-3 overflow-y-auto p-5" style={{ maxHeight: "calc(100vh - 80px)" }}>
                {loading && (
                  <p className="text-sm text-slate-500">Loading…</p>
                )}
                {!loading && notifications.length === 0 && (
                  <p className="text-sm text-slate-500">
                    No notifications yet — they appear here automatically when a
                    HIGH or CRITICAL risk alert fires during video analysis.
                  </p>
                )}
                {notifications.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => !n.is_read && handleMarkRead(n.id)}
                    className={`w-full rounded-2xl p-4 text-left transition ${
                      n.is_read ? "bg-surface-elevated/50 opacity-60" : "bg-surface-elevated"
                    }`}
                  >
                    <div className="flex gap-3">
                      {icon(n.level)}
                      <div className="flex-1">
                        <h3 className="font-semibold text-white">{n.title}</h3>
                        <p className="mt-1 text-sm text-slate-400">{n.message}</p>
                        <p className="mt-2 text-xs text-slate-500">
                          {n.created_at ? new Date(n.created_at).toLocaleString() : ""}
                          {!n.is_read && <span className="ml-2 text-primary-light">• unread</span>}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
