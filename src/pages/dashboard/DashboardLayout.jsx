// DashboardLayout.jsx
import React, { useState, useEffect, useRef } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { messagesService, developersService } from '../../lib/supabase'
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
  const [unreadCount, setUnreadCount] = useState(0)
  const [showShareTooltip, setShowShareTooltip] = useState(false)
  const [copied, setCopied] = useState(false)
  const [essentialDataLoaded, setEssentialDataLoaded] = useState(false)
  const [loadingError, setLoadingError] = useState(null)
  const [retryCount, setRetryCount] = useState(0)
  
  const { user, logout, refreshUser } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const loadingRef = useRef(false)

  // دالة لجلب البيانات الأساسية بشكل إجباري
  const loadEssentialData = async () => {
    if (loadingRef.current || !user?.id) return
    
    loadingRef.current = true
    
    try {
      setLoadingError(null)
      
      // تحميل البيانات الأساسية للمستخدم
      const userData = await developersService.getById(user.id)
      if (userData) {
        // تحديث بيانات المستخدم في الـ Auth context
        await refreshUser(userData)
      }

      // تحميل عدد الرسائل غير المقروءة
      const count = await messagesService.getUnreadCount(user.id)
      setUnreadCount(count)

      // هنا يمكن إضافة المزيد من البيانات الأساسية
      // مثل: إشعارات، بيانات الخطة، إلخ
      
      setEssentialDataLoaded(true)
      
    } catch (error) {
      console.error('Error loading essential data:', error)
      setLoadingError(error.message)
      
      // محاولة إعادة التحميل إذا فشلت
      if (retryCount < 3) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1)
          loadingRef.current = false
        }, 2000 * (retryCount + 1)) // زيادة وقت الانتظار مع كل محاولة
      }
    } finally {
      loadingRef.current = false
    }
  }

  // تحميل البيانات الأساسية فوراً عند توفر المستخدم
  useEffect(() => {
    if (user?.id && !essentialDataLoaded && !loadingRef.current) {
      loadEssentialData()
    }
  }, [user?.id, essentialDataLoaded, retryCount])

  // إذا فشل التحميل 3 مرات، نعرض خطأ
  if (retryCount >= 3 && !essentialDataLoaded) {
    return (
      <div className="min-h-screen bg-[#030014] flex items-center justify-center">
        <div className="text-center max-w-md p-8">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">⚠️</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">فشل تحميل البيانات</h2>
          <p className="text-gray-400 mb-6">
            حدث خطأ في تحميل البيانات الأساسية. يرجى تحديث الصفحة أو المحاولة لاحقاً.
          </p>
          <button
            onClick={() => {
              setRetryCount(0)
              setEssentialDataLoaded(false)
              setLoadingError(null)
            }}
            className="px-6 py-3 bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white rounded-xl hover:opacity-90 transition-opacity"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    )
  }

  // أثناء تحميل البيانات الأساسية
  if (!essentialDataLoaded && user?.id) {
    return (
      <div className="min-h-screen bg-[#030014] flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-8">
            {/* Animated rings */}
            <div className="absolute inset-0 rounded-full animate-ping opacity-20 bg-gradient-to-r from-[#6366f1] to-[#a855f7]"></div>
            <div className="absolute inset-0 rounded-full animate-pulse opacity-40 bg-gradient-to-r from-[#6366f1] to-[#a855f7]"></div>
            
            {/* Logo or icon */}
            <div className="relative w-24 h-24 bg-gradient-to-r from-[#6366f1] to-[#a855f7] rounded-2xl flex items-center justify-center">
              <Loader2 className="w-12 h-12 text-white animate-spin" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-2">جاري تحميل لوحة التحكم</h2>
          <p className="text-gray-400 mb-4">
            يتم تحميل بياناتك الأساسية...
            {loadingError && (
              <span className="block text-red-400 mt-2 text-sm">
                خطأ: {loadingError} - جاري إعادة المحاولة ({retryCount + 1}/3)
              </span>
            )}
          </p>
          
          {/* Progress indicator */}
          <div className="w-64 h-2 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[#6366f1] to-[#a855f7] rounded-full transition-all duration-500"
              style={{ width: `${(retryCount + 1) * 33.33}%` }}
            ></div>
          </div>
        </div>
      </div>
    )
  }

  // بعد اكتمال التحميل، نعرض المحتوى
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

        {/* User info - الآن البيانات محملة بالكامل */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          <div className="flex items-center gap-3">
            <img
              src={user?.avatar || '/default-avatar.png'}
              alt={user?.full_name}
              className="w-10 h-10 rounded-full object-cover border-2 border-[#a855f7]/30"
              onError={(e) => {
                e.target.src = '/default-avatar.png'
              }}
            />
            
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.full_name || 'مستخدم'}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {user?.email || 'user@example.com'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top navbar */}
        <header className="sticky top-0 z-30 bg-white/5 backdrop-blur-xl border-b border-white/10">
          <div className="flex items-center justify-between h-16 px-4">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Right side */}
            <div className="flex items-center gap-4 ml-auto">
              
              {/* Share button */}
              <div className="relative">
                <button
                  onClick={copyPortfolioLink}
                  onMouseEnter={() => setShowShareTooltip(true)}
                  onMouseLeave={() => setShowShareTooltip(false)}
                  className="relative p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                  title="مشاركة الموقع"
                  disabled={!user?.username}
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
                >
                  <img
                    src={user?.avatar || '/default-avatar.png'}
                    alt={user?.full_name}
                    className="w-8 h-8 rounded-full object-cover"
                    onError={(e) => {
                      e.target.src = '/default-avatar.png'
                    }}
                  />
                  <span className="hidden sm:block text-sm">
                    {user?.full_name?.split(' ')[0] || 'User'}
                  </span>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {/* Dropdown menu */}
                {profileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-gray-900 border border-white/10 rounded-xl shadow-xl z-50">
                    <Link
                      to={`/u/${user?.username || ''}`}
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
