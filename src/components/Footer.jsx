import React from 'react';
import { Heart, Mail, Phone, MapPin, Globe, Github, Linkedin, Twitter, Instagram, ChevronUp } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useDeveloper } from '../context/DeveloperContext';

const Footer = () => {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();
  const { isFreePlan, getAdminSocialLinks, publicDeveloper } = useDeveloper();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAdminClick = () => {
    navigate('/u/abdullah_aishan');
  };

  // روابط التواصل (للأدمن في الباقة المجانية)
  const adminLinks = getAdminSocialLinks();

  return (
    <footer className="bg-gradient-to-t from-[#030014] to-transparent border-t border-white/10 pt-16 pb-8 px-[5%] relative">
      {/* زر العودة للأعلى */}
      <button
        onClick={scrollToTop}
        className="absolute -top-5 left-1/2 transform -translate-x-1/2 w-10 h-10 bg-gradient-to-r from-[#6366f1] to-[#a855f7] rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-all duration-300 shadow-lg"
      >
        <ChevronUp className="w-5 h-5 text-white" />
      </button>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* About Platform */}
        <div className="col-span-1 md:col-span-1">
          <div 
            onClick={handleAdminClick}
            className="text-2xl font-bold bg-gradient-to-r from-[#6366f1] to-[#a855f7] bg-clip-text text-transparent mb-4 cursor-pointer hover:scale-105 transition-transform"
          >
            Portfolio<span className="text-white">-v5</span>
          </div>
          <p className="text-gray-400 text-sm leading-relaxed">
            منصة احترافية لإنشاء وعرض البورتفوليو الشخصي للمطورين. 
            ابدأ رحلتك الآن واعرض أعمالك للعالم.
          </p>
          
          {/* إحصائيات الموقع */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="bg-white/5 rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-[#a855f7]">6+</div>
              <div className="text-xs text-gray-400">مطور نشط</div>
            </div>
            <div className="bg-white/5 rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-[#a855f7]">3+</div>
              <div className="text-xs text-gray-400">مشروع منشور</div>
            </div>
            <div className="bg-white/5 rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-[#a855f7]">10K+</div>
              <div className="text-xs text-gray-400">زيارة شهرية</div>
            </div>
            <div className="bg-white/5 rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-[#a855f7]">5</div>
              <div className="text-xs text-gray-400">باقات متنوعة</div>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-white font-semibold mb-4 text-lg">روابط سريعة</h4>
          <ul className="space-y-3">
            <li>
              <Link to="/" className="text-gray-400 hover:text-[#a855f7] transition-colors flex items-center gap-2">
                <span className="w-1 h-1 bg-[#6366f1] rounded-full"></span>
                الرئيسية
              </Link>
            </li>
            <li>
              <Link to="/developers" className="text-gray-400 hover:text-[#a855f7] transition-colors flex items-center gap-2">
                <span className="w-1 h-1 bg-[#6366f1] rounded-full"></span>
                المطورين
              </Link>
            </li>
            <li>
              <Link to="/plans" className="text-gray-400 hover:text-[#a855f7] transition-colors flex items-center gap-2">
                <span className="w-1 h-1 bg-[#6366f1] rounded-full"></span>
                الباقات
              </Link>
            </li>
            <li>
              <Link to="/about" className="text-gray-400 hover:text-[#a855f7] transition-colors flex items-center gap-2">
                <span className="w-1 h-1 bg-[#6366f1] rounded-full"></span>
                عن المنصة
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h4 className="text-white font-semibold mb-4 text-lg">معلومات الاتصال</h4>
          <ul className="space-y-4">
            <li className="flex items-start gap-3 text-gray-400">
              <MapPin className="w-5 h-5 text-[#a855f7] flex-shrink-0 mt-0.5" />
              <span>صنعاء، اليمن</span>
            </li>
            <li className="flex items-center gap-3 text-gray-400">
              <Mail className="w-5 h-5 text-[#a855f7] flex-shrink-0" />
              <a href="mailto:eng.abdullah.z.aishan@gmail.com" className="hover:text-[#a855f7] transition-colors">
                eng.abdullah.z.aishan@gmail.com
              </a>
            </li>
            <li className="flex items-center gap-3 text-gray-400">
              <Phone className="w-5 h-5 text-[#a855f7] flex-shrink-0" />
              <a href="tel:+967771315459" className="hover:text-[#a855f7] transition-colors">
                +967-771-315-459
              </a>
            </li>
          </ul>

          {/* Social Links - تظهر دائماً روابط الأدمن في الباقة المجانية */}
          <div className="mt-6 flex gap-3">
            <a href={adminLinks.github} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center hover:bg-[#6366f1] transition-colors">
              <Github className="w-5 h-5 text-gray-400" />
            </a>
            <a href={adminLinks.linkedin} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center hover:bg-[#a855f7] transition-colors">
              <Linkedin className="w-5 h-5 text-gray-400" />
            </a>
            <a href={adminLinks.instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center hover:bg-pink-600 transition-colors">
              <Instagram className="w-5 h-5 text-gray-400" />
            </a>
            <a href={adminLinks.twitter} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center hover:bg-blue-400 transition-colors">
              <Twitter className="w-5 h-5 text-gray-400" />
            </a>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-br from-[#6366f1]/10 to-[#a855f7]/10 rounded-2xl p-6 border border-white/10">
          <h4 className="text-white font-semibold mb-2">هل أنت مطور؟</h4>
          <p className="text-gray-400 text-sm mb-4">
            احصل على بورتفوليو شخصي الآن واعرض أعمالك
          </p>
          <Link
            to="/register"
            className="block w-full text-center px-4 py-3 bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white rounded-xl font-semibold hover:scale-105 transition-all duration-300"
          >
            ابدأ الآن مجاناً
          </Link>
        </div>
      </div>

      {/* Copyright and Admin */}
      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-white/10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-400 text-sm flex items-center gap-1">
            © {currentYear} جميع الحقوق محفوظة لـ 
            <span 
              onClick={handleAdminClick}
              className="text-[#a855f7] hover:text-[#6366f1] cursor-pointer font-medium mx-1"
            >
              Abdullah Zabin Ali Aishan
            </span>
            <Heart className="w-4 h-4 text-red-400 mx-1" />
          </p>
          <div className="flex items-center gap-4">
            <Link to="/privacy" className="text-xs text-gray-500 hover:text-gray-400">سياسة الخصوصية</Link>
            <Link to="/terms" className="text-xs text-gray-500 hover:text-gray-400">شروط الاستخدام</Link>
            <Link to="/admin" className="text-xs text-gray-500 hover:text-[#a855f7]">Admin</Link>
          </div>
        </div>
        
        {/* إشعار الباقة المجانية */}
        {isFreePlan && (
          <div className="mt-4 text-center">
            <p className="text-xs text-yellow-500/70">
              أنت تستخدم الباقة المجانية - يتم عرض روابط التواصل الخاصة بالأدمن
            </p>
          </div>
        )}
      </div>
    </footer>
  );
};

export default Footer;
