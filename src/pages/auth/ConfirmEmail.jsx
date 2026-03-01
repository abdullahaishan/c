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
        // 1. انتظر حتى يتم تحديث حالة المستخدم في Auth
        // هذا مهم لأن Supabase قد يحتاج لحظة بعد التأكيد
        await new Promise(resolve => setTimeout(resolve, 1000))

        // 2. جلب المستخدم الحالي
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        
        if (userError || !user) {
          throw new Error('لم يتم العثور على المستخدم')
        }

        // 3. التحقق من تأكيد البريد
        if (!user.email_confirmed_at) {
          setStatus('error')
          setMessage('لم يتم تأكيد بريدك الإلكتروني بعد')
          return
        }

        // 4. جلب البيانات من الجدول المؤقت
        const { data: pending, error: pendingError } = await supabase
          .from('pending_developers')
          .select('*')
          .eq('id', user.id)
          .single()

        if (pendingError || !pending) {
          throw new Error('لم يتم العثور على بياناتك المؤقتة')
        }

        // 5. نقل البيانات إلى جدول developers
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

        if (insertError) throw insertError

        // 6. حذف البيانات من الجدول المؤقت
        await supabase
          .from('pending_developers')
          .delete()
          .eq('id', user.id)

        // 7. تنظيف sessionStorage
        sessionStorage.removeItem('pendingVerification')

        setStatus('success')
        setMessage('تم تأكيد بريدك الإلكتروني وتفعيل حسابك بنجاح!')

        // التوجيه إلى dashboard بعد 3 ثوان
        setTimeout(() => navigate('/dashboard'), 3000)

      } catch (error) {
        console.error('Confirmation error:', error)
        setStatus('error')
        setMessage(error.message || 'فشل تأكيد البريد الإلكتروني')
      }
    }

    confirmEmail()
  }, [navigate])

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
              <div className="flex gap-3">
                <button
                  onClick={() => navigate('/login')}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white rounded-xl"
                >
                  تسجيل الدخول
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="flex-1 px-6 py-3 bg-white/10 text-white rounded-xl"
                >
                  إنشاء حساب جديد
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
