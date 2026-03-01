import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import AnimatedBackground from '../../components/AnimatedBackground'
import { CheckCircle, XCircle, Loader, AlertCircle, Mail } from 'lucide-react'

const ConfirmEmail = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState('loading')
  const [message, setMessage] = useState('')
  const [debugInfo, setDebugInfo] = useState(null)

  useEffect(() => {
    const confirmEmail = async () => {
      try {
        const token_hash = searchParams.get('token_hash')
        const type = searchParams.get('type')

        console.log('🔍 Confirmation params:', { token_hash, type })

        if (!token_hash || type !== 'signup') {
          throw new Error('رابط التأكيد غير صالح')
        }

        // 1. التحقق من صحة الرابط عبر Supabase Auth
        console.log('📧 Verifying OTP...')
        const { error: verifyError } = await supabase.auth.verifyOtp({
          token_hash,
          type: 'signup'
        })

        if (verifyError) {
          console.error('❌ Verify OTP error:', verifyError)
          throw new Error(verifyError.message)
        }

        // 2. جلب المستخدم المؤكد
        console.log('👤 Fetching confirmed user...')
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        
        if (userError || !user) {
          console.error('❌ Get user error:', userError)
          throw new Error('لم يتم العثور على المستخدم')
        }

        console.log('✅ Confirmed user:', user.id, user.email)

        // 3. التحقق من أن البريد مؤكد فعلاً
        if (!user.email_confirmed_at) {
          console.log('⏳ Email not confirmed yet, waiting...')
          setStatus('waiting')
          setMessage('في انتظار تأكيد البريد الإلكتروني...')
          
          // الانتظار حتى يتم التأكيد (بدون توقيت عشوائي)
          const checkInterval = setInterval(async () => {
            const { data: { user: updatedUser } } = await supabase.auth.getUser()
            if (updatedUser?.email_confirmed_at) {
              clearInterval(checkInterval)
              // إعادة تشغيل العملية بعد التأكيد
              window.location.reload()
            }
          }, 2000)
          
          return
        }

        // 4. محاولة جلب البيانات من pending_developers
        console.log('📦 Fetching from pending_developers...')
        const { data: pending, error: pendingError } = await supabase
          .from('pending_developers')
          .select('*')
          .eq('id', user.id)
          .maybeSingle()

        console.log('📊 Pending query result:', { pending, pendingError })

        // تخزين معلومات التصحيح
        setDebugInfo({
          userId: user.id,
          userEmail: user.email,
          pendingFound: !!pending,
          pendingError: pendingError?.message,
          emailConfirmed: !!user.email_confirmed_at
        })

        if (pendingError) {
          console.error('❌ Pending fetch error:', pendingError)
          throw new Error('فشل في جلب البيانات المؤقتة')
        }

        // 5. إذا لم يجد في pending، تحقق من developers
        if (!pending) {
          console.log('🔍 Checking developers table...')
          const { data: existing, error: existingError } = await supabase
            .from('developers')
            .select('*')
            .eq('id', user.id)
            .single()

          if (existingError) {
            console.error('❌ Existing check error:', existingError)
          }

          if (existing) {
            console.log('✅ User already exists in developers')
            setStatus('success')
            setMessage('✅ تم التأكيد بنجاح! جاري تسجيل الدخول...')
            
            // تسجيل الدخول تلقائياً
            setTimeout(() => navigate('/dashboard'), 1500)
            return
          }

          throw new Error('لم يتم العثور على بياناتك المؤقتة. الرجاء إعادة التسجيل.')
        }

        // 6. نقل البيانات إلى developers
        console.log('📝 Moving data to developers table...')
        const { error: insertError } = await supabase
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

        if (insertError) {
          console.error('❌ Insert error:', insertError)
          throw new Error('فشل في إنشاء حساب المطور')
        }

        // 7. حذف البيانات المؤقتة
        console.log('🗑️ Cleaning up pending_developers...')
        await supabase
          .from('pending_developers')
          .delete()
          .eq('id', user.id)

        // 8. تنظيف sessionStorage
        sessionStorage.removeItem('pendingVerification')

        console.log('🎉 All done! Redirecting to dashboard...')
        setStatus('success')
        setMessage('✅ تم تأكيد البريد بنجاح! جاري تحويلك إلى لوحة التحكم...')
        
        setTimeout(() => navigate('/dashboard'), 1500)

      } catch (error) {
        console.error('💥 Confirmation error:', error)
        setStatus('error')
        setMessage(error.message)
      }
    }

    confirmEmail()
  }, [searchParams, navigate])

  return (
    <div className="relative min-h-screen bg-[#030014] overflow-hidden">
      <AnimatedBackground />
      
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10">
          
          {/* حالة التحميل/الانتظار */}
          {status === 'loading' && (
            <div className="text-center">
              <Loader className="w-16 h-16 text-[#a855f7] animate-spin mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">جاري تأكيد بريدك...</h2>
              <p className="text-gray-400">الرجاء الانتظار</p>
            </div>
          )}

          {/* حالة انتظار التأكيد من Supabase */}
          {status === 'waiting' && (
            <div className="text-center">
              <Mail className="w-16 h-16 text-yellow-400 mx-auto mb-4 animate-pulse" />
              <h2 className="text-2xl font-bold text-white mb-2">في انتظار التأكيد</h2>
              <p className="text-gray-400 mb-4">
                لم يتم تأكيد بريدك بعد. الرجاء الضغط على رابط التأكيد في بريدك الإلكتروني.
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <Loader className="w-4 h-4 animate-spin" />
                <span>جاري التحقق...</span>
              </div>
            </div>
          )}

          {/* حالة النجاح */}
          {status === 'success' && (
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">تم بنجاح! ✅</h2>
              <p className="text-green-400 mb-4">{message}</p>
            </div>
          )}

          {/* حالة الخطأ */}
          {status === 'error' && (
            <>
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2 text-center">فشل التأكيد</h2>
              <p className="text-red-400 text-center mb-4">{message}</p>
              
              {debugInfo && (
                <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <p className="text-yellow-400 text-sm font-medium mb-2">معلومات التصحيح:</p>
                  <pre className="text-xs text-gray-300 overflow-auto">
                    {JSON.stringify(debugInfo, null, 2)}
                  </pre>
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => navigate('/login')}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white rounded-lg hover:scale-[1.02] transition"
                >
                  تسجيل الدخول
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="flex-1 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition"
                >
                  تسجيل جديد
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ConfirmEmail
