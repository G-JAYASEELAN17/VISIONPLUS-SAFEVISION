import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { MdVisibility, MdVisibilityOff, MdShield, MdEmail, MdLock, MdPerson, MdInfo } from 'react-icons/md'
import toast from 'react-hot-toast'
import { register } from '../services/api'
import { Spinner } from '../components/Loader'

export default function Signup() {
  const navigate = useNavigate()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isCapsLockOn, setIsCapsLockOn] = useState(false)
  const [loading, setLoading] = useState(false)

  // Validation States
  const [fullNameError, setFullNameError] = useState('')
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [confirmPasswordError, setConfirmPasswordError] = useState('')
  const [touched, setTouched] = useState({ fullName: false, email: false, password: false, confirmPassword: false })

  // Password strength score (0 to 4)
  const [strengthScore, setStrengthScore] = useState(0)
  const [strengthText, setStrengthText] = useState('')

  // Monitor Caps Lock
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

  // Calculate Password Strength
  useEffect(() => {
    if (!password) {
      setStrengthScore(0)
      setStrengthText('')
      return
    }
    let score = 0
    if (password.length >= 6) score++
    if (password.length >= 8) score++
    if (/[A-Z]/.test(password)) score++
    if (/[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password)) score++

    setStrengthScore(score)
    const textMap = ['Very Weak', 'Weak', 'Fair', 'Strong', 'Excellent']
    setStrengthText(textMap[score])
  }, [password])

  // Validation Functions
  const validateFullName = (val) => {
    if (!val.trim()) return 'Full name is required'
    if (val.trim().length < 2) return 'Name must be at least 2 characters'
    return ''
  }

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

  const validateConfirmPassword = (val) => {
    if (!val) return 'Please confirm your password'
    if (val !== password) return 'Passwords do not match'
    return ''
  }

  // Handle Input Changes
  const handleInputChange = (field, val) => {
    if (field === 'fullName') {
      setFullName(val)
      if (touched.fullName) setFullNameError(validateFullName(val))
    }
    if (field === 'email') {
      setEmail(val)
      if (touched.email) setEmailError(validateEmail(val))
    }
    if (field === 'password') {
      setPassword(val)
      if (touched.password) setPasswordError(validatePassword(val))
      // Update confirm password error dynamically if touched
      if (touched.confirmPassword && confirmPassword) {
        setConfirmPasswordError(val !== confirmPassword ? 'Passwords do not match' : '')
      }
    }
    if (field === 'confirmPassword') {
      setConfirmPassword(val)
      if (touched.confirmPassword) setConfirmPasswordError(validateConfirmPassword(val))
    }
  }

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
    if (field === 'fullName') setFullNameError(validateFullName(fullName))
    if (field === 'email') setEmailError(validateEmail(email))
    if (field === 'password') setPasswordError(validatePassword(password))
    if (field === 'confirmPassword') setConfirmPasswordError(validateConfirmPassword(confirmPassword))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const nameErr = validateFullName(fullName)
    const emailErr = validateEmail(email)
    const passErr = validatePassword(password)
    const confirmErr = validateConfirmPassword(confirmPassword)

    setFullNameError(nameErr)
    setEmailError(emailErr)
    setPasswordError(passErr)
    setConfirmPasswordError(confirmErr)
    setTouched({ fullName: true, email: true, password: true, confirmPassword: true })

    if (nameErr || emailErr || passErr || confirmErr) {
      toast.error('Please fix validation errors')
      return
    }

    setLoading(true)
    try {
      await register(fullName, email, password)
      toast.success('Registration successful! You can now log in.')
      navigate('/login')
    } catch (err) {
      const message = err?.response?.data?.detail || 'Registration failed. Try again.'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const getStrengthColor = () => {
    switch (strengthScore) {
      case 0:
      case 1:
        return 'bg-danger'
      case 2:
        return 'bg-warning'
      case 3:
      case 4:
        return 'bg-success'
      default:
        return 'bg-white/10'
    }
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
          <h2 className="text-xl font-bold text-white mb-6">Create Account</h2>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Full Name Field */}
            <div>
              <label htmlFor="fullName" className="mb-1.5 block text-sm font-medium text-text-secondary">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                  <MdPerson className="text-lg" />
                </div>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  autoComplete="name"
                  required
                  value={fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  onBlur={() => handleBlur('fullName')}
                  placeholder="John Doe"
                  aria-invalid={!!fullNameError}
                  aria-describedby={fullNameError ? 'name-error' : undefined}
                  className={`w-full rounded-xl border bg-surface-elevated/40 pl-11 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none transition-all ${
                    fullNameError
                      ? 'border-danger focus:border-danger focus:ring-2 focus:ring-danger/20'
                      : 'border-white/10 focus:border-primary focus:ring-2 focus:ring-primary/20'
                  }`}
                />
              </div>
              <AnimatePresence>
                {fullNameError && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    id="name-error"
                    className="mt-1 text-xs text-danger flex items-center gap-1"
                  >
                    <MdInfo /> {fullNameError}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

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
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  onBlur={() => handleBlur('email')}
                  placeholder="name@company.com"
                  aria-invalid={!!emailError}
                  aria-describedby={emailError ? 'email-error' : undefined}
                  className={`w-full rounded-xl border bg-surface-elevated/40 pl-11 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none transition-all ${
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
                    className="mt-1 text-xs text-danger flex items-center gap-1"
                  >
                    <MdInfo /> {emailError}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-text-secondary">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                  <MdLock className="text-lg" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  onBlur={() => handleBlur('password')}
                  placeholder="••••••••"
                  aria-invalid={!!passwordError}
                  aria-describedby={passwordError ? 'password-error' : undefined}
                  className={`w-full rounded-xl border bg-surface-elevated/40 pl-11 pr-10 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none transition-all ${
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

              {/* Password Strength Indicator */}
              {password && (
                <div className="mt-2">
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="text-text-muted">Password Strength</span>
                    <span className="font-semibold text-text-secondary">{strengthText}</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden flex gap-0.5">
                    {[1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        className={`h-full flex-1 transition-all duration-300 ${
                          step <= strengthScore ? getStrengthColor() : 'bg-transparent'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Caps Lock warning */}
              <AnimatePresence>
                {isCapsLockOn && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="mt-1 flex items-center gap-1 text-warning text-xs font-medium"
                  >
                    <MdInfo /> Caps Lock is ON
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
                    className="mt-1 text-xs text-danger flex items-center gap-1"
                  >
                    <MdInfo /> {passwordError}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-medium text-text-secondary">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
                  <MdLock className="text-lg" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  onBlur={() => handleBlur('confirmPassword')}
                  placeholder="••••••••"
                  aria-invalid={!!confirmPasswordError}
                  aria-describedby={confirmPasswordError ? 'confirm-password-error' : undefined}
                  className={`w-full rounded-xl border bg-surface-elevated/40 pl-11 pr-10 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none transition-all ${
                    confirmPasswordError
                      ? 'border-danger focus:border-danger focus:ring-2 focus:ring-danger/20'
                      : 'border-white/10 focus:border-primary focus:ring-2 focus:ring-primary/20'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-200 transition-colors focus:outline-none"
                  aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                >
                  {showConfirmPassword ? <MdVisibilityOff className="text-lg" /> : <MdVisibility className="text-lg" />}
                </button>
              </div>
              <AnimatePresence>
                {confirmPasswordError && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    id="confirm-password-error"
                    className="mt-1 text-xs text-danger flex items-center gap-1"
                  >
                    <MdInfo /> {confirmPasswordError}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={loading}
              className="w-full relative flex items-center justify-center rounded-xl bg-primary py-3 px-4 text-sm font-semibold text-white shadow-card hover:bg-primary-dark transition-all disabled:opacity-60 overflow-hidden group mt-2"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Spinner size={18} className="!border-t-white" />
                  <span>Creating Account...</span>
                </div>
              ) : (
                <span>Register</span>
              )}
            </motion.button>
          </form>

          {/* Link to Login */}
          <p className="mt-6 text-center text-sm text-text-muted">
            Already have an enterprise account?{' '}
            <Link
              to="/login"
              className="font-semibold text-primary-light hover:text-primary transition-colors focus:outline-none focus:underline"
            >
              Sign In
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
