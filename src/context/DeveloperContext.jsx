// src/context/DeveloperContext.jsx
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

    let mounted = true

    const loadDeveloper = async () => {
      try {
        setLoading(true)
        setError(null)

        console.log('📥 جلب بيانات المطور:', username)
        const data = await developerService.getByUsername(username)
        console.log('📦 بيانات المطور:', data)

        if (!mounted) return

        setDeveloper(data)

        // زيادة المشاهدات بشكل غير متزامن (لا ننتظرها)
        if (data?.id) {
          developerService.incrementViews(data.id)
        }
      } catch (err) {
        console.error('❌ خطأ في جلب المطور:', err)
        if (!mounted) return
        setError('Developer not found')
        setDeveloper(null)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadDeveloper()

    return () => { mounted = false }
  }, [username, isPublicPage])

  // دوال المساعدة (تستخدم نفس الأسماء لتوافق ملفات العرض)
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

  const getTotalExperienceYears = () => {
    let totalYears = 0
    (developer?.experience || []).forEach(exp => {
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
    getTotalExperienceYears
  }

  return (
    <DeveloperContext.Provider value={value}>
      {children}
    </DeveloperContext.Provider>
  )
}
