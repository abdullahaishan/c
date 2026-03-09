import React, { createContext, useState, useContext, useEffect, useRef } from 'react'
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
  const [visitorId, setVisitorId] = useState(null)
  const [visitorCountry, setVisitorCountry] = useState(null)
  const [visitorCity, setVisitorCity] = useState(null)
  const [advancedStats, setAdvancedStats] = useState(null)
  
  const visitRecorded = useRef(false)
  const locationAttempted = useRef(false)

  // دالة إنشاء بصمة فريدة للمتصفح
  const generateFingerprint = () => {
    const components = [
      navigator.userAgent,
      navigator.language,
      screen.colorDepth,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      navigator.hardwareConcurrency || 'unknown',
      navigator.deviceMemory || 'unknown',
      !!window.indexedDB,
      !!window.openDatabase,
      !!navigator.cookieEnabled
    ]
    
    const fingerprint = components.join('|||')
    let hash = 0
    for (let i = 0; i < fingerprint.length; i++) {
      hash = ((hash << 5) - hash) + fingerprint.charCodeAt(i)
      hash = hash & hash
    }
    
    return 'fp_' + Math.abs(hash).toString(36)
  }

  // جلب الموقع في الخلفية
  const fetchLocationInBackground = async () => {
    if (locationAttempted.current) return
    locationAttempted.current = true
    
    try {
      const response = await fetch('https://ipapi.co/json/')
      const data = await response.json()
      if (data.country_name) {
        setVisitorCountry(data.country_name)
        setVisitorCity(data.city || null)
      }
    } catch (e) {
      try {
        const cfResponse = await fetch('https://1.1.1.1/cdn-cgi/trace')
        const text = await cfResponse.text()
        const lines = text.split('\n')
        const cfData = {}
        lines.forEach(line => {
          const [key, value] = line.split('=')
          if (key) cfData[key] = value
        })
        if (cfData.loc) setVisitorCountry(cfData.loc)
      } catch (cfError) {}
    }
  }

  // جلب معرف الزائر فوراً
  useEffect(() => {
    setVisitorId(generateFingerprint())
  }, [])

  // جلب بيانات المطور
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
          
          developerService.incrementViews(data.id).catch(e => {})
          
          if (data.plan_id > 1) {
            fetchLocationInBackground()
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

  // تسجيل الزيارة (مرة واحدة فقط)
  useEffect(() => {
    if (!developer || !visitorId || visitRecorded.current) return
    
    visitRecorded.current = true

    const recordVisit = async () => {
      try {
        const visitorData = {
          visitor_ip: visitorId,
          visited_at: new Date().toISOString()
        }

        if (developer.plan_id > 1) {
          visitorData.referrer = document.referrer || 'direct'
          visitorData.device_type = getDeviceType()
          visitorData.browser = getBrowserName()
          visitorData.page_visited = window.location.pathname
          visitorData.os = navigator.platform || 'unknown'
          
          if (visitorCountry) visitorData.visitor_country = visitorCountry
          if (visitorCity) visitorData.visitor_city = visitorCity

          const lastVisit = localStorage.getItem(`last_visit_${developer.id}`)
          visitorData.is_new_visitor = !lastVisit
          localStorage.setItem(`last_visit_${developer.id}`, new Date().toISOString())
          
          const month = new Date().getMonth()
          if (month >= 2 && month <= 4) visitorData.season = 'الربيع'
          else if (month >= 5 && month <= 7) visitorData.season = 'الصيف'
          else if (month >= 8 && month <= 10) visitorData.season = 'الخريف'
          else visitorData.season = 'الشتاء'
        }

        await developerService.trackVisit(developer.id, visitorData)
        
      } catch (error) {
        console.error('Error recording visit:', error)
      }
    }

    recordVisit()
  }, [developer, visitorId, visitorCountry, visitorCity])

  // تحديث الموقع إذا تم جلبها لاحقاً
  useEffect(() => {
    if (!developer || !visitorId || !visitorCountry || developer.plan_id <= 1) return
    
    const updateLocation = async () => {
      try {
        const { data: lastVisit } = await supabase
          .from('visitors')
          .select('id')
          .eq('developer_id', developer.id)
          .eq('visitor_ip', visitorId)
          .order('visited_at', { ascending: false })
          .limit(1)
          .single()
        
        if (lastVisit?.id) {
          await supabase
            .from('visitors')
            .update({
              visitor_country: visitorCountry,
              visitor_city: visitorCity
            })
            .eq('id', lastVisit.id)
        }
      } catch (e) {}
    }
    
    updateLocation()
  }, [visitorCountry, visitorCity])

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
    if (!developer || !visitorId) return { success: false, error: 'No visitor ID' }

    try {
      await likeService.addLike(developer.id, visitorId)
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
    const baseStats = { views: developer.views_count || 0, likes: developer.likes_count || 0 }
    return isFreePlan() ? baseStats : { ...baseStats, advanced: advancedStats }
  }

  // الدوال المساعدة للمحتوى
  const getProjects = () => developer?.projects || []
  const getSkills = () => developer?.skills || []
  const getCertificates = () => developer?.certificates || []
  const getExperience = () => developer?.experience || []
  const getEducation = () => developer?.education || []
  
  const getSocialLinks = () => {
    const links = {}
    ;(developer?.social_links || []).forEach(link => links[link.platform] = link.url)
    return links
  }

  const getProfileImage = () => developer?.profile_image || '/Coding.gif'

  const getTotalExperienceYears = () => {
    let totalYears = 0
    ;(developer?.experience || []).forEach(exp => {
      if (exp.start_date) {
        const start = new Date(exp.start_date)
        const end = exp.is_current ? new Date() : (exp.end_date ? new Date(exp.end_date) : new Date())
        totalYears += (end - start) / (1000 * 60 * 60 * 24 * 365)
      }
    })
    return Math.round(totalYears * 10) / 10 || 0
  }

  const getMainSkills = () => {
    if (!developer?.skills || developer.skills.length === 0) return []
    const mainSkills = developer.skills.filter(skill => skill.is_main).map(skill => skill.name)
    return mainSkills.length ? mainSkills : developer.skills.map(skill => skill.name)
  }

  const getSkillsByCategory = (category) => {
    return developer?.skills?.filter(skill => skill.category === category) || []
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
