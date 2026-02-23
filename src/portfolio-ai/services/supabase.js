import { createClient } from '@supabase/supabase-js'

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
  async getByUsername(username) {
    const { data, error } = await supabase
      .from('developers')
      .select(`
        *,
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
    
    if (error) throw error
    return data
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('developers')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('developers')
      .update({ ...updates, updated_at: new Date() })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async incrementViews(id) {
    const { error } = await supabase.rpc('increment_views', { developer_id: id })
    if (error) console.error('Error incrementing views:', error)
  },

  async trackVisit(developerId, visitorData) {
    const { error } = await supabase
      .from('visitors')
      .insert([{ developer_id: developerId, ...visitorData }])
    
    if (error) console.error('Error tracking visit:', error)
  }
}

// ===========================================
// خدمات البورتفليو (Portfolios)
// ===========================================
export const portfolioService = {
  async getByUserId(userId) {
    const { data, error } = await supabase
      .from('portfolios')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()
    
    if (error) throw error
    return data
  },

  async create(userId, portfolioData) {
    const { data, error } = await supabase
      .from('portfolios')
      .insert([{ user_id: userId, ...portfolioData }])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('portfolios')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async publish(id) {
    return this.update(id, { is_published: true, published_at: new Date() })
  }
}

// ===========================================
// خدمات المشاريع (Projects)
// ===========================================
export const projectService = {
  async getByPortfolioId(portfolioId) {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('portfolio_id', portfolioId)
      .order('display_order')
    
    if (error) throw error
    return data
  },

  async create(portfolioId, projectData) {
    const { data, error } = await supabase
      .from('projects')
      .insert([{ portfolio_id: portfolioId, ...projectData }])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('projects')
      .update({ ...updates, updated_at: new Date() })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async delete(id) {
    const { error } = await supabase.from('projects').delete().eq('id', id)
    if (error) throw error
  }
}

// ===========================================
// خدمات المهارات (Skills)
// ===========================================
export const skillService = {
  async getByPortfolioId(portfolioId) {
    const { data, error } = await supabase
      .from('skills')
      .select('*')
      .eq('portfolio_id', portfolioId)
      .order('display_order')
    
    if (error) throw error
    return data
  },

  async create(portfolioId, skillData) {
    const { data, error } = await supabase
      .from('skills')
      .insert([{ portfolio_id: portfolioId, ...skillData }])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

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

  async delete(id) {
    const { error } = await supabase.from('skills').delete().eq('id', id)
    if (error) throw error
  }
}

// ===========================================
// خدمات الشهادات (Certificates)
// ===========================================
export const certificateService = {
  async getByPortfolioId(portfolioId) {
    const { data, error } = await supabase
      .from('certificates')
      .select('*')
      .eq('portfolio_id', portfolioId)
      .order('display_order')
    
    if (error) throw error
    return data
  },

  async create(portfolioId, certificateData) {
    const { data, error } = await supabase
      .from('certificates')
      .insert([{ portfolio_id: portfolioId, ...certificateData }])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

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

  async delete(id) {
    const { error } = await supabase.from('certificates').delete().eq('id', id)
    if (error) throw error
  }
}

// ===========================================
// خدمات الخبرات (Experience)
// ===========================================
export const experienceService = {
  async getByPortfolioId(portfolioId) {
    const { data, error } = await supabase
      .from('experience')
      .select('*')
      .eq('portfolio_id', portfolioId)
      .order('display_order')
    
    if (error) throw error
    return data
  },

  async create(portfolioId, experienceData) {
    const { data, error } = await supabase
      .from('experience')
      .insert([{ portfolio_id: portfolioId, ...experienceData }])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('experience')
      .update({ ...updates, updated_at: new Date() })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async delete(id) {
    const { error } = await supabase.from('experience').delete().eq('id', id)
    if (error) throw error
  }
}

// ===========================================
// خدمات التعليم (Education)
// ===========================================
export const educationService = {
  async getByPortfolioId(portfolioId) {
    const { data, error } = await supabase
      .from('education')
      .select('*')
      .eq('portfolio_id', portfolioId)
      .order('display_order')
    
    if (error) throw error
    return data
  },

  async create(portfolioId, educationData) {
    const { data, error } = await supabase
      .from('education')
      .insert([{ portfolio_id: portfolioId, ...educationData }])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

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

  async delete(id) {
    const { error } = await supabase.from('education').delete().eq('id', id)
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
    await supabase
      .from('social_links')
      .delete()
      .eq('developer_id', developerId)
      .eq('platform', platform)

    const { data, error } = await supabase
      .from('social_links')
      .insert([{ developer_id: developerId, platform, url }])
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}

// ===========================================
// خدمات الباقات (Plans)
// ===========================================
export const planService = {
  async getAll() {
    const { data, error } = await supabase
      .from('plans')
      .select('*')
      .eq('is_active', true)
      .order('sort_order')
    
    if (error) throw error
    return data
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('plans')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  async createSubscription(userId, planId, paymentData) {
    const plan = await this.getById(planId)
    
    const startDate = new Date()
    const endDate = new Date()
    endDate.setMonth(endDate.getMonth() + 1)

    const { data, error } = await supabase
      .from('payments')
      .insert([{
        developer_id: userId,
        plan_id: planId,
        amount: plan.price_monthly,
        currency: 'USD',
        payment_method: paymentData.method,
        transaction_image: paymentData.transaction_image,
        status: 'pending',
        start_date: startDate,
        end_date: endDate
      }])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async getUserSubscription(userId) {
    const { data, error } = await supabase
      .from('payments')
      .select('*, plans(*)')
      .eq('developer_id', userId)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error
    return data
  }
}

// ===========================================
// خدمات المصادقة (Auth)
// ===========================================
export const authService = {
  async login(email, password) {
    const { data, error } = await supabase
      .from('developers')
      .select('*')
      .eq('email', email)
      .single()
    
    if (error || !data) throw new Error('Invalid email or password')
    
    const hashedPassword = await this.hashPassword(password)
    if (data.password_hash !== hashedPassword) {
      throw new Error('Invalid email or password')
    }
    
    await supabase
      .from('developers')
      .update({ last_login: new Date() })
      .eq('id', data.id)
    
    const { password_hash, ...userWithoutPassword } = data
    return userWithoutPassword
  },

  async register(userData) {
    const { data: existingUser } = await supabase
      .from('developers')
      .select('id')
      .eq('email', userData.email)
      .maybeSingle()
    
    if (existingUser) throw new Error('Email already exists')

    const hashedPassword = await this.hashPassword(userData.password)
    const username = userData.full_name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .substring(0, 30)

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

  async hashPassword(password) {
    const encoder = new TextEncoder()
    const data = encoder.encode(password)
    const hash = await crypto.subtle.digest('SHA-256', data)
    return Array.from(new Uint8Array(hash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
  }
}

// ===========================================
// خدمات التخزين (Storage)
// ===========================================
export const storageService = {
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

  async deleteImage(imageUrl) {
    if (!imageUrl) return
    const filePath = this.getPathFromUrl(imageUrl)
    if (!filePath) return

    await supabase.storage.from('developers').remove([filePath])
  },

  async uploadImage(file, folder, oldImageUrl = null) {
    if (oldImageUrl) await this.deleteImage(oldImageUrl)

    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 8)
    const fileExt = file.name.split('.').pop()
    const fileName = `${timestamp}-${randomString}.${fileExt}`
    const filePath = `${folder}/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('developers')
      .upload(filePath, file, { cacheControl: '3600', upsert: false })

    if (uploadError) throw uploadError

    const { data } = supabase.storage.from('developers').getPublicUrl(filePath)
    return data.publicUrl
  },

  async uploadProfileImage(file, userId, oldImageUrl = null) {
    return this.uploadImage(file, `profiles/${userId}`, oldImageUrl)
  },

  async uploadProjectImage(file, projectId, oldImageUrl = null) {
    return this.uploadImage(file, `projects/${projectId}`, oldImageUrl)
  },

  async uploadCertificateImage(file, certificateId, oldImageUrl = null) {
    return this.uploadImage(file, `certificates/${certificateId}`, oldImageUrl)
  },

  async uploadPaymentImage(file, userId) {
    return this.uploadImage(file, `payments/${userId}`, null)
  }
}
