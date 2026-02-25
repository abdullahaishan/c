import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { developerService } from '../lib/supabase';
import Home from './Home';
import AboutPage from './About';
import Portofolio from './Portofolio';
import ContactPage from './Contact';
import { Loader, AlertCircle, User } from 'lucide-react';

const PublicPortfolio = () => {
  const { username } = useParams();
  const [developer, setDeveloper] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDeveloperData();
    
    // تسجيل الزيارة إذا وجد المطور
    if (developer?.id) {
      trackVisit();
    }
  }, [username]);

  const fetchDeveloperData = async () => {
    setLoading(true);
    try {
      // جلب بيانات المطور مع جميع العلاقات
      const data = await developerService.getByUsername(username);
      
      if (!data) {
        setError('المطور غير موجود');
      } else {
        setDeveloper(data);
      }
    } catch (err) {
      console.error('Error fetching developer:', err);
      setError('فشل في تحميل البورتفليو');
    } finally {
      setLoading(false);
    }
  };

  const trackVisit = async () => {
    // تسجيل الزيارة (اختياري - يمكن إضافته لاحقاً)
    console.log('New visit to:', username);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030014] flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-[#6366f1] animate-spin mx-auto mb-4" />
          <p className="text-gray-400">جاري تحميل البورتفليو...</p>
        </div>
      </div>
    );
  }

  if (error || !developer) {
    return (
      <div className="min-h-screen bg-[#030014] flex items-center justify-center px-4">
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 max-w-md w-full text-center border border-white/10">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-10 h-10 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            {error || 'المطور غير موجود'}
          </h1>
          <p className="text-gray-400 mb-6">
            عذراً، لم نتمكن من العثور على بورتفليو لهذا المستخدم
          </p>
          <a
            href="/"
            className="inline-block px-6 py-3 bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white rounded-xl hover:scale-105 transition-all"
          >
            العودة للصفحة الرئيسية
          </a>
        </div>
      </div>
    );
  }

  // ✅ تمرير بيانات المطور إلى جميع الصفحات عبر props
  return (
    <div className="bg-[#030014] min-h-screen">
      {/* شريط تعريف بالمطور (اختياري) */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-md border-b border-white/10 py-2 px-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {developer.profile_image ? (
              <img
                src={developer.profile_image}
                alt={developer.full_name}
                className="w-8 h-8 rounded-full object-cover border border-white/20"
              />
            ) : (
              <div className="w-8 h-8 bg-gradient-to-r from-[#6366f1] to-[#a855f7] rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
            )}
            <span className="text-white text-sm font-medium">
              {developer.full_name || developer.username}
            </span>
          </div>
          <a
            href="/"
            className="text-xs text-gray-400 hover:text-white transition-colors"
          >
            PortfolioAI
          </a>
        </div>
      </div>

      {/* تمرير البيانات إلى المكونات */}
      <Home developer={developer} />
      <AboutPage developer={developer} />
      <Portofolio developer={developer} />
      <ContactPage developer={developer} />
    </div>
  );
};

export default PublicPortfolio;
