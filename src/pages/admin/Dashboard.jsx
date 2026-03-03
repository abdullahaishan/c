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
  ArrowDown
} from 'lucide-react'

const AdminDashboard = () => {
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
  const [loading, setLoading] = useState(true)
  const [growthData, setGrowthData] = useState([])

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    setLoading(true)
    try {
      const [dashboardStats, subsStats, growth] = await Promise.all([
        adminStatsService.getDashboardStats(),
        adminSubscriptionService.getSubscriptionStats(),
        adminStatsService.getGrowthStats(7)
      ])
      setStats(dashboardStats)
      setSubscriptionStats(subsStats)
      setGrowthData(growth)
    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const cards = [
    {
      title: 'إجمالي المطورين',
      value: stats.totalDevelopers,
      icon: Users,
      color: 'from-blue-500 to-cyan-500',
      link: '/admin/developers'
    },
    {
      title: 'المطورين النشطين',
      value: stats.activeDevelopers,
      icon: Users,
      color: 'from-green-500 to-emerald-500',
      link: '/admin/developers?status=active'
    },
    {
      title: 'المشتركين المدفوع',
      value: stats.paidSubscribers,
      icon: Crown,
      color: 'from-yellow-500 to-orange-500',
      link: '/admin/developers?plan=paid'
    },
    {
      title: 'إجمالي الإيرادات',
      value: `$${stats.totalRevenue}`,
      icon: TrendingUp,
      color: 'from-purple-500 to-pink-500',
      link: '/admin/payments'
    },
    {
      title: 'المشاريع',
      value: stats.totalProjects,
      icon: Package,
      color: 'from-indigo-500 to-purple-500',
      link: '/admin/projects'
    },
    {
      title: 'طلبات اشتراك معلقة',
      value: subscriptionStats.pendingSubscriptions,
      icon: CreditCard,
      color: 'from-red-500 to-rose-500',
      link: '/admin/subscriptions',
      badge: subscriptionStats.pendingSubscriptions > 0
    },
    {
      title: 'طلبات ترقية معلقة',
      value: subscriptionStats.pendingUpgrades,
      icon: Crown,
      color: 'from-orange-500 to-red-500',
      link: '/admin/upgrades',
      badge: subscriptionStats.pendingUpgrades > 0
    }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">جاري تحميل لوحة التحكم...</p>
        </div>
      </div>
    )
  }

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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => (
          <Link
            key={index}
            to={card.link}
            className={`bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-purple-500/50 transition-all group relative ${
              card.badge ? 'ring-2 ring-red-500/50' : ''
            }`}
          >
            {card.badge && (
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full animate-pulse" />
            )}
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${card.color} flex items-center justify-center group-hover:scale-110 transition`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
            </div>
            
            <p className="text-3xl font-bold text-white mb-1">{card.value}</p>
            <p className="text-sm text-gray-400">{card.title}</p>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
          <h2 className="text-lg font-semibold text-white mb-4">إجراءات سريعة</h2>
          <div className="space-y-3">
            {subscriptionStats.pendingSubscriptions > 0 && (
              <Link
                to="/admin/subscriptions"
                className="flex items-center justify-between p-3 bg-yellow-500/10 rounded-xl hover:bg-yellow-500/20 transition"
              >
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-yellow-400" />
                  <span className="text-white">طلبات اشتراك معلقة</span>
                </div>
                <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-lg text-sm">
                  {subscriptionStats.pendingSubscriptions}
                </span>
              </Link>
            )}

            {subscriptionStats.pendingUpgrades > 0 && (
              <Link
                to="/admin/upgrades"
                className="flex items-center justify-between p-3 bg-orange-500/10 rounded-xl hover:bg-orange-500/20 transition"
              >
                <div className="flex items-center gap-3">
                  <Crown className="w-5 h-5 text-orange-400" />
                  <span className="text-white">طلبات ترقية معلقة</span>
                </div>
                <span className="px-2 py-1 bg-orange-500/20 text-orange-400 rounded-lg text-sm">
                  {subscriptionStats.pendingUpgrades}
                </span>
              </Link>
            )}

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

        {/* Growth Chart (بسيط) */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
          <h2 className="text-lg font-semibold text-white mb-4">النمو خلال آخر 7 أيام</h2>
          <div className="space-y-3">
            {growthData.slice(-7).map((day, index) => (
              <div key={index} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">{day.date}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-blue-400">{day.developers} مطور</span>
                    <span className="text-green-400">${day.revenue}</span>
                  </div>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full"
                    style={{ width: `${Math.min(day.developers * 10, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
