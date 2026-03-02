import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../../hooks/useAdminAuth'
import { Shield, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react'
import AnimatedBackground from '../../components/AnimatedBackground'

const AdminLogin = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [localError, setLocalError] = useState('')
  
  const { login, loading } = useAdminAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLocalError('')

    if (!email || !password) {
      setLocalError('يرجى إدخال البريد الإلكتروني وكلمة المرور')
      return
    }

    const result = await login(email, password)
    
    if (result.success) {
      navigate('/admin')
    } else {
      setLocalError(result.error || 'فشل تسجيل الدخول')
    }
  }

  return (
    <div className="relative min-h-screen bg-[#030014] overflow-hidden">
      <AnimatedBackground />
      
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex p-4 bg-gradient-to-r from-[#6366f1] to-[#a855f7] rounded-2xl mb-4">
              <Shield className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">لوحة التحكم</h1>
            <p className="text-gray-400">تسجيل الدخول للإدارة</p>
          </div>

          {/* Login Form */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10">
            {localError && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-400">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm">{localError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  البريد الإلكتروني
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-[#6366f1] focus:outline-none transition"
                    placeholder="admin@example.com"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  كلمة المرور
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-[#6366f1] focus:outline-none transition"
                    placeholder="••••••••"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white rounded-xl font-semibold hover:scale-[1.02] transition disabled:opacity-50"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>جاري تسجيل الدخول...</span>
                  </div>
                ) : (
                  'تسجيل الدخول'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminLogin
