// Overview.jsx
import React, { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { usePlan } from '../../hooks/usePlan'
import { useDashboardData } from '../../context/DashboardDataContext' // ✅ استخدام Context
import { Link } from 'react-router-dom'
import {
  Eye,
  Users,
  MessageSquare,
  ThumbsUp,
  Sparkles,
  ArrowRight,
  FolderKanban,
  Code,
  Award,
  Briefcase,
  GraduationCap,
  Loader,
  TrendingUp,
  Globe,
  Smartphone,
  Monitor,
  Target,
  Zap,
  Crown,
  Lock,
  RefreshCw
} from 'lucide-react'

// ============================================
// مكونات Skeleton Loading
// ============================================

const GreetingCardSkeleton = () => (
  <div className="bg-white/5 rounded-2xl p-6 border border-white/10 animate-pulse">
    <div className="flex items-start justify-between">
      <div className="space-y-3 flex-1">
        <div className="h-8 w-64 bg-white/10 rounded-lg"></div>
        <div className="h-4 w-48 bg-white/10 rounded-lg"></div>
        <div className="max-w-md mt-4">
          <div className="flex items-center justify-between mb-1">
            <div className="h-4 w-24 bg-white/10 rounded-lg"></div>
            <div className="h-4 w-8 bg-white/10 rounded-lg"></div>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full w-3/4 bg-white/10 rounded-full"></div>
          </div>
        </div>
      </div>
      <div className="w-10 h-10 bg-white/10 rounded-xl"></div>
    </div>
  </div>
)

const StatCardSkeleton = () => (
  <div className="bg-white/5 rounded-2xl p-6 border border-white/10 animate-pulse">
    <div className="flex items-start justify-between mb-4">
      <div className="w-12 h-12 bg-white/10 rounded-xl"></div>
      <div className="w-16 h-5 bg-white/10 rounded-full"></div>
    </div>
    <div className="h-8 w-20 bg-white/10 rounded-lg mb-2"></div>
    <div className="h-4 w-24 bg-white/10 rounded-lg"></div>
    <div className="h-3 w-32 bg-white/10 rounded-lg mt-2"></div>
  </div>
)

const ContentMiniCardSkeleton = () => (
  <div className="bg-white/5 rounded-xl p-4 border border-white/10 animate-pulse">
    <div className="w-10 h-10 bg-white/10 rounded-lg mb-3"></div>
    <div className="h-4 w-16 bg-white/10 rounded-lg mb-2"></div>
    <div className="h-6 w-20 bg-white/10 rounded-lg mb-2"></div>
    <div className="h-1 bg-white/10 rounded-full overflow-hidden">
      <div className="h-full w-3/4 bg-white/10 rounded-full"></div>
    </div>
  </div>
)

const AISectionSkeleton = () => (
  <div className="bg-white/5 rounded-2xl p-6 border border-white/10 animate-pulse">
    <div className="flex items-center gap-2 mb-4">
      <div className="w-5 h-5 bg-white/10 rounded-lg"></div>
      <div className="h-6 w-40 bg-white/10 rounded-lg"></div>
    </div>
    <div className="space-y-4">
      <div>
        <div className="h-4 w-24 bg-white/10 rounded-lg mb-2"></div>
        <div className="h-8 w-16 bg-white/10 rounded-lg"></div>
      </div>
      <div>
        <div className="h-4 w-32 bg-white/10 rounded-lg mb-2"></div>
        <div className="space-y-2">
          {[1,2,3].map((i) => (
            <div key={i} className="flex items-start gap-2">
              <div className="w-4 h-4 bg-white/10 rounded-full"></div>
              <div className="h-4 w-full bg-white/10 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
      <div className="h-10 w-full bg-white/10 rounded-lg"></div>
    </div>
  </div>
)

const VisitorStatsSkeleton = () => (
  <>
    <div className="bg-white/5 rounded-2xl p-6 border border-white/10 animate-pulse">
      <div className="flex items-center justify-between mb-6">
        <div className="h-6 w-32 bg-white/10 rounded-lg"></div>
        <div className="flex gap-2">
          <div className="w-16 h-8 bg-white/10 rounded-lg"></div>
          <div className="w-16 h-8 bg-white/10 rounded-lg"></div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[1,2,3,4].map((i) => (
          <div key={i} className="text-center">
            <div className="w-5 h-5 bg-white/10 rounded-full mx-auto mb-2"></div>
            <div className="h-6 w-8 bg-white/10 rounded-lg mx-auto mb-1"></div>
            <div className="h-3 w-12 bg-white/10 rounded-lg mx-auto"></div>
          </div>
        ))}
      </div>

      <div>
        <div className="h-4 w-24 bg-white/10 rounded-lg mb-3"></div>
        <div className="space-y-2">
          {[1,2,3,4,5].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="h-4 w-24 bg-white/10 rounded-lg"></div>
              <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full w-3/4 bg-white/10 rounded-full"></div>
              </div>
              <div className="h-4 w-8 bg-white/10 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    </div>

    <div className="bg-white/5 rounded-2xl p-6 border border-white/10 animate-pulse">
      <div className="h-6 w-32 bg-white/10 rounded-lg mb-4"></div>
      <div className="space-y-3">
        {[1,2,3].map((i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="h-4 w-24 bg-white/10 rounded-lg"></div>
            <div className="flex items-center gap-3">
              <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full w-3/4 bg-white/10 rounded-full"></div>
              </div>
              <div className="h-4 w-6 bg-white/10 rounded-lg"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </>
)

const OverviewSkeleton = () => (
  <div className="space-y-6" dir="rtl">
    <GreetingCardSkeleton />
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCardSkeleton />
      <StatCardSkeleton />
      <StatCardSkeleton />
      <StatCardSkeleton />
    </div>
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      <ContentMiniCardSkeleton />
      <ContentMiniCardSkeleton />
      <ContentMiniCardSkeleton />
      <ContentMiniCardSkeleton />
      <ContentMiniCardSkeleton />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 space-y-6">
        <AISectionSkeleton />
      </div>
      <div className="lg:col-span-2 space-y-6">
        <VisitorStatsSkeleton />
      </div>
    </div>
  </div>
)

// ============================================
// المكونات الرئيسية
// ============================================

// ✅ بطاقة الإحصائيات الرئيسية
const StatCard = ({ icon: Icon, label, value, trend, badge, subValue, color, locked = false }) => (
  <div className={`bg-white/5 backdrop-blur-xl rounded-2xl p-6 border transition-all group ${locked ? 'border-gray-500/20 opacity-75' : 'border-white/10 hover:border-white/20'}`}>
    <div className="flex items-start justify-between mb-4">
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${color} flex items-center justify-center ${locked ? 'opacity-50' : ''}`}>
        {locked ? <Lock className="w-6 h-6 text-white" /> : <Icon className="w-6 h-6 text-white" />}
      </div>
      {badge && (
        <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
          {badge}
        </span>
      )}
    </div>
    <p className="text-2xl font-bold text-white mb-1">{locked ? '—' : value}</p>
    <p className="text-sm text-gray-400">{label}</p>
    {!locked && trend > 0 && (
      <p className="text-xs text-green-400 mt-2">+{trend} هذا الأسبوع</p>
    )}
    {subValue && (
      <p className="text-xs text-gray-500 mt-2">{subValue}</p>
    )}
  </div>
)

// ✅ بطاقة المحتوى المصغرة - تعرض العدد فقط، لا تجلب المشاريع
const ContentMiniCard = ({ icon: Icon, label, count, max, color, link, locked = false }) => {
  const percentage = max === -1 ? 0 : Math.min(100, Math.round((count / max) * 100))
  const isUnlimited = max === -1
  
  return (
    <Link to={locked ? '#' : link} className={`block group ${locked ? 'cursor-not-allowed' : ''}`}>
      <div className={`bg-white/5 backdrop-blur-xl rounded-xl p-4 border transition-all ${locked ? 'border-gray-500/20 opacity-60' : 'border-white/10 hover:border-white/20'}`}>
        <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${color} flex items-center justify-center mb-3 ${locked ? 'opacity-50' : ''}`}>
          {locked ? <Lock className="w-5 h-5 text-white" /> : <Icon className="w-5 h-5 text-white" />}
        </div>
        <p className="text-white font-medium text-sm mb-1">{label}</p>
        <p className="text-lg text-white mb-2">
          {locked ? '—' : `${count} / ${isUnlimited ? '∞' : max}`}
        </p>
        {!locked && max !== -1 && (
          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
            <div 
              className={`h-full bg-gradient-to-r ${color} transition-all duration-300`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        )}
        {locked && (
          <div className="flex items-center gap-1 mt-2">
            <Crown className="w-3 h-3 text-yellow-500" />
            <span className="text-xs text-yellow-500">متوفر في الباقات المدفوعة</span>
          </div>
        )}
      </div>
    </Link>
  )
}

// ✅ بطاقة الميزة في قسم الذكاء الاصطناعي
const FeatureBadge = ({ available, children }) => (
  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
    available ? 'bg-purple-500/20 text-purple-400' : 'bg-gray-500/20 text-gray-400'
  }`}>
    {available ? <Zap className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
    {children}
  </span>
)

// ✅ المكون الرئيسي
const Overview = () => {
  const { user } = useAuth()
  const { 
    planId, 
    limits, 
    canUseFeature, 
    isFree,
    loading: planLoading 
  } = usePlan()
  
  // ✅ استخدام DashboardDataContext
  const { 
    getDashboardStats, 
    getContentStats, 
    getAdvancedStats, 
    getAIAnalysisStats,
    invalidateCache,
    loading: contextLoading 
  } = useDashboardData()
  
  const [stats, setStats] = useState(null)
  const [contentStats, setContentStats] = useState(null)
  const [visitorStats, setVisitorStats] = useState(null)
  const [aiStats, setAiStats] = useState(null)
  const [remainingAnalyses, setRemainingAnalyses] = useState(0)
  const [pageLoading, setPageLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState('week')

  useEffect(() => {
    if (user) {
      loadDashboardData()
    }
  }, [user])

  const loadDashboardData = async () => {
    setPageLoading(true)
    try {
      // ✅ جلب البيانات الأساسية فقط - لا مشاريع مفصلة
      const [basic, content] = await Promise.all([
        getDashboardStats(),
        getContentStats()  // ✅ هذا يجلب counts فقط، no latestProjects
      ])

      setStats(basic)
      setContentStats(content)

      // ✅ جلب البيانات المتقدمة حسب الباقة
      if (canUseFeature('analytics')) {
        const advanced = await getAdvancedStats()
        setVisitorStats(advanced)
      }

      if (planId >= 3) {
        const ai = await getAIAnalysisStats()
        setAiStats(ai)
      }

    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setPageLoading(false)
    }
  }

  // ✅ دالة التحديث اليدوي
  const handleRefresh = async () => {
    setRefreshing(true)
    // مسح الكاش وجلب جديد
    invalidateCache('dashboard')
    invalidateCache('content')
    await loadDashboardData()
    setRefreshing(false)
  }

  const calculateOverallProgress = () => {
    if (!contentStats || !limits) return 0
    
    const totalCurrent = Object.values(contentStats.counts).reduce((a, b) => a + b, 0)
    const totalMax = [
      limits.maxProjects || 3,
      limits.maxSkills || 10,
      limits.maxCertificates || 3,
      limits.maxExperience || 5,
      limits.maxEducation || 5
    ].reduce((a, b) => a + b, 0)
    
    return Math.min(100, Math.round((totalCurrent / totalMax) * 100))
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'صباح الخير'
    if (hour < 18) return 'مساء الخير'
    return 'مساء الخير'
  }

  const getPlanName = () => {
    const plans = {
      1: { name: 'مجانية', color: 'text-gray-400' },
      2: { name: 'أساسية', color: 'text-blue-400' },
      3: { name: 'محترف', color: 'text-purple-400' },
      4: { name: 'مؤسسات', color: 'text-yellow-400' }
    }
    return plans[planId] || plans[1]
  }

  // ✅ حالة التحميل
  if (pageLoading || planLoading) {
    return <OverviewSkeleton />
  }

  const plan = getPlanName()

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header with Refresh Button */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">لوحة التحكم</h1>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-lg hover:bg-white/10 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span className="text-sm text-gray-400">تحديث</span>
        </button>
      </div>

      {/* التحية ومعلومات المستخدم */}
      <div className="bg-gradient-to-r from-[#6366f1]/20 to-[#a855f7]/20 rounded-2xl p-6 border border-white/10">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">
              {getGreeting()}، {user?.full_name?.split(' ')[0] || 'مستخدم'}! 👋
            </h1>
            <p className="text-gray-400 mb-4">
              أنت مشترك في باقة <span className={`font-semibold ${plan.color}`}>
                {plan.name}
              </span>
            </p>
            
            {/* شريط التقدم الكلي */}
            <div className="max-w-md">
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-400">اكتمال الملف الشخصي</span>
                <span className="text-white font-semibold">{calculateOverallProgress()}%</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#6366f1] to-[#a855f7] transition-all duration-500"
                  style={{ width: `${calculateOverallProgress()}%` }}
                />
              </div>
            </div>
          </div>
          
          {/* زر عرض الباقات للمجانيين */}
          {isFree && (
            <Link
              to="/plans"
              className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all"
            >
              <Sparkles className="w-5 h-5 text-[#a855f7]" />
            </Link>
          )}
        </div>
      </div>

      {/* البطاقات الرئيسية */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Eye}
          label="المشاهدات"
          value={stats?.views?.toLocaleString() || '0'}
          trend={stats?.weeklyTrend || 0}
          color="from-blue-500 to-cyan-500"
        />
        <StatCard
          icon={ThumbsUp}
          label="الإعجابات"
          value={stats?.likes?.toLocaleString() || '0'}
          color="from-purple-500 to-pink-500"
        />
        <StatCard
          icon={MessageSquare}
          label="الرسائل"
          value={stats?.messages?.toLocaleString() || '0'}
          badge={stats?.unreadMessages > 0 ? `${stats.unreadMessages} جديد` : null}
          color="from-yellow-500 to-orange-500"
        />
        <StatCard
          icon={Users}
          label="الزوار"
          value={stats?.visitors?.toLocaleString() || '0'}
          subValue={!canUseFeature('analytics') ? '🔒 متاح في الباقات المدفوعة' : null}
          color="from-green-500 to-emerald-500"
          locked={!canUseFeature('analytics')}
        />
      </div>

      {/* ✅ إحصائيات المحتوى - الأعداد فقط، لا مشاريع مفصلة */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <ContentMiniCard
          icon={FolderKanban}
          label="المشاريع"
          count={contentStats?.counts?.projects || 0}
          max={limits?.maxProjects || 3}
          color="from-blue-500 to-cyan-500"
          link="/dashboard/projects"
        />
        <ContentMiniCard
          icon={Code}
          label="المهارات"
          count={contentStats?.counts?.skills || 0}
          max={limits?.maxSkills || 10}
          color="from-purple-500 to-pink-500"
          link="/dashboard/skills"
        />
        <ContentMiniCard
          icon={Award}
          label="الشهادات"
          count={contentStats?.counts?.certificates || 0}
          max={limits?.maxCertificates || 3}
          color="from-yellow-500 to-orange-500"
          link="/dashboard/certificates"
        />
        <ContentMiniCard
          icon={Briefcase}
          label="الخبرات"
          count={contentStats?.counts?.experience || 0}
          max={limits?.maxExperience || 5}
          color="from-green-500 to-emerald-500"
          link="/dashboard/experience"
        />
        <ContentMiniCard
          icon={GraduationCap}
          label="التعليم"
          count={contentStats?.counts?.education || 0}
          max={limits?.maxEducation || 5}
          color="from-red-500 to-rose-500"
          link="/dashboard/education"
        />
      </div>

      {/* قسمين رئيسيين */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* تحليلات الذكاء الاصطناعي - متاح للباقات المدفوعة فقط */}
        <div className="lg:col-span-1 space-y-6">
          {planId >= 3 && aiStats ? (
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-[#a855f7]" />
                تحليلات الذكاء الاصطناعي
              </h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-400">عدد التحليلات</p>
                  <p className="text-2xl text-white">{aiStats.totalAnalyses || 0}</p>
                </div>
                
                {aiStats.suggestions?.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-400 mb-2">اقتراحات للتحسين</p>
                    <ul className="space-y-2">
                      {aiStats.suggestions.slice(0, 3).map((s, i) => (
                        <li key={i} className="text-xs text-gray-300 flex items-start gap-2">
                          <span className="text-green-400">•</span>
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <Link
                  to="/app/builder"
                  className="block text-center py-2 bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white rounded-lg text-sm hover:scale-105 transition-all"
                >
                  تحليل سيرة ذاتية جديدة
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-gray-400" />
                <h3 className="text-lg font-semibold text-white">الذكاء الاصطناعي</h3>
              </div>
              <div className="text-center py-6">
                <Crown className="w-12 h-12 text-yellow-500/50 mx-auto mb-3" />
                <p className="text-gray-400 text-sm mb-4">
                  ميزة حصرية لباقة المحترف فما فوق
                </p>
                <Link
                  to="/plans"
                  className="inline-block px-4 py-2 bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white rounded-lg text-sm"
                >
                  عرض الباقات
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* إحصائيات الزوار - متاحة للمستخدمين مع analytics */}
        <div className="lg:col-span-2 space-y-6">
          {canUseFeature('analytics') && visitorStats ? (
            <>
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white">تحليلات الزوار</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedPeriod('week')}
                      className={`px-3 py-1 text-sm rounded-lg transition-all ${
                        selectedPeriod === 'week' 
                          ? 'bg-[#6366f1] text-white' 
                          : 'bg-white/5 text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      أسبوع
                    </button>
                    <button
                      onClick={() => setSelectedPeriod('month')}
                      className={`px-3 py-1 text-sm rounded-lg transition-all ${
                        selectedPeriod === 'month' 
                          ? 'bg-[#6366f1] text-white' 
                          : 'bg-white/5 text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      شهر
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center">
                    <Globe className="w-5 h-5 text-[#6366f1] mx-auto mb-2" />
                    <p className="text-xl text-white">{visitorStats.countries?.length || 0}</p>
                    <p className="text-xs text-gray-400">دولة</p>
                  </div>
                  <div className="text-center">
                    <Smartphone className="w-5 h-5 text-[#6366f1] mx-auto mb-2" />
                    <p className="text-xl text-white">{visitorStats.devices?.mobile || 0}</p>
                    <p className="text-xs text-gray-400">جوال</p>
                  </div>
                  <div className="text-center">
                    <Monitor className="w-5 h-5 text-[#6366f1] mx-auto mb-2" />
                    <p className="text-xl text-white">{visitorStats.devices?.desktop || 0}</p>
                    <p className="text-xs text-gray-400">كمبيوتر</p>
                  </div>
                  <div className="text-center">
                    <Target className="w-5 h-5 text-[#6366f1] mx-auto mb-2" />
                    <p className="text-xl text-white">{visitorStats.referrers?.length || 0}</p>
                    <p className="text-xs text-gray-400">مصدر</p>
                  </div>
                </div>

                {visitorStats.countries?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-3">أفضل الدول</h4>
                    <div className="space-y-2">
                      {visitorStats.countries.slice(0, 5).map(([country, count], i) => (
                        <div key={i} className="flex items-center gap-2">
                          <span className="text-sm text-white w-24 truncate">{country}</span>
                          <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-[#6366f1] to-[#a855f7]"
                              style={{ width: `${(count / visitorStats.total) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-400">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4">مصادر الزيارات</h3>
                <div className="space-y-3">
                  {visitorStats.referrers?.map(([source, count], i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">{source}</span>
                      <div className="flex items-center gap-3">
                        <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-[#6366f1] to-[#a855f7]"
                            style={{ width: `${(count / visitorStats.total) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-400">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="bg-gradient-to-r from-[#6366f1]/10 to-[#a855f7]/10 rounded-2xl p-8 border border-[#6366f1]/20 text-center">
              <TrendingUp className="w-12 h-12 text-[#6366f1] mx-auto mb-4" />
              <h3 className="text-xl text-white mb-2">إحصائيات متقدمة</h3>
              <p className="text-gray-400 mb-4">
                قم بترقية باقتك للوصول إلى تحليلات مفصلة للزوار ومعرفة من أين يأتون
              </p>
              <Link
                to="/plans"
                className="inline-block px-6 py-3 bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white rounded-lg hover:scale-105 transition-all"
              >
                عرض الباقات
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Banner للمجانيين */}
      {isFree && (
        <div className="bg-gradient-to-r from-[#6366f1]/10 to-[#a855f7]/10 rounded-2xl p-4 border border-[#6366f1]/20">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-[#a855f7]" />
              <p className="text-white">
                🚀 طور بورتفليوك مع الباقات المدفوعة - احصل على تحليلات متقدمة ومساحة تخزين أكبر
              </p>
            </div>
            <Link
              to="/plans"
              className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all text-sm whitespace-nowrap"
            >
              عرض الباقات
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

export default Overview
