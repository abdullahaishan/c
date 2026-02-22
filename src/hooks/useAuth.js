import { useState, useEffect } from 'react'
import { authService } from '../lib/supabase'

export const useAuth = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // التحقق من وجود مستخدم في localStorage
    const storedUser = localStorage.getItem('developer')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    try {
      setLoading(true)
      setError(null)
      
      const userData = await authService.login(email, password)
      setUser(userData)
      localStorage.setItem('developer', JSON.stringify(userData))
      
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
    localStorage.removeItem('developer')
  }

  return {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!user
  }
}