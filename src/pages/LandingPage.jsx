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
  Linkedin 
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
    <div className="min-h-screen bg-gradient-to-b from-[#030014] via-[#0a0a1f] to-[#030014]">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
          <div className="absolute top-0 -right-4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
          <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
        </div>

        {/* Navbar */}
        <nav className="relative z-10 flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-r from-[#6366f1] to-[#a855f7] rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">P</span>
            </div>
            <span className="text-2xl font-bold text-white">Portfolio<span className="text-[#a855f7]">AI</span></span>
          </div>
          
          <div className="flex items-center gap-4">
            <Link 
              to="/login" 
              className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
            >
              تسجيل الدخول
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white rounded-lg hover:scale-105 transition-transform"
            >
              ابدأ مجاناً
            </Link>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 max-w-6xl mx-auto px-6 py-20">
          <div className="text-center">
            <div className="inline-block mb-6" data-aos="fade-down">
              <span className="px-4 py-2 bg-white/5 backdrop-blur-sm rounded-full text-sm text-[#a855f7] border border-white/10">
                ✨ منصة المطورين المتكاملة
              </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6" data-aos="fade-up" data-aos-delay="200">
              أنشئ بورتفليو احترافي
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6366f1] to-[#a855f7]">
                باستخدام الذكاء الاصطناعي
              </span>
            </h1>
            
            <p className="text-xl text-gray-400 mb-10 max-w-3xl mx-auto" data-aos="fade-up" data-aos-delay="400">
              ارفع سيرتك الذاتية ودع AI يحولها إلى موقع بورتفليو متكامل في ثواني. 
              اختر من بين عشرات القوالب الاحترافية وخصصها كما تريد.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12" data-aos="fade-up" data-aos-delay="600">
              <Link
                to="/register"
                className="group px-8 py-4 bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white rounded-xl font-semibold text-lg hover:scale-105 transition-transform flex items-center justify-center gap-2"
              >
                ابدأ الآن مجاناً
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link
                to="/u/eki"
                className="px-8 py-4 bg-white/5 backdrop-blur-sm border border-white/20 text-white rounded-xl font-semibold text-lg hover:bg-white/10 transition-all"
              >
                شاهد مثالاً حياً
              </Link>
            </div>

            <div className="flex items-center justify-center gap-8 text-gray-400" data-aos="fade-up" data-aos-delay="800">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                <span>تحليل فوري</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-500" />
                <span>خصوصية كاملة</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-500" />
                <span>نطاق مخصص</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4" data-aos="fade-up">
            لماذا <span className="text-[#a855f7]">PortfolioAI</span>؟
          </h2>
          <p className="text-xl text-gray-400" data-aos="fade-up" data-aos-delay="200">
            كل ما تحتاجه لبناء هويتك المهنية في مكان واحد
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-[#a855f7]/50 transition-all hover:scale-105 hover:shadow-xl"
              data-aos="fade-up"
              data-aos-delay={300 * (index + 1)}
            >
              <div className="w-14 h-14 bg-gradient-to-r from-[#6366f1] to-[#a855f7] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
              <p className="text-gray-400 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="text-center"
              data-aos="fade-up"
              data-aos-delay={200 * (index + 1)}
            >
              <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#6366f1] to-[#a855f7] mb-2">
                {stat.value}
              </div>
              <div className="text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-4xl mx-auto px-6 py-20">
        <div
          className="bg-gradient-to-r from-[#6366f1]/20 to-[#a855f7]/20 rounded-3xl p-12 text-center border border-white/10"
          data-aos="zoom-in"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            ابدأ رحلتك الاحترافية اليوم
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            انضم إلى آلاف المطورين الذين يبنون هويتهم المهنية معنا
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white rounded-xl font-semibold text-lg hover:scale-105 transition-transform"
          >
            أنشئ حسابك مجاناً
            <Rocket className="w-5 h-5" />
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <div className="w-8 h-8 bg-gradient-to-r from-[#6366f1] to-[#a855f7] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">P</span>
            </div>
            <span className="text-white">PortfolioAI © 2025</span>
          </div>
          
          <div className="flex gap-6">
            <a href="#" className="text-gray-400 hover:text-white transition-colors">الخصوصية</a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">الشروط</a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">اتصل بنا</a>
          </div>

          <div className="flex gap-4 mt-4 md:mt-0">
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <Github className="w-5 h-5" />
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <Twitter className="w-5 h-5" />
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <Linkedin className="w-5 h-5" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}

// بيانات المميزات
const features = [
  {
    icon: <Zap className="w-7 h-7 text-white" />,
    title: 'سرعة فائقة',
    description: 'حول سيرتك الذاتية إلى موقع كامل في أقل من دقيقة باستخدام أحدث تقنيات الذكاء الاصطناعي'
  },
  {
    icon: <Sparkles className="w-7 h-7 text-white" />,
    title: 'تحليل ذكي',
    description: 'نظام AI متطور يستخرج كل تفاصيل خبراتك ومهاراتك ومشاريعك من سيرتك الذاتية بدقة عالية'
  },
  {
    icon: <Shield className="w-7 h-7 text-white" />,
    title: 'خصوصية وأمان',
    description: 'بياناتك مشفرة وآمنة - أنت من تتحكم في نشر معلوماتك ومشاركتها مع الآخرين'
  },
  {
    icon: <Globe className="w-7 h-7 text-white" />,
    title: 'نطاق مخصص',
    description: 'اربط نطاقك الخاص أو استخدم نطاقنا الفرعي مجاناً مع دعم كامل لشهادات SSL'
  },
  {
    icon: <Users className="w-7 h-7 text-white" />,
    title: 'مجتمع نشط',
    description: 'انضم إلى آلاف المطورين والمبدعين الذين يبنون هويتهم المهنية على منصتنا'
  },
  {
    icon: <Rocket className="w-7 h-7 text-white" />,
    title: 'تحديثات مستمرة',
    description: 'نضيف باستمرار ميزات وقوالب جديدة لتواكب أحدث صيحات التصميم والتقنية'
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
