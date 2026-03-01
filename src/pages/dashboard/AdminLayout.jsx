import React, { useState } from 'react'
import { Outlet, Link, useLocation, Navigate } from 'react-router-dom'
import { useAdminAuth } from '../../hooks/useAdminAuth'
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
  MessageCircle,
  Mail
} from 'lucide-react'

const AdminLayout = () => {
  const { admin, logout } = useAdminAuth()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // التحقق من صلاحية الأدمن
  if (!admin) {
    return <Navigate to="/login" replace />
  }

  const navigation = [
    { name: 'Overview', href: '/admin', icon: LayoutDashboard },
    { name: 'Developers', href: '/admin/developers', icon: Users },
    { name: 'Plans', href: '/admin/plans', icon: Crown },
    { name: 'Payments', href: '/admin/payments', icon: CreditCard },
    { name: 'Messages', href: '/admin/messages', icon: MessageCircle },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-[#030014]">
      {/* Sidebar للشاشات الكبيرة */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:block bg-white/5 backdrop-blur-xl border-r border-white/10">
        {/* Logo */}
        <div className="h-16 flex items-center justify-center border-b border-white/10">
          <Link to="/admin" className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-[#a855f7]" />
            <span className="text-xl font-bold text-white">Admin<span className="text-[#a855f7]">Panel</span></span>
          </Link>
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

        {/* Admin Info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#6366f1] to-[#a855f7] flex items-center justify-center">
              <span className="text-white font-bold">
                {admin?.full_name?.charAt(0) || 'A'}
              </span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-white">{admin?.full_name}</p>
              <p className="text-xs text-gray-400">Administrator</p>
            </div>
            <button onClick={logout} className="p-2 text-gray-400 hover:text-white">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Top Bar */}
        <header className="h-16 bg-white/5 backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-4 lg:px-6">
          {/* زر القائمة للجوال */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 text-gray-400 hover:text-white"
          >
            <Menu className="w-5 h-5" />
          </button>

          <h2 className="text-lg font-medium text-white">
            {navigation.find(item => item.href === location.pathname)?.name || 'Admin Dashboard'}
          </h2>
          
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-gray-400 hover:text-white">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="h-8 w-px bg-white/10"></div>
            <span className="text-sm text-gray-400">Welcome, {admin?.full_name?.split(' ')[0]}</span>
          </div>
        </header>

        {/* Sidebar للجوال */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            {/* خلفية معتمة */}
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
            />

            {/* Sidebar */}
            <div className="fixed inset-y-0 left-0 w-64 bg-[#030014] border-r border-white/10">
              <div className="h-16 flex items-center justify-between px-4 border-b border-white/10">
                <Link to="/admin" className="flex items-center gap-2" onClick={() => setSidebarOpen(false)}>
                  <Shield className="w-6 h-6 text-[#a855f7]" />
                  <span className="text-xl font-bold text-white">Admin</span>
                </Link>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="p-4 space-y-1">
                {navigation.map((item) => {
                  const Icon = item.icon
                  const isActive = location.pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setSidebarOpen(false)}
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

              <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#6366f1] to-[#a855f7] flex items-center justify-center">
                    <span className="text-white font-bold">A</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{admin?.full_name}</p>
                    <p className="text-xs text-gray-400">Administrator</p>
                  </div>
                  <button onClick={logout} className="p-2 text-gray-400 hover:text-white">
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
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
