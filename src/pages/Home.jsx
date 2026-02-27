import React, { useState, useEffect, memo } from "react";
import { Download } from "lucide-react";

const Home = ({ developer: propDeveloper }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // تجنب استخدام أي سياق أو مكونات خارجية
  return (
    <div style={{ color: "white", padding: "100px", backgroundColor: "#1a1a1a" }}>
      <h1>HOME TEST OK</h1>
      <p>Loading State: {isLoaded ? "Loaded" : "Loading..."}</p>
    </div>
  );
};

export default memo(Home);    }  
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

// مكون الصورة
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

const Home = ({ developer: propDeveloper }) => {

let context = {};
try {
  context = useDeveloper();
} catch (e) {
  console.error("Context error:", e);
          }
const developer = propDeveloper || context.developer || {};

const mainSkills = context.getMainSkills ? context.getMainSkills() : [];
const socialLinks = context.getSocialLinks ? context.getSocialLinks() : {};
const adminLinks = context.getAdminSocialLinks ? context.getAdminSocialLinks() : {};
const profileImage = context.getProfileImage ? context.getProfileImage() : "/Coding.gif";
const isFree = context.isFreePlan ? context.isFreePlan() : true;
const [isLoaded, setIsLoaded] = useState(false);

useEffect(() => {
// AOS.init({ once: true, offset: 10 });
setIsLoaded(true);
}, []);

return (
  <div style={{ color: "white", padding: "100px" }}>
    HOME TEST OK
  </div>
);
};

export default memo(Home);
