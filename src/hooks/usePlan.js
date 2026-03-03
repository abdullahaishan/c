// hooks/usePlan.js
import { useState, useEffect } from 'react'
import { useAuth } from './useAuth'
import { supabase } from '../lib/supabase'

export const usePlan = () => {
  const { user } = useAuth()
  const [plan, setPlan] = useState(null)
  const [allPlans, setAllPlans] = useState([]) // جميع الباقات
  const [loading, setLoading] = useState(true)
  const [usage, setUsage] = useState(null)

  useEffect(() => {
    if (user) {
      fetchPlanData()
      fetchCurrentUsage()
    }
    fetchAllPlans() // جلب جميع الباقات حتى لو لم يسجل الدخول
  }, [user])

  // جلب جميع الباقات من قاعدة البيانات
  const fetchAllPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })

      if (error) throw error
      setAllPlans(data || [])
    } catch (error) {
      console.error('Error fetching all plans:', error)
    }
  }

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

  // جلب الباقة الحالية للمستخدم
  const getPlanId = () => user?.plan_id || 1

  // جلب حدود الباقة الحالية
  const getPlanLimits = () => {
    const currentPlan = plan || allPlans.find(p => p.id === getPlanId())
    return currentPlan || {}
  }

  // التحقق من الحدود
  const checkLimit = (type, currentCount = null) => {
    const limits = getPlanLimits()
    const count = currentCount ?? usage?.[type] ?? 0
    
    switch(type) {
      case 'projects':
        return limits.max_projects === -1 ? true : count < limits.max_projects
      case 'skills':
        return limits.max_skills === -1 ? true : count < limits.max_skills
      case 'certificates':
        return limits.max_certificates === -1 ? true : count < limits.max_certificates
      case 'experience':
        return limits.max_experience === -1 ? true : count < limits.max_experience
      case 'education':
        return limits.max_education === -1 ? true : count < limits.max_education
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
      
      if (limits.max_ai_analyses === -1) return Infinity
      return Math.max(0, (limits.max_ai_analyses || 0) - (count || 0))
    } catch (error) {
      console.error('Error:', error)
      return 0
    }
  }

  const getRemainingStorage = (usedStorage) => {
    const limits = getPlanLimits()
    return Math.max(0, limits.storage_limit - usedStorage)
  }

  const canUseFeature = (feature) => {
    const limits = getPlanLimits()
    
    switch(feature) {
      case 'advanced_stats':
        return limits.has_advanced_stats
      case 'reports':
        return limits.has_reports
      case 'priority_support':
        return limits.has_priority_support
      case 'remove_branding':
        return limits.has_remove_branding
      case 'custom_domain':
        return limits.custom_domain
      case 'analytics':
        return limits.analytics
      case 'ai_analysis':
        return limits.ai_analysis
      default:
        return false
    }
  }

  const getUsagePercentage = (type) => {
    const limits = getPlanLimits()
    const current = usage?.[type] ?? 0
    
    switch(type) {
      case 'projects':
        return limits.max_projects === -1 ? 0 : Math.min(100, (current / limits.max_projects) * 100)
      case 'skills':
        return limits.max_skills === -1 ? 0 : Math.min(100, (current / limits.max_skills) * 100)
      case 'certificates':
        return limits.max_certificates === -1 ? 0 : Math.min(100, (current / limits.max_certificates) * 100)
      case 'experience':
        return limits.max_experience === -1 ? 0 : Math.min(100, (current / limits.max_experience) * 100)
      case 'education':
        return limits.max_education === -1 ? 0 : Math.min(100, (current / limits.max_education) * 100)
      default:
        return 0
    }
  }

  return {
    planId: getPlanId(),
    currentPlan: plan,
    allPlans, // جميع الباقات من قاعدة البيانات
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
