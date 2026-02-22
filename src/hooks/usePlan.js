import { useAuth } from './useAuth'

// حدود الباقات
const PLAN_LIMITS = {
  1: { // Free
    maxProjects: 3,
    maxSkills: 10,
    maxCertificates: 3,
    maxExperience: 5,
    maxEducation: 5,
    storageLimit: 50, // MB
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
    canCustomDomain: true,
    canRemoveBranding: true,
    canAnalytics: true
  }
}

export const usePlan = () => {
  const { user } = useAuth()

  const getPlanId = () => user?.plan_id || 1
  const getPlanLimits = () => PLAN_LIMITS[getPlanId()] || PLAN_LIMITS[1]

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
    isFree: getPlanId() === 1,
    isBasic: getPlanId() === 2,
    isPro: getPlanId() === 3,
    isEnterprise: getPlanId() === 4
  }
}