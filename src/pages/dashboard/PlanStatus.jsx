import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { supabase, statsService } from '../../lib/supabase'
import PaymentModal from '../plans/PaymentModel'
import {
  Check,
  Sparkles,
  Crown,
  Zap,
  Infinity,
  ArrowRight,
  Globe,
  MessageCircle,
  Loader,
  RefreshCw
} from 'lucide-react'

// ============================================
// بيانات العملات
// ============================================
const CURRENCIES = {
  USD: { symbol: '$', name: 'دولار أمريكي', code: 'USD', rate: 1 },
  YER: { symbol: 'ر.ي', name: 'ريال يمني', code: 'YER', rate: 535 },
  SAR: { symbol: 'ر.س', name: 'ريال سعودي', code: 'SAR', rate: 3.75 },
  AED: { symbol: 'د.إ', name: 'درهم إماراتي', code: 'AED', rate: 3.673 },
  EGP: { symbol: 'ج.م', name: 'جنيه مصري', code: 'EGP', rate: 50.19 }
}

// ============================================
// دالة جلب أسعار الصرف
// ============================================
const fetchExchangeRates = async () => {
  try {
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD')
    const data = await response.json()
    
    return {
      USD: 1,
      YER: 535,
      SAR: data.rates?.SAR || 3.75,
      AED: data.rates?.AED || 3.673,
      EGP: data.rates?.EGP || 50.19,
      lastUpdated: new Date().toISOString(),
      yemen: {
        sanaa: { usd: 535, sar: 140 },
        aden: { usd: 1548, sar: 406 }
      }
    }
  } catch (error) {
    console.error('Error fetching exchange rates:', error)
    return {
      USD: 1,
      YER: 535,
      SAR: 3.75,
      AED: 3.673,
      EGP: 50.19,
      lastUpdated: new Date().toISOString(),
      yemen: {
        sanaa: { usd: 535, sar: 140 },
        aden: { usd: 1548, sar: 406 }
      }
    }
  }
}

// ============================================
// دالة كشف الدولة
// ============================================
const detectCountryFromIP = async () => {
  try {
    const response = await fetch('https://ipapi.co/json/')
    const data = await response.json()
    
    let currency = 'USD'
    let region = 'western'
    
    if (data.country_code === 'YE') {
      currency = 'YER'
      region = 'middle_east'
    } else if (data.country_code === 'SA') {
      currency = 'SAR'
      region = 'middle_east'
    } else if (data.country_code === 'AE') {
      currency = 'AED'
      region = 'middle_east'
    } else if (data.country_code === 'EG') {
      currency = 'EGP'
      region = 'middle_east'
    }
    
    return {
      country: data.country_code || 'US',
      country_name: data.country_name || 'United States',
      region: region,
      currency: currency,
      city: data.city || '',
      yemen_region: data.country_code === 'YE' ? 
        (data.city?.includes('عدن') ? 'aden' : 'sanaa') : 'sanaa'
    }
  } catch (error) {
    console.error('Error detecting country:', error)
    return {
      country: 'US',
      country_name: 'United States',
      region: 'western',
      currency: 'USD',
      yemen_region: 'sanaa'
    }
  }
}

// ============================================
// مكونات Skeleton Loading
// ============================================
const PlanCardSkeleton = () => (
  <div className="relative bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 animate-pulse">
    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-white/10 rounded-full"></div>
    <div className="mb-6">
      <div className="w-12 h-12 rounded-xl bg-white/10"></div>
    </div>
    <div className="h-8 w-32 bg-white/10 rounded-lg mb-2"></div>
    <div className="h-4 w-24 bg-white/10 rounded-lg mb-4"></div>
    <div className="mb-6">
      <div className="h-10 w-40 bg-white/10 rounded-lg"></div>
      <div className="h-3 w-20 bg-white/5 rounded-lg mt-2"></div>
    </div>
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
          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full w-3/4 bg-white/10 rounded-full"></div>
          </div>
        </div>
      ))}
    </div>
    <div className="w-full h-12 bg-white/10 rounded-xl"></div>
  </div>
)

// ============================================
// الدوال المساعدة
// ============================================
const getPlanIcon = (planName, planId) => {
  const icons = {
    1: Zap,
    2: Sparkles,
    3: Crown,
    4: Infinity
  }
  return icons[planId] || Crown
}

const getPlanColor = (planId) => {
  const colors = {
    1: 'from-blue-500 to-cyan-500',
    2: 'from-purple-500 to-pink-500',
    3: 'from-yellow-500 to-orange-500',
    4: 'from-green-500 to-emerald-500'
  }
  return colors[planId] || 'from-gray-500 to-gray-600'
}

const generateFeaturesFromPlan = (plan) => {
  if (!plan) return []
  
  return [
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
    }
  ]
}

// ============================================
// المكون الرئيسي (مبسط ومستقر)
// ============================================
const PlanStatus = () => {
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [showPayment, setShowPayment] = useState(false)
  const [billingCycle, setBillingCycle] = useState('monthly')
  const [userCountry, setUserCountry] = useState('US')
  const [userCountryName, setUserCountryName] = useState('United States')
  const [userRegion, setUserRegion] = useState('western')
  const [yemenRegion, setYemenRegion] = useState('sanaa')
  const [selectedCurrency, setSelectedCurrency] = useState('USD')
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false)
  const [exchangeRates, setExchangeRates] = useState(null)
  const [loadingRates, setLoadingRates] = useState(true)
  const [detectingCountry, setDetectingCountry] = useState(true)
  
  const { user, isAuthenticated, loading: authLoading } = useAuth() || { loading: true }
  const [allPlans, setAllPlans] = useState([])
  const [currentPlan, setCurrentPlan] = useState(null)
  const [usage, setUsage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [userPlanId, setUserPlanId] = useState(null)
  const [convertedPrices, setConvertedPrices] = useState({})
  
  const navigate = useNavigate()

  // ============================================
  // جلب بيانات الباقات والمستخدم
  // ============================================
  useEffect(() => {
    if (user?.id) {
      fetchAllData()
    }
  }, [user?.id])

  const fetchAllData = async () => {
    setLoading(true)
    
    try {
      // 1️⃣ جلب جميع الباقات
      const { data: plans, error: plansError } = await supabase
        .from('plans')
        .select('*')
        .eq('is_active', true)

      if (plansError) throw plansError
      setAllPlans(plans || [])

      // 2️⃣ جلب plan_id من قاعدة البيانات
      if (user?.id) {
        const { data: userData, error: userError } = await supabase
          .from('developers')
          .select('id, plan_id')
          .eq('id', user.id)
          .single()

        if (!userError && userData) {
          setUserPlanId(userData.plan_id)
          
          // 3️⃣ جلب تفاصيل الباقة الحالية
          if (userData.plan_id) {
            const { data: planDetails } = await supabase
              .from('plans')
              .select('*')
              .eq('id', userData.plan_id)
              .single()
            
            setCurrentPlan(planDetails || null)
          }
        }

        // 4️⃣ جلب الاستخدام الحالي
        const content = await statsService.getContentStats(user.id)
        setUsage(content?.counts || {})
      }

    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  // ============================================
  // جلب أسعار الصرف
  // ============================================
  const loadExchangeRates = async () => {
    setLoadingRates(true)
    try {
      const rates = await fetchExchangeRates()
      setExchangeRates(rates)
    } catch (error) {
      console.error('Error loading exchange rates:', error)
    } finally {
      setLoadingRates(false)
    }
  }

  // ============================================
  // كشف الدولة
  // ============================================
  const detectCountry = async () => {
    setDetectingCountry(true)
    try {
      const data = await detectCountryFromIP()
      setUserCountry(data.country)
      setUserCountryName(data.country_name)
      setUserRegion(data.region)
      setYemenRegion(data.yemen_region)
      setSelectedCurrency(data.currency)
    } catch (error) {
      console.error('Error detecting country:', error)
    } finally {
      setDetectingCountry(false)
    }
  }

  useEffect(() => {
    detectCountry()
    loadExchangeRates()

    const interval = setInterval(() => {
      loadExchangeRates()
    }, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [])

  // ============================================
  // دالة تحويل العملة
  // ============================================
  const convertPrice = (priceInUSD, targetCurrency) => {
    if (!exchangeRates) {
      return {
        price: priceInUSD,
        amount: priceInUSD,
        currency: 'USD',
        symbol: '$',
        originalUSD: priceInUSD
      }
    }

    let rate = exchangeRates[targetCurrency] || 1

    if (targetCurrency === 'YER' && exchangeRates.yemen) {
      rate = yemenRegion === 'aden' 
        ? exchangeRates.yemen.aden.usd 
        : exchangeRates.yemen.sanaa.usd
    }

    const convertedPrice = priceInUSD * rate

    return {
      price: Number(convertedPrice.toFixed(2)),
      amount: Number(convertedPrice.toFixed(2)),
      currency: targetCurrency,
      symbol: CURRENCIES[targetCurrency]?.symbol || '$',
      originalUSD: priceInUSD,
      rate
    }
  }

  useEffect(() => {
    if (allPlans?.length > 0 && exchangeRates) {
      const newPrices = {}
      allPlans.forEach(plan => {
        if (plan) {
          newPrices[`${plan.id}_monthly`] = convertPrice(plan.price_monthly || 0, selectedCurrency)
          if (plan.price_yearly) {
            newPrices[`${plan.id}_yearly`] = convertPrice(plan.price_yearly, selectedCurrency)
          }
        }
      })
      setConvertedPrices(newPrices)
    }
  }, [selectedCurrency, exchangeRates, allPlans, yemenRegion])

  const handleSelectPlan = (plan) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/dashboard/plans' } })
      return
    }
    setSelectedPlan(plan)
    setShowPayment(true)
  }

  const getPrice = (plan) => {
    if (!plan) return { amount: 0, currency: 'USD', symbol: '$' }
    
    const key = `${plan.id}_${billingCycle}`
    const converted = convertedPrices[key]
    
    if (converted) {
      return converted
    }
    
    const price = billingCycle === 'yearly' && plan.price_yearly
      ? plan.price_yearly
      : plan.price_monthly || 0
      
    return {
      amount: price,
      currency: 'USD',
      symbol: '$',
      originalUSD: price
    }
  }

  const getSavings = (plan) => {
    if (billingCycle === 'yearly' && plan?.price_yearly && plan?.price_monthly) {
      const monthlyTotal = plan.price_monthly * 12
      const savings = monthlyTotal - plan.price_yearly
      return Math.round((savings / monthlyTotal) * 100)
    }
    return 0
  }

  // ✅ دالة isCurrentPlan المبسطة والصحيحة
  const isCurrentPlan = (planId) => {
    // استخدام userPlanId من قاعدة البيانات
    if (userPlanId) {
      return Number(userPlanId) === Number(planId)
    }
    // fallback إلى user?.plan_id
    if (user?.plan_id) {
      return Number(user.plan_id) === Number(planId)
    }
    return false
  }

  const getCountryFlag = (countryCode) => {
    const flags = {
      YE: '🇾🇪',
      SA: '🇸🇦',
      AE: '🇦🇪',
      EG: '🇪🇬',
      US: '🇺🇸',
      GB: '🇬🇧'
    }
    return flags[countryCode] || '🌍'
  }

  const isLoading = authLoading || loading || loadingRates || detectingCountry
  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between animate-pulse">
          <div className="h-8 w-48 bg-white/10 rounded-lg"></div>
          <div className="h-5 w-32 bg-white/10 rounded-lg"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
          <PlanCardSkeleton />
          <PlanCardSkeleton />
          <PlanCardSkeleton />
          <PlanCardSkeleton />
        </div>
      </div>
    )
  }

  if (!allPlans || allPlans.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400">لا توجد باقات متاحة حالياً</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">الباقات والاشتراكات</h1>
        <div className="text-sm text-gray-400">
          باقتك الحالية: {currentPlan?.name_ar || 
            (userPlanId === 1 ? 'مجانية' : 
             userPlanId === 2 ? 'أساسية' : 
             userPlanId === 3 ? 'محترف' : 
             userPlanId === 4 ? 'مؤسسات' : 'مجانية')}
        </div>
      </div>

      {/* Lifetime Badge */}
      <div className="mb-4 p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl">
        <p className="text-purple-400 flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          جميع الباقات مدى الحياة! ادفع مرة واحدة واستمتع بالمميزات للأبد
        </p>
      </div>

      {/* Country and Currency Bar (مبسط) */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 border border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-[#6366f1]" />
            <span className="text-gray-400">موقعك:</span>
            <span className="text-white font-medium">
              {getCountryFlag(userCountry)} {userCountryName}
            </span>
          </div>
          
          <div className="relative">
            <button
              onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
              className="px-4 py-2 bg-white/10 rounded-lg"
            >
              {CURRENCIES[selectedCurrency]?.symbol} {CURRENCIES[selectedCurrency]?.name}
            </button>
          </div>
        </div>
      </div>

      {/* Billing Toggle */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={() => setBillingCycle('monthly')}
          className={`px-6 py-2 rounded-full transition-all ${
            billingCycle === 'monthly'
              ? 'bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white'
              : 'bg-white/5 text-gray-400'
          }`}
        >
          شهري
        </button>
        <button
          onClick={() => setBillingCycle('yearly')}
          className={`px-6 py-2 rounded-full transition-all relative ${
            billingCycle === 'yearly'
              ? 'bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white'
              : 'bg-white/5 text-gray-400'
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
        {allPlans.map((plan) => {
          if (!plan) return null
          
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
                current
                  ? 'border-green-500/50 shadow-[0_0_20px_rgba(34,197,94,0.2)]'
                  : plan.is_popular
                  ? 'border-[#a855f7] shadow-[0_0_30px_rgba(168,85,247,0.3)]'
                  : 'border-white/10'
              } p-8 hover:scale-105 transition-all duration-300 group`}
            >
              {current && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-1 rounded-full text-sm font-bold">
                  باقتك الحالية
                </div>
              )}

              {plan.is_popular && !current && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white px-4 py-1 rounded-full text-sm font-bold">
                  الأكثر طلباً
                </div>
              )}

              <PlanIcon className={`w-12 h-12 mb-6 bg-gradient-to-r ${planColor} bg-clip-text text-transparent`} />

              <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
              <p className="text-gray-400 text-sm mb-4">{plan.name_ar}</p>

              <div className="mb-6">
                <span className="text-4xl font-bold text-white">
                  {price.symbol}{price.amount}
                </span>
                <span className="text-gray-400 text-sm mr-2">لمدى الحياة</span>
              </div>

              <div className="space-y-4 mb-8">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-gray-300">
                    <Check className="w-4 h-4 text-green-400" />
                    <span className="text-sm">{feature.text}: {feature.limit}</span>
                  </div>
                ))}
              </div>

              {current ? (
                <button
                  disabled
                  className="w-full py-3 bg-white/10 text-gray-400 rounded-xl cursor-not-allowed"
                >
                  الباقة الحالية
                </button>
              ) : (
                <button
                  onClick={() => handleSelectPlan(plan)}
                  className="w-full py-3 bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  اشتر الآن
                </button>
              )}
            </div>
          )
        })}
      </div>

      {/* Contact Button */}
      <div className="mt-8 p-6 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MessageCircle className="w-8 h-8 text-green-400" />
            <div>
              <h3 className="text-white font-semibold">لديك استفسار؟</h3>
              <p className="text-sm text-gray-400">تواصل معنا عبر واتساب</p>
            </div>
          </div>
          <a
            href="https://wa.me/967771315459"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 bg-green-600 text-white rounded-xl"
          >
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
          exchangeRate={exchangeRates?.[selectedCurrency]}
          onClose={() => setShowPayment(false)}
        />
      )}
    </div>
  )
}

export default PlanStatus
