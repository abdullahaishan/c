import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import AnimatedBackground from '../../components/AnimatedBackground'
import { CheckCircle, XCircle, Loader, AlertCircle } from 'lucide-react'

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

        console.log('Confirmation params:', { token_hash, type })

        if (!token_hash || type !== 'signup') {
          throw new Error('Invalid confirmation link')
        }

        // 1. التحقق من صحة الرابط
        const { error: verifyError } = await supabase.auth.verifyOtp({
          token_hash,
          type: 'signup'
        })

        if (verifyError) {
          console.error('Verify OTP error:', verifyError)
          throw new Error(verifyError.message)
        }

        // 2. جلب المستخدم المؤكد
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        
        if (userError || !user) {
          console.error('Get user error:', userError)
          throw new Error('User not found')
        }

        console.log('Confirmed user:', user)

        // 3. محاولة جلب البيانات من pending_developers
        const { data: pending, error: pendingError } = await supabase
          .from('pending_developers')
          .select('*')
          .eq('id', user.id)
          .maybeSingle()

        console.log('Pending query result:', { pending, pendingError })

        // تخزين معلومات التصحيح
        setDebugInfo({
          userId: user.id,
          userEmail: user.email,
          pendingFound: !!pending,
          pendingError: pendingError?.message
        })

        if (pendingError) {
          console.error('Pending fetch error:', pendingError)
          throw new Error('Failed to fetch pending data')
        }

        if (!pending) {
          // تحقق مما إذا كان المستخدم موجوداً في developers بالفعل
          const { data: existing } = await supabase
            .from('developers')
            .select('id')
            .eq('id', user.id)
            .single()

          if (existing) {
            setStatus('success')
            setMessage('Account already confirmed! Redirecting...')
            setTimeout(() => navigate('/dashboard'), 2000)
            return
          }

          throw new Error('لم يتم العثور على بياناتك المؤقتة. الرجاء إعادة التسجيل.')
        }

        // 4. نقل البيانات إلى developers
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
          console.error('Insert error:', insertError)
          throw new Error('Failed to create developer account')
        }

        // 5. حذف البيانات المؤقتة
        await supabase
          .from('pending_developers')
          .delete()
          .eq('id', user.id)

        // 6. تنظيف sessionStorage
        sessionStorage.removeItem('pendingVerification')

        setStatus('success')
        setMessage('✅ Email confirmed successfully! Redirecting to dashboard...')
        
        setTimeout(() => navigate('/dashboard'), 2000)

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
      <AnimatedBackground />
      
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10">
          {status === 'loading' && (
            <>
              <Loader className="w-16 h-16 text-[#a855f7] animate-spin mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2 text-center">Confirming your email...</h2>
              <p className="text-gray-400 text-center">Please wait</p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2 text-center">Success! ✅</h2>
              <p className="text-green-400 text-center mb-4">{message}</p>
            </>
          )}

          {status === 'error' && (
            <>
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2 text-center">Confirmation Failed</h2>
              <p className="text-red-400 text-center mb-4">{message}</p>
              
              {debugInfo && (
                <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <p className="text-yellow-400 text-sm font-medium mb-2">Debug Information:</p>
                  <pre className="text-xs text-gray-300 overflow-auto">
                    {JSON.stringify(debugInfo, null, 2)}
                  </pre>
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => navigate('/login')}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white rounded-lg"
                >
                  Go to Login
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="flex-1 px-4 py-2 bg-white/10 text-white rounded-lg"
                >
                  Register Again
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
