import { useState } from "react";
import { motion } from "framer-motion";
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
} from "react-icons/md";

import { useAuth } from "../hooks/useAuth";
import { useFetch } from "../hooks/useFetch";
import {
  getCameras,
  addCamera,
  deleteCamera,
} from "../services/api";

import { PageLoader } from "../components/Loader";

const TABS = [
  "Profile",
  "Cameras",
  "Notifications",
  "System",
];

export default function Settings() {

  const { user } = useAuth();

  const {
    data: cameras,
    loading,
    refetch,
  } = useFetch(getCameras, []);

  const [tab, setTab] =
    useState("Profile");

  return (

<div className="space-y-6">

{/* Header */}

<motion.div
initial={{opacity:0,y:-20}}
animate={{opacity:1,y:0}}
className="rounded-3xl bg-gradient-to-r from-primary/20 to-secondary/20 p-6">

<h1 className="text-3xl font-bold text-white">

⚙️ SafeVision Settings

</h1>

<p className="mt-2 text-slate-400">

Manage your account, AI system and cameras.

</p>

</motion.div>

{/* KPI */}

<div className="grid grid-cols-1 gap-5 md:grid-cols-4">

<motion.div
whileHover={{scale:1.03}}
className="rounded-3xl bg-surface-card p-6">

<MdSecurity className="text-5xl text-primary"/>

<h2 className="mt-4 text-3xl font-bold text-white">

{user?.role || "Admin"}

</h2>

<p className="text-slate-400">

Role

</p>

</motion.div>

<motion.div
whileHover={{scale:1.03}}
className="rounded-3xl bg-surface-card p-6">

<MdStorage className="text-5xl text-success"/>

<h2 className="mt-4 text-3xl font-bold text-white">

<CountUp end={cameras?.length||0}/>

</h2>

<p className="text-slate-400">

Connected Cameras

</p>

</motion.div>

<motion.div
whileHover={{scale:1.03}}
className="rounded-3xl bg-surface-card p-6">

<MdNotificationsActive className="text-5xl text-warning"/>

<h2 className="mt-4 text-3xl font-bold text-white">

ON

</h2>

<p className="text-slate-400">

Notifications

</p>

</motion.div>

<motion.div
whileHover={{scale:1.03}}
className="rounded-3xl bg-surface-card p-6">

<MdSettingsSuggest className="text-5xl text-info"/>

<h2 className="mt-4 text-3xl font-bold text-white">

AI

</h2>

<p className="text-slate-400">

System Ready

</p>

</motion.div>

</div>

{/* Tabs */}

<div className="rounded-3xl bg-surface-card">

<div className="flex gap-3 border-b border-surface-border p-4">

{TABS.map((t)=>(

<button
key={t}
onClick={()=>setTab(t)}
className={`rounded-xl px-5 py-3 transition-all

${tab===t
?"bg-primary text-white shadow-lg"
:"text-slate-400 hover:bg-surface-elevated"
}`}>

{t}

</button>

))}

</div>

<div className="p-6">

{tab==="Profile" && <ProfileTab user={user}/>}

{tab==="Cameras" && (

<CamerasTab

cameras={cameras}

loading={loading}

refetch={refetch}

/>

)}

{tab==="Notifications" &&

<NotificationsTab/>

}

{tab==="System" &&

<SystemTab cameras={cameras}/>

}

</div>

</div>

</div>

  );

}
function ProfileTab({ user }) {

  const [password,setPassword]=useState("");

  return (

<div className="grid grid-cols-1 gap-8 lg:grid-cols-3">

{/* Profile */}

<motion.div
initial={{opacity:0,x:-20}}
animate={{opacity:1,x:0}}
className="rounded-3xl bg-surface-elevated p-8">

<div className="mx-auto flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-5xl font-bold text-white">

{user?.full_name?.charAt(0).toUpperCase()}

</div>

<h2 className="mt-6 text-center text-2xl font-bold text-white">

{user?.full_name}

</h2>

<p className="mt-2 text-center text-slate-400">

{user?.email}

</p>

<div className="mt-8 space-y-4">

<div className="rounded-2xl bg-surface-card p-4">

<p className="text-xs uppercase text-slate-500">

Role

</p>

<h3 className="mt-1 text-lg font-semibold capitalize text-white">

{user?.role}

</h3>

</div>

<div className="rounded-2xl bg-surface-card p-4">

<p className="text-xs uppercase text-slate-500">

Account Status

</p>

<h3 className="mt-1 font-semibold text-success">

Active

</h3>

</div>

</div>

</motion.div>

{/* Profile Settings */}

<motion.div
initial={{opacity:0,x:20}}
animate={{opacity:1,x:0}}
className="lg:col-span-2 rounded-3xl bg-surface-elevated p-8">

<h2 className="mb-6 text-2xl font-bold text-white">

Profile Settings

</h2>

<div className="grid grid-cols-1 gap-6 md:grid-cols-2">

<div>

<label className="mb-2 block text-sm text-slate-400">

Full Name

</label>

<input
defaultValue={user?.full_name}
className="w-full rounded-xl bg-surface px-4 py-3 text-white focus:border-primary focus:outline-none"
/>

</div>

<div>

<label className="mb-2 block text-sm text-slate-400">

Email

</label>

<input
defaultValue={user?.email}
className="w-full rounded-xl bg-surface px-4 py-3 text-white focus:border-primary focus:outline-none"
/>

</div>

<div className="md:col-span-2">

<label className="mb-2 block text-sm text-slate-400">

New Password

</label>

<input
type="password"
value={password}
onChange={(e)=>setPassword(e.target.value)}
placeholder="Enter new password"
className="w-full rounded-xl bg-surface px-4 py-3 text-white focus:border-primary focus:outline-none"
/>

</div>

</div>

<div className="mt-8 flex gap-4">

<button
onClick={()=>toast.success("Profile Updated")}
className="rounded-xl bg-primary px-6 py-3 font-semibold text-white transition hover:bg-primary-dark">

Save Changes

</button>

<button
onClick={()=>setPassword("")}
className="rounded-xl bg-surface px-6 py-3 font-semibold text-white">

Reset

</button>

</div>

<div className="mt-10 rounded-2xl border border-warning/20 bg-warning/10 p-5">

<h3 className="font-bold text-warning">

Security Tips

</h3>

<ul className="mt-3 space-y-2 text-sm text-slate-300">

<li>• Use at least 8 characters.</li>

<li>• Include uppercase & lowercase.</li>

<li>• Add numbers & symbols.</li>

<li>• Never share your password.</li>

</ul>

</div>

</motion.div>

</div>

  )

}
function CamerasTab({ cameras, loading, refetch }) {
  const [showForm, setShowForm] = useState(false)

  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    camera_name: "",
    location: "",
    stream_url: "",
  })

  const submit = async (e) => {
    e.preventDefault()

    setSaving(true)

    try {

      await addCamera(form)

      toast.success("Camera Added Successfully")

      setForm({
        camera_name: "",
        location: "",
        stream_url: "",
      })

      setShowForm(false)

      refetch()

    } catch (err) {

      toast.error(
        err?.response?.data?.detail ||
          "Unable to add camera"
      )

    } finally {

      setSaving(false)

    }
  }

  const remove = async (id) => {

    if (!confirm("Delete this camera?")) return

    try {

      await deleteCamera(id)

      toast.success("Camera Deleted")

      refetch()

    } catch (err) {

      toast.error("Delete failed")

    }

  }

  return (

<div>

<div className="mb-6 flex items-center justify-between">

<h2 className="text-2xl font-bold text-white">

Connected Cameras

</h2>

<button
onClick={() => setShowForm(!showForm)}
className="rounded-xl bg-primary px-5 py-3 font-semibold text-white transition hover:bg-primary-dark">

<MdAdd className="inline mr-2"/>

Add Camera

</button>

</div>

{showForm && (

<motion.form

initial={{opacity:0,y:-20}}

animate={{opacity:1,y:0}}

onSubmit={submit}

className="mb-8 rounded-3xl bg-surface-elevated p-6">

<h3 className="mb-5 text-xl font-bold text-white">

New Camera

</h3>

<div className="grid gap-5 md:grid-cols-3">

<input
required
placeholder="Camera Name"
value={form.camera_name}
onChange={(e)=>
setForm({
...form,
camera_name:e.target.value
})
}
className="rounded-xl bg-surface px-4 py-3 text-white"
/>

<input
required
placeholder="Location"
value={form.location}
onChange={(e)=>
setForm({
...form,
location:e.target.value
})
}
className="rounded-xl bg-surface px-4 py-3 text-white"
/>

<input
required
placeholder="RTSP URL"
value={form.stream_url}
onChange={(e)=>
setForm({
...form,
stream_url:e.target.value
})
}
className="rounded-xl bg-surface px-4 py-3 text-white"
/>

</div>

<button
disabled={saving}
className="mt-6 rounded-xl bg-primary px-6 py-3 font-semibold text-white">

{saving ? "Saving..." : "Save Camera"}

</button>

</motion.form>

)}

{loading ? (

<PageLoader/>

) : (

<div className="grid gap-5 md:grid-cols-2">

{(cameras||[]).length===0 && (

<div className="rounded-3xl bg-surface-elevated p-12 text-center text-slate-500">

No Cameras Added

</div>

)}

{(cameras||[]).map((camera)=>(

<motion.div

key={camera.id}

whileHover={{
scale:1.03,
y:-5
}}

className="rounded-3xl bg-surface-elevated p-6 shadow-xl">

<div className="flex justify-between">

<div>

<h2 className="text-xl font-bold text-white">

{camera.camera_name}

</h2>

<p className="mt-2 text-slate-400">

📍 {camera.location}

</p>

<p className="mt-3 break-all text-xs text-slate-500">

{camera.stream_url}

</p>

</div>

<div>

<span
className={`rounded-full px-3 py-1 text-xs font-bold

${camera.status==="Active"

?"bg-green-500/20 text-green-400"

:"bg-red-500/20 text-red-400"

}`}>

{camera.status}

</span>

</div>

</div>

<div className="mt-8 flex gap-3">

<button
className="flex-1 rounded-xl bg-primary py-2 text-white transition hover:bg-primary-dark">

<MdEdit className="inline mr-2"/>

Edit

</button>

<button

onClick={()=>remove(camera.id)}

className="flex-1 rounded-xl bg-danger py-2 text-white transition hover:opacity-90">

<MdDelete className="inline mr-2"/>

Delete

</button>

</div>

</motion.div>

))}

</div>

)}

</div>

  )

}
function NotificationsTab() {

  const [emailAlerts, setEmailAlerts] = useState(true);
  const [pushAlerts, setPushAlerts] = useState(true);
  const [criticalOnly, setCriticalOnly] = useState(false);

  const save = () => {
    toast.success("Notification settings saved");
  };

  return (

<div className="space-y-6">

<div className="rounded-3xl bg-surface-elevated p-6">

<h2 className="mb-6 text-2xl font-bold text-white">

🔔 Notification Settings

</h2>

<div className="space-y-5">

<label className="flex items-center justify-between">

<span className="text-white">

Email Alerts

</span>

<input
type="checkbox"
checked={emailAlerts}
onChange={()=>
setEmailAlerts(!emailAlerts)
}
/>

</label>

<label className="flex items-center justify-between">

<span className="text-white">

Push Notifications

</span>

<input
type="checkbox"
checked={pushAlerts}
onChange={()=>
setPushAlerts(!pushAlerts)
}
/>

</label>

<label className="flex items-center justify-between">

<span className="text-white">

Critical Alerts Only

</span>

<input
type="checkbox"
checked={criticalOnly}
onChange={()=>
setCriticalOnly(!criticalOnly)
}
/>

</label>

</div>

<button
onClick={save}
className="mt-8 rounded-xl bg-primary px-6 py-3 font-semibold text-white">

Save Settings

</button>

</div>

</div>

  );

}

function SystemTab({ cameras }) {

  return (

<div className="grid grid-cols-1 gap-6 md:grid-cols-2">

<div className="rounded-3xl bg-surface-elevated p-6">

<h2 className="mb-5 text-xl font-bold text-white">

🖥 System Information

</h2>

<div className="space-y-4">

<div className="flex justify-between">

<span className="text-slate-400">

Backend

</span>

<span className="text-success">

Online

</span>

</div>

<div className="flex justify-between">

<span className="text-slate-400">

AI Model

</span>

<span className="text-white">

YOLOv11

</span>

</div>

<div className="flex justify-between">

<span className="text-slate-400">

Database

</span>

<span className="text-white">

PostgreSQL

</span>

</div>

<div className="flex justify-between">

<span className="text-slate-400">

Frontend

</span>

<span className="text-success">

Connected

</span>

</div>

<div className="flex justify-between">

<span className="text-slate-400">

Version

</span>

<span className="text-white">

v1.0.0

</span>

</div>

</div>

</div>

<div className="rounded-3xl bg-surface-elevated p-6">

<h2 className="mb-5 text-xl font-bold text-white">

📊 Statistics

</h2>

<div className="space-y-5">

<div>

<p className="text-slate-400">

Connected Cameras

</p>

<h2 className="text-4xl font-bold text-primary">

{cameras?.length || 0}

</h2>

</div>

<div>

<p className="text-slate-400">

Server Status

</p>

<div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-700">

<div className="h-full w-full bg-green-500"/>

</div>

<p className="mt-2 text-green-400">

100% Operational

</p>

</div>

<div>

<p className="text-slate-400">

AI Detection Engine

</p>

<div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-700">

<div className="h-full w-[95%] bg-primary"/>

</div>

<p className="mt-2 text-primary-light">

95% Ready

</p>

</div>

</div>

</div>

<div className="rounded-3xl border border-primary/20 bg-primary/10 p-6 md:col-span-2">

<h2 className="text-xl font-bold text-primary-light">

🚀 SafeVision AI Enterprise

</h2>

<p className="mt-3 text-slate-300">

This system is currently connected to the backend API, PostgreSQL database,
YOLO AI detection engine, reporting module and live monitoring services.

</p>

</div>

</div>

  );

}