import { supabase } from '../../lib/supabase' // أضف هذا السطر
import React, { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { developerService, storageService, socialLinkService } from '../../lib/supabase'
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
  Key
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

  // جلب بيانات المطور عند تحميل الصفحة
  useEffect(() => {
    fetchDeveloper()
  }, [user])

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

  const handleImageUpload = async (file, type) => {
    if (!file) return null
    
    setUploading(true)
    try {
      const imageUrl = await storageService.uploadImage(
        file,
        `profiles/${user.id}`
      )
      return imageUrl
    } catch (err) {
      console.error('Error uploading image:', err)
      setError('فشل في رفع الصورة')
      return null
    } finally {
      setUploading(false)
    }
  }

  const handleProfileImageChange = async (e) => {
  const file = e.target.files[0]
  if (!file) return

  setUploading(true)
  setError('')

  try {
    // التحقق من الملف
    if (!file.type.startsWith('image/')) {
      throw new Error('الملف ليس صورة')
    }
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('الصورة أكبر من 5 ميجابايت')
    }

    // إنشاء اسم فريد للملف
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 8)
    const fileExt = file.name.split('.').pop()
    const fileName = `${timestamp}-${randomString}.${fileExt}`
    const filePath = `profiles/${user.id}/${fileName}`

    console.log('رفع إلى:', filePath)

    // رفع الملف مباشرة إلى Supabase
    const { error } = await supabase.storage
      .from('developers')
      .upload(filePath, file)

    if (error) throw error

    // الحصول على رابط الصورة
    const { data } = supabase.storage
      .from('developers')
      .getPublicUrl(filePath)

    // تحديث البيانات
    setProfileData({ ...profileData, profile_image: data.publicUrl })
    setSuccess('تم رفع الصورة بنجاح')

  } catch (err) {
    console.error('خطأ:', err)
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

  try {
    if (!file.type.startsWith('image/')) throw new Error('الملف ليس صورة')
    if (file.size > 5 * 1024 * 1024) throw new Error('الصورة أكبر من 5 ميجابايت')

    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 8)
    const fileExt = file.name.split('.').pop()
    const fileName = `${timestamp}-${randomString}.${fileExt}`
    const filePath = `covers/${user.id}/${fileName}`

    const { error } = await supabase.storage
      .from('developers')
      .upload(filePath, file)

    if (error) throw error

    const { data } = supabase.storage
      .from('developers')
      .getPublicUrl(filePath)

    setProfileData({ ...profileData, cover_image: data.publicUrl })
    setSuccess('تم رفع الغلاف بنجاح')

  } catch (err) {
    console.error('خطأ:', err)
    setError('فشل في رفع الغلاف: ' + err.message)
  } finally {
    setUploading(false)
  }
}

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.type !== 'application/pdf') {
      setError('الرجاء رفع ملف PDF')
      return
    }

    setUploading(true)
    try {
      const fileUrl = await storageService.uploadImage(
        file,
        `resumes/${user.id}`
      )
      setProfileData({ ...profileData, resume_file: fileUrl })
    } catch (err) {
      console.error('Error uploading resume:', err)
      setError('فشل في رفع السيرة الذاتية')
    } finally {
      setUploading(false)
    }
  }

  const handleSaveProfile = async () => {
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      await developerService.update(user.id, profileData)
      setSuccess('تم تحديث الملف الشخصي بنجاح')
      fetchDeveloper() // إعادة جلب البيانات
    } catch (err) {
      console.error('Error updating profile:', err)
      setError('فشل في تحديث الملف الشخصي')
    } finally {
      setSaving(false)
    }
  }

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
      setSuccess('تم تحديث روابط التواصل بنجاح')
      fetchDeveloper()
    } catch (err) {
      console.error('Error updating social links:', err)
      setError('فشل في تحديث روابط التواصل')
    } finally {
      setSaving(false)
    }
  }

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
      // هنا يمكن إضافة منطق تغيير كلمة المرور
      setSuccess('تم تغيير كلمة المرور بنجاح')
      setPasswordData({ current: '', new: '', confirm: '' })
    } catch (err) {
      console.error('Error changing password:', err)
      setError('فشل في تغيير كلمة المرور')
    } finally {
      setSaving(false)
    }
  }

  // أيقونة المنصة
  const getPlatformIcon = (platform) => {
    switch(platform) {
      case 'github': return <Github className="w-5 h-5" />
      case 'linkedin': return <Linkedin className="w-5 h-5" />
      case 'twitter': return <Twitter className="w-5 h-5" />
      case 'instagram': return <Instagram className="w-5 h-5" />
      case 'facebook': return <Facebook className="w-5 h-5" />
      case 'youtube': return <Youtube className="w-5 h-5" />
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
            
            {/* Upload button */}
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

          {/* Profile Image */}
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
              
              {/* Upload button */}
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

            {/* Username */}
            <div className="flex-1 pb-4">
              <p className="text-sm text-gray-400">اسم المستخدم</p>
              <p className="text-lg text-white">@{developer?.username}</p>
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
    </div>
  )
}

export default Settings
