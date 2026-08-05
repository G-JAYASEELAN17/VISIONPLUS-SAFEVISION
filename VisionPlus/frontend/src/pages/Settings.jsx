import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CountUp from "react-countup";
import toast from "react-hot-toast";
import {
  MdAdd,
  MdDelete,
  MdEdit,
  MdSecurity,
  MdStorage,
  MdNotificationsActive,
  MdSettingsSuggest,
  MdPerson,
  MdDns,
  MdCircle,
  MdContentCopy,
  MdInfoOutline,
} from "react-icons/md";

import { useAuth } from "../hooks/useAuth";
import { useFetch } from "../hooks/useFetch";
import {
  getCameras,
  addCamera,
  deleteCamera,
} from "../services/api";

import { PageLoader, Spinner } from "../components/Loader";

const TABS = ["Profile", "Cameras", "Notifications", "System"];

export default function Settings() {
  const { user } = useAuth();
  const { data: cameras, loading, refetch } = useFetch(getCameras, []);
  const [tab, setTab] = useState("Profile");

  return (
    <div className="space-y-6 select-none">
      {/* Title Header */}
      <div className="flex flex-col gap-1.5 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">System Configurations</h1>
          <p className="text-sm text-text-muted">Manage active camera devices, user profiles, alert rules, and telemetry controls.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-5 shadow-2xl flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Access Role</span>
            <span className="block mt-2 text-xl font-black text-white capitalize">{user?.role || "Admin"}</span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center text-xl">
            <MdSecurity />
          </div>
        </div>

        <div className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-5 shadow-2xl flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Cataloged Feeds</span>
            <span className="block mt-2 text-2xl font-black text-white">
              <CountUp end={cameras?.length || 0} />
            </span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-success/10 border border-success/20 text-success flex items-center justify-center text-xl">
            <MdStorage />
          </div>
        </div>

        <div className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-5 shadow-2xl flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Status Center</span>
            <span className="block mt-2 text-xl font-black text-green-400">ON</span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-warning/10 border border-warning/20 text-warning flex items-center justify-center text-xl">
            <MdNotificationsActive />
          </div>
        </div>

        <div className="rounded-3xl border border-white/[0.08] bg-white/[0.02] p-5 shadow-2xl flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">AI Diagnostics</span>
            <span className="block mt-2 text-xl font-black text-primary-light">READY</span>
          </div>
          <div className="h-10 w-10 rounded-xl bg-info/10 border border-info/20 text-info flex items-center justify-center text-xl">
            <MdSettingsSuggest />
          </div>
        </div>
      </div>

      {/* Tabs Container */}
      <div className="rounded-3xl border border-white/[0.08] bg-white/[0.02] shadow-2xl overflow-hidden">
        <div className="flex gap-2 border-b border-white/5 p-4 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                tab === t
                  ? "bg-primary text-white shadow-lg"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
              aria-label={`Open ${t} tab`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="p-6">
          {tab === "Profile" && <ProfileTab user={user} />}
          {tab === "Cameras" && (
            <CamerasTab cameras={cameras} loading={loading} refetch={refetch} />
          )}
          {tab === "Notifications" && <NotificationsTab />}
          {tab === "System" && <SystemTab cameras={cameras} />}
        </div>
      </div>
    </div>
  );
}

function ProfileTab({ user }) {
  const [fullName, setFullName] = useState(user?.full_name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const displayName = fullName || email || "Administrator";
  const userInitials = displayName.charAt(0).toUpperCase();

  const handleSaveProfile = async () => {
    if (!fullName || !email) {
      toast.error("Full name and Email cannot be blank!");
      return;
    }
    setSaving(true);
    // Simulate updating API
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSaving(false);
    toast.success("Profile records updated successfully!");
  };

  const handleReset = () => {
    setFullName(user?.full_name || "");
    setEmail(user?.email || "");
    setPassword("");
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Left side: Profile card details */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-white/5 bg-slate-950/40 p-6 flex flex-col items-center justify-between"
      >
        <div className="w-full text-center space-y-4">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 text-3xl font-black text-white shadow-xl">
            {userInitials}
          </div>
          <div>
            <h2 className="text-base font-bold text-white leading-tight">{displayName}</h2>
            <p className="text-xs text-text-muted mt-0.5">{email}</p>
          </div>

          <div className="rounded-xl border border-white/5 bg-white/[0.01] p-3 text-left space-y-2">
            <div className="flex justify-between text-[11px]">
              <span className="text-text-muted">Account Role:</span>
              <span className="font-bold text-primary-light uppercase tracking-wider">{user?.role || "Administrator"}</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-text-muted">Status:</span>
              <span className="font-bold text-success">Active</span>
            </div>
          </div>
        </div>

        {/* Session details */}
        <div className="w-full border-t border-white/5 pt-4 mt-6 text-[10px] text-text-muted space-y-1">
          <span className="font-bold uppercase tracking-wider block text-slate-400 mb-1.5">Session Credentials</span>
          <div>Terminal: <span className="font-semibold text-slate-300">VISIONPLUS-DESKTOP</span></div>
          <div>IP Location: <span className="font-semibold text-slate-300">127.0.0.1 (Localhost)</span></div>
          <div>Authorization: <span className="font-semibold text-slate-300">Bearer Token (JWT)</span></div>
        </div>
      </motion.div>

      {/* Right side: Input Form details */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="lg:col-span-2 rounded-2xl border border-white/5 bg-slate-950/40 p-6 space-y-5"
      >
        <h2 className="text-sm font-bold text-white uppercase tracking-wider">Account Information</h2>
        
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Full Name</label>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-xs text-white outline-none focus:border-primary/50 transition"
              aria-label="Full Name"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Email Address</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-xs text-white outline-none focus:border-primary/50 transition"
              aria-label="Email"
            />
          </div>

          <div className="md:col-span-2 space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Update Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter new account password..."
              className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-xs text-white outline-none focus:border-primary/50 transition"
              aria-label="New Password"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-2.5 pt-2">
          <button
            onClick={handleSaveProfile}
            disabled={saving}
            className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-white hover:bg-primary-dark transition disabled:opacity-50"
            aria-label="Save changes"
          >
            {saving && <Spinner size={12} />}
            <span>Save Changes</span>
          </button>
          <button
            onClick={handleReset}
            className="rounded-xl border border-white/10 bg-white/[0.01] hover:bg-white/5 px-4 py-2.5 text-xs font-bold text-slate-300 transition"
            aria-label="Reset forms"
          >
            Reset
          </button>
        </div>

        <div className="rounded-xl border border-warning/20 bg-warning/[0.02] p-4 space-y-2">
          <h3 className="font-bold text-warning text-xs">Security Standards</h3>
          <ul className="text-[10px] text-slate-300 font-medium space-y-1">
            <li>• Password credentials must exceed 8 character indexes.</li>
            <li>• Ensure multi-class tokens are configured (symbols, numbers).</li>
            <li>• Session timeouts enforce token re-validation cycles.</li>
          </ul>
        </div>
      </motion.div>
    </div>
  );
}

function CamerasTab({ cameras, loading, refetch }) {
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    camera_name: "",
    location: "",
    stream_url: "",
  });

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await addCamera(form);
      toast.success("Camera Added Successfully");
      setForm({
        camera_name: "",
        location: "",
        stream_url: "",
      });
      setShowForm(false);
      refetch();
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Unable to add camera");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!confirm("Confirm deleting camera?")) return;
    try {
      await deleteCamera(id);
      toast.success("Camera Deleted");
      refetch();
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider">Device Inventory</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-white hover:bg-primary-dark transition"
          aria-label="Add camera"
        >
          <MdAdd /> Add Camera
        </button>
      </div>

      {showForm && (
        <motion.form
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={submit}
          className="rounded-2xl border border-white/5 bg-slate-950/40 p-5 space-y-4"
        >
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Register Camera Stream</h3>
          <div className="grid gap-3 md:grid-cols-3">
            <input
              required
              placeholder="Camera Name"
              value={form.camera_name}
              onChange={(e) => setForm({ ...form, camera_name: e.target.value })}
              className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-xs text-white outline-none focus:border-primary/50 transition"
              aria-label="Camera Name"
            />
            <input
              required
              placeholder="Location"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-xs text-white outline-none focus:border-primary/50 transition"
              aria-label="Location"
            />
            <input
              required
              placeholder="RTSP / Webcam URL"
              value={form.stream_url}
              onChange={(e) => setForm({ ...form, stream_url: e.target.value })}
              className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-xs text-white outline-none focus:border-primary/50 transition"
              aria-label="RTSP URL"
            />
          </div>
          <button
            disabled={saving}
            className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-white hover:bg-primary-dark transition disabled:opacity-50"
            aria-label="Save Camera"
          >
            {saving && <Spinner size={12} />}
            <span>Save Device</span>
          </button>
        </motion.form>
      )}

      {loading ? (
        <PageLoader label="Loading hardware inventory..." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {(cameras || []).length === 0 && (
            <div className="rounded-2xl border border-dashed border-white/10 py-12 text-center bg-white/[0.01] col-span-full">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">No devices mapped yet.</span>
            </div>
          )}

          {(cameras || []).map((camera) => (
            <motion.div
              key={camera.id}
              whileHover={{ scale: 1.01 }}
              className="rounded-2xl border border-white/5 bg-slate-950/40 p-5 flex flex-col justify-between gap-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xs font-bold text-white">{camera.camera_name}</h3>
                  <span className="text-[10px] text-text-muted mt-0.5 block">📍 Location: {camera.location}</span>
                  <p className="mt-2 text-[9px] text-slate-500 truncate max-w-[220px] font-mono">{camera.stream_url}</p>
                </div>
                <span className={`rounded-xl border px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider ${
                  camera.status === 'Active' ? 'bg-success/10 text-success border-success/20' : 'bg-slate-500/10 text-slate-400 border-white/10'
                }`}>
                  {camera.status}
                </span>
              </div>

              <div className="flex gap-2 border-t border-white/5 pt-3">
                <button
                  onClick={() => remove(camera.id)}
                  className="flex-1 flex items-center justify-center gap-1 rounded-xl bg-danger/10 border border-danger/20 py-1.5 text-[10px] font-bold text-danger hover:bg-danger/20 transition"
                  aria-label="Delete camera"
                >
                  <MdDelete /> Delete
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

function NotificationsTab() {
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [pushAlerts, setPushAlerts] = useState(true);
  const [criticalOnly, setCriticalOnly] = useState(false);

  const save = () => {
    toast.success("Notification preferences updated!");
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/5 bg-slate-950/40 p-6 space-y-5">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider">Alert Configurations</h2>
        
        <div className="space-y-4 text-xs font-medium text-slate-300">
          <label className="flex items-center justify-between cursor-pointer">
            <span>Email Alert Logs</span>
            <input
              type="checkbox"
              checked={emailAlerts}
              onChange={() => setEmailAlerts(!emailAlerts)}
              className="accent-primary"
              aria-label="Email Alert Logs"
            />
          </label>
          
          <label className="flex items-center justify-between cursor-pointer">
            <span>Push Desk Notifications</span>
            <input
              type="checkbox"
              checked={pushAlerts}
              onChange={() => setPushAlerts(!pushAlerts)}
              className="accent-primary"
              aria-label="Push Desk Notifications"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer">
            <span>Critical Alerts Priority Filter</span>
            <input
              type="checkbox"
              checked={criticalOnly}
              onChange={() => setCriticalOnly(!criticalOnly)}
              className="accent-primary"
              aria-label="Critical Alerts Priority Filter"
            />
          </label>
        </div>

        <button
          onClick={save}
          className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-white hover:bg-primary-dark transition"
          aria-label="Save Settings"
        >
          Save Settings
        </button>
      </div>
    </div>
  );
}

function SystemTab({ cameras }) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {/* System stats */}
      <div className="rounded-2xl border border-white/5 bg-slate-950/40 p-6 space-y-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
          <MdDns />
          <span>System Information</span>
        </h2>
        
        <div className="space-y-3 text-xs font-medium">
          <div className="flex justify-between border-b border-white/5 pb-2">
            <span className="text-slate-400">Server Backend Status</span>
            <span className="text-success font-bold flex items-center gap-1"><MdCircle size={8} /> Online</span>
          </div>
          <div className="flex justify-between border-b border-white/5 pb-2">
            <span className="text-slate-400">Active AI Model</span>
            <span className="text-white font-mono">YOLOv11-Core (Precise)</span>
          </div>
          <div className="flex justify-between border-b border-white/5 pb-2">
            <span className="text-slate-400">Database Core</span>
            <span className="text-white">PostgreSQL Connected</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">System Software Build</span>
            <span className="text-white font-mono">v1.0.0-Stable</span>
          </div>
        </div>
      </div>

      {/* Diagnostics progress */}
      <div className="rounded-2xl border border-white/5 bg-slate-950/40 p-6 space-y-5">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
          <MdInfoOutline />
          <span>Diagnostics Telemetry</span>
        </h2>

        <div className="space-y-4 text-xs font-semibold">
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-400">Database Storage Health</span>
              <span className="text-success">100% Operational</span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-success rounded-full" style={{ width: '100%' }} />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-400">YOLO Model Loader</span>
              <span className="text-primary-light">95% Ready</span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full" style={{ width: '95%' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}