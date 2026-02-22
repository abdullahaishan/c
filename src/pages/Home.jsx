import React, { useState, useEffect, useCallback, memo } from "react"
import {
  Github,
  Linkedin,
  Mail,
  ExternalLink,
  Instagram,
  Sparkles,
} from "lucide-react"
import { DotLottieReact } from "@lottiefiles/dotlottie-react"
import AOS from "aos"
import "aos/dist/aos.css"
import { useDeveloper } from '../context/DeveloperContext'

// مكونات مساعدة
const StatusBadge = memo(({ name }) => (
  <div className="inline-block animate-float" data-aos="zoom-in">
    <div className="relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-[#6366f1] to-[#a855f7] rounded-full blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>
      <div className="relative px-4 py-2 rounded-full bg-black/40 backdrop-blur-xl border border-white/10">
        <span className="bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-transparent bg-clip-text text-sm font-medium flex items-center">
          <Sparkles className="w-4 h-4 mr-2 text-blue-400" />
          {name}
        </span>
      </div>
    </div>
  </div>
))

const MainTitle = memo(({ title }) => {
  const words = title?.split(' ') || ['Frontend', 'Developer']
  return (
    <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight">
      <span className="relative inline-block">
        <span className="absolute -inset-2 bg-gradient-to-r from-[#6366f1] to-[#a855f7] blur-2xl opacity-20"></span>
        <span className="relative bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
          {words[0]}
        </span>
      </span>
      <br />
      <span className="relative inline-block mt-2">
        <span className="absolute -inset-2 bg-gradient-to-r from-[#6366f1] to-[#a855f7] blur-2xl opacity-20"></span>
        <span className="relative bg-gradient-to-r from-[#6366f1] to-[#a855f7] bg-clip-text text-transparent">
          {words.slice(1).join(' ') || 'Developer'}
        </span>
      </span>
    </h1>
  )
})

const TechStack = memo(({ tech }) => (
  <div className="px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 text-sm text-gray-300 hover:bg-white/10 transition-colors">
    {tech}
  </div>
))

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
          <Icon className={`w-4 h-4 text-gray-200 ${text === "Contact" ? "group-hover:translate-x-1" : "group-hover:rotate-45"} transform transition-all duration-300 z-10`} />
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

const Home = () => {
  const { 
    developer, 
    getProfileImage, 
    getSocialLinks,
    getSkills 
  } = useDeveloper()
  
  const [text, setText] = useState("")
  const [isTyping, setIsTyping] = useState(true)
  const [wordIndex, setWordIndex] = useState(0)
  const [charIndex, setCharIndex] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isHovering, setIsHovering] = useState(false)

  // كلمات للكتابة (يمكن جعلها ديناميكية من skills)
  const WORDS = developer?.titles || [
    "Network & Telecom Student",
    "Tech Enthusiast",
    "Frontend Developer"
  ]

  // المهارات السريعة (أول 4 مهارات)
  const quickSkills = getSkills()
    .slice(0, 4)
    .map(s => s.name) || ["React", "JavaScript", "Node.js", "Tailwind"]

  // روابط التواصل
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
  }, [charIndex, isTyping, wordIndex, WORDS])

  return (
    <div className="min-h-screen bg-[#030014] overflow-hidden" id="Home">
      <div className={`relative z-10 transition-all duration-1000 ${isLoaded ? "opacity-100" : "opacity-0"}`}>
        <div className="container mx-auto px-[5%] min-h-screen">
          <div className="flex flex-col lg:flex-row items-center justify-center h-screen md:justify-between gap-12">
            
            {/* القسم الأيسر - النصوص */}
            <div className="w-full lg:w-1/2 space-y-6 text-left lg:text-left order-1">
              <StatusBadge name={developer?.full_name || "Ready to Innovate"} />
              <MainTitle title={developer?.title || "Frontend Developer"} />

              {/* تأثير الكتابة */}
              <div className="h-8 flex items-center">
                <span className="text-xl md:text-2xl bg-gradient-to-r from-gray-100 to-gray-300 bg-clip-text text-transparent font-light">
                  {text}
                </span>
                <span className="w-[3px] h-6 bg-gradient-to-t from-[#6366f1] to-[#a855f7] ml-1 animate-blink"></span>
              </div>

              {/* الوصف */}
              <p className="text-base md:text-lg text-gray-400 max-w-xl leading-relaxed font-light">
                {developer?.bio || "Creating innovative, functional, and user-friendly websites for digital solutions."}
              </p>

              {/* المهارات السريعة */}
              <div className="flex flex-wrap gap-3 justify-start">
                {quickSkills.map((skill, index) => (
                  <TechStack key={index} tech={skill} />
                ))}
              </div>

              {/* أزرار CTA */}
              <div className="flex flex-row gap-3 w-full justify-start">
                <CTAButton href="#Portofolio" text="Projects" icon={ExternalLink} />
                <CTAButton href="#Contact" text="Contact" icon={Mail} />
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
              className="w-full lg:w-1/2 h-[500px] relative flex items-center justify-center order-2"
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
              data-aos="fade-left"
            >
              <div className="relative w-full opacity-90">
                <div className={`absolute inset-0 bg-gradient-to-r from-[#6366f1]/10 to-[#a855f7]/10 rounded-3xl blur-3xl transition-all duration-700 ease-in-out ${
                  isHovering ? "opacity-50 scale-105" : "opacity-20 scale-100"
                }`}></div>

                <div className={`relative z-10 w-full opacity-90 transform transition-transform duration-500 ${
                  isHovering ? "scale-105" : "scale-100"
                }`}>
                  <DotLottieReact
                    src="https://lottie.host/58753882-bb6a-49f5-a2c0-950eda1e135a/NLbpVqGegK.lottie"
                    loop
                    autoplay
                    className={`w-full h-full transition-all duration-500 ${
                      isHovering
                        ? "scale-[180%] sm:scale-[160%] md:scale-[150%] lg:scale-[145%] rotate-2"
                        : "scale-[175%] sm:scale-[155%] md:scale-[145%] lg:scale-[140%]"
                    }`}
                  />
                </div>

                <div className={`absolute inset-0 pointer-events-none transition-all duration-700 ${
                  isHovering ? "opacity-50" : "opacity-20"
                }`}>
                  <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-to-br from-indigo-500/10 to-purple-500/10 blur-3xl animate-pulse transition-all duration-700 ${
                    isHovering ? "scale-110" : "scale-100"
                  }`}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default memo(Home)