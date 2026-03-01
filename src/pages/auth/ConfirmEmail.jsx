import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import AnimatedBackground from '../../components/AnimatedBackground'
import { CheckCircle, XCircle, Loader } from 'lucide-react'

const ConfirmEmail = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState('loading')
  const [message, setMessage] = useState('')
  const [debugInfo, setDebugInfo] = useState(null)

  useEffect(() => {
    const confirmEmail = async () => {
      try {
        // ✅ قراءة كل من token_hash و token
        const token_hash = searchParams.get('token_hash')
        const token = searchParams.get('token')
        const type = searchParams.get('type')

        console.log('🔍 Confirmation params:', { token_hash, token, type })

        // ✅ التحقق من وجود token أو token_hash
        const verificationToken = token_hash || token
        if (!verificationToken) {
          throw new Error('Invalid confirmation link: missing token')
        }

        // ✅ تحديد نوع العملية الصحيح (signup هو المتوقع)
        const verificationType = type || 'signup'

        // ✅ التحقق من صحة الرابط باستخدام الرمز الموجود
        const { error: verifyError } = await supabase.auth.verifyOtp({
          token_hash: verificationToken, // verifyOtp يقبل token_hash أو token
          type: verificationType
        })

        if (verifyError) {
          console.error('❌ Verify OTP error:', verifyError)
          throw new Error(verifyError.message)
        }

        // 2. جلب المستخدم المؤكد
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        
        if (userError || !user) {
          console.error('Get user error:', userError)
          throw new Error('User not found')
        }

        console.log('✅ Confirmed user:', user)

        // 3. محاولة جلب البيانات من pending_developers (اختياري حسب احتياجك)
        const { data: pending, error: pendingError } = await supabase
          .from('pending_developers')
          .select('*')
          .eq('id', user.id)
          .maybeSingle()

        console.log('Pending query result:', { pending, pendingError })

        setDebugInfo({
          userId: user.id,
          userEmail: user.email,
          pendingFound: !!pending,
          pendingError: pendingError?.message
        })

        if (pendingError) {
          console.error('Pending fetch error:', pendingError)
          // لا نرمي خطأ هنا، نكمل العملية
        }

        if (pending) {
          // 4. نقل البيانات إلى developers إذا كانت موجودة في pending
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

          if (!insertError) {
            // 5. حذف البيانات المؤقتة بعد النقل الناجح
            await supabase
              .from('pending_developers')
              .delete()
              .eq('id', user.id)
          }
        }

        // 6. نجاح
        setStatus('success')
        setMessage('✅ Email confirmed successfully! Redirecting to dashboard...')
        
        setTimeout(() => navigate('/dashboard'), 2000)

      } catch (error) {
        console.error('❌ Confirmation error:', error)
        setStatus('error')
        setMessage(error.message)
      }
    }

    confirmEmail()
  }, [searchParams, navigate])

  // ... باقي الكود (كما هو)
}
