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

  // دوال المشاريع
  const getProjects = () => developer?.projects || []
  
  // دوال المهارات
  const getSkills = () => developer?.skills || []
  
  const getMainSkills = () => {
    const skills = developer?.skills || []
    return skills.filter(s => s.is_main).map(s => s.name)
  }
  
  // دوال الشهادات
  const getCertificates = () => developer?.certificates || []
  
  // دوال الخبرات
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
  
  // دوال التعليم
  const getEducation = () => developer?.education || []
  
  // دوال روابط التواصل - الأهم!
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
      linkedin: 'https://linkedin.com/in/abdullah-aishan',
      instagram: 'https://instagram.com/abdullah_aishan',
      twitter: 'https://twitter.com/abdullah_aishan',
      facebook: 'https://facebook.com/abdullah.aishan',
      youtube: 'https://youtube.com/@abdullah_aishan'
    }
  }

  // الصورة الشخصية
  const getProfileImage = () => {
    return developer?.profile_image || '/Coding.gif'
  }

  // التحقق من الباقة
  const isFreePlan = () => {
    return developer?.plan_id === 1
  }

  const value = {
    publicDeveloper: developer,
    publicLoading: loading,
    publicError: error,
    isPublicPage,
    getProjects,
    getSkills,
    getMainSkills,
    getCertificates,
    getExperience,
    getTotalExperienceYears,
    getEducation,
    getSocialLinks,
    getAdminSocialLinks,
    getProfileImage,
    isFreePlan,
  }

  return (
    <DeveloperContext.Provider value={value}>
      {children}
    </DeveloperContext.Provider>
  )
}
