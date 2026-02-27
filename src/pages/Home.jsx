import React, { useState, useEffect, memo } from "react";

// =============================================
// الاستيرادات
// =============================================
import { Download } from "lucide-react";
import AOS from "aos";
import "aos/dist/aos.css";
import { useDeveloper } from '../context/DeveloperContext';
import AnimatedBackground from '../components/AnimatedBackground';

// ✅ مؤقتاً: لن نستورد SocialLinks
// import SocialLinks from '../components/SocialLinks';

// =============================================
// مكون النص المتحرك
// =============================================
const AnimatedText = memo(({ skills }) => {
  const [text, setText] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const [wordIndex, setWordIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);

  const words = skills && skills.length > 0 ? skills : [
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
      <span className="text-lg sm:text-xl md:text-2xl text-gray-300 font-light">
        <span className="text-[#a855f7] font-semibold">{text}</span>
      </span>
      <span className="w-[3px] h-5 sm:h-6 bg-[#a855f7] ml-1 animate-blink"></span>
    </div>
  );
});

// =============================================
// مكون الصورة
// =============================================
const ProfileImage = memo(({ image }) => {
  const [imageError, setImageError] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const imageSource = imageError ? "/Coding.gif" : image;

  return (
    <div className="relative group">
      <div
        className={`absolute inset-0 bg-gradient-to-r from-[#6366f1] to-[#a855f7] rounded-full blur-3xl transition-all duration-700 ${
          isMobile
            ? "opacity-10"
            : "opacity-20 group-hover:opacity-30"
        }`}
      ></div>

      <img
        src={imageSource}
        alt="Profile"
        onError={() => setImageError(true)}
        className={`relative object-cover rounded-full border-4 border-white/10 transition-all duration-700 ${
          isMobile
            ? "w-40 h-40 sm:w-48 sm:h-48"
            : "w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 group-hover:scale-105"
        }`}
      />
    </div>
  );
});

// =============================================
// مكون مؤقت لاختبار الروابط (بدون أي تعقيدات)
// =============================================
const TestSocialLinks = ({ links, isFree, adminLinks }) => {
  console.log("🔵 TestSocialLinks - Props received:", { links, isFree, adminLinks });
  
  return (
    <div className="bg-blue-500/20 p-4 rounded-lg border border-blue-500">
      <h3 className="text-blue-400 font-bold mb-2">🧪 Test Social Links Component</h3>
      <p className="text-white">Is Free: {isFree ? "Yes" : "No"}</p>
      <p className="text-white">Links: {JSON.stringify(links)}</p>
      <p className="text-white">Admin Links: {JSON.stringify(adminLinks)}</p>
    </div>
  );
};

// =============================================
// المكون الرئيسي
// =============================================
const Home = ({ developer: propDeveloper }) => {
  console.log("🟢 Home component started");
  
  let contextData = {};
  try {
    contextData = useDeveloper();
    console.log("🟢 Context loaded successfully");
  } catch (error) {
    console.log("🔴 Context error:", error.message);
  }

  const context = contextData || {};
  const developer = propDeveloper || context.developer || {};

  // ✅ تعريف جميع المتغيرات
  const mainSkills = context.getMainSkills ? context.getMainSkills() : [
    "Flutter Developer",
    "MySQL Expert",
    "PHP Developer",
    "Firebase Specialist"
  ];

  const socialLinks = context.getSocialLinks ? context.getSocialLinks() : {};
  const adminLinks = context.getAdminSocialLinks ? context.getAdminSocialLinks() : {};
  const isFree = context.isFreePlan ? context.isFreePlan() : true;
  const profileImage = context.getProfileImage ? context.getProfileImage() : "/Coding.gif";
  
  console.log("🟢 Variables defined:", { 
    socialLinks, 
    adminLinks, 
    isFree,
    mainSkillsLength: mainSkills.length 
  });
  
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    console.log("🟢 useEffect running");
    AOS.init({ once: true, offset: 10 });
    setIsLoaded(true);
    console.log("🟢 AOS initialized");
  }, []);

  return (
    <div className={`relative z-10 transition-all duration-1000 ${isLoaded ? "opacity-100" : "opacity-0"}`}>
      <AnimatedBackground />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 min-h-screen flex items-center">
        <div className="flex flex-col-reverse lg:flex-row items-center justify-center gap-6 sm:gap-8 lg:gap-12 w-full py-8 lg:py-0">
          
          {/* القسم الأيسر */}
          <div className="w-full lg:w-1/2 space-y-4 sm:space-y-5 lg:space-y-6 text-center lg:text-left order-2 lg:order-1">
            
            {/* الاسم */}
            <div data-aos="fade-right" data-aos-delay="200">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white">
                {developer?.full_name?.split(' ')[0] || 'Abdullah'}
              </h1>
              <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-gray-300 mt-1">
                {developer?.full_name?.split(' ').slice(1).join(' ') || 'Zabin Ali Aishan'}
              </h2>
            </div>

            {/* النص المتحرك */}
            <div data-aos="fade-right" data-aos-delay="400">
              <AnimatedText skills={mainSkills} />
            </div>

            {/* أزرار المشاريع والتواصل */}
            <div className="flex gap-2 sm:gap-3 justify-center lg:justify-start" data-aos="fade-right" data-aos-delay="800">
              <a 
                href="#Portfolio" 
                className="px-4 sm:px-5 lg:px-6 py-2 sm:py-2.5 text-sm sm:text-base bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white rounded-lg font-semibold hover:scale-105 transition-all flex items-center gap-2"
              >
                <Download size={20} />
                Projects
              </a>
              <a 
                href="#Contact" 
                className="px-4 sm:px-5 lg:px-6 py-2 sm:py-2.5 text-sm sm:text-base border border-[#a855f7]/50 text-[#a855f7] rounded-lg font-semibold hover:bg-[#a855f7]/10 transition-all"
              >
                Contact
              </a>
            </div>

            {/* ✅ استخدام المكون التجريبي بدلاً من SocialLinks */}
            <div data-aos="fade-right" data-aos-delay="1000">
              <TestSocialLinks 
                links={socialLinks} 
                isFree={isFree} 
                adminLinks={adminLinks} 
              />
            </div>

            {/* رسالة تشخيصية */}
            <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <p className="text-green-500 text-sm">
                ✅ Diagnostic Mode - Test Component Active
              </p>
            </div>
          </div>

          {/* القسم الأيمن - الصورة */}
          <div className="w-full lg:w-1/2 flex items-center justify-center order-1 lg:order-2 mb-4 lg:mb-0" data-aos="fade-left" data-aos-delay="400">
            <ProfileImage image={profileImage} />
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
