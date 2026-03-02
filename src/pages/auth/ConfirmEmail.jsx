import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import AnimatedBackground from '../../components/AnimatedBackground'
import { CheckCircle, XCircle, Loader, AlertCircle, LogIn, UserPlus, Copy, Database } from 'lucide-react'

const ConfirmEmail = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState('loading')
  const [message, setMessage] = useState('')
  const [debugInfo, setDebugInfo] = useState(null)
  const [userEmail, setUserEmail] = useState('')
  const [currentUrl, setCurrentUrl] = useState('')
  const [dbErrors, setDbErrors] = useState([])
  const [allResponses, setAllResponses] = useState([])

  useEffect(() => {
    setCurrentUrl(window.location.href)

    const confirmEmail = async () => {
      try {
        // قراءة جميع المعاملات الممكنة (بما فيها الـ hash)
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        
        const params = {
          // من query string (بعد ?)
          token_hash: searchParams.get('token_hash'),
          token: searchParams.get('token'),
          type: searchParams.get('type'),
          access_token: searchParams.get('access_token'),
          refresh_token: searchParams.get('refresh_token'),
          redirect_to: searchParams.get('redirect_to'),
          code: searchParams.get('code'),
          error: searchParams.get('error'),
          error_description: searchParams.get('error_description'),
          
          // من hash fragment (بعد #)
          hash_access_token: hashParams.get('access_token'),
          hash_refresh_token: hashParams.get('refresh_token'),
          hash_type: hashParams.get('type'),
          hash_error: hashParams.get('error'),
          hash_error_description: hashParams.get('error_description')
        }

        console.log('🔍 Full URL:', window.location.href)
        console.log('🔍 All params:', params)
        console.log('🔍 Hash params:', Object.fromEntries(hashParams.entries()))

        addResponse('📥 URL Parameters', params)
        addResponse('📥 Hash Parameters', Object.fromEntries(hashParams.entries()))

        // التحقق من وجود خطأ في الرابط
        if (params.error || params.hash_error) {
          const errorMsg = params.error_description || params.hash_error_description || 'خطأ في التأكيد'
          throw new Error(`❌ ${errorMsg}`)
        }

        // الحصول على access_token (من query أو hash)
        const accessToken = params.access_token || params.hash_access_token
        const refreshToken = params.refresh_token || params.hash_refresh_token

        if (accessToken) {
          addResponse('🔑 Found access_token, setting session...', { accessToken })
          
          // تعيين الجلسة باستخدام access_token
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          })

          addResponse('📦 setSession response', { error: sessionError })

          if (sessionError) {
            throw new Error(`فشل تعيين الجلسة: ${sessionError.message}`)
          }
        }

        // جلب المستخدم
        addResponse('👤 Fetching user...', {})
        
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        
        addResponse('👤 getUser response', { error: userError, user })

        if (userError || !user) {
          throw new Error('لم يتم العثور على المستخدم')
        }

        setUserEmail(user.email)
        addResponse('✅ User confirmed', { user })

        // التحقق من developers
        addResponse('📦 Checking developers...', { userId: user.id })
        
        const { data: existingDeveloper, error: checkError } = await supabase
          .from('developers')
          .select('*')
          .eq('id', user.id)
          .maybeSingle()

        addResponse('📦 developers response', { error: checkError, data: existingDeveloper })

        if (checkError) {
          addDbError('developers fetch error', checkError)
        }

        if (existingDeveloper) {
          setStatus('success')
          setMessage('✅ تم تأكيد بريدك الإلكتروني!')
          setTimeout(() => navigate('/dashboard'), 2000)
          return
        }

        // التحقق من pending_developers
        addResponse('📦 Checking pending_developers...', { userId: user.id })
        
        const { data: pending, error: pendingError } = await supabase
          .from('pending_developers')
          .select('*')
          .eq('id', user.id)
          .maybeSingle()

        addResponse('📦 pending_developers response', { error: pendingError, data: pending })

        if (pendingError) {
          addDbError('pending_developers fetch error', pendingError)
        }

        if (pending) {
          addResponse('📝 Moving data to developers...', { pending })
          
          const { error: insertError, data: insertData } = await supabase
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
            .select()

          addResponse('📝 insert response', { error: insertError, data: insertData })

          if (insertError) {
            addDbError('insert error', insertError)
            throw new Error('فشل في إنشاء حساب المطور')
          }

          // حذف من pending
          const { error: deleteError } = await supabase
            .from('pending_developers')
            .delete()
            .eq('id', user.id)

          addResponse('🗑️ delete response', { error: deleteError })

          if (deleteError) {
            addDbError('delete error', deleteError)
          }

          setStatus('success')
          setMessage('✅ تم تأكيد بريدك الإلكتروني وإنشاء حسابك!')
          setTimeout(() => navigate('/dashboard'), 2000)
          return
        }

        // إنشاء سجل جديد
        addResponse('🆕 Creating new developer record...', {})
        
        const username = user.email.split('@')[0].toLowerCase() + 
          '-' + Math.random().toString(36).substring(2, 6)

        const { error: createError, data: createData } = await supabase
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
          .select()

        addResponse('🆕 create response', { error: createError, data: createData })

        if (createError) {
          addDbError('create error', createError)
          throw new Error('فشل في إنشاء حساب المطور')
        }

        setStatus('success')
        setMessage('✅ تم تأكيد بريدك الإلكتروني وإنشاء حسابك!')
        setTimeout(() => navigate('/dashboard'), 2000)

      } catch (error) {
        console.error('💥 Error:', error)
        addDbError('catch error', { message: error.message, stack: error.stack })
        setStatus('error')
        setMessage(error.message || 'حدث خطأ أثناء تأكيد البريد')
      }
    }

    confirmEmail()
  }, [searchParams, navigate])

  // دوال مساعدة لتسجيل الأخطاء
  const addDbError = (source, error) => {
    setDbErrors(prev => [...prev, { source, error, timestamp: new Date().toISOString() }])
  }

  const addResponse = (action, data) => {
    setAllResponses(prev => [...prev, { action, data, timestamp: new Date().toISOString() }])
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    alert('تم النسخ!')
  }

  const copyAllData = () => {
    const dataToCopy = {
      url: currentUrl,
      params: Object.fromEntries(searchParams.entries()),
      hashParams: Object.fromEntries(new URLSearchParams(window.location.hash.substring(1)).entries()),
      debugInfo,
      dbErrors,
      allResponses,
      timestamp: new Date().toISOString()
    }
    copyToClipboard(JSON.stringify(dataToCopy, null, 2))
  }

  return (
    <div className="relative min-h-screen bg-[#030014] overflow-hidden">
      <AnimatedBackground />
      
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-8">
        <div className="max-w-2xl w-full bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
          
          {/* Header with copy button */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white">تأكيد البريد الإلكتروني</h2>
            <button
              onClick={copyAllData}
              className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-lg hover:bg-white/20 transition"
            >
              <Copy className="w-4 h-4" />
              <span className="text-sm">نسخ كل البيانات</span>
            </button>
          </div>
          
          {status === 'loading' && (
            <div className="text-center py-8">
              <Loader className="w-16 h-16 text-[#a855f7] animate-spin mx-auto mb-4" />
              <h3 className="text-xl text-white mb-2">جاري تأكيد بريدك...</h3>
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
            <div className="space-y-6">
              <div className="text-center">
                <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h3 className="text-xl text-white mb-2">فشل التأكيد</h3>
                <p className="text-red-400">{message}</p>
              </div>

              {/* الرابط الحالي */}
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-400">🔗 الرابط الحالي:</p>
                  <button
                    onClick={() => copyToClipboard(currentUrl)}
                    className="text-xs text-purple-400 hover:text-purple-300"
                  >
                    نسخ
                  </button>
                </div>
                <p className="text-xs text-gray-300 break-all">{currentUrl}</p>
              </div>

              {/* معاملات الرابط */}
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <p className="text-sm text-gray-400 mb-2">📋 معاملات الرابط:</p>
                <pre className="text-xs text-gray-300 overflow-auto max-h-40">
                  {JSON.stringify({
                    query: Object.fromEntries(searchParams.entries()),
                    hash: Object.fromEntries(new URLSearchParams(window.location.hash.substring(1)).entries())
                  }, null, 2)}
                </pre>
              </div>

              {/* أخطاء قاعدة البيانات */}
              {dbErrors.length > 0 && (
                <div className="bg-red-500/10 rounded-lg p-4 border border-red-500/20">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-red-400">❌ أخطاء قاعدة البيانات:</p>
                    <button
                      onClick={() => copyToClipboard(JSON.stringify(dbErrors, null, 2))}
                      className="text-xs text-red-400 hover:text-red-300"
                    >
                      نسخ
                    </button>
                  </div>
                  <pre className="text-xs text-red-300 overflow-auto max-h-60">
                    {JSON.stringify(dbErrors, null, 2)}
                  </pre>
                </div>
              )}

              {/* جميع استجابات Supabase */}
              {allResponses.length > 0 && (
                <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-blue-400">📊 استجابات Supabase:</p>
                    <button
                      onClick={() => copyToClipboard(JSON.stringify(allResponses, null, 2))}
                      className="text-xs text-blue-400 hover:text-blue-300"
                    >
                      نسخ
                    </button>
                  </div>
                  <pre className="text-xs text-blue-300 overflow-auto max-h-60">
                    {JSON.stringify(allResponses, null, 2)}
                  </pre>
                </div>
              )}

              {/* Debug Info */}
              {debugInfo && (
                <div className="bg-yellow-500/10 rounded-lg p-4 border border-yellow-500/20">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-yellow-400">🔍 معلومات التصحيح:</p>
                    <button
                      onClick={() => copyToClipboard(JSON.stringify(debugInfo, null, 2))}
                      className="text-xs text-yellow-400 hover:text-yellow-300"
                    >
                      نسخ
                    </button>
                  </div>
                  <pre className="text-xs text-yellow-300 overflow-auto max-h-40">
                    {JSON.stringify(debugInfo, null, 2)}
                  </pre>
                </div>
              )}

              {/* أزرار الإجراءات */}
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
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ConfirmEmail
