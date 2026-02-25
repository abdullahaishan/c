import React, { useState, useEffect, useCallback, memo } from "react"
import {
  Github,
  Linkedin,
  Mail,
  ExternalLink,
  Instagram,
  Sparkles,
} from "lucide-react"
import AOS from "aos"
import "aos/dist/aos.css"
import { useDeveloper } from '../context/DeveloperContext'

// مكون الخلفية المتحركة (4 أضواء في الزوايا)
const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 overflow-hidden">
      {/* الضوء الأول - أعلى يسار */}
      <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob"></div>
      
      {/* الضوء الثاني - أعلى يمين */}
      <div className="absolute top-0 -right-4 w-96 h-96 bg-cyan-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob animation-delay-2000 hidden sm:block"></div>
      
      {/* الضوء الثالث - أسفل يسار */}
      <div className="absolute -bottom-8 left-20 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob animation-delay-4000"></div>
      
      {/* الضوء الرابع - أسفل يمين */}
      <div className="absolute -bottom-10 right-20 w-96 h-96 bg-indigo-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-10 animate-blob animation-delay-6000 hidden sm:block"></div>
      
      {/* شبكة الخلفية */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f10_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f10_1px,transparent_1px)] bg-[size:24px_24px]"></div>
    </div>
  )
}

const StatusBadge = memo(({ name }) => (
  <div className="inline-block animate-float" data-aos="zoom-in">
    <div className="relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-[#6366f1] to-[#a855f7] rounded-full blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>
      <div className="relative px-6 py-3 rounded-full bg-black/40 backdrop-blur-xl border border-white/10">
        <span className="bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-transparent bg-clip-text text-sm font-medium flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-yellow-400" />
          {name}
        </span>
      </div>
    </div>
  </div>
))

const MainTitle = memo(({ title }) => {
  return (
    <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight">
      <span className="relative inline-block">
        <span className="absolute -inset-2 bg-gradient-to-r from-[#6366f1] to-[#a855f7] blur-2xl opacity-20"></span>
        <span className="relative bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
          Frontend
        </span>
      </span>
      <br />
      <span className="relative inline-block mt-2">
        <span className="absolute -inset-2 bg-gradient-to-r from-[#6366f1] to-[#a855f7] blur-2xl opacity-20"></span>
        <span className="relative bg-gradient-to-r from-[#6366f1] to-[#a855f7] bg-clip-text text-transparent">
          Developer
        </span>
      </span>
    </h1>
  )
})

const TechStack = memo(({ tech }) => (
  <div className="px-6 py-3 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 text-sm text-gray-300 hover:bg-white/10 hover:border-[#6366f1]/30 transition-all cursor-default">
    {tech}
  </div>
))

const CTAButton = memo(({ href, text, icon: Icon, primary = false }) => (
  <a href={href}>
    <button className={`group relative ${primary ? 'w-[160px]' : 'w-[160px]'}`}>
      <div className={`absolute -inset-0.5 ${primary ? 'bg-gradient-to-r from-[#6366f1] to-[#a855f7]' : 'bg-gradient-to-r from-[#4f52c9] to-[#8644c5]'} rounded-xl opacity-50 blur-md group-hover:opacity-90 transition-all duration-700`}></div>
      <div className="relative h-12 bg-[#030014] backdrop-blur-xl rounded-lg border border-white/10 leading-none overflow-hidden">
        <div className="absolute inset-0 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500 bg-gradient-to-r from-[#4f52c9]/20 to-[#8644c5]/20"></div>
        <span className="absolute inset-0 flex items-center justify-center gap-2 text-sm group-hover:gap-3 transition-all duration-300">
          <span className={`${primary ? 'text-white' : 'bg-gradient-to-r from-gray-200 to-white bg-clip-text text-transparent'} font-medium z-10`}>
            {text}
          </span>
          <Icon className={`w-4 h-4 ${primary ? 'text-white' : 'text-gray-200'} transform transition-all duration-300 z-10 ${text === "Contact" ? "group-hover:translate-x-1" : "group-hover:rotate-45"}`} />
        </span>
      </div>
    </button>
  </a>
))

const SocialLink = memo(({ icon: Icon, link }) => (
  <a href={link} target="_blank" rel="noopener noreferrer">
    <button className="group relative p-3">
      <div className="absolute inset-0 bg-gradient-to-r from-[#6366f1] to-[#a855f7] rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
      <div className="relative rounded-xl bg-black/50 backdrop-blur-xl p-2 flex items-center justify-center border border-white/10 group-hover:border-white/20 transition-all duration-300">
        <Icon className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
      </div>
    </button>
  </a>
))

const Home = ({ developer: propDeveloper }) => {
  const context = useDeveloper()
  const developer = propDeveloper || context.publicDeveloper
  const { getProfileImage, getSocialLinks, getSkills } = context
  
  const [text, setText] = useState("")
  const [isTyping, setIsTyping] = useState(true)
  const [wordIndex, setWordIndex] = useState(0)
  const [charIndex, setCharIndex] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isHovering, setIsHovering] = useState(false)

  const WORDS = [
    "Frontend Developer",
    "UI/UX Enthusiast",
    "Tech Innovator"
  ]

  // جلب المهارات من قاعدة البيانات
  const quickSkills = getSkills()
    .slice(0, 4)
    .map(s => s.name)

  // إذا لم توجد مهارات، استخدم القيم الافتراضية
  const displaySkills = quickSkills.length > 0 ? quickSkills : ["React", "JavaScript", "Node.js", "Tailwind"]

  const socialLinks = getSocialLinks()

  useEffect(() => {
    AOS.init({
      once: true,
      offset: 10,
    })
    setIsLoaded(true)
  }, [])

  // تأثير الكتابة
  useEffect(() => {
    const TYPING_SPEED = 100
    const ERASING_SPEED = 50
    const PAUSE_DURATION = 2000

    const handleTyping = () => {
      if (isTyping) {
        if (charIndex < WORDS[wordIndex].length) {
          setText(prev => prev + WORDS[wordIndex][charIndex])
          setCharIndex(prev => prev + 1)
        } else {
          setTimeout(() => setIsTyping(false), PAUSE_DURATION)
        }
      } else {
        if (charIndex > 0) {
          setText(prev => prev.slice(0, -1))
          setCharIndex(prev => prev - 1)
        } else {
          setWordIndex(prev => (prev + 1) % WORDS.length)
          setIsTyping(true)
        }
      }
    }

    const timeout = setTimeout(
      handleTyping,
      isTyping ? TYPING_SPEED : ERASING_SPEED
    )
    return () => clearTimeout(timeout)
  }, [charIndex, isTyping, wordIndex])

  return (
    <div className="min-h-screen bg-[#030014] overflow-hidden relative" id="Home">
      <AnimatedBackground />
      
      <div className={`relative z-10 transition-all duration-1000 ${isLoaded ? "opacity-100" : "opacity-0"}`}>
        <div className="container mx-auto px-[5%] min-h-screen">
          <div className="flex flex-col lg:flex-row items-center justify-center h-screen md:justify-between gap-12">
            
            {/* القسم الأيسر - النصوص */}
            <div className="w-full lg:w-1/2 space-y-8 text-left lg:text-left order-1">
              <StatusBadge name="Ready to Innovate" />
              
              <div className="space-y-2">
                <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight">
                  <span className="bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
                    Frontend
                  </span>
                  <br />
                  <span className="bg-gradient-to-r from-[#6366f1] to-[#a855f7] bg-clip-text text-transparent">
                    Developer
                  </span>
                </h1>
              </div>

              {/* النص المتحرك */}
              <div className="h-12 flex items-center">
                <span className="text-2xl md:text-3xl bg-gradient-to-r from-gray-100 to-gray-300 bg-clip-text text-transparent font-light">
                  {text}
                </span>
                <span className="w-[3px] h-8 bg-gradient-to-t from-[#6366f1] to-[#a855f7] mr-1 animate-blink"></span>
              </div>

              <p className="text-base md:text-lg text-gray-400 max-w-xl leading-relaxed font-light">
                Menciptakan Website Yang Inovatif, Fungsional, dan User-Friendly untuk Solusi Digital.
              </p>

              {/* المهارات */}
              <div className="flex flex-wrap gap-3 justify-start">
                {displaySkills.map((skill, index) => (
                  <TechStack key={index} tech={skill} />
                ))}
              </div>

              {/* الأزرار */}
              <div className="flex flex-row gap-4 w-full justify-start">
                <CTAButton href="#Portofolio" text="Projects" icon={ExternalLink} />
                <CTAButton href="#Contact" text="Contact" icon={Mail} primary={true} />
              </div>

              {/* روابط التواصل */}
              <div className="hidden sm:flex gap-4 justify-start">
                {socialLinks.github && (
                  <SocialLink icon={Github} link={socialLinks.github} />
                )}
                {socialLinks.linkedin && (
                  <SocialLink icon={Linkedin} link={socialLinks.linkedin} />
                )}
                {socialLinks.instagram && (
                  <SocialLink icon={Instagram} link={socialLinks.instagram} />
                )}
              </div>
            </div>

            {/* القسم الأيمن - الصورة المتحركة */}
            <div
              className="w-full lg:w-1/2 h-[600px] relative flex items-center justify-center order-2"
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
              data-aos="fade-left"
            >
              <div className="relative w-full h-full flex items-center justify-center">
                {/* الخلفية المتوهجة */}
                <div className={`absolute inset-0 bg-gradient-to-r from-[#6366f1]/20 to-[#a855f7]/20 rounded-full blur-3xl transition-all duration-700 ease-in-out ${
                  isHovering ? "opacity-60 scale-110" : "opacity-30 scale-100"
                }`}></div>

                {/* الصورة */}
                <div className={`relative z-10 w-[500px] h-[500px] transform transition-all duration-700 ${
                  isHovering ? "scale-110 rotate-3" : "scale-100 rotate-0"
                }`}>
                  <img 
                    src="/Coding.gif" 
                    alt="Coding animation"
                    className="w-full h-full object-contain drop-shadow-2xl"
                    style={{ 
                      filter: isHovering ? 'brightness(1.1) contrast(1.1)' : 'brightness(1) contrast(1)',
                      imageRendering: 'high-quality'
                    }}
                  />
                </div>

                {/* الأضواء الإضافية */}
                <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-indigo-500/10 to-purple-500/10 blur-3xl animate-pulse transition-all duration-700 ${
                  isHovering ? "scale-125" : "scale-100"
                }`}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 10s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .animation-delay-6000 {
          animation-delay: 6s;
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        .animate-blink {
          animation: blink 1s step-end infinite;
        }
      `}</style>
    </div>
  )
}

export default memo(Home)
