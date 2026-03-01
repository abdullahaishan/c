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

  useEffect(() => {
    const checkConfirmation = async () => {
      if (!user) {
        setChecking(false)
        return
      }

      try {
        // التحقق من تأكيد البريد
        const { data: { user: userData } } = await supabase.auth.getUser()
        setIsConfirmed(!!userData?.email_confirmed_at)

        // إذا كان مؤكداً، تحقق من وجوده في جدول developers
        if (userData?.email_confirmed_at) {
          // ✅ استخدم maybeSingle بدلاً من single
          const { data: developer } = await supabase
            .from('developers')
            .select('id')
            .eq('id', user.id)
            .maybeSingle()

          // إذا لم يكن في developers، حاول نقله من pending
          if (!developer) {
            // ✅ استخدم maybeSingle هنا أيضاً
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
      } catch (error) {
        console.error('Error checking confirmation:', error)
      } finally {
        setChecking(false)
      }
    }

    checkConfirmation()
  }, [user])

  if (loading || checking) {
    return <LoadingScreen />
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (!isConfirmed) {
    return <Navigate to="/verify-email" replace />
  }

  return children
}

export default ProtectedRoute
