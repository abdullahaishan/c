// src/components/AdminRoute.jsx
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const AdminRoute = ({ children }) => {
  const { user, isAdmin, loading } = useAuth()

  if (loading) return <div>Loading...</div>
  
  if (!user) return <Navigate to="/login" replace />
  if (!isAdmin) return <Navigate to="/dashboard" replace />
  
  return children
}

export default AdminRoute
