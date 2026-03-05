import React, { useState, useEffect } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { developerService, messagesService } from '../../lib/supabase'
import {
  LayoutDashboard,
  FolderKanban,
  Award,
  Briefcase,
  GraduationCap,
  Settings,
  LogOut,
  Menu,
  User,
  Code,
  ChevronDown,
  Bell,
  Sparkles,
  Crown,
  MessageSquare,
  Share2,
  Check,
  Loader
} from 'lucide-react'

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [showShareTooltip, setShowShareTooltip] = useState(false)
  const [copied, setCopied] = useState(false)
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)

  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  // ✅ استخدام getDashboardData - سريع جداً
  useEffect(() => {
    if (!user?.id) return

    let isMounted = true

    const fetchDashboardData = async () => {
      try {
        const data = await developerService.getDashboardData(user.id)
        if (isMounted) {
          setDashboardData(data)
          setLoading(false)
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
        if (isMounted) setLoading(false)
      }
    }

    fetchDashboardData()
  }, [user?.id])

  // جلب عدد الرسائل غير المقروءة
  useEffect(() => {
    if (!user?.id || !dashboardData) return

    let isMounted = true

    const fetchUnreadCount = async () => {
      try {
        const count = await messagesService.getUnreadCount(user.id)
        if (isMounted) setUnreadCount(count)
      } catch (error) {
        console.error('Error fetching unread count:', error)
      }
    }

    fetchUnreadCount()
    const interval = setInterval(fetchUnreadCount, 30000)

    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [user?.id, dashboardData])

  const copyPortfolioLink = () => {
    if (!dashboardData?.username) return
    const portfolioUrl = `${window.location.origin}/u/${dashboardData.username}`
    navigator.clipboard.writeText(portfolioUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const handleNotificationClick = () => {
    navigate('/dashboard/messages')
  }

  const isActive = (path) => location.pathname === path

  const navigation = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard, requiresData: true },
    { name: 'Projects', href: '/dashboard/projects', icon: FolderKanban, requiresData: true },
    { name: 'Skills', href: '/dashboard/skills', icon: Code, requiresData: true },
    { name: 'Certificates', href: '/dashboard/certificates', icon: Award, requiresData: true },
    { name: 'Experience', href: '/dashboard/experience', icon: Briefcase, requiresData: true },
    { name: 'Education', href: '/dashboard/education', icon: GraduationCap, requiresData: true },
    { name: 'Messages', href: '/dashboard/messages', icon: MessageSquare, requiresData: true },
    { name: 'AI Builder', href: '/app/builder', icon: Sparkles, requiresData: false },
    { name: 'Plan Status', href: '/dashboard/plan-status', icon: Crown, requiresData: true },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings, requiresData: true },
  ]

  return (
    <div className="min-h-screen bg-[#030014]">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 w-64 bg-white/5 backdrop-blur-xl border-r border-white/10 transform transition-transform duration-300 ease-in-out z-50 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-center border-b border-white/10">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-[#6366f1] to-[#a855f7] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">P</span>
            </div>
            <span className="text-xl font-bold text-white">Portfolio<span className="text-[#a855f7]">AI</span></span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon
            const isMessagesPage = item.href === '/dashboard/messages'
            const disabled = loading && item.requiresData
            
            return (
              <div key={item.name} className="relative">
                <Link
                  to={disabled ? '#' : item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all relative ${
                    disabled 
                      ? 'opacity-50 cursor-not-allowed'
                      : isActive(item.href)
                        ? 'bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white'
                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                  onClick={(e) => {
                    if (disabled) {
                      e.preventDefault()
                    } else {
                      setSidebarOpen(false)
                    }
                  }}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                  
                  {isMessagesPage && unreadCount > 0 && !disabled && (
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 min-w-[20px] h-[20px] flex items-center justify-center bg-red-500 text-white text-xs rounded-full px-1">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}

                  {disabled && item.requiresData && (
                    <Loader className="w-4 h-4 text-gray-500 animate-spin mr-auto" />
                  )}
                </Link>
              </div>
            )
          })}
        </nav>

        {/* User info - من getDashboardData */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          <div className="flex items-center gap-3">
            {loading ? (
              <>
                <div className="w-10 h-10 bg-white/10 rounded-full animate-pulse"></div>
                <div className="flex-1">
                  <div className="w-24 h-4 bg-white/10 rounded-lg animate-pulse mb-2"></div>
                  <div className="w-32 h-3 bg-white/10 rounded-lg animate-pulse"></div>
                </div>
              </>
            ) : (
              <>
                <img
                  src={dashboardData?.profile_image || '/default-avatar.png'}
                  alt={dashboardData?.full_name}
                  className="w-10 h-10 rounded-full object-cover border-2 border-[#a855f7]/30"
                  onError={(e) => { e.target.src = '/default-avatar.png' }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {dashboardData?.full_name}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {dashboardData?.email}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top navbar */}
        <header className="sticky top-0 z-30 bg-white/5 backdrop-blur-xl border-b border-white/10">
          <div className="flex items-center justify-between h-16 px-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="flex items-center gap-4 ml-auto">
              
              {/* Share button */}
              <div className="relative">
                <button
                  onClick={copyPortfolioLink}
                  onMouseEnter={() => setShowShareTooltip(true)}
                  onMouseLeave={() => setShowShareTooltip(false)}
                  className="relative p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                  disabled={!dashboardData?.username}
                >
                  {copied ? (
                    <Check className="w-5 h-5 text-green-400" />
                  ) : (
                    <Share2 className="w-5 h-5" />
                  )}
                </button>
                
                {showShareTooltip && !copied && (
                  <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap border border-white/10">
                    مشاركة الموقع
                  </div>
                )}
                
                {copied && (
                  <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-green-600 text-white text-xs rounded-lg whitespace-nowrap">
                    تم نسخ الرابط!
                  </div>
                )}
              </div>

              {/* Notifications */}
              <button 
                onClick={handleNotificationClick}
                className="relative p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-xs rounded-full px-1">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Profile dropdown */}
              <div className="relative">
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex items-center gap-2 p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="w-8 h-8 bg-white/10 rounded-full animate-pulse"></div>
                      <div className="w-16 h-4 bg-white/10 rounded-lg animate-pulse hidden sm:block"></div>
                    </>
                  ) : (
                    <>
                      <img
                        src={dashboardData?.profile_image || '/default-avatar.png'}
                        alt={dashboardData?.full_name}
                        className="w-8 h-8 rounded-full object-cover"
                        onError={(e) => { e.target.src = '/default-avatar.png' }}
                      />
                      <span className="hidden sm:block text-sm">
                        {dashboardData?.full_name?.split(' ')[0] || 'User'}
                      </span>
                    </>
                  )}
                  <ChevronDown className="w-4 h-4" />
                </button>

                {profileMenuOpen && dashboardData && (
                  <div className="absolute right-0 mt-2 w-48 bg-gray-900 border border-white/10 rounded-xl shadow-xl z-50">
                    <Link
                      to={`/u/${dashboardData?.username || ''}`}
                      className="flex items-center gap-2 px-4 py-3 text-sm text-gray-300 hover:bg-white/5 hover:text-white"
                      onClick={() => setProfileMenuOpen(false)}
                    >
                      <User className="w-4 h-4" />
                      عرض الملف الشخصي
                    </Link>
                    <Link
                      to="/dashboard/settings"
                      className="flex items-center gap-2 px-4 py-3 text-sm text-gray-300 hover:bg-white/5 hover:text-white"
                      onClick={() => setProfileMenuOpen(false)}
                    >
                      <Settings className="w-4 h-4" />
                      الإعدادات
                    </Link>
                    <hr className="border-white/10" />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10"
                    >
                      <LogOut className="w-4 h-4" />
                      تسجيل خروج
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout
