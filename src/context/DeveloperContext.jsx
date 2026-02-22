import React, { createContext, useState, useContext, useEffect } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import { developerService, storageService } from '../lib/supabase'

const DeveloperContext = createContext()

export const useDeveloper = () => {
  const context = useContext(DeveloperContext)
  if (!context) {
    throw new Error('useDeveloper must be used within DeveloperProvider')
  }
  return context
}

export const DeveloperProvider = ({ children }) => {
  const { username } = useParams()
  const location = useLocation()
  const [developer, setDeveloper] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // تحديد اسم المستخدم من الرابط
  const currentUsername = username || 'eki' // المطور الرئيسي

  useEffect(() => {
    loadDeveloper()
  }, [currentUsername])

  const loadDeveloper = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('Loading developer:', currentUsername)
      
      const data = await developerService.getByUsername(currentUsername)
      setDeveloper(data)
      
      // تسجيل الزيارة إذا كان المطور موجوداً
      if (data) {
        // زيادة عدد المشاهدات
        await developerService.incrementViews(data.id)
        
        // تسجيل معلومات الزائر
        const visitorData = {
          visitor_ip: 'visitor', // في الإنتاج نحصل على IP حقيقي
          device_type: window.innerWidth < 768 ? 'mobile' : 'desktop',
          browser: navigator.userAgent,
          referrer: document.referrer || 'direct'
        }
        
        await developerService.trackVisit(data.id, visitorData)
      }
    } catch (err) {
      console.error('Error loading developer:', err)
      setError('المطور غير موجود')
    } finally {
      setLoading(false)
    }
  }

  // دوال مساعدة للوصول السريع للبيانات
  const getProjects = () => developer?.projects || []
  const getSkills = () => developer?.skills || []
  const getCertificates = () => developer?.certificates || []
  const getExperience = () => developer?.experience || []
  const getEducation = () => developer?.education || []
  const getSocialLinks = () => {
    const links = {}
    developer?.social_links?.forEach(link => {
      links[link.platform] = link.url
    })
    return links
  }

  // الحصول على الصور (مع fallback للصور الافتراضية)
  const getProfileImage = () => {
    return developer?.profile_image || '/default-avatar.png'
  }

  const getCoverImage = () => {
    return developer?.cover_image || '/default-cover.jpg'
  }

  const value = {
    // البيانات الأساسية
    developer,
    loading,
    error,
    
    // الدوال المساعدة
    getProjects,
    getSkills,
    getCertificates,
    getExperience,
    getEducation,
    getSocialLinks,
    getProfileImage,
    getCoverImage,
    
    // معلومات إضافية
    isLoaded: !loading && developer !== null,
    username: currentUsername,
    
    // إعادة التحميل
    refresh: loadDeveloper
  }

  return (
    <DeveloperContext.Provider value={value}>
      {children}
    </DeveloperContext.Provider>
  )
}