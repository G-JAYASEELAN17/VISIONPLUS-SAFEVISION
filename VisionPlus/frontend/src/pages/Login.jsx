import { useState } from 'react'
import { useNavigate, useLocation, Navigate } from 'react-router-dom'
import { MdVisibility, MdVisibilityOff, MdShield } from 'react-icons/md'
import toast from 'react-hot-toast'
import { useAuth } from '../hooks/useAuth'

export default function Login() {
  const { login, isAuthenticated, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(true)

  if (isAuthenticated) {
    return <Navigate to={location.state?.from?.pathname || '/dashboard'} replace />
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const result = await login(email, password)
    if (result.success) {
      toast.success('Welcome back!')
      navigate('/dashboard')
    } else {
      toast.error(result.message)
    }
  }

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      {/* Left brand panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-[#0f0f2e] via-[#1a1a3d] to-[#12121e] p-10 lg:flex">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary-dark">
            <MdShield className="text-xl text-white" />
          </div>
          <span className="text-xl font-bold text-white">SafeVision AI</span>
        </div>

        <div>
          <h2 className="text-3xl font-bold leading-tight text-white">
            AI Powered Crowd Monitoring
            <br /> and Analytics System
          </h2>
          <p className="mt-3 max-w-md text-sm text-slate-400">
            Real-time detection, zone analysis, and risk alerts for enterprise
            security teams.
          </p>
        </div>

        <p className="text-xs text-slate-600">© 2026 SafeVision AI. All rights reserved.</p>
      </div>

      {/* Right form panel */}
      <div className="flex items-center justify-center bg-surface p-6 sm:p-10">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary-dark">
              <MdShield className="text-lg text-white" />
            </div>
            <span className="text-lg font-bold text-white">SafeVision AI</span>
          </div>

          <h1 className="text-2xl font-bold text-white">Welcome Back!</h1>
          <p className="mt-1 text-sm text-slate-400">Sign in to your account</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@safevision.ai"
                className="w-full rounded-lg border border-surface-border bg-surface-card px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="block text-sm font-medium text-slate-300">
                  Password
                </label>
                <button
                  type="button"
                  className="text-xs font-medium text-primary-light hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  className="w-full rounded-lg border border-surface-border bg-surface-card px-3.5 py-2.5 pr-10 text-sm text-white placeholder:text-slate-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <MdVisibilityOff /> : <MdVisibility />}
                </button>
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-slate-400">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-4 w-4 rounded border-surface-border bg-surface-card text-primary focus:ring-primary"
              />
              Remember me
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-white shadow-card transition-colors hover:bg-primary-dark disabled:opacity-60"
            >
              {loading ? 'Signing in…' : 'Login'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Don&apos;t have an account?{' '}
            <span className="font-medium text-primary-light">Contact Admin</span>
          </p>
        </div>
      </div>
    </div>
  )
}
