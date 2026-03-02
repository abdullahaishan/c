import { useState, useEffect } from 'react'
import { authService } from '../lib/supabase'
import { supabase } from '../lib/supabase'

export const useAuth = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [hasPortfolio, setHasPortfolio] = useState(false)

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
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user) {
          const { data: developer } = await supabase
            .from('developers')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle()

          if (developer) {
            setUser(developer)
            await checkPortfolio(developer.id)
          } else {
            const { data: pending } = await supabase
              .from('pending_developers')
              .select('*')
              .eq('id', session.user.id)
              .maybeSingle()

            if (pending) {
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

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        initAuth()
      } else {
        setUser(null)
        setHasPortfolio(false)
      }
    })

    return () => subscription?.unsubscribe()
  }, [])

  // ✅ دالة login المصححة
  const login = async (email, password) => {
    try {
      setLoading(true)
      setError(null)

      const result = await authService.login(email, password)
      
      if (!result.success) {
        throw new Error('Login failed')
      }

      const userFromAuth = result.user

      // جلب بيانات إضافية من developers
      const { data: developer } = await supabase
        .from('developers')
        .select('*')
        .eq('id', userFromAuth.id)
        .maybeSingle()

      const userData = developer || userFromAuth

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
        user: result.user,
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

const isAdmin = user?.is_admin || false

  return {
    user,
    loading,
    error,
    hasPortfolio,
    login,
    register,
    logout,
    refreshPortfolioStatus,
    isAuthenticated: !!user, 
    isAdmin,
  }
}
