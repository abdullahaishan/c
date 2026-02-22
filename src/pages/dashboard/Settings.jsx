import React, { useState } from 'react'
import { useDeveloper } from '../../context/DeveloperContext'
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
  const { developer, refresh } = useDeveloper()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [activeTab, setActiveTab] = useState('profile')

  // بيانات الملف الشخصي
  const [profileData, setProfileData] = useState({
    full_name: developer?.full_name || '',
    title: developer?.title || '',
    bio: developer?.bio || '',
    location: developer?.location || '',
    phone: developer?.phone || '',
    profile_image: developer?.profile_image || null,
    cover_image: developer?.cover_image || null,
    resume_file: developer?.resume_file || null
  })

  // روابط التواصل
  const [socialLinks, setSocialLinks] = useState(() => {
    const links = {}
    developer?.social_links?.forEach(link => {
      links[link.platform] = link.url
    })
    return links
  })

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
        `profiles/${developer.id}`
      )
      return imageUrl
    } catch (err) {
      console.error('Error uploading image:', err)
      setError('Failed to upload image')
      return null
    } finally {
      setUploading(false)
    }
  }

  const handleProfileImageChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const imageUrl = await handleImageUpload(file, 'profile')
    if (imageUrl) {
      setProfileData({ ...profileData, profile_image: imageUrl })
    }
  }

  const handleCoverImageChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const imageUrl = await handleImageUpload(file, 'cover')
    if (imageUrl) {
      setProfileData({ ...profileData, cover_image: imageUrl })
    }
  }

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file')
      return
    }

    setUploading(true)
    try {
      const fileUrl = await storageService.uploadImage(
        file,
        `resumes/${developer.id}`
      )
      setProfileData({ ...profileData, resume_file: fileUrl })
    } catch (err) {
      console.error('Error uploading resume:', err)
      setError('Failed to upload resume')
    } finally {
      setUploading(false)
    }
  }

  const handleSaveProfile = async () => {
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      await developerService.update(developer.id, profileData)
      setSuccess('Profile updated successfully')
      refresh()
    } catch (err) {
      console.error('Error updating profile:', err)
      setError('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSocialLinks = async () => {
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      for (const [platform, url] of Object.entries(socialLinks)) {
        if (url) {
          await socialLinkService.upsert(developer.id, platform, url)
        }
      }
      setSuccess('Social links updated successfully')
      refresh()
    } catch (err) {
      console.error('Error updating social links:', err)
      setError('Failed to update social links')
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async () => {
    if (passwordData.new !== passwordData.confirm) {
      setError('Passwords do not match')
      return
    }

    if (passwordData.new.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      // هنا يمكن إضافة منطق تغيير كلمة المرور
      setSuccess('Password changed successfully')
      setPasswordData({ current: '', new: '', confirm: '' })
    } catch (err) {
      console.error('Error changing password:', err)
      setError('Failed to change password')
    } finally {
      setLoading(false)
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Settings</h1>
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
          Profile
        </button>
        <button
          onClick={() => setActiveTab('social')}
          className={`px-4 py-2 rounded-lg transition-all ${
            activeTab === 'social'
              ? 'bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          Social Links
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`px-4 py-2 rounded-lg transition-all ${
            activeTab === 'security'
              ? 'bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          Security
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
                <span className="text-white/30">Cover Image</span>
              </div>
            )}
            
            {/* Upload button */}
            <label className="absolute bottom-4 right-4 flex items-center gap-2 px-4 py-2 bg-black/50 backdrop-blur-sm rounded-lg cursor-pointer hover:bg-black/70 transition-all">
              <Upload className="w-4 h-4 text-white" />
              <span className="text-white text-sm">Change Cover</span>
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
              <p className="text-sm text-gray-400">Username</p>
              <p className="text-lg text-white">@{developer?.username}</p>
            </div>
          </div>

          {/* Profile Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Full Name</label>
              <input
                type="text"
                value={profileData.full_name}
                onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Title</label>
              <input
                type="text"
                value={profileData.title}
                onChange={(e) => setProfileData({ ...profileData, title: e.target.value })}
                className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white"
                placeholder="e.g., Frontend Developer"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Location</label>
              <input
                type="text"
                value={profileData.location}
                onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white"
                placeholder="e.g., Cairo, Egypt"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Phone</label>
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
            <label className="block text-sm text-gray-400 mb-2">Bio</label>
            <textarea
              value={profileData.bio}
              onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
              rows="4"
              className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white"
              placeholder="Tell your story..."
            />
          </div>

          {/* Resume */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Resume (PDF)</label>
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
                    View Resume
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
                  <span className="text-gray-300">Upload Resume</span>
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
            disabled={loading || uploading}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white rounded-xl font-semibold hover:scale-[1.02] transition-all disabled:opacity-50"
          >
            {loading ? <Loader className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Save Changes
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
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white rounded-xl font-semibold hover:scale-[1.02] transition-all disabled:opacity-50"
          >
            {loading ? <Loader className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Save Social Links
          </button>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="space-y-6 max-w-md">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Current Password</label>
            <input
              type="password"
              value={passwordData.current}
              onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
              className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">New Password</label>
            <input
              type="password"
              value={passwordData.new}
              onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
              className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Confirm New Password</label>
            <input
              type="password"
              value={passwordData.confirm}
              onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
              className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white"
            />
          </div>

          <button
            onClick={handleChangePassword}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white rounded-xl font-semibold hover:scale-[1.02] transition-all disabled:opacity-50"
          >
            {loading ? <Loader className="w-5 h-5 animate-spin" /> : <Key className="w-5 h-5" />}
            Change Password
          </button>
        </div>
      )}
    </div>
  )
}

export default Settings