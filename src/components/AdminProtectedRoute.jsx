import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAdminAuth } from '../hooks/useAdminAuth'  // ← فقط useAdminAuth
import LoadingScreen from './LoadingScreen'

const AdminProtectedRoute = ({ children }) => {  // ← أزل adminOnly
  const { admin, loading } = useAdminAuth()
  const location = useLocation()

  if (loading) {
    return <LoadingScreen />
  }

  if (!admin) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />
  }

  return children
}

export default AdminProtectedRoute
