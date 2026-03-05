// DashboardLayout.jsx
import React, { useState, useEffect } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { messagesService, supabase } from '../../lib/supabase'

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
  Check
} from 'lucide-react'

const DashboardLayout = () => {

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)

  const [unreadCount, setUnreadCount] = useState(0)

  const [developer, setDeveloper] = useState(null)
  const [loadingDeveloper, setLoadingDeveloper] = useState(true)

  const [notificationsCount, setNotificationsCount] = useState(0)
  const [loadingNotifications, setLoadingNotifications] = useState(true)

  const [showShareTooltip, setShowShareTooltip] = useState(false)
  const [copied, setCopied] = useState(false)

  const { user, logout } = useAuth()

  const location = useLocation()
  const navigate = useNavigate()

  // =========================
  // جلب بيانات المطور
  // =========================
  const fetchDeveloperData = async () => {

    if (!user?.id) return

    try {

      setLoadingDeveloper(true)

      const { data, error } = await supabase
        .from('developers')
        .select('username, avatar, email, full_name')
        .eq('user_id', user.id)
        .single()

      if (!error && data) {

        setDeveloper(data)

      }

    } catch (err) {

      console.error('Developer fetch error:', err)

    } finally {

      setLoadingDeveloper(false)

    }
  }

  // =========================
  // جلب الإشعارات
  // =========================
  const fetchNotifications = async () => {

    if (!user?.id) return

    try {

      setLoadingNotifications(true)

      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false)

      if (!error) {

        setNotificationsCount(count || 0)

      }

    } catch (err) {

      console.error('Notifications error:', err)

    } finally {

      setLoadingNotifications(false)

    }
  }

  // =========================
  // جلب الرسائل
  // =========================
  const fetchUnreadCount = async () => {

    if (!user) return

    try {

      const count = await messagesService.getUnreadCount(user.id)

      setUnreadCount(count)

    } catch (error) {

      console.error('Error fetching unread count:', error)

    }
  }

  // =========================
  // تحميل البيانات عند تحديث الصفحة
  // =========================
  useEffect(() => {

    if (user) {

      fetchDeveloperData()

      fetchNotifications()

      fetchUnreadCount()

      const interval = setInterval(() => {

        fetchNotifications()

        fetchUnreadCount()

      }, 30000)

      return () => clearInterval(interval)

    }

  }, [user])

  // =========================
  // نسخ رابط الموقع
  // =========================
  const copyPortfolioLink = () => {

    if (!developer?.username) return

    const portfolioUrl = `${window.location.origin}/u/${developer.username}`

    navigator.clipboard.writeText(portfolioUrl)

    setCopied(true)

    setTimeout(() => setCopied(false), 2000)
  }

  // =========================
  // التنقل
  // =========================
  const navigation = [

    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },

    { name: 'Projects', href: '/dashboard/projects', icon: FolderKanban },

    { name: 'Skills', href: '/dashboard/skills', icon: Code },

    { name: 'Certificates', href: '/dashboard/certificates', icon: Award },

    { name: 'Experience', href: '/dashboard/experience', icon: Briefcase },

    { name: 'Education', href: '/dashboard/education', icon: GraduationCap },

    { name: 'Messages', href: '/dashboard/messages', icon: MessageSquare },

    { name: 'AI Builder', href: '/app/builder', icon: Sparkles },

    { name: 'Plan Status', href: '/dashboard/plan-status', icon: Crown },

    { name: 'Settings', href: '/dashboard/settings', icon: Settings },

  ]

  const handleLogout = () => {

    logout()

    navigate('/')

  }

  const handleNotificationClick = () => {

    navigate('/dashboard/messages')

  }

  const isActive = (path) => location.pathname === path

  return (

    <div className="min-h-screen bg-[#030014]">

      {/* Sidebar backdrop */}
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

            <span className="text-xl font-bold text-white">

              Portfolio<span className="text-[#a855f7]">V5</span>

            </span>

          </Link>

        </div>

        {/* Navigation */}

        <nav className="p-4 space-y-1">

          {navigation.map((item) => {

            const Icon = item.icon

            const isMessagesPage = item.href === '/dashboard/messages'

            return (

              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all relative ${
                  isActive(item.href)
                    ? 'bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
                onClick={() => setSidebarOpen(false)}
              >

                <Icon className="w-5 h-5" />

                <span>{item.name}</span>

                {isMessagesPage && unreadCount > 0 && (

                  <span className="absolute left-2 top-1/2 -translate-y-1/2 min-w-[20px] h-[20px] flex items-center justify-center bg-red-500 text-white text-xs rounded-full px-1">

                    {unreadCount > 9 ? '9+' : unreadCount}

                  </span>

                )}

              </Link>

            )

          })}

        </nav>

        {/* User info */}

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">

          <div className="flex items-center gap-3">

            {loadingDeveloper ? (

              <div className="w-10 h-10 bg-white/10 rounded-full animate-pulse"></div>

            ) : (

              <img
                src={developer?.avatar || '/default-avatar.png'}
                alt={developer?.full_name}
                className="w-10 h-10 rounded-full object-cover border-2 border-[#a855f7]/30"
                onError={(e) => (e.target.src = '/default-avatar.png')}
              />

            )}

            <div className="flex-1 min-w-0">

              {loadingDeveloper ? (

                <>
                  <div className="w-24 h-4 bg-white/10 rounded-lg animate-pulse mb-2"></div>
                  <div className="w-32 h-3 bg-white/10 rounded-lg animate-pulse"></div>
                </>

              ) : (

                <>
                  <p className="text-sm font-medium text-white truncate">

                    {developer?.full_name || 'User'}

                  </p>

                  <p className="text-xs text-gray-400 truncate">

                    {developer?.email}

                  </p>
                </>

              )}

            </div>

          </div>

        </div>

      </div>

      {/* Main */}

      <div className="lg:pl-64">

        {/* Navbar */}

        <header className="sticky top-0 z-30 bg-white/5 backdrop-blur-xl border-b border-white/10">

          <div className="flex items-center justify-between h-16 px-4">

            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg"
            >

              <Menu className="w-6 h-6" />

            </button>

            <div className="flex items-center gap-4 ml-auto">

              {/* Share */}

              <div className="relative">

                <button
                  onClick={copyPortfolioLink}
                  onMouseEnter={() => setShowShareTooltip(true)}
                  onMouseLeave={() => setShowShareTooltip(false)}
                  className="relative p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                >

                  {copied ? (

                    <Check className="w-5 h-5 text-green-400" />

                  ) : (

                    <Share2 className="w-5 h-5" />

                  )}

                </button>

              </div>

              {/* Notifications */}

              <button
                onClick={handleNotificationClick}
                className="relative p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg"
              >

                <Bell className="w-5 h-5" />

                {notificationsCount > 0 && (

                  <span className="absolute top-1 right-1 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-xs rounded-full px-1">

                    {notificationsCount > 9 ? '9+' : notificationsCount}

                  </span>

                )}

              </button>

            </div>

          </div>

        </header>

        <main className="p-6">

          <Outlet />

        </main>

      </div>

    </div>
  )
}

export default DashboardLayout
