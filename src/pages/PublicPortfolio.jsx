import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
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

  const handleLoadComplete = (results) => {
    console.log('✅ جميع البيانات:', results);
    setDeveloper(results.developers);
    setLoading(false);
  };

  const handleLoadError = (err) => {
    setError(err);
    setLoading(false);
  };

  if (loading) {
    return (
      <LoadingPortfolio 
        username={username}
        onComplete={handleLoadComplete}
        onError={handleLoadError}
      />
    );
  }

  if (error || !developer) {
    return (
      <div className="min-h-screen bg-[#030014] flex items-center justify-center p-4">
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 max-w-md w-full text-center border border-white/10">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">خطأ في التحميل</h2>
          <p className="text-gray-400 mb-6">{error || 'المطور غير موجود'}</p>
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
