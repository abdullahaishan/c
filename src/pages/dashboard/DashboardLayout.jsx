// DashboardLayout.jsx
import React, { useState, useEffect, useCallback } from 'react'
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
  Loader
} from 'lucide-react'

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [showShareTooltip, setShowShareTooltip] = useState(false)
  const [copied, setCopied] = useState(false)
  
  // ✅ State للبيانات التي تحتاج تحميل
  const [userData, setUserData] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [loadingStates, setLoadingStates] = useState({
    user: true,
    notifications: true
  })
  
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  // ============================================
  // جلب بيانات المستخدم - إجباري فوراً
  // ============================================
  const fetchUserData = useCallback(async () => {
    if (!user?.id) {
      setLoadingStates(prev => ({ ...prev, user: false }))
      return
    }

    try {
      const { data, error } = await supabase
        .from('developers')
        .select('id, username, full_name, email, profile_image, avatar, plan_id')
        .eq('id', user.id)
        .single()

      if (error) throw error
      setUserData(data)
    } catch (error) {
      console.error('Error fetching user data:', error)
      // بيانات افتراضية في حالة الخطأ
      setUserData({
        username: user?.username || '',
        full_name: user?.full_name || 'مستخدم',
        email: user?.email || '',
        profile_image: null,
        avatar: null
      })
    } finally {
      setLoadingStates(prev => ({ ...prev, user: false }))
    }
  }, [user?.id])

  // ============================================
  // جلب الإشعارات - إجباري فوراً
  // ============================================
  const fetchNotifications = useCallback(async () => {
    if (!user?.id) {
      setLoadingStates(prev => ({ ...prev, notifications: false }))
      setUnreadCount(0)
      return
    }

    try {
      // جلب من جدول notifications فقط
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) throw error
      
      setNotifications(data || [])
      
      // حساب عدد الإشعارات غير المقروءة
      const unread = (data || []).filter(n => !n.is_read).length
      setUnreadCount(unread)

    } catch (error) {
      console.error('Error fetching notifications:', error)
      setNotifications([])
      setUnreadCount(0)
    } finally {
      setLoadingStates(prev => ({ ...prev, notifications: false }))
    }
  }, [user?.id])

  // ============================================
  // تحميل إجباري للبيانات فور تحميل الصفحة
  // ============================================
  useEffect(() => {
    // إعادة تعيين حالات التحميل
    setLoadingStates({
      user: true,
      notifications: true
    })
    
    // جلب البيانات فوراً
    fetchUserData()
    fetchNotifications()
    
    // تحديث دوري للإشعارات كل 30 ثانية
    const interval = setInterval(fetchNotifications, 30000)
    
    return () => clearInterval(interval)
  }, [user?.id, fetchUserData, fetchNotifications])

  // ============================================
  // تحديث حالة الإشعار كمقروء
  // ============================================
  const markNotificationAsRead = async (notificationId) => {
    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)

      // تحديث القائمة المحلية
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  // ============================================
  // دوال مساعدة
  // ============================================
  const copyPortfolioLink = () => {
    if (!userData?.username && !user?.username) return
    
    const username = userData?.username || user?.username
    const portfolioUrl = `${window.location.origin}/u/${username}`
    
    navigator.clipboard.writeText(portfolioUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleNotificationClick = (notification) => {
    markNotificationAsRead(notification.id)
    setNotificationsOpen(false)
    
    // توجيه حسب نوع الإشعار
    if (notification.type === 'payment' || notification.type?.includes('payment')) {
      navigate('/dashboard/plan-status')
    } else if (notification.type === 'message') {
      navigate('/dashboard/messages')
    } else {
      navigate('/dashboard/notifications')
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const isActive = (path) => location.pathname === path

  // ============================================
  // الحصول على البيانات (مع تحميل إجباري)
  // ============================================
  const getAvatarUrl = () => {
    if (userData?.profile_image) return userData.profile_image
    if (userData?.avatar) return userData.avatar
    return '/default-avatar.png'
  }

  const getDisplayName = () => {
    if (userData?.full_name) return userData.full_name
    if (user?.full_name) return user.full_name
    return 'مستخدم'
  }

  const getEmail = () => {
    if (userData?.email) return userData.email
    if (user?.email) return user.email
    return 'user@example.com'
  }

  const getUsername = () => {
    if (userData?.username) return userData.username
    if (user?.username) return user.username
    return ''
  }

  // ============================================
  // قائمة التنقل (ثابتة - لا تحتاج تحميل)
  // ============================================
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

  return (
    <div className="min-h-screen bg-[#030014]">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - الهيكل ثابت، فقط صورة المستخدم واسمه تتغير */}
      <div
        className={`fixed inset-y-0 left-0 w-64 bg-white/5 backdrop-blur-xl border-r border-white/10 transform transition-transform duration-300 ease-in-out z-50 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo - ثابت */}
        <div className="h-16 flex items-center justify-center border-b border-white/10">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-[#6366f1] to-[#a855f7] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">P</span>
            </div>
            <span className="text-xl font-bold text-white">Portfolio<span className="text-[#a855f7]">AI</span></span>
          </Link>
        </div>

        {/* Navigation - ثابت */}
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
                
                {/* عدد الرسائل - يظهر فقط بعد التحميل */}
                {isMessagesPage && !loadingStates.notifications && unreadCount > 0 && (
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 min-w-[20px] h-[20px] flex items-center justify-center bg-red-500 text-white text-xs rounded-full px-1">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* User info - هنا فقط Skeleton */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          <div className="flex items-center gap-3">
            {/* صورة المستخدم - Skeleton أو صورة */}
            {loadingStates.user ? (
              <div className="w-10 h-10 bg-white/10 rounded-full animate-pulse"></div>
            ) : (
              <img
                src={getAvatarUrl()}
                alt={getDisplayName()}
                className="w-10 h-10 rounded-full object-cover border-2 border-[#a855f7]/30"
                onError={(e) => {
                  e.target.src = '/default-avatar.png'
                }}
              />
            )}
            
            {/* اسم المستخدم وإيميله - Skeleton أو نص */}
            <div className="flex-1 min-w-0">
              {loadingStates.user ? (
                <>
                  <div className="w-24 h-4 bg-white/10 rounded-lg animate-pulse mb-2"></div>
                  <div className="w-32 h-3 bg-white/10 rounded-lg animate-pulse"></div>
                </>
              ) : (
                <>
                  <p className="text-sm font-medium text-white truncate">
                    {getDisplayName()}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {getEmail()}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main content - الهيكل ثابت */}
      <div className="lg:pl-64">
        {/* Top navbar - الهيكل ثابت */}
        <header className="sticky top-0 z-30 bg-white/5 backdrop-blur-xl border-b border-white/10">
          <div className="flex items-center justify-between h-16 px-4">
            {/* Mobile menu button - ثابت */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Right side - كلها ثابتة ما عدا البيانات التي تظهر بعد التحميل */}
            <div className="flex items-center gap-4 ml-auto">
              
              {/* زر مشاركة الموقع - ثابت */}
              <div className="relative">
                <button
                  onClick={copyPortfolioLink}
                  onMouseEnter={() => setShowShareTooltip(true)}
                  onMouseLeave={() => setShowShareTooltip(false)}
                  className="relative p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                  title="مشاركة الموقع"
                  disabled={!getUsername()}
                >
                  {copied ? (
                    <Check className="w-5 h-5 text-green-400" />
                  ) : (
                    <Share2 className="w-5 h-5" />
                  )}
                </button>
                
                {/* Tooltips - ثابتة */}
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

              {/* Notifications - هنا فقط Skeleton للإشعارات */}
              <div className="relative">
                <button 
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="relative p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg"
                >
                  <Bell className="w-5 h-5" />
                  {/* عداد الإشعارات - يظهر فقط بعد التحميل */}
                  {!loadingStates.notifications && unreadCount > 0 && (
                    <span className="absolute top-1 right-1 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-xs rounded-full px-1">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* قائمة الإشعارات - تظهر فقط بعد التحميل */}
                {notificationsOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setNotificationsOpen(false)}
                    />
                    <div className="absolute left-0 mt-2 w-80 bg-gray-900 border border-white/10 rounded-xl shadow-xl z-50 overflow-hidden">
                      <div className="p-3 border-b border-white/10 flex justify-between items-center">
                        <h3 className="text-white font-semibold">الإشعارات</h3>
                        {loadingStates.notifications && (
                          <Loader className="w-4 h-4 text-gray-400 animate-spin" />
                        )}
                      </div>
                      
                      <div className="max-h-96 overflow-y-auto">
                        {loadingStates.notifications ? (
                          // Skeleton للإشعارات
                          Array(3).fill(0).map((_, i) => (
                            <div key={i} className="p-3 border-b border-white/5">
                              <div className="flex items-start gap-3">
                                <div className="w-2 h-2 mt-2 bg-white/10 rounded-full animate-pulse"></div>
                                <div className="flex-1">
                                  <div className="h-4 w-32 bg-white/10 rounded-lg animate-pulse mb-2"></div>
                                  <div className="h-3 w-full bg-white/10 rounded-lg animate-pulse mb-1"></div>
                                  <div className="h-3 w-3/4 bg-white/10 rounded-lg animate-pulse"></div>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : notifications.length === 0 ? (
                          <div className="p-4 text-center text-gray-400">
                            لا توجد إشعارات
                          </div>
                        ) : (
                          notifications.map((notif) => (
                            <button
                              key={notif.id}
                              onClick={() => handleNotificationClick(notif)}
                              className={`w-full p-3 text-right hover:bg-white/5 transition-all border-b border-white/5 last:border-0 ${
                                !notif.is_read ? 'bg-blue-500/5' : ''
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <div className={`w-2 h-2 mt-2 rounded-full flex-shrink-0 ${
                                  !notif.is_read ? 'bg-blue-400' : 'bg-transparent'
                                }`} />
                                <div className="flex-1">
                                  <h4 className="text-sm font-semibold text-white mb-1">
                                    {notif.title}
                                  </h4>
                                  <p className="text-xs text-gray-400 line-clamp-2">
                                    {notif.message}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {new Date(notif.created_at).toLocaleDateString('ar')}
                                  </p>
                                </div>
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                      
                      {/* رابط عرض الكل - ثابت */}
                      <div className="p-2 border-t border-white/10">
                        <Link
                          to="/dashboard/notifications"
                          onClick={() => setNotificationsOpen(false)}
                          className="block w-full p-2 text-center text-sm text-[#a855f7] hover:bg-white/5 rounded-lg"
                        >
                          عرض كل الإشعارات
                        </Link>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Profile dropdown - هنا Skeleton للصورة والاسم فقط */}
              <div className="relative">
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex items-center gap-2 p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg"
                >
                  {loadingStates.user ? (
                    <>
                      <div className="w-8 h-8 bg-white/10 rounded-full animate-pulse"></div>
                      <div className="w-16 h-4 bg-white/10 rounded-lg animate-pulse hidden sm:block"></div>
                    </>
                  ) : (
                    <>
                      <img
                        src={getAvatarUrl()}
                        alt={getDisplayName()}
                        className="w-8 h-8 rounded-full object-cover"
                        onError={(e) => {
                          e.target.src = '/default-avatar.png'
                        }}
                      />
                      <span className="hidden sm:block text-sm">
                        {getDisplayName().split(' ')[0] || 'User'}
                      </span>
                    </>
                  )}
                  <ChevronDown className="w-4 h-4" />
                </button>

                {/* Dropdown menu - ثابت */}
                {profileMenuOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setProfileMenuOpen(false)}
                    />
                    <div className="absolute left-0 mt-2 w-48 bg-gray-900 border border-white/10 rounded-xl shadow-xl z-50">
                      <Link
                        to={`/u/${getUsername()}`}
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
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page content - يظهر فوراً */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout
