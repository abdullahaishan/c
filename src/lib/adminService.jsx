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
        packages (
          id,
          name,
          name_ar,
          price_monthly
        ),
        payments (
          id,
          amount,
          payment_status,
          created_at
        ),
        projects:projects(count),
        skills:skills(count),
        certifications:certifications(count)
      `)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  // جلب مطور محدد
  async getDeveloperById(developerId) {
    const { data, error } = await supabase
      .from('developers')
      .select(`
        *,
        packages (*),
        payments (*),
        projects (*),
        skills (*),
        certifications (*),
        education (*),
        work_experience (*),
        social_links (*),
        rotating_skills (*),
        developer_settings (*),
        personal_info (*)
      `)
      .eq('id', developerId)
      .single()

    if (error) throw error
    return data
  },

  // تحديث حالة المطور
  async updateDeveloperStatus(developerId, updates) {
    const { error } = await supabase
      .from('developers')
      .update({
        ...updates,
        updated_at: new Date()
      })
      .eq('id', developerId)

    if (error) throw error
    return true
  },

  // تفعيل/تعطيل المطور
  async toggleDeveloperStatus(developerId, isActive) {
    return this.updateDeveloperStatus(developerId, { 
      subscription_status: isActive ? 'active' : 'inactive',
      approved_by: isActive ? (await this.getCurrentAdminId()) : null,
      approved_at: isActive ? new Date() : null
    })
  },

  // تغيير باقة المطور
  async changeDeveloperPackage(developerId, packageId, adminId) {
    const { error } = await supabase
      .from('developers')
      .update({
        package_id: packageId,
        subscription_start: new Date(),
        subscription_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 يوم
        approved_by: adminId,
        approved_at: new Date()
      })
      .eq('id', developerId)

    if (error) throw error
    return true
  },

  // حذف مطور
  async deleteDeveloper(developerId) {
    const { error } = await supabase
      .from('developers')
      .delete()
      .eq('id', developerId)

    if (error) throw error
    return true
  },

  // البحث عن مطورين
  async searchDevelopers(query) {
    const { data, error } = await supabase
      .from('developers')
      .select('*')
      .or(`full_name.ilike.%${query}%,email.ilike.%${query}%,username.ilike.%${query}%`)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }
}

// ===========================================
// خدمات إدارة الباقات
// ===========================================
export const adminPackageService = {
  // جلب جميع الباقات
  async getAllPackages() {
    const { data, error } = await supabase
      .from('packages')
      .select('*')
      .order('sort_order')
      .order('price_monthly')

    if (error) throw error
    return data || []
  },

  // إنشاء باقة جديدة
  async createPackage(packageData) {
    const { data, error } = await supabase
      .from('packages')
      .insert([{
        ...packageData,
        created_at: new Date()
      }])
      .select()
      .single()

    if (error) throw error
    return data
  },

  // تحديث باقة
  async updatePackage(packageId, updates) {
    const { data, error } = await supabase
      .from('packages')
      .update({
        ...updates,
        updated_at: new Date()
      })
      .eq('id', packageId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // حذف باقة
  async deletePackage(packageId) {
    const { error } = await supabase
      .from('packages')
      .delete()
      .eq('id', packageId)

    if (error) throw error
    return true
  },

  // ترتيب الباقات
  async reorderPackages(packageIds) {
    for (let i = 0; i < packageIds.length; i++) {
      await supabase
        .from('packages')
        .update({ sort_order: i })
        .eq('id', packageIds[i])
    }
    return true
  },

  // تفعيل/تعطيل باقة
  async togglePackageStatus(packageId, isActive) {
    return this.updatePackage(packageId, { is_active: isActive })
  }
}

// ===========================================
// خدمات إدارة طلبات الانضمام
// ===========================================
export const adminJoinRequestService = {
  // جلب جميع طلبات الانضمام
  async getAllJoinRequests() {
    const { data, error } = await supabase
      .from('join_requests')
      .select(`
        *,
        packages (
          id,
          name,
          name_ar,
          price_monthly
        ),
        processed_by:admins!join_requests_processed_by_fkey (
          id,
          username
        )
      `)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  // الموافقة على طلب انضمام
  async approveJoinRequest(requestId, adminId) {
    // 1. جلب بيانات الطلب
    const { data: request } = await supabase
      .from('join_requests')
      .select('*')
      .eq('id', requestId)
      .single()

    if (!request) throw new Error('Request not found')

    // 2. إنشاء حساب مطور جديد
    const { data: developer, error: devError } = await supabase
      .from('developers')
      .insert([{
        username: `user_${Date.now()}`,
        email: request.email,
        password_hash: 'temporary_password', // يجب تغييره لاحقاً
        whatsapp: request.whatsapp,
        package_id: request.package_id,
        subscription_status: 'active',
        subscription_start: new Date(),
        subscription_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        approved_by: adminId,
        approved_at: new Date(),
        role: 'member'
      }])
      .select()
      .single()

    if (devError) throw devError

    // 3. تحديث حالة الطلب
    const { error: updateError } = await supabase
      .from('join_requests')
      .update({
        status: 'approved',
        processed_at: new Date(),
        processed_by: adminId
      })
      .eq('id', requestId)

    if (updateError) throw updateError

    // 4. إنشاء payment record
    if (request.amount) {
      await supabase
        .from('payments')
        .insert([{
          developer_id: developer.id,
          request_id: requestId,
          package_id: request.package_id,
          amount: request.amount,
          payment_method: request.payment_method,
          transaction_id: request.transaction_id,
          transfer_image: request.transfer_image,
          payment_status: 'approved',
          payment_date: new Date()
        }])
    }

    return { success: true, developer }
  },

  // رفض طلب انضمام
  async rejectJoinRequest(requestId, adminId, reason = '') {
    const { error } = await supabase
      .from('join_requests')
      .update({
        status: 'rejected',
        admin_notes: reason,
        processed_at: new Date(),
        processed_by: adminId
      })
      .eq('id', requestId)

    if (error) throw error
    return true
  }
}

// ===========================================
// خدمات إدارة طلبات الترقية
// ===========================================
export const adminUpgradeRequestService = {
  // جلب جميع طلبات الترقية
  async getAllUpgradeRequests() {
    const { data, error } = await supabase
      .from('upgrade_requests')
      .select(`
        *,
        developers (
          id,
          full_name,
          username,
          email,
          profile_image
        ),
        current_package_id:packages!upgrade_requests_current_package_id_fkey (
          id,
          name
        ),
        requested_package:packages!upgrade_requests_requested_package_id_fkey (
          id,
          name,
          price_monthly
        ),
        processed_by:admins!upgrade_requests_processed_by_fkey (
          id,
          username
        )
      `)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  // الموافقة على طلب ترقية
  async approveUpgradeRequest(requestId, adminId) {
    // 1. جلب بيانات الطلب
    const { data: request } = await supabase
      .from('upgrade_requests')
      .select('*')
      .eq('id', requestId)
      .single()

    if (!request) throw new Error('Request not found')

    // 2. تحديث باقة المطور
    const { error: devError } = await supabase
      .from('developers')
      .update({
        package_id: request.requested_package_id,
        pending_upgrade_id: null,
        approved_by: adminId,
        approved_at: new Date()
      })
      .eq('id', request.developer_id)

    if (devError) throw devError

    // 3. تحديث حالة الطلب
    const { error: updateError } = await supabase
      .from('upgrade_requests')
      .update({
        status: 'approved',
        processed_at: new Date(),
        processed_by: adminId
      })
      .eq('id', requestId)

    if (updateError) throw updateError

    return true
  },

  // رفض طلب ترقية
  async rejectUpgradeRequest(requestId, adminId, reason = '') {
    const { error } = await supabase
      .from('upgrade_requests')
      .update({
        status: 'rejected',
        admin_notes: reason,
        processed_at: new Date(),
        processed_by: adminId
      })
      .eq('id', requestId)

    if (error) throw error
    return true
  }
}

// ===========================================
// خدمات إدارة المدفوعات
// ===========================================
export const adminPaymentService = {
  // جلب جميع المدفوعات
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
        packages (
          id,
          name,
          name_ar
        ),
        join_requests!payments_request_id_fkey (
          id,
          email,
          whatsapp
        )
      `)
      .order('payment_date', { ascending: false })

    if (error) throw error
    return data || []
  },

  // تحديث حالة الدفع
  async updatePaymentStatus(paymentId, status, adminId) {
    const { error } = await supabase
      .from('payments')
      .update({
        payment_status: status,
        approved_by: status === 'approved' ? adminId : null,
        approved_at: status === 'approved' ? new Date() : null
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
      .eq('payment_status', 'pending')

    const { data: approved } = await supabase
      .from('payments')
      .select('*', { count: 'exact', head: true })
      .eq('payment_status', 'approved')

    const { data: totalAmount } = await supabase
      .from('payments')
      .select('amount')
      .eq('payment_status', 'approved')

    const totalRevenue = totalAmount?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0

    return {
      pending: pending || 0,
      approved: approved || 0,
      totalRevenue
    }
  }
}

// ===========================================
// خدمات إحصائيات المنصة
// ===========================================
export const adminAnalyticsService = {
  // إحصائيات عامة
  async getDashboardStats() {
    // عدد المطورين
    const { count: totalDevs } = await supabase
      .from('developers')
      .select('*', { count: 'exact', head: true })

    const { count: activeDevs } = await supabase
      .from('developers')
      .select('*', { count: 'exact', head: true })
      .eq('subscription_status', 'active')

    // طلبات الانضمام
    const { count: pendingJoin } = await supabase
      .from('join_requests')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')

    // طلبات الترقية
    const { count: pendingUpgrade } = await supabase
      .from('upgrade_requests')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')

    // المدفوعات
    const { data: payments } = await supabase
      .from('payments')
      .select('amount, payment_status')

    const totalRevenue = payments?.reduce((sum, p) => {
      return p.payment_status === 'approved' ? sum + (p.amount || 0) : sum
    }, 0) || 0

    // الزوار
    const { count: visitors } = await supabase
      .from('visitors')
      .select('*', { count: 'exact', head: true })

    // تحميل السير الذاتية
    const { count: downloads } = await supabase
      .from('cv_downloads')
      .select('*', { count: 'exact', head: true })

    return {
      developers: {
        total: totalDevs || 0,
        active: activeDevs || 0
      },
      requests: {
        join: pendingJoin || 0,
        upgrade: pendingUpgrade || 0
      },
      payments: {
        pending: payments?.filter(p => p.payment_status === 'pending').length || 0,
        approved: payments?.filter(p => p.payment_status === 'approved').length || 0,
        totalRevenue
      },
      visitors: visitors || 0,
      downloads: downloads || 0
    }
  },

  // الحصول على معرف الأدمن الحالي (مساعد)
  async getCurrentAdminId() {
    const admin = JSON.parse(localStorage.getItem('admin_session') || '{}')
    return admin.id || null
  }
}

// ===========================================
// خدمات إعدادات النظام
// ===========================================
export const adminSettingsService = {
  // جلب إعدادات النظام
  async getSettings() {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .single()

    if (error) throw error
    return data
  },

  // تحديث إعدادات النظام
  async updateSettings(updates) {
    const { data, error } = await supabase
      .from('settings')
      .update({
        ...updates,
        updated_at: new Date()
      })
      .eq('id', 1)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // جلب إعدادات الدفع
  async getPaymentSettings() {
    const { data, error } = await supabase
      .from('payment_settings')
      .select('*')
      .single()

    if (error) throw error
    return data
  },

  // تحديث إعدادات الدفع
  async updatePaymentSettings(updates) {
    const { data, error } = await supabase
      .from('payment_settings')
      .update({
        ...updates,
        updated_at: new Date()
      })
      .eq('id', 1)
      .select()
      .single()

    if (error) throw error
    return data
  }
}
