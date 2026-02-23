import { createClient } from '@supabase/supabase-js'
import { imageOptimizer } from './imageOptimizer'

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
// خدمات المشاريع (Projects)
// ===========================================
export const projectService = {
  // جلب مشاريع بورتفليو
  async getByPortfolioId(portfolioId) {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('portfolio_id', portfolioId)
      .order('display_order', { ascending: true })
    
    if (error) throw error
    return data
  },

  // إنشاء مشروع جديد
  async create(portfolioId, projectData) {
    const { data, error } = await supabase
      .from('projects')
      .insert([{
        portfolio_id: portfolioId,
        ...projectData,
        created_at: new Date(),
        updated_at: new Date()
      }])
      .select()
    
    if (error) throw error
    return data[0]
  },

  // تحديث مشروع
  async update(id, updates) {
    const { data, error } = await supabase
      .from('projects')
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

  // حذف مشروع
  async delete(id) {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

// ===========================================
// خدمات المهارات (Skills)
// ===========================================
export const skillService = {
  // جلب مهارات بورتفليو
  async getByPortfolioId(portfolioId) {
    const { data, error } = await supabase
      .from('skills')
      .select('*')
      .eq('portfolio_id', portfolioId)
      .order('display_order', { ascending: true })
    
    if (error) throw error
    return data
  },

  // إنشاء مهارة جديدة
  async create(portfolioId, skillData) {
    const { data, error } = await supabase
      .from('skills')
      .insert([{
        portfolio_id: portfolioId,
        ...skillData,
        created_at: new Date()
      }])
      .select()
    
    if (error) throw error
    return data[0]
  },

  // تحديث مهارة
  async update(id, updates) {
    const { data, error } = await supabase
      .from('skills')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // حذف مهارة
  async delete(id) {
    const { error } = await supabase
      .from('skills')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

// ===========================================
// خدمات الشهادات (Certificates)
// ===========================================
export const certificateService = {
  // جلب شهادات بورتفليو
  async getByPortfolioId(portfolioId) {
    const { data, error } = await supabase
      .from('certificates')
      .select('*')
      .eq('portfolio_id', portfolioId)
      .order('display_order', { ascending: true })
    
    if (error) throw error
    return data
  },

  // إنشاء شهادة جديدة
  async create(portfolioId, certificateData) {
    const { data, error } = await supabase
      .from('certificates')
      .insert([{
        portfolio_id: portfolioId,
        ...certificateData,
        created_at: new Date()
      }])
      .select()
    
    if (error) throw error
    return data[0]
  },

  // تحديث شهادة
  async update(id, updates) {
    const { data, error } = await supabase
      .from('certificates')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // حذف شهادة
  async delete(id) {
    const { error } = await supabase
      .from('certificates')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

// ===========================================
// خدمات الخبرات (Experience)
// ===========================================
export const experienceService = {
  // جلب خبرات بورتفليو
  async getByPortfolioId(portfolioId) {
    const { data, error } = await supabase
      .from('experience')
      .select('*')
      .eq('portfolio_id', portfolioId)
      .order('display_order', { ascending: true })
    
    if (error) throw error
    return data
  },

  // إنشاء خبرة جديدة
  async create(portfolioId, experienceData) {
    const { data, error } = await supabase
      .from('experience')
      .insert([{
        portfolio_id: portfolioId,
        ...experienceData,
        created_at: new Date(),
        updated_at: new Date()
      }])
      .select()
    
    if (error) throw error
    return data[0]
  },

  // تحديث خبرة
  async update(id, updates) {
    const { data, error } = await supabase
      .from('experience')
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

  // حذف خبرة
  async delete(id) {
    const { error } = await supabase
      .from('experience')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

// ===========================================
// خدمات التعليم (Education)
// ===========================================
export const educationService = {
  // جلب تعليم بورتفليو
  async getByPortfolioId(portfolioId) {
    const { data, error } = await supabase
      .from('education')
      .select('*')
      .eq('portfolio_id', portfolioId)
      .order('display_order', { ascending: true })
    
    if (error) throw error
    return data
  },

  // إنشاء تعليم جديد
  async create(portfolioId, educationData) {
    const { data, error } = await supabase
      .from('education')
      .insert([{
        portfolio_id: portfolioId,
        ...educationData,
        created_at: new Date()
      }])
      .select()
    
    if (error) throw error
    return data[0]
  },

  // تحديث تعليم
  async update(id, updates) {
    const { data, error } = await supabase
      .from('education')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // حذف تعليم
  async delete(id) {
    const { error } = await supabase
      .from('education')
      .delete()
      .eq('id', id)
    
    if (error) throw error
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
// خدمات رفع الملفات (Storage)
// ===========================================
export const storageService = {
  // استخراج مسار الملف من URL
  getPathFromUrl(url) {
    if (!url) return null
    try {
      const urlObj = new URL(url)
      const pathMatch = urlObj.pathname.match(/\/developers\/(.+)$/)
      return pathMatch ? pathMatch[1] : null
    } catch {
      return null
    }
  },

  // حذف صورة قديمة
  async deleteImage(imageUrl) {
    if (!imageUrl) return
    
    try {
      const filePath = this.getPathFromUrl(imageUrl)
      if (!filePath) return

      const { error } = await supabase.storage
        .from('developers')
        .remove([filePath])

      if (error) {
        console.error('خطأ في حذف الصورة القديمة:', error)
      } else {
        console.log('✅ تم حذف الصورة القديمة')
      }
    } catch (error) {
      console.error('خطأ في حذف الصورة:', error)
    }
  },

  // رفع صورة مع التحسين والحذف التلقائي
  async uploadImage(file, folder, oldImageUrl = null, options = {}) {
    try {
      // 1. التحقق من صحة الملف
      imageOptimizer.validateFile(file)

      // 2. حذف الصورة القديمة إذا وجدت
      if (oldImageUrl) {
        await this.deleteImage(oldImageUrl)
      }

      // 3. تحسين الصورة وتقليل حجمها
      const optimizedFile = await imageOptimizer.optimizeImage(file, options)

      // 4. إنشاء اسم فريد للملف
      const timestamp = Date.now()
      const randomString = Math.random().toString(36).substring(2, 8)
      const fileName = `${timestamp}-${randomString}.webp`
      const filePath = `${folder}/${fileName}`

      // 5. رفع الصورة المحسنة
      const { error: uploadError } = await supabase.storage
        .from('developers')
        .upload(filePath, optimizedFile, {
          cacheControl: '3600',
          contentType: 'image/webp',
          upsert: false
        })

      if (uploadError) throw uploadError

      // 6. الحصول على الرابط العام
      const { data } = supabase.storage
        .from('developers')
        .getPublicUrl(filePath)

      console.log('✅ تم رفع الصورة بنجاح')
      return data.publicUrl

    } catch (error) {
      console.error('❌ فشل رفع الصورة:', error)
      throw error
    }
  },

  // رفع صورة الملف الشخصي
  async uploadProfileImage(file, userId, oldImageUrl = null) {
    try {
      return await this.uploadImage(
        file, 
        `profiles/${userId}`,
        oldImageUrl,
        {
          maxWidth: 800,
          maxHeight: 800,
          quality: 0.8
        }
      )
    } catch (error) {
      console.error('❌ فشل رفع صورة الملف الشخصي:', error)
      throw error
    }
  },

  // رفع صورة الغلاف
  async uploadCoverImage(file, userId, oldImageUrl = null) {
    try {
      return await this.uploadImage(
        file,
        `covers/${userId}`,
        oldImageUrl,
        {
          maxWidth: 1500,
          maxHeight: 500,
          quality: 0.85
        }
      )
    } catch (error) {
      console.error('❌ فشل رفع صورة الغلاف:', error)
      throw error
    }
  },

  // رفع السيرة الذاتية (PDF)
  async uploadResume(file, userId, oldResumeUrl = null) {
    try {
      if (file.type !== 'application/pdf') {
        throw new Error('يجب أن يكون الملف بصيغة PDF')
      }

      if (oldResumeUrl) {
        await this.deleteImage(oldResumeUrl)
      }

      const timestamp = Date.now()
      const fileName = `${timestamp}-${file.name}`
      const filePath = `resumes/${userId}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('developers')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) throw uploadError

      const { data } = supabase.storage
        .from('developers')
        .getPublicUrl(filePath)

      return data.publicUrl
    } catch (error) {
      console.error('❌ فشل رفع السيرة الذاتية:', error)
      throw error
    }
  },

  // رفع صورة المشروع
  async uploadProjectImage(file, projectId, oldImageUrl = null) {
    try {
      return await this.uploadImage(
        file,
        `projects/${projectId}`,
        oldImageUrl,
        {
          maxWidth: 1200,
          maxHeight: 1200,
          quality: 0.85
        }
      )
    } catch (error) {
      console.error('❌ فشل رفع صورة المشروع:', error)
      throw error
    }
  },

  // رفع صورة الشهادة
  async uploadCertificateImage(file, certificateId, oldImageUrl = null) {
    try {
      return await this.uploadImage(
        file,
        `certificates/${certificateId}`,
        oldImageUrl,
        {
          maxWidth: 1000,
          maxHeight: 1000,
          quality: 0.8
        }
      )
    } catch (error) {
      console.error('❌ فشل رفع صورة الشهادة:', error)
      throw error
    }
  },

  // رفع صورة الدفع
  async uploadPaymentImage(file, userId) {
    try {
      return await this.uploadImage(
        file,
        `payments/${userId}`,
        null,
        {
          maxWidth: 1500,
          maxHeight: 1500,
          quality: 0.9,
          format: 'jpeg'
        }
      )
    } catch (error) {
      console.error('❌ فشل رفع صورة الدفع:', error)
      throw error
    }
  }
}

// ===========================================
// خدمات المصادقة (Auth)
// ===========================================
export const authService = {
  // تسجيل الدخول
  async login(email, password) {
    const { data, error } = await supabase
      .from('developers')
      .select('*')
      .eq('email', email)
      .single()
    
    if (error || !data) throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة')
    
    const hashedPassword = await this.hashPassword(password)
    if (data.password_hash !== hashedPassword) {
      throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة')
    }
    
    await supabase
      .from('developers')
      .update({ last_login: new Date() })
      .eq('id', data.id)
    
    const { password_hash, ...userWithoutPassword } = data
    return userWithoutPassword
  },

  // تسجيل مستخدم جديد
  async register(userData) {
    const { data: existingUser } = await supabase
      .from('developers')
      .select('id')
      .eq('email', userData.email)
      .maybeSingle()
    
    if (existingUser) throw new Error('البريد الإلكتروني موجود بالفعل')

    const hashedPassword = await this.hashPassword(userData.password)

    const username = userData.full_name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .substring(0, 30) + '-' + Math.random().toString(36).substring(2, 6)

    const { data, error } = await supabase
      .from('developers')
      .insert([{
        username,
        email: userData.email,
        password_hash: hashedPassword,
        full_name: userData.full_name,
        plan_id: 1,
        is_active: true
      }])
      .select()
      .single()
    
    if (error) throw error
    
    const { password_hash, ...newUser } = data
    return newUser
  },

  // دالة تشفير بسيطة
  async hashPassword(password) {
    const encoder = new TextEncoder()
    const data = encoder.encode(password)
    const hash = await crypto.subtle.digest('SHA-256', data)
    return Array.from(new Uint8Array(hash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
  }
}
