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
import { Loader, AlertCircle } from 'lucide-react';

const PublicPortfolio = () => {
  const { username } = useParams();
  const [developer, setDeveloper] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDeveloper();
  }, [username]);

  const loadDeveloper = async () => {
    try {
      setLoading(true);
      console.log('📥 جلب بيانات:', username);
      const data = await developerService.getByUsername(username);
      
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

  // صفحة التحميل
  if (loading) {
    return (
      <div className="min-h-screen bg-[#030014] flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-[#a855f7] animate-spin mx-auto mb-4" />
          <p className="text-gray-400">جاري تحميل البورتفليو...</p>
        </div>
      </div>
    );
  }

  // صفحة الخطأ
  if (error || !developer) {
    return (
      <div className="min-h-screen bg-[#030014] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl text-white mb-2">المطور غير موجود</h2>
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  // صفحة النجاح
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
