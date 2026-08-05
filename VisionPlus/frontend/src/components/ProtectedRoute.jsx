import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { DEV_MODE } from '../context/AuthContext'
import { PageLoader } from './Loader'

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  // Wait for AuthContext session verification on startup
  if (loading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-surface">
        <PageLoader label="Verifying session..." />
      </div>
    )
  }

  // DEV_MODE: AuthContext always reports isAuthenticated=true, but this
  // explicit check keeps the intent obvious and future-proofs against
  // isAuthenticated logic changing later.
  if (!DEV_MODE && !isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return children
}
