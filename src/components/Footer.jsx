import React from 'react';
import { Heart, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useDeveloper } from '../context/DeveloperContext';

const Footer = () => {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();
  const { 
    isFreePlan, 
    developer 
  } = useDeveloper();

  const handleAdminClick = () => {
    navigate('/u/abdullah_aishan');
  };

  const isFree = isFreePlan?.() || developer?.plan_id === 1;

  return (
    <footer className="bg-gradient-to-t from-[#030014] to-transparent border-t border-white/10 pt-8 sm:pt-10 lg:pt-12 pb-4 sm:pb-5 lg:pb-6 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-7xl mx-auto">
        
        {/* ✅ سطر حقوق الملكية */}
        <div className="text-center border-t border-white/10 pt-4 sm:pt-5 lg:pt-6">
          <p className="text-gray-400 text-xs sm:text-sm flex items-center justify-center gap-1 flex-wrap">
            © {currentYear} 
            
            {isFree ? (
              // 🎯 مجاني: تظهر المنصة
              <>
                <span className="text-[#a855f7] font-medium mx-1 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  PortfolioV5
                </span>
              </>
            ) : (
              // 💎 مدفوع: تظهر حقوق المطور
              <>
                <span>All rights reserved for</span>
                <span
                  onClick={handleAdminClick}
                  className="text-[#a855f7] hover:text-[#6366f1] cursor-pointer font-medium mx-1"
                >
                  {developer?.full_name || 'Abdullah Zabin Ali Aishan'}
                </span>
              </>
            )}

            <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-red-400 mx-1" />
          </p>

          {/* 🔗 رابط المنصة للمجانيين */}
          {isFree && (
            <p className="text-xs text-gray-500 mt-2">
              Create your professional portfolio at{' '}
              <Link to="/" className="text-[#a855f7] hover:underline">
                PortfolioV5
              </Link>
            </p>
          )}
          
          {/* روابط إضافية */}
          <div className="flex justify-center gap-3 sm:gap-4 mt-3 sm:mt-4 text-xs text-gray-500">
            <Link to="/privacy" className="hover:text-gray-400 transition">Privacy</Link>
            <span>•</span>
            <Link to="/terms" className="hover:text-gray-400 transition">Terms</Link>
            <span>•</span>
            <Link to="/admin" className="hover:text-[#a855f7] transition">Admin</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
