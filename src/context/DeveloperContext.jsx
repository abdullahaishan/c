import React, { createContext, useState, useContext, useEffect } from 'react'
import { developerService, likeService, statsService } from '../lib/supabase' // ✅ استخدم الدوال الموجودة

const DeveloperContext = createContext()

export const useDeveloper = () => {
  const context = useContext(DeveloperContext)
  if (!context) {
    throw new Error('useDeveloper must be used within DeveloperProvider')
  }
  return context
}

export const DeveloperProvider = ({ children, username }) => {
  const [developer, setDeveloper] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [visitorIp, setVisitorIp] = useState(null)
  const [advancedStats, setAdvancedStats] = useState(null) // للباقة المدفوعة

  // جلب IP الزائر (موجود مسبقاً)
  useEffect(() => {
    const getVisitorIp = async () => {
      try {
        const response = await fetch('https://api.ipify.org?format=json')
        const { ip } = await response.json()
        setVisitorIp(ip)
      } catch (error) {
        console.error('Error getting visitor IP:', error)
      }
    }
    getVisitorIp()
  }, [])

  // جلب بيانات المطور وتسجيل الزيارة
  useEffect(() => {
    if (!username) return

    const fetchDeveloper = async () => {
      try {
        setLoading(true)
        setError(null)

        const data = await developerService.getByUsername(username) // ✅ دالة موجودة

        if (!data) {
          setDeveloper(null)
          setError("Developer not found")
        } else {
          setDeveloper(data)
          
          // ✅ تسجيل الزيارة (مهم جداً)
          await trackVisit(data.id, data.plan_id)
          
          // ✅ إذا كانت باقة مدفوعة، جلب إحصائيات متقدمة
          if (data.plan_id > 1) {
            fetchAdvancedStats(data.id)
          }
        }
      } catch (err) {
        console.error("Error fetching developer:", err)
        setError("Failed to load developer")
        setDeveloper(null)
      } finally {
        setLoading(false)
      }
    }

    fetchDeveloper()
  }, [username])

  // ✅ دالة تسجيل الزيارة (تستخدم الدوال الموجودة)
  const trackVisit = async (developerId, planId) => {
    try {
      // 1️⃣ دائماً زد عدد الزيارات (لكل الباقات)
      await developerService.incrementViews(developerId) // ✅ دالة موجودة

      // 2️⃣ إذا كانت باقة مدفوعة، سجل تفاصيل الزيارة
      if (planId > 1) {
        const visitorData = {
          visitor_ip: visitorIp,
          device_type: getDeviceType(),
          browser: getBrowserName(),
          referrer: document.referrer || 'direct',
          user_agent: navigator.userAgent
        }

        // جلب الدولة (اختياري)
        try {
          const geoResponse = await fetch(`https://ipapi.co/${visitorIp}/json/`)
          const geoData = await geoResponse.json()
          visitorData.visitor_country = geoData.country_name
        } catch (e) {}

        await developerService.trackVisit(developerId, visitorData) // ✅ دالة موجودة
      }
    } catch (error) {
      console.error('Error tracking visit:', error)
    }
  }

  // ✅ جلب الإحصائيات المتقدمة (للباقات المدفوعة)
  const fetchAdvancedStats = async (developerId) => {
    try {
      const stats = await statsService.getAdvancedVisitorStats(developerId) // ✅ دالة موجودة
      setAdvancedStats(stats)
    } catch (error) {
      console.error('Error fetching advanced stats:', error)
    }
  }

  // ✅ دوال الباقات
  const isFreePlan = () => developer?.plan_id === 1
  const isPaidPlan = () => developer?.plan_id > 1

  // ✅ دالة اللايك (تستخدم likeService الموجود)
  const handleLike = async () => {
    if (!developer || !visitorIp) return { success: false, error: 'No developer or IP' }

    try {
      await likeService.addLike(developer.id, visitorIp) // ✅ دالة موجودة
      
      // تحديث العداد محلياً
      setDeveloper(prev => ({
        ...prev,
        likes_count: (prev.likes_count || 0) + 1
      }))

      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // ✅ الحصول على إحصائيات الزيارات (حسب الباقة)
  const getVisitStats = () => {
    if (!developer) return null

    const baseStats = {
      views: developer.views_count || 0,
      likes: developer.likes_count || 0
    }

    // الباقة المجانية: إحصائيات أساسية فقط
    if (isFreePlan()) {
      return baseStats
    }

    // الباقة المدفوعة: إحصائيات متقدمة
    return {
      ...baseStats,
      advanced: advancedStats
    }
  }

  // ✅ الدوال الموجودة مسبقاً
  const getProjects = () => developer?.projects || []
  const getSkills = () => developer?.skills || []
  const getCertificates = () => developer?.certificates || []
  const getExperience = () => developer?.experience || []
  const getEducation = () => developer?.education || []
  
  const getSocialLinks = () => {
    const links = {}
    ;(developer?.social_links || []).forEach(link => {
      links[link.platform] = link.url
    })
    return links
  }

  const getProfileImage = () => developer?.profile_image || '/Coding.gif'

  const getTotalExperienceYears = () => {
    let totalYears = 0
    ;(developer?.experience || []).forEach(exp => {
      if (exp.start_date) {
        const start = new Date(exp.start_date)
        const end = exp.is_current ? new Date() : (exp.end_date ? new Date(exp.end_date) : new Date())
        const years = (end - start) / (1000 * 60 * 60 * 24 * 365)
        totalYears += years
      }
    })
    return Math.round(totalYears * 10) / 10 || 0
  }

  const value = {
    developer,
    publicLoading: loading,
    publicError: error,
    loading,
    error,
    // ✅ دوال الباقات
    isFreePlan,
    isPaidPlan,
    // ✅ دوال اللايكات والزيارات
    handleLike,
    visitStats: getVisitStats(),
    // ✅ الدوال الموجودة
    getProjects,
    getSkills,
    getCertificates,
    getExperience,
    getEducation,
    getSocialLinks,
    getProfileImage,
    getTotalExperienceYears
  }

  return (
    <DeveloperContext.Provider value={value}>
      {children}
    </DeveloperContext.Provider>
  )
}

// دوال مساعدة صغيرة
const getDeviceType = () => {
  const ua = navigator.userAgent
  if (/Mobile|Android|iPhone/i.test(ua)) return 'mobile'
  if (/Tablet|iPad/i.test(ua)) return 'tablet'
  return 'desktop'
}

const getBrowserName = () => {
  const ua = navigator.userAgent
  if (ua.includes('Chrome')) return 'Chrome'
  if (ua.includes('Firefox')) return 'Firefox'
  if (ua.includes('Safari')) return 'Safari'
  if (ua.includes('Edge')) return 'Edge'
  return 'Other'
}
