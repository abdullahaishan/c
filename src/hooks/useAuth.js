import { useState, useEffect } from 'react'
import { authService } from '../lib/supabase'
import { supabase } from '../lib/supabase'

export const useAuth = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [hasPortfolio, setHasPortfolio] = useState(false)

  // ✅ التحقق من وجود بورتفليو
  const checkPortfolio = async (userId) => {
    if (!userId) {
      setHasPortfolio(false)
      return false
    }

    try {
      const { data, error } = await supabase
        .from('portfolios')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle()

      if (error) {
        console.error('Portfolio error:', error)
        setHasPortfolio(false)
        return false
      }

      const exists = !!data
      setHasPortfolio(exists)
      return exists
    } catch (err) {
      console.error('Error checking portfolio:', err)
      setHasPortfolio(false)
      return false
    }
  }

  useEffect(() => {
    const initAuth = async () => {
      try {
        // ✅ استخدام Supabase Auth للتحقق من الجلسة
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user) {
          // جلب بيانات المطور من جدول developers (وليس localStorage)
          const { data: developer } = await supabase
            .from('developers')
            .select('*')
            .eq('id', session.user.id)
            .single()

          if (developer) {
            setUser(developer)
            await checkPortfolio(developer.id)
          } else {
            // إذا لم يكن في developers، تحقق من pending_developers
            const { data: pending } = await supabase
              .from('pending_developers')
              .select('*')
              .eq('id', session.user.id)
              .single()

            if (pending) {
              // المستخدم في مرحلة الانتظار
              setUser({ ...pending, pending: true })
            }
          }
        }
      } catch (err) {
        console.error('Init auth error:', err)
      } finally {
        setLoading(false)
      }
    }

    initAuth()

    // الاستماع لتغييرات المصادقة
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        // تحديث حالة المستخدم عند تغيير الجلسة
        initAuth()
      } else {
        setUser(null)
        setHasPortfolio(false)
      }
    })

    return () => subscription?.unsubscribe()
  }, [])

  // ✅ تسجيل الدخول
  const login = async (email, password) => {
    try {
      setLoading(true)
      setError(null)

      const userData = await authService.login(email, password)

      if (!userData || !userData.id) {
        throw new Error('Login failed: invalid user data')
      }

      setUser(userData)
      localStorage.setItem('developer', JSON.stringify(userData))

      await checkPortfolio(userData.id)

      return { success: true, user: userData }

    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  // ✅ إنشاء حساب - ✅ الأهم: التعديل هنا
  const register = async (formData) => {
    try {
      setLoading(true)
      setError(null)

      const result = await authService.register(formData)
      
      // ✅ authService.register يعيد { success, user, message }
      if (!result.success) {
        throw new Error(result.message || 'Registration failed')
      }

      // لا نضع المستخدم في state مباشرة لأنه غير مؤكد بعد
      // نوجهه لصفحة التأكيد

      return { 
        success: true, 
        user: result.user,
        message: 'تم إرسال رابط التأكيد إلى بريدك الإلكتروني'
      }

    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  // ✅ تسجيل الخروج
  const logout = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setHasPortfolio(false)
      localStorage.removeItem('developer')
    } catch (err) {
      console.error('Logout error:', err)
    }
  }

  const refreshPortfolioStatus = async () => {
    if (user && user.id) {
      await checkPortfolio(user.id)
    }
  }

  return {
    user,
    loading,
    error,
    hasPortfolio,
    login,
    register,
    logout,
    refreshPortfolioStatus,
    isAuthenticated: !!user
  }
}
