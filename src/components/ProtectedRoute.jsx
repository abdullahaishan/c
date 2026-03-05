// ProtectedRoute.jsx - المعدل النهائي
import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
//import LoadingScreen from './LoadingScreen'

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth()
  const location = useLocation()

  // ✅ 1. إذا في user، اعرض المحتوى فوراً (بدون أي تحقق إضافي)
  if (user) {
    return children  // 🎯 Dashboard يظهر فوراً
  }

  // ✅ 2. إذا في loading، انتظر
// if (loading) {
//   return <LoadingScreen />
// }

  // ✅ 3. إذا ما في user، اذهب لتسجيل الدخول
  return <Navigate to="/" state={{ from: location }} replace />
}

export default ProtectedRoute
