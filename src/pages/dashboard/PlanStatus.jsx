import React, { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { usePlan } from '../../hooks/usePlan'
import { Link } from 'react-router-dom'
import { 
  Crown, 
  Sparkles, 
  Zap, 
  Infinity, 
  CheckCircle, 
  XCircle,
  ArrowRight,
  FolderKanban,
  Code,
  Award,
  Briefcase,
  GraduationCap,
  AlertCircle
} from 'lucide-react'

const PlanStatus = () => {
  const { user } = useAuth()
  const { limits, getRemainingAnalyses } = usePlan()
  const [remainingAnalyses, setRemainingAnalyses] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadRemainingAnalyses()
    }
  }, [user])

  const loadRemainingAnalyses = async () => {
    setLoading(true)
    const remaining = await getRemainingAnalyses()
    setRemainingAnalyses(remaining)
    setLoading(false)
  }

  const getPlanName = () => {
    const plans = {
      1: { name: 'مجاني', icon: <Zap className="w-5 h-5" />, color: 'text-gray-400', bg: 'from-gray-500/20 to-gray-600/20' },
      2: { name: 'أساسي', icon: <Sparkles className="w-5 h-5" />, color: 'text-blue-400', bg: 'from-blue-500/20 to-cyan-500/20' },
      3: { name: 'محترف', icon: <Crown className="w-5 h-5" />, color: 'text-yellow-400', bg: 'from-yellow-500/20 to-orange-500/20' },
      4: { name: 'مؤسسات', icon: <Infinity className="w-5 h-5" />, color: 'text-purple-400', bg: 'from-purple-500/20 to-pink-500/20' }
    }
    return plans[user?.plan_id || 1]
  }

  const plan = getPlanName()

  const features = [
    { name: 'المشاريع', max: limits.maxProjects, icon: FolderKanban, color: 'from-blue-500 to-cyan-500' },
    { name: 'المهارات', max: limits.maxSkills, icon: Code, color: 'from-purple-500 to-pink-500' },
    { name: 'الشهادات', max: limits.maxCertificates, icon: Award, color: 'from-yellow-500 to-orange-500' },
    { name: 'الخبرات', max: limits.maxExperience, icon: Briefcase, color: 'from-green-500 to-emerald-500' },
    { name: 'التعليم', max: limits.maxEducation, icon: GraduationCap, color: 'from-red-500 to-rose-500' },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030014] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#6366f1]/20 border-t-[#6366f1] rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* رأس الصفحة */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">حالة الباقة</h1>
          <p className="text-gray-400 mt-1">تفاصيل باقتك الحالية والحدود المتاحة</p>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${plan.bg} border border-white/10`}>
          {plan.icon}
          <span className={`font-semibold ${plan.color}`}>{plan.name}</span>
        </div>
      </div>

      {/* بطاقة الباقة الحالية */}
      <div className={`bg-gradient-to-r ${plan.bg} rounded-2xl p-8 border border-white/10`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">باقتك الحالية: {plan.name}</h2>
            <p className="text-gray-300 leading-relaxed">
              {user?.plan_id === 1 && '✨ استمتع بالميزات الأساسية مجاناً. قم بترقية باقتك للحصول على ميزات إضافية وتحليلات غير محدودة.'}
              {user?.plan_id === 2 && '🚀 باقة أساسية مع ميزات إضافية. يمكنك ترقية باقتك للمزيد من التحليلات والميزات المتقدمة.'}
              {user?.plan_id === 3 && '👑 باقة احترافية مع كل الميزات المتقدمة. استمتع بتحليلات متعددة ونطاق مخصص.'}
              {user?.plan_id === 4 && '🏢 باقة المؤسسات - كل شيء غير محدود. نطاق مخصص، إزالة العلامة التجارية، ودعم فوري.'}
            </p>
          </div>
          
          {user?.plan_id !== 4 && (
            <Link
              to="/plans"
              className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white rounded-xl font-semibold hover:scale-105 transition-all whitespace-nowrap"
            >
              <Crown className="w-5 h-5" />
              <span>ترقية الباقة</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          )}
        </div>
      </div>

      {/* تحليلات الذكاء الاصطناعي */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-400" />
          تحليلات الذكاء الاصطناعي
        </h2>
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 bg-purple-500/10 rounded-xl border border-purple-500/20">
          <div>
            <p className="text-white font-medium">التحليلات المتبقية</p>
            <p className="text-sm text-gray-400">
              {limits.aiAnalysisCount === -1 
                ? 'يمكنك استخدام الذكاء الاصطناعي بعدد غير محدود من المرات'
                : `يمكنك تحليل ${remainingAnalyses} سيرة ذاتية ${remainingAnalyses === 1 ? 'أخرى' : 'أخرى'}`
              }
            </p>
          </div>
          <div className="text-4xl font-bold text-purple-400">
            {limits.aiAnalysisCount === -1 ? '∞' : remainingAnalyses}
          </div>
        </div>

        {remainingAnalyses === 0 && user?.plan_id === 1 && (
          <div className="mt-4 p-4 bg-yellow-500/10 rounded-xl border border-yellow-500/20 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-yellow-400 font-medium">لقد استنفذت تحليلك المجاني</p>
              <p className="text-sm text-gray-400 mt-1">
                قم بترقية باقتك للحصول على المزيد من التحليلات والميزات المتقدمة.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* حدود الباقة */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
        <h2 className="text-lg font-semibold text-white mb-4">حدود الباقة</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.map((feature) => (
            <div key={feature.name} className="p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${feature.color} flex items-center justify-center`}>
                  <feature.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-white font-medium">{feature.name}</h3>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">الحد الأقصى</span>
                  <span className="text-white font-medium">
                    {feature.max === -1 ? 'غير محدود' : feature.max}
                  </span>
                </div>
                
                {feature.max !== -1 && (
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${feature.color} transition-all`}
                      style={{ width: '0%' }}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ميزات الباقة */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
        <h2 className="text-lg font-semibold text-white mb-4">ميزات باقتك</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FeatureItem
            label="نطاق مخصص (Custom Domain)"
            available={limits.canCustomDomain}
            description="اربط نطاقك الخاص بموقعك"
          />
          <FeatureItem
            label="إزالة العلامة التجارية"
            available={limits.canRemoveBranding}
            description="إزالة شعار PortfolioAI من موقعك"
          />
          <FeatureItem
            label="تحليلات وإحصائيات"
            available={limits.canAnalytics}
            description="مشاهدة إحصائيات الزوار والمشاهدات"
          />
          <FeatureItem
            label="دعم فوري وأولوية"
            available={user?.plan_id >= 3}
            description="دعم فني متميز وأولوية في المعالجة"
          />
        </div>
      </div>

      {/* ملاحظة عن الباقة المجانية */}
      {user?.plan_id === 1 && (
        <div className="bg-blue-500/10 rounded-xl p-4 border border-blue-500/20">
          <p className="text-blue-400 text-sm">
            💡 الباقة المجانية تتيح لك تجربة المنصة. قم بترقية باقتك للاستفادة من جميع الميزات وزيادة حدودك.
          </p>
        </div>
      )}
    </div>
  )
}

// مكون عرض الميزة
const FeatureItem = ({ label, available, description }) => (
  <div className="flex items-start gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
    <div className="flex-shrink-0 mt-0.5">
      {available ? (
        <CheckCircle className="w-5 h-5 text-green-400" />
      ) : (
        <XCircle className="w-5 h-5 text-gray-600" />
      )}
    </div>
    <div>
      <p className={`font-medium ${available ? 'text-white' : 'text-gray-500'}`}>{label}</p>
      <p className="text-xs text-gray-500 mt-1">{description}</p>
    </div>
  </div>
)

export default PlanStatus
