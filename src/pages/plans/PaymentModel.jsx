// components/plans/PaymentModal.jsx
import React, { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabase'
import {
  X,
  Upload,
  Check,
  Loader,
  AlertCircle,
  Bitcoin,
  Wallet,
  Landmark,
  Copy,
  CheckCircle,
  Send,
  MessageCircle,
  Phone,
  Banknote,
  Bell
} from 'lucide-react'

// ============================================
// بيانات العملات
// ============================================
const CURRENCIES = {
  USD: { symbol: '$', name: 'دولار أمريكي', code: 'USD' },
  YER: { symbol: 'ر.ي', name: 'ريال يمني', code: 'YER' },
  SAR: { symbol: 'ر.س', name: 'ريال سعودي', code: 'SAR' },
  AED: { symbol: 'د.إ', name: 'درهم إماراتي', code: 'AED' },
  EGP: { symbol: 'ج.م', name: 'جنيه مصري', code: 'EGP' }
}

const PaymentModal = ({ 
  plan, 
  billingCycle, 
  currency, 
  convertedPrice, 
  userCountry, 
  userRegion,
  exchangeRate,
  onClose 
}) => {
  const [step, setStep] = useState('method')
  const [method, setMethod] = useState('')
  const [cryptoType, setCryptoType] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [transferDetails, setTransferDetails] = useState('')
  const [selectedBank, setSelectedBank] = useState('')
  const [notificationSent, setNotificationSent] = useState(false)
  
  const { user } = useAuth()
  
  // ✅ متغيرات التحقق من طريقة الدفع
  const isWestern = method === 'western'
  const isJib = method === 'jib' // جيب
  const isOneCash = method === 'onecash'
  const isCrypto = method === 'crypto'
  const isBank = method === 'bank'
  
  // رقم واتساب الأدمن
  const ADMIN_WHATSAPP = '967771315459'
  const ADMIN_NAME = 'مدير الموقع'

  // عناوين المحافظ
  const walletAddresses = {
    btc: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    eth: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    usdt: 'TXYZ... (عنوان USDT TRC20)',
    trx: 'TXYZ... (عنوان TRX)'
  }

  // معلومات البنوك اليمنية
  const yemenBanks = [
    { 
      id: 'kuraimi', 
      name: 'بنك الكريمي', 
      account: '3101557757',
      iban: 'YE9876543210',
      branch: 'الفرع الرئيسي - صنعاء'
    },
    { 
      id: 'alahli', 
      name: 'البنك الأهلي اليمني', 
      account: '102515815',
      iban: 'YE1234567890',
      branch: 'الفرع الرئيسي - عدن'
    },
    { 
      id: 'taslif', 
      name: 'بنك التسليف التعاوني', 
      account: '2844083',
      iban: 'YE5555555555',
      branch: 'الفرع الرئيسي - تعز'
    }
  ]

  // إنشاء رابط واتساب مع الرسالة
  const createWhatsAppLink = () => {
    const message = `
*طلب دفع جديد - ${plan?.name_ar || 'باقة'}*
━━━━━━━━━━━━━━━━
👤 *المستخدم:* ${user?.full_name || 'غير معروف'}
📧 *البريد:* ${user?.email || 'غير معروف'}
🆔 *المعرف:* ${user?.id || 'غير معروف'}

💳 *الباقة:* ${plan?.name_ar || 'غير معروفة'}
💰 *المبلغ:* ${convertedPrice?.symbol || '$'}${convertedPrice?.price || 0}
💱 *العملة:* ${currency || 'USD'}
📅 *الدورة:* ${billingCycle === 'monthly' ? 'شهرية' : 'سنوية'}

💵 *طريقة الدفع:* ${getMethodName(method) || 'غير محددة'}
${cryptoType ? `🪙 *العملة:* ${cryptoType.toUpperCase()}` : ''}
${selectedBank ? `🏦 *البنك:* ${selectedBank}` : ''}

📝 *التفاصيل:* ${transferDetails || 'لا يوجد تفاصيل إضافية'}

⏰ *التاريخ:* ${new Date().toLocaleString('ar')}
━━━━━━━━━━━━━━━━
✅ الرجاء تأكيد الدفع بعد التحقق
⚠️ سيتم إرسال صورة التحويل عبر واتساب من قبل العميل
    `.trim()
    
    return `https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent(message)}`
  }

  const getMethodName = (methodId) => {
    const methods = {
      western: 'ويسترن يونيون',
      jib: 'محفظة جيب',
      crypto: 'عملات رقمية',
      bank: 'تحويل بنكي',
      onecash: 'ون كاش'
    }
    return methods[methodId] || methodId
  }

  const handleCopyAddress = (text) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

// ✅ دالة إرسال الإشعارات (مصححة)
const sendNotifications = async () => {
  try {
    // 1️⃣ إشعار للمستخدم - ✅ مع التحقق من النتيجة
    const { error: userNotifError } = await supabase
      .from('notifications')
      .insert([{
        user_id: user?.id,
        title: 'تم استلام طلب الدفع',
        message: `تم استلام طلب ترقية إلى باقة ${plan?.name_ar || 'الباقة'}. الرجاء التواصل مع الدعم عبر واتساب لإرسال صورة التحويل.`,
        type: 'payment',
        metadata: {
          plan_id: plan?.id,
          amount: convertedPrice?.price || plan?.price_monthly,
          currency,
          payment_method: method,
          whatsapp_link: createWhatsAppLink()
        },
        created_at: new Date().toISOString()
      }])

    if (userNotifError) throw new Error(`فشل في إنشاء إشعار المستخدم: ${userNotifError.message}`)

    // 2️⃣ إشعار للأدمن - ✅ مع التحقق من النتيجة
    const { error: adminNotifError } = await supabase
      .from('admin_notifications')
      .insert([{
        title: '🚀 طلب دفع جديد - انتظار صورة التحويل',
        message: `طلب جديد من ${user?.full_name || user?.email} لشراء باقة ${plan?.name_ar}. الرجاء متابعة المحادثة عبر واتساب.`,
        type: 'payment_request',
        user_id: user?.id,
        metadata: {
          plan_id: plan?.id,
          plan_name: plan?.name_ar,
          amount: convertedPrice?.price || plan?.price_monthly,
          currency,
          payment_method: method,
          crypto_type: cryptoType,
          bank_name: selectedBank,
          transfer_details: transferDetails,
          billing_cycle: billingCycle,
          user_name: user?.full_name,
          user_email: user?.email,
          whatsapp_link: createWhatsAppLink()
        },
        priority: 'high',
        created_at: new Date().toISOString()
      }])

    if (adminNotifError) throw new Error(`فشل في إنشاء إشعار الأدمن: ${adminNotifError.message}`)

    // 3️⃣ حفظ بيانات الدفع في جدول payments - ✅ مع التحقق من النتيجة
    const { error: paymentError } = await supabase
      .from('payments')
      .insert([{
        developer_id: user?.id,
        plan_id: plan?.id,
        amount: convertedPrice?.price || plan?.price_monthly,
        currency: currency || 'USD',
        payment_method: method,
        crypto_type: cryptoType,
        bank_name: selectedBank,
        transfer_details: transferDetails,
        billing_cycle: billingCycle,
        status: 'pending',
        metadata: {
          requires_image: true,
          whatsapp_contact: ADMIN_WHATSAPP
        },
        created_at: new Date().toISOString()
      }])

    if (paymentError) throw new Error(`فشل في حفظ بيانات الدفع: ${paymentError.message}`)

    setNotificationSent(true)
    
    // ✅ تأكيد الحفظ
    console.log('✅ تم حفظ جميع البيانات بنجاح')
    return true
    
  } catch (err) {
    console.error('❌ Error sending notifications:', err)
    throw err // رمي الخطأ ليتم معالجته في handleSubmit
  }
        }
  const handleSubmit = async () => {
    setLoading(true)
    setError('')

    try {
      // إرسال الإشعارات فقط (بدون رفع صور)
      await sendNotifications()
      
      setStep('success')
    } catch (err) {
      console.error('Payment error:', err)
      setError('فشل في معالجة الطلب. الرجاء المحاولة مرة أخرى.')
    } finally {
      setLoading(false)
    }
  }

  // إنشاء رابط واتساب للتواصل المباشر
  const contactAdminViaWhatsApp = () => {
    const link = createWhatsAppLink()
    window.open(link, '_blank')
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1a1a2e] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex justify-between items-center sticky top-0 bg-[#1a1a2e] z-10">
          <h2 className="text-2xl font-bold text-white">
            {step === 'method' && 'اختر طريقة الدفع'}
            {step === 'upload' && 'تأكيد عملية الدفع'}
            {step === 'success' && 'تم إرسال طلب الدفع!'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Plan Summary */}
          <div className="mb-6 p-4 bg-white/5 rounded-xl border border-white/10">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-400 text-sm">الباقة المختارة</p>
                <p className="text-xl font-bold text-white">{plan?.name_ar || 'غير معروفة'}</p>
              </div>
              <div className="text-right">
                <p className="text-gray-400 text-sm">المبلغ</p>
                <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#6366f1] to-[#a855f7]">
                  {convertedPrice?.symbol || '$'}{convertedPrice?.price || plan?.price_monthly || 0}
                </p>
                {currency !== 'USD' && (
                  <p className="text-xs text-gray-500 mt-1">
                    ≈ ${plan?.price_monthly || 0} USD
                  </p>
                )}
                {exchangeRate && (
                  <p className="text-xs text-gray-500">
                    سعر الصرف: 1 USD = {exchangeRate} {CURRENCIES[currency]?.symbol}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {/* Step 1: Payment Method */}
          {step === 'method' && (
            <div className="space-y-4">
              {/* ويسترن يونيون */}
              <PaymentMethodCard
                id="western"
                name="ويسترن يونيون"
                icon={Send}
                description="حوالات ويسترن يونيون"
                onClick={() => {
                  setMethod('western')
                  setStep('upload')
                }}
              />

              {/* محفظة جيب */}
              <PaymentMethodCard
                id="jib"
                name="محفظة جيب"
                icon={Wallet}
                description="محفظة جيب - 102515815"
                onClick={() => {
                  setMethod('jib')
                  setStep('upload')
                }}
              />

              {/* ون كاش */}
              <PaymentMethodCard
                id="onecash"
                name="ون كاش"
                icon={Wallet}
                description="ون كاش - 2844083"
                onClick={() => {
                  setMethod('onecash')
                  setStep('upload')
                }}
              />

              {/* العملات الرقمية */}
              <PaymentMethodCard
                id="crypto"
                name="العملات الرقمية"
                icon={Bitcoin}
                description="USDT - BTC - ETH"
                onClick={() => {
                  setMethod('crypto')
                  setStep('crypto')
                }}
              />

              {/* تحويل بنكي - مع تعيين الكريمي كموصى به */}
              <PaymentMethodCard
                id="bank"
                name="تحويل بنكي"
                icon={Landmark}
                description="بنك الكريمي (موصى به) - 3101557757"
                popular={true}
                onClick={() => {
                  setMethod('bank')
                  setStep('bank')
                }}
              />
            </div>
          )}

          {/* Step 1.5: Crypto Selection */}
          {step === 'crypto' && (
            <div className="space-y-4">
              <CryptoOption
                type="usdt"
                name="Tether (USDT)"
                address={walletAddresses.usdt}
                onSelect={() => {
                  setCryptoType('usdt')
                  setStep('upload')
                }}
                onCopy={handleCopyAddress}
                copied={copied}
              />
              <CryptoOption
                type="btc"
                name="Bitcoin (BTC)"
                address={walletAddresses.btc}
                onSelect={() => {
                  setCryptoType('btc')
                  setStep('upload')
                }}
                onCopy={handleCopyAddress}
                copied={copied}
              />
              <CryptoOption
                type="eth"
                name="Ethereum (ETH)"
                address={walletAddresses.eth}
                onSelect={() => {
                  setCryptoType('eth')
                  setStep('upload')
                }}
                onCopy={handleCopyAddress}
                copied={copied}
              />

              <button
                onClick={() => setStep('method')}
                className="text-[#a855f7] hover:text-[#6366f1] text-sm"
              >
                ← رجوع لطرق الدفع
              </button>
            </div>
          )}

          {/* Step 1.5: Bank Selection */}
          {step === 'bank' && (
            <div className="space-y-4">
              {yemenBanks.map((bank) => (
                <button
                  key={bank.id}
                  onClick={() => {
                    setSelectedBank(bank.name)
                    setStep('upload')
                  }}
                  className={`w-full p-4 bg-white/5 border rounded-xl hover:bg-white/10 transition-all text-right ${
                    bank.id === 'kuraimi' 
                      ? 'border-yellow-500/50 bg-yellow-500/5' 
                      : 'border-white/10'
                  }`}
                >
                  {bank.id === 'kuraimi' && (
                    <span className="inline-block mb-2 px-2 py-0.5 bg-yellow-500 text-black text-xs rounded-full font-bold">
                      موصى به
                    </span>
                  )}
                  <h3 className="text-white font-semibold mb-2">{bank.name}</h3>
                  <p className="text-sm text-gray-400 mb-1">رقم الحساب: {bank.account}</p>
                  <p className="text-sm text-gray-400">{bank.branch}</p>
                </button>
              ))}

              <button
                onClick={() => setStep('method')}
                className="text-[#a855f7] hover:text-[#6366f1] text-sm"
              >
                ← رجوع لطرق الدفع
              </button>
            </div>
          )}

          {/* Step 2: Upload Proof - ✅ بدون رفع صور */}
          {step === 'upload' && (
            <div className="space-y-6">
              {/* Payment Instructions */}
              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                <h3 className="text-white font-medium mb-2">📋 تعليمات الدفع:</h3>
                <p className="text-sm text-blue-400">
                  {isWestern && (
                    <>
                      أرسل حوالة ويسترن يونيون إلى:
                      <div className="mt-2 p-3 bg-black/30 rounded-lg text-gray-300">
                        <p>الاسم: احمد زبن الله علي عيشان</p>
                        <p>البلد: اليمن - صنعاء</p>
                        <p>الهاتف: +967771315459</p>
                      </div>
                    </>
                  )}
                  
                  {isJib && (
                    <>
                      أرسل المبلغ إلى محفظة جيب:
                      <div className="mt-2 p-3 bg-black/30 rounded-lg text-gray-300">
                        <p>رقم المحفظة: 102515815</p>
                        <p>الاسم: احمد زبن الله علي عيشان</p>
                      </div>
                    </>
                  )}
                  
                  {isOneCash && (
                    <>
                      أرسل المبلغ إلى ون كاش:
                      <div className="mt-2 p-3 bg-black/30 rounded-lg text-gray-300">
                        <p>رقم المحفظة: 2844083</p>
                        <p>الاسم: احمد زبن الله علي عيشان</p>
                      </div>
                    </>
                  )}
                  
                  {isBank && selectedBank === 'بنك الكريمي' && (
                    <>
                      أرسل المبلغ إلى حساب بنك الكريمي:
                      <div className="mt-2 p-3 bg-black/30 rounded-lg text-gray-300">
                        <p>رقم الحساب: 3101557757</p>
                        <p>الاسم: احمد زبن الله علي عيشان</p>
                        <p>الفرع: الرئيسي - صنعاء</p>
                      </div>
                    </>
                  )}
                </p>
              </div>

              {/* Wallet Address (for crypto) */}
              {isCrypto && cryptoType && (
                <div className="p-4 bg-black/30 rounded-xl">
                  <p className="text-sm text-gray-400 mb-2">أرسل إلى هذا العنوان:</p>
                  <div className="flex items-center gap-2 p-3 bg-white/5 rounded-lg">
                    <code className="flex-1 text-white font-mono text-sm break-all">
                      {walletAddresses[cryptoType]}
                    </code>
                    <button
                      onClick={() => handleCopyAddress(walletAddresses[cryptoType])}
                      className="p-2 hover:bg-white/10 rounded-lg"
                    >
                      {copied ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Transfer Details */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">رقم التحويل أو تفاصيل إضافية</label>
                <textarea
                  value={transferDetails}
                  onChange={(e) => setTransferDetails(e.target.value)}
                  placeholder="أدخل رقم التحويل أو أي تفاصيل إضافية..."
                  rows="3"
                  className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white"
                />
              </div>

              {/* ✅ إشعار بأنه سيتم التواصل عبر واتساب */}
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                <div className="flex items-start gap-3">
                  <Bell className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-white font-medium mb-1">📱 سيتم التواصل عبر واتساب</h4>
                    <p className="text-sm text-yellow-400">
                      بعد إرسال الطلب، سيتم تحويلك إلى واتساب للتواصل مع المدير وإرسال صورة التحويل مباشرة.
                      الرجاء التأكد من توفر صورة التحويل في جهازك.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setStep('method')}
                  className="flex-1 px-4 py-3 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/20 transition-all"
                >
                  رجوع
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white rounded-xl font-semibold hover:scale-[1.02] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      جاري المعالجة...
                    </>
                  ) : (
                    'إرسال طلب الدفع'
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Success - ✅ مع توجيه مباشر للواتساب */}
          {step === 'success' && (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">تم إرسال طلب الدفع!</h3>
              <p className="text-gray-400 mb-6">
                شكراً لك! تم إرسال إشعار للمدير. الآن يمكنك التواصل عبر واتساب لإرسال صورة التحويل.
              </p>
              
              {/* ✅ زر التواصل مع المدير عبر واتساب */}
              <button
                onClick={contactAdminViaWhatsApp}
                className="w-full px-6 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all flex items-center justify-center gap-2 text-lg font-semibold mb-4"
              >
                <MessageCircle className="w-6 h-6" />
                تواصل مع المدير عبر واتساب
              </button>
              
              {/* ✅ تأكيد إرسال الإشعارات */}
              {notificationSent && (
                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl text-right">
                  <div className="flex items-start gap-3">
                    <Bell className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-white font-medium mb-1">تم إرسال إشعار للمدير</h4>
                      <p className="text-sm text-blue-400">
                        سيتم مراجعة طلبك قريباً. يمكنك متابعة حالة الطلب عبر واتساب.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              <button
                onClick={onClose}
                className="mt-4 text-gray-400 hover:text-white transition-all"
              >
                إغلاق النافذة
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// مكون بطاقة طريقة الدفع
const PaymentMethodCard = ({ id, name, icon: Icon, description, popular, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all flex items-center gap-4 relative ${
      popular ? 'border-yellow-500/50 bg-yellow-500/5' : ''
    }`}
  >
    {popular && (
      <span className="absolute -top-2 -right-2 px-2 py-0.5 bg-yellow-500 text-black text-xs rounded-full font-bold">
        موصى به
      </span>
    )}
    <div className="w-12 h-12 bg-gradient-to-r from-[#6366f1] to-[#a855f7] rounded-lg flex items-center justify-center">
      <Icon className="w-6 h-6 text-white" />
    </div>
    <div className="flex-1 text-right">
      <h3 className="text-white font-semibold">{name}</h3>
      <p className="text-sm text-gray-400">{description}</p>
    </div>
    <Check className="w-5 h-5 text-green-400" />
  </button>
)

// مكون خيار العملة الرقمية
const CryptoOption = ({ type, name, address, onSelect, onCopy, copied }) => (
  <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-white font-semibold">{name}</h3>
      <button
        onClick={onSelect}
        className="px-4 py-2 bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white rounded-lg text-sm"
      >
        اختر
      </button>
    </div>
    <div className="flex items-center gap-2 p-3 bg-black/30 rounded-lg">
      <code className="flex-1 text-white font-mono text-sm break-all">
        {address}
      </code>
      <button
        onClick={() => onCopy(address)}
        className="p-2 hover:bg-white/10 rounded-lg"
      >
        {copied ? (
          <CheckCircle className="w-4 h-4 text-green-400" />
        ) : (
          <Copy className="w-4 h-4 text-gray-400" />
        )}
      </button>
    </div>
  </div>
)

export default PaymentModal

