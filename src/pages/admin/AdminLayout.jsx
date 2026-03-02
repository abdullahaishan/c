import React, { useState, useEffect } from 'react'
import { Outlet, Link, useLocation, Navigate } from 'react-router-dom'
import { useAdminAuth } from '../../hooks/useAdminAuth'
import { adminNotificationService } from '../../lib/adminService'
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Settings,
  BarChart3,
  LogOut,
  Menu,
  X,
  Bell,
  Crown,
  Shield,
  Package,
  MessageCircle,
  AlertCircle
} from 'lucide-react'

const AdminLayout = () => {
  const { admin, logout } = useAdminAuth()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (admin?.id) {
//      loadUnreadCount()
    }
  }, [admin])

  const loadUnreadCount = async () => {
    try {
//      const { data } = await adminNotificationService.getUnreadNotifications(admin.id, 0, 1)
//      setUnreadCount(data.length)
    } catch (error) {
      console.error('Error loading unread count:', error)
    }
  }

  if (!admin) {
    return <Navigate to="/admin/login" replace />
  }

  const navigation = [
    { name: 'لوحة التحكم', href: '/admin', icon: LayoutDashboard },
    { name: 'المطورين', href: '/admin/developers', icon: Users },
    { name: 'الباقات', href: '/admin/plans', icon: Package },
    { name: 'طلبات الاشتراك', href: '/admin/subscriptions', icon: CreditCard },
    { name: 'طلبات الترقية', href: '/admin/upgrades', icon: Crown },
    { name: 'الرسائل', href: '/admin/messages', icon: MessageCircle },
    { name: 'الإحصائيات', href: '/admin/analytics', icon: BarChart3 },
    { name: 'الإعدادات', href: '/admin/settings', icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-[#030014]">
      {/* Sidebar للشاشات الكبيرة */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:right-0 lg:w-64 lg:block bg-white/5 backdrop-blur-xl border-l border-white/10">
        {/* Logo */}
        <div className="h-16 flex items-center justify-center border-b border-white/10">
          <Link to="/admin" className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-[#a855f7]" />
            <span className="text-xl font-bold text-white">لوحة<span className="text-[#a855f7]">التحكم</span></span>
          </Link>
        </div>

        {/* Admin Info */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <img
              src={admin.profile_image || '/default-avatar.png'}
              alt={admin.full_name}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="flex-1">
              <p className="text-sm font-medium text-white">{admin.full_name}</p>
              <p className="text-xs text-gray-400">مدير النظام</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.href
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-400 hover:bg-red-500/10 transition"
          >
            <LogOut className="w-5 h-5" />
            <span>تسجيل الخروج</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:mr-64">
        {/* Top Bar */}
        <header className="h-16 bg-white/5 backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-4 lg:px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 text-gray-400 hover:text-white"
          >
            <Menu className="w-5 h-5" />
          </button>

          <h2 className="text-lg font-medium text-white">
            {navigation.find(item => item.href === location.pathname)?.name || 'لوحة التحكم'}
          </h2>
          
          <div className="flex items-center gap-4">
            <Link to="/admin/notifications" className="relative p-2 text-gray-400 hover:text-white">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Link>
            <div className="h-8 w-px bg-white/10"></div>
            <span className="text-sm text-gray-400">مرحباً، {admin.full_name?.split(' ')[0]}</span>
          </div>
        </header>

        {/* Sidebar للجوال */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
            />

            <div className="fixed inset-y-0 right-0 w-64 bg-[#030014] border-l border-white/10">
              <div className="h-16 flex items-center justify-between px-4 border-b border-white/10">
                <Link to="/admin" className="flex items-center gap-2" onClick={() => setSidebarOpen(false)}>
                  <Shield className="w-6 h-6 text-[#a855f7]" />
                  <span className="text-xl font-bold text-white">لوحةالتحكم</span>
                </Link>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <img
                    src={admin.profile_image || '/default-avatar.png'}
                    alt={admin.full_name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{admin.full_name}</p>
                    <p className="text-xs text-gray-400">مدير النظام</p>
                  </div>
                </div>
              </div>

              <nav className="p-4 space-y-1">
                {navigation.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition"
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.name}</span>
                    </Link>
                  )
                })}
              </nav>

              <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
                <button
                  onClick={logout}
                  className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-400 hover:bg-red-500/10 transition"
                >
                  <LogOut className="w-5 h-5" />
                  <span>تسجيل الخروج</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Page Content */}
        <main className="p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
