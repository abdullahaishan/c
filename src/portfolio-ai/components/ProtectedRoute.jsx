import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import LoadingScreen from './LoadingScreen'

const ProtectedRoute = ({ children, requirePortfolio = false }) => {
  const { user, loading, hasPortfolio } = useAuth()
  const location = useLocation()

  if (loading) {
    return <LoadingScreen />
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // إذا كان المسار يحتاج بورتفليو ولا يوجد، يوجه إلى builder
  if (requirePortfolio && !hasPortfolio) {
    return <Navigate to="/app/builder" replace />
  }

  return children
}

export default ProtectedRoute
