import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { DEV_MODE } from '../context/AuthContext'

export default function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  // DEV_MODE: AuthContext always reports isAuthenticated=true, but this
  // explicit check keeps the intent obvious and future-proofs against
  // isAuthenticated logic changing later.
  if (!DEV_MODE && !isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return children
}
