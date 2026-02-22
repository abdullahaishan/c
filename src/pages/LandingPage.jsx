import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Zap, Shield, Globe, ArrowRight, Github, Linkedin, Twitter } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[#030014]">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
          <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
        </div>

        <nav className="relative z-10 flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-purple-500" />
            <span className="text-2xl font-bold text-white">Portfolio<span className="text-purple-500">AI</span></span>
          </div>
          
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-gray-300 hover:text-white transition-colors">
              تسجيل الدخول
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:scale-105 transition-transform"
            >
              ابدأ مجاناً
            </Link>
          </div>
        </nav>

        <div className="relative z-10 max-w-6xl mx-auto px-6 py-20">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              أنشئ بورتفليو احترافي
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                باستخدام الذكاء الاصطناعي
              </span>
            </h1>
            
            <p className="text-xl text-gray-400 mb-10 max-w-3xl mx-auto">
              ارفع سيرتك الذاتية ودع AI يحولها إلى موقع بورتفليو متكامل في ثواني. 
              اختر من بين عشرات القوالب الاحترافية وخصصها كما تريد.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link
                to="/register"
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold text-lg hover:scale-105 transition-transform flex items-center justify-center gap-2"
              >
                ابدأ الآن مجاناً
                <ArrowRight className="w-5 h-5" />
              </Link>
              
              <button className="px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-xl font-semibold text-lg hover:bg-white/20 transition-all">
                شاهد العروض
              </button>
            </div>

            <div className="flex items-center justify-center gap-8 text-gray-400">
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
        <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">
          لماذا تختار <span className="text-purple-500">PortfolioAI</span>؟
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:scale-105 transition-all">
              <div className="w-14 h-14 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center mb-6">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <Sparkles className="w-6 h-6 text-purple-500" />
            <span className="text-white">PortfolioAI © 2024</span>
          </div>
          
          <div className="flex gap-6">
            <a href="#" className="text-gray-400 hover:text-white transition-colors">الخصوصية</a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">الشروط</a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">اتصل بنا</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

const features = [
  {
    icon: <Zap className="w-7 h-7 text-white" />,
    title: 'سرعة فائقة',
    description: 'حول سيرتك الذاتية إلى موقع كامل في أقل من دقيقة'
  },
  {
    icon: <Sparkles className="w-7 h-7 text-white" />,
    title: 'ذكاء اصطناعي متطور',
    description: 'تحليل دقيق باستخدام أحدث تقنيات AI لاستخراج كل التفاصيل'
  },
  {
    icon: <Shield className="w-7 h-7 text-white" />,
    title: 'خصوصية وأمان',
    description: 'بياناتك مشفرة وآمنة - أنت من تتحكم في نشر معلوماتك'
  },
  {
    icon: <Globe className="w-7 h-7 text-white" />,
    title: 'نطاق مخصص',
    description: 'اربط نطاقك الخاص أو استخدم نطاقنا الفرعي مجاناً'
  },
  {
    icon: <Github className="w-7 h-7 text-white" />,
    title: 'تكامل مع GitHub',
    description: 'اعرض مشاريعك مباشرة من GitHub تلقائياً'
  },
  {
    icon: <Linkedin className="w-7 h-7 text-white" />,
    title: 'ربط مع LinkedIn',
    description: 'استورد خبراتك ومهاراتك من LinkedIn بنقرة واحدة'
  }
];

export default LandingPage;