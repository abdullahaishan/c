import React from 'react'
import { useAuth } from '../../hooks/useAuth'
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
  GraduationCap
} from 'lucide-react'

const Overview = () => {
  const { user } = useAuth()

  // بيانات تجريبية مؤقتة (حتى نكمل باقي الخدمات)
  const mockStats = {
    views: 0,
    likes: 0,
    messages: 0,
    visitors: '0'
  }

  const mockUsage = [
    {
      name: 'Projects',
      current: 0,
      max: 10,
      icon: FolderKanban,
      color: 'from-blue-500 to-cyan-500',
      link: '/dashboard/projects'
    },
    {
      name: 'Skills',
      current: 0,
      max: 20,
      icon: Code,
      color: 'from-purple-500 to-pink-500',
      link: '/dashboard/skills'
    },
    {
      name: 'Certificates',
      current: 0,
      max: 10,
      icon: Award,
      color: 'from-yellow-500 to-orange-500',
      link: '/dashboard/certificates'
    },
    {
      name: 'Experience',
      current: 0,
      max: 10,
      icon: Briefcase,
      color: 'from-green-500 to-emerald-500',
      link: '/dashboard/experience'
    },
    {
      name: 'Education',
      current: 0,
      max: 10,
      icon: GraduationCap,
      color: 'from-red-500 to-rose-500',
      link: '/dashboard/education'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-[#6366f1]/20 to-[#a855f7]/20 rounded-2xl p-6 border border-white/10">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">
              مرحباً {user?.full_name?.split(' ')[0] || 'مستخدم'}! 👋
            </h1>
            <p className="text-gray-400">
              هذه لوحة التحكم الخاصة بك. يمكنك إدارة محتوى بورتفليوك من هنا.
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
          label="المشاهدات"
          value={mockStats.views}
          change="0%"
          color="from-blue-500 to-cyan-500"
        />
        <StatCard
          icon={ThumbsUp}
          label="الإعجابات"
          value={mockStats.likes}
          change="0"
          color="from-purple-500 to-pink-500"
        />
        <StatCard
          icon={MessageSquare}
          label="الرسائل"
          value={mockStats.messages}
          change="0"
          color="from-yellow-500 to-orange-500"
        />
        <StatCard
          icon={Users}
          label="الزوار"
          value={mockStats.visitors}
          change="0"
          color="from-green-500 to-emerald-500"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
          <h2 className="text-lg font-semibold text-white mb-4">ابدأ بإضافة محتوى</h2>
          <div className="space-y-3">
            {mockUsage.map((action) => (
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
                    <p className="text-white font-medium">أضف {action.name}</p>
                    <p className="text-xs text-gray-400">
                      {action.current} / {action.max}
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </Link>
            ))}
          </div>
        </div>

        {/* Getting Started */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
          <h2 className="text-lg font-semibold text-white mb-4">ابدأ هنا</h2>
          <div className="space-y-4">
            <div className="p-4 bg-[#6366f1]/10 rounded-xl border border-[#6366f1]/20">
              <h3 className="text-white font-medium mb-2">1. أضف مشاريعك</h3>
              <p className="text-sm text-gray-400">أضف المشاريع التي عملت عليها لتظهر في بورتفليوك</p>
            </div>
            <div className="p-4 bg-[#a855f7]/10 rounded-xl border border-[#a855f7]/20">
              <h3 className="text-white font-medium mb-2">2. أضف مهاراتك</h3>
              <p className="text-sm text-gray-400">حدد المهارات التي تتقنها ليطلع عليها الزوار</p>
            </div>
            <div className="p-4 bg-[#6366f1]/10 rounded-xl border border-[#6366f1]/20">
              <h3 className="text-white font-medium mb-2">3. أضف شهاداتك</h3>
              <p className="text-sm text-gray-400">أضف الشهادات التي حصلت عليها لتعزيز مصداقيتك</p>
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

export default Overview
