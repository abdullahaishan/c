import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { usePlan } from '../../hooks/usePlan'
import { PLANS } from '../../utils/constants'
import { 
  CURRENCIES, 
  COUNTRIES, 
  convertPrice, 
  detectCountryFromIP,
  getPaymentMethodsForRegion 
} from '../../utils/currency'
import PaymentModal from '../plans/PaymentModel'
import {
  Check,
  Sparkles,
  Crown,
  Zap,
  Infinity,
  ArrowRight,
  Globe,
  X,
  TrendingUp,
  HardDrive,
  MessageCircle,
  Award
} from 'lucide-react'

const PlanStatus = () => {
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [showPayment, setShowPayment] = useState(false)
  const [billingCycle, setBillingCycle] = useState('monthly')
  const [userCountry, setUserCountry] = useState('US')
  const [userRegion, setUserRegion] = useState('western')
  const [selectedCurrency, setSelectedCurrency] = useState('USD')
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false)
  const [convertedPrices, setConvertedPrices] = useState({})
  
  const { user, isAuthenticated } = useAuth()
  const { planId, usage, limits, getUsagePercentage } = usePlan()
  const navigate = useNavigate()

  // كشف الدولة عند تحميل الصفحة
  useEffect(() => {
    const detectCountry = async () => {
      const data = await detectCountryFromIP()
      setUserCountry(data.country)
      setUserRegion(data.region)
      
      // تحديد العملة حسب الدولة
      if (data.country === 'YE') {
        setSelectedCurrency('YER_ADEN')
      } else if (data.currency) {
        setSelectedCurrency(data.currency)
      }
    }
    detectCountry()
  }, [])

  // تحويل الأسعار عند تغيير العملة
  useEffect(() => {
    const newPrices = {}
    PLANS.forEach(plan => {
      const monthlyPrice = plan.price_monthly || plan.price
      const yearlyPrice = plan.price_yearly
      
      newPrices[`${plan.id}_monthly`] = convertPrice(monthlyPrice, selectedCurrency)
      if (yearlyPrice) {
        newPrices[`${plan.id}_yearly`] = convertPrice(yearlyPrice, selectedCurrency)
      }
    })
    setConvertedPrices(newPrices)
  }, [selectedCurrency])

  const handleSelectPlan = (plan) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/dashboard/plans' } })
      return
    }
    setSelectedPlan(plan)
    setShowPayment(true)
  }

  const getPrice = (plan) => {
    const key = `${plan.id}_${billingCycle}`
    const converted = convertedPrices[key]
    
    if (converted) {
      return {
        amount: converted.price,
        currency: converted.currency,
        symbol: converted.symbol,
        region: converted.region
      }
    }
    
    const price = billingCycle === 'yearly' && plan.price_yearly
      ? plan.price_yearly
      : plan.price_monthly || plan.price
      
    return {
      amount: price,
      currency: 'USD',
      symbol: '$'
    }
  }

  const getSavings = (plan) => {
    if (billingCycle === 'yearly' && plan.price_yearly && plan.price_monthly) {
      const monthlyTotal = plan.price_monthly * 12
      const savings = monthlyTotal - plan.price_yearly
      return Math.round((savings / monthlyTotal) * 100)
    }
    return 0
  }

  // التحقق إذا كانت الباقة هي الباقة الحالية للمستخدم
  const isCurrentPlan = (planId) => {
    return planId === user?.plan_id
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">الباقات والاشتراكات</h1>
        <div className="text-sm text-gray-400">
          باقتك الحالية: {PLANS.find(p => p.id === user?.plan_id)?.name_ar || 'مجانية'}
        </div>
      </div>

      {/* Lifetime Badge */}
      <div className="mb-4 p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl">
        <p className="text-purple-400 flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          جميع الباقات مدى الحياة! ادفع مرة واحدة واستمتع بالمميزات للأبد
        </p>
      </div>

      {/* Country and Currency Bar */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 border border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-[#6366f1]" />
          <span className="text-gray-400">موقعك:</span>
          <span className="text-white font-medium">
            {userCountry === 'YE' ? '🇾🇪 اليمن' : 
             userCountry === 'SA' ? '🇸🇦 السعودية' :
             userCountry === 'AE' ? '🇦🇪 الإمارات' :
             userCountry === 'EG' ? '🇪🇬 مصر' : '🌍 أخرى'}
          </span>
        </div>
        
        <div className="relative">
          <button
            onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/15 transition-all"
          >
            <span className="text-white">
              {selectedCurrency === 'YER_ADEN' ? 'ر.ي' : 
               selectedCurrency === 'YER_SANA' ? 'ر.ي' :
               CURRENCIES[selectedCurrency]?.symbol || '$'}
            </span>
            <span className="text-gray-300">
              {selectedCurrency === 'YER_ADEN' ? 'ريال يمني (عدن)' :
               selectedCurrency === 'YER_SANA' ? 'ريال يمني (صنعاء)' :
               CURRENCIES[selectedCurrency]?.name || 'USD'}
            </span>
          </button>
          
          {showCurrencyDropdown && (
  <>
    {/* طبقة خلفية شفافة تمنع النقر على البطاقات */}
    <div 
      className="fixed inset-0 z-40" 
      onClick={() => setShowCurrencyDropdown(false)} 
    />
    
    {/* قائمة العملات - فوق كل شيء */}
    <div className="absolute top-full left-0 mt-2 w-64 bg-gray-900 border border-white/10 rounded-xl shadow-xl z-[100] max-h-96 overflow-y-auto">
      {/* اليمن - بخيارات متعددة */}
      <div className="px-3 py-2 text-xs text-gray-500 bg-white/5">🇾🇪 اليمن</div>
      <button
        onClick={() => {
          setSelectedCurrency('YER_ADEN')
          setShowCurrencyDropdown(false)
        }}
        className={`w-full flex items-center gap-3 px-4 py-3 text-right hover:bg-white/5 transition-all ${
          selectedCurrency === 'YER_ADEN' ? 'bg-[#6366f1]/20' : ''
        }`}
      >
        <span className="text-white font-bold">ر.ي</span>
        <span className="flex-1 text-gray-300">ريال يمني (عدن) - 1620</span>
      </button>
      <button
        onClick={() => {
          setSelectedCurrency('YER_SANA')
          setShowCurrencyDropdown(false)
        }}
        className={`w-full flex items-center gap-3 px-4 py-3 text-right hover:bg-white/5 transition-all ${
          selectedCurrency === 'YER_SANA' ? 'bg-[#6366f1]/20' : ''
        }`}
      >
        <span className="text-white font-bold">ر.ي</span>
        <span className="flex-1 text-gray-300">ريال يمني (صنعاء) - 530</span>
      </button>
      
      {/* دول الخليج */}
      <div className="px-3 py-2 text-xs text-gray-500 bg-white/5 mt-2">🇸🇦 دول الخليج</div>
      <button
        onClick={() => {
          setSelectedCurrency('SAR')
          setShowCurrencyDropdown(false)
        }}
        className={`w-full flex items-center gap-3 px-4 py-3 text-right hover:bg-white/5 transition-all ${
          selectedCurrency === 'SAR' ? 'bg-[#6366f1]/20' : ''
        }`}
      >
        <span className="text-white font-bold">ر.س</span>
        <span className="flex-1 text-gray-300">ريال سعودي</span>
      </button>
      <button
        onClick={() => {
          setSelectedCurrency('AED')
          setShowCurrencyDropdown(false)
        }}
        className={`w-full flex items-center gap-3 px-4 py-3 text-right hover:bg-white/5 transition-all ${
          selectedCurrency === 'AED' ? 'bg-[#6366f1]/20' : ''
        }`}
      >
        <span className="text-white font-bold">د.إ</span>
        <span className="flex-1 text-gray-300">درهم إماراتي</span>
      </button>
      
      {/* دول أخرى */}
      <div className="px-3 py-2 text-xs text-gray-500 bg-white/5 mt-2">🌍 أخرى</div>
      <button
        onClick={() => {
          setSelectedCurrency('USD')
          setShowCurrencyDropdown(false)
        }}
        className={`w-full flex items-center gap-3 px-4 py-3 text-right hover:bg-white/5 transition-all ${
          selectedCurrency === 'USD' ? 'bg-[#6366f1]/20' : ''
        }`}
      >
        <span className="text-white font-bold">$</span>
        <span className="flex-1 text-gray-300">دولار أمريكي</span>
      </button>
    </div>
  </>
)}
        </div>
      </div>

      {/* Billing Toggle */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={() => setBillingCycle('monthly')}
          className={`px-6 py-2 rounded-full transition-all ${
            billingCycle === 'monthly'
              ? 'bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white'
              : 'bg-white/5 text-gray-400 hover:bg-white/10'
          }`}
        >
          شهري
        </button>
        <button
          onClick={() => setBillingCycle('yearly')}
          className={`px-6 py-2 rounded-full transition-all relative ${
            billingCycle === 'yearly'
              ? 'bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white'
              : 'bg-white/5 text-gray-400 hover:bg-white/10'
          }`}
        >
          سنوي
          <span className="absolute -top-2 -right-2 px-2 py-0.5 bg-green-500 text-white text-xs rounded-full">
            وفر 20%
          </span>
        </button>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
        {PLANS.map((plan) => {
          const price = getPrice(plan)
          const savings = getSavings(plan)
          const current = isCurrentPlan(plan.id)
          
          return (
            <div
              key={plan.id}
              className={`relative bg-white/5 backdrop-blur-xl rounded-2xl border ${
                plan.isPopular && !current
                  ? 'border-[#a855f7] shadow-[0_0_30px_rgba(168,85,247,0.3)]'
                  : current
                  ? 'border-green-500/50 shadow-[0_0_20px_rgba(34,197,94,0.2)]'
                  : 'border-white/10'
              } p-8 hover:scale-105 transition-all duration-300 group`}
            >
              {/* Popular Badge */}
              {plan.isPopular && !current && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white px-4 py-1 rounded-full text-sm font-bold whitespace-nowrap">
                  الأكثر طلباً
                </div>
              )}

              {/* Current Plan Badge */}
              {current && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-1 rounded-full text-sm font-bold whitespace-nowrap">
                  باقتك الحالية
                </div>
              )}

              {/* Plan Icon */}
              <div className="mb-6">
                {plan.id === 1 && <Zap className="w-12 h-12 text-blue-400" />}
                {plan.id === 2 && <Sparkles className="w-12 h-12 text-purple-400" />}
                {plan.id === 3 && <Crown className="w-12 h-12 text-yellow-400" />}
                {plan.id === 4 && <Infinity className="w-12 h-12 text-green-400" />}
              </div>

              {/* Plan Name */}
              <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
              <p className="text-gray-400 text-sm mb-4">{plan.name_ar}</p>

              {/* Price */}
              <div className="mb-6">
                <span className="text-4xl font-bold text-white">
                  {price.symbol}{price.amount}
                </span>
                <span className="text-gray-400 text-sm mr-2">لمدى الحياة</span>
                {plan.savings && (
                  <p className="text-xs text-green-400 mt-1">{plan.savings}</p>
                )}
                {selectedCurrency !== 'USD' && plan.price > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    ≈ ${plan.price} USD
                  </p>
                )}
              </div>

              {/* =========================================== */}
              {/* المميزات الرئيسية مع عرض الاستخدام - الكود المطلوب */}
              {/* =========================================== */}
              <div className="space-y-4 mb-8">
                {plan.features.map((feature, index) => {
                  // حساب النسبة المئوية للاستخدام (للمستخدم الحالي)
                  const isCurrentUserPlan = user?.plan_id === plan.id
                  
                  // تحديد المفتاح الصحيح للاستخدام
                  let usageKey = ''
                  if (feature.text.includes('المشاريع')) usageKey = 'projects'
                  else if (feature.text.includes('المهارات')) usageKey = 'skills'
                  else if (feature.text.includes('الشهادات')) usageKey = 'certificates'
                  else if (feature.text.includes('الخبرات')) usageKey = 'experience'
                  else if (feature.text.includes('التعليم')) usageKey = 'education'
                  else if (feature.text.includes('تحليلات')) usageKey = 'analyses'
                  
                  const currentUsage = usage?.[usageKey] || 0
                  const usagePercent = isCurrentUserPlan && feature.value > 0 && feature.value !== -1
                    ? Math.min(100, Math.round((currentUsage / feature.value) * 100))
                    : null
                  
                  return (
                    <div key={index} className="group">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-start gap-2 text-gray-300">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                            feature.included === false ? 'bg-gray-500/20' : 'bg-green-500/20'
                          }`}>
                            <Check className={`w-3.5 h-3.5 ${
                              feature.included === false ? 'text-gray-500' : 'text-green-400'
                            }`} />
                          </div>
                          <span className="text-sm">{feature.text}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-medium ${
                            feature.value === 0 ? 'text-gray-500' :
                            feature.value === -1 ? 'text-purple-400' :
                            'text-white'
                          }`}>
                            {feature.limit}
                          </span>
                          {feature.badge && (
                            <span className="px-2 py-0.5 text-xs bg-blue-500/20 text-blue-400 rounded-full">
                              {feature.badge}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* شريط التقدم للمستخدم الحالي */}
                      {isCurrentUserPlan && usagePercent !== null && (
                        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-300 ${
                              usagePercent > 90 ? 'bg-yellow-500' : 'bg-gradient-to-r ' + plan.color
                            }`}
                            style={{ width: `${usagePercent}%` }}
                          />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Action Button */}
              {current ? (
                <button
                  disabled
                  className="w-full py-3 bg-white/10 text-gray-400 rounded-xl font-semibold cursor-not-allowed"
                >
                  الباقة الحالية
                </button>
              ) : (
                <button
                  onClick={() => handleSelectPlan(plan)}
                  className="w-full py-3 bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white rounded-xl font-semibold flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <span>اشتر الآن</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          )
        })}
      </div>

      {/* Contact Admin Button */}
      <div className="mt-8 p-6 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-2xl border border-green-500/20">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <MessageCircle className="w-8 h-8 text-green-400" />
            <div>
              <h3 className="text-white font-semibold">لديك استفسار؟</h3>
              <p className="text-sm text-gray-400">تواصل معنا مباشرة عبر واتساب</p>
            </div>
          </div>
          <a
            href="https://wa.me/967771315459"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all flex items-center gap-2"
          >
            <MessageCircle className="w-5 h-5" />
            تواصل مع الدعم
          </a>
        </div>
      </div>

      {/* Payment Modal */}
      {showPayment && selectedPlan && (
        <PaymentModal
          plan={selectedPlan}
          billingCycle={billingCycle}
          currency={selectedCurrency}
          convertedPrice={getPrice(selectedPlan)}
          userCountry={userCountry}
          userRegion={userRegion}
          onClose={() => setShowPayment(false)}
        />
      )}
    </div>
  )
}

export default PlanStatus
