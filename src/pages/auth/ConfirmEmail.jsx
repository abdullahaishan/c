import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import AnimatedBackground from '../../components/AnimatedBackground'
import { CheckCircle, XCircle, Loader } from 'lucide-react'

const ConfirmEmail = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState('loading') // loading, success, error
  const [message, setMessage] = useState('')

  useEffect(() => {
    const confirmEmail = async () => {
      try {
        // 1. الحصول على رمز التأكيد من الرابط
        const token = searchParams.get('token')
        const type = searchParams.get('type')

        if (type === 'signup' && token) {
          // تأكيد البريد عبر Supabase
          const { error } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: 'signup'
          })

          if (error) throw error

          // 2. جلب بيانات المستخدم المؤكدة
          const { data: { user } } = await supabase.auth.getUser()

          if (!user) throw new Error('User not found')

          // 3. استرجاع البيانات المؤقتة
          const pendingData = sessionStorage.getItem('pendingUserData')
          const userData = pendingData ? JSON.parse(pendingData) : {
            full_name: user.user_metadata?.full_name || 'User',
            email: user.email
          }

          // 4. الآن فقط أنشئ سجل في جدول developers
          const username = userData.full_name
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '-') + 
            '-' + Math.random().toString(36).substring(2, 6)

          const { error: insertError } = await supabase
            .from('developers')
            .insert([{
              id: user.id,
              username,
              email: user.email,
              full_name: userData.full_name,
              plan_id: 1,
              role: 'user',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }])

          if (insertError) throw insertError

          // 5. تنظيف التخزين المؤقت
          sessionStorage.removeItem('pendingVerification')
          sessionStorage.removeItem('pendingUserData')

          setStatus('success')
          setMessage('تم تأكيد بريدك الإلكتروني بنجاح!')

          // التوجيه إلى dashboard بعد 3 ثوان
          setTimeout(() => navigate('/dashboard'), 3000)
        } else {
          throw new Error('Invalid confirmation link')
        }
      } catch (error) {
        console.error('Confirmation error:', error)
        setStatus('error')
        setMessage(error.message || 'فشل تأكيد البريد الإلكتروني')
      }
    }

    confirmEmail()
  }, [searchParams, navigate])

  return (
    <div className="relative min-h-screen bg-[#030014] overflow-hidden">
      <AnimatedBackground />
      
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 text-center">
          {status === 'loading' && (
            <>
              <Loader className="w-16 h-16 text-[#a855f7] animate-spin mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">جاري تأكيد بريدك...</h2>
              <p className="text-gray-400">الرجاء الانتظار قليلاً</p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">تم التأكيد بنجاح! ✅</h2>
              <p className="text-gray-400 mb-4">{message}</p>
              <p className="text-sm text-gray-500">سيتم تحويلك إلى لوحة التحكم خلال لحظات...</p>
            </>
          )}

          {status === 'error' && (
            <>
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">فشل التأكيد</h2>
              <p className="text-red-400 mb-6">{message}</p>
              <button
                onClick={() => navigate('/login')}
                className="px-6 py-3 bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white rounded-xl"
              >
                العودة لتسجيل الدخول
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ConfirmEmail
