// الباقات
export const PLANS = [
  {
    id: 1,
    name: 'Free',
    name_ar: 'مجاني',
    price: 0,
    features: [
      '3 مشاريع كحد أقصى',
      '10 مهارات',
      '3 شهادات',
      '5 سنوات خبرة',
      '5 مؤهلات تعليمية',
      '50 ميجابايت مساحة تخزين'
    ]
  },
  {
    id: 2,
    name: 'Basic',
    name_ar: 'أساسي',
    price: 9.99,
    features: [
      '10 مشاريع',
      '20 مهارة',
      '10 شهادات',
      '10 سنوات خبرة',
      '10 مؤهلات تعليمية',
      '200 ميجابايت مساحة تخزين',
      'إحصائيات وتحليلات'
    ]
  },
  {
    id: 3,
    name: 'Pro',
    name_ar: 'محترف',
    price: 19.99,
    isPopular: true,
    features: [
      '30 مشروع',
      '50 مهارة',
      '30 شهادة',
      '20 سنة خبرة',
      '20 مؤهل تعليمي',
      '500 ميجابايت مساحة تخزين',
      'إحصائيات متقدمة',
      'نطاق مخصص',
      'إزالة العلامة التجارية'
    ]
  },
  {
    id: 4,
    name: 'Enterprise',
    name_ar: 'مؤسسات',
    price: 49.99,
    features: [
      '100 مشروع',
      '100 مهارة',
      '100 شهادة',
      '50 سنة خبرة',
      '50 مؤهل تعليمي',
      '2 جيجابايت مساحة تخزين',
      'كل ميزات الباقة المحترفة',
      'دعم فوري وأولوية'
    ]
  }
]

// فئات المهارات
export const SKILL_CATEGORIES = [
  'Frontend',
  'Backend',
  'Database',
  'DevOps',
  'Mobile',
  'Design',
  'Tools',
  'Soft Skills'
]

// منصات التواصل الاجتماعي
export const SOCIAL_PLATFORMS = [
  { id: 'github', name: 'GitHub', icon: 'github', placeholder: 'https://github.com/username' },
  { id: 'linkedin', name: 'LinkedIn', icon: 'linkedin', placeholder: 'https://linkedin.com/in/username' },
  { id: 'twitter', name: 'Twitter', icon: 'twitter', placeholder: 'https://twitter.com/username' },
  { id: 'instagram', name: 'Instagram', icon: 'instagram', placeholder: 'https://instagram.com/username' },
  { id: 'facebook', name: 'Facebook', icon: 'facebook', placeholder: 'https://facebook.com/username' },
  { id: 'youtube', name: 'YouTube', icon: 'youtube', placeholder: 'https://youtube.com/@username' },
  { id: 'website', name: 'الموقع الشخصي', icon: 'globe', placeholder: 'https://example.com' }
]

// طرق الدفع
export const PAYMENT_METHODS = [
  {
    id: 'crypto',
    name: 'عملات رقمية',
    icon: 'bitcoin',
    types: [
      { id: 'btc', name: 'Bitcoin (BTC)' },
      { id: 'eth', name: 'Ethereum (ETH)' },
      { id: 'usdt', name: 'Tether (USDT) - TRC20' }
    ]
  },
  {
    id: 'onecash',
    name: 'ون كاش',
    icon: 'wallet'
  },
  {
    id: 'bank',
    name: 'تحويل بنكي',
    icon: 'landmark'
  }
]

// أيقونات التقنيات (من مجلد public/icons)
export const TECH_ICONS = [
  { name: 'HTML', icon: '/icons/html.svg' },
  { name: 'CSS', icon: '/icons/css.svg' },
  { name: 'JavaScript', icon: '/icons/javascript.svg' },
  { name: 'Tailwind CSS', icon: '/icons/tailwind.svg' },
  { name: 'React', icon: '/icons/reactjs.svg' },
  { name: 'Vite', icon: '/icons/vite.svg' },
  { name: 'Node.js', icon: '/icons/nodejs.svg' },
  { name: 'Bootstrap', icon: '/icons/bootstrap.svg' },
  { name: 'Firebase', icon: '/icons/firebase.svg' },
  { name: 'Material UI', icon: '/icons/MUI.svg' },
  { name: 'Vercel', icon: '/icons/vercel.svg' },
  { name: 'SweetAlert2', icon: '/icons/SweetAlert.svg' }
]

// ألوان التدرج للمهارات
export const SKILL_GRADIENTS = {
  Frontend: 'from-blue-500 to-cyan-500',
  Backend: 'from-green-500 to-emerald-500',
  Database: 'from-yellow-500 to-orange-500',
  DevOps: 'from-purple-500 to-pink-500',
  Mobile: 'from-indigo-500 to-purple-500',
  Design: 'from-pink-500 to-rose-500',
  Tools: 'from-gray-500 to-slate-500',
  'Soft Skills': 'from-red-500 to-orange-500'
}

// مستويات الكفاءة
export const PROFICIENCY_LEVELS = [
  { value: 25, label: 'Beginner' },
  { value: 50, label: 'Intermediate' },
  { value: 75, label: 'Advanced' },
  { value: 100, label: 'Expert' }
]

// أنواع التوظيف
export const EMPLOYMENT_TYPES = [
  { id: 'full-time', name: 'دوام كامل' },
  { id: 'part-time', name: 'دوام جزئي' },
  { id: 'freelance', name: 'عمل حر' },
  { id: 'contract', name: 'عقد' },
  { id: 'internship', name: 'تدريب' }
]

// مواقع العمل
export const LOCATION_TYPES = [
  { id: 'on-site', name: 'في المكتب' },
  { id: 'remote', name: 'عن بعد' },
  { id: 'hybrid', name: 'هجين' }
]

// الدرجات العلمية
export const DEGREE_TYPES = [
  'بكالوريوس',
  'ماجستير',
  'دكتوراه',
  'دبلوم',
  'شهادة مهنية',
  'دورة تدريبية'
]

// حالات الدفع
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
}

// أدوار المستخدمين
export const USER_ROLES = {
  DEVELOPER: 'developer',
  ADMIN: 'admin'
}

// رسائل النظام
export const MESSAGES = {
  LOGIN_SUCCESS: 'تم تسجيل الدخول بنجاح',
  LOGIN_ERROR: 'خطأ في البريد الإلكتروني أو كلمة المرور',
  REGISTER_SUCCESS: 'تم إنشاء الحساب بنجاح',
  REGISTER_ERROR: 'حدث خطأ أثناء إنشاء الحساب',
  UPDATE_SUCCESS: 'تم التحديث بنجاح',
  UPDATE_ERROR: 'حدث خطأ أثناء التحديث',
  DELETE_SUCCESS: 'تم الحذف بنجاح',
  DELETE_ERROR: 'حدث خطأ أثناء الحذف',
  UPLOAD_SUCCESS: 'تم رفع الملف بنجاح',
  UPLOAD_ERROR: 'حدث خطأ أثناء رفع الملف',
  LIMIT_REACHED: 'لقد وصلت للحد الأقصى المسموح به'
}