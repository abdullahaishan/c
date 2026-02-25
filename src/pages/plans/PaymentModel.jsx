import React, { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { supabase, storageService } from '../../lib/supabase'
import { CURRENCIES, COUNTRIES, convertPrice } from '../../utils/currency'
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
  Banknote
} from 'lucide-react'

const PaymentModal = ({ plan, billingCycle, currency, convertedPrice, userCountry, userRegion, onClose }) => {
  const [step, setStep] = useState('method')
  const [method, setMethod] = useState('')
  const [cryptoType, setCryptoType] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [transferDetails, setTransferDetails] = useState('')
  const [selectedBank, setSelectedBank] = useState('')
  
  const { user } = useAuth()
  
  // رقم واتساب الأدمن
  const ADMIN_WHATSAPP = '+967771315459'
  const ADMIN_NAME = 'مدير الموقع'

  // عناوين المحافظ
  const walletAddresses = {
    btc: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    eth: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    usdt: 'TXkZ3XqKqLQkzQkzQkzQkzQkzQkzQkzQkz',
    trx: 'TXYZ...'
  }

  // معلومات البنوك اليمنية
  const yemenBanks = [
    { 
      id: 'alahli', 
      name: 'البنك الأهلي اليمني', 
      account: '1234567890',
      iban: 'YE1234567890',
      branch: 'الفرع الرئيسي - صنعاء'
    },
    { 
      id: 'kuraimi', 
      name: 'بنك الكريمي', 
      account: '9876543210',
      iban: 'YE9876543210',
      branch: 'الفرع الرئيسي - عدن'
    },
    { 
      id: 'taslif', 
      name: 'بنك التسليف', 
      account: '5555555555',
      iban: 'YE5555555555',
      branch: 'الفرع الرئيسي - تعز'
    }
  ]

  // إنشاء رابط واتساب مع الرسالة
  const createWhatsAppLink = (paymentDetails) => {
    const message = `
*طلب دفع جديد - ${plan.name_ar}*
━━━━━━━━━━━━━━━━
👤 *المستخدم:* ${user?.full_name}
📧 *البريد:* ${user?.email}
🆔 *المعرف:* ${user?.id}

💳 *الباقة:* ${plan.name_ar}
💰 *المبلغ:* ${convertedPrice.symbol}${convertedPrice.price}
💱 *العملة:* ${currency}
📅 *الدورة:* ${billingCycle === 'monthly' ? 'شهرية' : 'سنوية'}

💵 *طريقة الدفع:* ${getMethodName(method)}
${cryptoType ? `🪙 *العملة:* ${cryptoType.toUpperCase()}` : ''}
${selectedBank ? `🏦 *البنك:* ${selectedBank}` : ''}

📝 *التفاصيل:* ${transferDetails || 'لا يوجد'}

⏰ *التاريخ:* ${new Date().toLocaleString('ar')}
━━━━━━━━━━━━━━━━
✅ الرجاء تأكيد الدفع بعد التحقق
    `.trim()
    
    return `https://wa.me/${ADMIN_WHATSAPP.replace('+', '')}?text=${encodeURIComponent(message)}`
  }

  const getMethodName = (methodId) => {
    const methods = {
      western: 'ويسترن يونيون',
      moneygram: 'موني جرام',
      crypto: 'عملات رقمية',
      bank: 'تحويل بنكي',
      onecash: 'OneCash'
    }
    return methods[methodId] || methodId
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      setError('حجم الملف يجب أن يكون أقل من 5 ميجابايت')
      return
    }

    if (!file.type.startsWith('image/')) {
      setError('الرجاء رفع صورة فقط')
      return
    }

    setImageFile(file)
    const reader = new FileReader()
    reader.onloadend = () => setImagePreview(reader.result)
    reader.readAsDataURL(file)
    setError('')
  }

  const handleCopyAddress = (text) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError('')

    try {
      // رفع صورة التحويل
      let imageUrl = null
      if (imageFile) {
        imageUrl = await storageService.uploadImage(
          imageFile,
          `payments/${user.id}/${Date.now()}`
        )
      }

      // حفظ بيانات الدفع
      const { error: dbError } = await supabase
        .from('payments')
        .insert([{
          developer_id: user.id,
          plan_id: plan.id,
          amount: convertedPrice.price,
          currency: currency,
          payment_method: method,
          crypto_type: cryptoType,
          bank_name: selectedBank,
          transaction_image: imageUrl,
          transfer_details: transferDetails,
          billing_cycle: billingCycle,
          status: 'pending',
          created_at: new Date()
        }])

      if (dbError) throw dbError

      // إشعار للمستخدم
      await supabase
        .from('notifications')
        .insert([{
          user_id: user.id,
          title: 'تم استلام طلب الدفع',
          message: `تم استلام طلب ترقية إلى باقة ${plan.name_ar}. سنتواصل معك قريباً.`,
          type: 'payment'
        }])

      setStep('success')
    } catch (err) {
      console.error('Payment error:', err)
      setError('فشل في معالجة الدفع. الرجاء المحاولة مرة أخرى.')
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
                <p className="text-xl font-bold text-white">{plan.name_ar}</p>
              </div>
              <div className="text-right">
                <p className="text-gray-400 text-sm">المبلغ</p>
                <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#6366f1] to-[#a855f7]">
                  {convertedPrice.symbol}{convertedPrice.price}
                </p>
                {currency.includes('YER') && (
                  <p className="text-xs text-gray-500 mt-1">
                    ≈ ${plan.price_monthly || plan.price} USD
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* زر التواصل المباشر مع الأدمن */}
          <div className="mb-6">
            <button
              onClick={contactAdminViaWhatsApp}
              className="w-full p-4 bg-green-600/20 border border-green-500/30 rounded-xl hover:bg-green-600/30 transition-all flex items-center gap-4"
            >
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 text-right">
                <h3 className="text-white font-semibold">تواصل مع الدعم عبر واتساب</h3>
                <p className="text-sm text-green-400">للتواصل المباشر مع مدير الموقع</p>
              </div>
              <Send className="w-5 h-5 text-green-400" />
            </button>
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
              {/* ويسترن يونيون - متاح للجميع وخاصة اليمن */}
              <PaymentMethodCard
                id="western"
                name="Western Union"
                icon={Send}
                description="حوالات ويسترن يونيون - الأسرع والأكثر أماناً لليمن"
                required={userRegion === 'yemen'}
                onClick={() => {
                  setMethod('western')
                  setStep('upload')
                }}
              />

              {/* موني جرام */}
              <PaymentMethodCard
                id="moneygram"
                name="MoneyGram"
                icon={Send}
                description="حوالات موني جرام - متوفرة في جميع المحافظات اليمنية"
                onClick={() => {
                  setMethod('moneygram')
                  setStep('upload')
                }}
              />

              {/* العملات الرقمية */}
              <PaymentMethodCard
                id="crypto"
                name="العملات الرقمية"
                icon={Bitcoin}
                description="USDT - BTC - ETH (تحويل فوري للمحفظة)"
                onClick={() => {
                  setMethod('crypto')
                  setStep('crypto')
                }}
              />

              {/* تحويل بنكي */}
              <PaymentMethodCard
                id="bank"
                name="تحويل بنكي"
                icon={Landmark}
                description="حوالات بنكية محلية - البنك الأهلي، الكريمي، التسليف"
                onClick={() => {
                  setMethod('bank')
                  setStep('bank')
                }}
              />

              {/* OneCash */}
              <PaymentMethodCard
                id="onecash"
                name="OneCash"
                icon={Wallet}
                description="محفظة OneCash - تحويل فوري"
                onClick={() => {
                  setMethod('onecash')
                  setStep('upload')
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
                  className="w-full p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all text-right"
                >
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

          {/* Step 2: Upload Proof */}
          {step === 'upload' && (
            <div className="space-y-6">
              {/* Payment Instructions */}
              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                <h3 className="text-white font-medium mb-2">📋 تعليمات الدفع:</h3>
                <p className="text-sm text-blue-400">
                  {method === 'western' && (
                    <>
                      أرسل حوالة ويسترن يونيون إلى:
                      <div className="mt-2 p-3 bg-black/30 rounded-lg text-gray-300">
                        <p>الاسم: محمد أحمد</p>
                        <p>البلد: اليمن - صنعاء</p>
                        <p>الهاتف: +967771315459</p>
                        <p className="text-yellow-400 mt-2">⚠️ بعد الإرسال، أرفق صورة الإيصال</p>
                      </div>
                    </>
                  )}
                  
                  {method === 'moneygram' && (
                    <>
                      أرسل حوالة موني جرام إلى:
                      <div className="mt-2 p-3 bg-black/30 rounded-lg text-gray-300">
                        <p>الاسم: محمد أحمد</p>
                        <p>البلد: اليمن - عدن</p>
                        <p>الهاتف: +967771315459</p>
                        <p className="text-yellow-400 mt-2">⚠️ بعد الإرسال، أرفق صورة الإيصال</p>
                      </div>
                    </>
                  )}
                  
                  {method === 'onecash' && (
                    <>
                      أرسل المبلغ إلى محفظة OneCash:
                      <div className="mt-2 p-3 bg-black/30 rounded-lg text-gray-300">
                        <p>رقم المحفظة: 771315459</p>
                        <p>الاسم: محمد أحمد</p>
                        <p className="text-yellow-400 mt-2">⚠️ بعد الإرسال، أرفق صورة التحويل</p>
                      </div>
                    </>
                  )}
                </p>
              </div>

              {/* Wallet Address (for crypto) */}
              {method === 'crypto' && cryptoType && (
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

              {/* Image Upload */}
              {!imagePreview ? (
                <label className="block border-2 border-dashed border-white/20 rounded-xl p-8 text-center cursor-pointer hover:border-[#a855f7]/50 transition-all">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-white mb-2">اضغط لرفع صورة التحويل</p>
                  <p className="text-sm text-gray-500">صورة الإيصال - PNG, JPG (أقل من 5 ميجابايت)</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Payment proof"
                    className="w-full rounded-xl"
                  />
                  <button
                    onClick={() => {
                      setImagePreview(null)
                      setImageFile(null)
                    }}
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

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
                  disabled={loading || !imageFile}
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

              {/* Contact Admin Button */}
              <button
                onClick={contactAdminViaWhatsApp}
                className="w-full p-3 bg-green-600/20 border border-green-500/30 rounded-lg hover:bg-green-600/30 transition-all flex items-center justify-center gap-2 text-green-400"
              >
                <MessageCircle className="w-5 h-5" />
                تواصل مع الدعم عبر واتساب
              </button>
            </div>
          )}

          {/* Step 3: Success */}
          {step === 'success' && (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">تم إرسال طلب الدفع!</h3>
              <p className="text-gray-400 mb-4">
                شكراً لك! تم استلام طلب ترقية باقتك. سنقوم بمراجعته وتفعيلها خلال 24 ساعة.
              </p>
              
              {/* زر التواصل بعد النجاح */}
              <button
                onClick={contactAdminViaWhatsApp}
                className="mt-4 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all flex items-center justify-center gap-2 mx-auto"
              >
                <MessageCircle className="w-5 h-5" />
                تواصل مع الدعم عبر واتساب
              </button>
              
              <p className="text-sm text-gray-500 mt-4">
                يمكنك التواصل معنا مباشرة عبر واتساب للاستفسار عن حالة طلبك
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// مكون بطاقة طريقة الدفع
const PaymentMethodCard = ({ id, name, icon: Icon, description, required, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all flex items-center gap-4 relative ${
      required ? 'border-yellow-500/50 bg-yellow-500/5' : ''
    }`}
  >
    {required && (
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
