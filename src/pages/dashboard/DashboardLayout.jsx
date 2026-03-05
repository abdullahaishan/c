// DashboardLayout.jsx
import React, { useState, useEffect } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabase'
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
  Loader2
} from 'lucide-react'

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [showShareTooltip, setShowShareTooltip] = useState(false)
  const [copied, setCopied] = useState(false)
  
  // حالات التحميل
  const [isLoading, setIsLoading] = useState(true)
  const [loadingError, setLoadingError] = useState(null)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [authChecked, setAuthChecked] = useState(false)
  
  // البيانات الكاملة
  const [developerData, setDeveloperData] = useState(null)
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0) // ✅ فقط الإشعارات
  
  const { user, loading: authLoading } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  // =========== التحقق من المصادقة أولاً ===========
  
  useEffect(() => {
    if (!authLoading) {
      setAuthChecked(true)
      if (!user) {
        navigate('/login', { state: { from: location.pathname } })
      }
    }
  }, [authLoading, user, navigate, location])

  // =========== دوال جلب البيانات من Supabase ===========
  
  const fetchDeveloperData = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('developers')
        .select(`
          *,
          plan:plans(*)
        `)
        .eq('id', userId)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching developer data:', error)
      throw error
    }
  }

  // ✅ دالة جلب عدد الإشعارات غير المقروءة فقط
  const fetchUnreadNotificationsCount = async (userId) => {
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false)

      if (error) throw error
      return count || 0
    } catch (error) {
      console.error('Error fetching unread notifications:', error)
      return 0
    }
  }

  // =========== تحميل البيانات بعد التأكد من وجود مستخدم ===========
  
  useEffect(() => {
    const loadAllEssentialData = async () => {
      if (!user?.id || !authChecked) return

      try {
        setIsLoading(true)
        setLoadingError(null)
        setLoadingProgress(10)

        // 1. جلب بيانات المطور كاملة
        setLoadingProgress(30)
        const developerFullData = await fetchDeveloperData(user.id)
        setDeveloperData(developerFullData)
        
        // 2. جلب عدد الإشعارات فقط (بدون رسائل)
        setLoadingProgress(60)
        const notificationsCount = await fetchUnreadNotificationsCount(user.id)
        setUnreadNotificationsCount(notificationsCount)

        // اكتمل التحميل
        setLoadingProgress(100)
        setTimeout(() => {
          setIsLoading(false)
        }, 500)

      } catch (error) {
        console.error('Error loading essential data:', error)
        setLoadingError(error.message)
        setIsLoading(false)
      }
    }

    loadAllEssentialData()
  }, [user?.id, authChecked])

  // =========== تحديث دوري للإشعارات ===========
  useEffect(() => {
    if (user?.id && !isLoading) {
      const interval = setInterval(async () => {
        const count = await fetchUnreadNotificationsCount(user.id)
        setUnreadNotificationsCount(count)
      }, 30000) // كل 30 ثانية
      
      return () => clearInterval(interval)
    }
  }, [user?.id, isLoading])

  // =========== إذا كانت المصادقة لا تزال تحمل ===========
  
  if (authLoading || !authChecked) {
    return (
      <div className="min-h-screen bg-[#030014] flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-8 mx-auto w-24 h-24">
            <div className="absolute inset-0 rounded-full border-4 border-t-transparent border-[#6366f1] animate-spin"></div>
            <div className="absolute inset-2 rounded-full border-4 border-t-transparent border-[#a855f7] animate-spin-slow"></div>
            <div className="absolute inset-4 rounded-full border-4 border-t-transparent border-[#ec4899] animate-spin-slower"></div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">جاري التحقق من الجلسة</h2>
          <p className="text-gray-400">الرجاء الانتظار...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#030014] flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="relative mb-8 mx-auto w-32 h-32">
            <div className="absolute inset-0 rounded-full border-4 border-t-transparent border-[#6366f1] animate-spin"></div>
            <div className="absolute inset-2 rounded-full border-4 border-t-transparent border-[#a855f7] animate-spin-slow"></div>
            <div className="absolute inset-4 rounded-full border-4 border-t-transparent border-[#ec4899] animate-spin-slower"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 bg-gradient-to-r from-[#6366f1] to-[#a855f7] rounded-2xl flex items-center justify-center shadow-2xl">
                <span className="text-3xl font-bold text-white">P</span>
              </div>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-white mb-3">
            Portfolio<span className="text-[#a855f7]">V5</span>
          </h1>
          
          <p className="text-gray-400 mb-6">
            مرحباً بعودتك! جاري تجهيز لوحة التحكم...
          </p>

          <div className="w-full max-w-sm mx-auto mb-4">
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>جاري التحميل</span>
              <span>{loadingProgress}%</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#6366f1] to-[#a855f7] rounded-full transition-all duration-500 ease-out"
                style={{ width: `${loadingProgress}%` }}
              />
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-gray-400">
              <div className={`w-4 h-4 rounded-full flex items-center justify-center ${loadingProgress >= 30 ? 'bg-green-500' : 'bg-white/20'}`}>
                {loadingProgress >= 30 && <span className="text-white text-xs">✓</span>}
              </div>
              <span>بيانات المطور الشخصية</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <div className={`w-4 h-4 rounded-full flex items-center justify-center ${loadingProgress >= 60 ? 'bg-green-500' : 'bg-white/20'}`}>
                {loadingProgress >= 60 && <span className="text-white text-xs">✓</span>}
              </div>
              <span>الإشعارات</span>
            </div>
          </div>

          {loadingError && (
            <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-sm mb-2">{loadingError}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
              >
                إعادة المحاولة
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (loadingError) {
    return (
      <div className="min-h-screen bg-[#030014] flex items-center justify-center">
        <div className="text-center max-w-md p-8">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">فشل تحميل البيانات</h2>
          <p className="text-gray-400 mb-6">{loadingError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white rounded-xl hover:opacity-90 transition-opacity"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    )
  }

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

  const isActive = (path) => location.pathname === path

  const copyPortfolioLink = () => {
    if (!developerData?.username) return
    const portfolioUrl = `${window.location.origin}/u/${developerData.username}`
    navigator.clipboard.writeText(portfolioUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-[#030014]">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div
        className={`fixed inset-y-0 left-0 w-64 bg-white/5 backdrop-blur-xl border-r border-white/10 transform transition-transform duration-300 ease-in-out z-50 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-16 flex items-center justify-center border-b border-white/10">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-[#6366f1] to-[#a855f7] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">P</span>
            </div>
            <span className="text-xl font-bold text-white">Portfolio<span className="text-[#a855f7]">V5</span></span>
          </Link>
        </div>

        <nav className="p-4 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon
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
              </Link>
            )
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          <div className="flex items-center gap-3">
            <img
              src={developerData?.profile_image || '/default-avatar.png'}
              alt={developerData?.full_name}
              className="w-10 h-10 rounded-full object-cover border-2 border-[#a855f7]/30"
              onError={(e) => { e.target.src = '/default-avatar.png' }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {developerData?.full_name || 'مستخدم'}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {developerData?.email || ''}
              </p>
              {developerData?.plan && (
                <p className="text-xs text-[#a855f7] truncate">
                  خطة {developerData.plan.name}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 bg-white/5 backdrop-blur-xl border-b border-white/10">
          <div className="flex items-center justify-between h-16 px-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="flex items-center gap-4 ml-auto">
              <div className="relative">
                <button
                  onClick={copyPortfolioLink}
                  onMouseEnter={() => setShowShareTooltip(true)}
                  onMouseLeave={() => setShowShareTooltip(false)}
                  className="relative p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                  disabled={!developerData?.username}
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

              {/* ✅ زر الإشعارات مع العداد */}
              <button 
                onClick={() => navigate('./Notifications')}
                className="relative p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg"
              >
                <Bell className="w-5 h-5" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-xs rounded-full px-1">
                    {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                  </span>
                )}
              </button>

              <div className="relative">
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex items-center gap-2 p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg"
                >
                  <img
                    src={developerData?.profile_image || '/default-avatar.png'}
                    alt={developerData?.full_name}
                    className="w-8 h-8 rounded-full object-cover"
                    onError={(e) => { e.target.src = '/default-avatar.png' }}
                  />
                  <span className="hidden sm:block text-sm">
                    {developerData?.full_name?.split(' ')[0] || 'User'}
                  </span>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {profileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-gray-900 border border-white/10 rounded-xl shadow-xl z-50">
                    <Link
                      to={`/u/${developerData?.username || ''}`}
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
                      onClick={() => {
                        supabase.auth.signOut()
                        navigate('/')
                      }}
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

        <main className="p-6">
          <Outlet context={{ developerData, unreadNotificationsCount }} />
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout
