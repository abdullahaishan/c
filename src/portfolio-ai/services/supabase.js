import { createClient } from '@supabase/supabase-js';

// ===========================================
// 🔧 IMPORTANT: استبدل هذه القيم بمشروع Supabase الخاص بك
// ===========================================
const supabaseUrl = 'YOUR_SUPABASE_URL'; // مثال: https://xyzabc.supabase.co
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY'; // المفتاح العام (anon key)

export const supabase = createClient(supabaseUrl, supabaseKey);

// ===========================================
// دوال المستخدمين
// ===========================================
export const userService = {
  // تسجيل مستخدم جديد
  async register(email, password, userData) {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (authError) throw authError;
    
    if (authData.user) {
      const { error: profileError } = await supabase
        .from('users')
        .insert([{
          id: authData.user.id,
          email,
          full_name: userData.full_name,
          username: userData.username,
          plan_id: 1, // الباقة المجانية
          created_at: new Date()
        }]);
      
      if (profileError) throw profileError;
    }
    
    return authData;
  },

  // تسجيل الدخول
  async login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    return data;
  },

  // تسجيل الخروج
  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // جلب المستخدم الحالي
  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    
    const { data: profile } = await supabase
      .from('users')
      .select('*, plans(*)')
      .eq('id', user.id)
      .single();
    
    return profile;
  }
};

// ===========================================
// دوال البورتفليو
// ===========================================
export const portfolioService = {
  // إنشاء بورتفليو جديد
  async createPortfolio(userId, data) {
    const { data: portfolio, error } = await supabase
      .from('portfolios')
      .insert([{
        user_id: userId,
        title: data.title,
        about_me: data.about_me,
        profile_image: data.profile_image,
        social_links: data.social_links,
        theme_color: data.theme_color || '#6366f1',
        slug: data.slug,
        is_published: false,
        ai_generated: data.ai_generated || false,
        ai_confidence_score: data.ai_confidence_score
      }])
      .select()
      .single();
    
    if (error) throw error;
    return portfolio;
  },

  // إضافة مشروع
  async addProject(portfolioId, projectData) {
    const { data, error } = await supabase
      .from('projects')
      .insert([{
        portfolio_id: portfolioId,
        ...projectData
      }])
      .select();
    
    if (error) throw error;
    return data;
  },

  // إضافة مهارة
  async addSkill(portfolioId, skillData) {
    const { data, error } = await supabase
      .from('skills')
      .insert([{
        portfolio_id: portfolioId,
        ...skillData
      }])
      .select();
    
    if (error) throw error;
    return data;
  },

  // إضافة خبرة
  async addExperience(portfolioId, expData) {
    const { data, error } = await supabase
      .from('experience')
      .insert([{
        portfolio_id: portfolioId,
        ...expData
      }])
      .select();
    
    if (error) throw error;
    return data;
  },

  // إضافة تعليم
  async addEducation(portfolioId, eduData) {
    const { data, error } = await supabase
      .from('education')
      .insert([{
        portfolio_id: portfolioId,
        ...eduData
      }])
      .select();
    
    if (error) throw error;
    return data;
  },

  // جلب بورتفليو كامل للعرض
  async getPublicPortfolio(username) {
    const { data: portfolio, error } = await supabase
      .from('portfolios')
      .select(`
        *,
        projects (*),
        skills (*),
        experience (*),
        education (*),
        certificates (*)
      `)
      .eq('slug', username)
      .eq('is_published', true)
      .single();
    
    if (error) throw error;
    return portfolio;
  },

  // جلب بورتفليو المستخدم (للتحرير)
  async getUserPortfolio(userId) {
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
      .eq('user_id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  // تحديث البورتفليو
  async updatePortfolio(portfolioId, updates) {
    const { data, error } = await supabase
      .from('portfolios')
      .update(updates)
      .eq('id', portfolioId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // نشر البورتفليو
  async publishPortfolio(portfolioId) {
    return this.updatePortfolio(portfolioId, {
      is_published: true,
      published_at: new Date()
    });
  }
};

// ===========================================
// دوال الباقات والاشتراكات
// ===========================================
export const planService = {
  // جلب جميع الباقات
  async getAllPlans() {
    const { data, error } = await supabase
      .from('plans')
      .select('*')
      .order('sort_order');
    
    if (error) throw error;
    return data;
  },

  // إنشاء اشتراك جديد
  async createSubscription(userId, planId, paymentData) {
    const { data: plan } = await supabase
      .from('plans')
      .select('*')
      .eq('id', planId)
      .single();
    
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1); // اشتراك شهري

    const { data, error } = await supabase
      .from('subscriptions')
      .insert([{
        user_id: userId,
        plan_id: planId,
        start_date: startDate,
        end_date: endDate,
        duration_days: 30,
        price_paid: plan.price_monthly,
        currency: 'USD',
        status: 'pending',
        payment_method: paymentData.method,
        transaction_image: paymentData.transaction_image,
        created_at: new Date()
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // جلب اشتراك المستخدم الحالي
  async getUserSubscription(userId) {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*, plans(*)')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }
};