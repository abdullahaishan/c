import React from 'react';
import { useDeveloper } from '../context/DeveloperContext';
import Home from './Home';
import AboutPage from './About';
import Skills from './Skills';
import Portfolio from './Portfolio';
import WhyMe from './WhyMe';
import ExperienceSection from '../components/ExperienceSection';
import AnimatedBackground from '../components/AnimatedBackground';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Loader, AlertCircle, Crown } from 'lucide-react';

const PublicPortfolio = () => {
  const {
  developer,
  publicLoading,
  publicError,
  isPaidPlan
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
    <Navbar />
    <div className="text-white">Navbar Test</div>
  </>
)
};

export default PublicPortfolio;
