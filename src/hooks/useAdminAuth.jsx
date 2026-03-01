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
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        await checkAdminRole(session.user.id)
      } else {
        setAdmin(null)
      }
    } catch (err) {
      console.error('Error checking admin session:', err)
      setError('Failed to check admin session')
    } finally {
      setLoading(false)
    }
  }

  const checkAdminRole = async (userId) => {
    try {
      // 1. جلب بيانات المطور الأساسية
      const { data: developer, error: devError } = await supabase
        .from('developers')
        .select(`
          id,
          username,
          email,
          full_name,
          profile_image,
          role,
          plan_id
        `)
        .eq('id', userId)
        .single()

      if (devError || !developer) {
        console.log('User is not a developer')
        setAdmin(null)
        return
      }

      // 2. التحقق من وجوده في جدول admins
      const { data: adminData, error: adminError } = await supabase
        .from('admins')
        .select('*')
        .eq('developer_id', userId)
        .eq('is_active', true)
        .single()

      if (adminError || !adminData) {
        console.log('Developer is not an admin')
        setAdmin(null)
        return
      }

      // 3. دمج البيانات
      setAdmin({
        id: developer.id,
        username: developer.username,
        email: developer.email,
        full_name: developer.full_name,
        profile_image: developer.profile_image,
        role: adminData.role, // 'super_admin', 'admin', 'moderator'
        permissions: adminData.permissions,
        developer_role: developer.role // 'user' أو 'admin'
      })

      // تحديث آخر دخول (اختياري)
      await supabase
        .from('admins')
        .update({ last_login: new Date() })
        .eq('developer_id', userId)

    } catch (err) {
      console.error('Error checking admin role:', err)
      setAdmin(null)
    }
  }

  const login = async (email, password) => {
    try {
      setLoading(true)
      setError(null)

      // تسجيل الدخول عبر Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      return { success: true, user: data.user }
    } catch (err) {
      console.error('Admin login error:', err)
      setError(err.message || 'Login failed')
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      setLoading(true)
      await supabase.auth.signOut()
      setAdmin(null)
    } catch (err) {
      console.error('Logout error:', err)
      setError('Logout failed')
    } finally {
      setLoading(false)
    }
  }

  // دوال مساعدة
  const isSuperAdmin = () => admin?.role === 'super_admin'
  const isAdmin = () => !!admin
  const hasRole = (role) => admin?.role === role
  const hasAnyRole = (roles) => roles.includes(admin?.role)
  const hasPermission = (permission) => {
    return admin?.permissions?.includes(permission) || isSuperAdmin()
  }

  return {
    admin,
    loading,
    error,
    login,
    logout,
    isSuperAdmin,
    isAdmin,
    hasRole,
    hasAnyRole,
    hasPermission
  }
}
