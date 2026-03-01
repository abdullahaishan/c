import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export const useAdminAuth = () => {
  const [admin, setAdmin] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // التحقق من جلسة الأدمن عند التحميل
    checkAdminSession()

    // الاستماع لتغييرات الجلسة
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        checkAdminRole(session.user.id)
      } else {
        setAdmin(null)
      }
    })

    return () => subscription?.unsubscribe()
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
      // التحقق من وجود المستخدم في جدول admins
      const { data, error } = await supabase
        .from('admins')
        .select('*')
        .eq('id', userId) // id نفس user_id من Auth
        .single()

      if (error) throw error
      
      if (data) {
        setAdmin({
          id: data.id,
          username: data.username,
          email: data.email,
          role: data.role
        })
      } else {
        // إذا لم يكن في جدول admins، نسجل خروجه
        await supabase.auth.signOut()
        setAdmin(null)
      }
    } catch (err) {
      console.error('Error checking admin role:', err)
      setAdmin(null)
    }
  }

  const login = async (email, password) => {
    try {
      setLoading(true)
      setError(null)

      // ✅ استخدام Supabase Auth لتسجيل الدخول
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      // ✅ التحقق من صلاحية الأدمن (يتم تلقائياً عبر onAuthStateChange)
      // لا حاجة لإعادة التحقق هنا لأن useEffect سيتولى ذلك

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

  return {
    admin,
    loading,
    error,
    login,
    logout,
    isAdmin: !!admin
  }
}
