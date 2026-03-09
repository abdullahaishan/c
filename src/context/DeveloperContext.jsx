import React, { createContext, useState, useContext, useEffect } from 'react'
import { developerService, likeService, statsService } from '../lib/supabase'

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
  const [visitorCountry, setVisitorCountry] = useState(null)
  const [visitorCity, setVisitorCity] = useState(null)
  const [advancedStats, setAdvancedStats] = useState(null)

  // جلب IP والموقع في الخلفية - لا يؤخر عرض المطور
  useEffect(() => {
    const getVisitorInfo = async () => {
      try {
        // جلب IP
        const ipResponse = await fetch('https://api.ipify.org?format=json')
        const { ip } = await ipResponse.json()
        setVisitorIp(ip)
        
        // جلب الموقع من IP (اختياري)
        try {
          const geoResponse = await fetch(`https://ipapi.co/${ip}/json/`)
          const geoData = await geoResponse.json()
          setVisitorCountry(geoData.country_name)
          setVisitorCity(geoData.city)
        } catch (e) {
          // تجاهل أخطاء جلب الموقع
        }
      } catch (error) {
        console.error('Error getting visitor info:', error)
        setVisitorIp('unknown')
      }
    }
    
    getVisitorInfo()
  }, [])

  // جلب بيانات المطور فقط - بدون انتظار IP
  useEffect(() => {
    if (!username) return

    const fetchDeveloper = async () => {
      try {
        setLoading(true)
        setError(null)

        const data = await developerService.getByUsername(username)

        if (!data) {
          setDeveloper(null)
          setError("Developer not found")
        } else {
          setDeveloper(data)
          
          // تسجيل الزيارة في الخلفية (لا ننتظرها)
          if (visitorIp) {
            trackVisit(data.id, data.plan_id)
          }
          
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

  // دوال مساعدة
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

  // تسجيل الزيارة في الخلفية
  const trackVisit = async (developerId, planId) => {
    try {
      // زيادة عدد الزيارات
      await developerService.incrementViews(developerId)

      // بيانات أساسية
      const visitorData = {
        visitor_ip: visitorIp || 'unknown',
        visited_at: new Date().toISOString()
      }

      // بيانات إضافية للباقة المدفوعة
      if (planId > 1) {
        visitorData.referrer = document.referrer || 'direct'
        visitorData.device_type = getDeviceType()
        visitorData.browser = getBrowserName()
        visitorData.page_visited = window.location.pathname
        visitorData.os = navigator.platform || 'unknown'
        visitorData.visitor_country = visitorCountry
        visitorData.visitor_city = visitorCity

        const lastVisit = localStorage.getItem(`last_visit_${developerId}`)
        visitorData.is_new_visitor = !lastVisit
        localStorage.setItem(`last_visit_${developerId}`, new Date().toISOString())
        
        const month = new Date().getMonth()
        if (month >= 2 && month <= 4) visitorData.season = 'الربيع'
        else if (month >= 5 && month <= 7) visitorData.season = 'الصيف'
        else if (month >= 8 && month <= 10) visitorData.season = 'الخريف'
        else visitorData.season = 'الشتاء'
      }

      // تسجيل الزيارة (لا ننتظر النتيجة)
      developerService.trackVisit(developerId, visitorData).catch(e => {})
      
    } catch (error) {
      // تجاهل أخطاء التتبع
    }
  }

  // جلب الإحصائيات المتقدمة
  const fetchAdvancedStats = async (developerId) => {
    try {
      const stats = await statsService.getAdvancedVisitorStats(developerId)
      setAdvancedStats(stats)
    } catch (error) {
      console.error('Error fetching advanced stats:', error)
    }
  }

  // دوال الباقات
  const isFreePlan = () => developer?.plan_id === 1
  const isPaidPlan = () => developer?.plan_id > 1

  // دالة اللايك
  const handleLike = async () => {
    if (!developer || !visitorIp) return { success: false, error: 'No developer or IP' }

    try {
      await likeService.addLike(developer.id, visitorIp)
      
      setDeveloper(prev => ({
        ...prev,
        likes_count: (prev.likes_count || 0) + 1
      }))

      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // الحصول على إحصائيات الزيارات
  const getVisitStats = () => {
    if (!developer) return null

    const baseStats = {
      views: developer.views_count || 0,
      likes: developer.likes_count || 0
    }

    if (isFreePlan()) {
      return baseStats
    }

    return {
      ...baseStats,
      advanced: advancedStats
    }
  }

  // الدوال المساعدة للمحتوى
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

  const getMainSkills = () => {
    if (!developer?.skills || developer.skills.length === 0) return []
    
    const mainSkillsList = developer.skills
      .filter(skill => skill.is_main === true)
      .map(skill => skill.name)
    
    if (mainSkillsList.length === 0) {
      return developer.skills.map(skill => skill.name)
    }
    
    return mainSkillsList
  }

  const getSkillsByCategory = (category) => {
    if (!developer?.skills) return []
    return developer.skills.filter(skill => skill.category === category)
  }

  const value = {
    developer,
    publicLoading: loading,
    publicError: error,
    loading,
    error,
    isFreePlan,
    isPaidPlan,
    handleLike,
    visitStats: getVisitStats(),
    getProjects,
    getSkills,
    getCertificates,
    getExperience,
    getEducation,
    getSocialLinks,
    getProfileImage,
    getTotalExperienceYears,
    getMainSkills,
    getSkillsByCategory
  }

  return (
    <DeveloperContext.Provider value={value}>
      {children}
    </DeveloperContext.Provider>
  )
}
