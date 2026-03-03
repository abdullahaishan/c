// PlanStatus.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { usePlan } from '../../hooks/usePlan'
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
  Award,
  Briefcase,
  GraduationCap,
  Cpu,
  BarChart3,
  Shield,
  Loader
} from 'lucide-react'

// ============================================
// مكونات Skeleton Loading (تأثير السراب)
// ============================================

// Skeleton للبطاقة الرئيسية
const PlanCardSkeleton = () => (
  <div className="relative bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 animate-pulse">
    {/* شريط التحميل العلوي */}
      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-white/10 rounded-full"></div>
    
    {/* أيقونة الباقة */}
    <div className="mb-6">
      <div className="w-12 h-12 rounded-xl bg-white/10"></div>
    </div>
    
    {/* اسم الباقة */}
    <div className="h-8 w-32 bg-white/10 rounded-lg mb-2"></div>
    <div className="h-4 w-24 bg-white/10 rounded-lg mb-4"></div>
    
    {/* السعر */}
    <div className="mb-6">
      <div className="h-10 w-40 bg-white/10 rounded-lg"></div>
      <div className="h-3 w-20 bg-white/5 rounded-lg mt-2"></div>
    </div>
    
    {/* المميزات (5 أسطر) */}
    <div className="space-y-4 mb-8">
      {[1,2,3,4,5,6].map((i) => (
        <div key={i} className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-white/10"></div>
              <div className="h-4 w-28 bg-white/10 rounded-lg"></div>
            </div>
            <div className="h-4 w-16 bg-white/10 rounded-lg"></div>
          </div>
          {/* شريط التقدم الوهمي */}
          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full w-3/4 bg-white/10 rounded-full"></div>
          </div>
        </div>
      ))}
    </div>
    
    {/* زر الإجراء */}
    <div className="w-full h-12 bg-white/10 rounded-xl"></div>
  </div>
)

// Skeleton لشريط العملات
const CurrencyBarSkeleton = () => (
  <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 border border-white/10 flex items-center justify-between animate-pulse">
    <div className="flex items-center gap-2">
      <div className="w-5 h-5 rounded-full bg-white/10"></div>
      <div className="h-4 w-16 bg-white/10 rounded-lg"></div>
      <div className="h-4 w-20 bg-white/10 rounded-lg"></div>
    </div>
    <div className="w-32 h-10 bg-white/10 rounded-lg"></div>
  </div>
)

// Skeleton لشريط التبديل (شهري/سنوي)
const ToggleSkeleton = () => (
  <div className="flex items-center justify-center gap-4 animate-pulse">
    <div className="w-20 h-10 bg-white/10 rounded-full"></div>
    <div className="w-20 h-10 bg-white/10 rounded-full relative">
      <div className="absolute -top-2 -right-2 w-12 h-5 bg-white/10 rounded-full"></div>
    </div>
  </div>
)

// Skeleton للشريط السفلي (تواصل مع الدعم)
const ContactSkeleton = () => (
  <div className="mt-8 p-6 bg-white/5 rounded-2xl border border-white/10 animate-pulse">
    <div className="flex items-center justify-between flex-wrap gap-4">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-white/10"></div>
        <div>
          <div className="h-5 w-32 bg-white/10 rounded-lg mb-2"></div>
          <div className="h-4 w-48 bg-white/10 rounded-lg"></div>
        </div>
      </div>
      <div className="w-40 h-12 bg-white/10 rounded-xl"></div>
    </div>
  </div>
)

// Skeleton للشريط العلوي (باقتك الحالية)
const HeaderSkeleton = () => (
  <div className="flex items-center justify-between animate-pulse">
    <div className="h-8 w-48 bg-white/10 rounded-lg"></div>
    <div className="h-5 w-32 bg-white/10 rounded-lg"></div>
  </div>
)

// Skeleton للـ Badge (جميع الباقات مدى الحياة)
const LifetimeBadgeSkeleton = () => (
  <div className="mb-4 p-4 bg-white/5 rounded-xl border border-white/10 animate-pulse">
    <div className="flex items-center gap-2">
      <div className="w-5 h-5 rounded-full bg-white/10"></div>
      <div className="h-5 w-64 bg-white/10 rounded-lg"></div>
    </div>
  </div>
)

// دالة مساعدة للحصول على الأيقونة المناسبة حسب اسم الباقة
const getPlanIcon = (planName, planId) => {
  const icons = {
    1: Zap,
    2: Sparkles,
    3: Crown,
    4: Infinity
  }
  return icons[planId] || Crown
}

// دالة مساعدة للحصول على لون الباقة
const getPlanColor = (planId) => {
  const colors = {
    1: 'from-blue-500 to-cyan-500',
    2: 'from-purple-500 to-pink-500',
    3: 'from-yellow-500 to-orange-500',
    4: 'from-green-500 to-emerald-500'
  }
  return colors[planId] || 'from-gray-500 to-gray-600'
}

// دالة لتوليد قائمة المميزات من بيانات الباقة
const generateFeaturesFromPlan = (plan) => {
  const features = [
    {
      text: 'عدد المشاريع',
      limit: plan.max_projects === -1 ? 'غير محدود' : plan.max_projects,
      value: plan.max_projects,
      included: true
    },
    {
      text: 'عدد المهارات',
      limit: plan.max_skills === -1 ? 'غير محدود' : plan.max_skills,
      value: plan.max_skills,
      included: true
    },
    {
      text: 'الشهادات',
      limit: plan.max_certificates === -1 ? 'غير محدود' : plan.max_certificates,
      value: plan.max_certificates,
      included: true
    },
    {
      text: 'الخبرات',
      limit: plan.max_experience === -1 ? 'غير محدود' : plan.max_experience,
      value: plan.max_experience,
      included: true
    },
    {
      text: 'التعليم',
      limit: plan.max_education === -1 ? 'غير محدود' : plan.max_education,
      value: plan.max_education,
      included: true
    },
    {
      text: 'تحليلات ذكاء اصطناعي',
      limit: plan.max_ai_analyses === -1 ? 'غير محدود' : `${plan.max_ai_analyses} تحليل`,
      value: plan.max_ai_analyses,
      included: plan.ai_analysis
    },
    {
      text: 'نطاق مخصص',
      limit: plan.custom_domain ? 'متاح' : 'غير متاح',
      included: plan.custom_domain
    },
    {
      text: 'إحصائيات متقدمة',
      limit: plan.has_advanced_stats ? 'متاح' : 'غير متاح',
      included: plan.has_advanced_stats
    },
    {
      text: 'إزالة العلامة التجارية',
      limit: plan.has_remove_branding ? 'متاح' : 'غير متاح',
      included: plan.has_remove_branding
    },
    {
      text: 'دعم أولوية',
      limit: plan.has_priority_support ? 'متاح' : 'غير متاح',
      included: plan.has_priority_support
    }
  ]

  return features
}

const PlanStatus = () => {
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [showPayment, setShowPayment] = useState(false)
  const [billingCycle, setBillingCycle] = useState('monthly')
  const [userCountry, setUserCountry] = useState('US')
  const [userRegion, setUserRegion] = useState('western')
  const [selectedCurrency, setSelectedCurrency] = useState('USD')
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false)
  const [convertedPrices, setConvertedPrices] = useState({})
  const [detectingCountry, setDetectingCountry] = useState(true) // حالة تحميل كشف الدولة
  
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const { allPlans, currentPlan, usage, getUsagePercentage, loading: plansLoading } = usePlan()
  const navigate = useNavigate()

  // كشف الدولة عند تحميل الصفحة
  useEffect(() => {
    const detectCountry = async () => {
      setDetectingCountry(true)
      try {
        const data = await detectCountryFromIP()
        setUserCountry(data.country)
        setUserRegion(data.region)
        
        // تحديد العملة حسب الدولة
        if (data.country === 'YE') {
          setSelectedCurrency('YER_ADEN')
        } else if (data.currency) {
          setSelectedCurrency(data.currency)
        }
      } catch (error) {
        console.error('Error detecting country:', error)
      } finally {
        setDetectingCountry(false)
      }
    }
    detectCountry()
  }, [])

  // تحويل الأسعار عند تغيير العملة
  useEffect(() => {
    if (allPlans && allPlans.length > 0) {
      const newPrices = {}
      allPlans.forEach(plan => {
        newPrices[`${plan.id}_monthly`] = convertPrice(plan.price_monthly || 0, selectedCurrency)
        if (plan.price_yearly) {
          newPrices[`${plan.id}_yearly`] = convertPrice(plan.price_yearly, selectedCurrency)
        }
      })
      setConvertedPrices(newPrices)
    }
  }, [selectedCurrency, allPlans])

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
      : plan.price_monthly
      
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

  // ============================================
  // حالات التحميل المختلفة
  // ============================================
  
  const isLoading = authLoading || plansLoading || detectingCountry

  // إذا كان في حالة تحميل، اعرض كل Skeleton
  if (isLoading) {
    return (
      <div className="space-y-6">
        <HeaderSkeleton />
        <LifetimeBadgeSkeleton />
        <CurrencyBarSkeleton />
        <ToggleSkeleton />
        
        {/* شبكة الباقات مع Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
          <PlanCardSkeleton />
          <PlanCardSkeleton />
          <PlanCardSkeleton />
          <PlanCardSkeleton />
        </div>
        
        <ContactSkeleton />
      </div>
    )
  }

  // إذا لم تكن هناك باقات، عرض رسالة
  if (!allPlans || allPlans.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400">لا توجد باقات متاحة حالياً</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">الباقات والاشتراكات</h1>
        <div className="text-sm text-gray-400">
          باقتك الحالية: {currentPlan?.name_ar || 'مجانية'}
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
              <div 
                className="fixed inset-0 bg-black/50 z-[100]" 
                onClick={() => setShowCurrencyDropdown(false)} 
              />
              <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 bg-gray-900 border border-white/10 rounded-xl shadow-xl z-[101] max-h-96 overflow-y-auto">
                <div className="px-3 py-2 text-xs text-gray-500 bg-white/5 sticky top-0">🇾🇪 اليمن</div>
                <button
                  onClick={() => {
                    setSelectedCurrency('YER_ADEN')
                    setShowCurrencyDropdown(false)
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-all ${
                    selectedCurrency === 'YER_ADEN' ? 'bg-[#6366f1]/20' : ''
                  }`}
                >
                  <span className="text-white font-bold w-8">ر.ي</span>
                  <span className="flex-1 text-gray-300 text-right">ريال يمني (عدن)</span>
                </button>
                <button
                  onClick={() => {
                    setSelectedCurrency('YER_SANA')
                    setShowCurrencyDropdown(false)
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-all ${
                    selectedCurrency === 'YER_SANA' ? 'bg-[#6366f1]/20' : ''
                  }`}
                >
                  <span className="text-white font-bold w-8">ر.ي</span>
                  <span className="flex-1 text-gray-300 text-right">ريال يمني (صنعاء)</span>
                </button>
                
                <div className="px-3 py-2 text-xs text-gray-500 bg-white/5 sticky top-0 mt-2">🇸🇦 دول الخليج</div>
                <button
                  onClick={() => {
                    setSelectedCurrency('SAR')
                    setShowCurrencyDropdown(false)
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-all ${
                    selectedCurrency === 'SAR' ? 'bg-[#6366f1]/20' : ''
                  }`}
                >
                  <span className="text-white font-bold w-8">ر.س</span>
                  <span className="flex-1 text-gray-300 text-right">ريال سعودي</span>
                </button>
                <button
                  onClick={() => {
                    setSelectedCurrency('AED')
                    setShowCurrencyDropdown(false)
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-all ${
                    selectedCurrency === 'AED' ? 'bg-[#6366f1]/20' : ''
                  }`}
                >
                  <span className="text-white font-bold w-8">د.إ</span>
                  <span className="flex-1 text-gray-300 text-right">درهم إماراتي</span>
                </button>
                
                <div className="px-3 py-2 text-xs text-gray-500 bg-white/5 sticky top-0 mt-2">🌍 أخرى</div>
                <button
                  onClick={() => {
                    setSelectedCurrency('USD')
                    setShowCurrencyDropdown(false)
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-all ${
                    selectedCurrency === 'USD' ? 'bg-[#6366f1]/20' : ''
                  }`}
                >
                  <span className="text-white font-bold w-8">$</span>
                  <span className="flex-1 text-gray-300 text-right">دولار أمريكي</span>
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

      {/* Plans Grid - ديناميكي من قاعدة البيانات */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
        {allPlans.map((plan) => {
          const PlanIcon = getPlanIcon(plan.name, plan.id)
          const planColor = getPlanColor(plan.id)
          const price = getPrice(plan)
          const savings = getSavings(plan)
          const current = isCurrentPlan(plan.id)
          const features = generateFeaturesFromPlan(plan)
          
          return (
            <div
              key={plan.id}
              className={`relative bg-white/5 backdrop-blur-xl rounded-2xl border ${
                plan.is_popular && !current
                  ? 'border-[#a855f7] shadow-[0_0_30px_rgba(168,85,247,0.3)]'
                  : current
                  ? 'border-green-500/50 shadow-[0_0_20px_rgba(34,197,94,0.2)]'
                  : 'border-white/10'
              } p-8 hover:scale-105 transition-all duration-300 group`}
            >
              {/* Popular Badge */}
              {plan.is_popular && !current && (
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
                <PlanIcon className={`w-12 h-12 bg-gradient-to-r ${planColor} bg-clip-text text-transparent`} />
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
                {savings > 0 && (
                  <p className="text-xs text-green-400 mt-1">وفر {savings}% مع الاشتراك السنوي</p>
                )}
                {selectedCurrency !== 'USD' && plan.price_monthly > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    ≈ ${plan.price_monthly} USD
                  </p>
                )}
              </div>

              {/* Features */}
              <div className="space-y-4 mb-8">
                {features.map((feature, index) => {
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
                        <span className={`text-sm font-medium ${
                          feature.value === 0 ? 'text-gray-500' :
                          feature.value === -1 ? 'text-purple-400' :
                          'text-white'
                        }`}>
                          {feature.limit}
                        </span>
                      </div>
                      
                      {/* Progress bar for current user */}
                      {isCurrentUserPlan && usagePercent !== null && (
                        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-300 ${
                              usagePercent > 90 ? 'bg-yellow-500' : `bg-gradient-to-r ${planColor}`
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
