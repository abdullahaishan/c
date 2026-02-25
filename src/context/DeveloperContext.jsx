import React, { createContext, useState, useContext, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { developerService } from '../lib/supabase'

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
  const [developer, setDeveloper] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // هل نحن في صفحة مطور عام؟
  const isPublicPage = window.location.pathname.startsWith('/u/')

  useEffect(() => {
    if (!isPublicPage || !username) return

    const loadDeveloper = async () => {
      try {
        setLoading(true)
        setError(null)
        console.log('Loading public developer:', username)
        
        const data = await developerService.getByUsername(username)
        setDeveloper(data)
        
        if (data) {
          await developerService.incrementViews(data.id)
        }
      } catch (err) {
        console.error('Error loading developer:', err)
        setError('المطور غير موجود')
      } finally {
        setLoading(false)
      }
    }

    loadDeveloper()
  }, [username, isPublicPage])

  // ===========================================
  // دوال مساعدة للمشاريع
  // ===========================================
  const getProjects = () => developer?.projects || []
  
  const getProjectById = (id) => {
    return developer?.projects?.find(p => p.id === id) || null
  }

  const getFeaturedProjects = (limit = 3) => {
    return developer?.projects?.slice(0, limit) || []
  }

  // ===========================================
  // دوال مساعدة للمهارات (محدثة مع الأعمدة الجديدة)
  // ===========================================
  const getSkills = () => developer?.skills || []
  
  const getMainSkills = () => developer?.skills?.filter(s => s.is_main) || []
  
  const getSkillsByCategory = (category) => {
    return developer?.skills?.filter(s => s.category === category) || []
  }
  
  const getSkillsWithDescription = () => {
    return developer?.skills?.filter(s => s.description) || []
  }
  
  const getTopSkills = (limit = 5) => {
    return developer?.skills
      ?.sort((a, b) => b.proficiency - a.proficiency)
      ?.slice(0, limit) || []
  }

  // ===========================================
  // دوال مساعدة للشهادات
  // ===========================================
  const getCertificates = () => developer?.certificates || []
  
  const getRecentCertificates = (limit = 3) => {
    return developer?.certificates
      ?.sort((a, b) => new Date(b.issue_date) - new Date(a.issue_date))
      ?.slice(0, limit) || []
  }

  // ===========================================
  // دوال مساعدة للخبرات
  // ===========================================
  const getExperience = () => developer?.experience || []
  
  const getCurrentExperience = () => {
    return developer?.experience?.filter(exp => exp.is_current) || []
  }
  
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
  // دوال مساعدة للتعليم
  // ===========================================
  const getEducation = () => developer?.education || []
  
  const getHighestEducation = () => {
    // يمكن ترتيب حسب الدرجة العلمية
    return developer?.education?.[0] || null
  }

  // ===========================================
  // دوال مساعدة لروابط التواصل
  // ===========================================
  const getSocialLinks = () => {
    const links = {}
    developer?.social_links?.forEach(link => {
      links[link.platform] = link.url
    })
    return links
  }

  // الحصول على روابط الأدمن (للباقة المجانية)
  const getAdminSocialLinks = () => {
    // هذه روابط ثابتة للأدمن abdullah_aishan
    return {
      github: 'https://github.com/abdullahaishan',
      linkedin: 'https://linkedin.com/in/abdullah-aishan',
      instagram: 'https://instagram.com/abdullah_aishan',
      twitter: 'https://twitter.com/abdullah_aishan'
    }
  }

  // ===========================================
  // دوال مساعدة للصور
  // ===========================================
  const getProfileImage = () => {
    return developer?.profile_image || '/Coding.gif'
  }
  
  const getDefaultAvatar = () => {
    return '/default-avatar.png'
  }
  
  const getProjectImage = (project) => {
    return project?.image || '/default-project.jpg'
  }

  // ===========================================
  // دوال مساعدة للإحصائيات
  // ===========================================
  const getStats = () => {
    return {
      projects: developer?.projects?.length || 0,
      skills: developer?.skills?.length || 0,
      certificates: developer?.certificates?.length || 0,
      experience: getTotalExperienceYears(),
      education: developer?.education?.length || 0,
      views: developer?.views_count || 0,
      likes: developer?.likes_count || 0
    }
  }

  // التحقق من الباقة
  const isFreePlan = () => {
    return developer?.plan_id === 1
  }

  const value = {
    // بيانات المطور
    publicDeveloper: developer,
    publicLoading: loading,
    publicError: error,
    isPublicPage,
    
    // دوال المشاريع
    getProjects,
    getProjectById,
    getFeaturedProjects,
    
    // دوال المهارات (محدثة)
    getSkills,
    getMainSkills,
    getSkillsByCategory,
    getSkillsWithDescription,
    getTopSkills,
    
    // دوال الشهادات
    getCertificates,
    getRecentCertificates,
    
    // دوال الخبرات
    getExperience,
    getCurrentExperience,
    getTotalExperienceYears,
    
    // دوال التعليم
    getEducation,
    getHighestEducation,
    
    // دوال التواصل
    getSocialLinks,
    getAdminSocialLinks,
    
    // دوال الصور
    getProfileImage,
    getDefaultAvatar,
    getProjectImage,
    
    // دوال الإحصائيات
    getStats,
    
    // التحقق من الباقة
    isFreePlan,
  }

  return (
    <DeveloperContext.Provider value={value}>
      {children}
    </DeveloperContext.Provider>
  )
}
