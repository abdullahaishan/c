import React, { createContext, useState, useContext, useEffect } from 'react'
import { developerService } from '../lib/supabase'

const DeveloperContext = createContext()

export const useDeveloper = () => {
  const context = useContext(DeveloperContext)
  if (!context) {
    throw new Error('useDeveloper must be used within DeveloperProvider')
  }
  return context
}

export const DeveloperProvider = ({ children, username }) => {  const { username } = useParams()
  const [developer, setDeveloper] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const isPublicPage = window.location.pathname.startsWith('/u/')

  useEffect(() => {
    if (!isPublicPage || !username) return

    const loadDeveloper = async () => {
      try {
        setLoading(true)
        setError(null)
        console.log('📥 جلب بيانات المطور:', username)
        
        // ✅ استخدام developerService مباشرة
        const data = await developerService.getByUsername(username)
        console.log('📦 بيانات المطور:', data)
        
        setDeveloper(data)
        
        if (data) {
          await developerService.incrementViews(data.id)
        }
      } catch (err) {
        console.error('❌ خطأ في جلب المطور:', err)
        setError('Developer not found')
      } finally {
        setLoading(false)
      }
    }

    loadDeveloper()
  }, [username, isPublicPage])

  // ===========================================
  // دوال المشاريع
  // ===========================================
  const getProjects = () => developer?.projects || []
  
  // ===========================================
  // دوال المهارات
  // ===========================================
  const getSkills = () => developer?.skills || []
  
  const getMainSkills = () => {
    const skills = developer?.skills || []
    const mainSkills = skills.filter(s => s.is_main === true)
    if (mainSkills.length === 0) {
      return skills.slice(0, 4).map(s => s.name)
    }
    return mainSkills.map(s => s.name)
  }
  
  const getSkillsWithLevel = () => {
    const skills = developer?.skills || []
    return skills.map(s => ({
      name: s.name,
      level: s.proficiency || 0,
      category: s.category || 'Other',
      is_main: s.is_main || false,
      color: s.color || 'from-blue-500 to-cyan-500',
      description: s.description || '',
      years_of_experience: s.years_of_experience || 0,
      icon: s.icon || ''
    }))
  }
  
  // ===========================================
  // دوال الشهادات
  // ===========================================
  const getCertificates = () => developer?.certificates || []
  
  // ===========================================
  // دوال الخبرات
  // ===========================================
  const getExperience = () => developer?.experience || []
  
  const getTotalExperienceYears = () => {
    let totalYears = 0
    developer?.experience?.forEach(exp => {
      if (exp.start_date) {
        const start = new Date(exp.start_date)
        const end = exp.is_current ? new Date() : new Date(exp.end_date)
        const years = (end - start) / (1000 * 60 * 60 * 24 * 365)
        totalYears += years
      }
    })
    return Math.round(totalYears * 10) / 10 || 0
  }
  
  // ===========================================
  // دوال التعليم
  // ===========================================
  const getEducation = () => developer?.education || []
  
  // ===========================================
  // ⭐ دوال روابط التواصل - الأهم
  // ===========================================
  const getSocialLinks = () => {
    const links = {}
    developer?.social_links?.forEach(link => {
      links[link.platform] = link.url
    })
    return links
  }

  // روابط الأدمن (للباقة المجانية)
  const getAdminSocialLinks = () => {
    return {
      github: 'https://github.com/abdullahaishan',
      linkedin: 'https://linkedin.com/in/abdullah.aishan.2025',
      instagram: 'https://instagram.com/aishan.2025',
      twitter: 'https://twitter.com/abdullah_aishan',
      facebook: 'https://facebook.com/abdullah.aishan.2025',
      youtube: 'https://youtube.com/@abdullah_aishan',
      email: 'mailto:eng.abdullah.z.aishan@gmail.com',
      website: 'https://portfolio-v5.com/u/abdullah_aishan'
    }
  }

  // ✅ دالة للتحقق من وجود رابط معين
  const hasSocialLink = (platform) => {
    const links = getSocialLinks()
    return !!links[platform]
  }

  // ===========================================
  // الصورة الشخصية
  // ===========================================
  const getProfileImage = () => {
    return developer?.profile_image || '/Coding.gif'
  }

  // ===========================================
  // التحقق من الباقة
  // ===========================================
  const getPlanId = () => developer?.plan_id || 1
  
  const isFreePlan = () => {
    return getPlanId() === 1
  }
  
  const isPaidPlan = () => {
    return getPlanId() > 1
  }

  // ===========================================
  // الإحصائيات
  // ===========================================
  const getStats = () => {
    return {
      projects: developer?.projects?.length || 0,
      skills: developer?.skills?.length || 0,
      certificates: developer?.certificates?.length || 0,
      experience: getTotalExperienceYears(),
      education: developer?.education?.length || 0
    }
  }

  const value = {
    // البيانات الأساسية
    publicDeveloper: developer,
    publicLoading: loading,
    publicError: error,
    isPublicPage,
    
    // دوال المشاريع
    getProjects,
    
    // دوال المهارات
    getSkills,
    getMainSkills,
    getSkillsWithLevel,
    
    // دوال الشهادات
    getCertificates,
    
    // دوال الخبرات
    getExperience,
    getTotalExperienceYears,
    
    // دوال التعليم
    getEducation,
    
    // ⭐ دوال التواصل (الأهم)
    getSocialLinks,
    getAdminSocialLinks,
    hasSocialLink,
    
    // الصورة
    getProfileImage,
    
    // الباقات
    getPlanId,
    isFreePlan,
    isPaidPlan,
    
    // الإحصائيات
    getStats,
  }

  return (
    <DeveloperContext.Provider value={value}>
      {children}
    </DeveloperContext.Provider>
  )
}
