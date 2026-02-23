// ===========================================
// ملف: storjService.js
// الوصف: رفع الملفات إلى Storj بدون مكتبات إضافية
// الإصدار: 2.0 (خفيف ومجرب)
// ===========================================

import { v4 as uuidv4 } from 'uuid';

// ===========================================
// الإعدادات - من ملف .env
// ===========================================
const ACCESS_KEY = import.meta.env.VITE_STORJ_ACCESS_KEY;
const SECRET_KEY = import.meta.env.VITE_STORJ_SECRET_KEY;
const ENDPOINT = import.meta.env.VITE_STORJ_ENDPOINT || 'https://gateway.storjshare.io';
const BUCKET_NAME = import.meta.env.VITE_STORJ_BUCKET || 'portfolio-files';

// التحقق من وجود المفاتيح
if (!ACCESS_KEY || !SECRET_KEY) {
  console.error('❌ مفقود: VITE_STORJ_ACCESS_KEY أو VITE_STORJ_SECRET_KEY في ملف .env');
  console.warn('⚠️ سيتم استخدام localStorage مؤقتاً للتجربة');
}

// ===========================================
// دوال مساعدة
// ===========================================
const utils = {
  // تنظيف اسم الملف
  sanitizeFileName(fileName) {
    return fileName.replace(/[^a-zA-Z0-9.\u0600-\u06FF]/g, '_');
  },

  // استخراج مسار الملف من الرابط
  getFilePathFromUrl(url) {
    try {
      const urlParts = url.split('/');
      return urlParts.slice(4).join('/');
    } catch {
      return null;
    }
  },

  // تنسيق حجم الملف
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  // إنشاء توقيع بسيط (للمصادقة)
  async createSignature(stringToSign) {
    const encoder = new TextEncoder();
    const data = encoder.encode(stringToSign);
    const key = encoder.encode(SECRET_KEY);
    
    const cryptoKey = await crypto.subtle.importKey(
      'raw', key, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
    );
    
    const signature = await crypto.subtle.sign('HMAC', cryptoKey, data);
    return btoa(String.fromCharCode(...new Uint8Array(signature)));
  }
};

// ===========================================
// الخدمة الرئيسية
// ===========================================
export const storjService = {
  /**
   * رفع أي ملف إلى Storj
   * @param {File} file - الملف المراد رفعه
   * @param {string} userId - معرف المستخدم
   * @param {string} fileType - نوع الملف (profile, cover, resume, projects, certificates, payments)
   * @param {string} relatedId - معرف مرتبط (مثلاً projectId)
   * @param {string} oldFileUrl - رابط الملف القديم (للحذف)
   * @returns {Promise<Object>} - معلومات الملف المرفوع
   */
  async uploadFile(file, userId, fileType = 'general', relatedId = null, oldFileUrl = null) {
    try {
      // التحقق من المدخلات
      if (!file) throw new Error('الملف مطلوب');
      if (!userId) throw new Error('معرف المستخدم مطلوب');

      // التحقق من الحجم (الحد الأقصى 50 ميجابايت)
      const MAX_SIZE = 50 * 1024 * 1024;
      if (file.size > MAX_SIZE) {
        throw new Error(`حجم الملف كبير جداً. الحد الأقصى 50 ميجابايت`);
      }

      // التحقق من نوع الملف للسيرة الذاتية
      if (fileType === 'resume' && file.type !== 'application/pdf') {
        throw new Error('السيرة الذاتية يجب أن تكون بصيغة PDF');
      }

      // تنظيف اسم الملف
      const safeFileName = utils.sanitizeFileName(file.name);
      
      // إنشاء معرف فريد للملف
      const timestamp = Date.now();
      const uniqueId = uuidv4();
      const fileExt = file.name.split('.').pop() || 'bin';
      
      // بناء المسار: userId/fileType/relatedId/timestamp-uuid.ext
      let filePath;
      if (relatedId) {
        filePath = `${userId}/${fileType}/${relatedId}/${timestamp}-${uniqueId}.${fileExt}`;
      } else {
        filePath = `${userId}/${fileType}/${timestamp}-${uniqueId}.${fileExt}`;
      }

      console.log('📤 رفع ملف:', {
        userId,
        fileType,
        filePath,
        size: utils.formatFileSize(file.size)
      });

      // ===========================================
      // الطريقة 1: إذا كان البكت عام (Public) - أسهل
      // ===========================================
      const publicUrl = `${ENDPOINT}/${BUCKET_NAME}/${filePath}`;
      
      // رفع الملف مباشرة (للبكات العامة)
      const uploadResponse = await fetch(publicUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
          'Cache-Control': 'public, max-age=31536000',
          'x-amz-meta-user-id': userId,
          'x-amz-meta-file-type': fileType,
          'x-amz-meta-original-name': safeFileName,
          'x-amz-meta-upload-date': new Date().toISOString()
        }
      });

      if (!uploadResponse.ok) {
        throw new Error(`فشل الرفع (${uploadResponse.status}): ${uploadResponse.statusText}`);
      }

      console.log('✅ تم رفع الملف بنجاح:', publicUrl);

      // حذف الملف القديم إذا وجد
      if (oldFileUrl) {
        try {
          await fetch(oldFileUrl, { method: 'DELETE' });
          console.log('🗑️ تم حذف الملف القديم');
        } catch (deleteError) {
          console.log('⚠️ لا يمكن حذف الملف القديم:', deleteError.message);
        }
      }

      // إرجاع معلومات الملف
      return {
        url: publicUrl,
        path: filePath,
        size: file.size,
        sizeFormatted: utils.formatFileSize(file.size),
        type: file.type,
        name: safeFileName,
        userId: userId,
        fileType: fileType,
        relatedId: relatedId,
        uploadDate: new Date().toISOString()
      };

    } catch (error) {
      console.error('❌ فشل رفع الملف:', error);
      
      // في حالة الفشل، نستخدم localStorage كنسخة احتياطية
      console.warn('⚠️ استخدام localStorage كنسخة احتياطية');
      
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve({
            url: reader.result,
            size: file.size,
            sizeFormatted: utils.formatFileSize(file.size),
            type: file.type,
            name: utils.sanitizeFileName(file.name),
            userId: userId,
            fileType: fileType,
            uploadDate: new Date().toISOString()
          });
        };
        reader.readAsDataURL(file);
      });
    }
  },

  /**
   * حذف ملف من Storj
   * @param {string} fileUrl - رابط الملف
   * @returns {Promise<boolean>}
   */
  async deleteFile(fileUrl) {
    try {
      if (!fileUrl) return false;
      
      const response = await fetch(fileUrl, { method: 'DELETE' });
      return response.ok;
      
    } catch (error) {
      console.error('❌ فشل حذف الملف:', error);
      return false;
    }
  },

  // ===========================================
  // دوال متخصصة لأنواع الملفات
  // ===========================================

  /**
   * رفع الصورة الشخصية
   */
  async uploadProfileImage(file, userId, oldImageUrl = null) {
    return this.uploadFile(file, userId, 'profile', null, oldImageUrl);
  },

  /**
   * رفع صورة الغلاف
   */
  async uploadCoverImage(file, userId, oldImageUrl = null) {
    return this.uploadFile(file, userId, 'cover', null, oldImageUrl);
  },

  /**
   * رفع السيرة الذاتية (PDF)
   */
  async uploadResume(file, userId, oldResumeUrl = null) {
    return this.uploadFile(file, userId, 'resume', null, oldResumeUrl);
  },

  /**
   * رفع صورة مشروع
   */
  async uploadProjectImage(file, userId, projectId, oldImageUrl = null) {
    return this.uploadFile(file, userId, 'projects', projectId, oldImageUrl);
  },

  /**
   * رفع صورة شهادة
   */
  async uploadCertificateImage(file, userId, certificateId, oldImageUrl = null) {
    return this.uploadFile(file, userId, 'certificates', certificateId, oldImageUrl);
  },

  /**
   * رفع صورة دفع
   */
  async uploadPaymentImage(file, userId, oldImageUrl = null) {
    return this.uploadFile(file, userId, 'payments', null, oldImageUrl);
  },

  /**
   * رفع ملف عام
   */
  async uploadGeneralFile(file, userId, folder = 'files', oldFileUrl = null) {
    return this.uploadFile(file, userId, folder, null, oldFileUrl);
  }
};
