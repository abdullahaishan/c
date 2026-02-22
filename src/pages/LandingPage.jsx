import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Sparkles, 
  Zap, 
  Shield, 
  Globe, 
  Users, 
  Rocket, 
  ArrowRight,
  Github,
  Twitter,
  Linkedin,
  FileText,
  Code,
  Award
} from 'lucide-react'
import AOS from 'aos'
import 'aos/dist/aos.css'

const LandingPage = () => {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      easing: 'ease-out-cubic'
    })
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#030014] via-[#0a0a1f] to-[#030014] overflow-hidden">
      {/* Hero Section with Animated Background */}
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated blobs */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
          <div className="absolute top-40 right-10 w-72 h-72 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
          <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-pink-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-block mb-6 sm:mb-8" data-aos="fade-down">
              <span className="px-3 sm:px-4 py-2 bg-white/5 backdrop-blur-sm rounded-full text-xs sm:text-sm text-[#a855f7] border border-white/10">
                ✨ منصة المطورين الذكية
              </span>
            </div>
            
            {/* Main Title */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 sm:mb-6 px-4" data-aos="fade-up" data-aos-delay="200">
              <span className="block">أنشئ بورتفليو احترافي</span>
              <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-[#6366f1] to-[#a855f7]">
                في دقائق معدودة
              </span>
            </h1>
            
            {/* Description */}
            <p className="text-base sm:text-lg md:text-xl text-gray-400 mb-8 sm:mb-10 max-w-3xl mx-auto px-4 leading-relaxed" data-aos="fade-up" data-aos-delay="400">
              <span className="block mb-2">ارفع سيرتك الذاتية ودع الذكاء الاصطناعي يحللها ويبني لك</span>
              <span className="block">موقع بورتفليو متكامل يعرض خبراتك ومشاريعك بأجمل تصميم</span>
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center px-4 mb-12 sm:mb-16" data-aos="fade-up" data-aos-delay="600">
              <Link
                to="/register"
                className="group w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white rounded-xl font-semibold text-base sm:text-lg hover:scale-105 transition-transform flex items-center justify-center gap-2"
              >
                <span>ابدأ مجاناً</span>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link
                to="/u/eki"
                className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-white/5 backdrop-blur-sm border border-white/20 text-white rounded-xl font-semibold text-base sm:text-lg hover:bg-white/10 transition-all"
              >
                شاهد مثالاً حياً
              </Link>
            </div>

            {/* Features Pills */}
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm text-gray-400 px-4" data-aos="fade-up" data-aos-delay="800">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
                <span>تحليل فوري</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                <span>خصوصية كاملة</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                <span>نطاق مخصص</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4" data-aos="fade-up">
            كيف <span className="text-[#a855f7]">يعمل</span>؟
          </h2>
          <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto" data-aos="fade-up" data-aos-delay="200">
            ثلاث خطوات بسيطة تفصلك عن بورتفليو احترافي
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 sm:gap-10">
          {/* Step 1 */}
          <div className="text-center" data-aos="fade-up" data-aos-delay="300">
            <div className="relative mb-6 inline-block">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-r from-[#6366f1] to-[#a855f7] rounded-2xl flex items-center justify-center mx-auto">
                <FileText className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 sm:w-8 sm:h-8 bg-white rounded-full flex items-center justify-center text-[#6366f1] font-bold text-sm sm:text-base">
                1
              </div>
            </div>
            <h3 className="text-xl sm:text-2xl font-semibold text-white mb-3">ارفع سيرتك</h3>
            <p className="text-sm sm:text-base text-gray-400 leading-relaxed px-4">
              ارفع ملف PDF أو DOCX يحتوي على سيرتك الذاتية
            </p>
          </div>

          {/* Step 2 */}
          <div className="text-center" data-aos="fade-up" data-aos-delay="400">
            <div className="relative mb-6 inline-block">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-r from-[#6366f1] to-[#a855f7] rounded-2xl flex items-center justify-center mx-auto">
                <Sparkles className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 sm:w-8 sm:h-8 bg-white rounded-full flex items-center justify-center text-[#6366f1] font-bold text-sm sm:text-base">
                2
              </div>
            </div>
            <h3 className="text-xl sm:text-2xl font-semibold text-white mb-3">AI يحلل البيانات</h3>
            <p className="text-sm sm:text-base text-gray-400 leading-relaxed px-4">
              الذكاء الاصطناعي يستخرج كل مهاراتك وخبراتك ومشاريعك بدقة
            </p>
          </div>

          {/* Step 3 */}
          <div className="text-center" data-aos="fade-up" data-aos-delay="500">
            <div className="relative mb-6 inline-block">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-r from-[#6366f1] to-[#a855f7] rounded-2xl flex items-center justify-center mx-auto">
                <Globe className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 sm:w-8 sm:h-8 bg-white rounded-full flex items-center justify-center text-[#6366f1] font-bold text-sm sm:text-base">
                3
              </div>
            </div>
            <h3 className="text-xl sm:text-2xl font-semibold text-white mb-3">انشر موقعك</h3>
            <p className="text-sm sm:text-base text-gray-400 leading-relaxed px-4">
              احصل على رابط خاص بك وشاركه مع العالم
            </p>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4" data-aos="fade-up">
            لماذا <span className="text-[#a855f7]">PortfolioAI</span>؟
          </h2>
          <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto" data-aos="fade-up" data-aos-delay="200">
            كل ما تحتاجه لبناء هويتك المهنية في مكان واحد
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group bg-white/5 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-white/10 hover:border-[#a855f7]/50 transition-all hover:scale-105 hover:shadow-xl"
              data-aos="fade-up"
              data-aos-delay={150 * (index + 1)}
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-[#6366f1] to-[#a855f7] rounded-xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 sm:mb-3">{feature.title}</h3>
              <p className="text-sm sm:text-base text-gray-400 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="text-center"
              data-aos="fade-up"
              data-aos-delay={150 * (index + 1)}
            >
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#6366f1] to-[#a855f7] mb-1 sm:mb-2">
                {stat.value}
              </div>
              <div className="text-xs sm:text-sm text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div
          className="bg-gradient-to-r from-[#6366f1]/20 to-[#a855f7]/20 rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center border border-white/10"
          data-aos="zoom-in"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4">
            ابدأ رحلتك الاحترافية اليوم
          </h2>
          <p className="text-base sm:text-lg text-gray-400 mb-6 sm:mb-8 max-w-2xl mx-auto">
            انضم إلى آلاف المطورين والمبدعين الذين يبنون هويتهم المهنية معنا
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white rounded-xl font-semibold text-base sm:text-lg hover:scale-105 transition-transform"
          >
            <span>أنشئ حسابك مجاناً</span>
            <Rocket className="w-4 h-4 sm:w-5 sm:h-5" />
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-[#6366f1] to-[#a855f7] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">P</span>
              </div>
              <span className="text-sm sm:text-base text-white">PortfolioAI © 2025</span>
            </div>
            
            <div className="flex gap-4 sm:gap-6">
              <a href="#" className="text-xs sm:text-sm text-gray-400 hover:text-white transition-colors">الخصوصية</a>
              <a href="#" className="text-xs sm:text-sm text-gray-400 hover:text-white transition-colors">الشروط</a>
              <a href="#" className="text-xs sm:text-sm text-gray-400 hover:text-white transition-colors">اتصل بنا</a>
            </div>

            <div className="flex gap-3 sm:gap-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Github className="w-4 h-4 sm:w-5 sm:h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="w-4 h-4 sm:w-5 sm:h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Linkedin className="w-4 h-4 sm:w-5 sm:h-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

// بيانات المميزات
const features = [
  {
    icon: <Zap className="w-6 h-6 sm:w-7 sm:h-7 text-white" />,
    title: 'سرعة فائقة',
    description: 'حول سيرتك الذاتية إلى موقع كامل في أقل من دقيقة'
  },
  {
    icon: <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 text-white" />,
    title: 'تحليل ذكي',
    description: 'AI متطور يستخرج كل تفاصيل خبراتك ومهاراتك بدقة'
  },
  {
    icon: <Shield className="w-6 h-6 sm:w-7 sm:h-7 text-white" />,
    title: 'خصوصية وأمان',
    description: 'بياناتك مشفرة وآمنة - أنت من تتحكم في نشرها'
  },
  {
    icon: <Globe className="w-6 h-6 sm:w-7 sm:h-7 text-white" />,
    title: 'نطاق مخصص',
    description: 'اربط نطاقك الخاص أو استخدم نطاقنا الفرعي مجاناً'
  },
  {
    icon: <Users className="w-6 h-6 sm:w-7 sm:h-7 text-white" />,
    title: 'مجتمع نشط',
    description: 'انضم لآلاف المطورين الذين يبنون هويتهم المهنية'
  },
  {
    icon: <Rocket className="w-6 h-6 sm:w-7 sm:h-7 text-white" />,
    title: 'تحديثات مستمرة',
    description: 'نضيف باستمرار ميزات وقوالب جديدة'
  }
]

// إحصائيات
const stats = [
  { value: '10K+', label: 'مستخدم نشط' },
  { value: '15K+', label: 'بورتفليو منشور' },
  { value: '50+', label: 'قالب احترافي' },
  { value: '95%', label: 'رضا العملاء' }
]

export default LandingPage
