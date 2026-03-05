import { useState, useEffect } from 'react'
import { authService } from '../lib/supabase'
import { supabase } from '../lib/supabase'

export const useAuth = () => {
  const [user, setUser] = useState(null)      // ✅ { id: "uuid" } فقط في البداية
  const [fullData, setFullData] = useState(null) // ✅ البيانات الكاملة
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // ✅ دالة جلب البيانات الكاملة (تشتغل في الخلفية)
  const fetchDeveloperData = async (userId) => {
    try {
      const { data: developer, error } = await supabase
        .from('developers')
        .select('*')
        .eq('id', userId)
        .maybeSingle()
      
      if (error) throw error
      
      if (developer) {
        setFullData(developer)
        localStorage.setItem('developer_full', JSON.stringify(developer))
      }
      return developer
    } catch (err) {
      console.error('Error fetching developer:', err)
      return null
    }
  }

  useEffect(() => {
    const initAuth = async () => {
      try {
        // ✅ 1. جرب UUID من localStorage أولاً
        const storedUserId = localStorage.getItem('user_id')
        if (storedUserId) {
          setUser({ id: storedUserId }) // ✅ UUID فقط فوراً
          
          // ✅ جرب البيانات الكاملة من localStorage
          const storedFullData = localStorage.getItem('developer_full')
          if (storedFullData) {
            setFullData(JSON.parse(storedFullData))
          }
        }

        // ✅ 2. تحقق من الجلسة الحقيقية (في الخلفية)
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user) {
          const uuid = session.user.id
          
          // ✅ حدث UUID إذا اختلف
          if (storedUserId !== uuid) {
            setUser({ id: uuid })
            localStorage.setItem('user_id', uuid)
          }
          
          // ✅ جلب البيانات الكاملة في الخلفية (دائماً)
          fetchDeveloperData(uuid)
        } else if (storedUserId) {
          // إذا كان UUID موجود بس مافي جلسة → امسح كل شيء
          setUser(null)
          setFullData(null)
          localStorage.removeItem('user_id')
          localStorage.removeItem('developer_full')
        }
      } catch (err) {
        console.error('Init auth error:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    initAuth()

    // ✅ استماع لتغييرات المصادقة
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const uuid = session.user.id
        
        // ✅ حدث UUID فوراً
        setUser({ id: uuid })
        localStorage.setItem('user_id', uuid)
        
        // ✅ جلب البيانات الكاملة في الخلفية
        fetchDeveloperData(uuid)
      } else {
        setUser(null)
        setFullData(null)
        localStorage.removeItem('user_id')
        localStorage.removeItem('developer_full')
      }
    })

    return () => subscription?.unsubscribe()
  }, [])

  // ✅ دالة تسجيل الدخول
  const login = async (email, password) => {
    try {
      setLoading(true)
      setError(null)

      const result = await authService.login(email, password)
      if (!result.success) throw new Error('Login failed')

      const uuid = result.user.id

      // ✅ 1. حدث UUID فوراً (Dashboard يظهر)
      setUser({ id: uuid })
      localStorage.setItem('user_id', uuid)

      // ✅ 2. جلب البيانات الكاملة في الخلفية
      fetchDeveloperData(uuid)

      return { success: true, user: { id: uuid } }

    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

const register = async (formData) => {
    try {
      setLoading(true)
      setError(null)

      const result = await authService.register(formData)
      
      if (!result.success) {
        throw new Error(result.message || 'Registration failed')
      }

      return { 
        success: true, 
        message: 'Verification link sent to your email'
      }

    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  // ✅ دالة تسجيل الخروج
  const logout = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setFullData(null)
      localStorage.removeItem('user_id')
      localStorage.removeItem('developer_full')
    } catch (err) {
      console.error('Logout error:', err)
    }
  }

  return {
    user,        // ✅ { id: "uuid" } - يظهر فوراً
    fullData,    // ✅ البيانات الكاملة (تظهر بعدين)
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  }
}
