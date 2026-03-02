import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAdminAuth } from '../../hooks/useAdminAuth'
import { Mail, Lock, Eye, EyeOff, AlertCircle, Shield, XCircle } from 'lucide-react'
import AnimatedBackground from '../../components/AnimatedBackground'

const AdminLogin = () => {
  const navigate = useNavigate()
  const { login } = useAdminAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [debugInfo, setDebugInfo] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!email || !password) {
      setError('Email and password are required')
      return
    }

    setLoading(true)
    setError('')
    setDebugInfo(null)

    try {
      console.log('🔐 Admin login attempt:', email)
      
      const result = await login(email, password)
      
      console.log('📦 Login result:', result)
      
      if (result.success) {
        console.log('✅ Login successful, redirecting...')
        navigate('/admin')
      } else {
        console.log('❌ Login failed:', result.error)
        setError(result.error || 'Login failed')
        
        // تخزين معلومات التصحيح
        setDebugInfo({
          error: result.error,
          timestamp: new Date().toISOString(),
          email
        })
      }

    } catch (err) {
      console.error('💥 Unexpected error:', err)
      setError(err.message || 'An unexpected error occurred')
      
      setDebugInfo({
        error: err.message,
        stack: err.stack,
        timestamp: new Date().toISOString(),
        email
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen bg-[#030014] overflow-hidden">
      <AnimatedBackground />
      
      <Link
        to="/"
        className="absolute top-4 right-4 sm:top-6 sm:right-6 lg:top-8 lg:right-8 z-20 flex items-center gap-2 px-3 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-gray-300 hover:text-white transition-all group"
      >
        <span className="text-sm sm:text-base">Back to Home</span>
      </Link>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-3 sm:px-4 py-12 sm:py-16">
        <div className="w-full max-w-[90%] sm:max-w-md">
          
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex p-4 bg-gradient-to-r from-[#6366f1] to-[#a855f7] rounded-2xl mb-4">
              <Shield className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#6366f1] to-[#a855f7] mb-2">
              Admin Login
            </h2>
            <p className="text-sm sm:text-base text-gray-400">Sign in to admin panel</p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border border-white/10">
            
            {/* رسالة الخطأ العادية */}
            {error && (
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-500/10 border border-red-500/20 rounded-lg sm:rounded-xl text-red-400 text-xs sm:text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* معلومات التصحيح (تظهر فقط في حالة الخطأ) */}
            {debugInfo && (
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg sm:rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-medium text-yellow-400">🔍 Debug Information:</p>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify(debugInfo, null, 2))
                      alert('Copied to clipboard!')
                    }}
                    className="text-xs text-yellow-400 hover:text-yellow-300"
                  >
                    Copy
                  </button>
                </div>
                <pre className="text-xs text-yellow-300 overflow-auto max-h-40 whitespace-pre-wrap">
                  {JSON.stringify(debugInfo, null, 2)}
                </pre>
              </div>
            )}

            <form className="space-y-4 sm:space-y-5" onSubmit={handleSubmit}>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-3 bg-white/10 border border-white/20 rounded-lg sm:rounded-xl text-white text-sm sm:text-base placeholder-gray-400 focus:outline-none focus:border-[#6366f1] focus:ring-2 focus:ring-[#6366f1]/20 transition-all"
                    placeholder="admin@example.com"
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 sm:pl-10 pr-12 py-2 sm:py-3 bg-white/10 border border-white/20 rounded-lg sm:rounded-xl text-white text-sm sm:text-base placeholder-gray-400 focus:outline-none focus:border-[#6366f1] focus:ring-2 focus:ring-[#6366f1]/20 transition-all"
                    placeholder="••••••••"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 sm:py-3 px-4 bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base flex items-center justify-center gap-2 hover:scale-[1.02] transition-all duration-300 disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            <p className="mt-4 sm:mt-6 text-center text-xs sm:text-sm text-gray-400">
              <Link to="/login" className="text-[#a855f7] hover:text-[#6366f1] transition-colors">
                Regular user? Login here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminLogin
