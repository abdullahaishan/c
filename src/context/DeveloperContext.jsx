// src/context/DeveloperContext.jsx
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

export const DeveloperProvider = ({ children, username }) => {
  const [developer, setDeveloper] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!username) return

    const fetchDeveloper = async () => {
      try {
        setLoading(true)
        setError(null)

        // 1️⃣ جلب البيانات الأساسية (المطور + المهارات فقط)
        const basicData = await developerService.getByUsername(username)
        
        if (!basicData) {
          setDeveloper(null)
          setError("Developer not found")
          setLoading(false)
          return
        }

        // 2️⃣ عرض البيانات الأساسية فوراً
        setDeveloper(basicData)
        
        // 3️⃣ جلب باقي البيانات في الخلفية (فقط المعرفات)
        if (basicData?.id) {
          try {
            // جلب المشاريع (فقط المعرفات)
            const projects = await developerService.getDeveloperProjects(basicData.id)
            
            // جلب الشهادات (فقط المعرفات)
            const certificates = await developerService.getDeveloperCertificates(basicData.id)
            
            // جلب الخبرات (فقط المعرفات)
            const experience = await developerService.getDeveloperExperience(basicData.id)
            
            // جلب التعليم (فقط المعرفات)
            const education = await developerService.getDeveloperEducation(basicData.id)
            
            // جلب روابط التواصل (فقط المعرفات)
            const socialLinks = await developerService.getDeveloperSocialLinks(basicData.id)

            // 4️⃣ تحديث البيانات مع المعرفات فقط
            setDeveloper(prev => ({
              ...prev,
              projects: projects,
              certificates: certificates,
              experience: experience,
              education: education,
              social_links: socialLinks
            }))
          } catch (backgroundError) {
            // لا تفعل شيئاً - البيانات الأساسية ظهرت بالفعل
            console.log('Background fetch completed with some errors')
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

  // دوال المساعدة
  const getProjects = () => developer?.projects || []
  
  const getMainSkills = () => {
    if (!Array.isArray(developer?.skills)) return [];
    return developer.skills
      .filter(skill => skill.is_main)
      .map(skill => skill.name);
  }
  
  const getSkills = () => developer?.skills || []
  const getCertificates = () => developer?.certificates || []
  const getExperience = () => developer?.experience || []
  const getEducation = () => developer?.education || []
  
  const getSocialLinks = () => {
    const links = {}
    
    // إذا كانت social_links موجودة ولها محتوى
    if (developer?.social_links && developer.social_links.length > 0) {
      // إذا كانت تحتوي على platform (بيانات كاملة)
      if (developer.social_links[0]?.platform) {
        developer.social_links.forEach(link => {
          links[link.platform] = link.url
        })
      }
    }
    
    // إذا لم نجد روابط، نستخدم الروابط الافتراضية
    if (Object.keys(links).length === 0) {
      return getAdminSocialLinks()
    }
    
    return links
  }

  const getProfileImage = () => developer?.profile_image || '/Coding.gif'

  const getTotalExperienceYears = () => {
    let totalYears = 0
    
    if (developer?.experience && developer.experience.length > 0) {
      // إذا كانت تحتوي على start_date (بيانات كاملة)
      if (developer.experience[0]?.start_date) {
        developer.experience.forEach(exp => {
          if (exp.start_date) {
            const start = new Date(exp.start_date)
            const end = exp.is_current ? new Date() : (exp.end_date ? new Date(exp.end_date) : new Date())
            const years = (end - start) / (1000 * 60 * 60 * 24 * 365)
            totalYears += years
          }
        })
      }
    }
    
    return Math.round(totalYears * 10) / 10 || 0
  }

  const isFreePlan = () => developer?.plan_id === 1
  const isPaidPlan = () => developer?.plan_id > 1
  
  const getAdminSocialLinks = () => ({
    facebook: "https://facebook.com/abdullah.aishan.2025",
    instagram: "https://instagram.com/aishan.2025",
    whatsapp: "https://wa.me/967771315459"
  })

  const value = {
    developer,
    publicLoading: loading,
    publicError: error,
    loading,
    error,
    isFreePlan,
    isPaidPlan,
    getProjects,
    getSkills,
    getMainSkills,
    getCertificates,
    getExperience,
    getEducation,
    getSocialLinks,
    getAdminSocialLinks,
    getProfileImage,
    getTotalExperienceYears
  }

  return (
    <DeveloperContext.Provider value={value}>
      {children}
    </DeveloperContext.Provider>
  )
}
