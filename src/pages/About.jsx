import React, { useEffect, memo, useMemo } from "react"
import {
  FileText,
  Code,
  Award,
  Globe,
  ArrowUpRight,
  Sparkles,
} from "lucide-react"
import AOS from "aos"
import "aos/dist/aos.css"
import { useDeveloper } from '../context/DeveloperContext'

// مكونات مساعدة
const Header = memo(() => (
  <div className="text-center lg:mb-8 mb-2 px-[5%]">
    <div className="inline-block relative group">
      <h2
        className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#6366f1] to-[#a855f7]"
        data-aos="zoom-in-up"
      >
        About Me
      </h2>
    </div>
    <p
      className="mt-2 text-gray-400 max-w-2xl mx-auto text-base sm:text-lg flex items-center justify-center gap-2"
      data-aos="zoom-in-up"
    >
      <Sparkles className="w-5 h-5 text-purple-400" />
      Transforming ideas into digital experiences
      <Sparkles className="w-5 h-5 text-purple-400" />
    </p>
  </div>
))

const ProfileImage = memo(({ image }) => (
  <div className="flex justify-end items-center sm:p-12 sm:py-0 sm:pb-0 p-0 py-2 pb-2">
    <div className="relative group" data-aos="fade-up">
      <div className="absolute -inset-6 opacity-[25%] z-0 hidden sm:block">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-indigo-500 to-purple-600 rounded-full blur-2xl animate-spin-slower" />
        <div className="absolute inset-0 bg-gradient-to-l from-fuchsia-500 via-rose-500 to-pink-600 rounded-full blur-2xl animate-pulse-slow opacity-50" />
      </div>
      <div className="relative">
        <div className="w-72 h-72 sm:w-80 sm:h-80 rounded-full overflow-hidden shadow-[0_0_40px_rgba(120,119,198,0.3)] transform transition-all duration-700 group-hover:scale-105">
          <div className="absolute inset-0 border-4 border-white/20 rounded-full z-20 transition-all duration-700 group-hover:border-white/40 group-hover:scale-105" />
          <img
            src={image}
            alt="Profile"
            className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:rotate-2"
            loading="lazy"
          />
        </div>
      </div>
    </div>
  </div>
))

const StatCard = memo(({ icon: Icon, color, value, label, description, animation }) => (
  <div data-aos={animation} className="relative group">
    <div className="relative z-10 bg-gray-900/50 backdrop-blur-lg rounded-2xl p-6 border border-white/10 overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl h-full flex flex-col justify-between">
      <div className={`absolute -z-10 inset-0 bg-gradient-to-br ${color} opacity-10 group-hover:opacity-20 transition-opacity`} />
      <div className="flex items-center justify-between mb-4">
        <div className="w-16 h-16 rounded-full flex items-center justify-center bg-white/10 transition-transform group-hover:rotate-6">
          <Icon className="w-8 h-8 text-white" />
        </div>
        <span className="text-4xl font-bold text-white">{value}</span>
      </div>
      <div>
        <p className="text-sm uppercase tracking-wider text-gray-300 mb-2">{label}</p>
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-400">{description}</p>
          <ArrowUpRight className="w-4 h-4 text-white/50 group-hover:text-white transition-colors" />
        </div>
      </div>
    </div>
  </div>
))

const AboutPage = ({ developer: propDeveloper }) => {
  const context = useDeveloper()
  const developer = propDeveloper || context.publicDeveloper
  const { getProfileImage, getProjects, getCertificates, getSkills, getExperience } = context

  // حساب الإحصائيات
  const stats = useMemo(() => {
    const projects = getProjects()
    const certificates = getCertificates()
    const skills = getSkills()
    const experience = getExperience()
    
    // حساب سنوات الخبرة
    let totalYears = 0
    experience?.forEach(exp => {
      if (exp.start_date) {
        const start = new Date(exp.start_date)
        const end = exp.is_current ? new Date() : new Date(exp.end_date)
        const years = (end - start) / (1000 * 60 * 60 * 24 * 365)
        totalYears += years
      }
    })

    return {
      projects: projects?.length || 0,
      certificates: certificates?.length || 0,
      skills: skills?.length || 0,
      experience: Math.round(totalYears * 10) / 10 || 0
    }
  }, [developer])

  useEffect(() => {
    AOS.init({ once: false })
  }, [])

  return (
    <div
      className="h-auto pb-[10%] text-white overflow-hidden px-[5%] sm:px-[5%] lg:px-[10%] mt-10 sm:mt-0"
      id="About"
    >
      <Header />

      <div className="w-full mx-auto pt-8 sm:pt-12 relative">
        <div className="flex flex-col-reverse lg:grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          
          {/* النص التعريفي */}
          <div className="space-y-6 text-center lg:text-left">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6366f1] to-[#a855f7]">
                Hello, I'm
              </span>
              <span className="block mt-2 text-gray-200">
                {developer?.full_name || "Developer Name"}
              </span>
            </h2>

            <p className="text-base sm:text-lg lg:text-xl text-gray-400 leading-relaxed text-justify">
              {developer?.bio || "Passionate developer with expertise in creating innovative web solutions. Committed to delivering high-quality work and continuously learning new technologies."}
            </p>

            <div className="flex flex-col lg:flex-row items-center lg:items-start gap-4 lg:px-0 w-full">
              <a href={developer?.resume_file || "#"} className="w-full lg:w-auto" target="_blank" rel="noopener noreferrer">
                <button className="w-full lg:w-auto sm:px-6 py-2 sm:py-3 rounded-lg bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white font-medium transition-all duration-300 hover:scale-105 flex items-center justify-center lg:justify-start gap-2 shadow-lg hover:shadow-xl">
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5" /> Download CV
                </button>
              </a>
              <a href="#Portofolio" className="w-full lg:w-auto">
                <button className="w-full lg:w-auto sm:px-6 py-2 sm:py-3 rounded-lg border border-[#a855f7]/50 text-[#a855f7] font-medium transition-all duration-300 hover:scale-105 flex items-center justify-center lg:justify-start gap-2 hover:bg-[#a855f7]/10">
                  <Code className="w-4 h-4 sm:w-5 sm:h-5" /> View Projects
                </button>
              </a>
            </div>
          </div>

          {/* الصورة الشخصية */}
          <ProfileImage image={getProfileImage()} />
        </div>

        {/* بطاقات الإحصائيات */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-16">
          <StatCard
            icon={Code}
            color="from-[#6366f1] to-[#a855f7]"
            value={stats.projects}
            label="Total Projects"
            description="Completed projects"
            animation="fade-right"
          />
          <StatCard
            icon={Award}
            color="from-[#a855f7] to-[#6366f1]"
            value={stats.certificates}
            label="Certificates"
            description="Professional certifications"
            animation="fade-up"
          />
          <StatCard
            icon={Globe}
            color="from-[#6366f1] to-[#a855f7]"
            value={stats.skills}
            label="Skills"
            description="Technical expertise"
            animation="fade-up"
          />
          <StatCard
            icon={FileText}
            color="from-[#a855f7] to-[#6366f1]"
            value={stats.experience}
            label="Years Experience"
            description="Professional journey"
            animation="fade-left"
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes spin-slower {
          to { transform: rotate(360deg); }
        }
        .animate-spin-slower {
          animation: spin-slower 8s linear infinite;
        }
      `}</style>
    </div>
  )
}

export default memo(AboutPage)
