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

export const DeveloperProvider = ({ children }) => {
  const [developer, setDeveloper] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)


  // ===========================================
  // دوال مساعدة للوصول للبيانات بسهولة
  // ===========================================
  const getProjects = () => developer?.projects || []
  const getSkills = () => developer?.skills || []
  const getCertificates = () => developer?.certificates || []
  const getExperience = () => developer?.experience || []
  const getEducation = () => developer?.education || []
  const getSocialLinks = () => {
    const links = {}
    (developer?.social_links || []).forEach(link => {
      links[link.platform] = link.url
    })
    return links
  }
  const getProfileImage = () => developer?.profile_image || '/Coding.gif'
  const getPlanId = () => developer?.plan_id || 1
  const isFreePlan = () => getPlanId() === 1
  const isPaidPlan = () => getPlanId() > 1

  const getStats = () => ({
    projects: getProjects().length,
    skills: getSkills().length,
    certificates: getCertificates().length,
    experience: (() => {
      let total = 0
      (getExperience() || []).forEach(exp => {
        if (exp.start_date) {
          const start = new Date(exp.start_date)
          const end = exp.is_current ? new Date() : new Date(exp.end_date || Date.now())
          total += (end - start) / (1000 * 60 * 60 * 24 * 365)
        }
      })
      return Math.round(total * 10) / 10
    })(),
    education: getEducation().length
  })

  const value = {
    developer,
    loading,
    error,
    isPublicPage,
    getProjects,
    getSkills,
    getCertificates,
    getExperience,
    getEducation,
    getSocialLinks,
    getProfileImage,
    getPlanId,
    isFreePlan,
    isPaidPlan,
    getStats
  }

  return (
    <DeveloperContext.Provider value={value}>
      {children}
    </DeveloperContext.Provider>
  )
}
