import React from 'react';
import { useDeveloper } from '../context/DeveloperContext';
import Home from './Home';
import About from './About';
import Skills from './Skills';
import Portfolio from './Portfolio';
import WhyMe from './WhyMe';
import ExperiencePage from './ExperiencePage';
import EducationPage from './EducationPage';
import AnimatedBackground from '../components/AnimatedBackground';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Loader, AlertCircle, Crown, Eye, Heart } from 'lucide-react';  // ✅ تم التعديل هنا

const PublicPortfolio = () => {
  const {
    developer,
    publicLoading,
    publicError,
    isPaidPlan,
    handleLike,
    visitStats    
  } = useDeveloper();

  if (publicLoading) {
    return (
      <div className="min-h-screen bg-[#030014] flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-[#6366f1] animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading portfolio...</p>
        </div>
      </div>
    );
  }

  if (publicError || !developer) {
    return (
      <div className="min-h-screen bg-[#030014] flex items-center justify-center px-4">
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 max-w-md w-full text-center border border-white/10">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-10 h-10 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            {publicError || 'Developer not found'}
          </h1>
          <p className="text-gray-400 mb-6">
            Sorry, we couldn't find a portfolio for this user
          </p>
          <a
            href="/"
            className="inline-block px-6 py-3 bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white rounded-xl hover:scale-105 transition-all"
          >
            Back to Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* شريط الإحصائيات */}
      <div className="fixed top-16 left-4 z-50 bg-black/50 backdrop-blur-xl rounded-lg px-3 py-2 text-white text-sm flex items-center gap-3">
        <span className="flex items-center gap-1">
          <Eye className="w-4 h-4" />
          {visitStats?.views || 0}
        </span>
        <button 
          onClick={async () => {
            const result = await handleLike()
            if (!result.success) {
              alert(result.error || 'حدث خطأ')
            }
          }}
          className="flex items-center gap-1 hover:text-pink-400 transition-colors"
        >
          <Heart className="w-4 h-4" />
          {visitStats?.likes || 0}
        </button>
      </div>

      {/* شعار الباقة المدفوعة */}
      {isPaidPlan() && (
        <div className="fixed top-16 right-4 z-50 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-2">
          <Crown className="w-4 h-4" />
          Premium
        </div>
      )}
      
      <AnimatedBackground />
      <Navbar />

      <main className="relative z-10">
        <Home developer={developer} />
        <About developer={developer}/>
        <Skills developer={developer} />
        <Portfolio developer={developer} />
        <ExperiencePage developer={developer} />
        <EducationPage developer={developer} />
      </main>

      <Footer />
      
      {/* هذا الشعار مكرر - يمكنك إزالته */}
      {/* {isPaidPlan() && (
        <div className="fixed top-16 right-4 z-50">
          <div className="bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 shadow-lg">
            <Crown className="w-4 h-4" />
            Premium Plan
          </div>
        </div>
      )} */}
    </>
  );
};

export default PublicPortfolio;
