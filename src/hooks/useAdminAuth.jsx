import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export const useAdminAuth = () => {
  const [admin, setAdmin] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    checkAdminSession()
  }, [])

  const checkAdminSession = async () => {
    try {
      setLoading(true)
      
      // التحقق من الجلسة في localStorage
      const storedAdmin = localStorage.getItem('admin_session')
      if (storedAdmin) {
        const adminData = JSON.parse(storedAdmin)
        
        // التحقق من أن المستخدم لا يزال أدمن
        const { data } = await supabase
          .from('developers')
          .select('id, full_name, username, email, profile_image, is_admin, role')
          .eq('id', adminData.id)
          .eq('is_admin', true)
          .single()

        if (data) {
          setAdmin(data)
        } else {
          localStorage.removeItem('admin_session')
        }
      }
    } catch (err) {
      console.error('Error checking admin session:', err)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      setLoading(true)
      setError(null)

      // 1. تسجيل الدخول عبر Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (authError) throw authError

      // 2. التحقق من أن المستخدم أدمن
      const { data: developer, error: devError } = await supabase
        .from('developers')
        .select('id, full_name, username, email, profile_image, is_admin, role')
        .eq('id', authData.user.id)
        .eq('is_admin', true)
        .maybeSingle()

      if (devError || !developer) {
        await supabase.auth.signOut()
        throw new Error('غير مصرح لك بالدخول إلى لوحة التحكم')
      }

      // 3. تخزين الجلسة
      localStorage.setItem('admin_session', JSON.stringify(developer))
      setAdmin(developer)

      return { success: true, admin: developer }
    } catch (err) {
      console.error('Admin login error:', err)
      setError(err.message || 'فشل تسجيل الدخول')
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    localStorage.removeItem('admin_session')
    setAdmin(null)
  }

  return {
    admin,
    loading,
    error,
    login,
    logout,
    isAdmin: !!admin
  }
}
