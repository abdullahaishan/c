import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, ArrowRight, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react'
import AnimatedBackground from '../../components/AnimatedBackground'
import { supabase } from '../../lib/supabase'

const VerifyEmail = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [checking, setChecking] = useState(false)
  const [message, setMessage] = useState('')
  const [resendDisabled, setResendDisabled] = useState(false)
  const [countdown, setCountdown] = useState(0)

  useEffect(() => {
    // استرجاع البريد الإلكتروني من sessionStorage
    const pendingEmail = sessionStorage.getItem('pendingVerification')
    if (pendingEmail) {
      setEmail(pendingEmail)
    } else {
      navigate('/register')
    }

    // التحقق الدوري من حالة التأكيد
    const interval = setInterval(checkVerification, 5000)
    return () => clearInterval(interval)
  }, [navigate])

  const checkVerification = async () => {
    if (!email || checking) return

    setChecking(true)
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (user && user.email_confirmed_at) {
        sessionStorage.removeItem('pendingVerification')
        navigate('/dashboard')
      }
    } catch (error) {
      console.error('Error checking verification:', error)
    } finally {
      setChecking(false)
    }
  }

  const handleResendEmail = async () => {
    if (resendDisabled || !email) return

    setResendDisabled(true)
    setMessage('')

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      })

      if (error) throw error

      setMessage('✅ تم إعادة إرسال رابط التأكيد. تحقق من بريدك.')

      // عد تنازلي 60 ثانية قبل إعادة الإرسال
      setCountdown(60)
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            setResendDisabled(false)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } catch (error) {
      console.error('Error resending email:', error)
      setMessage('❌ فشل إعادة الإرسال. حاول مرة أخرى لاحقاً.')
      setResendDisabled(false)
    }
  }

  const openEmailApp = () => {
    // محاولة فتح تطبيق البريد الافتراضي
    window.location.href = 'mailto:'
  }

  return (
    <div className="relative min-h-screen bg-[#030014] overflow-hidden">
      <AnimatedBackground />
      
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex p-4 bg-gradient-to-r from-[#6366f1] to-[#a855f7] rounded-2xl mb-4">
              <Mail className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">تحقق من بريدك الإلكتروني</h1>
            <p className="text-gray-400">
              لقد أرسلنا رابط التأكيد إلى
            </p>
            // في VerifyEmail.jsx - أضف هذا النص
<p className="text-sm text-gray-400 bg-purple-500/10 p-3 rounded-lg border border-purple-500/20">
  📧 رابط التأكيد سيتم إرساله إلى بريدك. بعد الضغط عليه، سيتم تفعيل حسابك تلقائياً.
</p>
            <p className="text-[#a855f7] font-medium mt-2">{email}</p>
          </div>

          {/* Main Card */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10">
            <div className="space-y-6">
              {/* Icon */}
              <div className="flex justify-center">
                <div className="relative">
                  <div className="w-24 h-24 bg-gradient-to-r from-[#6366f1] to-[#a855f7] rounded-full flex items-center justify-center">
                    <Mail className="w-12 h-12 text-white" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="text-center text-gray-300 space-y-2">
                <p>📧 افتح بريدك الإلكتروني</p>
                <p>🔍 ابحث عن رسالة التأكيد من <span className="text-[#a855f7]">Portfolio-v5</span></p>
                <p>👆 اضغط على رابط التأكيد في الرسالة</p>
              </div>

              {/* Open Email Button */}
              <button
                onClick={openEmailApp}
                className="w-full py-4 bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white rounded-xl font-semibold hover:scale-[1.02] transition flex items-center justify-center gap-2"
              >
                <Mail className="w-5 h-5" />
                فتح تطبيق البريد
                <ArrowRight className="w-5 h-5" />
              </button>

              {/* Resend Link */}
              <div className="text-center">
                <button
                  onClick={handleResendEmail}
                  disabled={resendDisabled}
                  className="text-gray-400 hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {resendDisabled ? (
                    <span className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      إعادة الإرسال بعد {countdown} ثانية
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4" />
                      إعادة إرسال رابط التأكيد
                    </span>
                  )}
                </button>
              </div>

              {/* Message */}
              {message && (
                <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg text-center">
                  <p className="text-sm text-purple-400">{message}</p>
                </div>
              )}

              {/* Checking Status */}
              <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                <RefreshCw className={`w-4 h-4 ${checking ? 'animate-spin' : ''}`} />
                <span>جاري التحقق من التأكيد تلقائياً...</span>
              </div>

              {/* Note */}
              <p className="text-xs text-gray-500 text-center mt-4">
                لم تستلم البريد؟ تحقق من مجلد البريد المزعج (Spam) أو أعد الإرسال
              </p>
            </div>
          </div>

          {/* Back to Login */}
          <p className="text-center text-gray-400 mt-6">
            تم التأكيد مسبقاً؟{' '}
            <Link to="/login" className="text-[#a855f7] hover:underline">
              تسجيل الدخول
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default VerifyEmail
