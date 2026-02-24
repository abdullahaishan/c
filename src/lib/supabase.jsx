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
// خدمات رفع الملفات (Storage) - النسخة المصححة
// ===========================================
export const storageService = {
  async uploadProfileImage(file, userId, oldImageUrl = null) {
    try {
      if (!file) throw new Error('لا يوجد ملف')
      if (!file.type.startsWith('image/')) throw new Error('الملف ليس صورة')
      if (file.size > 5 * 1024 * 1024) throw new Error('الصورة أكبر من 5 ميجابايت')

      // ✅ استخدام userId من Auth
      const fileName = `${userId}/profile/${uuidv4()}-${file.name}`

      console.log('رفع إلى:', fileName)

      // ✅ إضافة upsert: true للسماح باستبدال الملف
      const { error: uploadError } = await supabase.storage
        .from('developers')
        .upload(fileName, file, {
          upsert: true,
          cacheControl: '3600'
        })

      if (uploadError) throw uploadError

      // الحصول على الرابط العام
      const { data } = supabase.storage
        .from('developers')
        .getPublicUrl(fileName)

      // تحديث قاعدة البيانات
      const { error: updateError } = await supabase
        .from('developers')
        .update({ profile_image: data.publicUrl })
        .eq('id', userId)

      if (updateError) throw updateError

      // حذف الصورة القديمة إذا وجدت
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

  // دوال مماثلة للـ Cover و Resume
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
  }
}
      // ===========================================
// خدمات المصادقة (Auth) - النسخة المصححة
// ===========================================
export const authService = {
  // دالة تشفير بسيطة (دالة مستقلة وليست داخل this)
  async hashPassword(password) {
    try {
      const encoder = new TextEncoder()
      const data = encoder.encode(password)
      const hash = await crypto.subtle.digest('SHA-256', data)
      return Array.from(new Uint8Array(hash))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
    } catch (error) {
      console.error('Error hashing password:', error)
      throw error
    }
  },

  // تسجيل الدخول
  async login(email, password) {
    try {
      console.log('🔍 بدء تسجيل الدخول للبريد:', email)
      
      // ✅ استخدام this.hashPassword
      const hashedPassword = await this.hashPassword(password)
      console.log('🔐 كلمة المرور بعد التشفير:', hashedPassword.substring(0, 10) + '...')
      
      const { data: users, error } = await supabase
        .from('developers')
        .select('*')
        .eq('email', email)
      
      if (error) {
        console.error('❌ خطأ في قاعدة البيانات:', error)
        throw new Error('خطأ في قاعدة البيانات')
      }
      
      if (!users || users.length === 0) {
        throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة')
      }

      const user = users[0]
      console.log('✅ تم العثور على المستخدم:', user.email)
      
      // التحقق من كلمة المرور
      if (user.password_hash !== hashedPassword) {
        throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة')
      }

      // تحديث آخر دخول
      await supabase
        .from('developers')
        .update({ last_login: new Date().toISOString() })
        .eq('id', user.id)

      // إزالة كلمة المرور من البيانات
      const { password_hash, ...userWithoutPassword } = user
      return userWithoutPassword

    } catch (error) {
      console.error('❌ خطأ في تسجيل الدخول:', error)
      throw error
    }
  },

  // تسجيل مستخدم جديد
  async register(userData) {
    try {
      console.log('🔍 بدء تسجيل مستخدم جديد:', userData.email)
      
      // التحقق من عدم وجود البريد
      const { data: existingUsers } = await supabase
        .from('developers')
        .select('id')
        .eq('email', userData.email)
      
      if (existingUsers && existingUsers.length > 0) {
        throw new Error('البريد الإلكتروني موجود بالفعل')
      }

      // ✅ استخدام this.hashPassword
      const hashedPassword = await this.hashPassword(userData.password)

      // إنشاء اسم مستخدم
      const username = userData.full_name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .substring(0, 20) + '-' + Math.random().toString(36).substring(2, 6)

      // إنشاء المستخدم
      const { data, error } = await supabase
        .from('developers')
        .insert([{
          username,
          email: userData.email,
          password_hash: hashedPassword,
          full_name: userData.full_name,
          plan_id: 1,
          role: 'user',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single()
      
      if (error) {
        console.error('❌ خطأ في الإدراج:', error)
        throw new Error('فشل في إنشاء الحساب')
      }

      // إنشاء بورتفليو افتراضي
      try {
        await supabase
          .from('portfolios')
          .insert([{
            user_id: data.id,
            title: `معرض ${data.full_name}`,
            is_published: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
      } catch (e) {
        console.log('تنبيه: لم يتم إنشاء البورتفليو الافتراضي')
      }

      console.log('✅ تم إنشاء المستخدم بنجاح:', data.email)
      
      const { password_hash, ...newUser } = data
      return newUser

    } catch (error) {
      console.error('❌ خطأ في التسجيل:', error)
      throw error
    }
  }
}
