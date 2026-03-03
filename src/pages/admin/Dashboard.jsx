import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { adminStatsService, adminSubscriptionService } from '../../lib/adminService'
import {
  Users,
  CreditCard,
  Crown,
  Eye,
  TrendingUp,
  Calendar,
  MessageCircle,
  Package,
  AlertCircle,
  CheckCircle,
  ArrowUp,
  ArrowDown,
  Loader
} from 'lucide-react'

// مكون البطاقة مع تحميل منفصل
const StatCard = ({ title, value, icon: Icon, color, link, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${color} opacity-50 flex items-center justify-center`}>
            <Icon className="w-6 h-6 text-white opacity-50" />
          </div>
        </div>
        <div className="h-8 w-20 bg-white/10 rounded animate-pulse mb-2"></div>
        <div className="h-4 w-24 bg-white/10 rounded animate-pulse"></div>
      </div>
    )
  }

  return (
    <Link
      to={link}
      className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-purple-500/50 transition-all group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${color} flex items-center justify-center group-hover:scale-110 transition`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      
      <p className="text-3xl font-bold text-white mb-1">{value}</p>
      <p className="text-sm text-gray-400">{title}</p>
    </Link>
  )
}

// مكون الإجراءات السريعة مع تحميل منفصل
const QuickActionItem = ({ to, icon: Icon, title, count, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 bg-white/10 rounded animate-pulse"></div>
          <div className="h-4 w-32 bg-white/10 rounded animate-pulse"></div>
        </div>
        <div className="w-8 h-6 bg-white/10 rounded animate-pulse"></div>
      </div>
    )
  }

  return (
    <Link
      to={to}
      className={`flex items-center justify-between p-3 ${
        count > 0 ? 'bg-yellow-500/10 hover:bg-yellow-500/20' : 'bg-white/5 hover:bg-white/10'
      } rounded-xl transition`}
    >
      <div className="flex items-center gap-3">
        <Icon className={`w-5 h-5 ${count > 0 ? 'text-yellow-400' : 'text-gray-400'}`} />
        <span className="text-white">{title}</span>
      </div>
      {count > 0 && (
        <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-lg text-sm">
          {count}
        </span>
      )}
    </Link>
  )
}

// مكون الرسم البياني مع تحميل منفصل
const GrowthChart = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="space-y-1">
            <div className="flex justify-between">
              <div className="h-4 w-24 bg-white/10 rounded animate-pulse"></div>
              <div className="h-4 w-32 bg-white/10 rounded animate-pulse"></div>
            </div>
            <div className="h-2 bg-white/10 rounded-full">
              <div className="h-full w-0 bg-gradient-to-r from-blue-500 to-green-500 rounded-full"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!data || data.length === 0) {
    return <p className="text-center text-gray-500 py-4">لا توجد بيانات متاحة</p>
  }

  return (
    <div className="space-y-3">
      {data.slice(-7).map((day, index) => (
        <div key={index} className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">{day.date}</span>
            <div className="flex items-center gap-4">
              <span className="text-blue-400">{day.developers || 0} مطور</span>
              <span className="text-green-400">${day.revenue || 0}</span>
            </div>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full"
              style={{ width: `${Math.min((day.developers || 0) * 10, 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

const AdminDashboard = () => {
  // حالة تحميل منفصلة لكل جزء
  const [loadingStates, setLoadingStates] = useState({
    stats: true,
    subscriptions: true,
    growth: true
  })

  const [stats, setStats] = useState({
    totalDevelopers: 0,
    activeDevelopers: 0,
    totalProjects: 0,
    totalRevenue: 0,
    paidSubscribers: 0
  })

  const [subscriptionStats, setSubscriptionStats] = useState({
    pendingSubscriptions: 0,
    pendingUpgrades: 0,
    activeSubscribers: 0
  })

  const [growthData, setGrowthData] = useState([])
  const [globalError, setGlobalError] = useState(null)

  // تحميل الإحصائيات العامة
  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await adminStatsService.getDashboardStats()
        setStats(data)
      } catch (error) {
        console.error('خطأ في تحميل الإحصائيات العامة:', error)
      } finally {
        setLoadingStates(prev => ({ ...prev, stats: false }))
      }
    }
    loadStats()
  }, [])

  // تحميل إحصائيات الاشتراكات
  useEffect(() => {
    const loadSubscriptions = async () => {
      try {
        const data = await adminSubscriptionService.getSubscriptionStats()
        setSubscriptionStats(data)
      } catch (error) {
        console.error('خطأ في تحميل إحصائيات الاشتراكات:', error)
      } finally {
        setLoadingStates(prev => ({ ...prev, subscriptions: false }))
      }
    }
    loadSubscriptions()
  }, [])

  // تحميل بيانات النمو
  useEffect(() => {
    const loadGrowth = async () => {
      try {
        const data = await adminStatsService.getGrowthStats(7)
        setGrowthData(data || [])
      } catch (error) {
        console.error('خطأ في تحميل بيانات النمو:', error)
      } finally {
        setLoadingStates(prev => ({ ...prev, growth: false }))
      }
    }
    loadGrowth()
  }, [])

  const cards = [
    {
      title: 'إجمالي المطورين',
      value: stats.totalDevelopers,
      icon: Users,
      color: 'from-blue-500 to-cyan-500',
      link: '/admin/developers',
      isLoading: loadingStates.stats
    },
    {
      title: 'المطورين النشطين',
      value: stats.activeDevelopers,
      icon: Users,
      color: 'from-green-500 to-emerald-500',
      link: '/admin/developers?status=active',
      isLoading: loadingStates.stats
    },
    {
      title: 'المشتركين المدفوع',
      value: stats.paidSubscribers,
      icon: Crown,
      color: 'from-yellow-500 to-orange-500',
      link: '/admin/developers?plan=paid',
      isLoading: loadingStates.stats
    },
    {
      title: 'إجمالي الإيرادات',
      value: `$${stats.totalRevenue}`,
      icon: TrendingUp,
      color: 'from-purple-500 to-pink-500',
      link: '/admin/payments',
      isLoading: loadingStates.stats
    },
    {
      title: 'المشاريع',
      value: stats.totalProjects,
      icon: Package,
      color: 'from-indigo-500 to-purple-500',
      link: '/admin/projects',
      isLoading: loadingStates.stats
    },
    {
      title: 'طلبات اشتراك معلقة',
      value: subscriptionStats.pendingSubscriptions,
      icon: CreditCard,
      color: 'from-red-500 to-rose-500',
      link: '/admin/subscriptions',
      isLoading: loadingStates.subscriptions
    },
    {
      title: 'طلبات ترقية معلقة',
      value: subscriptionStats.pendingUpgrades,
      icon: Crown,
      color: 'from-orange-500 to-red-500',
      link: '/admin/upgrades',
      isLoading: loadingStates.subscriptions
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">لوحة التحكم</h1>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Calendar className="w-4 h-4" />
          <span>{new Date().toLocaleDateString('ar-EG')}</span>
        </div>
      </div>

      {/* Stats Cards - كل بطاقة تتحمّل لوحدها */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => (
          <StatCard key={index} {...card} />
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
          <h2 className="text-lg font-semibold text-white mb-4">إجراءات سريعة</h2>
          <div className="space-y-3">
            <QuickActionItem
              to="/admin/subscriptions"
              icon={CreditCard}
              title="طلبات اشتراك معلقة"
              count={subscriptionStats.pendingSubscriptions}
              isLoading={loadingStates.subscriptions}
            />

            <QuickActionItem
              to="/admin/upgrades"
              icon={Crown}
              title="طلبات ترقية معلقة"
              count={subscriptionStats.pendingUpgrades}
              isLoading={loadingStates.subscriptions}
            />

            <Link
              to="/admin/developers"
              className="flex items-center gap-3 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition"
            >
              <Users className="w-5 h-5 text-blue-400" />
              <span className="text-white">عرض جميع المطورين</span>
            </Link>

            <Link
              to="/admin/plans"
              className="flex items-center gap-3 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition"
            >
              <Package className="w-5 h-5 text-purple-400" />
              <span className="text-white">إدارة الباقات</span>
            </Link>
          </div>
        </div>

        {/* Growth Chart */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
          <h2 className="text-lg font-semibold text-white mb-4">النمو خلال آخر 7 أيام</h2>
          <GrowthChart data={growthData} isLoading={loadingStates.growth} />
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
