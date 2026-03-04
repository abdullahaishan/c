// context/DashboardDataContext.jsx
import React, { createContext, useContext, useState, useCallback, useRef } from 'react'
import { statsService } from '../lib/supabase'

const DashboardDataContext = createContext()

export const useDashboardData = () => {
  const context = useContext(DashboardDataContext)
  if (!context) throw new Error('useDashboardData must be used within DashboardDataProvider')
  return context
}

export const DashboardDataProvider = ({ children, userId }) => {
  // ✅ كاش للبيانات مع وقت انتهاء
  const cache = useRef({})
  const [loading, setLoading] = useState({})
  
  // ✅ دالة عامة لجلب البيانات مع الكاش
  const fetchWithCache = useCallback(async (key, fetchFn, options = {}) => {
    const { staleTime = 5 * 60 * 1000 } = options // 5 دقائق افتراضي
    
    // إذا في الكاش وما زال صالح، استخدمه
    if (cache.current[key] && Date.now() - cache.current[key].timestamp < staleTime) {
      return cache.current[key].data
    }
    
    // جلب بيانات جديدة
    setLoading(prev => ({ ...prev, [key]: true }))
    try {
      const data = await fetchFn()
      cache.current[key] = {
        data,
        timestamp: Date.now()
      }
      return data
    } finally {
      setLoading(prev => ({ ...prev, [key]: false }))
    }
  }, [])

  // ✅ دوال محددة لكل نوع من البيانات
  const getDashboardStats = useCallback((forceRefresh = false) => {
    if (forceRefresh) {
      delete cache.current[`dashboard_${userId}`]
    }
    return fetchWithCache(
      `dashboard_${userId}`,
      () => statsService.getDeveloperStats(userId),
      { staleTime: 2 * 60 * 1000 } // دقيقتين فقط للوحة الرئيسية
    )
  }, [userId, fetchWithCache])

  const getContentStats = useCallback((forceRefresh = false) => {
    if (forceRefresh) {
      delete cache.current[`content_${userId}`]
    }
    return fetchWithCache(
      `content_${userId}`,
      () => statsService.getContentStats(userId),
      { staleTime: 5 * 60 * 1000 } // 5 دقائق للمحتوى
    )
  }, [userId, fetchWithCache])

  const getAdvancedStats = useCallback((forceRefresh = false) => {
    if (forceRefresh) {
      delete cache.current[`advanced_${userId}`]
    }
    return fetchWithCache(
      `advanced_${userId}`,
      () => statsService.getAdvancedVisitorStats(userId),
      { staleTime: 10 * 60 * 1000 } // 10 دقائق للتحليلات (تتغير ببطء)
    )
  }, [userId, fetchWithCache])

  const getAIAnalysisStats = useCallback((forceRefresh = false) => {
    if (forceRefresh) {
      delete cache.current[`ai_${userId}`]
    }
    return fetchWithCache(
      `ai_${userId}`,
      () => statsService.getAIAnalysisStats(userId),
      { staleTime: 15 * 60 * 1000 } // 15 دقيقة لتحليلات AI
    )
  }, [userId, fetchWithCache])

  // ✅ دالة لتحديث بيانات محددة (بعد إجراء عملية)
  const invalidateCache = useCallback((keyPattern) => {
    if (keyPattern) {
      // حذف مفاتيح محددة
      Object.keys(cache.current).forEach(key => {
        if (key.includes(keyPattern)) {
          delete cache.current[key]
        }
      })
    } else {
      // حذف كل الكاش
      cache.current = {}
    }
  }, [])

  return (
    <DashboardDataContext.Provider value={{
      getDashboardStats,
      getContentStats,
      getAdvancedStats,
      getAIAnalysisStats,
      invalidateCache,
      loading
    }}>
      {children}
    </DashboardDataContext.Provider>
  )
}
