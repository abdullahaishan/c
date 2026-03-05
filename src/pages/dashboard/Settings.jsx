import React, { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { developerService, socialLinkService } from '../../lib/supabase'
import { storjService } from '../../lib/storjService'
import { supabase } from '../../lib/supabase'
import { SOCIAL_PLATFORMS } from '../../utils/constants'
import {
  Save,
  Upload,
  X,
  Loader,
  AlertCircle,
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  Github,
  Linkedin,
  Twitter,
  Instagram,
  Facebook,
  Youtube,
  Eye,
  Key,
  Edit
} from 'lucide-react'

const Settings = () => {
  const { user } = useAuth()
  const [developer, setDeveloper] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [activeTab, setActiveTab] = useState('profile')
  
  // حالات اسم المستخدم
  const [username, setUsername] = useState('')
  const [lastUsernameUpdate, setLastUsernameUpdate] = useState(null)
  const [usernameError, setUsernameError] = useState('')
  const [usernameSuccess, setUsernameSuccess] = useState('')
  const [showUsernameModal, setShowUsernameModal] = useState(false)
  const [newUsername, setNewUsername] = useState('')

  // جلب بيانات المطور عند تحميل الصفحة
  useEffect(() => {
    fetchDeveloper()
  }, [user])

  useEffect(() => {
    if (developer) {
      setUsername(developer.username || '')
      setLastUsernameUpdate(developer.last_username_update || null)
    }
  }, [developer])

  const fetchDeveloper = async () => {
    if (!user) return
    setLoading(true)
    try {
      const data = await developerService.getById(user.id)
      setDeveloper(data)
    } catch (err) {
      console.error('Error fetching developer:', err)
      setError('فشل في جلب بيانات المطور')
    } finally {
      setLoading(false)
    }
  }

  // بيانات الملف الشخصي
  const [profileData, setProfileData] = useState({
    full_name: '',
    title: '',
    bio: '',
    location: '',
    phone: '',
    profile_image: null,
    cover_image: null,
    resume_file: null
  })

  // تحديث profileData عندما يتغير developer
  useEffect(() => {
    if (developer) {
      setProfileData({
        full_name: developer.full_name || '',
        title: developer.title || '',
        bio: developer.bio || '',
        location: developer.location || '',
        phone: developer.phone || '',
        profile_image: developer.profile_image || null,
        cover_image: developer.cover_image || null,
        resume_file: developer.resume_file || null
      })
    }
  }, [developer])

  // روابط التواصل
  const [socialLinks, setSocialLinks] = useState({})

  useEffect(() => {
    if (developer?.social_links) {
      const links = {}
      developer.social_links.forEach(link => {
        links[link.platform] = link.url
      })
      setSocialLinks(links)
    }
  }, [developer])

  // كلمة المرور
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: ''
  })

  // ===========================================
  // دوال رفع الملفات
  // ===========================================

  const handleProfileImageChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploading(true)
    setError('')
    setSuccess('')

    try {
      const result = await storjService.uploadProfileImage(
        file,
        user.id,
        profileData.profile_image
      )

      const { error: updateError } = await supabase
        .from('developers')
        .update({ profile_image: result.url })
        .eq('id', user.id)

      if (updateError) throw updateError

      setProfileData({ ...profileData, profile_image: result.url })
      setSuccess(`✅ تم رفع الصورة بنجاح`)

    } catch (err) {
      console.error('❌ خطأ في رفع الصورة:', err)
      setError('فشل في رفع الصورة: ' + err.message)
    } finally {
      setUploading(false)
    }
  }

  const handleCoverImageChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploading(true)
    setError('')
    setSuccess('')

    try {
      const result = await storjService.uploadCoverImage(
        file,
        user.id,
        profileData.cover_image
      )

      const { error: updateError } = await supabase
        .from('developers')
        .update({ cover_image: result.url })
        .eq('id', user.id)

      if (updateError) throw updateError

      setProfileData({ ...profileData, cover_image: result.url })
      setSuccess(`✅ تم رفع الغلاف بنجاح`)

    } catch (err) {
      console.error('❌ خطأ في رفع الغلاف:', err)
      setError('فشل في رفع الغلاف: ' + err.message)
    } finally {
      setUploading(false)
    }
  }

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploading(true)
    setError('')
    setSuccess('')

    try {
      if (file.type !== 'application/pdf') {
        throw new Error('الملف يجب أن يكون بصيغة PDF')
      }

      const result = await storjService.uploadResume(
        file,
        user.id,
        profileData.resume_file
      )

      const { error: updateError } = await supabase
        .from('developers')
        .update({ resume_file: result.url })
        .eq('id', user.id)

      if (updateError) throw updateError

      setProfileData({ ...profileData, resume_file: result.url })
      setSuccess(`✅ تم رفع السيرة الذاتية بنجاح`)

    } catch (err) {
      console.error('❌ خطأ في رفع السيرة:', err)
      setError('فشل في رفع السيرة الذاتية: ' + err.message)
    } finally {
      setUploading(false)
    }
  }

  // حفظ الملف الشخصي
  const handleSaveProfile = async () => {
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      await developerService.update(user.id, profileData)
      setSuccess('✅ تم تحديث الملف الشخصي بنجاح')
      fetchDeveloper()
    } catch (err) {
      console.error('Error updating profile:', err)
      setError('فشل في تحديث الملف الشخصي')
    } finally {
      setSaving(false)
    }
  }

  // حفظ روابط التواصل
  const handleSaveSocialLinks = async () => {
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      for (const [platform, url] of Object.entries(socialLinks)) {
        if (url) {
          await socialLinkService.upsert(user.id, platform, url)
        }
      }
      setSuccess('✅ تم تحديث روابط التواصل بنجاح')
      fetchDeveloper()
    } catch (err) {
      console.error('Error updating social links:', err)
      setError('فشل في تحديث روابط التواصل')
    } finally {
      setSaving(false)
    }
  }

  // تغيير كلمة المرور
  const handleChangePassword = async () => {
    if (passwordData.new !== passwordData.confirm) {
      setError('كلمة المرور الجديدة غير متطابقة')
      return
    }

    if (passwordData.new.length < 6) {
      setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل')
      return
    }

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      setSuccess('✅ تم تغيير كلمة المرور بنجاح')
      setPasswordData({ current: '', new: '', confirm: '' })
    } catch (err) {
      console.error('Error changing password:', err)
      setError('فشل في تغيير كلمة المرور')
    } finally {
      setSaving(false)
    }
  }

  // ===========================================
  // دوال اسم المستخدم
  // ===========================================

  const canChangeUsername = () => {
    if (!lastUsernameUpdate) return true
    
    const now = new Date()
    const lastUpdate = new Date(lastUsernameUpdate)
    const daysSinceLastUpdate = Math.floor((now - lastUpdate) / (1000 * 60 * 60 * 24))
    
    return daysSinceLastUpdate >= 7
  }

  const getRemainingDays = () => {
    if (!lastUsernameUpdate) return 0
    
    const now = new Date()
    const lastUpdate = new Date(lastUsernameUpdate)
    const nextAllowedDate = new Date(lastUpdate)
    nextAllowedDate.setDate(nextAllowedDate.getDate() + 7)
    
    const remainingMs = nextAllowedDate - now
    const remainingDays = Math.ceil(remainingMs / (1000 * 60 * 60 * 24))
    
    return Math.max(0, remainingDays)
  }

  const validateUsername = (username) => {
    if (username.length < 3) {
      return 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل'
    }
    if (username.length > 30) {
      return 'اسم المستخدم يجب أن يكون أقل من 30 حرف'
    }
    if (!/^[a-z0-9_-]+$/.test(username)) {
      return 'اسم المستخدم يجب أن يحتوي فقط على أحرف إنجليزية صغيرة وأرقام و _ و -'
    }
    return ''
  }

  const handleOpenUsernameModal = () => {
    setUsernameError('')
    setUsernameSuccess('')
    setNewUsername('')
    
    if (!canChangeUsername()) {
      const days = getRemainingDays()
      setUsernameError(`لا يمكنك تغيير اسم المستخدم إلا مرة واحدة في الأسبوع. متبقي ${days} أيام`)
      return
    }
    
    setShowUsernameModal(true)
  }

  const handleChangeUsername = async () => {
    const error = validateUsername(newUsername)
    if (error) {
      setUsernameError(error)
      return
    }

    if (newUsername === username) {
      setUsernameError('اسم المستخدم الجديد مطابق للقديم')
      return
    }

    setSaving(true)
    setUsernameError('')
    setUsernameSuccess('')

    try {
      const { data: existingUser } = await supabase
        .from('developers')
        .select('id')
        .eq('username', newUsername)
        .neq('id', user.id)

      if (existingUser && existingUser.length > 0) {
        throw new Error('اسم المستخدم موجود بالفعل')
      }

      const { error: updateError } = await supabase
        .from('developers')
        .update({ 
          username: newUsername,
          last_username_update: new Date().toISOString()
        })
        .eq('id', user.id)

      if (updateError) throw updateError

      setUsername(newUsername)
      setLastUsernameUpdate(new Date().toISOString())
      setUsernameSuccess('✅ تم تغيير اسم المستخدم بنجاح')
      
      setTimeout(() => {
        setShowUsernameModal(false)
        setUsernameSuccess('')
      }, 2000)

      fetchDeveloper()

    } catch (err) {
      console.error('Error changing username:', err)
      setUsernameError(err.message || 'فشل في تغيير اسم المستخدم')
    } finally {
      setSaving(false)
    }
  }

  // أيقونة المنصة
  // أيقونة المنصة - نسخة كاملة
const getPlatformIcon = (platform) => {
  switch(platform) {
    case 'github': return <Github className="w-5 h-5" />
    case 'linkedin': return <Linkedin className="w-5 h-5" />
    case 'twitter': return <Twitter className="w-5 h-5" />
    case 'instagram': return <Instagram className="w-5 h-5" />
    case 'facebook': return <Facebook className="w-5 h-5" />
    case 'youtube': return <Youtube className="w-5 h-5" />
    case 'tiktok': 
      return (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
        </svg>
      )
    case 'discord':
      return (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515c-.074.134-.16.314-.212.471a18.344 18.344 0 0 0-5.506 0 3.474 3.474 0 0 0-.212-.471 19.733 19.733 0 0 0-4.885 1.515c-2.66 3.942-3.438 7.744-3.07 11.484 2.176 1.614 4.258 2.554 6.301 3.166.54-.74 1.018-1.53 1.424-2.374a12.284 12.284 0 0 1-2.233-1.075 9.528 9.528 0 0 0 .553-.431 14.638 14.638 0 0 0 12.12 0c.178.147.36.293.553.431-.7.432-1.448.814-2.233 1.075.406.844.884 1.634 1.424 2.374 2.043-.612 4.125-1.552 6.301-3.166.426-4.287-.636-8.079-3.07-11.484zM8.988 14.236c-1.182 0-2.158-1.091-2.158-2.432 0-1.34.946-2.432 2.158-2.432 1.211 0 2.157 1.092 2.158 2.432 0 1.341-.946 2.432-2.158 2.432zm6.024 0c-1.182 0-2.158-1.091-2.158-2.432 0-1.34.946-2.432 2.158-2.432s2.158 1.092 2.158 2.432c0 1.341-.946 2.432-2.158 2.432z"/>
        </svg>
      )
    case 'telegram':
      return (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.914.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.244-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
        </svg>
      )
    case 'whatsapp':
      return (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.064 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
        </svg>
      )
    case 'website': return <Globe className="w-5 h-5" />
    case 'email': return <Mail className="w-5 h-5" />
    default: return <Globe className="w-5 h-5" />
  }
}

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030014] flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-[#6366f1] animate-spin mx-auto mb-4" />
          <p className="text-gray-400">جاري تحميل الإعدادات...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">الإعدادات</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-4">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 rounded-lg transition-all ${
            activeTab === 'profile'
              ? 'bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          الملف الشخصي
        </button>
        <button
          onClick={() => setActiveTab('social')}
          className={`px-4 py-2 rounded-lg transition-all ${
            activeTab === 'social'
              ? 'bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          روابط التواصل
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`px-4 py-2 rounded-lg transition-all ${
            activeTab === 'security'
              ? 'bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          الأمان
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>{success}</p>
        </div>
      )}

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          {/* Cover Image */}
          <div className="relative h-48 rounded-2xl overflow-hidden bg-gradient-to-r from-[#6366f1]/20 to-[#a855f7]/20">
            {profileData.cover_image ? (
              <img
                src={profileData.cover_image}
                alt="Cover"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-white/30">صورة الغلاف</span>
              </div>
            )}
            
            <label className="absolute bottom-4 right-4 flex items-center gap-2 px-4 py-2 bg-black/50 backdrop-blur-sm rounded-lg cursor-pointer hover:bg-black/70 transition-all">
              <Upload className="w-4 h-4 text-white" />
              <span className="text-white text-sm">تغيير الغلاف</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleCoverImageChange}
                className="hidden"
              />
            </label>
          </div>

          {/* Profile Image and Username */}
          <div className="flex items-end gap-6 -mt-16 px-6">
            <div className="relative">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[#030014] bg-gradient-to-r from-[#6366f1] to-[#a855f7]">
                {profileData.profile_image ? (
                  <img
                    src={profileData.profile_image}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="w-12 h-12 text-white" />
                  </div>
                )}
              </div>
              
              <label className="absolute bottom-0 right-0 p-2 bg-[#6366f1] rounded-full cursor-pointer hover:bg-[#a855f7] transition-all">
                <Upload className="w-4 h-4 text-white" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfileImageChange}
                  className="hidden"
                />
              </label>
            </div>

            {/* Username مع إمكانية التعديل */}
            <div className="flex-1 pb-4">
              <div className="flex items-center gap-3">
                <div>
                  <p className="text-sm text-gray-400">اسم المستخدم</p>
                  <div className="flex items-center gap-2">
                    <p className="text-lg text-white">@{username}</p>
                    <button
                      onClick={handleOpenUsernameModal}
                      className="p-1 text-gray-400 hover:text-[#6366f1] transition-colors"
                      title="تغيير اسم المستخدم (مرة واحدة في الأسبوع)"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {!canChangeUsername() && (
                  <span className="text-xs text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded-full">
                    متبقي {getRemainingDays()} أيام
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Profile Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-gray-400 mb-2">الاسم الكامل</label>
              <input
                type="text"
                value={profileData.full_name}
                onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">المسمى الوظيفي</label>
              <input
                type="text"
                value={profileData.title}
                onChange={(e) => setProfileData({ ...profileData, title: e.target.value })}
                className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white"
                placeholder="مثال: مطور واجهات أمامية"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">الموقع</label>
              <input
                type="text"
                value={profileData.location}
                onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white"
                placeholder="مثال: القاهرة، مصر"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">رقم الهاتف</label>
              <input
                type="tel"
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white"
                placeholder="+20123456789"
              />
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">نبذة عنك</label>
            <textarea
              value={profileData.bio}
              onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
              rows="4"
              className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white"
              placeholder="اكتب نبذة عن نفسك..."
            />
          </div>

          {/* Resume */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">السيرة الذاتية (PDF)</label>
            <div className="flex items-center gap-4">
              {profileData.resume_file ? (
                <>
                  <a
                    href={profileData.resume_file}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30"
                  >
                    <Eye className="w-4 h-4" />
                    عرض السيرة
                  </a>
                  <button
                    onClick={() => setProfileData({ ...profileData, resume_file: null })}
                    className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <label className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg cursor-pointer hover:bg-white/10">
                  <Upload className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-300">رفع السيرة الذاتية</span>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleResumeUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Save button */}
          <button
            onClick={handleSaveProfile}
            disabled={saving || uploading}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white rounded-xl font-semibold hover:scale-[1.02] transition-all disabled:opacity-50"
          >
            {saving ? <Loader className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            حفظ التغييرات
          </button>
        </div>
      )}

      {/* Social Links Tab */}
      {activeTab === 'social' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            {SOCIAL_PLATFORMS.map((platform) => (
              <div key={platform.id} className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center">
                  {getPlatformIcon(platform.id)}
                </div>
                <input
                  type="url"
                  value={socialLinks[platform.id] || ''}
                  onChange={(e) => setSocialLinks({
                    ...socialLinks,
                    [platform.id]: e.target.value
                  })}
                  placeholder={platform.placeholder}
                  className="flex-1 p-3 bg-white/10 border border-white/20 rounded-lg text-white"
                />
              </div>
            ))}
          </div>

          <button
            onClick={handleSaveSocialLinks}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white rounded-xl font-semibold hover:scale-[1.02] transition-all disabled:opacity-50"
          >
            {saving ? <Loader className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            حفظ روابط التواصل
          </button>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="space-y-6 max-w-md">
          <div>
            <label className="block text-sm text-gray-400 mb-2">كلمة المرور الحالية</label>
            <input
              type="password"
              value={passwordData.current}
              onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
              className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">كلمة المرور الجديدة</label>
            <input
              type="password"
              value={passwordData.new}
              onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
              className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">تأكيد كلمة المرور الجديدة</label>
            <input
              type="password"
              value={passwordData.confirm}
              onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
              className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white"
            />
          </div>

          <button
            onClick={handleChangePassword}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white rounded-xl font-semibold hover:scale-[1.02] transition-all disabled:opacity-50"
          >
            {saving ? <Loader className="w-5 h-5 animate-spin" /> : <Key className="w-5 h-5" />}
            تغيير كلمة المرور
          </button>
        </div>
      )}

      {/* Modal تغيير اسم المستخدم */}
      {showUsernameModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1a1a2e] rounded-2xl max-w-md w-full p-6 border border-white/10">
            <h3 className="text-xl font-bold text-white mb-4">تغيير اسم المستخدم</h3>
            
            {usernameSuccess ? (
              <div className="text-center py-4">
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <AlertCircle className="w-6 h-6 text-green-400" />
                </div>
                <p className="text-green-400">{usernameSuccess}</p>
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-400 mb-4">
                  يمكنك تغيير اسم المستخدم مرة واحدة فقط في الأسبوع. اختر اسماً مناسباً بعناية.
                </p>

                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="أدخل اسم المستخدم الجديد"
                  className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white mb-2"
                  autoFocus
                />
                
                <p className="text-xs text-gray-500 mb-4">
                  * 3-30 حرف، أحرف إنجليزية صغيرة وأرقام فقط، _ و - مسموح بهما
                </p>

                {usernameError && (
                  <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                    {usernameError}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={handleChangeUsername}
                    disabled={saving || !newUsername}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white rounded-lg font-semibold hover:scale-[1.02] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    حفظ
                  </button>
                  <button
                    onClick={() => setShowUsernameModal(false)}
                    className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all"
                  >
                    إلغاء
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Settings
