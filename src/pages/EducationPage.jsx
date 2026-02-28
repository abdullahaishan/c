import React, { useEffect, useState } from 'react'
import { 
  GraduationCap, 
  Calendar, 
  MapPin, 
  Award,
  BookOpen,
  ChevronRight,
  Loader,
  AlertCircle,
  School,
  Star
} from 'lucide-react'
import AOS from 'aos'
import 'aos/dist/aos.css'
import { useParams } from 'react-router-dom'
import { developerService } from '../lib/supabase'

const EducationPage = () => {
  const { username } = useParams()
  const [data, setData] = useState({ education: [], total: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchEducation = async () => {
      try {
        setLoading(true)
        const result = await developerService.getEducationData(username)
        setData(result)
      } catch (err) {
        console.error('Error fetching education:', err)
        setError('فشل تحميل المؤهلات التعليمية')
      } finally {
        setLoading(false)
      }
    }

    if (username) {
      fetchEducation()
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
        
        <div className="relative z-10 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader className="w-12 h-12 animate-spin text-purple-500 mx-auto mb-4" />
            <p className="text-gray-400">جاري تحميل المؤهلات التعليمية...</p>
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
            <p className="text-gray-400 mb-8">{error || 'لم يتم العثور على المؤهلات التعليمية'}</p>
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

  const { education, total } = data

  return (
    <div className="relative min-h-screen bg-[#030014] overflow-hidden">
      <AnimatedBackground />
      
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-20">

        {/* Header مع إحصائيات */}
        <div className="text-center mb-16" data-aos="fade-up">
          <div className="relative inline-block mb-4">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 to-cyan-500/30 blur-3xl" />
            <h2 className="relative text-5xl md:text-6xl font-bold">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400">
                Education
              </span>
            </h2>
          </div>
          
          <div className="flex items-center justify-center gap-2 mt-4">
            <div className="px-4 py-2 bg-white/5 rounded-full border border-white/10">
              <span className="text-2xl font-bold text-blue-400">{total}</span>
              <span className="text-gray-400 ml-1">Qualifications</span>
            </div>
          </div>
        </div>

        {/* قائمة المؤهلات التعليمية */}
        {education.length === 0 ? (
          <div className="text-center py-20">
            <GraduationCap className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No education data available.</p>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-6">
            {education.map((edu, index) => (
              <div
                key={edu.id || index}
                data-aos="fade-up"
                data-aos-delay={index * 100}
                className="group relative"
              >
                <div className="relative bg-white/5 backdrop-blur-xl rounded-2xl p-6 md:p-8 border border-white/10 hover:border-blue-500/50 transition-all duration-500 group-hover:scale-[1.02]">
                  
                  {/* شريط جانبي ملون */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-l-2xl opacity-0 group-hover:opacity-100 transition-opacity" />

                  <div className="flex flex-col md:flex-row gap-6">
                    
                    {/* أيقونة المؤهل */}
                    <div className="relative">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <GraduationCap className="w-8 h-8 text-blue-400" />
                      </div>
                    </div>

                    {/* محتوى المؤهل */}
                    <div className="flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                        <div>
                          <h3 className="text-2xl font-bold text-white group-hover:text-blue-400 transition">
                            {edu.degree}
                          </h3>
                          
                          <div className="flex items-center gap-3 mt-2">
                            <div className="flex items-center gap-1 text-gray-400">
                              <School className="w-4 h-4" />
                              <span className="text-sm">{edu.field_of_study}</span>
                            </div>
                            
                            {edu.location && (
                              <div className="flex items-center gap-1 text-gray-400">
                                <MapPin className="w-4 h-4" />
                                <span className="text-sm">{edu.location}</span>
                              </div>
                            )}
                          </div>

                          <p className="text-gray-300 text-sm mt-1">
                            {edu.institution}
                          </p>
                        </div>

                        {/* فترة الدراسة */}
                        <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/10">
                          <Calendar className="w-4 h-4 text-blue-400" />
                          <span className="text-sm text-gray-300">
                            {formatDate(edu.start_date)}
                          </span>
                          <ChevronRight className="w-3 h-3 text-gray-500" />
                          <span className="text-sm text-gray-300">
                            {edu.is_current ? 'Present' : formatDate(edu.end_date)}
                          </span>
                        </div>
                      </div>

                      {/* التقدير والأنشطة في صف واحد */}
                      <div className="flex flex-wrap gap-4 mt-2">
                        {edu.grade && (
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-lg border border-yellow-500/20">
                            <Award className="w-4 h-4 text-yellow-400" />
                            <span className="text-xs text-yellow-400">Grade: {edu.grade}</span>
                          </div>
                        )}
                        
                        {edu.activities && (
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/20">
                            <Star className="w-4 h-4 text-purple-400" />
                            <span className="text-xs text-purple-400">Activities</span>
                          </div>
                        )}
                      </div>

                      {/* الوصف */}
                      {edu.description && (
                        <p className="text-gray-300 leading-relaxed mt-6">
                          {edu.description}
                        </p>
                      )}

                      {/* الأنشطة التفصيلية (إذا كانت موجودة كنص منفصل) */}
                      {edu.activities && edu.activities !== 'true' && (
                        <div className="mt-4 p-4 bg-white/5 rounded-xl border border-white/10">
                          <h4 className="text-white text-sm font-semibold mb-2 flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-blue-400" />
                            Activities & Societies
                          </h4>
                          <p className="text-gray-400 text-sm">
                            {edu.activities}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}

export default EducationPage
