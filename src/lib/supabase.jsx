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
  // ===========================================
// خدمات رفع الملفات (Storage) - نسخة مبسطة
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
      }
    } catch (error) {
      console.error('خطأ في حذف الصورة:', error)
    }
  },

  // رفع صورة (نسخة مبسطة بدون تحسين)
  async uploadImage(file, folder, oldImageUrl = null) {
    try {
      // التحقق من صحة الملف
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('حجم الملف كبير جداً. الحد الأقصى 5 ميجابايت')
      }

      // حذف الصورة القديمة إذا وجدت
      if (oldImageUrl) {
        await this.deleteImage(oldImageUrl)
      }

      // إنشاء اسم فريد للملف
      const timestamp = Date.now()
      const randomString = Math.random().toString(36).substring(2, 8)
      const fileExt = file.name.split('.').pop()
      const fileName = `${timestamp}-${randomString}.${fileExt}`
      const filePath = `${folder}/${fileName}`

      console.log('رفع الملف إلى:', filePath)

      // رفع الملف مباشرة بدون تحسين
      const { error: uploadError } = await supabase.storage
        .from('developers')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        console.error('خطأ في الرفع:', uploadError)
        throw uploadError
      }

      // الحصول على الرابط العام
      const { data } = supabase.storage
        .from('developers')
        .getPublicUrl(filePath)

      console.log('✅ تم رفع الصورة بنجاح:', data.publicUrl)
      return data.publicUrl

    } catch (error) {
      console.error('❌ فشل رفع الصورة:', error)
      throw error
    }
  },

  // رفع صورة الملف الشخصي
  async uploadProfileImage(file, userId, oldImageUrl = null) {
    return this.uploadImage(file, `profiles/${userId}`, oldImageUrl)
  },

  // رفع صورة الغلاف
  async uploadCoverImage(file, userId, oldImageUrl = null) {
    return this.uploadImage(file, `covers/${userId}`, oldImageUrl)
  },

  // رفع السيرة الذاتية (PDF)
  async uploadResume(file, userId, oldResumeUrl = null) {
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
  }
}
// ===========================================
// خدمات المصادقة (Auth) - النسخة المصححة
// ===========================================
export const authService = {
  // تسجيل الدخول
  async login(email, password) {
    try {
      console.log('1. Searching for user with email:', email)
      
      const { data, error } = await supabase
        .from('developers')
        .select('*')
        .eq('email', email)
        .maybeSingle() // ✅ استخدام maybeSingle بدلاً من single
      
      console.log('2. Query result:', { data, error })
      
      if (error) {
        console.error('Database error:', error)
        throw new Error('خطأ في قاعدة البيانات')
      }
      
      if (!data) {
        console.log('3. No user found with this email')
        throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة')
      }

      console.log('4. User found:', { id: data.id, email: data.email })

      // التحقق من كلمة المرور
      const hashedPassword = await this.hashPassword(password)
      console.log('5. Password check:', { 
        inputHashed: hashedPassword, 
        storedHash: data.password_hash 
      })
      
      if (data.password_hash !== hashedPassword) {
        console.log('6. Password mismatch')
        throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة')
      }

      console.log('7. Password correct, updating last login')

      // تحديث آخر دخول
      const { error: updateError } = await supabase
        .from('developers')
        .update({ last_login: new Date() })
        .eq('id', data.id)

      if (updateError) {
        console.error('Error updating last login:', updateError)
      }

      // إزالة كلمة المرور من البيانات المرسلة
      const { password_hash, ...userWithoutPassword } = data
      console.log('8. Login successful for user:', userWithoutPassword.email)
      
      return userWithoutPassword

    } catch (error) {
      console.error('Login error in authService:', error)
      throw error
    }
  },

  // تسجيل مستخدم جديد
  async register(userData) {
    try {
      console.log('1. Checking if email exists:', userData.email)
      
      const { data: existingUser, error: checkError } = await supabase
        .from('developers')
        .select('id')
        .eq('email', userData.email)
        .maybeSingle()
      
      if (checkError) {
        console.error('Check error:', checkError)
        throw new Error('خطأ في التحقق من البريد الإلكتروني')
      }
      
      if (existingUser) {
        console.log('2. Email already exists')
        throw new Error('البريد الإلكتروني موجود بالفعل')
      }

      console.log('3. Email is available, hashing password')

      // تشفير كلمة المرور
      const hashedPassword = await this.hashPassword(userData.password)

      // إنشاء اسم مستخدم فريد
      const baseUsername = userData.full_name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .substring(0, 20)
      
      const username = `${baseUsername}-${Math.random().toString(36).substring(2, 6)}`
      
      console.log('4. Generated username:', username)

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
          created_at: new Date(),
          updated_at: new Date()
        }])
        .select()
        .single()
      
      if (error) {
        console.error('Insert error:', error)
        throw new Error('فشل في إنشاء الحساب')
      }
      
      console.log('5. User created successfully:', data.email)
      
      const { password_hash, ...newUser } = data
      return newUser

    } catch (error) {
      console.error('Register error in authService:', error)
      throw error
    }
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
