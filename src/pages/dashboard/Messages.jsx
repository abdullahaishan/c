import React, { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { messagesService } from '../../lib/supabase'
import {
  Mail,
  MessageSquare,
  User,
  Calendar,
  CheckCircle,
  XCircle,
  Trash2,
  Reply,
  Loader,
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

const Messages = () => {
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedMessage, setSelectedMessage] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (user) {
      fetchMessages()
    }
  }, [user])

  const fetchMessages = async () => {
    setLoading(true)
    try {
      const data = await messagesService.getByDeveloperId(user.id)
      setMessages(data)
    } catch (err) {
      setError('فشل في جلب الرسائل')
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (messageId) => {
    try {
      await messagesService.markAsRead(messageId)
      setMessages(messages.map(m => 
        m.id === messageId ? { ...m, is_read: true } : m
      ))
      if (selectedMessage?.id === messageId) {
        setSelectedMessage({ ...selectedMessage, is_read: true })
      }
    } catch (err) {
      console.error('Error marking as read:', err)
    }
  }

  const handleDelete = async (messageId) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه الرسالة؟')) return
    try {
      await messagesService.delete(messageId)
      setMessages(messages.filter(m => m.id !== messageId))
      if (selectedMessage?.id === messageId) {
        setSelectedMessage(null)
      }
    } catch (err) {
      setError('فشل في حذف الرسالة')
    }
  }

  const handleReply = async () => {
    if (!replyText.trim()) return
    setSending(true)
    try {
      await messagesService.reply(selectedMessage.id, replyText)
      setReplyText('')
      alert('تم إرسال الرد بنجاح')
    } catch (err) {
      setError('فشل في إرسال الرد')
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030014] flex items-center justify-center">
        <Loader className="w-12 h-12 text-[#6366f1] animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">الرسائل</h1>
        <div className="text-sm text-gray-400">
          {messages.filter(m => !m.is_read).length} غير مقروءة
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
          <AlertCircle className="w-5 h-5" />
          <p>{error}</p>
        </div>
      )}

      {/* Messages Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Messages List */}
        <div className="lg:col-span-1 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
          <div className="p-4 border-b border-white/10">
            <h2 className="font-semibold text-white">جميع الرسائل</h2>
          </div>
          <div className="divide-y divide-white/10 max-h-[600px] overflow-y-auto">
            {messages.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <Mail className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>لا توجد رسائل بعد</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  onClick={() => setSelectedMessage(message)}
                  className={`p-4 cursor-pointer transition-all hover:bg-white/5 ${
                    selectedMessage?.id === message.id ? 'bg-white/10' : ''
                  } ${!message.is_read ? 'border-r-4 border-[#6366f1]' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      !message.is_read ? 'bg-[#6366f1]/20' : 'bg-white/10'
                    }`}>
                      <User className={`w-5 h-5 ${
                        !message.is_read ? 'text-[#6366f1]' : 'text-gray-400'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${
                        !message.is_read ? 'text-white' : 'text-gray-300'
                      }`}>
                        {message.sender_name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{message.subject || 'بدون موضوع'}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(message.created_at).toLocaleDateString('ar-SA')}
                      </p>
                    </div>
                    {!message.is_read && (
                      <span className="w-2 h-2 bg-[#6366f1] rounded-full"></span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Message Detail */}
        <div className="lg:col-span-2 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          {selectedMessage ? (
            <div className="space-y-6">
              {/* Header with actions */}
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">{selectedMessage.subject || 'بدون موضوع'}</h2>
                  <p className="text-sm text-gray-400">من: {selectedMessage.sender_name}</p>
                  {selectedMessage.sender_email && (
                    <p className="text-sm text-gray-400">البريد: {selectedMessage.sender_email}</p>
                  )}
                  {selectedMessage.sender_phone && (
                    <p className="text-sm text-gray-400">الهاتف: {selectedMessage.sender_phone}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                    <Calendar className="w-3 h-3" />
                    {new Date(selectedMessage.created_at).toLocaleString('ar-SA')}
                  </div>
                </div>
                <div className="flex gap-2">
                  {!selectedMessage.is_read && (
                    <button
                      onClick={() => handleMarkAsRead(selectedMessage.id)}
                      className="p-2 text-green-400 hover:bg-green-500/10 rounded-lg"
                      title="تحديد كمقروء"
                    >
                      <CheckCircle className="w-5 h-5" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(selectedMessage.id)}
                    className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg"
                    title="حذف"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Message body */}
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-gray-300 whitespace-pre-wrap">{selectedMessage.message}</p>
              </div>

              {/* Reply section */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-400">الرد على المرسل</h3>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="اكتب ردك هنا..."
                  rows="4"
                  className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white"
                />
                <button
                  onClick={handleReply}
                  disabled={sending || !replyText.trim()}
                  className="flex items-center gap-2 px-4 py-2 bg-[#6366f1] text-white rounded-lg hover:bg-[#a855f7] transition-all disabled:opacity-50"
                >
                  {sending ? <Loader className="w-4 h-4 animate-spin" /> : <Reply className="w-4 h-4" />}
                  إرسال الرد
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-96 text-center text-gray-400">
              <MessageSquare className="w-16 h-16 mb-4 opacity-50" />
              <p>اختر رسالة لعرضها</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Messages
