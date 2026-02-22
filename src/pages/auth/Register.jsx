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

    // التحقق من تطابق كلمة المرور
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    // التحقق من قوة كلمة المرور
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    const result = await register({
      full_name: formData.fullName,
      email: formData.email,
      password: formData.password
    })
    
    if (result.success) {
      navigate('/dashboard')
    } else {
      setError(result.error)
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#030014] flex items-center justify-center px-4">
      {/* Back Link */}
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
            Create Account
          </h2>
          <p className="mt-2 text-gray-400">Join the developer community</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Register Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                name="fullName"
                required
                value={formData.fullName}
                onChange={handleChange}
                className="w-full pl-10 pr-3 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#6366f1] focus:ring-2 focus:ring-[#6366f1]/20 transition-all"
                placeholder="Full name"
              />
            </div>

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-10 pr-3 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#6366f1] focus:ring-2 focus:ring-[#6366f1]/20 transition-all"
                placeholder="Email address"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-10 pr-3 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#6366f1] focus:ring-2 focus:ring-[#6366f1]/20 transition-all"
                placeholder="Password"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="password"
                name="confirmPassword"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full pl-10 pr-3 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#6366f1] focus:ring-2 focus:ring-[#6366f1]/20 transition-all"
                placeholder="Confirm password"
              />
            </div>
          </div>

          <div className="text-sm text-gray-400">
            <p>By signing up, you agree to our</p>
            <div className="flex gap-2 justify-center mt-1">
              <Link to="/terms" className="text-[#a855f7] hover:text-[#6366f1]">
                Terms of Service
              </Link>
              <span className="text-gray-600">and</span>
              <Link to="/privacy" className="text-[#a855f7] hover:text-[#6366f1]">
                Privacy Policy
              </Link>
            </div>
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
                <UserPlus className="w-5 h-5" />
                Create Account
              </>
            )}
          </button>
        </form>

        {/* Login Link */}
        <p className="text-center text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="text-[#a855f7] hover:text-[#6366f1] transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Register