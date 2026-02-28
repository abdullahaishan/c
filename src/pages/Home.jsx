import React, { useState, useEffect, memo } from "react";
import { Download, Heart } from "lucide-react";
import AOS from "aos";
import "aos/dist/aos.css";
import { useDeveloper } from '../context/DeveloperContext';
import { likeService } from '../lib/supabase';
import AnimatedBackground from '../components/AnimatedBackground';
import SocialLinks from '../components/SocialLinks';
import Swal from 'sweetalert2';

// مكون النص المتحرك (كما هو)
const AnimatedText = memo(({ skills }) => {
  // ... (نفس الكود السابق)
});

// مكون الصورة (كما هو)
const ProfileImage = memo(({ image }) => {
  // ... (نفس الكود السابق)
});

// مكون زر الإعجاب
const LikeButton = ({ developerId, initialLikes }) => {
  const [likes, setLikes] = useState(initialLikes || 0);
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // التحقق مما إذا كان الزائر قد أعجب سابقاً
    const checkLike = async () => {
      const visitorIp = await fetch('https://api.ipify.org?format=json')
        .then(res => res.json())
        .then(data => data.ip)
        .catch(() => 'unknown');

      const hasLiked = await likeService.hasLiked(developerId, visitorIp);
      setLiked(hasLiked);
    };

    if (developerId) {
      checkLike();
    }
  }, [developerId]);

  const handleLike = async () => {
    if (liked) {
      Swal.fire({
        icon: 'info',
        title: 'Already Liked',
        text: 'You have already liked this profile.',
        timer: 2000,
        showConfirmButton: false,
        background: '#030014',
        color: '#ffffff'
      });
      return;
    }

    setLoading(true);
    try {
      const visitorIp = await fetch('https://api.ipify.org?format=json')
        .then(res => res.json())
        .then(data => data.ip)
        .catch(() => 'unknown');

      await likeService.addLike(developerId, visitorIp);
      setLiked(true);
      setLikes(prev => prev + 1);

      Swal.fire({
        icon: 'success',
        title: 'Thank You!',
        text: 'Your like has been recorded.',
        timer: 2000,
        showConfirmButton: false,
        background: '#030014',
        color: '#ffffff'
      });
    } catch (error) {
      console.error('Error liking:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message === 'Already liked' 
          ? 'You have already liked this profile.' 
          : 'Failed to record your like.',
        background: '#030014',
        color: '#ffffff'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLike}
      disabled={loading || liked}
      className={`group relative flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
        liked 
          ? 'bg-pink-500/20 text-pink-400 cursor-not-allowed' 
          : 'bg-white/5 text-gray-400 hover:bg-pink-500/20 hover:text-pink-400'
      }`}
    >
      <Heart 
        className={`w-5 h-5 transition-all ${liked ? 'fill-pink-400' : ''}`} 
      />
      <span className="text-sm font-medium">{likes}</span>
      
      {/* Tooltip */}
      <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs bg-black/90 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
        {liked ? 'Already liked' : 'Like this profile'}
      </span>
    </button>
  );
};

const Home = ({ developer: propDeveloper }) => {
  const context = useDeveloper();
  const developer = propDeveloper || context.developer || {};

  const mainSkills = context.getMainSkills ? context.getMainSkills() : [
    "Flutter Developer",
    "MySQL Expert",
    "PHP Developer",
    "Firebase Specialist"
  ];

  const socialLinks = context.getSocialLinks ? context.getSocialLinks() : {};
  const adminLinks = context.getAdminSocialLinks ? context.getAdminSocialLinks() : {};
  const profileImage = context.getProfileImage ? context.getProfileImage() : "/Coding.gif";
  const isFree = context.isFreePlan ? context.isFreePlan() : true;
  const likesCount = developer.likes_count || 0;

  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    AOS.init({ once: true, offset: 10 });
    setIsLoaded(true);
  }, []);

  return (
    <div className={`relative z-10 transition-all duration-1000 ${isLoaded ? "opacity-100" : "opacity-0"}`}>
      <AnimatedBackground />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 min-h-screen flex items-center">
        <div className="flex flex-col-reverse lg:flex-row items-center justify-center gap-6 sm:gap-8 lg:gap-12 w-full py-8 lg:py-0">
          
          {/* القسم الأيسر */}
          <div className="w-full lg:w-1/2 space-y-4 sm:space-y-5 lg:space-y-6 text-center lg:text-left order-2 lg:order-1">
            
            {/* Header with Like Button */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white">
                  {developer?.full_name?.split(" ")[0] || "Abdullah"}
                </h1>
                <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-gray-300 mt-1">
                  {developer?.full_name?.split(" ").slice(1).join(" ") || "Zabin Ali Aishan"}
                </h2>
              </div>
              
              {/* Like Button */}
              <LikeButton 
                developerId={developer.id} 
                initialLikes={likesCount}
              />
            </div>

            {/* النص المتحرك */}
            <div>
              <AnimatedText skills={mainSkills} />
            </div>

            {/* الوصف (إذا كان موجوداً) */}
            {developer.bio && (
              <p className="text-gray-400 text-sm leading-relaxed">
                {developer.bio}
              </p>
            )}

            {/* أزرار المشاريع والتواصل */}
            <div className="flex gap-2 sm:gap-3 justify-center lg:justify-start">
              <a 
                href="#Portfolio" 
                className="px-4 sm:px-5 lg:px-6 py-2 sm:py-2.5 text-sm sm:text-base bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white rounded-lg font-semibold hover:scale-105 transition-all"
              >
                <Download className="inline-block mr-2" size={20} />
                Projects
              </a>
              <a 
                href="#Contact" 
                className="px-4 sm:px-5 lg:px-6 py-2 sm:py-2.5 text-sm sm:text-base border border-[#a855f7]/50 text-[#a855f7] rounded-lg font-semibold hover:bg-[#a855f7]/10 transition-all"
              >
                Contact
              </a>
            </div>

            {/* روابط التواصل */}
            <div data-aos="fade-right" data-aos-delay="1000">
              <SocialLinks 
                links={socialLinks || {}}
                isPaid={!isFree}
                isFreePlan={isFree || false}
                adminLinks={adminLinks || {}}
              />
            </div>
          </div>

          {/* القسم الأيمن - الصورة */}
          <div className="w-full lg:w-1/2 flex items-center justify-center order-1 lg:order-2 mb-4 lg:mb-0">
            <ProfileImage image={profileImage} />
          </div>
        </div>
      </div>

      {/* الأنيميششن */}
      <style jsx>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        .animate-blink {
          animation: blink 1s step-end infinite;
        }
      `}</style>
    </div>
  );
};

export default memo(Home);
