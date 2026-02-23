// نسخة مبسطة من imageOptimizer
export const imageOptimizer = {
  validateFile(file, maxSizeMB = 5) {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      throw new Error('نوع الملف غير مسموح')
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      throw new Error(`الملف كبير جداً. الحد الأقصى ${maxSizeMB}MB`)
    }
    return true
  },

  async optimizeImage(file, options = {}) {
    // في هذه النسخة، نرجع الملف كما هو بدون تحسين
    return file
  }
}
