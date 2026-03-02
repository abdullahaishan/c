import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import AnimatedBackground from '../../components/AnimatedBackground'
import { CheckCircle, XCircle, Loader, Mail, KeyRound, ArrowLeft } from 'lucide-react'

const VerifyOtp = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('form')
  const [message, setMessage] = useState('')
  const [resendDisabled, setResendDisabled] = useState(false)
  const [countdown, setCountdown] = useState(0)

  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email)
    }
  }, [location])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!email || !otp) {
      setMessage('❌ الرجاء إدخال البريد الإلكتروني والرمز')
      return
    }

    // ✅ إزالة التحقق من عدد الأرقام - نقبل أي رمز

    setLoading(true)
    setStatus('loading')
    setMessage('')

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'email'
      })

      if (error) throw error

      console.log('✅ OTP verified successfully')

      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) throw new Error('لم يتم العثور على المستخدم')

      const { data: pending } = await supabase
        .from('pending_developers')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()

      if (pending) {
        await supabase
          .from('developers')
          .insert([{
            id: pending.id,
            username: pending.username,
            email: pending.email,
            full_name: pending.full_name,
            plan_id: pending.plan_id,
            role: pending.role,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])

        await supabase
          .from('pending_developers')
          .delete()
          .eq('id', user.id)
      }

      setStatus('success')
      setMessage('✅ تم تأكيد بريدك الإلكتروني بنجاح!')
      setTimeout(() => navigate('/dashboard'), 2000)

    } catch (error) {
      console.error('❌ OTP verification error:', error)
      setStatus('error')
      setMessage(error.message || 'فشل التحقق من الرمز')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (resendDisabled) return

    setResendDisabled(true)
    setMessage('')

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email
      })

      if (error) throw error

      setMessage('✅ تم إعادة إرسال الرمز. تحقق من بريدك.')

      setCountdown(60)
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer)
            setResendDisabled(false)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } catch (error) {
      setMessage(`❌ ${error.message}`)
      setResendDisabled(false)
    }
  }

  return (
    <div className="relative min-h-screen bg-[#030014] overflow-hidden">
      <AnimatedBackground />
      
      <button
        onClick={() => navigate('/register')}
        className="absolute top-4 right-4 sm:top-6 sm:right-6 lg:top-8 lg:right-8 z-20 flex items-center gap-2 px-3 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-gray-300 hover:text-white transition-all group"
      >
        <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm sm:text-base">رجوع</span>
      </button>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10">
          
          <div className="text-center mb-8">
            <div className="inline-flex p-4 bg-gradient-to-r from-[#6366f1] to-[#a855f7] rounded-2xl mb-4">
              <KeyRound className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">تأكيد بريدك الإلكتروني</h2>
            <p className="text-gray-400">أدخل الرمز المرسل إلى بريدك</p>
          </div>

          {status === 'form' && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* البريد الإلكتروني */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">البريد الإلكتروني</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white"
                    placeholder="your@email.com"
                    required
                    disabled={!!location.state?.email}
                  />
                </div>
              </div>

              {/* رمز OTP - بدون تحديد عدد الأرقام */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">رمز التأكيد</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white text-center text-2xl tracking-widest"
                  placeholder="أدخل الرمز"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">يمكن أن يكون الرمز 4 أو 6 أو 8 أرقام</p>
              </div>

              {message && (
                <p className={`text-sm text-center ${message.includes('✅') ? 'text-green-400' : 'text-red-400'}`}>
                  {message}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white rounded-lg font-semibold hover:scale-[1.02] transition disabled:opacity-50"
              >
                {loading ? 'جاري التحقق...' : 'تأكيد الرمز'}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendDisabled}
                  className="text-sm text-gray-400 hover:text-white transition disabled:opacity-50"
                >
                  {resendDisabled 
                    ? `إعادة الإرسال بعد ${countdown} ثانية` 
                    : 'لم يصلك الرمز؟ أعد الإرسال'}
                </button>
              </div>
            </form>
          )}

          {status === 'loading' && (
            <div className="text-center py-8">
              <Loader className="w-16 h-16 text-[#a855f7] animate-spin mx-auto mb-4" />
              <p className="text-white">جاري التحقق من الرمز...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl text-white mb-2">تم التأكيد بنجاح! ✅</h3>
              <p className="text-green-400">{message}</p>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center py-8">
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl text-white mb-2">فشل التحقق</h3>
              <p className="text-red-400 mb-4">{message}</p>
              <button
                onClick={() => setStatus('form')}
                className="px-6 py-2 bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white rounded-lg"
              >
                إعادة المحاولة
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default VerifyOtp
