import { useState, useEffect } from 'react'
import { authService } from '../lib/supabase'
import { supabase } from '../lib/supabase' // ✅ أضف هذا السطر

export const useAuth = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [hasPortfolio, setHasPortfolio] = useState(false) // ✅ حالة جديدة

  // التحقق من وجود بورتفليو للمستخدم
  const checkPortfolio = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('portfolios')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle() // يستخدم maybeSingle بدلاً من single لتجنب الخطأ إذا لم يوجد
      
      setHasPortfolio(!!data)
      return !!data
    } catch (err) {
      console.error('Error checking portfolio:', err)
      setHasPortfolio(false)
      return false
    }
  }

  useEffect(() => {
    const initAuth = async () => {
      // التحقق من وجود مستخدم في localStorage
      const storedUser = localStorage.getItem('developer')
      if (storedUser) {
        const userData = JSON.parse(storedUser)
        setUser(userData)
        // التحقق من وجود بورتفليو
        await checkPortfolio(userData.id)
      }
      setLoading(false)
    }

    initAuth()
  }, [])

  const login = async (email, password) => {
    try {
      setLoading(true)
      setError(null)
      
      const userData = await authService.login(email, password)
      setUser(userData)
      localStorage.setItem('developer', JSON.stringify(userData))
      
      // التحقق من وجود بورتفليو بعد تسجيل الدخول
      await checkPortfolio(userData.id)
      
      return { success: true, user: userData }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  const register = async (userData) => {
    try {
      setLoading(true)
      setError(null)
      
      const newUser = await authService.register(userData)
      setUser(newUser)
      localStorage.setItem('developer', JSON.stringify(newUser))
      
      // المستخدم الجديد ليس لديه بورتفليو بعد
      setHasPortfolio(false)
      
      return { success: true, user: newUser }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    setHasPortfolio(false)
    localStorage.removeItem('developer')
  }

  // دالة لتحديث حالة البورتفليو (تُستدعى بعد إنشاء بورتفليو)
  const refreshPortfolioStatus = async () => {
    if (user) {
      await checkPortfolio(user.id)
    }
  }

  return {
    user,
    loading,
    error,
    hasPortfolio, // ✅ إضافة هذه الخاصية
    login,
    register,
    logout,
    refreshPortfolioStatus, // ✅ دالة لتحديث الحالة
    isAuthenticated: !!user
  }
}
