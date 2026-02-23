import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

const ACCESS_KEY = import.meta.env.VITE_STORJ_ACCESS_KEY;
const SECRET_KEY = import.meta.env.VITE_STORJ_SECRET_KEY;
const ENDPOINT = import.meta.env.VITE_STORJ_ENDPOINT || 'https://gateway.storjshare.io';
const BUCKET_NAME = import.meta.env.VITE_STORJ_BUCKET || 'portfolio-files';

if (!ACCESS_KEY || !SECRET_KEY) {
  console.error('❌ مفقود: VITE_STORJ_ACCESS_KEY أو VITE_STORJ_SECRET_KEY في ملف .env');
}

const s3Client = new S3Client({
  region: 'global',
  endpoint: ENDPOINT,
  credentials: {
    accessKeyId: ACCESS_KEY,
    secretAccessKey: SECRET_KEY,
  },
  forcePathStyle: true,
});

const utils = {
  sanitizeFileName(fileName) {
    return fileName.replace(/[^a-zA-Z0-9.\u0600-\u06FF]/g, '_');
  },
  getFilePathFromUrl(url) {
    try {
      const urlParts = url.split('/');
      return urlParts.slice(4).join('/');
    } catch {
      return null;
    }
  },
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
};

export const storjService = {
  async uploadFile(file, userId, fileType = 'general', relatedId = null, oldFileUrl = null) {
    try {
      if (!file) throw new Error('الملف مطلوب');
      if (!userId) throw new Error('معرف المستخدم مطلوب');

      const MAX_SIZE = 50 * 1024 * 1024; // 50MB
      if (file.size > MAX_SIZE) {
        throw new Error(`حجم الملف كبير جداً. الحد الأقصى 50 ميجابايت`);
      }

      const safeFileName = utils.sanitizeFileName(file.name);
      const timestamp = Date.now();
      const uniqueId = uuidv4();
      const fileExt = file.name.split('.').pop() || 'bin';
      
      let folder = fileType;
      if (relatedId) {
        folder = `${fileType}/${relatedId}`;
      }
      
      const filePath = `${userId}/${folder}/${timestamp}-${uniqueId}.${fileExt}`;

      const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: filePath,
        Body: file,
        ContentType: file.type,
        CacheControl: 'public, max-age=31536000',
        Metadata: {
          'user-id': userId,
          'file-type': fileType,
          'original-name': safeFileName,
          'related-id': relatedId || '',
          'upload-date': new Date().toISOString()
        }
      });

      await s3Client.send(command);

      const publicUrl = `${ENDPOINT}/${BUCKET_NAME}/${filePath}`;

      if (oldFileUrl) {
        await this.deleteFile(oldFileUrl).catch(e => 
          console.log('⚠️ لا يمكن حذف الملف القديم:', e.message)
        );
      }

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
      throw error;
    }
  },

  async deleteFile(fileUrl) {
    try {
      if (!fileUrl) return false;
      const filePath = utils.getFilePathFromUrl(fileUrl);
      if (!filePath) return false;

      const command = new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: filePath,
      });

      await s3Client.send(command);
      return true;
    } catch (error) {
      console.error('❌ فشل حذف الملف:', error);
      return false;
    }
  },

  async uploadProfileImage(file, userId, oldImageUrl = null) {
    return this.uploadFile(file, userId, 'profile', null, oldImageUrl);
  },

  async uploadCoverImage(file, userId, oldImageUrl = null) {
    return this.uploadFile(file, userId, 'cover', null, oldImageUrl);
  },

  async uploadResume(file, userId, oldResumeUrl = null) {
    if (file.type !== 'application/pdf') {
      throw new Error('الملف يجب أن يكون PDF');
    }
    return this.uploadFile(file, userId, 'resume', null, oldResumeUrl);
  },

  async uploadCertificate(file, userId, certificateId, oldFileUrl = null) {
    return this.uploadFile(file, userId, 'certificate', certificateId, oldFileUrl);
  },

  async uploadProjectImage(file, userId, projectId, oldImageUrl = null) {
    return this.uploadFile(file, userId, 'project', projectId, oldImageUrl);
  },

  async uploadGeneralFile(file, userId, customFolder = 'files', oldFileUrl = null) {
    return this.uploadFile(file, userId, customFolder, null, oldFileUrl);
  }
};
