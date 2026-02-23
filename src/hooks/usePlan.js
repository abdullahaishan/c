import { useAuth } from './useAuth'
import { supabase } from '../lib/supabase'

// حدود الباقات
const PLAN_LIMITS = {
  1: { // Free
    maxProjects: 1,
    maxSkills: 2,
    maxCertificates: 1,
    maxExperience: 1,
    maxEducation: 1,
    storageLimit: 50,
    aiAnalysisCount: 1, // ✅ تحليل واحد مجاني
    canCustomDomain: false,
    canRemoveBranding: false,
    canAnalytics: false
  },
  2: { // Basic
    maxProjects: 10,
    maxSkills: 20,
    maxCertificates: 10,
    maxExperience: 10,
    maxEducation: 10,
    storageLimit: 200,
    aiAnalysisCount: 5, // ✅ 5 تحليلات
    canCustomDomain: false,
    canRemoveBranding: false,
    canAnalytics: true
  },
  3: { // Pro
    maxProjects: 30,
    maxSkills: 50,
    maxCertificates: 30,
    maxExperience: 20,
    maxEducation: 20,
    storageLimit: 500,
    aiAnalysisCount: 20, // ✅ 20 تحليل
    canCustomDomain: true,
    canRemoveBranding: true,
    canAnalytics: true
  },
  4: { // Enterprise
    maxProjects: 100,
    maxSkills: 100,
    maxCertificates: 100,
    maxExperience: 50,
    maxEducation: 50,
    storageLimit: 2000,
    aiAnalysisCount: -1, // ✅ غير محدود
    canCustomDomain: true,
    canRemoveBranding: true,
    canAnalytics: true
  }
}

export const usePlan = () => {
  const { user } = useAuth()

  const getPlanId = () => user?.plan_id || 1
  const getPlanLimits = () => PLAN_LIMITS[getPlanId()] || PLAN_LIMITS[1]

  // ✅ دالة جديدة لجلب عدد التحليلات المتبقية
  const getRemainingAnalyses = async () => {
    if (!user) return 0
    
    try {
      const { count, error } = await supabase
        .from('ai_analyses')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
      
      if (error) {
        console.error('Error counting analyses:', error)
        return 0
      }
      
      const limits = getPlanLimits()
      if (limits.aiAnalysisCount === -1) return Infinity // غير محدود
      
      return Math.max(0, limits.aiAnalysisCount - (count || 0))
    } catch (error) {
      console.error('Error in getRemainingAnalyses:', error)
      return 0
    }
  }

  const checkLimit = (type, currentCount) => {
    const limits = getPlanLimits()
    
    switch(type) {
      case 'projects':
        return currentCount < limits.maxProjects
      case 'skills':
        return currentCount < limits.maxSkills
      case 'certificates':
        return currentCount < limits.maxCertificates
      case 'experience':
        return currentCount < limits.maxExperience
      case 'education':
        return currentCount < limits.maxEducation
      default:
        return false
    }
  }

  const canUseFeature = (feature) => {
    const limits = getPlanLimits()
    
    switch(feature) {
      case 'custom_domain':
        return limits.canCustomDomain
      case 'remove_branding':
        return limits.canRemoveBranding
      case 'analytics':
        return limits.canAnalytics
      default:
        return false
    }
  }

  const getRemainingStorage = (usedStorage) => {
    const limits = getPlanLimits()
    return limits.storageLimit - usedStorage
  }

  return {
    planId: getPlanId(),
    limits: getPlanLimits(),
    checkLimit,
    canUseFeature,
    getRemainingStorage,
    getRemainingAnalyses, // ✅ تم إضافة هذه الدالة
    isFree: getPlanId() === 1,
    isBasic: getPlanId() === 2,
    isPro: getPlanId() === 3,
    isEnterprise: getPlanId() === 4
  }
    }
