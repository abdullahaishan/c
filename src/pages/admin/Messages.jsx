import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
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
  Star,
  Clock
} from 'lucide-react'

const Messages = () => {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all') // all, unread, read
  const [selectedMessage, setSelectedMessage] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [showReplyModal, setShowReplyModal] = useState(false)

  useEffect(() => {
    fetchMessages()
  }, [])

  const fetchMessages = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        developers (
          id,
          full_name,
          username,
          profile_image,
          email
        )
      `)
      .order('created_at', { ascending: false })

    if (!error) setMessages(data || [])
    setLoading(false)
  }

  const handleMarkAsRead = async (id) => {
    await supabase
      .from('messages')
      .update({ 
        is_read: true,
        read_at: new Date()
      })
      .eq('id', id)
    fetchMessages()
  }

  const handleMarkAsUnread = async (id) => {
    await supabase
      .from('messages')
      .update({ 
        is_read: false,
        read_at: null
      })
      .eq('id', id)
    fetchMessages()
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return
    await supabase
      .from('messages')
      .delete()
      .eq('id', id)
    fetchMessages()
  }

  const handleReply = (message) => {
    setSelectedMessage(message)
    setReplyText(`Re: ${message.subject || 'Message'}\n\n`)
    setShowReplyModal(true)
  }

  const sendReply = async () => {
    // هنا يمكن إضافة خدمة إرسال البريد الإلكتروني
    console.log('Sending reply to:', selectedMessage?.sender_email)
    console.log('Reply content:', replyText)
    
    // تحديث الرسالة كـ "تم الرد" (يمكن إضافة حقل جديد)
    setShowReplyModal(false)
    alert('Reply sent successfully! (Demo)')
  }

  const getTimeAgo = (date) => {
    const now = new Date()
    const then = new Date(date)
    const diff = now - then
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
    return 'Just now'
  }

  const filteredMessages = messages
    .filter(msg => {
      if (filter === 'unread') return !msg.is_read
      if (filter === 'read') return msg.is_read
      return true
    })
    .filter(msg =>
      msg.sender_name?.toLowerCase().includes(search.toLowerCase()) ||
      msg.sender_email?.toLowerCase().includes(search.toLowerCase()) ||
      msg.message?.toLowerCase().includes(search.toLowerCase()) ||
      msg.subject?.toLowerCase().includes(search.toLowerCase()) ||
      msg.developers?.full_name?.toLowerCase().includes(search.toLowerCase())
    )

  const unreadCount = messages.filter(m => !m.is_read).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Messages</h1>
          <p className="text-sm text-gray-400 mt-1">
            Manage all communications from developers
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-blue-500/10 px-4 py-2 rounded-xl border border-blue-500/20">
            <span className="text-2xl font-bold text-blue-400">{unreadCount}</span>
            <span className="text-sm text-gray-400 ml-2">Unread</span>
          </div>
          <div className="bg-white/5 px-4 py-2 rounded-xl border border-white/10">
            <span className="text-2xl font-bold text-white">{messages.length}</span>
            <span className="text-sm text-gray-400 ml-2">Total</span>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search messages..."
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
          <option value="all">All Messages</option>
          <option value="unread">Unread</option>
          <option value="read">Read</option>
        </select>
      </div>

      {/* Messages List */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Loading messages...</p>
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No messages found</p>
          </div>
        ) : (
          <div className="divide-y divide-white/10">
            {filteredMessages.map((msg) => (
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
                        <h3 className="text-white font-semibold flex items-center gap-2">
                          {msg.sender_name}
                          {msg.developers && (
                            <span className="text-xs px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded-full">
                              Developer
                            </span>
                          )}
                        </h3>
                        <p className="text-sm text-gray-400">{msg.sender_email}</p>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Clock className="w-3 h-3" />
                        <span>{getTimeAgo(msg.created_at)}</span>
                      </div>
                    </div>

                    {msg.subject && (
                      <p className="text-sm font-medium text-purple-400 mt-2">
                        Subject: {msg.subject}
                      </p>
                    )}

                    <p className="text-gray-300 mt-2 whitespace-pre-line">
                      {msg.message}
                    </p>

                    {msg.developers && (
                      <div className="mt-3 p-3 bg-white/5 rounded-lg border border-white/10">
                        <p className="text-xs text-gray-400">Developer:</p>
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
                          <CheckCircle className="w-4 h-4" />
                          Mark as read
                        </button>
                      ) : (
                        <button
                          onClick={() => handleMarkAsUnread(msg.id)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-yellow-500/10 text-yellow-400 rounded-lg hover:bg-yellow-500/20 text-sm"
                        >
                          <Eye className="w-4 h-4" />
                          Mark as unread
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleReply(msg)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-green-500/10 text-green-400 rounded-lg hover:bg-green-500/20 text-sm"
                      >
                        <Reply className="w-4 h-4" />
                        Reply
                      </button>
                      
                      <button
                        onClick={() => handleDelete(msg.id)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 text-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reply Modal */}
      {showReplyModal && selectedMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-[#030014] rounded-2xl border border-white/10 max-w-2xl w-full p-6">
            <h2 className="text-xl font-bold text-white mb-4">Reply to {selectedMessage.sender_name}</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">To:</label>
                <input
                  type="email"
                  value={selectedMessage.sender_email}
                  disabled
                  className="w-full p-3 bg-white/5 border border-white/20 rounded-lg text-white opacity-50"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Subject:</label>
                <input
                  type="text"
                  value={`Re: ${selectedMessage.subject || 'Message'}`}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="w-full p-3 bg-white/5 border border-white/20 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Message:</label>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows="6"
                  className="w-full p-3 bg-white/5 border border-white/20 rounded-lg text-white resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={sendReply}
                  className="flex-1 py-3 bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white rounded-xl font-semibold hover:scale-[1.02] transition"
                >
                  Send Reply
                </button>
                <button
                  onClick={() => setShowReplyModal(false)}
                  className="flex-1 py-3 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/20 transition"
                >
                  Cancel
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
