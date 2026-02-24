import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export const useAuth = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [hasPortfolio, setHasPortfolio] = useState(false)

  // التحقق من وجود بورتفليو
  const checkPortfolio = async (userId) => {
    try {
      const { data } = await supabase
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
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      if (session?.user) {
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

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const { data: developer } = await supabase
            .from('developers')
            .select('*')
            .eq('id', session.user.id)
            .single()

          if (developer) {
            setUser(developer)
            await checkPortfolio(developer.id)
          }
        } else {
          setUser(null)
          setHasPortfolio(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // ======================
  // LOGIN (بدون تعديل)
  // ======================
  const login = async (email, password) => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

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

  // ======================
  // REGISTER (تم إصلاحه فقط)
  // ======================
  const register = async (userData) => {
    try {
      setLoading(true)
      setError(null)

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

      // 🔥 الإصلاح المهم هنا
      if (!data.user) {
        throw new Error('Registration failed. Please try again.')
      }

      const { data: developer, error: insertError } = await supabase
        .from('developers')
        .insert([{
          id: data.user.id,
          username:
            userData.full_name.toLowerCase().replace(/[^a-z0-9]/g, '-') +
            '-' +
            Math.random().toString(36).substring(2, 6),
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
