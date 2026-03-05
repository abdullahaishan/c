import { useState, useEffect } from 'react'
import { authService } from '../lib/supabase'
import { supabase } from '../lib/supabase'

export const useAuth = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // ✅ دالة جلب بيانات المطور
  const fetchDeveloperData = async (userId) => {
    try {
      const { data: developer, error } = await supabase
        .from('developers')
        .select('*')
        .eq('id', userId)
        .maybeSingle()
      
      if (error) throw error
      
      if (developer) {
        setUser(developer)
        localStorage.setItem('developer', JSON.stringify(developer))
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
        // ✅ 1. تحقق من localStorage أولاً
        const cachedUser = localStorage.getItem('developer')
        if (cachedUser) {
          setUser(JSON.parse(cachedUser))
          setLoading(false)
          
          // ✅ 2. تحديث في الخلفية
          const { data: { session } } = await supabase.auth.getSession()
          if (session?.user) {
            fetchDeveloperData(session.user.id)
          }
          return
        }

        // ✅ 3. إذا مافي كاش، جلب من الجلسة
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user) {
          const { data: developer } = await supabase
            .from('developers')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle()

          if (developer) {
            setUser(developer)
            localStorage.setItem('developer', JSON.stringify(developer))
          }
        }
      } catch (err) {
        console.error('Init auth error:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    initAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchDeveloperData(session.user.id)
      } else {
        setUser(null)
        localStorage.removeItem('developer')
      }
    })

    return () => subscription?.unsubscribe()
  }, [])

  const login = async (email, password) => {
    try {
      setLoading(true)
      setError(null)

      const result = await authService.login(email, password)
      if (!result.success) throw new Error('Login failed')

      // ✅ جلب البيانات في الخلفية
      fetchDeveloperData(result.user.id)

      return { success: true, user: result.user }

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

  const logout = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      localStorage.removeItem('developer')
    } catch (err) {
      console.error('Logout error:', err)
    }
  }

  return {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!user, 
  }
}
