import { useState, useEffect } from 'react'
import { authService } from '../lib/supabase'
import { supabase } from '../lib/supabase'

export const useAuth = () => {
  const [user, setUser] = useState(null)  // فقط { id }
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true

    const initAuth = async () => {
      try {
        // 1️⃣ UUID من localStorage (فوري)
        const storedUserId = localStorage.getItem('user_id')
        if (storedUserId && isMounted) {
          setUser({ id: storedUserId })
        }

        // 2️⃣ تحقق من الجلسة الحقيقية
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user && isMounted) {
          const uuid = session.user.id
          
          if (storedUserId !== uuid) {
            setUser({ id: uuid })
            localStorage.setItem('user_id', uuid)
          }
        } else if (storedUserId && isMounted) {
          // لا توجد جلسة → امسح
          setUser(null)
          localStorage.removeItem('user_id')
        }
      } catch (err) {
        if (isMounted) setError(err.message)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    initAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user && isMounted) {
        setUser({ id: session.user.id })
        localStorage.setItem('user_id', session.user.id)
      } else if (isMounted) {
        setUser(null)
        localStorage.removeItem('user_id')
      }
    })

    return () => {
      isMounted = false
      subscription?.unsubscribe()
    }
  }, [])

  const login = async (email, password) => {
    try {
      setLoading(true)
      setError(null)

      const result = await authService.login(email, password)
      if (!result.success) throw new Error('Login failed')

      setUser({ id: result.user.id })
      localStorage.setItem('user_id', result.user.id)

      return { success: true, user: { id: result.user.id } }

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
    await supabase.auth.signOut()
    setUser(null)
    localStorage.removeItem('user_id')
  }

  return {
    user,  // فقط { id: uuid }
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  }
}

