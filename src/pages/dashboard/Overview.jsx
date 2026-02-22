import React, { useState, useEffect } from 'react'
import { useDeveloper } from '../../context/DeveloperContext'
import { usePlan } from '../../hooks/usePlan'
import { Link } from 'react-router-dom'
import {
  Eye,
  Users,
  MessageSquare,
  ThumbsUp,
  TrendingUp,
  Calendar,
  Clock,
  ArrowRight,
  Sparkles,
  FolderKanban,
  Code,
  Award,
  Briefcase,
  GraduationCap,
  AlertCircle
} from 'lucide-react'

const Overview = () => {
  const { 
    developer, 
    getProjects, 
    getSkills, 
    getCertificates, 
    getExperience, 
    getEducation 
  } = useDeveloper()
  
  const { plan, limits, checkLimit, canUseFeature } = usePlan()
  const [stats, setStats] = useState({
    views: 0,
    likes: 0,
    messages: 0
  })

  // إحصائيات سريعة
  const projects = getProjects()
  const skills = getSkills()
  const certificates = getCertificates()
  const experience = getExperience()
  const education = getEducation()

  // حساب نسب الاستخدام
  const getUsagePercentage = (current, max) => {
    if (max === -1) return 0 // غير محدود
    return Math.min((current / max) * 100, 100)
  }

  const usageItems = [
    {
      name: 'Projects',
      current: projects.length,
      max: limits.maxProjects,
      icon: FolderKanban,
      color: 'from-blue-500 to-cyan-500',
      link: '/dashboard/projects'
    },
    {
      name: 'Skills',
      current: skills.length,
      max: limits.maxSkills,
      icon: Code,
      color: 'from-purple-500 to-pink-500',
      link: '/dashboard/skills'
    },
    {
      name: 'Certificates',
      current: certificates.length,
      max: limits.maxCertificates,
      icon: Award,
      color: 'from-yellow-500 to-orange-500',
      link: '/dashboard/certificates'
    },
    {
      name: 'Experience',
      current: experience.length,
      max: limits.maxExperience,
      icon: Briefcase,
      color: 'from-green-500 to-emerald-500',
      link: '/dashboard/experience'
    },
    {
      name: 'Education',
      current: education.length,
      max: limits.maxEducation,
      icon: GraduationCap,
      color: 'from-red-500 to-rose-500',
      link: '/dashboard/education'
    }
  ]

  // عناصر سريعة للإكمال
  const quickActions = usageItems.filter(item => {
    if (item.max === -1) return false // غير محدود
    return item.current < item.max * 0.8 // أقل من 80%
  }).slice(0, 3)

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-[#6366f1]/20 to-[#a855f7]/20 rounded-2xl p-6 border border-white/10">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Welcome back, {developer?.full_name?.split(' ')[0]}! 👋
            </h1>
            <p className="text-gray-400">
              Here's what's happening with your portfolio today.
            </p>
          </div>
          <div className="bg-white/5 p-3 rounded-xl">
            <Sparkles className="w-6 h-6 text-[#a855f7]" />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          icon={Eye}
          label="Profile Views"
          value={developer?.views_count || 0}
          change="+12%"
          color="from-blue-500 to-cyan-500"
        />
        <StatCard
          icon={ThumbsUp}
          label="Likes"
          value={developer?.likes_count || 0}
          change="+5%"
          color="from-purple-500 to-pink-500"
        />
        <StatCard
          icon={MessageSquare}
          label="Messages"
          value={stats.messages}
          change="+3"
          color="from-yellow-500 to-orange-500"
        />
        <StatCard
          icon={Users}
          label="Visitors"
          value="1.2k"
          change="+18%"
          color="from-green-500 to-emerald-500"
        />
      </div>

      {/* Usage & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Usage Progress */}
        <div className="lg:col-span-2 bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
          <h2 className="text-lg font-semibold text-white mb-4">Plan Usage</h2>
          <div className="space-y-4">
            {usageItems.map((item) => {
              const Icon = item.icon
              const percentage = getUsagePercentage(item.current, item.max)
              const isNearLimit = percentage > 80
              const isUnlimited = item.max === -1

              return (
                <div key={item.name} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${item.color} flex items-center justify-center`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-gray-300">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium">
                        {item.current} / {isUnlimited ? '∞' : item.max}
                      </span>
                      {isNearLimit && !isUnlimited && (
                        <AlertCircle className="w-4 h-4 text-yellow-500" />
                      )}
                    </div>
                  </div>
                  {!isUnlimited && (
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${item.color} transition-all duration-300`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Upgrade button */}
          {plan?.id === 1 && (
            <Link
              to="/plans"
              className="mt-6 block text-center py-3 bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white rounded-xl font-semibold hover:scale-[1.02] transition-all"
            >
              Upgrade Plan
            </Link>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
          <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
          <div className="space-y-3">
            {quickActions.length > 0 ? (
              quickActions.map((action) => (
                <Link
                  key={action.name}
                  to={action.link}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${action.color} flex items-center justify-center`}>
                      <action.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-white font-medium">Add {action.name}</p>
                      <p className="text-xs text-gray-400">
                        {action.max - action.current} remaining
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </Link>
              ))
            ) : (
              <div className="text-center py-6">
                <Sparkles className="w-12 h-12 text-[#a855f7] mx-auto mb-3" />
                <p className="text-gray-400">You're all set!</p>
                <p className="text-sm text-gray-500">No pending actions</p>
              </div>
            )}
          </div>

          {/* Recent activity */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <h3 className="text-sm font-medium text-gray-400 mb-3">Recent Activity</h3>
            <div className="space-y-3">
              <ActivityItem
                icon={Eye}
                text="Profile viewed by someone"
                time="5 minutes ago"
              />
              <ActivityItem
                icon={MessageSquare}
                text="New message received"
                time="2 hours ago"
              />
              <ActivityItem
                icon={ThumbsUp}
                text="Someone liked your profile"
                time="1 day ago"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// مكون بطاقة الإحصائيات
const StatCard = ({ icon: Icon, label, value, change, color }) => (
  <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:scale-105 transition-all group">
    <div className="flex items-start justify-between mb-4">
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${color} flex items-center justify-center`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <span className="text-sm text-green-400 bg-green-400/10 px-2 py-1 rounded-full">
        {change}
      </span>
    </div>
    <p className="text-2xl font-bold text-white mb-1">{value}</p>
    <p className="text-sm text-gray-400">{label}</p>
  </div>
)

// مكون عنصر النشاط
const ActivityItem = ({ icon: Icon, text, time }) => (
  <div className="flex items-start gap-3">
    <div className="p-2 bg-white/5 rounded-lg">
      <Icon className="w-4 h-4 text-gray-400" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm text-white truncate">{text}</p>
      <p className="text-xs text-gray-500">{time}</p>
    </div>
  </div>
)

export default Overview