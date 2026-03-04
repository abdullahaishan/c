// DashboardLayout.jsx
import React, { useState, useEffect } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { messagesService } from '../../lib/supabase'
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

// ============================================
// مكون Skeleton للشريط الجانبي فقط (لأنه يعتمد على user)
// ============================================
const SidebarSkeleton = () => (
  <div className="fixed inset-y-0 left-0 w-64 bg-white/5 backdrop-blur-xl border-r border-white/10 z-50 lg:translate-x-0">
    {/* Logo Skeleton - هذا ثابت لكنه سهل */}
    <div className="h-16 flex items-center justify-center border-b border-white/10">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-gradient-to-r from-[#6366f1] to-[#a855f7] rounded-lg flex items-center justify-center">
          <span className="text-white font-bold">P</span>
        </div>
        <span className="text-xl font-bold text-white">Portfolio<span className="text-[#a855f7]">AI</span></span>
      </div>
    </div>

    {/* Navigation Skeleton - هذا ثابت */}
    <nav className="p-4 space-y-1">
      {[
        { name: 'Overview', icon: LayoutDashboard },
        { name: 'Projects', icon: FolderKanban },
        { name: 'Skills', icon: Code },
        { name: 'Certificates', icon: Award },
        { name: 'Experience', icon: Briefcase },
        { name: 'Education', icon: GraduationCap },
        { name: 'Messages', icon: MessageSquare },
        { name: 'AI Builder', icon: Sparkles },
        { name: 'Plan Status', icon: Crown },
        { name: 'Settings', icon: Settings },
      ].map((item, i) => {
        const Icon = item.icon
        return (
          <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400">
            <Icon className="w-5 h-5" />
            <span>{item.name}</span>
          </div>
        )
      })}
    </nav>

    {/* User Info Skeleton - هذه المنطقة فقط التي تحتاج تحميل */}
    <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-white/10 rounded-full animate-pulse"></div>
        <div className="flex-1">
          <div className="w-24 h-4 bg-white/10 rounded-lg animate-pulse mb-2"></div>
          <div className="w-32 h-3 bg-white/10 rounded-lg animate-pulse"></div>
        </div>
      </div>
    </div>
  </div>
)

// ============================================
// مكون للشريط العلوي مع تحميل تدريجي
// ============================================
const TopNavbar = ({ user, unreadCount, onNotificationClick, onShareClick, copied, showTooltip, setShowTooltip }) => {
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const navigate = useNavigate()

  const copyPortfolioLink = () => {
    if (!user?.username) return
    const portfolioUrl = `${window.location.origin}/u/${user.username}`
    navigator.clipboard.writeText(portfolioUrl)
    onShareClick()
  }

  const handleLogout = () => {
    // سيتم تنفيذ logout من الـ parent
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-30 bg-white/5 backdrop-blur-xl border-b border-white/10">
      <div className="flex items-center justify-between h-16 px-4">
        {/* Mobile menu button - ثابت */}
        <button className="lg:hidden p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg">
          <Menu className="w-6 h-6" />
        </button>

        {/* Right side */}
        <div className="flex items-center gap-4 ml-auto">
          
          {/* زر مشاركة الموقع - ثابت لكن معطّل مؤقتاً إذا لم يكن user */}
          <div className="relative">
            <button
              onClick={copyPortfolioLink}
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
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
            
            {/* Tooltip */}
            {showTooltip && !copied && (
              <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap border border-white/10">
                مشاركة الموقع
              </div>
            )}
            
            {/* رسالة تم النسخ */}
            {copied && (
              <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-green-600 text-white text-xs rounded-lg whitespace-nowrap">
                تم نسخ الرابط!
              </div>
            )}
          </div>

          {/* Notifications - ثابت لكن مع إظهار العدد الحقيقي */}
          <button 
            onClick={onNotificationClick}
            className="relative p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-xs rounded-full px-1">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Profile dropdown - يعرض Skeleton إذا كان user قيد التحميل */}
          {!user ? (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/10 rounded-full animate-pulse"></div>
              <div className="w-16 h-4 bg-white/10 rounded-lg animate-pulse hidden sm:block"></div>
            </div>
          ) : (
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
          )}
        </div>
      </div>
    </header>
  )
}

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [showShareTooltip, setShowShareTooltip] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showMobileSidebar, setShowMobileSidebar] = useState(false)
  
  const { user, logout, loading: authLoading } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  // جلب عدد الرسائل غير المقروءة - هذا يعتمد على user
  useEffect(() => {
    if (user) {
      fetchUnreadCount()
      
      const interval = setInterval(fetchUnreadCount, 30000)
      return () => clearInterval(interval)
    }
  }, [user])

  const fetchUnreadCount = async () => {
    if (!user) return
    
    try {
      const count = await messagesService.getUnreadCount(user.id)
      setUnreadCount(count)
    } catch (error) {
      console.error('Error fetching unread count:', error)
    }
  }

  const handleShareClick = () => {
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
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

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const handleNotificationClick = () => {
    navigate('/dashboard/messages')
  }

  const isActive = (path) => location.pathname === path

  // إذا كان لا يزال في حالة تحميل Auth فقط، نعرض Skeleton خفيف
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#030014]">
        {/* Sidebar مع Skeleton فقط لمنطقة user */}
        <SidebarSkeleton />
        
        {/* Main content مع Skeleton خفيف */}
        <div className="lg:pl-64">
          <TopNavbar 
            user={null}
            unreadCount={0}
            onNotificationClick={handleNotificationClick}
            onShareClick={handleShareClick}
            copied={copied}
            showTooltip={showShareTooltip}
            setShowTooltip={setShowShareTooltip}
          />
          <main className="p-6">
            <Outlet />
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#030014]">
      {/* Mobile sidebar backdrop */}
      {showMobileSidebar && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setShowMobileSidebar(false)}
        />
      )}

      {/* Sidebar - ثابت مع بيانات المستخدم */}
      <div
        className={`fixed inset-y-0 left-0 w-64 bg-white/5 backdrop-blur-xl border-r border-white/10 transform transition-transform duration-300 ease-in-out z-50 lg:translate-x-0 ${
          showMobileSidebar ? 'translate-x-0' : '-translate-x-full'
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
                onClick={() => setShowMobileSidebar(false)}
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

        {/* User info - يعرض Skeleton إذا كان user غير موجود */}
        {!user ? (
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 rounded-full animate-pulse"></div>
              <div className="flex-1">
                <div className="w-24 h-4 bg-white/10 rounded-lg animate-pulse mb-2"></div>
                <div className="w-32 h-3 bg-white/10 rounded-lg animate-pulse"></div>
              </div>
            </div>
          </div>
        ) : (
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
        )}
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top navbar - يعرض Skeleton لبعض العناصر إذا لزم الأمر */}
        <TopNavbar 
          user={user}
          unreadCount={unreadCount}
          onNotificationClick={handleNotificationClick}
          onShareClick={handleShareClick}
          copied={copied}
          showTooltip={showShareTooltip}
          setShowTooltip={setShowShareTooltip}
        />

        {/* Page content - هذا هو Outlet الذي سيعرض المحتوى الحقيقي */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>

      {/* زر فتح القائمة في الموبايل */}
      <button
        onClick={() => setShowMobileSidebar(true)}
        className="lg:hidden fixed bottom-4 left-4 z-40 p-3 bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white rounded-full shadow-lg"
      >
        <Menu className="w-6 h-6" />
      </button>
    </div>
  )
}

export default DashboardLayout
