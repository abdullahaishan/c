import React, { useState, useEffect } from 'react'
import { 
  Users, 
  CreditCard, 
  Crown, 
  Eye, 
  TrendingUp, 
  Calendar,
  ArrowUp,
  ArrowDown,
  MessageCircle,
  Mail
} from 'lucide-react'
import { adminAnalyticsService } from '../../lib/adminService'
import { supabase } from '../../lib/supabase'

const Overview = () => {
  const [stats, setStats] = useState(null)
  const [messageStats, setMessageStats] = useState({ total: 0, unread: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
    fetchMessageStats()
  }, [])

  const fetchStats = async () => {
    setLoading(true)
    const data = await adminAnalyticsService.getDashboardStats()
    setStats(data)
    setLoading(false)
  }

  const fetchMessageStats = async () => {
    const { count: total } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })

    const { count: unread } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('is_read', false)

    setMessageStats({ total: total || 0, unread: unread || 0 })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  const cards = [
    {
      title: 'Total Developers',
      value: stats?.developers?.total || 0,
      icon: Users,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Active Developers',
      value: stats?.developers?.active || 0,
      icon: Users,
      color: 'from-green-500 to-emerald-500',
    },
    {
      title: 'Pending Payments',
      value: stats?.payments?.pending || 0,
      icon: CreditCard,
      color: 'from-yellow-500 to-orange-500',
    },
    {
      title: 'Total Revenue',
      value: `$${stats?.payments?.totalRevenue || 0}`,
      icon: TrendingUp,
      color: 'from-purple-500 to-pink-500',
    },
    {
      title: 'Projects',
      value: stats?.projects || 0,
      icon: Crown,
      color: 'from-indigo-500 to-purple-500',
    },
    {
      title: 'Total Views',
      value: stats?.totalViews?.toLocaleString() || 0,
      icon: Eye,
      color: 'from-pink-500 to-rose-500',
    },
    {
      title: 'Total Messages',
      value: messageStats.total,
      icon: MessageCircle,
      color: 'from-orange-500 to-red-500',
    },
    {
      title: 'Unread Messages',
      value: messageStats.unread,
      icon: Mail,
      color: 'from-red-500 to-rose-500',
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Dashboard Overview</h1>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Calendar className="w-4 h-4" />
          <span>Last 30 days</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => (
          <div
            key={index}
            className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-purple-500/50 transition-all group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${card.color} flex items-center justify-center group-hover:scale-110 transition`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
            </div>
            
            <p className="text-3xl font-bold text-white mb-1">{card.value}</p>
            <p className="text-sm text-gray-400">{card.title}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
          <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button className="w-full p-3 bg-blue-500/10 text-blue-400 rounded-xl hover:bg-blue-500/20 transition text-left">
              Process Pending Payments ({stats?.payments?.pending})
            </button>
            <button className="w-full p-3 bg-green-500/10 text-green-400 rounded-xl hover:bg-green-500/20 transition text-left">
              Review Unread Messages ({messageStats.unread})
            </button>
            <button className="w-full p-3 bg-purple-500/10 text-purple-400 rounded-xl hover:bg-purple-500/20 transition text-left">
              Check New Developers
            </button>
          </div>
        </div>
        
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
          <h2 className="text-lg font-semibold text-white mb-4">System Health</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">API Status</span>
              <span className="text-green-400">Operational</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Database</span>
              <span className="text-green-400">Healthy</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Storage</span>
              <span className="text-green-400">85% Available</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Email Service</span>
              <span className="text-green-400">Connected</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Overview
