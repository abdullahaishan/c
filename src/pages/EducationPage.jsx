import React, { useEffect } from 'react'
import { GraduationCap } from 'lucide-react'
import AOS from 'aos'
import 'aos/dist/aos.css'
import { useDeveloper } from '../context/DeveloperContext'

const EducationPage = () => {
  const { getEducation } = useDeveloper()
  const education = getEducation() || []

  useEffect(() => {
    AOS.init({ once: true })
  }, [])

  return (
    <div className="min-h-screen bg-[#030014] py-20 px-6">
      <div className="max-w-5xl mx-auto">

        <div className="text-center mb-12" data-aos="fade-up">
          <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#6366f1] to-[#a855f7]">
            Education
          </h2>
          <p className="text-gray-400 mt-3">
            Academic Background & Qualifications
          </p>
        </div>

        {education.length === 0 ? (
          <div className="text-center text-gray-500">
            No education data available.
          </div>
        ) : (
          <div className="space-y-8">
            {education.map((edu, index) => (
              <div
                key={edu.id || index}
                data-aos="fade-up"
                data-aos-delay={index * 100}
                className="bg-white/5 p-6 rounded-2xl border border-white/10 hover:border-[#6366f1]/30 transition-all"
              >
                <div className="flex items-start gap-4">

                  <GraduationCap className="text-[#a855f7] w-6 h-6 mt-1" />

                  <div className="flex-1">

                    <h3 className="text-xl font-semibold text-white">
                      {edu.degree}
                    </h3>

                    <p className="text-purple-300 text-sm">
                      {edu.field_of_study}
                    </p>

                    <p className="text-gray-400 text-sm mt-1">
                      {edu.institution}
                      {edu.location && ` • ${edu.location}`}
                    </p>

                    <p className="text-gray-500 text-xs mt-1">
                      {edu.start_date
                        ? new Date(edu.start_date).toLocaleDateString()
                        : ''}
                      {" - "}
                      {edu.is_current
                        ? "Present"
                        : edu.end_date
                        ? new Date(edu.end_date).toLocaleDateString()
                        : ""}
                    </p>

                    {edu.grade && (
                      <p className="text-blue-300 text-xs mt-2">
                        Grade: {edu.grade}
                      </p>
                    )}

                    {edu.description && (
                      <p className="text-gray-300 mt-4 leading-relaxed">
                        {edu.description}
                      </p>
                    )}

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
