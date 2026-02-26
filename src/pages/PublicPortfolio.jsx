import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { developerService } from '../lib/supabase';
import Home from './Home';
import AboutPage from './About';
import Skills from './Skills';
import Portfolio from './Portfolio';
import WhyMe from './WhyMe';
import ContactPage from './Contact';
import AnimatedBackground from '../components/AnimatedBackground';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import LoadingPortfolio from '../components/LoadingPortfolio';
import { AlertCircle } from 'lucide-react';

const PublicPortfolio = () => {
  const { username } = useParams();
  const [developer, setDeveloper] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    
    const loadData = async () => {
      try {
        console.log('📥 جلب بيانات:', username);
        const data = await developerService.getByUsername(username);
        
        if (!mounted) return;
        
        if (!data) {
          setError('المطور غير موجود');
        } else {
          console.log('✅ تم التحميل:', data);
          setDeveloper(data);
        }
      } catch (err) {
        console.error('❌ خطأ:', err);
        setError('فشل في تحميل البورتفليو');
      } finally {
        setLoading(false);
      }
    };

    loadData();

    return () => { mounted = false; };
  }, [username]);

  // ✅ صفحة التحميل الاحترافية
  if (loading) {
    return <LoadingPortfolio username={username} />;
  }

  // ✅ صفحة الخطأ
  if (error || !developer) {
    return (
      <div className="min-h-screen bg-[#030014] flex items-center justify-center p-4">
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 max-w-md w-full text-center border border-white/10">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-10 h-10 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">المطور غير موجود</h2>
          <p className="text-gray-400 mb-6">{error || 'لا يوجد مطور بهذا الاسم'}</p>
          <a
            href="/"
            className="inline-block px-6 py-3 bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white rounded-lg hover:scale-105 transition-all"
          >
            العودة للرئيسية
          </a>
        </div>
      </div>
    );
  }

  // ✅ صفحة النجاح
  return (
    <>
      <AnimatedBackground />
      <Navbar />
      <main className="relative z-10">
        <Home developer={developer} />
        <AboutPage developer={developer} />
        <Skills developer={developer} />
        <Portfolio developer={developer} />
        {developer?.plan_id === 1 && <WhyMe developer={developer} />}
        <ContactPage developer={developer} />
      </main>
      <Footer />
    </>
  );
};

export default PublicPortfolio;
