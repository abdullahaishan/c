import React, { useEffect, useState } from 'react'
import { 
  Briefcase, 
  Calendar, 
  MapPin, 
  Building2, 
  ChevronRight,
  Loader,
  AlertCircle
} from 'lucide-react'
import AOS from 'aos'
import 'aos/dist/aos.css'
import { useParams } from 'react-router-dom'
import { developerService } from '../lib/supabase'
import AnimatedBackground from '../components/AnimatedBackground'

const ExperiencePage = () => {
  const { username } = useParams()
  const [data, setData] = useState({ experience: [], totalYears: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchExperience = async () => {
      try {
        setLoading(true)
        const result = await developerService.getExperienceData(username)
        setData(result)
      } catch (err) {
        console.error('Error fetching experience:', err)
        setError('فشل تحميل الخبرات')
      } finally {
        setLoading(false)
      }
    }

    if (username) {
      fetchExperience()
    }
  }, [username])

  useEffect(() => {
    AOS.init({ 
      once: true,
      duration: 800,
      easing: 'ease-in-out'
    })
  }, [])

  // تنسيق التاريخ
  const formatDate = (dateString) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('ar-SA', { 
      year: 'numeric', 
      month: 'short' 
    })
  }

  if (loading) {
    return (
      <div className="relative min-h-screen bg-[#030014] overflow-hidden">
        <AnimatedBackground />
        <div className="relative z-10 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader className="w-12 h-12 animate-spin text-purple-500 mx-auto mb-4" />
            <p className="text-gray-400">جاري تحميل الخبرات...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="relative min-h-screen bg-[#030014] overflow-hidden">
        <AnimatedBackground />
        <div className="relative z-10 min-h-screen flex items-center justify-center">
          <div className="text-center max-w-md px-4">
            <AlertCircle className="w-16 h-16 text-red-500/50 mx-auto mb-4" />
            <h3 className="text-2xl text-white font-bold mb-3">عذراً!</h3>
            <p className="text-gray-400 mb-8">{error || 'لم يتم العثور على الخبرات'}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-purple-600 rounded-xl text-white hover:bg-purple-700 transition"
            >
              إعادة المحاولة
            </button>
          </div>
        </div>
      </div>
    )
  }

  const { experience, totalYears } = data

  return (
    <div className="relative min-h-screen bg-[#030014] overflow-hidden">
      <AnimatedBackground />
      
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-20">

        {/* Header مع إحصائيات */}
        <div className="text-center mb-16" data-aos="fade-up">
          <div className="relative inline-block mb-4">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/30 to-pink-500/30 blur-3xl" />
            <h2 className="relative text-5xl md:text-6xl font-bold">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6366f1] via-purple-400 to-[#a855f7]">
                Experience
              </span>
            </h2>
          </div>
          
          <div className="flex items-center justify-center gap-2 mt-4">
            <div className="px-4 py-2 bg-white/5 rounded-full border border-white/10">
              <span className="text-2xl font-bold text-purple-400">{totalYears}</span>
              <span className="text-gray-400 ml-1">+ Years</span>
            </div>
            <div className="px-4 py-2 bg-white/5 rounded-full border border-white/10">
              <span className="text-2xl font-bold text-pink-400">{experience.length}</span>
              <span className="text-gray-400 ml-1">Positions</span>
            </div>
          </div>
        </div>

        {/* قائمة الخبرات */}
        {experience.length === 0 ? (
          <div className="text-center py-20">
            <Briefcase className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No experience data available.</p>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-6">
            {experience.map((exp, index) => (
              <div
                key={exp.id || index}
                data-aos="fade-up"
                data-aos-delay={index * 100}
                className="group relative"
              >
                {/* خط زمني جانبي للشاشات الكبيرة */}
                {index < experience.length - 1 && (
                  <div className="absolute left-8 top-20 bottom-0 w-0.5 bg-gradient-to-b from-purple-500/50 to-transparent hidden md:block" />
                )}

                <div className="relative bg-white/5 backdrop-blur-xl rounded-2xl p-6 md:p-8 border border-white/10 hover:border-purple-500/50 transition-all duration-500 group-hover:scale-[1.02]">
                  
                  {/* شريط جانبي ملون */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 to-pink-500 rounded-l-2xl opacity-0 group-hover:opacity-100 transition-opacity" />

                  <div className="flex flex-col md:flex-row gap-6">
                    
                    {/* أيقونة الخبرة */}
                    <div className="relative">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Briefcase className="w-8 h-8 text-purple-400" />
                      </div>
                      {/* نقطة على الخط الزمني */}
                      <div className="absolute -right-2 top-1/2 w-3 h-3 rounded-full bg-purple-500 border-4 border-[#030014] hidden md:block" />
                    </div>

                    {/* محتوى الخبرة */}
                    <div className="flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                        <div>
                          <h3 className="text-2xl font-bold text-white group-hover:text-purple-400 transition">
                            {exp.job_title || exp.position}
                          </h3>
                          <div className="flex items-center gap-3 mt-2">
                            <div className="flex items-center gap-1 text-gray-400">
                              <Building2 className="w-4 h-4" />
                              <span className="text-sm">{exp.company || exp.company_name}</span>
                            </div>
                            {exp.location && (
                              <div className="flex items-center gap-1 text-gray-400">
                                <MapPin className="w-4 h-4" />
                                <span className="text-sm">{exp.location}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* فترة العمل */}
                        <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/10">
                          <Calendar className="w-4 h-4 text-purple-400" />
                          <span className="text-sm text-gray-300">
                            {formatDate(exp.start_date)}
                          </span>
                          <ChevronRight className="w-3 h-3 text-gray-500" />
                          <span className="text-sm text-gray-300">
                            {exp.is_current ? 'Present' : formatDate(exp.end_date)}
                          </span>
                        </div>
                      </div>

                      {/* الوصف */}
                      {exp.description && (
                        <p className="text-gray-300 leading-relaxed mt-4">
                          {exp.description}
                        </p>
                      )}

                      {/* الإنجازات */}
                      {exp.achievements?.length > 0 && (
                        <div className="mt-6">
                          <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                            <span className="w-1 h-4 bg-purple-500 rounded-full" />
                            Key Achievements
                          </h4>
                          <ul className="space-y-2">
                            {exp.achievements.map((achievement, i) => (
                              <li key={i} className="flex items-start gap-2 text-gray-400">
                                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-2" />
                                <span>{achievement}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* التقنيات المستخدمة */}
                      {exp.technologies?.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-6">
                          {exp.technologies.map((tech, i) => (
                            <span
                              key={i}
                              className="px-3 py-1.5 text-xs bg-gradient-to-r from-purple-500/10 to-pink-500/10 text-purple-400 rounded-lg border border-purple-500/20 hover:border-purple-500/40 transition"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ملاحظة الباقة المجانية - إذا أردت */}
        {/* {isFreePlan && (
          <div className="mt-12 p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-xl text-center">
            <p className="text-yellow-400 text-sm">
              ✨ Free Plan - Showing limited experience entries
            </p>
          </div>
        )} */}

      </div>
    </div>
  )
}

export default ExperiencePage
