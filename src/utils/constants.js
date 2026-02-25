// src/utils/constants.js
export const PLANS = [
  {
    id: 1,
    name: 'Free',
    name_ar: 'مجاني',
    price: 0,
    description: 'جرب المنصة وتعرف على مميزاتها',
    features: [
      { text: 'المشاريع', limit: '1', value: 1 },
      { text: 'المهارات', limit: '2', value: 2 },
      { text: 'الشهادات', limit: '1', value: 1 },
      { text: 'الخبرات', limit: '1', value: 1 },
      { text: 'المؤهلات التعليمية', limit: '1', value: 1 },
      { text: 'تحليلات الذكاء الاصطناعي', limit: '1', value: 1, badge: 'تجريبي' },
      { text: 'إحصائيات الزوار', limit: 'غير متاح', value: 0, included: false },
      { text: 'رفع الملفات', limit: '50 ميجابايت', value: 50 }
    ],
    isPopular: false,
    buttonText: 'مجاني',
    buttonVariant: 'outline',
    color: 'from-gray-500 to-gray-600'
  },
  {
    id: 2,
    name: 'Basic',
    name_ar: 'أساسي',
    price: 29.99,
    description: 'لمدى الحياة - ترقية دائمة لحسابك',
    features: [
      { text: 'المشاريع', limit: '5', value: 5 },
      { text: 'المهارات', limit: '8', value: 8 },
      { text: 'الشهادات', limit: '5', value: 5 },
      { text: 'الخبرات', limit: '5', value: 5 },
      { text: 'المؤهلات التعليمية', limit: '5', value: 5 },
      { text: 'تحليلات الذكاء الاصطناعي', limit: '5', value: 5, badge: 'مدى الحياة' },
      { text: 'إحصائيات الزوار', limit: '✓', value: 1, included: true },
      { text: 'رفع الملفات', limit: '200 ميجابايت', value: 200 },
      { text: 'أولوية الدعم', limit: '✓', value: 1, included: true }
    ],
    isPopular: false,
    badge: 'ترقية دائمة',
    buttonText: 'اشتر الآن',
    savings: 'دفعة واحدة فقط',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 3,
    name: 'Professional',
    name_ar: 'محترف',
    price: 59.99,
    description: 'لمدى الحياة - جميع المميزات المتقدمة',
    features: [
      { text: 'المشاريع', limit: '15', value: 15 },
      { text: 'المهارات', limit: '20', value: 20 },
      { text: 'الشهادات', limit: '15', value: 15 },
      { text: 'الخبرات', limit: '15', value: 15 },
      { text: 'المؤهلات التعليمية', limit: '15', value: 15 },
      { text: 'تحليلات الذكاء الاصطناعي', limit: '15', value: 15, badge: 'مدى الحياة' },
      { text: 'إحصائيات متقدمة', limit: '✓', value: 1, included: true },
      { text: 'تقارير مفصلة', limit: '✓', value: 1, included: true },
      { text: 'رفع الملفات', limit: '500 ميجابايت', value: 500 },
      { text: 'دعم VIP', limit: '✓', value: 1, included: true }
    ],
    isPopular: true,
    badge: 'الأكثر طلباً',
    buttonText: 'اشتر الآن',
    savings: 'وفر 40%',
    color: 'from-purple-500 to-pink-500'
  },
  {
    id: 4,
    name: 'Enterprise',
    name_ar: 'مؤسسات',
    price: 99.99,
    description: 'لمدى الحياة - جميع المميزات بدون حدود',
    features: [
      { text: 'المشاريع', limit: 'غير محدود', value: -1 },
      { text: 'المهارات', limit: 'غير محدود', value: -1 },
      { text: 'الشهادات', limit: 'غير محدود', value: -1 },
      { text: 'الخبرات', limit: 'غير محدود', value: -1 },
      { text: 'المؤهلات التعليمية', limit: 'غير محدود', value: -1 },
      { text: 'تحليلات الذكاء الاصطناعي', limit: 'غير محدود', value: -1, badge: 'مدى الحياة' },
      { text: 'إحصائيات متقدمة', limit: '✓', value: 1, included: true },
      { text: 'تقارير مخصصة', limit: '✓', value: 1, included: true },
      { text: 'رفع الملفات', limit: '2 جيجابايت', value: 2048 },
      { text: 'إزالة العلامة التجارية', limit: '✓', value: 1, included: true },
      { text: 'دعم VIP مخصص', limit: '✓', value: 1, included: true }
    ],
    isPopular: false,
    badge: 'الأقوى',
    buttonText: 'اشتر الآن',
    savings: 'صفقة العمر',
    color: 'from-yellow-500 to-orange-500'
  }
];

// الحدود لكل باقة (للاستخدام في التحقق)
export const PLAN_LIMITS = {
  1: { // مجاني
    maxProjects: 1,
    maxSkills: 2,
    maxCertificates: 1,
    maxExperience: 1,
    maxEducation: 1,
    maxAiAnalyses: 1,
    storageLimit: 50, // ميجابايت
    hasAdvancedStats: false,
    hasReports: false,
    hasPrioritySupport: false,
    hasRemoveBranding: false
  },
  2: { // أساسي
    maxProjects: 5,
    maxSkills: 8,
    maxCertificates: 5,
    maxExperience: 5,
    maxEducation: 5,
    maxAiAnalyses: 5,
    storageLimit: 200,
    hasAdvancedStats: true,
    hasReports: false,
    hasPrioritySupport: true,
    hasRemoveBranding: false
  },
  3: { // محترف
    maxProjects: 15,
    maxSkills: 20,
    maxCertificates: 15,
    maxExperience: 15,
    maxEducation: 15,
    maxAiAnalyses: 15,
    storageLimit: 500,
    hasAdvancedStats: true,
    hasReports: true,
    hasPrioritySupport: true,
    hasRemoveBranding: false
  },
  4: { // مؤسسات
    maxProjects: -1, // غير محدود
    maxSkills: -1,
    maxCertificates: -1,
    maxExperience: -1,
    maxEducation: -1,
    maxAiAnalyses: -1,
    storageLimit: 2048,
    hasAdvancedStats: true,
    hasReports: true,
    hasPrioritySupport: true,
    hasRemoveBranding: true
  }
};  UPDATE_SUCCESS: 'تم التحديث بنجاح',
  UPDATE_ERROR: 'حدث خطأ أثناء التحديث',
  DELETE_SUCCESS: 'تم الحذف بنجاح',
  DELETE_ERROR: 'حدث خطأ أثناء الحذف',
  UPLOAD_SUCCESS: 'تم رفع الملف بنجاح',
  UPLOAD_ERROR: 'حدث خطأ أثناء رفع الملف',
  LIMIT_REACHED: 'لقد وصلت للحد الأقصى المسموح به'
}
