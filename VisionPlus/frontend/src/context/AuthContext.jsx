import { createContext, useEffect, useState, useCallback } from 'react'
import { login as loginRequest, getMe } from '../services/api'

export const AuthContext = createContext(null)

// Development Mode: must match the backend's DEV_MODE flag.
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
    try {
      const localUser = localStorage.getItem('sv_user')
      if (localUser) return JSON.parse(localUser)
      const sessionUser = sessionStorage.getItem('sv_user')
      if (sessionUser) return JSON.parse(sessionUser)
    } catch (e) {
      console.error('Failed to parse user from storage', e)
    }
    return null
  })

  const [token, setToken] = useState(() => {
    if (DEV_MODE) return 'dev-mode'
    return localStorage.getItem('sv_token') || sessionStorage.getItem('sv_token') || null
  })

  // Start with loading = true to verify the token during initialization
  const [loading, setLoading] = useState(true)

  const fetchProfile = useCallback(async () => {
    try {
      const { data } = await getMe()
      setUser(data)
      // Save user profile to whichever storage is currently holding the token
      if (localStorage.getItem('sv_token')) {
        localStorage.setItem('sv_user', JSON.stringify(data))
      } else if (sessionStorage.getItem('sv_token')) {
        sessionStorage.setItem('sv_user', JSON.stringify(data))
      }
      return data;
    } catch (err) {
      // Clear invalid credentials
      localStorage.removeItem('sv_token')
      localStorage.removeItem('sv_user')
      sessionStorage.removeItem('sv_token')
      sessionStorage.removeItem('sv_user')
      setToken(null)
      setUser(null)
      throw err
    }
  }, [])

  // Auto restore session on startup
  useEffect(() => {
    const restoreSession = async () => {
      if (DEV_MODE) {
        setUser(DEV_ADMIN_USER)
        setToken('dev-mode')
        setLoading(false)
        return
      }

      const activeToken = localStorage.getItem('sv_token') || sessionStorage.getItem('sv_token')
      if (activeToken) {
        try {
          setToken(activeToken)
          await fetchProfile()
        } catch (err) {
          console.error('Failed to auto-restore session:', err)
        } finally {
          setLoading(false)
        }
      } else {
        setLoading(false)
      }
    }

    restoreSession()
  }, [fetchProfile])

  const login = useCallback(async (email, password, remember = true) => {
    setLoading(true)
    try {
      const { data } = await loginRequest(email, password)
      const storage = remember ? localStorage : sessionStorage
      
      // Store token first
      storage.setItem('sv_token', data.access_token)
      setToken(data.access_token)
      
      // Fetch profile to get real database user details
      const profile = await fetchProfile()
      storage.setItem('sv_user', JSON.stringify(profile))
      
      return { success: true }
    } catch (err) {
      const message = err?.response?.data?.detail || 'Invalid email or password'
      return { success: false, message }
    } finally {
      setLoading(false)
    }
  }, [fetchProfile])

  const logout = useCallback(() => {
    localStorage.removeItem('sv_token')
    localStorage.removeItem('sv_user')
    sessionStorage.removeItem('sv_token')
    sessionStorage.removeItem('sv_user')
    setToken(null)
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        loading,
        login,
        logout,
        refreshProfile: fetchProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
