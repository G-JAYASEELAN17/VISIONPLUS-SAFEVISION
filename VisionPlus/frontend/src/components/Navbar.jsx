import {
  MdMenu,
  MdNotificationsNone,
  MdLogout,
  MdSearch,
  MdSmartToy,
  MdDarkMode,
  MdLightMode,
} from "react-icons/md";
import { motion } from "framer-motion";
import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import NotificationPanel from "../components/NotificationPanel";

const TITLES = {
  "/dashboard": "Dashboard",
  "/live-monitoring": "Live Monitoring",
  "/upload": "Upload Video",
  "/reports": "Reports",
  "/alerts": "Alerts",
  "/analytics": "Analytics",
  "/investigation": "Investigation",
  "/settings": "Settings",
};

export default function Navbar({ onMenuClick, pathname }) {
  const { user, logout } = useAuth();

  const title = TITLES[pathname] || "SafeVision AI";

  const displayName =
    user?.full_name ||
    user?.email ||
    "Administrator";

  const initials = displayName
    .charAt(0)
    .toUpperCase();

  const [dark, setDark] = useState(true);

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between border-b border-slate-800 bg-[#0B1120]/95 px-6 py-4 backdrop-blur-xl">

      {/* LEFT */}

      <div className="flex items-center gap-4">

        <button
          onClick={onMenuClick}
          className="rounded-xl p-2 text-slate-300 transition hover:bg-slate-800 lg:hidden"
        >
          <MdMenu className="text-2xl" />
        </button>

        <div>

          <p className="text-xs uppercase tracking-widest text-slate-500">
            SafeVision AI
          </p>

          <h1 className="text-2xl font-bold text-white">
            {title}
          </h1>

        </div>

      </div>

      {/* CENTER */}

      <motion.div
        whileHover={{ scale: 1.02 }}
        className="hidden w-[420px] items-center rounded-2xl border border-slate-700 bg-slate-900 px-4 py-2 lg:flex"
      >

        <MdSearch className="mr-3 text-xl text-slate-500" />

        <input
          placeholder="Search cameras, reports, analytics..."
          className="w-full bg-transparent text-white outline-none placeholder:text-slate-500"
        />

      </motion.div>

      {/* RIGHT */}

      <div className="flex items-center gap-4">

        {/* LIVE */}

        <div className="hidden items-center gap-2 rounded-full bg-green-500/10 px-3 py-1 lg:flex">

          <span className="h-2 w-2 animate-pulse rounded-full bg-green-500"></span>

          <span className="text-xs font-semibold text-green-400">
            LIVE
          </span>

        </div>

        {/* AI */}

        <motion.button
          whileHover={{ scale: 1.05 }}
          className="rounded-xl bg-indigo-600 p-2 text-white transition hover:bg-indigo-500"
          title="AI Assistant"
        >
          <MdSmartToy className="text-2xl" />
        </motion.button>

        {/* Notifications */}

        <NotificationPanel />

        {/* Theme */}

        <button
          onClick={() => setDark(!dark)}
          className="rounded-xl bg-slate-900 p-2 text-slate-300 transition hover:bg-slate-800"
        >
          {dark ? (
            <MdLightMode className="text-xl" />
          ) : (
            <MdDarkMode className="text-xl" />
          )}
        </button>

        {/* User */}

        <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900 px-3 py-2">

          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 text-lg font-bold text-white shadow-lg">

            {initials}

          </div>

          <div className="hidden lg:block">

            <p className="font-semibold text-white">
              {displayName}
            </p>

            <p className="text-xs text-slate-400">
              {user?.role || "Administrator"}
            </p>

          </div>

        </div>

        {/* Logout */}

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={logout}
          className="rounded-xl bg-red-500/10 p-2 text-red-400 transition hover:bg-red-500 hover:text-white"
        >

          <MdLogout className="text-2xl" />

        </motion.button>

      </div>

    </header>
  );
}