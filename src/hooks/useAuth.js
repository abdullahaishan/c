import { useState, useEffect, useRef } from 'react'
import { authService } from '../lib/supabase'
import { supabase } from '../lib/supabase'

export const useAuth = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [hasPortfolio, setHasPortfolio] = useState(false)
  const initialLoadRef = useRef(true) // لمنع التحميل المزدوج
// ✅ دالة جلب بيانات المطور (قبل useEffect)
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
          fetchDeveloperData(session.user.id) // بدون await
        }
        return
      }

      // ✅ 3. إذا مافي كاش، جلب من الجلسة
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        // جلب من developers فقط (لا pending)
        const { data: developer } = await supabase
          .from('developers')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle()

        if (developer) {
          setUser(developer)
          localStorage.setItem('developer', JSON.stringify(developer))
        }
        // ❌ لا تتحقق من pending
      }
    } catch (err) {
      console.error('Init auth error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  initAuth()

  // ✅ onAuthStateChange مبسط
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    if (session?.user) {
      // جلب البيانات في الخلفية
      supabase
        .from('developers')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle()
        .then(({ data }) => {
          if (data) {
            setUser(data)
            localStorage.setItem('developer', JSON.stringify(data))
          }
        })
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
    
    if (!result.success) {
      throw new Error('Login failed')
    }

    // ✅ استخدم fetchDeveloperData
    const developer = await fetchDeveloperData(result.user.id)
    
    if (!developer) {
      throw new Error('User not found in developers table')
    }

    return { success: true, user: developer }

  } catch (err) {
    setError(err.message)
    return { success: false, error: err.message }
  } finally {
    setLoading(false) // ❌ لا تؤخرها
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

      setLoading(false) // إيقاف التحميل فوراً للتسجيل
      return { 
        success: true, 
        user: result.user,
        message: 'Verification link sent to your email'
      }

    } catch (err) {
      setError(err.message)
      setLoading(false)
      return { success: false, error: err.message }
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
    isAuthenticated: !!user, 
  }
}
