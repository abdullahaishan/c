// src/pages/dashboard/Notifications.jsx
import React, { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabase'
import { useNavigate } from 'react-router-dom'
import {
  Bell,
  Check,
  X,
  AlertCircle,
  Info,
  CheckCircle,
  Clock,
  Calendar,
  Trash2,
  CheckCheck,
  RefreshCw,
  MessageSquare,
  CreditCard,
  Crown,
  UserPlus,
  Settings,
  Shield,
  Award,
  Loader,
  Eye
} from 'lucide-react'

const Notifications = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all') // all, unread, read
  const [typeFilter, setTypeFilter] = useState('all') // all, info, warning, success, payment, message

  useEffect(() => {
    if (user) {
      fetchNotifications()
      
      // استماع للتغييرات في الوقت الفعلي
      const subscription = supabase
        .channel('notifications_channel')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            // إضافة الإشعار الجديد إلى القائمة
            setNotifications(prev => [payload.new, ...prev])
          }
        )
        .subscribe()

      return () => {
        subscription.unsubscribe()
      }
    }
  }, [user])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setNotifications(data || [])
    } catch (err) {
      console.error('Error fetching notifications:', err)
      setError('فشل في تحميل الإشعارات')
    } finally {
      setLoading(false)
    }
  }

  // ✅ دالة تحديث الإشعار كمقروء
  const markAsRead = async (notificationId) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ 
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('id', notificationId)

      if (error) throw error

      // تحديث الحالة المحلية
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId
            ? { ...notif, is_read: true, read_at: new Date().toISOString() }
            : notif
        )
      )
    } catch (err) {
      console.error('Error marking notification as read:', err)
    }
  }

  // ✅ تحديث الكل كمقروء
  const markAllAsRead = async () => {
    try {
      const unreadIds = notifications
        .filter(n => !n.is_read)
        .map(n => n.id)

      if (unreadIds.length === 0) return

      const { error } = await supabase
        .from('notifications')
        .update({ 
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('is_read', false)

      if (error) throw error

      setNotifications(prev =>
        prev.map(notif => ({ ...notif, is_read: true, read_at: new Date().toISOString() }))
      )
    } catch (err) {
      console.error('Error marking all as read:', err)
    }
  }

  // ✅ حذف إشعار
  const deleteNotification = async (notificationId) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)

      if (error) throw error

      setNotifications(prev => prev.filter(n => n.id !== notificationId))
    } catch (err) {
      console.error('Error deleting notification:', err)
    }
  }

  // ✅ حذف الكل
  const deleteAllRead = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', user.id)
        .eq('is_read', true)

      if (error) throw error

      setNotifications(prev => prev.filter(n => !n.is_read))
    } catch (err) {
      console.error('Error deleting read notifications:', err)
    }
  }

  // ✅ فلترة الإشعارات
  const getFilteredNotifications = () => {
    let filtered = [...notifications]

    // فلترة حسب حالة القراءة
    if (filter === 'unread') {
      filtered = filtered.filter(n => !n.is_read)
    } else if (filter === 'read') {
      filtered = filtered.filter(n => n.is_read)
    }

    // فلترة حسب النوع
    if (typeFilter !== 'all') {
      filtered = filtered.filter(n => n.type === typeFilter)
    }

    return filtered
  }

  // ✅ الحصول على أيقونة حسب نوع الإشعار
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
      case 'payment_success':
        return <CheckCircle className="w-5 h-5 text-green-400" />
      case 'warning':
      case 'payment_failed':
        return <AlertCircle className="w-5 h-5 text-yellow-400" />
      case 'error':
        return <X className="w-5 h-5 text-red-400" />
      case 'payment':
      case 'payment_request':
        return <CreditCard className="w-5 h-5 text-purple-400" />
      case 'message':
        return <MessageSquare className="w-5 h-5 text-blue-400" />
      case 'plan':
      case 'plan_upgrade':
        return <Crown className="w-5 h-5 text-yellow-400" />
      case 'user':
      case 'new_user':
        return <UserPlus className="w-5 h-5 text-green-400" />
      case 'security':
        return <Shield className="w-5 h-5 text-blue-400" />
      case 'achievement':
        return <Award className="w-5 h-5 text-orange-400" />
      case 'settings':
        return <Settings className="w-5 h-5 text-gray-400" />
      default:
        return <Info className="w-5 h-5 text-blue-400" />
    }
  }

  // ✅ الحصول على لون الخلفية حسب النوع
  const getNotificationBgColor = (type, isRead) => {
    if (isRead) return 'bg-white/5'

    switch (type) {
      case 'success':
      case 'payment_success':
        return 'bg-green-500/10 border-green-500/20'
      case 'warning':
      case 'payment_failed':
        return 'bg-yellow-500/10 border-yellow-500/20'
      case 'error':
        return 'bg-red-500/10 border-red-500/20'
      case 'payment':
      case 'payment_request':
        return 'bg-purple-500/10 border-purple-500/20'
      case 'message':
        return 'bg-blue-500/10 border-blue-500/20'
      case 'plan':
      case 'plan_upgrade':
        return 'bg-yellow-500/10 border-yellow-500/20'
      default:
        return 'bg-blue-500/10 border-blue-500/20'
    }
  }

  const filteredNotifications = getFilteredNotifications()
  const unreadCount = notifications.filter(n => !n.is_read).length

  // تنسيق التاريخ
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'الآن'
    if (diffMins < 60) return `منذ ${diffMins} دقيقة`
    if (diffHours < 24) return `منذ ${diffHours} ساعة`
    if (diffDays < 7) return `منذ ${diffDays} يوم`
    
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-[#6366f1] animate-spin mx-auto mb-4" />
          <p className="text-gray-400">جاري تحميل الإشعارات...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center max-w-md p-8 bg-red-500/10 rounded-2xl border border-red-500/20">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">خطأ في التحميل</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={fetchNotifications}
            className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            إعادة المحاولة
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Bell className="w-6 h-6 text-[#a855f7]" />
          الإشعارات
          {unreadCount > 0 && (
            <span className="px-2 py-1 bg-red-500/20 text-red-400 text-sm rounded-full">
              {unreadCount} غير مقروءة
            </span>
          )}
        </h1>
        
        <div className="flex items-center gap-2">
          {/* تحديث */}
          <button
            onClick={fetchNotifications}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
            title="تحديث"
          >
            <RefreshCw className="w-5 h-5" />
          </button>

          {/* تحديد الكل كمقروء */}
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all text-sm text-gray-300"
            >
              <CheckCheck className="w-4 h-4" />
              تحديد الكل كمقروء
            </button>
          )}

          {/* حذف المقروءة */}
          {notifications.filter(n => n.is_read).length > 0 && (
            <button
              onClick={deleteAllRead}
              className="flex items-center gap-2 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-all text-sm text-red-400"
            >
              <Trash2 className="w-4 h-4" />
              حذف المقروءة
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        {/* فلترة حالة القراءة */}
        <div className="flex gap-2 p-1 bg-white/5 rounded-lg">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm transition-all ${
              filter === 'all'
                ? 'bg-[#6366f1] text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            الكل
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-lg text-sm transition-all ${
              filter === 'unread'
                ? 'bg-[#6366f1] text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            غير مقروءة
          </button>
          <button
            onClick={() => setFilter('read')}
            className={`px-4 py-2 rounded-lg text-sm transition-all ${
              filter === 'read'
                ? 'bg-[#6366f1] text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            مقروءة
          </button>
        </div>

        {/* فلترة النوع */}
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-gray-300 text-sm"
        >
          <option value="all">جميع الأنواع</option>
          <option value="info">معلومات</option>
          <option value="success">نجاح</option>
          <option value="warning">تحذير</option>
          <option value="error">خطأ</option>
          <option value="payment">مدفوعات</option>
          <option value="message">رسائل</option>
          <option value="plan">الباقات</option>
        </select>
      </div>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <div className="text-center py-16 bg-white/5 rounded-2xl border border-white/10">
          <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4 opacity-50" />
          <h3 className="text-xl text-white mb-2">لا توجد إشعارات</h3>
          <p className="text-gray-400">
            {filter === 'all' 
              ? 'ليس لديك أي إشعارات حالياً'
              : filter === 'unread'
              ? 'ليس لديك إشعارات غير مقروءة'
              : 'ليس لديك إشعارات مقروءة'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`group relative p-4 rounded-xl border transition-all ${
                getNotificationBgColor(notification.type, notification.is_read)
              } ${!notification.is_read ? 'shadow-lg shadow-purple-500/5' : ''}`}
            >
              <div className="flex items-start gap-4">
                {/* الأيقونة */}
                <div className="flex-shrink-0">
                  {getNotificationIcon(notification.type)}
                </div>

                {/* المحتوى */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className={`font-semibold mb-1 ${
                        notification.is_read ? 'text-gray-400' : 'text-white'
                      }`}>
                        {notification.title}
                      </h3>
                      <p className="text-sm text-gray-400 mb-2">
                        {notification.message}
                      </p>
                      
                      {/* البيانات الوصفية (metadata) */}
                      {notification.metadata && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {notification.metadata.plan_name && (
                            <span className="px-2 py-1 bg-white/5 rounded-lg text-xs text-gray-300">
                              📦 {notification.metadata.plan_name}
                            </span>
                          )}
                          {notification.metadata.amount && (
                            <span className="px-2 py-1 bg-white/5 rounded-lg text-xs text-gray-300">
                              💰 {notification.metadata.amount} {notification.metadata.currency}
                            </span>
                          )}
                          {notification.metadata.payment_method && (
                            <span className="px-2 py-1 bg-white/5 rounded-lg text-xs text-gray-300">
                              💳 {notification.metadata.payment_method}
                            </span>
                          )}
                        </div>
                      )}

                      {/* التاريخ */}
                      <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span>{formatDate(notification.created_at)}</span>
                        {notification.read_at && (
                          <>
                            <Eye className="w-3 h-3 mr-2" />
                            <span>مقروءة {formatDate(notification.read_at)}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* أزرار الإجراءات */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!notification.is_read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="p-2 text-gray-400 hover:text-green-400 hover:bg-white/5 rounded-lg transition-all"
                          title="تحديد كمقروء"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="p-2 text-gray-400 hover:text-red-400 hover:bg-white/5 rounded-lg transition-all"
                        title="حذف"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Notifications
