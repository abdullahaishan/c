import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useAdminAuth } from '../hooks/useAdminAuth'
import LoadingScreen from './LoadingScreen'

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth()
  const { admin, loading: adminLoading } = useAdminAuth()
  const location = useLocation()

  // حالة التحميل
  if (loading || (adminOnly && adminLoading)) {
    return <LoadingScreen />
  }

  // إذا كان المسار خاص بالأدمن
  if (adminOnly) {
    if (!admin) {
      return <Navigate to="/login" state={{ from: location }} replace />
    }
    return children
  }

  // إذا كان مسار عادي (للمستخدمين العاديين)
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}

export default ProtectedRoute
