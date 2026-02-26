import React, { useState, useEffect, memo } from "react";
import {
  Github,
  Linkedin,
  Mail,
  ExternalLink,
  Instagram,
  Sparkles,
} from "lucide-react";
import AOS from "aos";
import "aos/dist/aos.css";
import { useDeveloper } from '../context/DeveloperContext';

// مكون النص المتحرك (يأخذ المهارات من قاعدة البيانات)
const AnimatedText = memo(({ skills }) => {
  const [text, setText] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const [wordIndex, setWordIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);

  // استخدام المهارات الرئيسية أولاً، ثم كل المهارات
  const words = skills.length > 0 ? skills : ["Frontend Developer", "React Enthusiast", "UI/UX Designer"];

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
      <span className="text-xl md:text-2xl bg-gradient-to-r from-gray-100 to-gray-300 bg-clip-text text-transparent font-light">
        {text}
      </span>
      <span className="w-[3px] h-6 bg-gradient-to-t from-[#6366f1] to-[#a855f7] ml-1 animate-blink"></span>
    </div>
  );
});

// شريط الحالة العلوي
const StatusBadge = memo(({ name }) => (
  <div className="inline-block animate-float lg:mx-0" data-aos="zoom-in" data-aos-delay="400">
    <div className="relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-[#6366f1] to-[#a855f7] rounded-full blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>
      <div className="relative px-3 sm:px-4 py-2 rounded-full bg-black/40 backdrop-blur-xl border border-white/10">
        <span className="bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-transparent bg-clip-text sm:text-sm text-[0.7rem] font-medium flex items-center">
          <Sparkles className="sm:w-4 sm:h-4 w-3 h-3 mr-2 text-blue-400" />
          {name}
        </span>
      </div>
    </div>
  </div>
));

// العنوان الرئيسي
const MainTitle = memo(({ title }) => {
  const words = title?.split(' ') || ['Frontend', 'Developer'];
  const firstWord = words[0] || 'Frontend';
  const secondWord = words.slice(1).join(' ') || 'Developer';
  
  return (
    <div className="space-y-2" data-aos="fade-up" data-aos-delay="600">
      <h1 className="text-5xl sm:text-6xl md:text-6xl lg:text-6xl xl:text-7xl font-bold tracking-tight">
        <span className="relative inline-block">
          <span className="absolute -inset-2 bg-gradient-to-r from-[#6366f1] to-[#a855f7] blur-2xl opacity-20"></span>
          <span className="relative bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
            {firstWord}
          </span>
        </span>
        <br />
        <span className="relative inline-block mt-2">
          <span className="absolute -inset-2 bg-gradient-to-r from-[#6366f1] to-[#a855f7] blur-2xl opacity-20"></span>
          <span className="relative bg-gradient-to-r from-[#6366f1] to-[#a855f7] bg-clip-text text-transparent">
            {secondWord}
          </span>
        </span>
      </h1>
    </div>
  );
});

// المهارات السريعة
const TechStack = memo(({ tech, color = 'from-blue-500 to-cyan-500' }) => (
  <div className={`px-4 py-2 hidden sm:block rounded-full bg-gradient-to-r ${color} bg-opacity-10 text-sm text-white hover:scale-105 transition-all cursor-default shadow-lg`}>
    {tech}
  </div>
));

// أزرار CTA
const CTAButton = memo(({ href, text, icon: Icon }) => (
  <a href={href}>
    <button className="group relative w-[160px]">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-[#4f52c9] to-[#8644c5] rounded-xl opacity-50 blur-md group-hover:opacity-90 transition-all duration-700"></div>
      <div className="relative h-11 bg-[#030014] backdrop-blur-xl rounded-lg border border-white/10 leading-none overflow-hidden">
        <div className="absolute inset-0 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500 bg-gradient-to-r from-[#4f52c9]/20 to-[#8644c5]/20"></div>
        <span className="absolute inset-0 flex items-center justify-center gap-2 text-sm group-hover:gap-3 transition-all duration-300">
          <span className="bg-gradient-to-r from-gray-200 to-white bg-clip-text text-transparent font-medium z-10">
            {text}
          </span>
          <Icon
            className={`w-4 h-4 text-gray-200 ${
              text === "Contact"
                ? "group-hover:translate-x-1"
                : "group-hover:rotate-45"
            } transform transition-all duration-300 z-10`}
          />
        </span>
      </div>
    </button>
  </a>
));

// روابط التواصل
const SocialLink = memo(({ icon: Icon, link }) => (
  <a href={link} target="_blank" rel="noopener noreferrer">
    <button className="group relative p-3">
      <div className="absolute inset-0 bg-gradient-to-r from-[#6366f1] to-[#a855f7] rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
      <div className="relative rounded-xl bg-black/50 backdrop-blur-xl p-2 flex items-center justify-center border border-white/10 group-hover:border-white/20 transition-all duration-300">
        <Icon className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
      </div>
    </button>
  </a>
));

// المكون الرئيسي
const Home = ({ developer: propDeveloper }) => {
  const context = useDeveloper();
  const developer = propDeveloper || context.publicDeveloper;
  const { getMainSkills, getSkills, getSocialLinks, getProfileImage, isFreePlan, getAdminSocialLinks } = context;
  
  const [isLoaded, setIsLoaded] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  // جلب المهارات الرئيسية للنص المتحرك
  const mainSkills = getMainSkills().map(s => s.name);
  const allSkills = getSkills();
  
  // المهارات السريعة (أول 4 مع ألوانها)
  const quickSkills = allSkills.slice(0, 4);

  // روابط التواصل - إذا كانت الباقة مجانية، استخدم روابط الأدمن
  let socialLinks;
  if (isFreePlan()) {
    socialLinks = getAdminSocialLinks();
  } else {
    socialLinks = getSocialLinks();
  }

  const socialLinksArray = [
    { icon: Github, link: socialLinks.github || "#", show: socialLinks.github },
    { icon: Linkedin, link: socialLinks.linkedin || "#", show: socialLinks.linkedin },
    { icon: Instagram, link: socialLinks.instagram || "#", show: socialLinks.instagram },
  ].filter(item => item.show);

  useEffect(() => {
    AOS.init({ once: true, offset: 10 });
    setIsLoaded(true);
  }, []);

  return (
    <div className="relative min-h-screen bg-[#030014] overflow-hidden" id="Home">
      <div className={`relative z-10 transition-all duration-1000 ${isLoaded ? "opacity-100" : "opacity-0"}`}>
        <div className="container mx-auto px-[5%] min-h-screen">
          <div className="flex flex-col lg:flex-row items-center justify-center h-screen md:justify-between gap-12">
            
            {/* القسم الأيسر */}
            <div className="w-full lg:w-1/2 space-y-6 sm:space-y-8 text-left lg:text-left order-1">
              <StatusBadge name={developer?.full_name || "Ready to Innovate"} />
              <MainTitle title={developer?.title} />

              {/* النص المتحرك - من المهارات الرئيسية */}
              <AnimatedText skills={mainSkills} />

              {/* النص التعريفي */}
              <p className="text-base md:text-lg text-gray-400 max-w-xl leading-relaxed font-light">
                {developer?.bio || "Passionate developer creating innovative web solutions."}
              </p>

              {/* المهارات السريعة مع الألوان */}
              <div className="flex flex-wrap gap-3 justify-start">
                {quickSkills.map((skill, index) => (
                  <TechStack 
                    key={index} 
                    tech={skill.name} 
                    color={skill.color || 'from-blue-500 to-cyan-500'}
                  />
                ))}
              </div>

              {/* الأزرار */}
              <div className="flex flex-row gap-3 w-full justify-start">
                <CTAButton href="#Portfolio" text="Projects" icon={ExternalLink} />
                <CTAButton href="#Contact" text="Contact" icon={Mail} />
              </div>

              {/* روابط التواصل - حسب الباقة */}
              {socialLinksArray.length > 0 && (
                <div className="hidden sm:flex gap-4 justify-start">
                  {socialLinksArray.map((social, index) => (
                    <SocialLink key={index} icon={social.icon} link={social.link} />
                  ))}
                </div>
              )}
            </div>

            {/* القسم الأيمن - الصورة المتحركة */}
            <div
              className="w-full lg:w-1/2 h-auto relative flex items-center justify-center order-2"
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
              data-aos="fade-left"
              data-aos-delay="600"
            >
              <div className="relative w-full max-w-[500px]">
                {/* خلفية متوهجة */}
                <div className={`absolute inset-0 bg-gradient-to-r from-[#6366f1]/20 to-[#a855f7]/20 rounded-full blur-3xl transition-all duration-700 ${
                  isHovering ? 'opacity-60 scale-110' : 'opacity-30 scale-100'
                }`} />
                
                {/* الصورة */}
                <img
                  src={getProfileImage()}
                  alt="Profile animation"
                  className={`relative w-full h-auto object-contain z-10 transition-all duration-700 ${
                    isHovering ? 'scale-110 rotate-3' : 'scale-100 rotate-0'
                  }`}
                  style={{ imageRendering: 'high-quality' }}
                />
              </div>
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
