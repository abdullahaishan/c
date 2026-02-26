import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { developerService } from '../lib/supabase';
import Home from './Home';
import AboutPage from './About';
import Portfolio from './Portfolio';
import ContactPage from './Contact';
import WhyMe from './WhyMe';
import AnimatedBackground from '../components/AnimatedBackground';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Loader, AlertCircle, User } from 'lucide-react';

const PublicPortfolio = () => {
  const { username } = useParams();
  const [developer, setDeveloper] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDeveloperData();
  }, [username]);

  const fetchDeveloperData = async () => {
    setLoading(true);
    try {
      const data = await developerService.getByUsername(username);
      
      if (!data) {
        setError('المطور غير موجود');
      } else {
        setDeveloper(data);
        // تسجيل الزيارة
        await developerService.trackVisit(data.id, {
          visitor_ip: 'visitor_ip',
          visitor_country: 'country',
          // يمكن إضافة المزيد من البيانات لاحقاً
        });
      }
    } catch (err) {
      console.error('Error fetching developer:', err);
      setError('فشل في تحميل البورتفليو');
    } finally {
      setLoading(false);
    }
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

  return (
    <>
      {/* الخلفية المتحركة - في جميع الصفحات */}
      <AnimatedBackground />
      
      {/* شريط التنقل */}
      <Navbar />
      
      {/* المحتوى الرئيسي مع z-index أعلى من الخلفية */}
      <main className="relative z-10">
        <Home developer={developer} />
        <AboutPage developer={developer} />
        <Portfolio developer={developer} />
        <WhyMe developer={developer} />
        <ContactPage developer={developer} />
      </main>
      
      {/* الفوتر */}
      <Footer developer={developer} />
    </>
  );
};

export default PublicPortfolio;
