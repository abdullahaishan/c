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
    // فقط إذا كنا في صفحة عامة نحمل بيانات المطور
    if (!isPublicPage || !username) {
      return
    }

    const loadDeveloper = async () => {
      try {
        setLoading(true)
        setError(null)
        console.log('Loading public developer:', username)
        
        const data = await developerService.getByUsername(username)
        setDeveloper(data)
        
        // تسجيل الزيارة
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

  // دوال مساعدة - فقط للصفحات العامة
  const getProjects = () => developer?.projects || []
  const getSkills = () => developer?.skills || []
  const getCertificates = () => developer?.certificates || []
  const getExperience = () => developer?.experience || []
  const getEducation = () => developer?.education || []
  const getSocialLinks = () => {
    const links = {}
    developer?.social_links?.forEach(link => {
      links[link.platform] = link.url
    })
    return links
  }

  const getProfileImage = () => {
    return developer?.profile_image || '/default-avatar.png'
  }

  const value = {
    // للصفحات العامة فقط
    publicDeveloper: developer,
    publicLoading: loading,
    publicError: error,
    isPublicPage,
    
    // دوال مساعدة
    getProjects,
    getSkills,
    getCertificates,
    getExperience,
    getEducation,
    getSocialLinks,
    getProfileImage,
  }

  return (
    <DeveloperContext.Provider value={value}>
      {children}
    </DeveloperContext.Provider>
  )
}
