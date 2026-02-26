import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { developerService } from '../lib/supabase';
import { useDeveloper } from '../context/DeveloperContext';
import Home from './Home';
import AboutPage from './About';
import Skills from './Skills';
import Portfolio from './Portfolio';
import WhyMe from './WhyMe';
import AnimatedBackground from '../components/AnimatedBackground';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Loader, AlertCircle, Crown } from 'lucide-react';

const PublicPortfolio = () => {
  const { username } = useParams();
  const [developer, setDeveloper] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isFreePlan, isPaidPlan } = useDeveloper();
  useEffect(() => {
    fetchDeveloperData();
  }, [username]);

  const fetchDeveloperData = async () => {
    setLoading(true);
    try {
      const data = await developerService.getByUsername(username);
      
      if (!data) {
        setError('Developer not found');
      } else {
        setDeveloper(data);
        await developerService.trackVisit(data.id, {
          visitor_ip: 'visitor_ip',
          visitor_country: 'country',
        });
      }
    } catch (err) {
      console.error('Error fetching developer:', err);
      setError('Failed to load portfolio');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030014] flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-[#6366f1] animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading portfolio...</p>
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
            {error || 'Developer not found'}
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
      <AnimatedBackground />
      <Navbar />
      <main className="relative z-10">
        <Home developer={developer} />
        <AboutPage developer={developer} />
        <Skills developer={developer} />
        <Portfolio developer={developer} />
        
        {/* ⭐ WhyMe يظهر فقط للباقة المجانية */}
        {isFreePlan() && <WhyMe developer={developer} />}
      </main>
      <Footer />
      
      {/* ⭐ شريط علوي للباقة المدفوعة */}
      {isPaidPlan() && (
        <div className="fixed top-16 right-4 z-50">
          <div className="bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-lg">
            <Crown className="w-3 h-3 sm:w-4 sm:h-4" />
            Premium Plan
          </div>
        </div>
      )}
    </>
  );
};

export default PublicPortfolio;
