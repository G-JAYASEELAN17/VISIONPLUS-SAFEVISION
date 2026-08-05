import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import {
  MdDashboard,
  MdVideocam,
  MdCloudUpload,
  MdDescription,
  MdWarningAmber,
  MdBarChart,
  MdManageSearch,
  MdSettings,
  MdShield,
  MdStorage,
  MdMemory,
  MdCircle,
  MdSmartToy,
} from "react-icons/md";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: MdDashboard },
  { to: "/chatbot", label: "AI Assistant", icon: MdSmartToy },
  { to: "/live-monitoring", label: "Live Monitoring", icon: MdVideocam },
  { to: "/upload", label: "Upload Video", icon: MdCloudUpload },
  { to: "/reports", label: "Reports", icon: MdDescription },
  { to: "/alerts", label: "Alerts", icon: MdWarningAmber },
  { to: "/analytics", label: "Analytics", icon: MdBarChart },
  { to: "/investigation", label: "Investigation", icon: MdManageSearch },
  { to: "/settings", label: "Settings", icon: MdSettings },
];

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {/* Mobile Overlay */}

      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-800 bg-[#0B1120] transition-transform duration-300 lg:static lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}

        <div className="border-b border-slate-800 px-6 py-6">

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-4"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-cyan-500 shadow-lg">

              <MdShield className="text-2xl text-white" />

            </div>

            <div>

              <h1 className="text-xl font-bold text-white">
                SafeVision AI
              </h1>

              <p className="text-xs text-slate-400">
                Crowd Intelligence Platform
              </p>

            </div>

          </motion.div>

        </div>

        {/* Navigation */}

        <nav className="flex-1 space-y-2 overflow-y-auto px-4 py-6">

          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
            >
              {({ isActive }) => (
                <motion.div
                  whileHover={{
                    x: 6,
                  }}
                  whileTap={{
                    scale: 0.98,
                  }}
                  className={`group flex items-center justify-between rounded-2xl px-4 py-3 transition-all duration-300 ${
                    isActive
                      ? "bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-lg"
                      : "text-slate-400 hover:bg-slate-900 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">

                    <Icon className="text-xl" />

                    <span className="font-medium">
                      {label}
                    </span>

                  </div>

                  {isActive && (
                    <MdCircle className="animate-pulse text-xs text-white" />
                  )}

                </motion.div>
              )}
            </NavLink>
          ))}

        </nav>

        {/* AI Status */}

        <div className="mx-4 mb-4 rounded-2xl border border-slate-800 bg-slate-900 p-4">

          <div className="mb-3 flex items-center justify-between">

            <h3 className="font-semibold text-white">
              AI Engine
            </h3>

            <span className="flex items-center gap-1 text-green-400">

              <span className="h-2 w-2 animate-pulse rounded-full bg-green-500"></span>

              Online

            </span>

          </div>

          <div className="space-y-3 text-sm">

            <div className="flex items-center justify-between">

              <span className="flex items-center gap-2 text-slate-400">

                <MdMemory />

                YOLO Model

              </span>

              <span className="text-white">
                Active
              </span>

            </div>

            <div className="flex items-center justify-between">

              <span className="flex items-center gap-2 text-slate-400">

                <MdStorage />

                Database

              </span>

              <span className="text-green-400">
                Connected
              </span>

            </div>

          </div>

        </div>

        {/* Footer */}

        <div className="border-t border-slate-800 px-6 py-5">

          <p className="text-xs text-slate-500">
            SafeVision AI
          </p>

          <p className="mt-1 text-xs text-slate-600">
            Enterprise Edition • v1.0.0
          </p>

        </div>

      </aside>
    </>
  );
}