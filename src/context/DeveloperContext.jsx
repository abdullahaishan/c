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

        const data = await developerService.getByUsername(username)

        if (!data) {
          setDeveloper(null)
          setError("Developer not found")
        } else {
          setDeveloper(data)
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

  // دوال المساعدة - معدلة للتعامل مع البيانات غير الموجودة
  const getProjects = () => [] // لا يوجد مشاريع بعد
  
  const getMainSkills = () => {
    if (!Array.isArray(developer?.skills)) return [];
    return developer.skills
      .filter(skill => skill.is_main)
      .map(skill => skill.name);
  }
  
  const getSkills = () => developer?.skills || []
  const getCertificates = () => [] // لا يوجد شهادات بعد
  const getExperience = () => [] // لا يوجد خبرات بعد
  const getEducation = () => [] // لا يوجد تعليم بعد
  
  const getSocialLinks = () => {
    // روابط التواصل الافتراضية من الإعدادات
    return {
      facebook: "https://facebook.com/abdullah.aishan.2025",
      instagram: "https://instagram.com/aishan.2025",
      whatsapp: "https://wa.me/967771315459"
    }
  }

  const getProfileImage = () => developer?.profile_image || '/Coding.gif'

  const getTotalExperienceYears = () => 0 // لا توجد خبرات بعد

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
