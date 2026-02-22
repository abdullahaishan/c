// تنسيق التاريخ
export const formatDate = (date) => {
  if (!date) return ''
  
  const d = new Date(date)
  return d.toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// حساب مدة الخبرة
export const calculateExperienceDuration = (startDate, endDate, isCurrent = false) => {
  const start = new Date(startDate)
  const end = isCurrent ? new Date() : new Date(endDate)
  
  const years = end.getFullYear() - start.getFullYear()
  const months = end.getMonth() - start.getMonth()
  
  if (months < 0) {
    return `${years - 1} سنوات و ${12 + months} أشهر`
  }
  
  return `${years} سنوات و ${months} أشهر`
}

// اختصار النص
export const truncateText = (text, maxLength = 100) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

// التحقق من صحة البريد الإلكتروني
export const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

// التحقق من صحة رابط
export const isValidUrl = (url) => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// إنشاء اسم مستخدم من الاسم
export const generateUsername = (fullName) => {
  return fullName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 30)
}

// حساب حجم الملف بالميجابايت
export const getFileSizeInMB = (bytes) => {
  return (bytes / (1024 * 1024)).toFixed(2)
}

// التحقق من نوع الملف المسموح به
export const isAllowedFileType = (file, allowedTypes = ['image/jpeg', 'image/png', 'image/gif']) => {
  return allowedTypes.includes(file.type)
}

// التحقق من حجم الملف
export const isAllowedFileSize = (file, maxSizeMB = 5) => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024
  return file.size <= maxSizeBytes
}