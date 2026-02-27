import React, { useState, useEffect, memo } from "react";
// تم تعليق جميع الاستيرادات الخارجية
// import { Download } from "lucide-react";
// import AOS from "aos";
// import "aos/dist/aos.css";
// import { useDeveloper } from '../context/DeveloperContext';
// import AnimatedBackground from '../components/AnimatedBackground';
// import SocialLinks from '../components/SocialLinks';

// تم تعليق مكون النص المتحرك بالكامل
/*
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
*/

// تم تعليق مكون الصورة بالكامل
/*
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
            ? 'w-40 h-40 sm:w-48 sm:h-48' 
            : 'w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 group-hover:scale-105'
        }`}
      />
    </div>
  );
});
*/

const Home = ({ developer: propDeveloper }) => {
  // تم تبسيط حالة التحميل فقط
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // مجرد تعيين حالة التحميل بعد ثانية واحدة للتأكد
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // عرض بسيط جداً - مجرد نص للتأكد من أن الملف يعمل
  return (
    <div style={{ 
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#1a1a1a',
      color: 'white',
      fontFamily: 'sans-serif',
      padding: '20px'
    }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>
        ✅ Home Component
      </h1>
      <p style={{ fontSize: '1.5rem', color: '#a855f7' }}>
        Status: {isLoaded ? 'Loaded Successfully' : 'Loading...'}
      </p>
      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
        <p>No external dependencies</p>
        <p>No context</p>
        <p>Pure React Component</p>
      </div>
    </div>
  );
};

export default memo(Home);
