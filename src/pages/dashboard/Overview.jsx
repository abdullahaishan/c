// Overview.jsx
import React, { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { usePlan } from '../../hooks/usePlan'
import { statsService } from '../../lib/supabase'
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
  Calendar,
  Clock,
  Target,
  Zap
} from 'lucide-react'

// ============================================
// مكونات Skeleton Loading
// ============================================

// Skeleton للبطاقة الرئيسية (التحية)
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

// Skeleton لبطاقة الإحصائيات الرئيسية
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

// Skeleton لبطاقة المحتوى المصغرة
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

// Skeleton لقسم تحليلات الذكاء الاصطناعي
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

// Skeleton لأحدث المشاريع
const LatestProjectsSkeleton = () => (
  <div className="bg-white/5 rounded-2xl p-6 border border-white/10 animate-pulse">
    <div className="h-6 w-32 bg-white/10 rounded-lg mb-4"></div>
    <div className="space-y-3">
      {[1,2,3].map((i) => (
        <div key={i} className="flex items-center gap-3 p-2 bg-white/5 rounded-lg">
          <div className="w-10 h-10 bg-white/10 rounded-lg"></div>
          <div className="flex-1">
            <div className="h-4 w-32 bg-white/10 rounded-lg mb-2"></div>
            <div className="h-3 w-20 bg-white/10 rounded-lg"></div>
          </div>
        </div>
      ))}
    </div>
  </div>
)

// Skeleton لتحليلات الزوار
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

// Skeleton لصفحة Overview كاملة
const OverviewSkeleton = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('week')
  
  return (
    <div className="space-y-6" dir="rtl">
      <GreetingCardSkeleton />
      
      {/* بطاقات الإحصائيات الرئيسية */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>

      {/* بطاقات المحتوى المصغرة */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <ContentMiniCardSkeleton />
        <ContentMiniCardSkeleton />
        <ContentMiniCardSkeleton />
        <ContentMiniCardSkeleton />
        <ContentMiniCardSkeleton />
      </div>

      {/* قسمين رئيسيين */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* القسم الأيسر */}
        <div className="lg:col-span-1 space-y-6">
          <AISectionSkeleton />
          <LatestProjectsSkeleton />
        </div>

        {/* القسم الأيمن */}
        <div className="lg:col-span-2 space-y-6">
          <VisitorStatsSkeleton />
        </div>
      </div>

      {/* Banner للمجانيين */}
      <div className="bg-white/5 rounded-2xl p-4 border border-white/10 animate-pulse">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-white/10 rounded-lg"></div>
            <div className="h-5 w-96 bg-white/10 rounded-lg"></div>
          </div>
          <div className="w-24 h-9 bg-white/10 rounded-lg"></div>
        </div>
      </div>
    </div>
  )
}

// ============================================
// المكونات الأصلية
// ============================================

const Overview = () => {
  const { user } = useAuth()
  const { 
    planId, 
    limits, 
    usage,
    getUsagePercentage,
    canUseFeature, 
    isFree,
    getRemainingAnalyses,
    loading: planLoading 
  } = usePlan()
  
  const [stats, setStats] = useState(null)
  const [contentStats, setContentStats] = useState(null)
  const [visitorStats, setVisitorStats] = useState(null)
  const [aiStats, setAiStats] = useState(null)
  const [remainingAnalyses, setRemainingAnalyses] = useState(0)
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('week')
  const [dataLoaded, setDataLoaded] = useState(false)

  useEffect(() => {
    if (user) {
      fetchAllStats()
    }
  }, [user])

  const fetchAllStats = async () => {
    setLoading(true)
    try {
      const basicStats = await statsService.getDeveloperStats(user.id)
      setStats(basicStats)

      const content = await statsService.getContentStats(user.id)
      setContentStats(content)

      const remaining = await getRemainingAnalyses()
      setRemainingAnalyses(remaining)

      if (canUseFeature('analytics')) {
        const advanced = await statsService.getAdvancedVisitorStats(user.id)
        setVisitorStats(advanced)
      }

      if (planId >= 3) {
        const ai = await statsService.getAIAnalysisStats(user.id)
        setAiStats(ai)
      }

      // تأخير بسيط لإظهار الـ Skeleton
      setTimeout(() => {
        setDataLoaded(true)
        setLoading(false)
      }, 500)

    } catch (error) {
      console.error('Error fetching stats:', error)
      setLoading(false)
      setDataLoaded(true)
    }
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

  // عرض Skeleton أثناء التحميل
  if (loading || !dataLoaded || planLoading) {
    return <OverviewSkeleton />
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* التحية ومعلومات المستخدم */}
      <div className="bg-gradient-to-r from-[#6366f1]/20 to-[#a855f7]/20 rounded-2xl p-6 border border-white/10">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">
              {getGreeting()}، {user?.full_name?.split(' ')[0] || 'مستخدم'}! 👋
            </h1>
            <p className="text-gray-400 mb-4">
              أنت مشترك في باقة <span className="text-[#a855f7] font-semibold">
                {planId === 1 ? 'مجانية' : planId === 2 ? 'أساسية' : planId === 3 ? 'محترف' : 'مؤسسات'}
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
        />
      </div>

      {/* إحصائيات المحتوى */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <ContentMiniCard
          icon={FolderKanban}
          label="المشاريع"
          count={contentStats?.counts?.projects || 0}
          max={limits?.maxProjects || 1}
          color="from-blue-500 to-cyan-500"
          link="/dashboard/projects"
        />
        <ContentMiniCard
          icon={Code}
          label="المهارات"
          count={contentStats?.counts?.skills || 0}
          max={limits?.maxSkills || 2}
          color="from-purple-500 to-pink-500"
          link="/dashboard/skills"
        />
        <ContentMiniCard
          icon={Award}
          label="الشهادات"
          count={contentStats?.counts?.certificates || 0}
          max={limits?.maxCertificates || 1}
          color="from-yellow-500 to-orange-500"
          link="/dashboard/certificates"
        />
        <ContentMiniCard
          icon={Briefcase}
          label="الخبرات"
          count={contentStats?.counts?.experience || 0}
          max={limits?.maxExperience || 1}
          color="from-green-500 to-emerald-500"
          link="/dashboard/experience"
        />
        <ContentMiniCard
          icon={GraduationCap}
          label="التعليم"
          count={contentStats?.counts?.education || 0}
          max={limits?.maxEducation || 1}
          color="from-red-500 to-rose-500"
          link="/dashboard/education"
        />
      </div>

      {/* قسمين رئيسيين */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* تحليلات الذكاء الاصطناعي */}
        <div className="lg:col-span-1 space-y-6">
          {planId >= 3 && aiStats && (
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-[#a855f7]" />
                تحليلات الذكاء الاصطناعي
              </h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-400">عدد التحليلات</p>
                  <p className="text-2xl text-white">{aiStats.totalAnalyses}</p>
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
          )}

          {/* أحدث المشاريع */}
          {contentStats?.latestProjects?.length > 0 && (
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">أحدث المشاريع</h3>
              <div className="space-y-3">
                {contentStats.latestProjects.map((project, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 bg-white/5 rounded-lg">
                    {project.image ? (
                      <img src={project.image} alt="" className="w-10 h-10 rounded-lg object-cover" />
                    ) : (
                      <div className="w-10 h-10 bg-[#6366f1]/20 rounded-lg flex items-center justify-center">
                        <FolderKanban className="w-5 h-5 text-[#6366f1]" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{project.title}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(project.created_at).toLocaleDateString('ar-SA')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* إحصائيات الزوار */}
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
// في Overview.jsx - أضف هذه التعديلات

// في قسم إحصائيات الزوار (حوالي السطر 350)
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

      {/* إحصائيات سريعة */}
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
          <p className="text-xl text-white">{visitorStats.total || 0}</p>
          <p className="text-xs text-gray-400">إجمالي</p>
        </div>
      </div>

      {/* أفضل الدول - تظهر فقط إذا كانت موجودة */}
      {visitorStats.countries && visitorStats.countries.length > 0 && (
        <div className="mb-6">
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

      {/* الأجهزة - تظهر دائماً */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-400 mb-3">الأجهزة</h4>
        <div className="space-y-2">
          {Object.entries(visitorStats.devices || {}).map(([device, count]) => (
            count > 0 && (
              <div key={device} className="flex items-center gap-2">
                <span className="text-sm text-white w-24">
                  {device === 'mobile' ? 'جوال' : device === 'desktop' ? 'كمبيوتر' : 'تابلت'}
                </span>
                <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[#6366f1] to-[#a855f7]"
                    style={{ width: `${(count / visitorStats.total) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-gray-400">{count}</span>
              </div>
            )
          ))}
        </div>
      </div>
    </div>

    {/* مصادر الزيارات */}
    {visitorStats.referrers && visitorStats.referrers.length > 0 && (
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">مصادر الزيارات</h3>
        <div className="space-y-3">
          {visitorStats.referrers.map(([source, count], i) => (
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
    )}
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

// ===========================================
// المكونات المساعدة (في نهاية الملف)
// ===========================================

// مكون بطاقة الاستخدام
const UsageCard = ({ label, current, max, color }) => {
  const percentage = max === -1 ? 0 : Math.min(100, (current / max) * 100)
  
  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-xl p-4 border border-white/10">
      <p className="text-sm text-gray-400 mb-2">{label}</p>
      <p className="text-xl font-bold text-white mb-2">
        {current} / {max === -1 ? '∞' : max}
      </p>
      {max !== -1 && (
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div 
            className={`h-full bg-gradient-to-r ${color} transition-all duration-300`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}
    </div>
  )
}

// مكون بطاقة الإحصائيات الرئيسية
const StatCard = ({ icon: Icon, label, value, trend, badge, subValue, color }) => (
  <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all group">
    <div className="flex items-start justify-between mb-4">
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${color} flex items-center justify-center`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      {badge && (
        <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
          {badge}
        </span>
      )}
    </div>
    <p className="text-2xl font-bold text-white mb-1">{value}</p>
    <p className="text-sm text-gray-400">{label}</p>
    {trend > 0 && (
      <p className="text-xs text-green-400 mt-2">+{trend} هذا الأسبوع</p>
    )}
    {subValue && (
      <p className="text-xs text-gray-500 mt-2">{subValue}</p>
    )}
  </div>
)

// مكون البطاقات المصغرة للمحتوى
const ContentMiniCard = ({ icon: Icon, label, count, max, color, link }) => {
  const percentage = max === -1 ? 0 : Math.min(100, Math.round((count / max) * 100))
  
  return (
    <Link to={link} className="block group">
      <div className="bg-white/5 backdrop-blur-xl rounded-xl p-4 border border-white/10 hover:border-white/20 transition-all">
        <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${color} flex items-center justify-center mb-3`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <p className="text-white font-medium text-sm mb-1">{label}</p>
        <p className="text-lg text-white mb-2">{count} / {max === -1 ? '∞' : max}</p>
        {max !== -1 && (
          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
            <div 
              className={`h-full bg-gradient-to-r ${color} transition-all duration-300`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        )}
      </div>
    </Link>
  )
}

export default Overview
