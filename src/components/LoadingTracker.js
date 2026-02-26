import { supabase } from './supabase';

export const loadingTracker = {
  // تتبع تحميل جدول معين
  async trackTable(tableName, developerId) {
    const startTime = Date.now();
    
    try {
      console.log(`🔍 جاري تحميل ${tableName}...`);
      
      // ✅ طلب حقيقي لـ Supabase
      const { data, error, count } = await supabase
        .from(tableName)
        .select('*', { count: 'exact' })
        .eq('developer_id', developerId);

      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000;

      if (error) throw error;

      console.log(`✅ تم تحميل ${tableName}: ${data?.length || 0} عنصر في ${duration} ثانية`);
      
      return {
        success: true,
        data: data || [],
        count: count || 0,
        duration,
        table: tableName
      };
      
    } catch (error) {
      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000;
      
      console.error(`❌ فشل تحميل ${tableName}:`, error.message);
      
      return {
        success: false,
        error: error.message,
        duration,
        table: tableName
      };
    }
  },

  // تتبع تحميل الصورة الشخصية
  async trackProfileImage(imageUrl) {
    if (!imageUrl) {
      return {
        success: false,
        error: 'No image URL',
        table: 'profile_image'
      };
    }

    const startTime = Date.now();
    
    try {
      // ✅ تحقق من وجود الصورة
      const response = await fetch(imageUrl, { method: 'HEAD' });
      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000;

      if (!response.ok) throw new Error('Image not found');

      return {
        success: true,
        data: imageUrl,
        duration,
        table: 'profile_image'
      };
      
    } catch (error) {
      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000;
      
      return {
        success: false,
        error: error.message,
        duration,
        table: 'profile_image'
      };
    }
  },

  // تحميل كل شيء بالتوازي
  async loadAll(developerId, onProgress) {
    const startTime = Date.now();
    
    // قائمة المهام
    const tasks = [
      { table: 'developers', query: () => this.trackTable('developers', developerId) },
      { table: 'skills', query: () => this.trackTable('skills', developerId) },
      { table: 'projects', query: () => this.trackTable('projects', developerId) },
      { table: 'certificates', query: () => this.trackTable('certificates', developerId) },
      { table: 'experience', query: () => this.trackTable('experience', developerId) },
      { table: 'education', query: () => this.trackTable('education', developerId) },
      { table: 'social_links', query: () => this.trackTable('social_links', developerId) }
    ];

    const results = {};
    let completed = 0;

    // تشغيل كل المهام بالتوازي
    const promises = tasks.map(async (task) => {
      const result = await task.query();
      results[task.table] = result;
      completed++;
      
      // تحديث التقدم
      if (onProgress) {
        onProgress({
          completed,
          total: tasks.length,
          currentTable: task.table,
          result
        });
      }
      
      return result;
    });

    await Promise.all(promises);
    
    const totalDuration = (Date.now() - startTime) / 1000;
    
    return {
      results,
      totalDuration,
      summary: this.generateSummary(results)
    };
  },

  // توليد ملخص
  generateSummary(results) {
    const summary = {
      total: Object.keys(results).length,
      success: 0,
      failed: 0,
      totalItems: 0,
      failedTables: []
    };

    Object.entries(results).forEach(([table, result]) => {
      if (result.success) {
        summary.success++;
        summary.totalItems += result.count || 1;
      } else {
        summary.failed++;
        summary.failedTables.push({
          table,
          error: result.error
        });
      }
    });

    return summary;
  }
};
