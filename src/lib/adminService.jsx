import { supabase } from './supabase'

// ===========================================
// خدمات إدارة المطورين (للوحة تحكم الأدمن فقط)
// ===========================================
export const adminDeveloperService = {
  // ✅ جلب جميع المطورين مع إحصائياتهم (مع Lazy Loading)
  async getAllDevelopers(page = 0, pageSize = 20) {
    const from = page * pageSize
    const to = from + pageSize - 1
    
    const { data, error, count } = await supabase
      .from('developers')
      .select(`
        *,
        plans (
          id,
          name,
          name_ar,
          price_monthly,
          price_yearly,
          max_projects,
          max_skills,
          max_certificates,
          max_experience,
          max_education
        )
      `, { count: 'exact' })
      .range(from, to)
      .order('created_at', { ascending: false })

    if (error) throw error

    // جلب إحصائيات إضافية لكل مطور (بشكل متوازي)
    const developersWithStats = await Promise.all(
      (data || []).map(async (dev) => {
        const [projects, skills, certificates] = await Promise.all([
          supabase.from('projects').select('*', { count: 'exact', head: true }).eq('developer_id', dev.id),
          supabase.from('skills').select('*', { count: 'exact', head: true }).eq('developer_id', dev.id),
          supabase.from('certificates').select('*', { count: 'exact', head: true }).eq('developer_id', dev.id)
        ])

        return {
          ...dev,
          stats: {
            projects: projects.count || 0,
            skills: skills.count || 0,
            certificates: certificates.count || 0
          }
        }
      })
    )

    return {
      data: developersWithStats,
      count: count || 0,
      hasMore: (from + pageSize) < (count || 0),
      nextPage: (from + pageSize) < (count || 0) ? page + 1 : null
    }
  },

  // ✅ جلب تفاصيل مطور محدد
  async getDeveloperDetails(developerId) {
    const { data, error } = await supabase
      .from('developers')
      .select(`
        *,
        plans (*),
        projects (*),
        skills (*),
        certificates (*),
        experience (*),
        education (*),
        social_links (*),
        payments (*)
      `)
      .eq('id', developerId)
      .single()

    if (error) throw error
    return data
  },

  // ✅ تحديث خطة المطور
  async updateDeveloperPlan(developerId, planId, adminId) {
    const { error } = await supabase
      .from('developers')
      .update({
        plan_id: planId,
        plan_updated_at: new Date().toISOString(),
        plan_updated_by: adminId
      })
      .eq('id', developerId)

    if (error) throw error
    return { success: true }
  },

  // ✅ تفعيل/تعطيل المطور
  async toggleDeveloperStatus(developerId, isActive, adminId) {
    const { error } = await supabase
      .from('developers')
      .update({
        is_active: isActive,
        updated_by: adminId,
        updated_at: new Date().toISOString()
      })
      .eq('id', developerId)

    if (error) throw error
    return { success: true }
  },

  // ✅ حذف مطور (مع كل بياناته)
  async deleteDeveloper(developerId) {
    const { error } = await supabase
      .from('developers')
      .delete()
      .eq('id', developerId)

    if (error) throw error
    return { success: true }
  },

  // ✅ البحث عن مطورين (مع Lazy Loading)
  async searchDevelopers(query, page = 0, pageSize = 20) {
    const from = page * pageSize
    const to = from + pageSize - 1
    
    const { data, error, count } = await supabase
      .from('developers')
      .select('*, plans(*)', { count: 'exact' })
      .or(`full_name.ilike.%${query}%,email.ilike.%${query}%,username.ilike.%${query}%`)
      .range(from, to)
      .order('created_at', { ascending: false })

    if (error) throw error

    return {
      data: data || [],
      count: count || 0,
      hasMore: (from + pageSize) < (count || 0),
      nextPage: (from + pageSize) < (count || 0) ? page + 1 : null
    }
  }
}

// ===========================================
// خدمات إدارة الباقات (Plans) - جديدة كاملة
// ===========================================
export const adminPlanService = {
  // ✅ جلب جميع الباقات (مع Lazy Loading)
  async getAllPlans(page = 0, pageSize = 10) {
    const from = page * pageSize
    const to = from + pageSize - 1
    
    const { data, error, count } = await supabase
      .from('plans')
      .select('*', { count: 'exact' })
      .range(from, to)
      .order('sort_order', { ascending: true })
      .order('price_monthly', { ascending: true })

    if (error) throw error

    // جلب عدد المشتركين لكل باقة
    const plansWithSubscribers = await Promise.all(
      (data || []).map(async (plan) => {
        const { count } = await supabase
          .from('developers')
          .select('*', { count: 'exact', head: true })
          .eq('plan_id', plan.id)

        return {
          ...plan,
          subscribers: count || 0
        }
      })
    )

    return {
      data: plansWithSubscribers,
      count: count || 0,
      hasMore: (from + pageSize) < (count || 0),
      nextPage: (from + pageSize) < (count || 0) ? page + 1 : null
    }
  },

  // ✅ جلب باقة محددة
  async getPlanById(planId) {
    const { data, error } = await supabase
      .from('plans')
      .select('*')
      .eq('id', planId)
      .single()

    if (error) throw error
    return data
  },

  // ✅ إنشاء باقة جديدة
  async createPlan(planData, adminId) {
    const { data, error } = await supabase
      .from('plans')
      .insert([{
        ...planData,
        created_at: new Date().toISOString(),
        created_by: adminId,
        is_active: true
      }])
      .select()
      .single()

    if (error) throw error
    return data
  },

  // ✅ تحديث بيانات الباقة
  async updatePlan(planId, planData, adminId) {
    const { data, error } = await supabase
      .from('plans')
      .update({
        ...planData,
        updated_at: new Date().toISOString(),
        updated_by: adminId
      })
      .eq('id', planId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // ✅ تحديث أسعار الباقة
  async updatePlanPrices(planId, prices, adminId) {
    const { data, error } = await supabase
      .from('plans')
      .update({
        price_monthly: prices.monthly,
        price_yearly: prices.yearly || null,
        price_lifetime: prices.lifetime || null,
        updated_at: new Date().toISOString(),
        updated_by: adminId
      })
      .eq('id', planId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // ✅ تحديث حدود الباقة
  async updatePlanLimits(planId, limits, adminId) {
    const { data, error } = await supabase
      .from('plans')
      .update({
        max_projects: limits.max_projects,
        max_skills: limits.max_skills,
        max_certificates: limits.max_certificates,
        max_experience: limits.max_experience,
        max_education: limits.max_education,
        storage_limit: limits.storage_limit,
        updated_at: new Date().toISOString(),
        updated_by: adminId
      })
      .eq('id', planId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // ✅ تحديث مميزات الباقة
  async updatePlanFeatures(planId, features, adminId) {
    const { data, error } = await supabase
      .from('plans')
      .update({
        custom_domain: features.custom_domain || false,
        remove_branding: features.remove_branding || false,
        analytics: features.analytics || false,
        priority_support: features.priority_support || false,
        ai_analysis: features.ai_analysis || false,
        updated_at: new Date().toISOString(),
        updated_by: adminId
      })
      .eq('id', planId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // ✅ تفعيل/تعطيل باقة
  async togglePlanStatus(planId, isActive, adminId) {
    const { data, error } = await supabase
      .from('plans')
      .update({
        is_active: isActive,
        updated_at: new Date().toISOString(),
        updated_by: adminId
      })
      .eq('id', planId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // ✅ ترتيب الباقات
  async reorderPlans(planIds, adminId) {
    const updates = planIds.map((id, index) => ({
      id,
      sort_order: index,
      updated_at: new Date().toISOString(),
      updated_by: adminId
    }))

    const { error } = await supabase
      .from('plans')
      .upsert(updates)

    if (error) throw error
    return { success: true }
  },

  // ✅ حذف باقة
  async deletePlan(planId) {
    // التحقق من عدم وجود مشتركين
    const { count } = await supabase
      .from('developers')
      .select('*', { count: 'exact', head: true })
      .eq('plan_id', planId)

    if (count > 0) {
      throw new Error('لا يمكن حذف باقة بها مشتركين')
    }

    const { error } = await supabase
      .from('plans')
      .delete()
      .eq('id', planId)

    if (error) throw error
    return { success: true }
  },

  // ✅ نسخ باقة
  async duplicatePlan(planId, adminId) {
    // جلب الباقة الأصلية
    const { data: original } = await supabase
      .from('plans')
      .select('*')
      .eq('id', planId)
      .single()

    // إنشاء نسخة جديدة
    const { data, error } = await supabase
      .from('plans')
      .insert([{
        name: `${original.name} (نسخة)`,
        name_ar: `${original.name_ar} (نسخة)`,
        price_monthly: original.price_monthly,
        price_yearly: original.price_yearly,
        price_lifetime: original.price_lifetime,
        max_projects: original.max_projects,
        max_skills: original.max_skills,
        max_certificates: original.max_certificates,
        max_experience: original.max_experience,
        max_education: original.max_education,
        storage_limit: original.storage_limit,
        custom_domain: original.custom_domain,
        remove_branding: original.remove_branding,
        analytics: original.analytics,
        priority_support: original.priority_support,
        ai_analysis: original.ai_analysis,
        description: original.description,
        features: original.features,
        sort_order: 999,
        created_at: new Date().toISOString(),
        created_by: adminId,
        is_active: true
      }])
      .select()
      .single()

    if (error) throw error
    return data
  }
}

// ===========================================
// خدمات إدارة طلبات الاشتراك والترقية
// ===========================================
export const adminSubscriptionService = {
  // ✅ جلب جميع طلبات الاشتراك (مع Lazy Loading)
  async getAllSubscriptions(page = 0, pageSize = 20) {
    const from = page * pageSize
    const to = from + pageSize - 1
    
    const { data, error, count } = await supabase
      .from('payments')
      .select(`
        *,
        developers (
          id,
          full_name,
          username,
          email,
          profile_image,
          plan_id
        ),
        plans (
          id,
          name,
          name_ar,
          price_monthly
        )
      `, { count: 'exact' })
      .range(from, to)
      .order('created_at', { ascending: false })

    if (error) throw error

    return {
      data: data || [],
      count: count || 0,
      hasMore: (from + pageSize) < (count || 0),
      nextPage: (from + pageSize) < (count || 0) ? page + 1 : null
    }
  },

  // ✅ جلب جميع طلبات الترقية (مع Lazy Loading)
  async getAllUpgradeRequests(page = 0, pageSize = 20) {
    const from = page * pageSize
    const to = from + pageSize - 1
    
    const { data, error, count } = await supabase
      .from('upgrade_requests')
      .select(`
        *,
        developers (
          id,
          full_name,
          username,
          email,
          profile_image,
          plan_id
        ),
        current_plan:plans!upgrade_requests_current_plan_id_fkey (
          id,
          name,
          price_monthly
        ),
        requested_plan:plans!upgrade_requests_requested_plan_id_fkey (
          id,
          name,
          price_monthly,
          max_projects,
          max_skills,
          max_certificates
        )
      `, { count: 'exact' })
      .range(from, to)
      .order('created_at', { ascending: false })

    if (error) throw error

    return {
      data: data || [],
      count: count || 0,
      hasMore: (from + pageSize) < (count || 0),
      nextPage: (from + pageSize) < (count || 0) ? page + 1 : null
    }
  },

  // ✅ الموافقة على طلب اشتراك
  async approveSubscription(paymentId, adminId) {
    // 1. جلب بيانات الدفع
    const { data: payment } = await supabase
      .from('payments')
      .select('*')
      .eq('id', paymentId)
      .single()

    // 2. تحديث حالة الدفع
    await supabase
      .from('payments')
      .update({ 
        status: 'approved',
        approved_at: new Date().toISOString(),
        approved_by: adminId
      })
      .eq('id', paymentId)
    
    // 3. تحديث خطة المطور
    await supabase
      .from('developers')
      .update({ 
        plan_id: payment.plan_id,
        subscription_status: 'active',
        subscription_start: new Date().toISOString(),
        subscription_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      })
      .eq('id', payment.developer_id)

    // 4. إضافة إشعار للمطور
    await supabase
      .from('notifications')
      .insert([{
        user_id: payment.developer_id,
        title: 'تم قبول اشتراكك',
        message: 'تمت الموافقة على طلب اشتراكك. يمكنك الآن الاستفادة من مميزات الباقة.',
        type: 'success'
      }])

    return { success: true }
  },

  // ✅ رفض طلب اشتراك
  async rejectSubscription(paymentId, adminId, reason = '') {
    const { data: payment } = await supabase
      .from('payments')
      .select('*')
      .eq('id', paymentId)
      .single()

    await supabase
      .from('payments')
      .update({ 
        status: 'rejected',
        rejected_at: new Date().toISOString(),
        rejected_by: adminId,
        admin_notes: reason
      })
      .eq('id', paymentId)

    // إضافة إشعار للمطور
    await supabase
      .from('notifications')
      .insert([{
        user_id: payment.developer_id,
        title: 'تم رفض اشتراكك',
        message: reason || 'عذراً، لم يتم قبول طلب الاشتراك الخاص بك.',
        type: 'error'
      }])

    return { success: true }
  },

  // ✅ الموافقة على طلب ترقية
  async approveUpgradeRequest(requestId, adminId) {
    // 1. جلب بيانات الطلب
    const { data: request } = await supabase
      .from('upgrade_requests')
      .select('*')
      .eq('id', requestId)
      .single()

    // 2. تحديث حالة الطلب
    await supabase
      .from('upgrade_requests')
      .update({ 
        status: 'approved',
        processed_at: new Date().toISOString(),
        processed_by: adminId
      })
      .eq('id', requestId)
    
    // 3. تحديث خطة المطور
    await supabase
      .from('developers')
      .update({ 
        plan_id: request.requested_plan_id,
        plan_updated_at: new Date().toISOString()
      })
      .eq('id', request.developer_id)

    // 4. إضافة إشعار للمطور
    await supabase
      .from('notifications')
      .insert([{
        user_id: request.developer_id,
        title: 'تمت ترقية باقتك',
        message: 'تمت الموافقة على طلب ترقية باقتك بنجاح.',
        type: 'success'
      }])

    return { success: true }
  },

  // ✅ رفض طلب ترقية
  async rejectUpgradeRequest(requestId, adminId, reason = '') {
    const { data: request } = await supabase
      .from('upgrade_requests')
      .select('*')
      .eq('id', requestId)
      .single()

    await supabase
      .from('upgrade_requests')
      .update({ 
        status: 'rejected',
        processed_at: new Date().toISOString(),
        processed_by: adminId,
        admin_notes: reason
      })
      .eq('id', requestId)

    // إضافة إشعار للمطور
    await supabase
      .from('notifications')
      .insert([{
        user_id: request.developer_id,
        title: 'تم رفض طلب الترقية',
        message: reason || 'عذراً، لم يتم قبول طلب ترقية باقتك.',
        type: 'error'
      }])

    return { success: true }
  },

  // ✅ إحصائيات الاشتراكات
  async getSubscriptionStats() {
    const { data: pendingSubs } = await supabase
      .from('payments')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')

    const { data: pendingUpgrades } = await supabase
      .from('upgrade_requests')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')

    const { data: activeSubs } = await supabase
      .from('developers')
      .select('*', { count: 'exact', head: true })
      .eq('subscription_status', 'active')
      .gt('plan_id', 1)

    const { data: totalRevenue } = await supabase
      .from('payments')
      .select('amount')
      .eq('status', 'approved')

    const revenue = totalRevenue?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0

    return {
      pendingSubscriptions: pendingSubs || 0,
      pendingUpgrades: pendingUpgrades || 0,
      activeSubscribers: activeSubs || 0,
      totalRevenue: revenue
    }
  }
}

// ===========================================
// خدمات مراقبة حدود الباقات
// ===========================================
export const adminPlanMonitorService = {
  // ✅ التحقق من تجاوز حدود الباقة (مع Lazy Loading)
  async checkPlanOverages(page = 0, pageSize = 20) {
    const from = page * pageSize
    const to = from + pageSize - 1
    
    const { data: developers, count } = await supabase
      .from('developers')
      .select('id, full_name, email, plan_id', { count: 'exact' })
      .gt('plan_id', 1)
      .range(from, to)

    const overages = []

    for (const dev of developers || []) {
      const { data: plan } = await supabase
        .from('plans')
        .select('max_projects, max_skills, max_certificates, max_experience, max_education')
        .eq('id', dev.plan_id)
        .single()

      const [projects, skills, certificates] = await Promise.all([
        supabase.from('projects').select('*', { count: 'exact', head: true }).eq('developer_id', dev.id),
        supabase.from('skills').select('*', { count: 'exact', head: true }).eq('developer_id', dev.id),
        supabase.from('certificates').select('*', { count: 'exact', head: true }).eq('developer_id', dev.id)
      ])

      const issues = []
      const details = {}

      if ((projects.count || 0) > plan.max_projects) {
        issues.push('مشاريع')
        details.projects = { current: projects.count || 0, limit: plan.max_projects }
      }
      if ((skills.count || 0) > plan.max_skills) {
        issues.push('مهارات')
        details.skills = { current: skills.count || 0, limit: plan.max_skills }
      }
      if ((certificates.count || 0) > plan.max_certificates) {
        issues.push('شهادات')
        details.certificates = { current: certificates.count || 0, limit: plan.max_certificates }
      }

      if (issues.length > 0) {
        overages.push({
          developer: {
            id: dev.id,
            full_name: dev.full_name,
            email: dev.email
          },
          issues,
          details,
          plan_id: dev.plan_id
        })
      }
    }

    return {
      data: overages,
      total: count || 0,
      hasMore: (from + pageSize) < (count || 0),
      nextPage: (from + pageSize) < (count || 0) ? page + 1 : null
    }
  },

  // ✅ جلب إحصائيات استخدام الباقات
  async getPlanUsageStats() {
    const { data: plans } = await supabase
      .from('plans')
      .select('id, name, max_projects, max_skills, max_certificates')
      .eq('is_active', true)

    const stats = []

    for (const plan of plans || []) {
      const { data: developers } = await supabase
        .from('developers')
        .select('id')
        .eq('plan_id', plan.id)

      let totalProjects = 0
      let totalSkills = 0
      let totalCertificates = 0
      let nearLimit = 0
      let overLimit = 0

      for (const dev of developers || []) {
        const [projects, skills, certificates] = await Promise.all([
          supabase.from('projects').select('*', { count: 'exact', head: true }).eq('developer_id', dev.id),
          supabase.from('skills').select('*', { count: 'exact', head: true }).eq('developer_id', dev.id),
          supabase.from('certificates').select('*', { count: 'exact', head: true }).eq('developer_id', dev.id)
        ])

        totalProjects += projects.count || 0
        totalSkills += skills.count || 0
        totalCertificates += certificates.count || 0

        const usage = (projects.count || 0) / plan.max_projects
        if (usage > 1) overLimit++
        else if (usage > 0.8) nearLimit++
      }

      stats.push({
        plan: plan.name,
        subscribers: developers?.length || 0,
        totalProjects,
        totalSkills,
        totalCertificates,
        nearLimit,
        overLimit
      })
    }

    return stats
  }
}

// ===========================================
// خدمات الإشعارات (للوحة تحكم الأدمن)
// ===========================================
export const adminNotificationService = {
  // ✅ إنشاء إشعار لمطور معين
  async sendToDeveloper(developerId, notification) {
    const { error } = await supabase
      .from('notifications')
      .insert([{
        user_id: developerId,
        title: notification.title,
        message: notification.message,
        type: notification.type || 'info',
        data: notification.data || null
      }])

    if (error) throw error
    return { success: true }
  },

  // ✅ إنشاء إشعار لجميع المطورين
  async broadcastToAll(notification) {
    const { data: developers } = await supabase
      .from('developers')
      .select('id')

    const notifications = developers.map(d => ({
      user_id: d.id,
      title: notification.title,
      message: notification.message,
      type: notification.type || 'info',
      data: notification.data || null
    }))

    const { error } = await supabase
      .from('notifications')
      .insert(notifications)

    if (error) throw error
    return { success: true }
  },

  // ✅ إنشاء إشعار للمشتركين فقط
  async broadcastToSubscribers(notification) {
    const { data: subscribers } = await supabase
      .from('developers')
      .select('id')
      .gt('plan_id', 1)

    const notifications = subscribers.map(d => ({
      user_id: d.id,
      title: notification.title,
      message: notification.message,
      type: notification.type || 'info',
      data: notification.data || null
    }))

    const { error } = await supabase
      .from('notifications')
      .insert(notifications)

    if (error) throw error
    return { success: true }
  },

  // ✅ جلب إشعارات غير مقروءة (مع Lazy Loading)
  async getUnreadNotifications(adminId, page = 0, pageSize = 20) {
    const from = page * pageSize
    const to = from + pageSize - 1
    
    const { data, error, count } = await supabase
      .from('admin_notifications')
      .select('*', { count: 'exact' })
      .eq('is_read', false)
      .range(from, to)
      .order('created_at', { ascending: false })

    if (error) throw error

    return {
      data: data || [],
      count: count || 0,
      hasMore: (from + pageSize) < (count || 0),
      nextPage: (from + pageSize) < (count || 0) ? page + 1 : null
    }
  },

  // ✅ تحديث حالة القراءة
  async markAsRead(notificationIds) {
    const { error } = await supabase
      .from('admin_notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .in('id', notificationIds)

    if (error) throw error
    return { success: true }
  }
}

// ===========================================
// خدمات إحصائيات المنصة (للوحة تحكم الأدمن)
// ===========================================
export const adminStatsService = {
  // ✅ إحصائيات عامة
  async getDashboardStats() {
    const [
      developers,
      activeDevelopers,
      projects,
      payments,
      subscriptions
    ] = await Promise.all([
      supabase.from('developers').select('*', { count: 'exact', head: true }),
      supabase.from('developers').select('*', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('projects').select('*', { count: 'exact', head: true }),
      supabase.from('payments').select('amount').eq('status', 'approved'),
      supabase.from('developers').select('*', { count: 'exact', head: true }).gt('plan_id', 1)
    ])

    const totalRevenue = payments.data?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0

    return {
      totalDevelopers: developers.count || 0,
      activeDevelopers: activeDevelopers.count || 0,
      totalProjects: projects.count || 0,
      totalRevenue,
      paidSubscribers: subscriptions.count || 0
    }
  },

  // ✅ إحصائيات النمو
  async getGrowthStats(days = 30) {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const [developers, payments] = await Promise.all([
      supabase
        .from('developers')
        .select('created_at')
        .gte('created_at', startDate.toISOString()),
      supabase
        .from('payments')
        .select('created_at, amount')
        .eq('status', 'approved')
        .gte('created_at', startDate.toISOString())
    ])

    // تجميع حسب اليوم
    const dailyStats = {}
    const today = new Date()

    for (let i = 0; i < days; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const key = date.toISOString().split('T')[0]
      dailyStats[key] = { developers: 0, revenue: 0 }
    }

    developers.data?.forEach(dev => {
      const key = new Date(dev.created_at).toISOString().split('T')[0]
      if (dailyStats[key]) dailyStats[key].developers++
    })

    payments.data?.forEach(pay => {
      const key = new Date(pay.created_at).toISOString().split('T')[0]
      if (dailyStats[key]) dailyStats[key].revenue += pay.amount || 0
    })

    return Object.entries(dailyStats).map(([date, stats]) => ({
      date,
      ...stats
    }))
  }
}
