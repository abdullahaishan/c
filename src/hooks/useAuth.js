import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase' // استيراد supabase مباشرة

export const useAuth = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [hasPortfolio, setHasPortfolio] = useState(false)

  // التحقق من وجود بورتفليو للمستخدم
  const checkPortfolio = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('portfolios')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle()
      
      setHasPortfolio(!!data)
      return !!data
    } catch (err) {
      console.error('Error checking portfolio:', err)
      setHasPortfolio(false)
      return false
    }
  }

  useEffect(() => {
    // ✅ استخدام Supabase Auth للتحقق من الجلسة
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        // جلب بيانات المطور من جدول developers
        const { data: developer } = await supabase
          .from('developers')
          .select('*')
          .eq('id', session.user.id)
          .single()
        
        if (developer) {
          setUser(developer)
          await checkPortfolio(developer.id)
        }
      }
      setLoading(false)
    }

    getSession()

    // الاستماع لتغييرات الجلسة
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data: developer } = await supabase
          .from('developers')
          .select('*')
          .eq('id', session.user.id)
          .single()
        
        setUser(developer)
        await checkPortfolio(developer.id)
      } else {
        setUser(null)
        setHasPortfolio(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

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

      // جلب بيانات المطور
      const { data: developer } = await supabase
        .from('developers')
        .select('*')
        .eq('id', data.user.id)
        .single()

      setUser(developer)
      await checkPortfolio(developer.id)
      
      return { success: true, user: developer }
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
      
      // ✅ استخدام Supabase Auth للتسجيل
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            full_name: userData.full_name
          }
        }
      })

      if (error) throw error

      // إنشاء سجل في جدول developers
      const { data: developer, error: insertError } = await supabase
        .from('developers')
        .insert([{
          id: data.user.id, // ✅ استخدام نفس id من Auth
          username: userData.full_name.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Math.random().toString(36).substring(2, 6),
          email: userData.email,
          full_name: userData.full_name,
          role: 'user',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (insertError) throw insertError

      setUser(developer)
      setHasPortfolio(false)
      
      return { success: true, user: developer }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setHasPortfolio(false)
  }

  const refreshPortfolioStatus = async () => {
    if (user) {
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
