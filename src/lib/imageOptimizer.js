// ملف بديل لضغط الصور بدون مكتبات إضافية
export const imageOptimizer = {
  // تحويل الصورة إلى WebP وتقليل حجمها
  async optimizeImage(file, options = {}) {
    return new Promise((resolve, reject) => {
      const {
        maxWidth = 1200,
        maxHeight = 1200,
        quality = 0.8,
        format = 'webp'
      } = options

      // إنشاء قارئ الملف
      const reader = new FileReader()
      reader.readAsDataURL(file)
      
      reader.onload = (event) => {
        const img = new Image()
        img.src = event.target.result
        
        img.onload = () => {
          // حساب الأبعاد الجديدة
          let width = img.width
          let height = img.height
          
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width)
            width = maxWidth
          }
          
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height)
            height = maxHeight
          }

          // إنشاء Canvas للرسم
          const canvas = document.createElement('canvas')
          canvas.width = width
          canvas.height = height
          
          const ctx = canvas.getContext('2d')
          ctx.drawImage(img, 0, 0, width, height)

          // تحويل إلى WebP أو JPEG
          const mimeType = format === 'webp' ? 'image/webp' : 'image/jpeg'
          
          canvas.toBlob((blob) => {
            if (!blob) {
              reject(new Error('فشل في تحويل الصورة'))
              return
            }

            // إنشاء ملف جديد
            const optimizedFile = new File([blob], file.name.replace(/\.[^/.]+$/, `.${format}`), {
              type: mimeType,
              lastModified: Date.now()
            })

            // إحصائيات التحسين
            const savings = ((file.size - blob.size) / file.size * 100).toFixed(1)
            console.log(`✅ تم تحسين الصورة: ${(file.size/1024).toFixed(0)}KB → ${(blob.size/1024).toFixed(0)}KB (توفير ${savings}%)`)

            resolve(optimizedFile)
          }, mimeType, quality)
        }
        
        img.onerror = () => reject(new Error('فشل في تحميل الصورة'))
      }
      
      reader.onerror = () => reject(new Error('فشل في قراءة الملف'))
    })
  },

  // التحقق من حجم الملف ونوعه
  validateFile(file, maxSizeMB = 5) {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/heic']
    
    if (!allowedTypes.includes(file.type) && !file.type.startsWith('image/')) {
      throw new Error(`❌ نوع الملف غير مسموح. الرجاء رفع صورة`)
    }
    
    const maxSizeBytes = maxSizeMB * 1024 * 1024
    if (file.size > maxSizeBytes) {
      throw new Error(`❌ الملف كبير جداً. الحد الأقصى: ${maxSizeMB}MB`)
    }
    
    return true
  },

  // الحصول على صورة مصغرة (thumbnail)
  async getThumbnail(file, size = 100) {
    return this.optimizeImage(file, {
      maxWidth: size,
      maxHeight: size,
      quality: 0.6,
      format: 'webp'
    })
  }
}