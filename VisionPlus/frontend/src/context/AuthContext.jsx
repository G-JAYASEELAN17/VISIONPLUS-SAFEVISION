import { createContext, useEffect, useState, useCallback } from 'react'
import { login as loginRequest, getMe } from '../services/api'

export const AuthContext = createContext(null)

// Development Mode: must match the backend's DEV_MODE flag (see .env).
// When on, the app never shows the login page and always behaves as if a
// Demo Administrator is signed in. Real auth code below is untouched and
// re-activates instantly the moment VITE_DEV_MODE is set back to false.
export const DEV_MODE = String(import.meta.env.VITE_DEV_MODE).toLowerCase() === 'true'

const DEV_ADMIN_USER = {
  id: 0,
  full_name: 'Demo Administrator',
  email: 'demo.admin@visionplus.local',
  role: 'admin',
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    if (DEV_MODE) return DEV_ADMIN_USER
    const raw = localStorage.getItem('sv_user')
    return raw ? JSON.parse(raw) : null
  })
  const [token, setToken] = useState(() => (DEV_MODE ? 'dev-mode' : localStorage.getItem('sv_token')))
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (token) localStorage.setItem('sv_token', token)
    else localStorage.removeItem('sv_token')
  }, [token])

  useEffect(() => {
    if (user) localStorage.setItem('sv_user', JSON.stringify(user))
    else localStorage.removeItem('sv_user')
  }, [user])

  const fetchProfile = useCallback(async () => {
    try {
      const { data } = await getMe()
      setUser(data)
    } catch {
      // Token invalid/expired — the axios 401 interceptor already handles
      // clearing the session and redirecting to /login in that case.
    }
  }, [])

  // Restore the real profile on reload if a token is already present.
  // In DEV_MODE, also sync once against GET /auth/me: the backend bypasses
  // auth and returns the real demo-admin DB row (correct numeric id), which
  // matters for anything that joins on user_id (e.g. chat history).
  useEffect(() => {
    if (DEV_MODE || (token && !user)) fetchProfile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const login = useCallback(async (email, password) => {
    setLoading(true)
    try {
      const { data } = await loginRequest(email, password)
      // Write synchronously so the axios interceptor (which reads from
      // localStorage) picks it up immediately — setToken's mirroring
      // useEffect below hasn't run yet at this point in the same tick.
      localStorage.setItem('sv_token', data.access_token)
      setToken(data.access_token)
      // Backend's GET /auth/me (added alongside /auth/login) returns the
      // real profile: { id, full_name, email, role }.
      await fetchProfile()
      return { success: true }
    } catch (err) {
      const message =
        err?.response?.data?.detail || 'Invalid email or password'
      return { success: false, message }
    } finally {
      setLoading(false)
    }
  }, [fetchProfile])

  const logout = useCallback(() => {
    setToken(null)
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider
      value={{ user, token, isAuthenticated: !!token, loading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}
