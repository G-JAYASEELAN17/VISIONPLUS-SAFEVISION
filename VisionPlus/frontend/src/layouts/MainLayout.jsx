import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar'
import AIChatBot from '../components/AIChatBot'

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { pathname } = useLocation()

  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex min-h-screen flex-1 flex-col lg:ml-0">
        <Navbar
          onMenuClick={() => setSidebarOpen(true)}
          pathname={pathname}
        />

        <main className="flex-1 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>

      <AIChatBot />
    </div>
  )
}