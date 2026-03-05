
import React, { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { usePlan } from '../../hooks/usePlan'
import { developerService, messagesService, statsService } from '../../lib/supabase'
import { supabase } from '../../lib/supabase'
import { Link } from 'react-router-dom'
import {
  Eye,
  Users,
  MessageSquare,
  ThumbsUp,
  Sparkles,
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
  ArrowRight
} from 'lucide-react'

// ===========================================
// مكونات Skeleton
// ===========================================
const StatCardSkeleton = () => (
  <div className="bg-white/5 rounded-2xl p-6 border border-white/10 animate-pulse">
    <div className="w-12 h-12 bg-white/10 rounded-xl mb-4"></div>
    <div className="h-8 w-20 bg-white/10 rounded-lg mb-2"></div>
    <div className="h-4 w-24 bg-white/10 rounded-lg"></div>
  </div>
)

const ContentCardSkeleton = () => (
  <div className="bg-white/5 rounded-xl p-4 border border-white/10 animate-pulse">
    <div className="w-10 h-10 bg-white/10 rounded-lg mb-3"></div>
    <div className="h-4 w-16 bg-white/10 rounded-lg mb-2"></div>
    <div className="h-6 w-20 bg-white/10 rounded-lg"></div>
  </div>
)

const ProjectsSkeleton = () => (
  <div className="bg-white/5 rounded-2xl p-6 border border-white/10 animate-pulse">
    <div className="h-6 w-32 bg-white/10 rounded-lg mb-4"></div>
    <div className="space-y-3">
      {[1,2,3].map(i => (
        <div key={i} className="flex items-center gap-3">
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

const SkillsSkeleton = () => (
  <div className="bg-white/5 rounded-2xl p-6 border border-white/10 animate-pulse">
    <div className="h-6 w-32 bg-white/10 rounded-lg mb-4"></div>
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {[1,2,3,4,5,6].map(i => (
        <div key={i} className="bg-white/5 p-3 rounded-lg">
          <div className="h-4 w-20 bg-white/10 rounded-lg mb-2"></div>
          <div className="h-1 bg-white/10 rounded-full"></div>
        </div>
      ))}
    </div>
  </div>
)

// ===========================================
// المكون الرئيسي
// ===========================================
const Overview = () => {
  const { user } = useAuth()
  const { 
    planId, 
    limits, 
    getRemainingAnalyses,
    canUseFeature, 
    isFree,
    loading: planLoading 
  } = usePlan()
  
  // ===========================================
  // State لكل جزء من البيانات
  // ===========================================
  const [developer, setDeveloper] = useState(null)        // المستوى 1: بيانات المطور
  const [stats, setStats] = useState(null)                // المستوى 1: إحصائيات إضافية
  const [projects, setProjects] = useState(null)          // المستوى 2: المشاريع
  const [skills, setSkills] = useState(null)              // المستوى 3: المهارات
  const [otherTables, setOtherTables] = useState(null)    // المستوى 4: باقي الجداول
  const [visitorStats, setVisitorStats] = useState(null)  // المستوى 5: تحليلات الزوار (للمدفوع)
  const [aiStats, setAiStats] = useState(null)            // المستوى 5: تحليلات الذكاء الاصطناعي (للمدفوع)
  const [unreadCount, setUnreadCount] = useState(0)       // المستوى 5: عدد الرسائل

  // حالة التحميل لكل جزء
  const [loading, setLoading] = useState({
    developer: true,
    stats: true,
    projects: true,
    skills: true,
    other: true,
    advanced: true
  })

  // ===========================================
  // جلب البيانات من getOverviewData
  // ===========================================
  useEffect(() => {
    if (!user?.id) return

    // ✅ استخدام getOverviewData مع callbacks
    developerService.getOverviewData(user.id, {
      // المستوى 1: developer (فوراً)
      onDeveloper: (data) => {
        setDeveloper(data)
        setLoading(prev => ({ ...prev, developer: false }))
      },

      // المستوى 2: projects (بعد 300ms)
      onProjects: (data) => {
        setProjects(data)
        setLoading(prev => ({ ...prev, projects: false }))
      },

      // المستوى 3: skills (بعد 600ms)
      onSkills: (data) => {
        setSkills(data)
        setLoading(prev => ({ ...prev, skills: false }))
      },

      // المستوى 4: باقي الجداول (بعد 900ms)
      onOtherTables: (data) => {
        setOtherTables(data)
        setLoading(prev => ({ ...prev, other: false }))
      }
    })

    // ===========================================
    // المستوى 5: بيانات إضافية (تبدأ بعد 1200ms)
    // ===========================================
    const timer = setTimeout(async () => {
      try {
        // إحصائيات إضافية
        const statsData = await statsService.getDeveloperStats(user.id)
        setStats(statsData)

        // عدد الرسائل
        const messagesCount = await messagesService.getUnreadCount(user.id)
        setUnreadCount(messagesCount)

        // تحليلات الزوار (للمدفوع)
        if (canUseFeature('analytics')) {
          const advanced = await statsService.getAdvancedVisitorStats(user.id)
          setVisitorStats(advanced)
        }

        // تحليلات الذكاء الاصطناعي (للمدفوع)
        if (planId >= 3) {
          const ai = await statsService.getAIAnalysisStats(user.id)
          setAiStats(ai)
        }
      } catch (error) {
        console.error('Error loading advanced stats:', error)
      } finally {
        setLoading(prev => ({ ...prev, stats: false, advanced: false }))
      }
    }, 1200)

    return () => clearTimeout(timer)
  }, [user?.id, canUseFeature, planId])

  // ===========================================
  // دوال مساعدة
  // ===========================================
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'صباح الخير'
    if (hour < 18) return 'مساء الخير'
    return 'مساء الخير'
  }

  const calculateOverallProgress = () => {
    if (!otherTables || !limits) return 0
    
    const totalCurrent = (
      (projects?.length || 0) +
      (skills?.length || 0) +
      (otherTables.certificates || 0) +
      (otherTables.experience || 0) +
      (otherTables.education || 0)
    )
    
    const totalMax = (
      (limits.maxProjects || 3) +
      (limits.maxSkills || 10) +
      (limits.maxCertificates || 3) +
      (limits.maxExperience || 5) +
      (limits.maxEducation || 5)
    )
    
    return Math.min(100, Math.round((totalCurrent / totalMax) * 100)) || 0
  }

  // ===========================================
  // العرض
  // ===========================================
  return (
    <div className="space-y-6" dir="rtl">
      {/* ===== المستوى 1: التحية وشريط التقدم ===== */}
      <div className="bg-gradient-to-r from-[#6366f1]/20 to-[#a855f7]/20 rounded-2xl p-6 border border-white/10">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white mb-2">
              {getGreeting()}، {developer?.full_name?.split(' ')[0] || 'مستخدم'}! 👋
            </h1>
            <p className="text-gray-400 mb-4">
              أنت مشترك في باقة <span className="text-[#a855f7] font-semibold">
                {planId === 1 ? 'مجانية' : planId === 2 ? 'أساسية' : planId === 3 ? 'محترف' : 'مؤسسات'}
              </span>
            </p>
            
            {/* شريط التقدم */}
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
          
          {/* زر الترقية للمجانيين */}
          {isFree && (
            <Link
              to="/plans"
              className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all flex items-center gap-2"
            >
              <Sparkles className="w-5 h-5 text-[#a855f7]" />
              <span className="text-white">ترقية</span>
            </Link>
          )}
        </div>
      </div>

      {/* ===== المستوى 1: بطاقات الإحصائيات الأساسية ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading.developer ? (
          <StatCardSkeleton />
        ) : (
          <StatCard
            icon={Eye}
            label="المشاهدات"
            value={developer?.views_count || 0}
            trend={stats?.weeklyTrend || 0}
            color="from-blue-500 to-cyan-500"
          />
        )}
        
        {loading.developer ? (
          <StatCardSkeleton />
        ) : (
          <StatCard
            icon={ThumbsUp}
            label="الإعجابات"
            value={developer?.likes_count || 0}
            color="from-purple-500 to-pink-500"
          />
        )}
        
        {loading.stats ? (
          <StatCardSkeleton />
        ) : (
          <StatCard
            icon={MessageSquare}
            label="الرسائل"
            value={stats?.messages || 0}
            badge={unreadCount > 0 ? `${unreadCount} جديد` : null}
            color="from-yellow-500 to-orange-500"
          />
        )}
        
        {loading.stats ? (
          <StatCardSkeleton />
        ) : (
          <StatCard
            icon={Users}
            label="الزوار"
            value={stats?.visitors || 0}
            subValue={!canUseFeature('analytics') ? '🔒 متاح في الباقات المدفوعة' : null}
            color="from-green-500 to-emerald-500"
          />
        )}
      </div>

      {/* ===== المستوى 2: بطاقات المحتوى ===== */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {loading.projects ? (
          <ContentCardSkeleton />
        ) : (
          <ContentCard
            icon={FolderKanban}
            label="المشاريع"
            count={projects?.length || 0}
            max={limits?.maxProjects || 3}
            color="from-blue-500 to-cyan-500"
            link="/dashboard/projects"
          />
        )}
        
        {loading.skills ? (
          <ContentCardSkeleton />
        ) : (
          <ContentCard
            icon={Code}
            label="المهارات"
            count={skills?.length || 0}
            max={limits?.maxSkills || 10}
            color="from-purple-500 to-pink-500"
            link="/dashboard/skills"
          />
        )}
        
        {loading.other ? (
          <ContentCardSkeleton />
        ) : (
          <ContentCard
            icon={Award}
            label="الشهادات"
            count={otherTables?.certificates || 0}
            max={limits?.maxCertificates || 3}
            color="from-yellow-500 to-orange-500"
            link="/dashboard/certificates"
          />
        )}
        
        {loading.other ? (
          <ContentCardSkeleton />
        ) : (
          <ContentCard
            icon={Briefcase}
            label="الخبرات"
            count={otherTables?.experience || 0}
            max={limits?.maxExperience || 5}
            color="from-green-500 to-emerald-500"
            link="/dashboard/experience"
          />
        )}
        
        {loading.other ? (
          <ContentCardSkeleton />
        ) : (
          <ContentCard
            icon={GraduationCap}
            label="التعليم"
            count={otherTables?.education || 0}
            max={limits?.maxEducation || 5}
            color="from-red-500 to-rose-500"
            link="/dashboard/education"
          />
        )}
      </div>

      {/* ===== المستوى 3: المشاريع (بتفاصيل) ===== */}
      {loading.projects ? (
        <ProjectsSkeleton />
      ) : (
        projects && projects.length > 0 && (
          <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">أحدث المشاريع</h3>
              <Link 
                to="/dashboard/projects" 
                className="text-sm text-[#a855f7] hover:text-[#6366f1] flex items-center gap-1"
              >
                عرض الكل <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="space-y-3">
              {projects.map((project) => (
                <Link 
                  key={project.id} 
                  to={`/dashboard/projects/edit/${project.id}`}
                  className="flex items-center gap-3 p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-all"
                >
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
                </Link>
              ))}
            </div>
          </div>
        )
      )}

      {/* ===== المستوى 4: المهارات (بتفاصيل) ===== */}
      {!loading.skills && skills && skills.length > 0 && (
        <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">أفضل المهارات</h3>
            <Link 
              to="/dashboard/skills" 
              className="text-sm text-[#a855f7] hover:text-[#6366f1] flex items-center gap-1"
            >
              إدارة المهارات <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {skills.slice(0, 6).map((skill) => (
              <div key={skill.id} className="bg-white/5 p-3 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-white font-medium text-sm">{skill.name}</p>
                  <span className="text-xs text-gray-400">{skill.proficiency}%</span>
                </div>
                <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[#6366f1] to-[#a855f7]"
                    style={{ width: `${skill.proficiency}%` }}
                  />
                </div>
                {skill.category && (
                  <p className="text-xs text-gray-500 mt-1">{skill.category}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== المستوى 5: تحليلات متقدمة (للمدفوع) ===== */}
      {!loading.advanced && canUseFeature('analytics') && visitorStats && (
        <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#a855f7]" />
            تحليلات الزوار
          </h3>
          
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
      )}

      {/* ===== المستوى 5: تحليلات الذكاء الاصطناعي (للمدفوع) ===== */}
      {!loading.advanced && planId >= 3 && aiStats && (
        <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
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

      {/* ===== Banner للمجانيين ===== */}
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
// المكونات المساعدة
// ===========================================

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
    <p className="text-2xl font-bold text-white mb-1">{value.toLocaleString()}</p>
    <p className="text-sm text-gray-400">{label}</p>
    {trend > 0 && (
      <p className="text-xs text-green-400 mt-2">+{trend} هذا الأسبوع</p>
    )}
    {subValue && (
      <p className="text-xs text-gray-500 mt-2">{subValue}</p>
    )}
  </div>
)

const ContentCard = ({ icon: Icon, label, count, max, color, link }) => {
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
