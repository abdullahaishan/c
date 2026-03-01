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

    // التحقق من تطابق كلمة المرور
    if (formData.password !== formData.confirmPassword) {
      setError('كلمات المرور غير متطابقة')
      return
    }

    // التحقق من قوة كلمة المرور
    if (formData.password.length < 6) {
      setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل')
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
        setSuccess('✅ تم إنشاء الحساب! تم إرسال رابط التأكيد إلى بريدك الإلكتروني')
        
        // التوجيه إلى صفحة التأكيد بعد 2 ثانية
        setTimeout(() => {
          navigate('/verify-email')
        }, 2000)
      } else {
        setError(result.error || 'فشل إنشاء الحساب')
      }
    } catch (err) {
      setError(err.message || 'حدث خطأ غير متوقع')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#030014] flex items-center justify-center px-4">
      {/* Back Link */}
      <Link
        to="/"
        className="absolute top-8 left-8 flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>العودة للرئيسية</span>
      </Link>

      <div className="max-w-md w-full space-y-8 bg-white/5 backdrop-blur-xl p-8 rounded-2xl border border-white/10">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#6366f1] to-[#a855f7]">
            إنشاء حساب جديد
          </h2>
          <p className="mt-2 text-gray-400">انضم إلى مجتمع المطورين</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-3 rounded-lg text-sm">
            {success}
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
                placeholder="الاسم الكامل"
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
                placeholder="البريد الإلكتروني"
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
                placeholder="كلمة المرور"
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
                placeholder="تأكيد كلمة المرور"
              />
            </div>
          </div>

          <div className="text-sm text-gray-400 text-center">
            <p>بإنشاء حسابك، أنت توافق على</p>
            <div className="flex gap-2 justify-center mt-1">
              <Link to="/terms" className="text-[#a855f7] hover:text-[#6366f1]">
                شروط الخدمة
              </Link>
              <span className="text-gray-600">و</span>
              <Link to="/privacy" className="text-[#a855f7] hover:text-[#6366f1]">
                سياسة الخصوصية
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
                إنشاء حساب
              </>
            )}
          </button>
        </form>

        {/* Login Link */}
        <p className="text-center text-gray-400">
          لديك حساب بالفعل؟{' '}
          <Link to="/login" className="text-[#a855f7] hover:text-[#6366f1] transition-colors">
            تسجيل الدخول
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Register
