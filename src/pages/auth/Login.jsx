import React, { useState } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { Mail, Lock, LogIn, ArrowLeft } from 'lucide-react'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  
  // المسار الذي كان المستخدم يحاول الوصول إليه
  const from = location.state?.from?.pathname || '/dashboard'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await login(email, password)
    
    if (result.success) {
      navigate(from, { replace: true })
    } else {
      setError(result.error)
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#030014] flex items-center justify-center px-4">
      {/* رابط العودة */}
      <Link
        to="/"
        className="absolute top-8 left-8 flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to Home</span>
      </Link>

      <div className="max-w-md w-full space-y-8 bg-white/5 backdrop-blur-xl p-8 rounded-2xl border border-white/10">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#6366f1] to-[#a855f7]">
            Welcome Back
          </h2>
          <p className="mt-2 text-gray-400">Sign in to your account</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#6366f1] focus:ring-2 focus:ring-[#6366f1]/20 transition-all"
                placeholder="Email address"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-3 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#6366f1] focus:ring-2 focus:ring-[#6366f1]/20 transition-all"
                placeholder="Password"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember"
                type="checkbox"
                className="h-4 w-4 bg-white/10 border-white/20 rounded text-[#6366f1] focus:ring-[#6366f1]/20"
              />
              <label htmlFor="remember" className="ml-2 block text-sm text-gray-400">
                Remember me
              </label>
            </div>

            <Link
              to="/forgot-password"
              className="text-sm text-[#a855f7] hover:text-[#6366f1] transition-colors"
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white rounded-lg font-semibold flex items-center justify-center gap-2 hover:scale-[1.02] transition-all duration-300 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                Sign In
              </>
            )}
          </button>
        </form>

        {/* Register Link */}
        <p className="text-center text-gray-400">
          Don't have an account?{' '}
          <Link to="/register" className="text-[#a855f7] hover:text-[#6366f1] transition-colors">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Login