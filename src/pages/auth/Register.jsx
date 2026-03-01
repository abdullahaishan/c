import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { Mail, Lock, User, UserPlus, ArrowLeft } from 'lucide-react'

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [rateLimit, setRateLimit] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setRateLimit(false)

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    try {
      const result = await register({
        full_name: formData.fullName,
        email: formData.email,
        password: formData.password
      })
      
      if (result.success) {
        setSuccess('✅ Account created! Verification link sent to your email')
        
        setTimeout(() => {
          navigate('/verify-email')
        }, 2000)
      } else {
        // Check if it's a rate limit error
        if (result.error?.includes('rate limit') || result.error?.includes('Rate limit')) {
          setRateLimit(true)
          setError('Too many registration attempts. Please wait a moment before trying again.')
          
          // Start cooldown timer
          setCooldown(60)
          const timer = setInterval(() => {
            setCooldown(prev => {
              if (prev <= 1) {
                clearInterval(timer)
                setRateLimit(false)
                return 0
              }
              return prev - 1
            })
          }, 1000)
        } else {
          setError(result.error || 'Registration failed')
        }
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen bg-[#030014] overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-pulse-slow"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-blue-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 hidden sm:block animate-pulse-slow animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-96 h-96 bg-indigo-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-pulse-slow animation-delay-4000"></div>
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f10_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f10_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      </div>

      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-4 right-4 sm:top-6 sm:right-6 lg:top-8 lg:right-8 z-20 flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 transition-all group"
      >
        <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm sm:text-base">Back</span>
      </button>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-3 sm:px-4 py-12 sm:py-16">
        <div className="w-full max-w-[90%] sm:max-w-md md:max-w-lg lg:max-w-md">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#6366f1] to-[#a855f7] mb-2">
              Create Account
            </h2>
            <p className="text-sm sm:text-base text-gray-400">Join the professional developer community</p>
          </div>

          {/* Form Card */}
          <div className="bg-white/5 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 border border-white/10">
            {/* Rate Limit Message */}
            {rateLimit && (
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg sm:rounded-xl">
                <p className="text-yellow-400 text-xs sm:text-sm font-medium mb-1">
                  ⚠️ Too many registration attempts
                </p>
                <p className="text-gray-400 text-xs sm:text-sm">
                  Please wait {cooldown} seconds before trying again
                </p>
              </div>
            )}

            {/* Error Message */}
            {error && !rateLimit && (
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-500/10 border border-red-500/20 rounded-lg sm:rounded-xl text-red-400 text-xs sm:text-sm">
                {error}
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-green-500/10 border border-green-500/20 rounded-lg sm:rounded-xl text-green-400 text-xs sm:text-sm">
                {success}
              </div>
            )}

            {/* Form */}
            <form className="space-y-4 sm:space-y-5" onSubmit={handleSubmit}>
              {/* Full Name */}
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                <input
                  type="text"
                  name="fullName"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  disabled={rateLimit}
                  className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 bg-white/10 border border-white/20 rounded-lg sm:rounded-xl text-white text-sm sm:text-base placeholder-gray-400 focus:outline-none focus:border-[#6366f1] focus:ring-2 focus:ring-[#6366f1]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Full name"
                />
              </div>

              {/* Email */}
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  disabled={rateLimit}
                  className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 bg-white/10 border border-white/20 rounded-lg sm:rounded-xl text-white text-sm sm:text-base placeholder-gray-400 focus:outline-none focus:border-[#6366f1] focus:ring-2 focus:ring-[#6366f1]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Email address"
                />
              </div>

              {/* Password */}
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  disabled={rateLimit}
                  className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 bg-white/10 border border-white/20 rounded-lg sm:rounded-xl text-white text-sm sm:text-base placeholder-gray-400 focus:outline-none focus:border-[#6366f1] focus:ring-2 focus:ring-[#6366f1]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Password"
                />
              </div>

              {/* Confirm Password */}
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={rateLimit}
                  className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 bg-white/10 border border-white/20 rounded-lg sm:rounded-xl text-white text-sm sm:text-base placeholder-gray-400 focus:outline-none focus:border-[#6366f1] focus:ring-2 focus:ring-[#6366f1]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Confirm password"
                />
              </div>

              {/* Terms */}
              <div className="text-xs sm:text-sm text-gray-400 text-center">
                <p>By creating an account, you agree to our</p>
                <div className="flex gap-2 justify-center mt-1">
                  <Link to="/terms" className="text-[#a855f7] hover:text-[#6366f1] transition-colors">
                    Terms of Service
                  </Link>
                  <span className="text-gray-600">and</span>
                  <Link to="/privacy" className="text-[#a855f7] hover:text-[#6366f1] transition-colors">
                    Privacy Policy
                  </Link>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || rateLimit}
                className="w-full py-2.5 sm:py-3 px-4 bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base flex items-center justify-center gap-2 hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:hover:scale-100"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 sm:w-5 sm:h-5" />
                    Create Account
                  </>
                )}
              </button>
            </form>

            {/* Login Link */}
            <p className="mt-4 sm:mt-6 text-center text-xs sm:text-sm text-gray-400">
              Already have an account?{' '}
              <Link to="/login" className="text-[#a855f7] hover:text-[#6366f1] transition-colors font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register
