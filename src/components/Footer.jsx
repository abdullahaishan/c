import React from 'react';
import { Heart } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useDeveloper } from '../context/DeveloperContext';
import SocialLinks from './SocialLinks';

const Footer = () => {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();
  const { 
  isFreePlan, 
  getSocialLinks
} = useDeveloper();
  const handleAdminClick = () => {
    navigate('/u/abdullah_aishan');
  };

  const socialLinks = getSocialLinks();
  const isFree = isFreePlan();

  return (
    <footer className="bg-gradient-to-t from-[#030014] to-transparent border-t border-white/10 pt-8 sm:pt-10 lg:pt-12 pb-4 sm:pb-5 lg:pb-6 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-7xl mx-auto">
        
        {/* ⭐ روابط التواصل - تظهر حسب الباقة */}
        <div className="mb-6 sm:mb-8">
          <SocialLinks 
  links={socialLinks}
  isPaid={!isFree}
  isFreePlan={isFree}
/>
        </div>

        {/* سطر حقوق الملكية */}
        <div className="text-center border-t border-white/10 pt-4 sm:pt-5 lg:pt-6">
          <p className="text-gray-400 text-xs sm:text-sm flex items-center justify-center gap-1 flex-wrap">
            © {currentYear} All rights reserved for
            <span
              onClick={handleAdminClick}
              className="text-[#a855f7] hover:text-[#6366f1] cursor-pointer font-medium mx-1"
            >
              Abdullah Zabin Ali Aishan
            </span>
            <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-red-400 mx-1" />
          </p>
          
          {/* روابط إضافية */}
          <div className="flex justify-center gap-3 sm:gap-4 mt-2 sm:mt-3 text-xs text-gray-500">
            <Link to="/privacy" className="hover:text-gray-400">Privacy</Link>
            <span>•</span>
            <Link to="/terms" className="hover:text-gray-400">Terms</Link>
            <span>•</span>
            <Link to="/admin" className="hover:text-[#a855f7]">Admin</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
