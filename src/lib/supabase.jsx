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
// خدمات الإعجابات (Likes)
// ===========================================
export const likeService = {
  // التحقق مما إذا كان الزائر قد أعجب بالفعل
  async hasLiked(developerId, visitorIp) {
    try {
      const { data, error } = await supabase
        .from('likes')
        .select('id')
        .eq('developer_id', developerId)
        .eq('visitor_ip', visitorIp)
        .maybeSingle();

      if (error) throw error;
      return !!data;
    } catch (error) {
      console.error('Error checking like:', error);
      return false;
    }
  },

  // إضافة إعجاب جديد
  async addLike(developerId, visitorIp) {
    try {
      // التحقق أولاً
      const alreadyLiked = await this.hasLiked(developerId, visitorIp);
      if (alreadyLiked) {
        throw new Error('Already liked');
      }

      // إضافة الإعجاب
      const { error: insertError } = await supabase
        .from('likes')
        .insert([{
          developer_id: developerId,
          visitor_ip: visitorIp
        }]);

      if (insertError) throw insertError;

      // تحديث عدد الإعجابات في جدول المطورين
      const { error: updateError } = await supabase.rpc('increment_likes', {
        developer_id: developerId
      });

      if (updateError) throw updateError;

      return true;
    } catch (error) {
      console.error('Error adding like:', error);
      throw error;
    }
  },

  // جلب عدد الإعجابات
  async getLikesCount(developerId) {
    try {
      const { count, error } = await supabase
        .from('likes')
        .select('*', { count: 'exact', head: true })
        .eq('developer_id', developerId);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error getting likes count:', error);
      return 0;
    }
  }
};
// ===========================================
// خدمات المطورين (Developers)
// ===========================================

export const developerService = {
  
      
async getByUsername(username) {
  try {
    // استعلام يجلب المطور + فقط id و developer_id من كل جدول
    const { data, error } = await supabase
      .from('developers')
      .select(`
        *,
        projects (
          id,
          developer_id
        ),
        skills (*),
        experience (
          id,
          developer_id
        ),
        education (
          id,
          developer_id
        ),
        certificates (
          id,
          developer_id
        ),
        social_links (
          id,
          developer_id
        )
      `)
      .eq('username', username)
      .eq('is_active', true)
      .single()

    if (error) {
      console.error('developerService.getByUsername error:', error)
      throw error
    }

    if (!data) throw new Error('Developer not found')

    // ✅ تأكد أن الحقول المصفوفية ليست undefined
    data.projects = data.projects || []
    data.skills = data.skills || []
    data.experience = data.experience || []
    data.education = data.education || []
    data.certificates = data.certificates || []
    data.social_links = data.social_links || []

    return data
  } catch (err) {
    throw err
  }
},
  // زيادة عدد الزيارات (fire-and-forget لتقليل التأخير)
  async incrementViews(id) {
    // لا ننتظر النتيجة هنا (لا نستخدم await) لكي لا نبطئ العرض
    supabase.rpc('increment_views', { developer_id: id })
      .then(({ error }) => {
        if (error) console.error('incrementViews rpc error', error)
      })
      .catch(e => console.error('incrementViews catch', e))
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

  // ===========================================
// إحصائيات المنصة (حسب هيكل قاعدة البيانات الفعلي)
// ===========================================
async getPlatformStats() {
  try {
    // 1️⃣ عدد المستخدمين النشطين
    const { count: usersCount } = await supabase
      .from('developers')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    // 2️⃣ عدد البورتفليوهات المنشورة
    const { count: portfoliosCount } = await supabase
      .from('portfolios')
      .select('*', { count: 'exact', head: true })
      .eq('is_published', true);

    // 3️⃣ عدد المشاريع المنشورة
    const { count: projectsCount } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'published');

    // 4️⃣ جلب بيانات المطور abdullah_aishan
    const { data: featuredDeveloper } = await supabase
      .from('developers')
      .select(`
        id,
        full_name,
        username,
        profile_image,
        title,
        views_count,
        likes_count,
        plan_id
      `)
      .eq('username', 'abdullah_aishan')
      .eq('is_active', true)
      .single();

    // 5️⃣ الملفات الشخصية المميزة الأخرى (للمستخدمين المدفوعين)
    const { data: otherProfiles } = await supabase
      .from('developers')
      .select(`
        id,
        full_name,
        username,
        profile_image,
        title,
        views_count,
        likes_count,
        plan_id
      `)
      .eq('is_active', true)
      .not('plan_id', 'eq', 1)
      .neq('username', 'abdullah_aishan') // استثناء الحساب الرئيسي
      .order('views_count', { ascending: false })
      .limit(5);

    // 6️⃣ إجمالي عدد الزيارات للمنصة
    const { data: developers } = await supabase
      .from('developers')
      .select('views_count');
    
    const totalViews = developers?.reduce((acc, curr) => acc + (curr.views_count || 0), 0) || 0;

    // 7️⃣ إجمالي عدد الإعجابات للمنصة
    const { count: likesCount } = await supabase
      .from('likes')
      .select('*', { count: 'exact', head: true });

    return {
      users: usersCount || 0,
      portfolios: portfoliosCount || 0,
      projects: projectsCount || 0,
      templates: 50,
      satisfaction: 95,
      featuredDeveloper: featuredDeveloper || null,
      featuredProfiles: otherProfiles || [],
      totalViews: totalViews,
      totalLikes: likesCount || 0
    };
  } catch (error) {
    console.error('Error fetching platform stats:', error);
    return {
      users: 0,
      portfolios: 0,
      projects: 0,
      templates: 50,
      satisfaction: 95,
      featuredDeveloper: null,
      featuredProfiles: [],
      totalViews: 0,
      totalLikes: 0
    };
  }
},
  // ===========================================
// جلب بيانات الخبرات فقط (Experience)
// ===========================================
async getExperienceData(username) {
  try {
    // 1️⃣ جلب ID المطور أولاً
    const { data: developer, error: devError } = await supabase
      .from('developers')
      .select('id')
      .eq('username', username)
      .eq('is_active', true)
      .single();

    if (devError) throw devError;
    if (!developer) throw new Error('Developer not found');

    // 2️⃣ جلب جميع الخبرات
    const { data: experience, error: expError } = await supabase
      .from('experience')
      .select('*')
      .eq('developer_id', developer.id)
      .order('display_order', { ascending: true })
      .order('start_date', { ascending: false });

    if (expError) throw expError;

    // 3️⃣ حساب إجمالي سنوات الخبرة
    let totalYears = 0;
    experience?.forEach(exp => {
      if (exp.start_date) {
        const start = new Date(exp.start_date);
        const end = exp.is_current ? new Date() : (exp.end_date ? new Date(exp.end_date) : new Date());
        const years = (end - start) / (1000 * 60 * 60 * 24 * 365);
        totalYears += years;
      }
    });

    return {
      experience: experience || [],
      totalYears: Math.round(totalYears * 10) / 10 || 0
    };

  } catch (error) {
    console.error('Error fetching experience data:', error);
    throw error;
  }
},
  // ===========================================
// جلب بيانات التعليم فقط (Education)
// ===========================================
async getEducationData(username) {
  try {
    // 1️⃣ جلب ID المطور أولاً
    const { data: developer, error: devError } = await supabase
      .from('developers')
      .select('id')
      .eq('username', username)
      .eq('is_active', true)
      .single();

    if (devError) throw devError;
    if (!developer) throw new Error('Developer not found');

    // 2️⃣ جلب جميع المؤهلات التعليمية
    const { data: education, error: eduError } = await supabase
      .from('education')
      .select('*')
      .eq('developer_id', developer.id)
      .order('display_order', { ascending: true })
      .order('start_date', { ascending: false });

    if (eduError) throw eduError;

    return {
      education: education || [],
      total: education?.length || 0
    };

  } catch (error) {
    console.error('Error fetching education data:', error);
    throw error;
  }
},
// ===========================================
// جلب بيانات صفحة About (مكتملة مع الزوار واللايكات)
// ===========================================
async getAboutData(username) {
  try {
    // 1️⃣ جلب المطور الأساسي مع views_count و likes_count
    const { data: developer, error: devError } = await supabase
      .from('developers')
      .select(`
        id,
        username,
        full_name,
        bio,
        email,
        phone,
        location,
        profile_image,
        resume_file,
        views_count,
        likes_count
      `)
      .eq('username', username)
      .eq('is_active', true)
      .single();

    if (devError) throw devError;
    if (!developer) throw new Error('Developer not found');

    // 2️⃣ جلب روابط التواصل من جدول social_links
    const { data: socialLinks, error: socialError } = await supabase
      .from('social_links')
      .select('platform, url')
      .eq('developer_id', developer.id);

    if (socialError) throw socialError;

    // 3️⃣ جلب سنوات الخبرة من جدول experience
    const { data: experience, error: expError } = await supabase
      .from('experience')
      .select('start_date, end_date, is_current')
      .eq('developer_id', developer.id);

    if (expError) throw expError;

    // 4️⃣ جلب عدد المشاريع المنشورة
    const { count: projectsCount, error: projectsError } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('developer_id', developer.id)
      .eq('status', 'published');

    if (projectsError) throw projectsError;

    // 5️⃣ جلب عدد المهارات
    const { count: skillsCount, error: skillsError } = await supabase
      .from('skills')
      .select('*', { count: 'exact', head: true })
      .eq('developer_id', developer.id);

    if (skillsError) throw skillsError;

    // 6️⃣ جلب عدد الشهادات
    const { count: certificatesCount, error: certError } = await supabase
      .from('certificates')
      .select('*', { count: 'exact', head: true })
      .eq('developer_id', developer.id);

    if (certError) throw certError;

    // حساب سنوات الخبرة
    let totalYears = 0;
    experience?.forEach(exp => {
      if (exp.start_date) {
        const start = new Date(exp.start_date);
        const end = exp.is_current ? new Date() : (exp.end_date ? new Date(exp.end_date) : new Date());
        const years = (end - start) / (1000 * 60 * 60 * 24 * 365);
        totalYears += years;
      }
    });

    // تنسيق روابط التواصل
    const formattedSocialLinks = {};
    socialLinks?.forEach(link => {
      formattedSocialLinks[link.platform] = link.url;
    });

    return {
      developer: {
        ...developer,
        // views_count و likes_count موجودة بالفعل في developer
      },
      socialLinks: formattedSocialLinks,
      stats: {
        experience: Math.round(totalYears * 10) / 10 || 0,
        projects: projectsCount || 0,
        skills: skillsCount || 0,
        certificates: certificatesCount || 0,
        views: developer.views_count || 0,     // ✅ إضافة عدد الزوار
        likes: developer.likes_count || 0      // ✅ إضافة عدد اللايكات
      }
    };

  } catch (error) {
    console.error('Error fetching about data:', error);
    throw error;
  }
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
// خدمات الرسائل (Messages)
// ===========================================
export const messagesService = {
  // جلب جميع الرسائل لمطور معين
  async getByDeveloperId(developerId) {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('developer_id', developerId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  // جلب عدد الرسائل غير المقروءة
  async getUnreadCount(developerId) {
    const { count, error } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('developer_id', developerId)
      .eq('is_read', false)
    
    if (error) throw error
    return count || 0
  },

  // تحديث حالة القراءة
  async markAsRead(messageId) {
    const { error } = await supabase
      .from('messages')
      .update({ is_read: true, read_at: new Date() })
      .eq('id', messageId)
    
    if (error) throw error
    return true
  },

  // حذف رسالة
  async delete(messageId) {
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', messageId)
    
    if (error) throw error
    return true
  },

  // الرد على رسالة (يمكن استخدام خدمة بريد إلكتروني خارجية)
  async reply(messageId, replyContent) {
    // يمكن تنفيذ إرسال بريد إلكتروني هنا
    console.log('Reply to message', messageId, replyContent)
    return true
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
// ✅ جلب المشاريع المنشورة فقط (للعرض العام)
async getPublishedByDeveloperId(developerId) {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('developer_id', developerId)
    .eq('status', 'published')  // ✅ فقط المنشور
    .order('display_order', { ascending: true })
  
  if (error) {
    console.error('Error fetching published projects:', error)
    throw error
  }
  return data || []
},
  // ===========================================
// جلب مشروع واحد (بـ ID أو Slug)
// ===========================================
// ✅ جلب مشروع واحد (بـ ID أو Slug) - للمنشور فقط
async getProjectByIdOrSlug(identifier) {
  try {
    let query = supabase
      .from('projects')
      .select('*')
      .eq('status', 'published');  // ✅ أضف هذا السطر
    
    // التحقق إذا كان المعرف هو UUID أو Slug
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);
    
    if (isUUID) {
      // إذا كان UUID -> ابحث بـ id
      query = query.eq('id', identifier);
    } else {
      // إذا كان نص عادي -> ابحث بـ slug
      query = query.eq('slug', identifier);
    }
    
    const { data, error } = await query.single();
    
    if (error) {
      console.error('Error fetching project:', error);
      throw error;
    }
    
    return data;
    
  } catch (error) {
    console.error('Failed to fetch project:', error);
    throw error;
  }
},
  // ===========================================
// جلب جميع محتوى المطور (لصفحة Portfolio)
// ===========================================
async getDeveloperContent(developerId) {
  try {
    // جلب المشاريع المنشورة فقط
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('*')
      .eq('developer_id', developerId)
      .eq('status', 'published')
      .order('display_order', { ascending: true });
    
    if (projectsError) throw projectsError;

    // جلب جميع الشهادات
    const { data: certificates, error: certError } = await supabase
      .from('certificates')
      .select('*')
      .eq('developer_id', developerId)
      .order('display_order', { ascending: true });
    
    if (certError) throw certError;

    // جلب جميع المهارات
    const { data: skills, error: skillsError } = await supabase
      .from('skills')
      .select('*')
      .eq('developer_id', developerId)
      .order('display_order', { ascending: true });
    
    if (skillsError) throw skillsError;

    return {
      projects: projects || [],
      certificates: certificates || [],
      skills: skills || []
    };
    
  } catch (error) {
    console.error('Error fetching developer content:', error);
    throw error;
  }
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
// خدمات المهارات (Skills) - محدث
// ===========================================
export const skillService = {
  // جلب مهارات مطور معين
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

  // إنشاء مهارة جديدة
  async create(developerId, skillData) {
    // التحقق من حد الباقة
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

  // تحديث مهارة
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

  // حذف مهارة
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
  },

  // جلب المهارات الرئيسية فقط
  async getMainSkills(developerId) {
    const { data, error } = await supabase
      .from('skills')
      .select('*')
      .eq('developer_id', developerId)
      .eq('is_main', true)
      .order('display_order', { ascending: true })
    
    if (error) throw error
    return data || []
  },

  // جلب المهارات حسب التصنيف
  async getSkillsByCategory(developerId, category) {
    const { data, error } = await supabase
      .from('skills')
      .select('*')
      .eq('developer_id', developerId)
      .eq('category', category)
      .order('proficiency', { ascending: false })
    
    if (error) throw error
    return data || []
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
  // دالة حذف ملف من التخزين
async deleteFile(filePath) {
  try {
    if (!filePath) return
    const { error } = await supabase.storage
      .from('developers')
      .remove([filePath])
    
    if (error) throw error
    console.log('تم حذف الملف:', filePath)
    return true
  } catch (error) {
    console.error('فشل حذف الملف:', error)
    return false
  }
},
  // ✅ دالة جديدة لرفع صور المشاريع
  // ✅ دالة جديدة لرفع صور المشاريع (مصححة)
// ✅ دالة رفع صور المشاريع (مصححة بالكامل)
async uploadProjectImage(file, userId, projectId = null) {
  try {
    if (!file) throw new Error('لا يوجد ملف')
    if (!file.type.startsWith('image/')) throw new Error('الملف ليس صورة')
    if (file.size > 5 * 1024 * 1024) throw new Error('الصورة أكبر من 5 ميجابايت')

    // إذا كان المشروع جديد (projectId = null) -> استخدم مجلد مؤقت
    const folder = projectId || 'temp'
    const fileName = `${userId}/projects/${folder}/${uuidv4()}-${file.name}`

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

    return {
      url: data.publicUrl,
      path: fileName,  // حفظ المسار لنقله لاحقاً
      isTemp: !projectId // هل هو في مجلد مؤقت؟
    }

  } catch (error) {
    console.error('فشل رفع صورة المشروع:', error)
    throw error
  }
},

// ✅ دالة نقل الصورة من المجلد المؤقت إلى المجلد النهائي
async moveProjectImage(tempPath, userId, projectId) {
  try {
    if (!tempPath || !projectId) return null

    // استخراج اسم الملف
    const fileName = tempPath.split('/').pop()
    const newPath = `${userId}/projects/${projectId}/${fileName}`

    // نسخ الملف إلى المسار الجديد
    const { error: copyError } = await supabase.storage
      .from('developers')
      .copy(tempPath, newPath)

    if (copyError) throw copyError

    // حذف الملف القديم
    await supabase.storage.from('developers').remove([tempPath])

    // الحصول على الرابط الجديد
    const { data } = supabase.storage
      .from('developers')
      .getPublicUrl(newPath)

    return data.publicUrl
  } catch (error) {
    console.error('فشل نقل الصورة:', error)
    return null
  }
},
  // ✅ دالة جديدة لرفع صور الشهادات
  async uploadCertificateImage(file, userId, oldImageUrl = null) {
    try {
      if (!file) throw new Error('لا يوجد ملف')
      if (!file.type.startsWith('image/')) throw new Error('الملف ليس صورة')
      if (file.size > 5 * 1024 * 1024) throw new Error('الصورة أكبر من 5 ميجابايت')

      // ✅ نفس نمط الملف الشخصي: userId/certificates/uuid-filename.jpg
      const fileName = `${userId}/certificates/${uuidv4()}-${file.name}`

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

      // حذف الصورة القديمة إذا وجدت
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
  try {
    console.log('Attempting to register:', userData.email)
    
    // 1. إنشاء المستخدم في Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          full_name: userData.full_name
        },
        emailRedirectTo: `${window.location.origin}/confirm`
      }
    })
    
    if (error) {
      console.error('SignUp error details:', error)
      
      if (error.message.includes('User already registered')) {
        throw new Error('Email already in use')
      } else if (error.message.includes('Password should be at least 6 characters')) {
        throw new Error('Password must be at least 6 characters')
      } else if (error.message.includes('rate limit')) {
        throw new Error('Too many registration attempts. Please wait a moment.')
      } else {
        throw new Error(error.message || 'Registration failed')
      }
    }

    if (!data?.user) {
      throw new Error('User creation failed')
    }

    // ✅ إنشاء username من أول اسم فقط
    // مثال: "Mohamed Ahmed Ali" → "mohamed"
    const firstName = userData.full_name
      .split(' ')[0]  // خذ أول كلمة فقط
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')  // أزل الرموز الخاصة
      .trim();

    // التأكد من أن username فريد بإضافة أحرف عشوائية إذا كان موجوداً
    const username = firstName + '-' + Math.random().toString(36).substring(2, 6);

    console.log('Generated username:', username)

    // 3. تخزين البيانات في الجدول المؤقت
    const { error: insertError } = await supabase
      .from('pending_developers')
      .insert([{
        id: data.user.id,
        username,  // ✅ الآن هو أول اسم فقط
        email: userData.email,
        full_name: userData.full_name,
        plan_id: 1,
        role: 'user'
      }])
      .select()

    if (insertError) {
      console.error('Insert error:', insertError)
      throw new Error('Failed to save user data. Please try again.')
    }

    // 4. تخزين البريد في sessionStorage للتوجيه
    sessionStorage.setItem('pendingVerification', userData.email)

    return { 
      success: true, 
      user: data.user,
      message: 'Verification link sent to your email'
    }
  } catch (error) {
    console.error('Registration error:', error)
    throw error
  }
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
// ===========================================
// خدمات الإحصائيات والتحليلات - StatsService
// ===========================================
export const statsService = {
  // 📊 إحصائيات أساسية للمطور
  async getDeveloperStats(developerId) {
    try {
      // جلب بيانات المطور الأساسية
      const { data: developer } = await supabase
        .from('developers')
        .select('views_count, likes_count, created_at')
        .eq('id', developerId)
        .single()

      // جلب عدد الرسائل
      const { count: messagesCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('developer_id', developerId)

      // جلب عدد الرسائل غير المقروءة
      const { count: unreadCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('developer_id', developerId)
        .eq('is_read', false)

      // جلب عدد الزوار
      const { count: visitorsCount } = await supabase
        .from('visitors')
        .select('*', { count: 'exact', head: true })
        .eq('developer_id', developerId)

      // جلب عدد المشاهدات اليومية لآخر 7 أيام
      const last7Days = new Date()
      last7Days.setDate(last7Days.getDate() - 7)

      const { data: recentViews } = await supabase
        .from('visitors')
        .select('visited_at')
        .eq('developer_id', developerId)
        .gte('visited_at', last7Days.toISOString())

      // تجميع المشاهدات حسب اليوم
      const dailyViews = {}
      recentViews?.forEach(view => {
        const date = new Date(view.visited_at).toLocaleDateString('ar-SA')
        dailyViews[date] = (dailyViews[date] || 0) + 1
      })

      return {
        views: developer?.views_count || 0,
        likes: developer?.likes_count || 0,
        messages: messagesCount || 0,
        unreadMessages: unreadCount || 0,
        visitors: visitorsCount || 0,
        dailyViews,
        memberSince: developer?.created_at,
        weeklyTrend: Object.values(dailyViews).reduce((a, b) => a + b, 0)
      }
    } catch (error) {
      console.error('Error in getDeveloperStats:', error)
      return {
        views: 0,
        likes: 0,
        messages: 0,
        unreadMessages: 0,
        visitors: 0,
        dailyViews: {},
        weeklyTrend: 0
      }
    }
  },

  // 📈 إحصائيات المحتوى
  async getContentStats(developerId) {
    try {
      const [
        projects,
        skills,
        certificates,
        experience,
        education
      ] = await Promise.all([
        supabase.from('projects').select('*', { count: 'exact', head: true }).eq('developer_id', developerId),
        supabase.from('skills').select('*', { count: 'exact', head: true }).eq('developer_id', developerId),
        supabase.from('certificates').select('*', { count: 'exact', head: true }).eq('developer_id', developerId),
        supabase.from('experience').select('*', { count: 'exact', head: true }).eq('developer_id', developerId),
        supabase.from('education').select('*', { count: 'exact', head: true }).eq('developer_id', developerId)
      ])

      // جلب أحدث المشاريع
      const { data: latestProjects } = await supabase
        .from('projects')
        .select('title, created_at, image')
        .eq('developer_id', developerId)
        .order('created_at', { ascending: false })
        .limit(3)

      // جلب أكثر المهارات إتقاناً
      const { data: topSkills } = await supabase
        .from('skills')
        .select('name, proficiency')
        .eq('developer_id', developerId)
        .order('proficiency', { ascending: false })
        .limit(5)

      return {
        counts: {
          projects: projects.count || 0,
          skills: skills.count || 0,
          certificates: certificates.count || 0,
          experience: experience.count || 0,
          education: education.count || 0
        },
        latestProjects: latestProjects || [],
        topSkills: topSkills || []
      }
    } catch (error) {
      console.error('Error in getContentStats:', error)
      return {
        counts: {
          projects: 0,
          skills: 0,
          certificates: 0,
          experience: 0,
          education: 0
        },
        latestProjects: [],
        topSkills: []
      }
    }
  },

  // 🌍 إحصائيات الزوار المتقدمة (للمستخدمين المدفوعين)
  async getAdvancedVisitorStats(developerId) {
    try {
      // جلب آخر 30 يوم
      const last30Days = new Date()
      last30Days.setDate(last30Days.getDate() - 30)

      const { data: visitors } = await supabase
        .from('visitors')
        .select('*')
        .eq('developer_id', developerId)
        .gte('visited_at', last30Days.toISOString())

      // تحليل الدول
      const countries = {}
      // تحليل الأجهزة
      const devices = { mobile: 0, desktop: 0, tablet: 0 }
      // تحليل المتصفحات
      const browsers = {}
      // تحليل مصادر الزيارات
      const referrers = {}

      visitors?.forEach(visitor => {
        if (visitor.visitor_country) {
          countries[visitor.visitor_country] = (countries[visitor.visitor_country] || 0) + 1
        }
        if (visitor.device_type) {
          devices[visitor.device_type] = (devices[visitor.device_type] || 0) + 1
        }
        if (visitor.browser) {
          browsers[visitor.browser] = (browsers[visitor.browser] || 0) + 1
        }
        if (visitor.referrer) {
          const source = this.extractReferrerSource(visitor.referrer)
          referrers[source] = (referrers[source] || 0) + 1
        }
      })

      return {
        total: visitors?.length || 0,
        countries: Object.entries(countries).sort((a, b) => b[1] - a[1]),
        devices,
        browsers: Object.entries(browsers).sort((a, b) => b[1] - a[1]),
        referrers: Object.entries(referrers).sort((a, b) => b[1] - a[1]),
        daily: this.aggregateDailyVisits(visitors || [])
      }
    } catch (error) {
      console.error('Error in getAdvancedVisitorStats:', error)
      return null
    }
  },

  // 🤖 تحليلات الذكاء الاصطناعي (للمستخدمين مع AI Analysis)
  async getAIAnalysisStats(developerId) {
    try {
      const { data: analyses } = await supabase
        .from('ai_analyses')
        .select('*')
        .eq('user_id', developerId)
        .order('analyzed_at', { ascending: false })

      if (!analyses) return null

      // تحليل نتائج الذكاء الاصطناعي
      const skillsExtracted = []
      const suggestions = []

      analyses?.forEach(analysis => {
        if (analysis.analysis_result?.skills) {
          skillsExtracted.push(...analysis.analysis_result.skills)
        }
        if (analysis.analysis_result?.suggestions) {
          suggestions.push(...analysis.analysis_result.suggestions)
        }
      })

      return {
        totalAnalyses: analyses.length,
        lastAnalysis: analyses[0]?.analyzed_at,
        extractedSkills: [...new Set(skillsExtracted)],
        suggestions: [...new Set(suggestions)],
        improvementScore: this.calculateImprovementScore(analyses)
      }
    } catch (error) {
      console.error('Error in getAIAnalysisStats:', error)
      return null
    }
  },

  // دوال مساعدة
  extractReferrerSource(referrer) {
    if (!referrer) return 'مباشر'
    if (referrer.includes('google')) return 'Google'
    if (referrer.includes('linkedin')) return 'LinkedIn'
    if (referrer.includes('github')) return 'GitHub'
    if (referrer.includes('twitter')) return 'Twitter'
    return 'آخر'
  },

  aggregateDailyVisits(visitors) {
    const daily = {}
    visitors.forEach(v => {
      const date = new Date(v.visited_at).toLocaleDateString('ar-SA')
      daily[date] = (daily[date] || 0) + 1
    })
    return daily
  },

  calculateImprovementScore(analyses) {
    // حساب نسبة التحسن بين التحليلات
    if (analyses.length < 2) return 0
    return Math.min(100, analyses.length * 15) // مثال بسيط
  }
        }
