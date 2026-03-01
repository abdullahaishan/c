import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { CheckCircle, XCircle, Loader, Database, MailCheck } from 'lucide-react'

const ConfirmEmail = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState('loading')
  const [message, setMessage] = useState('')
  const [step, setStep] = useState('verifying') // verifying, moving, complete

  useEffect(() => {
    const confirmEmail = async () => {
      try {
        const token_hash = searchParams.get('token_hash')
        const type = searchParams.get('type')

        if (!token_hash || type !== 'signup') {
          throw new Error('Invalid confirmation link')
        }

        // ===== الخطوة 1: تأكيد البريد =====
        setStep('verifying')
        setMessage('تأكيد البريد الإلكتروني...')
        
        const { error: verifyError } = await supabase.auth.verifyOtp({
          token_hash,
          type: 'signup'
        })

        if (verifyError) throw verifyError

        // ===== الخطوة 2: جلب المستخدم =====
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        
        if (userError || !user) {
          throw new Error('لم يتم العثور على المستخدم')
        }

        if (!user.email_confirmed_at) {
          throw new Error('البريد الإلكتروني غير مؤكد')
        }

        // ===== الخطوة 3: انتظار نقل البيانات من pending → developers =====
        setStep('moving')
        setMessage('جاري تجهيز حسابك...')

        let developerData = null
        let attempts = 0
        
        // الاستماع للتغييرات في الوقت الفعلي
        const channel = supabase
          .channel('developer-creation')
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'developers',
              filter: `id=eq.${user.id}`
            },
            (payload) => {
              console.log('✅ Developer created:', payload)
              developerData = payload.new
              channel.unsubscribe()
              setStep('complete')
              setMessage('✅ تم تأكيد بريدك! جاري تحويلك...')
              setTimeout(() => navigate('/dashboard'), 1500)
            }
          )
          .subscribe()

        // تحقق فوري في حال كانت البيانات موجودة مسبقاً
        const { data: existing } = await supabase
          .from('developers')
          .select('*')
          .eq('id', user.id)
          .maybeSingle()

        if (existing) {
          console.log('✅ Developer already exists:', existing)
          channel.unsubscribe()
          setStep('complete')
          setMessage('✅ تم تأكيد بريدك! جاري تحويلك...')
          setTimeout(() => navigate('/dashboard'), 1500)
          return
        }

        // تحقق دوري كنسخة احتياطية (في حال فشل الـ realtime)
        const checkInterval = setInterval(async () => {
          attempts++
          const { data: check } = await supabase
            .from('developers')
            .select('*')
            .eq('id', user.id)
            .maybeSingle()

          if (check) {
            console.log('✅ Developer found after polling:', check)
            clearInterval(checkInterval)
            channel.unsubscribe()
            setStep('complete')
            setMessage('✅ تم تأكيد بريدك! جاري تحويلك...')
            setTimeout(() => navigate('/dashboard'), 1500)
          }
        }, 2000)

        // تنظيف
        return () => {
          channel.unsubscribe()
          clearInterval(checkInterval)
        }

      } catch (error) {
        console.error('Confirmation error:', error)
        setStatus('error')
        setMessage(error.message)
      }
    }

    confirmEmail()
  }, [searchParams, navigate])

  return (
    <div className="relative min-h-screen bg-[#030014] overflow-hidden">
      {/* خلفية متحركة */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f10_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f10_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10">
          
          {/* حالة التحميل والخطأ */}
          {status === 'error' ? (
            // ===== حالة الخطأ =====
            <div className="text-center">
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">فشل التأكيد</h2>
              <p className="text-red-400 mb-6">{message}</p>
              <button
                onClick={() => navigate('/login')}
                className="px-6 py-2 bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white rounded-lg hover:scale-[1.02] transition"
              >
                العودة لتسجيل الدخول
              </button>
            </div>
          ) : (
            // ===== خطوات التأكيد =====
            <div className="space-y-8">
              {/* العنوان */}
              <div className="text-center">
                <div className="inline-flex p-4 bg-gradient-to-r from-[#6366f1] to-[#a855f7] rounded-2xl mb-4">
                  <MailCheck className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">تأكيد البريد الإلكتروني</h2>
              </div>

              {/* شريط التقدم */}
              <div className="space-y-4">
                {/* الخطوة 1: تأكيد البريد */}
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    step === 'verifying' 
                      ? 'bg-yellow-500/20 border-2 border-yellow-400' 
                      : step === 'moving' || step === 'complete'
                      ? 'bg-green-500/20 border-2 border-green-400'
                      : 'bg-white/10 border border-white/20'
                  }`}>
                    {step === 'moving' || step === 'complete' ? (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    ) : step === 'verifying' ? (
                      <Loader className="w-4 h-4 text-yellow-400 animate-spin" />
                    ) : null}
                  </div>
                  <span className={`text-sm ${
                    step === 'verifying' ? 'text-yellow-400' : 'text-gray-400'
                  }`}>
                    تأكيد البريد الإلكتروني
                  </span>
                </div>

                {/* الخطوة 2: نقل البيانات */}
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    step === 'moving' 
                      ? 'bg-yellow-500/20 border-2 border-yellow-400' 
                      : step === 'complete'
                      ? 'bg-green-500/20 border-2 border-green-400'
                      : 'bg-white/10 border border-white/20'
                  }`}>
                    {step === 'complete' ? (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    ) : step === 'moving' ? (
                      <Loader className="w-4 h-4 text-yellow-400 animate-spin" />
                    ) : null}
                  </div>
                  <span className={`text-sm ${
                    step === 'moving' ? 'text-yellow-400' : 'text-gray-400'
                  }`}>
                    تجهيز حسابك في قاعدة البيانات
                  </span>
                </div>

                {/* الخطوة 3: اكتمال */}
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    step === 'complete' 
                      ? 'bg-green-500/20 border-2 border-green-400' 
                      : 'bg-white/10 border border-white/20'
                  }`}>
                    {step === 'complete' && (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    )}
                  </div>
                  <span className={`text-sm ${
                    step === 'complete' ? 'text-green-400' : 'text-gray-400'
                  }`}>
                    تم التجهيز - جاري التحويل...
                  </span>
                </div>
              </div>

              {/* رسالة الحالة */}
              <p className="text-center text-gray-300 text-sm">
                {message}
              </p>

              {/* مؤشر نشاط قاعدة البيانات */}
              {step === 'moving' && (
                <div className="flex items-center justify-center gap-2 text-xs text-gray-500 border-t border-white/10 pt-4">
                  <Database className="w-4 h-4 animate-pulse" />
                  <span>في انتظار قاعدة البيانات...</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ConfirmEmail
