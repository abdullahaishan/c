import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import LoadingScreen from './LoadingScreen'

const ProtectedRoute = ({ children }) => {
  const { user, loading, isAuthenticated } = useAuth()
  const location = useLocation()

  if (loading) {
    return <LoadingScreen />
  }

  if (!isAuthenticated) {
    // حفظ المسار الحالي للعودة إليه بعد تسجيل الدخول
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}

export default ProtectedRoute