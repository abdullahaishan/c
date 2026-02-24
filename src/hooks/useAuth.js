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
        const storedUser = localStorage.getItem('developer')

        if (storedUser) {
          const userData = JSON.parse(storedUser)

          if (userData && userData.id) {
            setUser(userData)
            await checkPortfolio(userData.id)
          } else {
            localStorage.removeItem('developer')
          }
        }
      } catch (err) {
        console.error('Init auth error:', err)
        localStorage.removeItem('developer')
      } finally {
        setLoading(false)
      }
    }

    initAuth()
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

  // ✅ إنشاء حساب
  const register = async (formData) => {
    try {
      setLoading(true)
      setError(null)

      const newUser = await authService.register(formData)

      if (!newUser || !newUser.id) {
        throw new Error('Registration failed: invalid user data')
      }

      setUser(newUser)
      localStorage.setItem('developer', JSON.stringify(newUser))

      setHasPortfolio(false)

      return { success: true, user: newUser }

    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  // ✅ تسجيل الخروج
  const logout = () => {
    setUser(null)
    setHasPortfolio(false)
    localStorage.removeItem('developer')
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
