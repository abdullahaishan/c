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

        // ✅ استخدام developerService.getByUsername الذي يجلب جميع الجداول
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

  // ✅ دوال المساعدة لاستخراج البيانات من الكائن الرئيسي
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
    // ✅ social_links منفصلة عن developer
    (developer?.social_links || []).forEach(link => {
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

  const isFreePlan = () => developer?.plan_id === 1
  const isPaidPlan = () => developer?.plan_id > 1
  
  const getAdminSocialLinks = () => ({
    facebook: "https://facebook.com/abdullah.aishan.2025",
    instagram: "https://instagram.com/aishan.2025",
    whatsapp: "https://wa.me/967771315459"
  })

  const value = {
    developer,
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
