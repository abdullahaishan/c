import React, { useState, useEffect, useRef, useCallback, memo } from 'react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { MessageCircle, UserCircle2, Loader2, AlertCircle, Send, ImagePlus, X, Crown, Shield } from 'lucide-react'
import AOS from "aos"
import "aos/dist/aos.css"

// ثابت لتحديد هوية صاحب المنصة
const PLATFORM_OWNER_EMAIL = "eng.abdullah.z.aishan@gmail.com" // بريد صاحب المنصة
const PLATFORM_OWNER_NAME = "Abdullah Aishan" // اسم صاحب المنصة

const Comment = memo(({ comment, formatDate, index }) => {
  // التحقق مما إذا كان هذا التعليق لصاحب المنصة
  const isOwner = comment.user_email === PLATFORM_OWNER_EMAIL || comment.user_name === PLATFORM_OWNER_NAME

  return (
    <div 
      className={`px-4 pt-4 pb-2 rounded-xl border transition-all group hover:shadow-lg hover:-translate-y-0.5 ${
        isOwner 
          ? 'bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/30 hover:bg-amber-500/20' 
          : 'bg-white/5 border-white/10 hover:bg-white/10'
      }`}
      data-aos="fade-up"
      data-aos-delay={index * 100}
    >
      <div className="flex items-start gap-3">
        {comment.profile_image ? (
          <img
            src={comment.profile_image}
            alt={`${comment.user_name}'s profile`}
            className="w-10 h-10 rounded-full object-cover border-2 border-indigo-500/30"
            loading="lazy"
          />
        ) : (
          <div className={`p-2 rounded-full ${
            isOwner ? 'bg-amber-500/30' : 'bg-indigo-500/20'
          } text-indigo-400 group-hover:bg-indigo-500/30 transition-colors`}>
            <UserCircle2 className="w-5 h-5" />
          </div>
        )}
        <div className="flex-grow min-w-0">
          <div className="flex items-center justify-between gap-4 mb-2">
            <div className="flex items-center gap-2">
              <h4 className={`font-medium truncate ${
                isOwner ? 'text-amber-300' : 'text-white'
              }`}>
                {comment.user_name}
              </h4>
              {isOwner && (
                <span className="flex items-center gap-1 text-xs bg-gradient-to-r from-amber-500 to-orange-500 text-white px-2 py-0.5 rounded-full shadow-lg">
                  <Crown className="w-3 h-3" />
                  Founder
                </span>
              )}
            </div>
            <span className="text-xs text-gray-400 whitespace-nowrap">
              {formatDate(comment.created_at)}
            </span>
          </div>
          <p className="text-gray-300 text-sm break-words leading-relaxed">{comment.content}</p>
        </div>
      </div>
    </div>
  )
})

const CommentForm = memo(({ onSubmit, isSubmitting, error }) => {
  const [newComment, setNewComment] = useState('')
  const [userName, setUserName] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [imagePreview, setImagePreview] = useState(null)
  const [imageFile, setImageFile] = useState(null)
  const textareaRef = useRef(null)
  const fileInputRef = useRef(null)

  const handleImageChange = useCallback((e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB')
        return
      }
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => setImagePreview(reader.result)
      reader.readAsDataURL(file)
    }
  }, [])

  const handleTextareaChange = useCallback((e) => {
    setNewComment(e.target.value)
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [])

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()
    if (!newComment.trim() || !userName.trim() || !userEmail.trim()) return
    
    await onSubmit({ 
      content: newComment, 
      user_name: userName, 
      user_email: userEmail,
      imageFile 
    })
    
    setNewComment('')
    setUserName('')
    setUserEmail('')
    setImagePreview(null)
    setImageFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }, [newComment, userName, userEmail, imageFile, onSubmit])

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <p className="text-sm text-gray-400 italic mb-2 text-center border-b border-white/10 pb-2">
        💬 Share your thoughts about the platform
      </p>
      
      <div className="space-y-2">
        <label className="block text-sm font-medium text-white">
          Your Name <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          placeholder="Enter your name"
          className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-white">
          Your Email <span className="text-red-400">*</span>
        </label>
        <input
          type="email"
          value={userEmail}
          onChange={(e) => setUserEmail(e.target.value)}
          placeholder="Enter your email"
          className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-white">
          Your Comment <span className="text-red-400">*</span>
        </label>
        <textarea
          ref={textareaRef}
          value={newComment}
          onChange={handleTextareaChange}
          placeholder="Write your comment here..."
          className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none min-h-[120px]"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-white">
          Profile Photo <span className="text-gray-400">(optional)</span>
        </label>
        <div className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-xl">
          {imagePreview ? (
            <div className="flex items-center gap-4">
              <img
                src={imagePreview}
                alt="Profile preview"
                className="w-16 h-16 rounded-full object-cover border-2 border-indigo-500/50"
              />
              <button
                type="button"
                onClick={() => {
                  setImagePreview(null)
                  setImageFile(null)
                  if (fileInputRef.current) fileInputRef.current.value = ''
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all group"
              >
                <X className="w-4 h-4" />
                <span>Remove Photo</span>
              </button>
            </div>
          ) : (
            <div className="w-full">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 transition-all border border-dashed border-indigo-500/50 hover:border-indigo-500 group"
              >
                <ImagePlus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span>Choose Profile Photo</span>
              </button>
              <p className="text-center text-gray-400 text-sm mt-2">
                Max file size: 5MB
              </p>
            </div>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="relative w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl font-medium text-white overflow-hidden group transition-all duration-300 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
      >
        <div className="absolute inset-0 bg-white/20 translate-y-12 group-hover:translate-y-0 transition-transform duration-300" />
        <div className="relative flex items-center justify-center gap-2">
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Posting...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Post Comment</span>
            </>
          )}
        </div>
      </button>
    </form>
  )
})

const Komentar = () => {
  const [comments, setComments] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    AOS.init({
      once: false,
      duration: 1000,
    })
  }, [])

  // جلب التعليقات من جدول comments
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const { data, error } = await supabase
          .from('comments')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50)

        if (error) throw error
        setComments(data || [])
      } catch (err) {
        console.error('Error fetching comments:', err)
        setError('Failed to load comments')
      }
    }

    fetchComments()

    // استماع للتحديثات الجديدة
    const subscription = supabase
      .channel('comments_channel')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'comments' },
        (payload) => {
          setComments(prev => [payload.new, ...prev])
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // رفع الصورة إلى Supabase Storage
  const uploadImage = useCallback(async (imageFile) => {
    if (!imageFile) return null
    
    const fileName = `comment-images/${Date.now()}_${imageFile.name}`
    
    const { error: uploadError } = await supabase.storage
      .from('developers')
      .upload(fileName, imageFile)

    if (uploadError) throw uploadError

    const { data } = supabase.storage
      .from('developers')
      .getPublicUrl(fileName)

    return data.publicUrl
  }, [])

  // إضافة تعليق جديد
  const handleCommentSubmit = useCallback(async ({ content, user_name, user_email, imageFile }) => {
    setError('')
    setIsSubmitting(true)
    
    try {
      let profileImageUrl = null
      if (imageFile) {
        profileImageUrl = await uploadImage(imageFile)
      }

      const { error: insertError } = await supabase
        .from('comments')
        .insert([{
          content,
          user_name,
          user_email, // إضافة البريد الإلكتروني للتعرف على صاحب المنصة
          profile_image: profileImageUrl,
          created_at: new Date()
        }])

      if (insertError) throw insertError

    } catch (err) {
      console.error('Error adding comment:', err)
      setError('Failed to add comment. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }, [uploadImage])

  const formatDate = useCallback((timestamp) => {
    if (!timestamp) return ''
    const date = new Date(timestamp)
    const now = new Date()
    const diffMinutes = Math.floor((now - date) / (1000 * 60))
    const diffHours = Math.floor(diffMinutes / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMinutes < 1) return 'Just now'
    if (diffMinutes < 60) return `${diffMinutes}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`

    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date)
  }, [])

  return (
    <div className="w-full bg-gradient-to-b from-white/10 to-white/5 rounded-2xl overflow-hidden backdrop-blur-xl shadow-xl">
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-500/20">
            <MessageCircle className="w-6 h-6 text-indigo-400" />
          </div>
          <h3 className="text-xl font-semibold text-white">
            Community Comments <span className="text-indigo-400">({comments.length})</span>
          </h3>
        </div>
      </div>
      
      <div className="p-6 space-y-6">
        {error && (
          <div className="flex items-center gap-2 p-4 text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}
        
        <div>
          <CommentForm 
            onSubmit={handleCommentSubmit} 
            isSubmitting={isSubmitting} 
            error={error} 
          />
        </div>

        <div className="space-y-4 h-[400px] overflow-y-auto custom-scrollbar pr-2">
          {comments.length === 0 ? (
            <div className="text-center py-8">
              <UserCircle2 className="w-12 h-12 text-indigo-400 mx-auto mb-3 opacity-50" />
              <p className="text-gray-400">No comments yet. Be the first to comment!</p>
            </div>
          ) : (
            comments.map((comment, index) => (
              <Comment 
                key={comment.id} 
                comment={comment} 
                formatDate={formatDate}
                index={index}
              />
            ))
          )}
        </div>
      </div>
      
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(99, 102, 241, 0.5);
          border-radius: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(99, 102, 241, 0.7);
        }
      `}</style>
    </div>
  )
}

export default Komentar
