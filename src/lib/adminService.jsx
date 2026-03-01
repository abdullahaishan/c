import { supabase } from './supabase'

// ===========================================
// خدمات إدارة المطورين
// ===========================================
export const adminDeveloperService = {
  // جلب جميع المطورين مع بياناتهم الكاملة
  async getAllDevelopers() {
    const { data, error } = await supabase
      .from('developers')
      .select(`
        *,
        plans (
          id,
          name,
          name_ar,
          price_monthly
        ),
        payments (
          id,
          amount,
          status,
          created_at
        ),
        projects:projects(count),
        skills:skills(count),
        certificates:certificates(count)
      `)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  // تحديث حالة المطور (تفعيل/تعطيل)
  async toggleDeveloperStatus(developerId, isActive) {
    const { error } = await supabase
      .from('developers')
      .update({ 
        is_active: isActive,
        updated_at: new Date()
      })
      .eq('id', developerId)

    if (error) throw error
    return true
  },

  // تغيير خطة المطور يدوياً
  async changeDeveloperPlan(developerId, planId) {
    const { error } = await supabase
      .from('developers')
      .update({ 
        plan_id: planId,
        updated_at: new Date()
      })
      .eq('id', developerId)

    if (error) throw error
    return true
  },

  // حذف مطور نهائياً (مع كل بياناته)
  async deleteDeveloper(developerId) {
    const { error } = await supabase
      .from('developers')
      .delete()
      .eq('id', developerId)

    if (error) throw error
    return true
  },

  // البحث عن مطور
  async searchDevelopers(query) {
    const { data, error } = await supabase
      .from('developers')
      .select('*')
      .or(`full_name.ilike.%${query}%,email.ilike.%${query}%,username.ilike.%${query}%`)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  // إحصائيات المطورين
  async getDeveloperStats() {
    const { data: total } = await supabase
      .from('developers')
      .select('*', { count: 'exact', head: true })

    const { data: active } = await supabase
      .from('developers')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)

    const { data: newThisMonth } = await supabase
      .from('developers')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', new Date(new Date().setDate(1)).toISOString())

    return {
      total: total || 0,
      active: active || 0,
      newThisMonth: newThisMonth || 0
    }
  }
}

// ===========================================
// خدمات إدارة الباقات والمدفوعات
// ===========================================
export const adminPlanService = {
  // جلب جميع الباقات
  async getAllPlans() {
    const { data, error } = await supabase
      .from('plans')
      .select('*')
      .order('sort_order')

    if (error) throw error
    return data || []
  },

  // إنشاء باقة جديدة
  async createPlan(planData) {
    const { data, error } = await supabase
      .from('plans')
      .insert([{
        ...planData,
        created_at: new Date()
      }])
      .select()
      .single()

    if (error) throw error
    return data
  },

  // تحديث باقة
  async updatePlan(planId, updates) {
    const { data, error } = await supabase
      .from('plans')
      .update({
        ...updates,
        updated_at: new Date()
      })
      .eq('id', planId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // حذف باقة
  async deletePlan(planId) {
    const { error } = await supabase
      .from('plans')
      .delete()
      .eq('id', planId)

    if (error) throw error
    return true
  },

  // ترتيب الباقات
  async reorderPlans(planIds) {
    for (let i = 0; i < planIds.length; i++) {
      await supabase
        .from('plans')
        .update({ sort_order: i })
        .eq('id', planIds[i])
    }
    return true
  },

  // إحصائيات الباقات
  async getPlanStats() {
    const { data: plans } = await supabase
      .from('plans')
      .select('id, name, price_monthly')

    const stats = []
    for (const plan of plans || []) {
      const { count } = await supabase
        .from('developers')
        .select('*', { count: 'exact', head: true })
        .eq('plan_id', plan.id)

      stats.push({
        ...plan,
        subscribers: count || 0
      })
    }
    return stats
  }
}

// ===========================================
// خدمات إدارة المدفوعات
// ===========================================
export const adminPaymentService = {
  // جلب جميع طلبات الدفع
  async getAllPayments() {
    const { data, error } = await supabase
      .from('payments')
      .select(`
        *,
        developers (
          id,
          full_name,
          username,
          email,
          profile_image
        ),
        plans (
          id,
          name,
          name_ar
        )
      `)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  // الموافقة على طلب دفع
  async approvePayment(paymentId, adminId) {
    // 1. جلب بيانات الدفع
    const { data: payment } = await supabase
      .from('payments')
      .select('*')
      .eq('id', paymentId)
      .single()

    if (!payment) throw new Error('Payment not found')

    // 2. تحديث حالة الدفع
    const { error: updateError } = await supabase
      .from('payments')
      .update({
        status: 'approved',
        approved_at: new Date(),
        approved_by: adminId
      })
      .eq('id', paymentId)

    if (updateError) throw updateError

    // 3. ترقية حساب المطور
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30) // 30 يوم

    const { error: developerError } = await supabase
      .from('developers')
      .update({
        plan_id: payment.plan_id,
        plan_expires_at: expiresAt.toISOString()
      })
      .eq('id', payment.developer_id)

    if (developerError) throw developerError

    return true
  },

  // رفض طلب دفع
  async rejectPayment(paymentId, reason = '') {
    const { error } = await supabase
      .from('payments')
      .update({
        status: 'rejected',
        admin_notes: reason
      })
      .eq('id', paymentId)

    if (error) throw error
    return true
  },

  // إحصائيات المدفوعات
  async getPaymentStats() {
    const { data: pending } = await supabase
      .from('payments')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')

    const { data: approved } = await supabase
      .from('payments')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'approved')

    const { data: totalAmount } = await supabase
      .from('payments')
      .select('amount')
      .eq('status', 'approved')

    const totalRevenue = totalAmount?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0

    return {
      pending: pending || 0,
      approved: approved || 0,
      totalRevenue
    }
  },

  // جلب المدفوعات حسب الشهر
  async getPaymentsByMonth(months = 6) {
    const { data } = await supabase
      .rpc('get_payments_by_month', { months_ago: months })

    return data || []
  }
}

// ===========================================
// خدمات إحصائيات المنصة
// ===========================================
export const adminAnalyticsService = {
  // إحصائيات عامة
  async getDashboardStats() {
    const [devStats, planStats, paymentStats] = await Promise.all([
      adminDeveloperService.getDeveloperStats(),
      adminPlanService.getPlanStats(),
      adminPaymentService.getPaymentStats()
    ])

    // عدد المشاريع المنشورة
    const { count: projectsCount } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'published')

    // عدد الزيارات الكلي
    const { data: views } = await supabase
      .from('developers')
      .select('views_count')
    
    const totalViews = views?.reduce((sum, d) => sum + (d.views_count || 0), 0) || 0

    return {
      developers: devStats,
      plans: planStats,
      payments: paymentStats,
      projects: projectsCount || 0,
      totalViews
    }
  },

  // إحصائيات النمو الشهري
  async getGrowthStats() {
    const { data } = await supabase
      .rpc('get_growth_stats')
    
    return data || []
  },

  // إحصائيات حسب الدولة (من الزوار)
  async getCountryStats() {
    const { data } = await supabase
      .from('visitors')
      .select('visitor_country, count')
      .group('visitor_country')
      .order('count', { ascending: false })
      .limit(10)

    return data || []
  }
}
