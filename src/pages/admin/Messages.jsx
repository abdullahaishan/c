import React, { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import { useAdminAuth } from '../../hooks/useAdminAuth'
import {
  Mail,
  MessageCircle,
  User,
  Calendar,
  CheckCircle,
  XCircle,
  Eye,
  Trash2,
  Reply,
  AlertCircle,
  Search,
  Filter,
  Clock,
  Loader,
  Check,
  X,
  Send,
  UserCircle2
} from 'lucide-react'

const Messages = () => {
  const { admin } = useAdminAuth()
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(0)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [selectedMessage, setSelectedMessage] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [showReplyModal, setShowReplyModal] = useState(false)
  const [sending, setSending] = useState(false)
  const observerRef = useRef()

  useEffect(() => {
    loadMessages(0)
  }, [])

  const loadMessages = async (pageNum, searchTerm = search, filterType = filter) => {
    if (loading && pageNum > 0) return
    
    setLoading(true)
    try {
      let query = supabase
        .from('messages')
        .select(`
          *,
          developers (
            id,
            full_name,
            username,
            email,
            profile_image
          )
        `, { count: 'exact' })
        .order('created_at', { ascending: false })

      // تطبيق الفلتر
      if (filterType === 'unread') {
        query = query.eq('is_read', false)
      } else if (filterType === 'read') {
        query = query.eq('is_read', true)
      }

      // تطبيق البحث
      if (searchTerm) {
        query = query.or(`
          sender_name.ilike.%${searchTerm}%,
          sender_email.ilike.%${searchTerm}%,
          message.ilike.%${searchTerm}%,
          subject.ilike.%${searchTerm}%
        `)
      }

      const from = pageNum * 20
      const to = from + 19
      
      const { data, error, count } = await query
        .range(from, to)

      if (error) throw error

      if (pageNum === 0) {
        setMessages(data || [])
      } else {
        setMessages(prev => [...prev, ...(data || [])])
      }
      
      setHasMore((from + 20) < (count || 0))
      setTotal(count || 0)
      setPage(pageNum)
    } catch (error) {
      console.error('Error loading messages:', error)
    } finally {
      setLoading(false)
    }
  }

  // البحث مع debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      loadMessages(0, search, filter)
    }, 500)

    return () => clearTimeout(timer)
  }, [search, filter])

  // Infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0]
        if (first.isIntersecting && hasMore && !loading) {
          loadMessages(page + 1, search, filter)
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    )

    const currentObserver = observerRef.current
    if (currentObserver) {
      observer.observe(currentObserver)
    }

    return () => {
      if (currentObserver) {
        observer.unobserve(currentObserver)
      }
    }
  }, [hasMore, loading, page, search, filter])

  const handleMarkAsRead = async (id) => {
    try {
      await supabase
        .from('messages')
        .update({ 
          is_read: true, 
          read_at: new Date().toISOString() 
        })
        .eq('id', id)
      
      setMessages(prev => prev.map(msg => 
        msg.id === id ? { ...msg, is_read: true, read_at: new Date().toISOString() } : msg
      ))
    } catch (error) {
      console.error('Error marking as read:', error)
    }
  }

  const handleMarkAsUnread = async (id) => {
    try {
      await supabase
        .from('messages')
        .update({ 
          is_read: false, 
          read_at: null 
        })
        .eq('id', id)
      
      setMessages(prev => prev.map(msg => 
        msg.id === id ? { ...msg, is_read: false, read_at: null } : msg
      ))
    } catch (error) {
      console.error('Error marking as unread:', error)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه الرسالة؟')) return
    
    try {
      await supabase
        .from('messages')
        .delete()
        .eq('id', id)
      
      setMessages(prev => prev.filter(msg => msg.id !== id))
      setTotal(prev => prev - 1)
    } catch (error) {
      console.error('Error deleting message:', error)
      alert('حدث خطأ أثناء حذف الرسالة')
    }
  }

  const handleReply = (message) => {
    setSelectedMessage(message)
    setReplyText(`\n\n---\nالرسالة الأصلية:\n${message.message}`)
    setShowReplyModal(true)
  }

  const sendReply = async () => {
    if (!replyText.trim()) return
    
    setSending(true)
    try {
      // هنا يمكن إضافة خدمة إرسال البريد الإلكتروني
      console.log('Sending reply to:', selectedMessage.sender_email)
      console.log('Reply content:', replyText)
      
      // تسجيل الرد في قاعدة البيانات (اختياري)
      await supabase
        .from('message_replies')
        .insert([{
          message_id: selectedMessage.id,
          admin_id: admin.id,
          reply: replyText,
          created_at: new Date().toISOString()
        }])

      alert('✅ تم إرسال الرد بنجاح')
      setShowReplyModal(false)
      setReplyText('')
    } catch (error) {
      console.error('Error sending reply:', error)
      alert('❌ فشل إرسال الرد')
    } finally {
      setSending(false)
    }
  }

  const getTimeAgo = (date) => {
    const now = new Date()
    const then = new Date(date)
    const diff = now - then
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `منذ ${days} يوم`
    if (hours > 0) return `منذ ${hours} ساعة`
    if (minutes > 0) return `منذ ${minutes} دقيقة`
    return 'الآن'
  }

  const unreadCount = messages.filter(m => !m.is_read).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">الرسائل</h1>
          <p className="text-sm text-gray-400 mt-1">إدارة جميع الرسائل الواردة من المطورين</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-blue-500/10 px-4 py-2 rounded-xl border border-blue-500/20">
            <span className="text-2xl font-bold text-blue-400">{unreadCount}</span>
            <span className="text-sm text-gray-400 mr-2">غير مقروءة</span>
          </div>
          <div className="bg-white/5 px-4 py-2 rounded-xl border border-white/10">
            <span className="text-2xl font-bold text-white">{total}</span>
            <span className="text-sm text-gray-400 mr-2">إجمالي</span>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="بحث في الرسائل..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
        >
          <option value="all">جميع الرسائل</option>
          <option value="unread">غير مقروءة</option>
          <option value="read">مقروءة</option>
        </select>
      </div>

      {/* Messages List */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
        {loading && page === 0 ? (
          <div className="text-center py-12">
            <Loader className="w-12 h-12 animate-spin text-purple-400 mx-auto mb-4" />
            <p className="text-gray-400">جاري تحميل الرسائل...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12">
            <Mail className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">لا توجد رسائل</p>
          </div>
        ) : (
          <div className="divide-y divide-white/10">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`p-6 hover:bg-white/5 transition ${
                  !msg.is_read ? 'bg-blue-500/5' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Sender Avatar */}
                  <div className="relative">
                    {msg.profile_image ? (
                      <img
                        src={msg.profile_image}
                        alt={msg.sender_name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : msg.developers?.profile_image ? (
                      <img
                        src={msg.developers.profile_image}
                        alt={msg.sender_name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#6366f1] to-[#a855f7] flex items-center justify-center">
                        <User className="w-6 h-6 text-white" />
                      </div>
                    )}
                    {!msg.is_read && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-[#030014]" />
                    )}
                  </div>

                  {/* Message Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-white font-semibold">
                            {msg.sender_name}
                          </h3>
                          {msg.developers && (
                            <span className="text-xs px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded-full">
                              مطور
                            </span>
                          )}
                          {!msg.is_read && (
                            <span className="text-xs text-blue-400">جديد</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-400">{msg.sender_email}</p>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Clock className="w-3 h-3" />
                        <span>{getTimeAgo(msg.created_at)}</span>
                      </div>
                    </div>

                    {msg.subject && (
                      <p className="text-sm font-medium text-purple-400 mt-2">
                        الموضوع: {msg.subject}
                      </p>
                    )}

                    <p className="text-gray-300 mt-2 whitespace-pre-line">
                      {msg.message}
                    </p>

                    {msg.developers && (
                      <div className="mt-3 p-3 bg-white/5 rounded-lg border border-white/10">
                        <p className="text-xs text-gray-400">مطور:</p>
                        <p className="text-sm text-white">
                          {msg.developers.full_name} (@{msg.developers.username})
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-4">
                      {!msg.is_read ? (
                        <button
                          onClick={() => handleMarkAsRead(msg.id)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20 text-sm"
                        >
                          <Check className="w-4 h-4" />
                          تحديد كمقروءة
                        </button>
                      ) : (
                        <button
                          onClick={() => handleMarkAsUnread(msg.id)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-yellow-500/10 text-yellow-400 rounded-lg hover:bg-yellow-500/20 text-sm"
                        >
                          <Eye className="w-4 h-4" />
                          تحديد كغير مقروءة
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleReply(msg)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-green-500/10 text-green-400 rounded-lg hover:bg-green-500/20 text-sm"
                      >
                        <Reply className="w-4 h-4" />
                        رد
                      </button>
                      
                      <button
                        onClick={() => handleDelete(msg.id)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 text-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                        حذف
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Loading Indicator */}
      <div ref={observerRef} className="h-10 flex justify-center">
        {loading && page > 0 && (
          <Loader className="w-6 h-6 animate-spin text-purple-400" />
        )}
      </div>

      {/* No More Data */}
      {!hasMore && messages.length > 0 && (
        <p className="text-center text-gray-500 py-4">
          تم تحميل جميع الرسائل ({messages.length} من {total})
        </p>
      )}

      {/* Reply Modal */}
      {showReplyModal && selectedMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-[#030014] rounded-2xl border border-white/10 max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">رد على {selectedMessage.sender_name}</h2>
              <button
                onClick={() => setShowReplyModal(false)}
                className="p-2 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Original Message Preview */}
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <p className="text-xs text-gray-400 mb-2">الرسالة الأصلية:</p>
                <p className="text-sm text-gray-300 line-clamp-3">{selectedMessage.message}</p>
              </div>

              {/* To */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">إلى:</label>
                <div className="flex items-center gap-2 p-3 bg-white/5 rounded-lg">
                  <Mail className="w-4 h-4 text-purple-400" />
                  <span className="text-white">{selectedMessage.sender_email}</span>
                </div>
              </div>

              {/* Reply Content */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">الرد:</label>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows="6"
                  className="w-full p-3 bg-white/5 border border-white/20 rounded-lg text-white resize-none"
                  placeholder="اكتب ردك هنا..."
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={sendReply}
                  disabled={sending || !replyText.trim()}
                  className="flex-1 py-3 bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white rounded-xl font-semibold hover:scale-[1.02] transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {sending ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      جاري الإرسال...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      إرسال الرد
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowReplyModal(false)}
                  className="flex-1 py-3 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/20 transition"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Messages
