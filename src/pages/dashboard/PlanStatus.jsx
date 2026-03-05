import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { supabase, statsService } from '../../lib/supabase'
import PaymentModal from '../plans/PaymentModel'
import ContactSupport from '../../components/ContactSupport'  
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
  RefreshCw,
  TrendingUp,
  Shield,
  Award,
  Briefcase,
  Code,
  GraduationCap,
  XCircle
} from 'lucide-react'

// ============================================
// بيانات العملات المحدثة (مارس 2026)
// ============================================
const CURRENCIES = {
  USD: { symbol: '$', name: 'دولار أمريكي', code: 'USD', rate: 1, flag: '🇺🇸' },
  YER: { 
    symbol: 'ر.ي', 
    name: 'ريال يمني', 
    code: 'YER', 
    rate: 535, 
    flag: '🇾🇪',
    regions: {
      sanaa: { usd: 535, sar: 140 },
      aden: { usd: 1548, sar: 406 }
    }
  },
  SAR: { symbol: 'ر.س', name: 'ريال سعودي', code: 'SAR', rate: 3.75, flag: '🇸🇦' },
  AED: { symbol: 'د.إ', name: 'درهم إماراتي', code: 'AED', rate: 3.673, flag: '🇦🇪' },
  EGP: { symbol: 'ج.م', name: 'جنيه مصري', code: 'EGP', rate: 50.19, flag: '🇪🇬' }
}

// ============================================
// دالة جلب أسعار الصرف الحقيقية
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
// مكون عرض سعر الصرف المحسن
// ============================================
const ExchangeRateIndicator = ({ rates, lastUpdated, onRefresh }) => (
  <div className="flex items-center gap-3 text-xs bg-white/5 px-3 py-1.5 rounded-full">
    <span className="text-gray-400">آخر تحديث:</span>
    <span className="text-gray-300 font-mono">{new Date(lastUpdated).toLocaleTimeString('ar')}</span>
    <button 
      onClick={onRefresh}
      className="p-1 hover:bg-white/10 rounded-full transition-all text-gray-400 hover:text-white"
      title="تحديث الأسعار"
    >
      <RefreshCw className="w-3 h-3" />
    </button>
  </div>
)

// ============================================
// مكونات Skeleton Loading المحسنة
// ============================================
const PlanCardSkeleton = () => (
  <div className="relative bg-gradient-to-b from-white/5 to-transparent backdrop-blur-xl rounded-3xl border border-white/10 p-4 sm:p-6 lg:p-8 animate-pulse">
    <div className="absolute -top-4 right-1/2 transform translate-x-1/2 w-24 sm:w-32 h-6 bg-white/10 rounded-full"></div>
    <div className="mb-4 sm:mb-6">
      <div className="w-12 sm:w-16 h-12 sm:h-16 rounded-2xl bg-white/10"></div>
    </div>
    <div className="h-6 sm:h-8 w-24 sm:w-32 bg-white/10 rounded-lg mb-2"></div>
    <div className="h-3 sm:h-4 w-20 sm:w-24 bg-white/10 rounded-lg mb-4"></div>
    <div className="mb-4 sm:mb-6">
      <div className="h-8 sm:h-10 w-32 sm:w-40 bg-white/10 rounded-lg"></div>
    </div>
    <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
      {[1,2,3,4].map((i) => (
        <div key={i} className="space-y-1 sm:space-y-2">
          <div className="flex items-center justify-between">
            <div className="h-3 sm:h-4 w-20 sm:w-24 bg-white/10 rounded-lg"></div>
            <div className="h-3 sm:h-4 w-12 sm:w-16 bg-white/10 rounded-lg"></div>
          </div>
          <div className="h-1 sm:h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full w-3/4 bg-white/10 rounded-full"></div>
          </div>
        </div>
      ))}
    </div>
    <div className="w-full h-10 sm:h-12 bg-white/10 rounded-xl"></div>
  </div>
)

const HeaderSkeleton = () => (
  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-pulse">
    <div className="h-6 sm:h-8 w-40 sm:w-48 bg-white/10 rounded-lg"></div>
    <div className="h-5 sm:h-5 w-28 sm:w-32 bg-white/10 rounded-lg"></div>
  </div>
)

// ============================================
// الدوال المساعدة
// ============================================
const getPlanIcon = (planId) => {
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

// ✅ قائمة المميزات الكاملة مع تحديد مدى توفرها
const getPlanFeatures = (plan) => {
  if (!plan) return []
  
  return [
    {
      icon: Briefcase,
      text: 'المشاريع',
      limit: plan.max_projects === -1 ? 'غير محدود' : plan.max_projects,
      value: plan.max_projects,
      included: true
    },
    {
      icon: Code,
      text: 'المهارات',
      limit: plan.max_skills === -1 ? 'غير محدود' : plan.max_skills,
      value: plan.max_skills,
      included: true
    },
    {
      icon: Award,
      text: 'الشهادات',
      limit: plan.max_certificates === -1 ? 'غير محدود' : plan.max_certificates,
      value: plan.max_certificates,
      included: true
    },
    {
      icon: Briefcase,
      text: 'الخبرات',
      limit: plan.max_experience === -1 ? 'غير محدود' : plan.max_experience,
      value: plan.max_experience,
      included: true
    },
    {
      icon: GraduationCap,
      text: 'التعليم',
      limit: plan.max_education === -1 ? 'غير محدود' : plan.max_education,
      value: plan.max_education,
      included: true
    },
    {
      icon: Zap,
      text: 'تحليلات ذكاء اصطناعي',
      limit: plan.max_ai_analyses === -1 ? 'غير محدود' : `${plan.max_ai_analyses} تحليل`,
      value: plan.max_ai_analyses,
      included: plan.ai_analysis || false
    },
    {
      icon: Globe,
      text: 'نطاق مخصص',
      limit: plan.custom_domain ? 'متاح' : 'غير متاح',
      value: plan.custom_domain,
      included: plan.custom_domain || false
    },
    {
      icon: TrendingUp,
      text: 'إحصائيات متقدمة',
      limit: plan.has_advanced_stats ? 'متاح' : 'غير متاح',
      value: plan.has_advanced_stats,
      included: plan.has_advanced_stats || false
    },
    {
      icon: Shield,
      text: 'إزالة العلامة التجارية',
      limit: plan.has_remove_branding ? 'متاح' : 'غير متاح',
      value: plan.has_remove_branding,
      included: plan.has_remove_branding || false
    }
  ]
}

// ============================================
// المكون الرئيسي المحسن
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

  // جلب بيانات الباقات والمستخدم
  useEffect(() => {
    if (user?.id) {
      fetchAllData()
    }
  }, [user?.id])

  const fetchAllData = async () => {
    setLoading(true)
    try {
      const { data: plans } = await supabase
        .from('plans')
        .select('*')
        .eq('is_active', true)

      setAllPlans(plans || [])

      if (user?.id) {
        const { data: userData } = await supabase
          .from('developers')
          .select('plan_id, plans(*)')
          .eq('id', user.id)
          .single()

        if (userData) {
          setUserPlanId(userData.plan_id)
          setCurrentPlan(userData.plans || null)
        }

        const content = await statsService.getContentStats(user.id)
        setUsage(content?.counts || {})
      }

    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  // جلب أسعار الصرف وكشف الدولة
  useEffect(() => {
    detectCountry()
    loadExchangeRates()

    const interval = setInterval(loadExchangeRates, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

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

  // تحويل العملة
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
    
    if (converted) return converted
    
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

  // دالة isCurrentPlan الصحيحة
  const isCurrentPlan = (planId) => {
    const targetId = Number(planId)
    
    if (userPlanId) {
      return Number(userPlanId) === targetId
    }
    if (currentPlan?.id) {
      return Number(currentPlan.id) === targetId
    }
    if (user?.plan_id) {
      return Number(user.plan_id) === targetId
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
      <div className="space-y-6 sm:space-y-8 p-4 sm:p-6 lg:p-8" dir="rtl">
        <HeaderSkeleton />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
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
    <div className="min-h-screen bg-gradient-to-b from-[#030014] to-[#0a0a1f] p-4 sm:p-6 lg:p-8" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        {/* الهيدر المحسن - متجاوب مع جميع الشاشات */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-l from-[#6366f1] to-[#a855f7] bg-clip-text text-transparent">
            الباقات والاشتراكات
          </h1>
          <div className="bg-white/5 backdrop-blur-xl px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-white/10 text-sm sm:text-base">
            <span className="text-gray-400 ml-1 sm:ml-2">باقتك الحالية:</span>
            <span className="text-white font-semibold">
              {currentPlan?.name_ar || 
                (userPlanId === 1 ? 'مجانية' : 
                 userPlanId === 2 ? 'أساسية' : 
                 userPlanId === 3 ? 'محترف' : 
                 userPlanId === 4 ? 'مؤسسات' : 'مجانية')}
            </span>
          </div>
        </div>

        {/* شعار مدى الحياة المحسن - متجاوب */}
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-l from-purple-600/20 via-pink-600/20 to-purple-600/20 border border-purple-500/30 p-4 sm:p-6">
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat'
          }}></div>
          <div className="relative flex items-center gap-2 sm:gap-3">
            <div className="p-2 sm:p-3 bg-purple-500/20 rounded-xl sm:rounded-2xl">
              <Sparkles className="w-5 sm:w-6 h-5 sm:h-6 text-purple-400" />
            </div>
            <p className="text-sm sm:text-base text-purple-400 font-medium">
              ✨ جميع الباقات مدى الحياة! ادفع مرة واحدة واستمتع بالمميزات للأبد
            </p>
          </div>
        </div>

        {/* شريط العملة المحسن - متجاوب */}
        <div className="bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-white/10 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="p-1.5 sm:p-2 bg-[#6366f1]/20 rounded-lg sm:rounded-xl">
                <Globe className="w-4 sm:w-5 h-4 sm:h-5 text-[#6366f1]" />
              </div>
              <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                <span className="text-xs sm:text-sm text-gray-400">موقعك:</span>
                <span className="text-sm sm:text-base text-white font-medium flex items-center gap-1 sm:gap-2">
                  <span className="text-lg sm:text-xl">{getCountryFlag(userCountry)}</span>
                  <span className="truncate max-w-[120px] sm:max-w-none">{userCountryName}</span>
                </span>
              </div>
            </div>
            
            <div className="relative w-full sm:w-auto">
              <button
                onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
                className="w-full sm:w-auto flex items-center justify-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 bg-white/10 hover:bg-white/15 rounded-lg sm:rounded-xl transition-all border border-white/5 text-sm sm:text-base"
              >
                <span className="text-lg sm:text-xl">{CURRENCIES[selectedCurrency]?.flag}</span>
                <span className="text-white font-medium">
                  {CURRENCIES[selectedCurrency]?.symbol}
                </span>
                <span className="text-gray-300 hidden sm:inline">
                  {CURRENCIES[selectedCurrency]?.name}
                </span>
              </button>
              
              {showCurrencyDropdown && (
                <>
                  <div 
                    className="fixed inset-0 bg-black/50 z-[100]" 
                    onClick={() => setShowCurrencyDropdown(false)} 
                  />
                  <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[90%] sm:w-96 bg-gray-900 border border-white/10 rounded-xl sm:rounded-2xl shadow-2xl z-[101] max-h-[80vh] overflow-y-auto">
                    <div className="sticky top-0 px-3 sm:px-4 py-2 sm:py-3 bg-gray-900/95 backdrop-blur-xl border-b border-white/10">
                      <h3 className="text-sm sm:text-base text-white font-semibold">اختر العملة</h3>
                    </div>
                    
                    {Object.entries(CURRENCIES).map(([code, currency]) => (
                      <button
                        key={code}
                        onClick={() => {
                          setSelectedCurrency(code)
                          setShowCurrencyDropdown(false)
                        }}
                        className={`w-full flex items-center gap-3 sm:gap-4 px-3 sm:px-4 py-2 sm:py-3 hover:bg-white/5 transition-all ${
                          selectedCurrency === code ? 'bg-[#6366f1]/20' : ''
                        }`}
                      >
                        <span className="text-xl sm:text-2xl">{currency.flag}</span>
                        <span className="flex-1 text-right">
                          <span className="block text-sm sm:text-base text-white font-medium">{currency.name}</span>
                          <span className="block text-xs text-gray-500">{currency.symbol}</span>
                        </span>
                        {exchangeRates && (
                          <span className="text-xs sm:text-sm text-gray-400 font-mono bg-white/5 px-1.5 sm:px-2 py-1 rounded">
                            1 USD = {code === 'YER' && yemenRegion === 'aden' 
                              ? exchangeRates.yemen?.aden?.usd?.toFixed(0) 
                              : exchangeRates[code]?.toFixed(2)}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* مؤشر آخر تحديث */}
          {exchangeRates?.lastUpdated && (
            <div className="flex justify-start mt-3 sm:mt-4">
              <ExchangeRateIndicator 
                rates={exchangeRates}
                lastUpdated={exchangeRates.lastUpdated}
                onRefresh={loadExchangeRates}
              />
            </div>
          )}
        </div>

        {/* Toggle الفواتير المحسن - متجاوب */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`relative px-6 sm:px-8 py-2 sm:py-3 rounded-xl sm:rounded-2xl font-semibold transition-all text-sm sm:text-base ${
              billingCycle === 'monthly'
                ? 'bg-gradient-to-l from-[#6366f1] to-[#a855f7] text-white shadow-lg shadow-[#6366f1]/25'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            شهري
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={`relative px-6 sm:px-8 py-2 sm:py-3 rounded-xl sm:rounded-2xl font-semibold transition-all text-sm sm:text-base ${
              billingCycle === 'yearly'
                ? 'bg-gradient-to-l from-[#6366f1] to-[#a855f7] text-white shadow-lg shadow-[#6366f1]/25'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            سنوي
            <span className="absolute -top-2 sm:-top-3 -left-2 sm:-left-3 px-1.5 sm:px-2 py-0.5 sm:py-1 bg-green-500 text-white text-xs rounded-full font-normal animate-pulse">
              وفر 20%
            </span>
          </button>
        </div>

        {/* شبكة الباقات المحسنة - متجاوبة بالكامل */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {allPlans.map((plan) => {
            if (!plan) return null
            
            const PlanIcon = getPlanIcon(plan.id)
            const planColor = getPlanColor(plan.id)
            const price = getPrice(plan)
            const savings = getSavings(plan)
            const current = isCurrentPlan(plan.id)
            const features = getPlanFeatures(plan)
            
            return (
              <div
                key={plan.id}
                className={`relative group bg-gradient-to-b from-white/5 to-transparent backdrop-blur-xl rounded-2xl sm:rounded-3xl border-2 transition-all duration-500 ${
                  current
                    ? 'border-green-500/50 shadow-[0_0_40px_rgba(34,197,94,0.3)] hover:shadow-[0_0_60px_rgba(34,197,94,0.4)]'
                    : plan.is_popular
                    ? 'border-[#a855f7] shadow-[0_0_40px_rgba(168,85,247,0.3)] hover:shadow-[0_0_60px_rgba(168,85,247,0.4)]'
                    : 'border-white/10 hover:border-white/20'
                } hover:-translate-y-2`}
              >
                {/* الشارات المحسنة - متجاوبة */}
                {current && (
                  <div className="absolute -top-3 sm:-top-4 right-1/2 transform translate-x-1/2 bg-green-500 text-white px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-bold shadow-lg shadow-green-500/30 whitespace-nowrap z-10">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3 sm:w-4 h-3 sm:h-4" />
                      باقتك الحالية
                    </span>
                  </div>
                )}

                {plan.is_popular && !current && (
                  <div className="absolute -top-3 sm:-top-4 right-1/2 transform translate-x-1/2 bg-gradient-to-l from-[#6366f1] to-[#a855f7] text-white px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-bold shadow-lg shadow-[#a855f7]/30 whitespace-nowrap z-10">
                    <span className="flex items-center gap-1">
                      <Crown className="w-3 sm:w-4 h-3 sm:h-4" />
                      الأكثر طلباً
                    </span>
                  </div>
                )}

                {/* محتوى الباقة - متجاوب */}
                <div className="p-4 sm:p-6 lg:p-8">
                  {/* الأيقونة المحسنة */}
                  <div className={`mb-4 sm:mb-6 p-3 sm:p-4 bg-gradient-to-br ${planColor} rounded-xl sm:rounded-2xl w-fit shadow-lg`}>
                    <PlanIcon className="w-6 sm:w-8 h-6 sm:h-8 text-white" />
                  </div>

                  {/* اسم الباقة */}
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">{plan.name}</h3>
                  <p className="text-xs sm:text-sm text-gray-400 mb-4 sm:mb-6">{plan.name_ar}</p>

                  {/* السعر المحسن - متجاوب */}
                  <div className="mb-6 sm:mb-8">
                    <div className="flex items-baseline gap-1 sm:gap-2 flex-wrap">
                      <span className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
                        {price.symbol}{price.amount.toLocaleString()}
                      </span>
                      <span className="text-xs sm:text-sm text-gray-400">/لمدى الحياة</span>
                    </div>
                    {savings > 0 && (
                      <div className="mt-2">
                        <span className="inline-flex items-center gap-1 px-2 sm:px-3 py-0.5 sm:py-1 bg-green-500/20 text-green-400 rounded-full text-xs">
                          <TrendingUp className="w-3 sm:w-4 h-3 sm:h-4" />
                          وفر {savings}%
                        </span>
                      </div>
                    )}
                    {selectedCurrency !== 'USD' && (
                      <p className="text-xs text-gray-500 mt-2 font-mono">
                        ≈ ${price.originalUSD} USD
                      </p>
                    )}
                  </div>

                  {/* المميزات مع شريط التقدم - ✅ تظهر الميزات غير المتاحة بشكل مختلف */}
                  <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                    {features.map((feature, index) => {
                      const isCurrentUserPlan = userPlanId === plan.id
                      const currentUsage = usage?.[
                        feature.text === 'المشاريع' ? 'projects' :
                        feature.text === 'المهارات' ? 'skills' :
                        feature.text === 'الشهادات' ? 'certificates' :
                        feature.text === 'الخبرات' ? 'experience' :
                        'education'
                      ] || 0
                      
                      const usagePercent = isCurrentUserPlan && feature.value > 0 && feature.value !== -1
                        ? Math.min(100, Math.round((currentUsage / feature.value) * 100))
                        : 0
                      
                      return (
                        <div key={index}>
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-1.5 sm:gap-2">
                              {feature.included ? (
                                <feature.icon className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-gray-500" />
                              ) : (
                                <XCircle className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-gray-600" />
                              )}
                              <span className={`text-xs sm:text-sm ${
                                feature.included ? 'text-gray-300' : 'text-gray-500 line-through'
                              }`}>
                                {feature.text}
                              </span>
                            </div>
                            <span className={`text-xs sm:text-sm font-medium ${
                              !feature.included ? 'text-gray-600' :
                              feature.value === -1 ? 'text-purple-400' : 
                              'text-white'
                            }`}>
                              {feature.included ? feature.limit : 'غير متاح'}
                            </span>
                          </div>
                          
                          {feature.included && isCurrentUserPlan && feature.value > 0 && feature.value !== -1 && (
                            <div className="h-1 sm:h-1.5 bg-white/10 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-l from-[#6366f1] to-[#a855f7] transition-all duration-500 rounded-full"
                                style={{ width: `${usagePercent}%` }}
                              />
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>

                  {/* زر الإجراء المحسن */}
                  {current ? (
                    <button
                      disabled
                      className="w-full py-3 sm:py-4 bg-white/10 text-gray-400 rounded-xl sm:rounded-2xl font-semibold cursor-not-allowed border border-white/10 text-sm sm:text-base"
                    >
                      باقتك الحالية
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSelectPlan(plan)}
                      className="w-full py-3 sm:py-4 bg-gradient-to-l from-[#6366f1] to-[#a855f7] text-white rounded-xl sm:rounded-2xl font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300 hover:shadow-lg hover:shadow-[#6366f1]/25 flex items-center justify-center gap-2 text-sm sm:text-base"
                    >
                      <span>اشتر الآن</span>
                      <ArrowRight className="w-4 sm:w-5 h-4 sm:h-5" />
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* زر التواصل المحسن - ✅ تم دمج ContactSupport بشكل صحيح */}
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-l from-green-500/10 via-emerald-500/10 to-green-500/10 border border-green-500/20 p-4 sm:p-6 lg:p-8">
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat'
          }}></div>
          <div className="relative flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-8">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-3 sm:p-4 bg-green-500/20 rounded-xl sm:rounded-2xl">
                <MessageCircle className="w-6 sm:w-8 h-6 sm:h-8 text-green-400" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-1">لديك استفسار؟</h3>
                <p className="text-xs sm:text-sm text-gray-400">تواصل معنا مباشرة عبر أي من طرق التواصل</p>
              </div>
            </div>
            <div className="w-full lg:w-auto">
              <ContactSupport />
            </div>
          </div>
        </div>
      </div>

      {/* نافذة الدفع */}
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
