import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { developerService } from '../lib/supabase';
import Home from './Home';
import AboutPage from './About';
import Skills from './Skills';
import Portfolio from './Portfolio';
import WhyMe from './WhyMe';
import AnimatedBackground from '../components/AnimatedBackground';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import LoadingPortfolio from '../components/LoadingPortfolio';
import { AlertCircle, RefreshCw, Home as HomeIcon } from 'lucide-react';

const PublicPortfolio = () => {
  const { username } = useParams();
  const [developer, setDeveloper] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const [loadStartTime] = useState(Date.now());

  const fetchDeveloperData = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      console.log(`📥 محاولة جلب البيانات (${retryCount + 1}):`, username);
      
      // ✅ استخدام Promise.race مع timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('timeout')), 8000);
      });

      const fetchPromise = developerService.getByUsername(username);

      const data = await Promise.race([fetchPromise, timeoutPromise]);

      if (!data) {
        setError('المطور غير موجود');
      } else {
        console.log('✅ تم جلب البيانات بنجاح:', data);
        setDeveloper(data);
        
        // تسجيل الزيارة في الخلفية
        developerService.trackVisit(data.id, {
          visited_at: new Date().toISOString()
        }).catch(() => {});
      }
    } catch (err) {
      console.error('❌ خطأ في جلب البيانات:', err);
      
      if (err.message === 'timeout') {
        setError('تأخر في الاستجابة. يرجى التحقق من اتصالك بالإنترنت.');
      } else {
        setError('فشل في تحميل البورتفليو');
      }
    } finally {
      setLoading(false);
    }
  }, [username, retryCount]);

  useEffect(() => {
    fetchDeveloperData();
  }, [fetchDeveloperData]);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  const handleForceReload = () => {
    window.location.reload();
  };

  // ✅ صفحة التحميل
  if (loading) {
    return (
      <LoadingPortfolio 
        username={username} 
        timeout={8000}
        onRetry={handleRetry}
      />
    );
  }

  // ✅ صفحة الخطأ
  if (error || !developer) {
    return (
      <div className="fixed inset-0 bg-[#030014] flex items-center justify-center p-4">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 -left-4 w-96 h-96 bg-red-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10" />
        </div>

        <div className="relative z-10 bg-white/5 backdrop-blur-xl rounded-2xl p-8 max-w-md w-full text-center border border-white/10">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-10 h-10 text-red-400" />
          </div>

          <h2 className="text-2xl font-bold text-white mb-2">
            عذراً! حدث خطأ
          </h2>
          
          <p className="text-gray-400 mb-6">
            {error || 'لم نتمكن من تحميل البورتفليو'}
          </p>

          <div className="space-y-3">
            <button
              onClick={handleRetry}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white rounded-xl font-semibold hover:scale-105 transition-all"
            >
              <RefreshCw className="w-5 h-5" />
              إعادة المحاولة
            </button>

            <button
              onClick={handleForceReload}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-white/5 text-white rounded-xl font-semibold hover:bg-white/10 transition-all border border-white/10"
            >
              <RefreshCw className="w-5 h-5" />
              تحديث الصفحة
            </button>

            <a
              href="/"
              className="w-full flex items-center justify-center gap-2 px-6 py-3 text-gray-400 hover:text-white transition-all"
            >
              <HomeIcon className="w-5 h-5" />
              العودة للرئيسية
            </a>
          </div>

          {/* وقت التحميل للتشخيص */}
          <p className="text-xs text-gray-600 mt-6">
            استغرق التحميل: {((Date.now() - loadStartTime) / 1000).toFixed(1)} ثانية
          </p>
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
      </main>
      <Footer />
    </>
  );
};

export default PublicPortfolio;
