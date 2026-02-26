import React, { useState, useEffect, memo } from "react";
import {
  Github,
  Linkedin,
  Mail,
  ExternalLink,
  Instagram,
  Facebook,
  Youtube,
  Twitter,
  Download
} from "lucide-react";
import AOS from "aos";
import "aos/dist/aos.css";
import { useDeveloper } from '../context/DeveloperContext';
import AnimatedBackground from '../components/AnimatedBackground';

// مكون النص المتحرك
const AnimatedText = memo(({ skills }) => {
  const [text, setText] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const [wordIndex, setWordIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);

  // استخدام المهارات الرئيسية أو القيم الافتراضية
  const words = skills.length > 0 ? skills : [
    "Flutter Developer",
    "MySQL Expert",
    "PHP Developer",
    "Firebase Specialist"
  ];

  useEffect(() => {
    const TYPING_SPEED = 100;
    const ERASING_SPEED = 50;
    const PAUSE_DURATION = 2000;

    const handleTyping = () => {
      if (isTyping) {
        if (charIndex < words[wordIndex].length) {
          setText(prev => prev + words[wordIndex][charIndex]);
          setCharIndex(prev => prev + 1);
        } else {
          setTimeout(() => setIsTyping(false), PAUSE_DURATION);
        }
      } else {
        if (charIndex > 0) {
          setText(prev => prev.slice(0, -1));
          setCharIndex(prev => prev - 1);
        } else {
          setWordIndex(prev => (prev + 1) % words.length);
          setIsTyping(true);
        }
      }
    };

    const timeout = setTimeout(handleTyping, isTyping ? TYPING_SPEED : ERASING_SPEED);
    return () => clearTimeout(timeout);
  }, [charIndex, isTyping, wordIndex, words]);

  return (
    <div className="h-8 flex items-center">
      <span className="text-xl md:text-2xl text-gray-300 font-light">
        <span className="text-[#a855f7] font-semibold">{text}</span>
      </span>
      <span className="w-[3px] h-6 bg-[#a855f7] ml-1 animate-blink"></span>
    </div>
  );
});

// روابط التواصل - نسخة محسنة
const SocialLinks = memo(({ links, isFreePlan, adminLinks }) => {
  // تحديد الروابط المستخدمة
  const usedLinks = isFreePlan ? adminLinks : links;
  
  const icons = [
    { icon: Github, platform: 'github', label: 'GitHub' },
    { icon: Linkedin, platform: 'linkedin', label: 'LinkedIn' },
    { icon: Instagram, platform: 'instagram', label: 'Instagram' },
    { icon: Facebook, platform: 'facebook', label: 'Facebook' },
    { icon: Youtube, platform: 'youtube', label: 'YouTube' },
    { icon: Twitter, platform: 'twitter', label: 'Twitter' },
    { icon: Mail, platform: 'email', label: 'Email' }
  ];

  return (
    <div className="flex gap-3 flex-wrap justify-center lg:justify-start">
      {icons.map(({ icon: Icon, platform, label }) => {
        const link = usedLinks[platform];
        if (!link) return null;
        
        return (
          <a
            key={platform}
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative"
            aria-label={label}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#6366f1] to-[#a855f7] rounded-lg blur opacity-0 group-hover:opacity-50 transition duration-300"></div>
            <div className="relative w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center hover:bg-white/10 transition-all border border-white/10 group-hover:border-[#6366f1]/50">
              <Icon className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
            </div>
          </a>
        );
      })}
    </div>
  );
});

// مكون الصورة
const ProfileImage = memo(({ image }) => {
  const [imageError, setImageError] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const imageSource = imageError ? '/Coding.gif' : image;

  return (
    <div className="relative group">
      <div className={`absolute inset-0 bg-gradient-to-r from-[#6366f1] to-[#a855f7] rounded-full blur-3xl transition-all duration-700 ${
        isMobile ? 'opacity-10' : 'opacity-20 group-hover:opacity-30'
      }`}></div>
      
      <img
        src={imageSource}
        alt="Profile"
        onError={() => setImageError(true)}
        className={`relative object-cover rounded-full border-4 border-white/10 transition-all duration-700 ${
          isMobile 
            ? 'w-48 h-48'
            : 'w-80 h-80 md:w-96 md:h-96 group-hover:scale-105'
        }`}
      />
      
      {imageError && (
        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-500 whitespace-nowrap">
          Default animation
        </div>
      )}
    </div>
  );
});

const Home = ({ developer: propDeveloper }) => {
  const context = useDeveloper();
  const developer = propDeveloper || context.publicDeveloper;
  const { 
    getMainSkills, 
    getSocialLinks, 
    getAdminSocialLinks,
    getProfileImage,
    isFreePlan 
  } = context;
  
  const [isLoaded, setIsLoaded] = useState(false);

  const mainSkills = getMainSkills();
  const socialLinks = getSocialLinks();
  const adminLinks = getAdminSocialLinks();
  const isFree = isFreePlan();

  useEffect(() => {
    AOS.init({ once: true, offset: 10 });
    setIsLoaded(true);
  }, []);

  return (
    <div className="relative min-h-screen bg-[#030014] overflow-hidden" id="Home">
      <AnimatedBackground />
      
      <div className={`relative z-10 transition-all duration-1000 ${isLoaded ? "opacity-100" : "opacity-0"}`}>
        <div className="container mx-auto px-[5%] min-h-screen flex items-center">
          <div className="flex flex-col-reverse lg:flex-row items-center justify-center gap-8 lg:gap-12 w-full">
            
            {/* القسم الأيسر */}
            <div className="w-full lg:w-1/2 space-y-6 text-center lg:text-left order-2 lg:order-1">
              {/* الاسم */}
              <div data-aos="fade-right" data-aos-delay="200">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">
                  Abdullah Zabin
                </h1>
                <h2 className="text-xl md:text-2xl lg:text-3xl text-gray-300 mt-1">
                  Ali Aishan
                </h2>
              </div>

              {/* النص المتحرك */}
              <div data-aos="fade-right" data-aos-delay="400">
                <AnimatedText skills={mainSkills} />
              </div>

              {/* الوصف */}
              <p className="text-sm md:text-base text-gray-400 leading-relaxed max-w-xl mx-auto lg:mx-0" data-aos="fade-right" data-aos-delay="600">
                Passionate about technology since 2008, I started programming professionally in 2015.
                I specialize in cross-platform Flutter development with strong experience integrating
                backends (PHP, Firebase, MySQL). I focus on building smart, reliable solutions for
                healthcare and service systems.
              </p>

              {/* أزرار المشاريع والتواصل */}
              <div className="flex gap-3 justify-center lg:justify-start" data-aos="fade-right" data-aos-delay="800">
                <a
                  href="#Portfolio"
                  className="px-6 py-2.5 bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white rounded-lg font-semibold hover:scale-105 transition-all"
                >
                  Projects
                </a>
                <a
                  href="#Contact"
                  className="px-6 py-2.5 border border-[#a855f7]/50 text-[#a855f7] rounded-lg font-semibold hover:bg-[#a855f7]/10 transition-all"
                >
                  Contact
                </a>
              </div>

              {/* روابط التواصل */}
              <div data-aos="fade-right" data-aos-delay="1000">
                <SocialLinks 
                  links={socialLinks} 
                  isFreePlan={isFree} 
                  adminLinks={adminLinks} 
                />
              </div>
            </div>

            {/* القسم الأيمن - الصورة */}
            <div className="w-full lg:w-1/2 flex items-center justify-center order-1 lg:order-2 mb-8 lg:mb-0" data-aos="fade-left" data-aos-delay="400">
              <ProfileImage image={getProfileImage()} />
            </div>
          </div>
        </div>
      </div>

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
