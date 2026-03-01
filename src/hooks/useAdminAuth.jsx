import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import bcrypt from 'bcryptjs'

export const useAdminAuth = () => {
  const [admin, setAdmin] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // التحقق من الجلسة المخزنة في localStorage
    checkStoredSession()
  }, [])

  const checkStoredSession = () => {
    try {
      const storedAdmin = localStorage.getItem('admin_session')
      if (storedAdmin) {
        setAdmin(JSON.parse(storedAdmin))
      }
    } catch (err) {
      console.error('Error checking stored session:', err)
    } finally {
      setLoading(false)
    }
  }

  const login = async (username, password) => {
    try {
      setLoading(true)
      setError(null)

      // ✅ البحث في جدول admins مباشرة
      const { data, error } = await supabase
        .from('admins')
        .select('*')
        .eq('username', username)
        .single()

      if (error || !data) {
        throw new Error('Invalid username or password')
      }

      // ✅ التحقق من كلمة المرور
      const isValid = await bcrypt.compare(password, data.password_hash)
      
      if (!isValid) {
        throw new Error('Invalid username or password')
      }

      // ✅ تخزين بيانات الأدمن (بدون hash)
      const adminData = {
        id: data.id,
        username: data.username,
        email: data.email,
        role: data.role,
        permissions: data.permissions
      }

      localStorage.setItem('admin_session', JSON.stringify(adminData))
      setAdmin(adminData)

      return { success: true, admin: adminData }
    } catch (err) {
      console.error('Admin login error:', err)
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
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
