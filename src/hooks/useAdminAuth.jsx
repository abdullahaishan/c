import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export const useAdminAuth = () => {
  const [admin, setAdmin] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // التحقق من جلسة الأدمن عند التحميل
    checkAdminSession()

    // الاستماع لتغييرات المصادقة
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkAdminSession()
    })

    return () => subscription?.unsubscribe()
  }, [])

  const checkAdminSession = async () => {
    try {
      setLoading(true)
      
      // 1. جلب المستخدم الحالي من Auth
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setAdmin(null)
        return
      }

      console.log('🔍 Checking admin for user:', user.id)

      // 2. التحقق من وجوده في جدول admins
      const { data: adminData, error: adminError } = await supabase
        .from('admins')
        .select('*')
        .eq('developer_id', user.id)
        .single()

      if (adminError || !adminData) {
        console.log('❌ User is not an admin')
        setAdmin(null)
        return
      }

      // 3. جلب بيانات المطور (اختياري)
      const { data: developer } = await supabase
        .from('developers')
        .select('full_name, username, profile_image')
        .eq('id', user.id)
        .single()

      // 4. تخزين بيانات الأدمن
      setAdmin({
        id: user.id,
        email: user.email,
        full_name: developer?.full_name || user.email,
        username: developer?.username,
        profile_image: developer?.profile_image,
        role: adminData.role,
        permissions: adminData.permissions
      })

    } catch (err) {
      console.error('Error checking admin session:', err)
      setError(err.message)
      setAdmin(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      setLoading(true)
      setError(null)

      // 1. تسجيل الدخول عبر Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      // 2. التحقق من صلاحية الأدمن (سيتم عبر onAuthStateChange)
      return { success: true, user: data.user }

    } catch (err) {
      console.error('Admin login error:', err)
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      await supabase.auth.signOut()
      setAdmin(null)
    } catch (err) {
      console.error('Logout error:', err)
    }
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
