import { createClient } from '@supabase/supabase-js'
import { imageOptimizer } from './imageOptimizer'
import { v4 as uuidv4 } from 'uuid';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ===========================================
// خدمات المطورين (Developers)
// ===========================================
export const developerService = {
  // جلب مطور بواسطة اسم المستخدم
  async getByUsername(username) {
    const { data, error } = await supabase
      .from('developers')
      .select(`
        *,
        portfolios (*),
        projects (*),
        skills (*),
        certificates (*),
        experience (*),
        education (*),
        social_links (*)
      `)
      .eq('username', username)
      .eq('is_active', true)
      .single()
    
    if (error) {
      console.error('Error fetching developer:', error)
      throw error
    }
    return data
  },

  // جلب مطور بواسطة ID
  async getById(id) {
    const { data, error } = await supabase
      .from('developers')
      .select(`
        *,
        portfolios (*),
        projects (*),
        skills (*),
        certificates (*),
        experience (*),
        education (*),
        social_links (*)
      `)
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  // تحديث بيانات المطور
  async update(id, updates) {
    const { data, error } = await supabase
      .from('developers')
      .update({
        ...updates,
        updated_at: new Date()
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // زيادة عدد المشاهدات
  async incrementViews(id) {
    const { error } = await supabase.rpc('increment_views', {
      developer_id: id
    })
    if (error) console.error('Error incrementing views:', error)
  },

  // تسجيل زيارة
  async trackVisit(developerId, visitorData) {
    const { error } = await supabase
      .from('visitors')
      .insert([{
        developer_id: developerId,
        ...visitorData
      }])
    
    if (error) console.error('Error tracking visit:', error)
  }
}

// ===========================================
// خدمات البورتفليو (Portfolios) - 🆕 جديد
// ===========================================
export const portfolioService = {
  // جلب بورتفليو بواسطة user_id
  async getByUserId(userId) {
    const { data, error } = await supabase
      .from('portfolios')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()
    
    if (error) throw error
    return data
  },

  // إنشاء بورتفليو جديد
  async create(userId, portfolioData) {
    const { data, error } = await supabase
      .from('portfolios')
      .insert([{
        user_id: userId,
        ...portfolioData,
        created_at: new Date(),
        updated_at: new Date()
      }])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // تحديث البورتفليو
  async update(id, updates) {
    const { data, error } = await supabase
      .from('portfolios')
      .update({
        ...updates,
        updated_at: new Date()
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // نشر البورتفليو
  async publish(id) {
    return this.update(id, { 
      is_published: true, 
      published_at: new Date() 
    })
  },

  // الحصول على البورتفليو العام (للعرض)
  async getPublicBySlug(slug) {
    const { data, error } = await supabase
      .from('portfolios')
      .select(`
        *,
        projects (*),
        skills (*),
        experience (*),
        education (*),
        certificates (*)
      `)
      .eq('slug', slug)
      .eq('is_published', true)
      .single()
    
    if (error) throw error
    return data
  }
}

// ===========================================
// خدمات المشاريع (Projects) - نسخة مصححة ومكتملة
// ===========================================
export const projectService = {
  // ✅ جلب مشاريع مطور معين (الأهم)
  async getByDeveloperId(developerId) {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('developer_id', developerId)
      .order('display_order', { ascending: true })
    
    if (error) {
      console.error('Error fetching projects:', error)
      throw error
    }
    return data || []
  },

  // ✅ إنشاء مشروع جديد
  async create(developerId, projectData) {
    // التحقق من وجود المشاريع الحالية
    const { data: existingProjects } = await supabase
      .from('projects')
      .select('id')
      .eq('developer_id', developerId)

    // التحقق من حد الباقة (اختياري)
    const { data: developer } = await supabase
      .from('developers')
      .select('plan_id')
      .eq('id', developerId)
      .single()

    // إذا كان مستخدم عادي (plan_id = 1) والحد 3 مشاريع
    if (developer?.plan_id === 1 && existingProjects?.length >= 3) {
      throw new Error('لقد تجاوزت الحد المسموح به من المشاريع للباقة المجانية')
    }

    const { data, error } = await supabase
      .from('projects')
      .insert([{
        developer_id: developerId,
        ...projectData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single()
    
    if (error) {
      console.error('Error creating project:', error)
      throw error
    }
    return data
  },

  // ✅ تحديث مشروع
  async update(id, updates) {
    const { data, error } = await supabase
      .from('projects')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating project:', error)
      throw error
    }
    return data
  },

  // ✅ حذف مشروع
  async delete(id) {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('Error deleting project:', error)
      throw error
    }
    return true
  }
}

// ===========================================
// خدمات المهارات (Skills) - نسخة مصححة
// ===========================================
export const skillService = {
  // ✅ جلب مهارات مطور معين
  async getByDeveloperId(developerId) {
    const { data, error } = await supabase
      .from('skills')
      .select('*')
      .eq('developer_id', developerId)
      .order('display_order', { ascending: true })
    
    if (error) {
      console.error('Error fetching skills:', error)
      throw error
    }
    return data || []
  },

  // ✅ إنشاء مهارة جديدة
  async create(developerId, skillData) {
    // التحقق من حد الباقة (اختياري)
    const { data: existingSkills } = await supabase
      .from('skills')
      .select('id')
      .eq('developer_id', developerId)

    const { data: developer } = await supabase
      .from('developers')
      .select('plan_id')
      .eq('id', developerId)
      .single()

    if (developer?.plan_id === 1 && existingSkills?.length >= 10) {
      throw new Error('لقد تجاوزت الحد المسموح به من المهارات للباقة المجانية')
    }

    const { data, error } = await supabase
      .from('skills')
      .insert([{
        developer_id: developerId,
        ...skillData,
        created_at: new Date().toISOString()
      }])
      .select()
      .single()
    
    if (error) {
      console.error('Error creating skill:', error)
      throw error
    }
    return data
  },

  // ✅ تحديث مهارة
  async update(id, updates) {
    const { data, error } = await supabase
      .from('skills')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating skill:', error)
      throw error
    }
    return data
  },

  // ✅ حذف مهارة
  async delete(id) {
    const { error } = await supabase
      .from('skills')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('Error deleting skill:', error)
      throw error
    }
    return true
  }
}

// ===========================================
// خدمات الشهادات (Certificates) - نسخة مصححة
// ===========================================
export const certificateService = {
  // ✅ جلب شهادات مطور معين
  async getByDeveloperId(developerId) {
    const { data, error } = await supabase
      .from('certificates')
      .select('*')
      .eq('developer_id', developerId)
      .order('display_order', { ascending: true })
    
    if (error) {
      console.error('Error fetching certificates:', error)
      throw error
    }
    return data || []
  },

  // ✅ إنشاء شهادة جديدة
  async create(developerId, certificateData) {
    // التحقق من حد الباقة
    const { data: existingCertificates } = await supabase
      .from('certificates')
      .select('id')
      .eq('developer_id', developerId)

    const { data: developer } = await supabase
      .from('developers')
      .select('plan_id')
      .eq('id', developerId)
      .single()

    if (developer?.plan_id === 1 && existingCertificates?.length >= 3) {
      throw new Error('لقد تجاوزت الحد المسموح به من الشهادات للباقة المجانية')
    }

    const { data, error } = await supabase
      .from('certificates')
      .insert([{
        developer_id: developerId,
        ...certificateData,
        created_at: new Date().toISOString()
      }])
      .select()
      .single()
    
    if (error) {
      console.error('Error creating certificate:', error)
      throw error
    }
    return data
  },

  // ✅ تحديث شهادة
  async update(id, updates) {
    const { data, error } = await supabase
      .from('certificates')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating certificate:', error)
      throw error
    }
    return data
  },

  // ✅ حذف شهادة
  async delete(id) {
    const { error } = await supabase
      .from('certificates')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('Error deleting certificate:', error)
      throw error
    }
    return true
  }
}
// ===========================================
// ===========================================
// خدمات الخبرات (Experience) - نسخة مصححة
// ===========================================
export const experienceService = {
  // ✅ جلب خبرات مطور معين
  async getByDeveloperId(developerId) {
    const { data, error } = await supabase
      .from('experience')
      .select('*')
      .eq('developer_id', developerId)
      .order('display_order', { ascending: true })
    
    if (error) {
      console.error('Error fetching experiences:', error)
      throw error
    }
    return data || []
  },

  // ✅ إنشاء خبرة جديدة
  async create(developerId, experienceData) {
    // التحقق من حد الباقة
    const { data: existingExperiences } = await supabase
      .from('experience')
      .select('id')
      .eq('developer_id', developerId)

    const { data: developer } = await supabase
      .from('developers')
      .select('plan_id')
      .eq('id', developerId)
      .single()

    if (developer?.plan_id === 1 && existingExperiences?.length >= 5) {
      throw new Error('لقد تجاوزت الحد المسموح به من الخبرات للباقة المجانية')
    }

    const { data, error } = await supabase
      .from('experience')
      .insert([{
        developer_id: developerId,
        ...experienceData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single()
    
    if (error) {
      console.error('Error creating experience:', error)
      throw error
    }
    return data
  },

  // ✅ تحديث خبرة
  async update(id, updates) {
    const { data, error } = await supabase
      .from('experience')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating experience:', error)
      throw error
    }
    return data
  },

  // ✅ حذف خبرة
  async delete(id) {
    const { error } = await supabase
      .from('experience')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('Error deleting experience:', error)
      throw error
    }
    return true
  }
}
// ===========================================
// خدمات التعليم (Education) - نسخة مصححة
// ===========================================
export const educationService = {
  // ✅ جلب مؤهلات مطور معين
  async getByDeveloperId(developerId) {
    const { data, error } = await supabase
      .from('education')
      .select('*')
      .eq('developer_id', developerId)
      .order('display_order', { ascending: true })
    
    if (error) {
      console.error('Error fetching education:', error)
      throw error
    }
    return data || []
  },

  // ✅ إنشاء مؤهل جديد
  async create(developerId, educationData) {
    // التحقق من حد الباقة
    const { data: existingEducation } = await supabase
      .from('education')
      .select('id')
      .eq('developer_id', developerId)

    const { data: developer } = await supabase
      .from('developers')
      .select('plan_id')
      .eq('id', developerId)
      .single()

    if (developer?.plan_id === 1 && existingEducation?.length >= 5) {
      throw new Error('لقد تجاوزت الحد المسموح به من المؤهلات للباقة المجانية')
    }

    const { data, error } = await supabase
      .from('education')
      .insert([{
        developer_id: developerId,
        ...educationData,
        created_at: new Date().toISOString()
      }])
      .select()
      .single()
    
    if (error) {
      console.error('Error creating education:', error)
      throw error
    }
    return data
  },

  // ✅ تحديث مؤهل
  async update(id, updates) {
    const { data, error } = await supabase
      .from('education')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating education:', error)
      throw error
    }
    return data
  },

  // ✅ حذف مؤهل
  async delete(id) {
    const { error } = await supabase
      .from('education')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('Error deleting education:', error)
      throw error
    }
    return true
  }
}

// ===========================================
// خدمات روابط التواصل (Social Links)
// ===========================================
export const socialLinkService = {
  async getByDeveloperId(developerId) {
    const { data, error } = await supabase
      .from('social_links')
      .select('*')
      .eq('developer_id', developerId)
    
    if (error) throw error
    return data
  },

  async upsert(developerId, platform, url) {
    // حذف القديم وإضافة الجديد
    const { error: deleteError } = await supabase
      .from('social_links')
      .delete()
      .eq('developer_id', developerId)
      .eq('platform', platform)
    
    if (deleteError) throw deleteError

    const { data, error } = await supabase
      .from('social_links')
      .insert([{
        developer_id: developerId,
        platform,
        url,
        created_at: new Date()
      }])
      .select()
    
    if (error) throw error
    return data[0]
  }
}

// ===========================================
// خدمات الباقات (Plans)
// ===========================================
export const planService = {
  // جلب جميع الباقات
  async getAll() {
    const { data, error } = await supabase
      .from('plans')
      .select('*')
      .eq('is_active', true)
      .order('sort_order')
    
    if (error) throw error
    return data
  },

  // جلب باقة بواسطة ID
  async getById(id) {
    const { data, error } = await supabase
      .from('plans')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  }
}

// ===========================================
// خدمات تحليلات الذكاء الاصطناعي (AI Analyses)
// ===========================================
export const aiAnalysisService = {
  // تسجيل تحليل جديد
  async create(userId, analysisData = {}) {
    const { data, error } = await supabase
      .from('ai_analyses')
      .insert([{
        user_id: userId,
        ...analysisData,
        analyzed_at: new Date()
      }])
      .select()
    
    if (error) throw error
    return data[0]
  },

  // الحصول على عدد تحليلات المستخدم
  async countByUser(userId) {
    const { count, error } = await supabase
      .from('ai_analyses')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
    
    if (error) throw error
    return count || 0
  },

  // جلب تحليلات المستخدم
  async getByUser(userId) {
    const { data, error } = await supabase
      .from('ai_analyses')
      .select('*')
      .eq('user_id', userId)
      .order('analyzed_at', { ascending: false })
    
    if (error) throw error
    return data
  }
}
      // ===========================================
// خدمات رفع الملفات (Storage) - النسخة المصححة
// ===========================================
        
      // ===========================================
// خدمات رفع الملفات (Storage) - نسخة كاملة سليمة
// ===========================================
export const storageService = {
  async uploadProfileImage(file, userId, oldImageUrl = null) {
    try {
      if (!file) throw new Error('لا يوجد ملف')
      if (!file.type.startsWith('image/')) throw new Error('الملف ليس صورة')
      if (file.size > 5 * 1024 * 1024) throw new Error('الصورة أكبر من 5 ميجابايت')

      const fileName = `${userId}/profile/${uuidv4()}-${file.name}`

      const { error: uploadError } = await supabase.storage
        .from('developers')
        .upload(fileName, file, {
          upsert: true,
          cacheControl: '3600'
        })

      if (uploadError) throw uploadError

      const { data } = supabase.storage
        .from('developers')
        .getPublicUrl(fileName)

      const { error: updateError } = await supabase
        .from('developers')
        .update({ profile_image: data.publicUrl })
        .eq('id', userId)

      if (updateError) throw updateError

      if (oldImageUrl) {
        try {
          const oldPath = oldImageUrl.split('/developers/')[1]
          if (oldPath) {
            await supabase.storage.from('developers').remove([oldPath])
          }
        } catch (e) {
          console.log('لا يمكن حذف الصورة القديمة:', e)
        }
      }

      return data.publicUrl

    } catch (error) {
      console.error('فشل رفع الصورة:', error)
      throw error
    }
  },

  async uploadCoverImage(file, userId, oldImageUrl = null) {
    try {
      if (!file) throw new Error('لا يوجد ملف')
      if (!file.type.startsWith('image/')) throw new Error('الملف ليس صورة')
      if (file.size > 5 * 1024 * 1024) throw new Error('الصورة أكبر من 5 ميجابايت')

      const fileName = `${userId}/cover/${uuidv4()}-${file.name}`

      const { error: uploadError } = await supabase.storage
        .from('developers')
        .upload(fileName, file, {
          upsert: true,
          cacheControl: '3600'
        })

      if (uploadError) throw uploadError

      const { data } = supabase.storage
        .from('developers')
        .getPublicUrl(fileName)

      const { error: updateError } = await supabase
        .from('developers')
        .update({ cover_image: data.publicUrl })
        .eq('id', userId)

      if (updateError) throw updateError

      if (oldImageUrl) {
        try {
          const oldPath = oldImageUrl.split('/developers/')[1]
          if (oldPath) {
            await supabase.storage.from('developers').remove([oldPath])
          }
        } catch (e) {}
      }

      return data.publicUrl

    } catch (error) {
      console.error('فشل رفع الغلاف:', error)
      throw error
    }
  },

  async uploadResume(file, userId, oldResumeUrl = null) {
    try {
      if (!file) throw new Error('لا يوجد ملف')
      if (file.type !== 'application/pdf') throw new Error('الملف ليس PDF')
      if (file.size > 5 * 1024 * 1024) throw new Error('الملف أكبر من 5 ميجابايت')

      const fileName = `${userId}/resume/${uuidv4()}-${file.name}`

      const { error: uploadError } = await supabase.storage
        .from('developers')
        .upload(fileName, file, {
          upsert: true,
          cacheControl: '3600'
        })

      if (uploadError) throw uploadError

      const { data } = supabase.storage
        .from('developers')
        .getPublicUrl(fileName)

      const { error: updateError } = await supabase
        .from('developers')
        .update({ resume_file: data.publicUrl })
        .eq('id', userId)

      if (updateError) throw updateError

      if (oldResumeUrl) {
        try {
          const oldPath = oldResumeUrl.split('/developers/')[1]
          if (oldPath) {
            await supabase.storage.from('developers').remove([oldPath])
          }
        } catch (e) {}
      }

      return data.publicUrl

    } catch (error) {
      console.error('فشل رفع السيرة:', error)
      throw error
    }
  },

  // ✅ دالة جديدة لرفع صور المشاريع
  async uploadProjectImage(file, userId, projectId, oldImageUrl = null) {
    try {
      if (!file) throw new Error('لا يوجد ملف')
      if (!file.type.startsWith('image/')) throw new Error('الملف ليس صورة')
      if (file.size > 5 * 1024 * 1024) throw new Error('الصورة أكبر من 5 ميجابايت')

      const fileName = `${userId}/projects/${projectId}/${uuidv4()}-${file.name}`

      const { error: uploadError } = await supabase.storage
        .from('developers')
        .upload(fileName, file, {
          upsert: true,
          cacheControl: '3600'
        })

      if (uploadError) throw uploadError

      const { data } = supabase.storage
        .from('developers')
        .getPublicUrl(fileName)

      if (oldImageUrl) {
        try {
          const oldPath = oldImageUrl.split('/developers/')[1]
          if (oldPath) {
            await supabase.storage.from('developers').remove([oldPath])
          }
        } catch (e) {}
      }

      return data.publicUrl

    } catch (error) {
      console.error('فشل رفع صورة المشروع:', error)
      throw error
    }
  },

  // ✅ دالة جديدة لرفع صور الشهادات
  async uploadCertificateImage(file, userId, certificateId, oldImageUrl = null) {
    try {
      if (!file) throw new Error('لا يوجد ملف')
      if (!file.type.startsWith('image/')) throw new Error('الملف ليس صورة')
      if (file.size > 5 * 1024 * 1024) throw new Error('الصورة أكبر من 5 ميجابايت')

      const fileName = `${userId}/profile/${certificateId}/${uuidv4()}-${file.name}`

      const { error: uploadError } = await supabase.storage
        .from('developers')
        .upload(fileName, file, {
          upsert: true,
          cacheControl: '3600'
        })

      if (uploadError) throw uploadError

      const { data } = supabase.storage
        .from('developers')
        .getPublicUrl(fileName)

      if (oldImageUrl) {
        try {
          const oldPath = oldImageUrl.split('/developers/')[1]
          if (oldPath) {
            await supabase.storage.from('developers').remove([oldPath])
          }
        } catch (e) {}
      }

      return data.publicUrl

    } catch (error) {
      console.error('فشل رفع صورة الشهادة:', error)
      throw error
    }
  }
}


// ===========================================
// خدمات المصادقة باستخدام Supabase Auth
// ===========================================
export const authService = {
  // تسجيل الدخول
  async login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) throw error
    
    // جلب بيانات المطور من جدول developers
    const { data: developer } = await supabase
      .from('developers')
      .select('*')
      .eq('id', data.user.id)
      .single()
    
    return developer
  },

  // تسجيل مستخدم جديد
  async register(userData) {
    // 1. إنشاء المستخدم في Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          full_name: userData.full_name
        }
      }
    })
    
    if (error) throw error

    // 2. إنشاء سجل في جدول developers بنفس ID
    const { data: developer, error: insertError } = await supabase
      .from('developers')
      .insert([{
        id: data.user.id,  // ✅ نفس ID من Auth
        username: userData.full_name.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Math.random().toString(36).substring(2, 6),
        email: userData.email,
        full_name: userData.full_name,
        plan_id: 1,
        role: 'user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single()
    
    if (insertError) throw insertError
    return developer
  },

  // تسجيل الخروج
  async logout() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  // الحصول على المستخدم الحالي
  async getCurrentUser() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return null
    
    const { data: developer } = await supabase
      .from('developers')
      .select('*')
      .eq('id', session.user.id)
      .single()
    
    return developer
  }
}
