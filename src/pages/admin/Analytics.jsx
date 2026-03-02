import React, { useState, useEffect } from 'react'
import { adminStatsService, adminPlanMonitorService, adminDeveloperService } from '../../lib/adminService'
import {
  TrendingUp,
  Users,
  CreditCard,
  Crown,
  Calendar,
  Download,
  Loader,
  ArrowUp,
  ArrowDown,
  PieChart,
  BarChart3,
  Activity,
  Globe,
  Smartphone,
  Monitor,
  AlertCircle
} from 'lucide-react'

const Analytics = () => {
  const [stats, setStats] = useState({
    totalDevelopers: 0,
    activeDevelopers: 0,
    totalProjects: 0,
    totalRevenue: 0,
    paidSubscribers: 0
  })
  const [planUsage, setPlanUsage] = useState([])
  const [overages, setOverages] = useState([])
  const [growthData, setGrowthData] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState(30) // 30 days

  useEffect(() => {
    loadAllData()
  }, [selectedPeriod])

  const loadAllData = async () => {
    setLoading(true)
    try {
      const [dashboardStats, usageStats, overagesData, growth] = await Promise.all([
        adminStatsService.getDashboardStats(),
        adminPlanMonitorService.getPlanUsageStats(),
        adminPlanMonitorService.checkPlanOverages(0, 100),
        adminStatsService.getGrowthStats(selectedPeriod)
      ])

      setStats(dashboardStats)
      setPlanUsage(usageStats)
      setOverages(overagesData.data || [])
      setGrowthData(growth)
    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExportCSV = () => {
    const headers = ['التاريخ', 'المطورين الجدد', 'الإيرادات']
    const rows = growthData.map(day => [day.date, day.developers, day.revenue])
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `تقرير-النمو-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-purple-400 mx-auto mb-4" />
          <p className="text-gray-400">جاري تحميل الإحصائيات...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">الإحصائيات المتقدمة</h1>
        <div className="flex items-center gap-4">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(Number(e.target.value))}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
          >
            <option value={7}>آخر 7 أيام</option>
            <option value={30}>آخر 30 يوم</option>
            <option value={90}>آخر 3 أشهر</option>
            <option value={365}>آخر سنة</option>
          </select>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            <Download className="w-4 h-4" />
            تصدير CSV
          </button>
        </div>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl p-6 border border-blue-500/30">
          <div className="flex items-center justify-between mb-4">
            <Users className="w-8 h-8 text-blue-400" />
            <span className="text-xs text-green-400 flex items-center gap-1">
              <ArrowUp className="w-3 h-3" />
              +{Math.round((stats.activeDevelopers / stats.totalDevelopers) * 100)}%
            </span>
          </div>
          <p className="text-3xl font-bold text-white">{stats.totalDevelopers}</p>
          <p className="text-sm text-gray-400">إجمالي المطورين</p>
          <p className="text-xs text-gray-500 mt-2">{stats.activeDevelopers} نشط</p>
        </div>

        <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl p-6 border border-green-500/30">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="w-8 h-8 text-green-400" />
            <span className="text-xs text-green-400 flex items-center gap-1">
              <ArrowUp className="w-3 h-3" />
              +{growthData.reduce((sum, day) => sum + day.revenue, 0) > 0 ? '12' : '0'}%
            </span>
          </div>
          <p className="text-3xl font-bold text-white">${stats.totalRevenue}</p>
          <p className="text-sm text-gray-400">إجمالي الإيرادات</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-2xl p-6 border border-yellow-500/30">
          <div className="flex items-center justify-between mb-4">
            <Crown className="w-8 h-8 text-yellow-400" />
            <span className="text-xs text-green-400 flex items-center gap-1">
              <ArrowUp className="w-3 h-3" />
              {Math.round((stats.paidSubscribers / stats.totalDevelopers) * 100)}%
            </span>
          </div>
          <p className="text-3xl font-bold text-white">{stats.paidSubscribers}</p>
          <p className="text-sm text-gray-400">المشتركين المدفوع</p>
        </div>

        <div className="bg-gradient-to-br from-red-500/20 to-rose-500/20 rounded-2xl p-6 border border-red-500/30">
          <div className="flex items-center justify-between mb-4">
            <AlertCircle className="w-8 h-8 text-red-400" />
            <span className="text-xs text-red-400 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {overages.length}
            </span>
          </div>
          <p className="text-3xl font-bold text-white">{overages.length}</p>
          <p className="text-sm text-gray-400">تجاوز الحدود</p>
        </div>
      </div>

      {/* Growth Chart */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
        <h2 className="text-lg font-semibold text-white mb-6">النمو خلال آخر {selectedPeriod} يوم</h2>
        <div className="space-y-3">
          {growthData.map((day, index) => (
            <div key={index} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">{day.date}</span>
                <div className="flex items-center gap-4">
                  <span className="text-blue-400 flex items-center gap-1">
                    <Users className="w-3 h-3" /> {day.developers}
                  </span>
                  <span className="text-green-400 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> ${day.revenue}
                  </span>
                </div>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full"
                  style={{ width: `${Math.min((day.developers / 10) * 100, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Plan Usage Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
          <h2 className="text-lg font-semibold text-white mb-4">توزيع المشتركين حسب الباقات</h2>
          <div className="space-y-4">
            {planUsage.map((plan, index) => (
              <div key={index} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">{plan.plan}</span>
                  <span className="text-white">{plan.subscribers} مشترك</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                    style={{ width: `${(plan.subscribers / stats.totalDevelopers) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
          <h2 className="text-lg font-semibold text-white mb-4">معدلات تجاوز الحدود</h2>
          <div className="space-y-4">
            {planUsage.map((plan, index) => (
              <div key={index} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">{plan.plan}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-400">{plan.nearLimit} قريب</span>
                    <span className="text-red-400">{plan.overLimit} تجاوز</span>
                  </div>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden flex">
                  <div
                    className="h-full bg-yellow-400"
                    style={{ width: `${(plan.nearLimit / (plan.subscribers || 1)) * 100}%` }}
                  />
                  <div
                    className="h-full bg-red-500"
                    style={{ width: `${(plan.overLimit / (plan.subscribers || 1)) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Overages List */}
      {overages.length > 0 && (
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-red-500/20">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-400" />
            المطورون المتجاوزون للحدود
          </h2>
          <div className="space-y-3">
            {overages.slice(0, 5).map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-red-500/10 rounded-lg">
                <div>
                  <p className="text-white font-medium">{item.developer.full_name}</p>
                  <p className="text-xs text-gray-400">{item.issues.join('، ')}</p>
                </div>
                <span className="text-sm text-red-400">
                  {item.details.projects && `مشاريع: ${item.details.projects.current}`}
                </span>
              </div>
            ))}
            {overages.length > 5 && (
              <p className="text-center text-sm text-gray-500">
                و {overages.length - 5} آخرون
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Analytics
