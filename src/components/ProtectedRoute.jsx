// ProtectedRoute.jsx
import React, { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import LoadingScreen from './LoadingScreen'

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()
  const location = useLocation()
  const [checking, setChecking] = useState(true)
  const [isConfirmed, setIsConfirmed] = useState(false)
  const [showDashboard, setShowDashboard] = useState(false)

  useEffect(() => {
    const checkConfirmation = async () => {
      // إذا ما في user، نوقف التحقق
      if (!user) {
        setChecking(false)
        return
      }

      try {
        // ✅ التحقق من تأكيد البريد
        const { data: { user: userData } } = await supabase.auth.getUser()
        const confirmed = !!userData?.email_confirmed_at
        setIsConfirmed(confirmed)

        // ✅ إذا كان مؤكداً، تحقق من وجوده في جدول developers
        if (confirmed) {
          const { data: developer } = await supabase
            .from('developers')
            .select('id')
            .eq('id', user.id)
            .maybeSingle()

          // إذا لم يكن في developers، حاول نقله من pending
          if (!developer) {
            const { data: pending } = await supabase
              .from('pending_developers')
              .select('*')
              .eq('id', user.id)
              .maybeSingle()

            if (pending) {
              console.log('Moving user from pending to developers:', pending)
              
              // نقل البيانات تلقائياً
              await supabase
                .from('developers')
                .insert([{
                  id: pending.id,
                  username: pending.username,
                  email: pending.email,
                  full_name: pending.full_name,
                  plan_id: pending.plan_id,
                  role: pending.role
                }])

              await supabase
                .from('pending_developers')
                .delete()
                .eq('id', user.id)
            }
          }
        }

        // ✅ بعد كل هذا، نسمح بعرض المحتوى فوراً للمستخدمين المسجلين
        setShowDashboard(true)

      } catch (error) {
        console.error('Error checking confirmation:', error)
        setShowDashboard(true) // في حالة الخطأ، اعرض المحتوى
      } finally {
        setChecking(false)
      }
    }

    checkConfirmation()
  }, [user])

  // ✅ أولوية 1: إذا في user، اعرض المحتوى فوراً (حتى لو التحقق ما زال جارياً)
  if (user) {
    return children  // 🎯 Dashboard يظهر فوراً!
  }

  // ✅ أولوية 2: إذا في loading، انتظر
  if (loading) {
    return <LoadingScreen />
  }

  // ✅ أولوية 3: إذا ما في user، اذهب لصفحة تسجيل الدخول
  return <Navigate to="/" state={{ from: location }} replace />
}

export default ProtectedRoute
