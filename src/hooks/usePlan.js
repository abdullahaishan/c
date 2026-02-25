// hooks/usePlan.js
import { useState, useEffect } from 'react'
import { useAuth } from './useAuth'
import { supabase } from '../lib/supabase'
import { PLAN_LIMITS } from '../utils/constants'

export const usePlan = () => {
  const { user } = useAuth()
  const [plan, setPlan] = useState(null)
  const [loading, setLoading] = useState(true)
  const [usage, setUsage] = useState(null)

  useEffect(() => {
    if (user) {
      fetchPlanData()
      fetchCurrentUsage()
    }
  }, [user])

  const fetchPlanData = async () => {
    try {
      const { data, error } = await supabase
        .from('developers')
        .select('plan_id, plans(*)')
        .eq('id', user.id)
        .single()

      if (error) throw error
      setPlan(data?.plans)
    } catch (error) {
      console.error('Error fetching plan:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCurrentUsage = async () => {
    if (!user) return

    try {
      const [projects, skills, certificates, experience, education, analyses] = await Promise.all([
        supabase.from('projects').select('*', { count: 'exact', head: true }).eq('developer_id', user.id),
        supabase.from('skills').select('*', { count: 'exact', head: true }).eq('developer_id', user.id),
        supabase.from('certificates').select('*', { count: 'exact', head: true }).eq('developer_id', user.id),
        supabase.from('experience').select('*', { count: 'exact', head: true }).eq('developer_id', user.id),
        supabase.from('education').select('*', { count: 'exact', head: true }).eq('developer_id', user.id),
        supabase.from('ai_analyses').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
      ])

      setUsage({
        projects: projects.count || 0,
        skills: skills.count || 0,
        certificates: certificates.count || 0,
        experience: experience.count || 0,
        education: education.count || 0,
        analyses: analyses.count || 0
      })
    } catch (error) {
      console.error('Error fetching usage:', error)
    }
  }

  const getPlanId = () => user?.plan_id || 1
  const getPlanLimits = () => PLAN_LIMITS[getPlanId()] || PLAN_LIMITS[1]

  const checkLimit = (type, currentCount = null) => {
    const limits = getPlanLimits()
    const count = currentCount ?? usage?.[type] ?? 0
    
    switch(type) {
      case 'projects':
        return limits.maxProjects === -1 ? true : count < limits.maxProjects
      case 'skills':
        return limits.maxSkills === -1 ? true : count < limits.maxSkills
      case 'certificates':
        return limits.maxCertificates === -1 ? true : count < limits.maxCertificates
      case 'experience':
        return limits.maxExperience === -1 ? true : count < limits.maxExperience
      case 'education':
        return limits.maxEducation === -1 ? true : count < limits.maxEducation
      default:
        return false
    }
  }

  const getRemainingAnalyses = async () => {
    if (!user) return 0
    
    try {
      const { count } = await supabase
        .from('ai_analyses')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
      
      const limits = getPlanLimits()
      
      if (limits.maxAiAnalyses === -1) return Infinity
      return Math.max(0, (limits.maxAiAnalyses || 0) - (count || 0))
    } catch (error) {
      console.error('Error:', error)
      return 0
    }
  }

  const getRemainingStorage = (usedStorage) => {
    const limits = getPlanLimits()
    return Math.max(0, limits.storageLimit - usedStorage)
  }

  const canUseFeature = (feature) => {
    const limits = getPlanLimits()
    
    switch(feature) {
      case 'advanced_stats':
        return limits.hasAdvancedStats
      case 'reports':
        return limits.hasReports
      case 'priority_support':
        return limits.hasPrioritySupport
      case 'remove_branding':
        return limits.hasRemoveBranding
      default:
        return false
    }
  }

  const getUsagePercentage = (type) => {
    const limits = getPlanLimits()
    const current = usage?.[type] ?? 0
    
    switch(type) {
      case 'projects':
        return limits.maxProjects === -1 ? 0 : Math.min(100, (current / limits.maxProjects) * 100)
      case 'skills':
        return limits.maxSkills === -1 ? 0 : Math.min(100, (current / limits.maxSkills) * 100)
      case 'certificates':
        return limits.maxCertificates === -1 ? 0 : Math.min(100, (current / limits.maxCertificates) * 100)
      case 'experience':
        return limits.maxExperience === -1 ? 0 : Math.min(100, (current / limits.maxExperience) * 100)
      case 'education':
        return limits.maxEducation === -1 ? 0 : Math.min(100, (current / limits.maxEducation) * 100)
      default:
        return 0
    }
  }

  return {
    planId: getPlanId(),
    limits: getPlanLimits(),
    usage,
    loading,
    checkLimit,
    getRemainingAnalyses,
    getRemainingStorage,
    canUseFeature,
    getUsagePercentage,
    refreshUsage: fetchCurrentUsage,
    isFree: getPlanId() === 1,
    isBasic: getPlanId() === 2,
    isPro: getPlanId() === 3,
    isEnterprise: getPlanId() === 4
  }
}
