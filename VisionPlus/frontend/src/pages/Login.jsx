import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation, Navigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { MdVisibility, MdVisibilityOff, MdShield, MdEmail, MdLock, MdInfo, MdClose } from 'react-icons/md'
import toast from 'react-hot-toast'
import { useAuth } from '../hooks/useAuth'
import { Spinner } from '../components/Loader'

export default function Login() {
  const { login, isAuthenticated, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(true)
  const [isCapsLockOn, setIsCapsLockOn] = useState(false)
  const [showForgotModal, setShowForgotModal] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotLoading, setForgotLoading] = useState(false)

  // Validation States
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [touched, setTouched] = useState({ email: false, password: false })

  // Focus and keyup/keydown listeners for Caps Lock
  useEffect(() => {
    const handleKeyUp = (e) => {
      if (e.getModifierState && typeof e.getModifierState === 'function') {
        setIsCapsLockOn(e.getModifierState('CapsLock'))
      }
    }
    window.addEventListener('keyup', handleKeyUp)
    window.addEventListener('keydown', handleKeyUp)
    return () => {
      window.removeEventListener('keyup', handleKeyUp)
      window.removeEventListener('keydown', handleKeyUp)
    }
  }, [])

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to={location.state?.from?.pathname || '/dashboard'} replace />
  }

  // Input Validation logic
  const validateEmail = (val) => {
    if (!val.trim()) return 'Email is required'
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!regex.test(val)) return 'Please enter a valid email address'
    return ''
  }

  const validatePassword = (val) => {
    if (!val) return 'Password is required'
    if (val.length < 6) return 'Password must be at least 6 characters'
    return ''
  }

  const handleEmailChange = (e) => {
    const val = e.target.value
    setEmail(val)
    if (touched.email) {
      setEmailError(validateEmail(val))
    }
  }

  const handlePasswordChange = (e) => {
    const val = e.target.value
    setPassword(val)
    if (touched.password) {
      setPasswordError(validatePassword(val))
    }
  }

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
    if (field === 'email') setEmailError(validateEmail(email))
    if (field === 'password') setPasswordError(validatePassword(password))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Trigger validation on submit
    const emailErr = validateEmail(email)
    const passErr = validatePassword(password)
    setEmailError(emailErr)
    setPasswordError(passErr)
    setTouched({ email: true, password: true })

    if (emailErr || passErr) {
      toast.error('Please fix the errors before signing in')
      return
    }

    const result = await login(email, password, remember)
    if (result.success) {
      toast.success('Welcome back!')
      navigate('/dashboard')
    } else {
      toast.error(result.message)
    }
  }

  const handleForgotSubmit = async (e) => {
    e.preventDefault()
    const err = validateEmail(forgotEmail)
    if (err) {
      toast.error(err)
      return
    }

    setForgotLoading(true)
    setTimeout(() => {
      setForgotLoading(false)
      setShowForgotModal(false)
      setForgotEmail('')
      toast.success('Password reset link sent to your email!')
    }, 1500)
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#070b16] px-4 py-12 sm:px-6 lg:px-8">
      {/* Dynamic Background Blobs */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            x: [0, 40, -20, 0],
            y: [0, -60, 30, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute -top-1/4 -left-1/4 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-[#6366f1]/20 to-[#4f46e5]/5 blur-[80px]"
        />
        <motion.div
          animate={{
            x: [0, -30, 50, 0],
            y: [0, 40, -40, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute -bottom-1/4 -right-1/4 h-[600px] w-[600px] rounded-full bg-gradient-to-tr from-[#06b6d4]/20 to-[#0891b2]/5 blur-[90px]"
        />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Branding Header */}
        <div className="mb-8 flex flex-col items-center text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary glow mb-4"
          >
            <MdShield className="text-3xl text-white" />
          </motion.div>
          <motion.h1
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl"
          >
            Vision<span className="text-gradient font-black">Plus</span>
          </motion.h1>
          <motion.p
            initial={{ y: -5, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mt-2 text-sm text-text-muted font-medium"
          >
            AI Crowd Intelligence Platform
          </motion.p>
        </div>

        {/* Glassmorphism Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="glass-card overflow-hidden bg-white/[0.03] backdrop-blur-2xl border border-white/[0.08] p-8 shadow-2xl relative"
        >
          <h2 className="text-xl font-bold text-white mb-6">Sign In</h2>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-text-secondary">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                  <MdEmail className="text-lg" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={handleEmailChange}
                  onBlur={() => handleBlur('email')}
                  placeholder="name@company.com"
                  aria-invalid={!!emailError}
                  aria-describedby={emailError ? 'email-error' : undefined}
                  className={`w-full rounded-xl border bg-surface-elevated/40 pl-11 pr-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition-all ${
                    emailError
                      ? 'border-danger focus:border-danger focus:ring-2 focus:ring-danger/20'
                      : 'border-white/10 focus:border-primary focus:ring-2 focus:ring-primary/20'
                  }`}
                />
              </div>
              <AnimatePresence>
                {emailError && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    id="email-error"
                    className="mt-1.5 text-xs text-danger flex items-center gap-1"
                  >
                    <MdInfo /> {emailError}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Password Field */}
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-text-secondary">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-xs font-semibold text-primary-light hover:text-primary transition-colors focus:outline-none focus:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                  <MdLock className="text-lg" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={handlePasswordChange}
                  onBlur={() => handleBlur('password')}
                  placeholder="••••••••"
                  aria-invalid={!!passwordError}
                  aria-describedby={passwordError ? 'password-error' : undefined}
                  className={`w-full rounded-xl border bg-surface-elevated/40 pl-11 pr-10 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition-all ${
                    passwordError
                      ? 'border-danger focus:border-danger focus:ring-2 focus:ring-danger/20'
                      : 'border-white/10 focus:border-primary focus:ring-2 focus:ring-primary/20'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-200 transition-colors focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <MdVisibilityOff className="text-lg" /> : <MdVisibility className="text-lg" />}
                </button>
              </div>
              
              {/* Caps Lock Detection Warning */}
              <AnimatePresence>
                {isCapsLockOn && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="mt-1.5 flex items-center gap-1.5 text-warning text-xs font-medium"
                  >
                    <MdInfo className="text-sm" />
                    <span>Caps Lock is ON</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {passwordError && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    id="password-error"
                    className="mt-1.5 text-xs text-danger flex items-center gap-1"
                  >
                    <MdInfo /> {passwordError}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center">
              <label className="relative flex items-center cursor-pointer select-none text-sm text-text-secondary hover:text-white transition-colors">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="mr-2.5 h-4.5 w-4.5 rounded border-white/10 bg-surface-elevated text-primary focus:ring-primary focus:ring-offset-0 cursor-pointer"
                />
                Remember me for 30 days
              </label>
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={loading}
              className="w-full relative flex items-center justify-center rounded-xl bg-primary py-3 px-4 text-sm font-semibold text-white shadow-card hover:bg-primary-dark transition-all disabled:opacity-60 overflow-hidden group"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Spinner size={18} className="!border-t-white" />
                  <span>Signing In...</span>
                </div>
              ) : (
                <span>Sign In</span>
              )}
            </motion.button>
          </form>

          {/* Link to Signup */}
          <p className="mt-8 text-center text-sm text-text-muted">
            Need an enterprise account?{' '}
            <Link
              to="/signup"
              className="font-semibold text-primary-light hover:text-primary transition-colors focus:outline-none focus:underline"
            >
              Sign Up
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {showForgotModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowForgotModal(false)}
              className="absolute inset-0 bg-[#02040a]/80 backdrop-blur-md"
            />
            {/* Modal Card */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative z-10 w-full max-w-sm rounded-3xl border border-white/10 bg-surface-card/95 p-6 shadow-xl backdrop-blur-xl"
              role="dialog"
              aria-modal="true"
              aria-labelledby="forgot-title"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 id="forgot-title" className="text-lg font-bold text-white">
                  Reset Password
                </h3>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-white/5 hover:text-white transition-all focus:outline-none"
                  aria-label="Close modal"
                >
                  <MdClose className="text-xl" />
                </button>
              </div>

              <p className="text-sm text-text-muted mb-5 leading-relaxed">
                Enter your registered email address and we'll send you instructions to reset your password.
              </p>

              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <div>
                  <label htmlFor="forgot-email" className="mb-1.5 block text-xs font-semibold text-text-secondary uppercase tracking-wider">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-500">
                      <MdEmail className="text-base" />
                    </div>
                    <input
                      id="forgot-email"
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="name@company.com"
                      className="w-full rounded-xl border border-white/10 bg-surface-elevated/40 pl-9 pr-3 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="rounded-xl px-4 py-2.5 text-sm font-semibold text-text-secondary hover:bg-white/5 hover:text-white transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-card hover:bg-primary-dark transition-all disabled:opacity-60"
                  >
                    {forgotLoading ? <Spinner size={14} className="!border-t-white" /> : null}
                    <span>Send Link</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
