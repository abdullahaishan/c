import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import AnimatedBackground from '../../components/AnimatedBackground'
import { CheckCircle, XCircle, Loader, AlertCircle, LogIn, UserPlus } from 'lucide-react'

const ConfirmEmail = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState('loading')
  const [message, setMessage] = useState('')
  const [debugInfo, setDebugInfo] = useState(null)
  const [userEmail, setUserEmail] = useState('')

  useEffect(() => {
    const confirmEmail = async () => {
      try {
        // قراءة المعاملات من الرابط
        const token_hash = searchParams.get('token_hash')
        const token = searchParams.get('token')
        const type = searchParams.get('type')
        const redirect_to = searchParams.get('redirect_to')

        console.log('🔍 Confirmation params:', { token_hash, token, type, redirect_to })

        // التحقق من وجود رمز التأكيد
        const verificationToken = token_hash || token
        if (!verificationToken) {
          throw new Error('رابط التأكيد غير صالح: الرمز مفقود')
        }

        // تحديد نوع التأكيد
        const verificationType = type || 'signup'

        // 1. التحقق من صحة الرابط وتأكيد البريد
        console.log('📧 Verifying OTP...')
        const { error: verifyError } = await supabase.auth.verifyOtp({
          token_hash: verificationToken,
          type: verificationType
        })

        if (verifyError) {
          console.error('❌ Verify OTP error:', verifyError)
          throw new Error(verifyError.message || 'فشل تأكيد البريد الإلكتروني')
        }

        // 2. جلب المستخدم المؤكد
        console.log('👤 Fetching confirmed user...')
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        
        if (userError || !user) {
          console.error('❌ Get user error:', userError)
          throw new Error('لم يتم العثور على المستخدم')
        }

        console.log('✅ Confirmed user:', user.id, user.email)
        setUserEmail(user.email)

        // التحقق من أن البريد مؤكد فعلاً
        if (!user.email_confirmed_at) {
          console.log('⏳ Email not confirmed yet')
          setStatus('waiting')
          setMessage('في انتظار تأكيد البريد الإلكتروني...')
          
          // انتظر قليلاً ثم أعد المحاولة
          setTimeout(() => window.location.reload(), 3000)
          return
        }

        // 3. التحقق من وجود المستخدم في جدول developers
        console.log('📦 Checking developers table...')
        const { data: existingDeveloper, error: checkError } = await supabase
          .from('developers')
          .select('*')
          .eq('id', user.id)
          .maybeSingle()

        if (checkError) {
          console.error('❌ Check developer error:', checkError)
        }

        // إذا كان المستخدم موجوداً بالفعل في developers
        if (existingDeveloper) {
          console.log('✅ User already exists in developers')
          setStatus('success')
          setMessage('✅ تم تأكيد بريدك الإلكتروني!')
          
          // تخزين معلومات التصحيح
          setDebugInfo({
            userId: user.id,
            userEmail: user.email,
            status: 'already_exists',
            developer: existingDeveloper
          })

          setTimeout(() => navigate('/dashboard'), 2000)
          return
        }

        // 4. البحث في جدول pending_developers
        console.log('📦 Checking pending_developers table...')
        const { data: pending, error: pendingError } = await supabase
          .from('pending_developers')
          .select('*')
          .eq('id', user.id)
          .maybeSingle()

        console.log('📊 Pending query result:', { pending, pendingError })

        if (pendingError) {
          console.error('❌ Pending fetch error:', pendingError)
        }

        // 5. إذا وجدنا بيانات في pending، انقلها إلى developers
        if (pending) {
          console.log('📝 Moving data from pending to developers...')
          
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

          // حذف من pending بعد النجاح
          await supabase
            .from('pending_developers')
            .delete()
            .eq('id', user.id)

          console.log('✅ Successfully moved to developers')
          
          setStatus('success')
          setMessage('✅ تم تأكيد بريدك الإلكتروني وإنشاء حسابك!')
          
          setDebugInfo({
            userId: user.id,
            userEmail: user.email,
            username: pending.username,
            full_name: pending.full_name,
            status: 'created_from_pending'
          })

          setTimeout(() => navigate('/dashboard'), 2000)
          return
        }

        // 6. إذا لم نجد في أي جدول، أنشئ سجلاً جديداً في developers
        console.log('🆕 Creating new developer record...')
        
        // إنشاء اسم مستخدم من البريد الإلكتروني
        const username = user.email.split('@')[0].toLowerCase() + 
          '-' + Math.random().toString(36).substring(2, 6)

        const { error: createError } = await supabase
          .from('developers')
          .insert([{
            id: user.id,
            username,
            email: user.email,
            full_name: user.user_metadata?.full_name || user.email.split('@')[0],
            plan_id: 1,
            role: 'user',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])

        if (createError) {
          console.error('❌ Create error:', createError)
          throw new Error('فشل في إنشاء حساب المطور')
        }

        console.log('✅ Developer record created successfully')
        
        setStatus('success')
        setMessage('✅ تم تأكيد بريدك الإلكتروني وإنشاء حسابك!')
        
        setDebugInfo({
          userId: user.id,
          userEmail: user.email,
          username,
          status: 'created_new'
        })

        setTimeout(() => navigate('/dashboard'), 2000)

      } catch (error) {
        console.error('💥 Confirmation error:', error)
        setStatus('error')
        setMessage(error.message || 'حدث خطأ أثناء تأكيد البريد')
      }
    }

    confirmEmail()
  }, [searchParams, navigate])

  return (
    <div className="relative min-h-screen bg-[#030014] overflow-hidden">
      <AnimatedBackground />
      
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10">
          
          {/* حالة التحميل */}
          {status === 'loading' && (
            <div className="text-center">
              <Loader className="w-16 h-16 text-[#a855f7] animate-spin mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">جاري تأكيد بريدك...</h2>
              <p className="text-gray-400">الرجاء الانتظار</p>
            </div>
          )}

          {/* حالة الانتظار */}
          {status === 'waiting' && (
            <div className="text-center">
              <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">في انتظار التأكيد</h2>
              <p className="text-yellow-400 mb-4">{message}</p>
              <p className="text-gray-400 text-sm">جاري إعادة المحاولة...</p>
            </div>
          )}

          {/* حالة النجاح */}
          {status === 'success' && (
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">تم التأكيد بنجاح! ✅</h2>
              <p className="text-green-400 mb-4">{message}</p>
              <p className="text-gray-400 text-sm">جاري تحويلك إلى لوحة التحكم...</p>
            </div>
          )}

          {/* حالة الخطأ */}
          {status === 'error' && (
            <>
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2 text-center">فشل التأكيد</h2>
              <p className="text-red-400 text-center mb-6">{message}</p>
              
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
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white rounded-lg hover:scale-[1.02] transition flex items-center justify-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  تسجيل الدخول
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="flex-1 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  تسجيل جديد
                </button>
              </div>

              {userEmail && (
                <p className="text-center text-gray-400 text-sm mt-4">
                  البريد الإلكتروني: <span className="text-[#a855f7]">{userEmail}</span>
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ConfirmEmail
