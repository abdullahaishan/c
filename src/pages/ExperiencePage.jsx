import React, { useEffect } from 'react'
import { Briefcase } from 'lucide-react'
import AOS from 'aos'
import 'aos/dist/aos.css'
import { useDeveloper } from '../context/DeveloperContext'

const ExperiencePage = () => {
  const { getExperience, getTotalExperienceYears } = useDeveloper()
  const experience = getExperience() || []

  useEffect(() => {
    AOS.init({ once: true })
  }, [])

  return (
    <div className="min-h-screen bg-[#030014] py-20 px-6">
      <div className="max-w-5xl mx-auto">

        <div className="text-center mb-12" data-aos="fade-up">
          <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#6366f1] to-[#a855f7]">
            Experience
          </h2>
          <p className="text-gray-400 mt-3">
            {getTotalExperienceYears()}+ Years Professional Experience
          </p>
        </div>

        {experience.length === 0 ? (
          <div className="text-center text-gray-500">
            No experience data available.
          </div>
        ) : (
          <div className="space-y-8">
            {experience.map((exp, index) => (
              <div
                key={exp.id || index}
                data-aos="fade-up"
                data-aos-delay={index * 100}
                className="bg-white/5 p-6 rounded-2xl border border-white/10 hover:border-[#6366f1]/30 transition-all"
              >
                <div className="flex items-start gap-4">
                  <Briefcase className="text-[#a855f7] w-6 h-6 mt-1" />
                  
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-white">
                      {exp.job_title || exp.position}
                    </h3>

                    <p className="text-purple-300 text-sm">
                      {exp.company || exp.company_name}
                    </p>

                    <p className="text-gray-400 text-xs mt-1">
                      {exp.start_date
                        ? new Date(exp.start_date).toLocaleDateString()
                        : ''}
                      {" - "}
                      {exp.is_current
                        ? "Present"
                        : exp.end_date
                        ? new Date(exp.end_date).toLocaleDateString()
                        : ""}
                    </p>

                    {exp.description && (
                      <p className="text-gray-300 mt-4 leading-relaxed">
                        {exp.description}
                      </p>
                    )}

                    {exp.technologies?.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-4">
                        {exp.technologies.map((tech, i) => (
                          <span
                            key={i}
                            className="px-3 py-1 text-xs bg-[#6366f1]/10 text-[#6366f1] rounded-full"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
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

export default ExperiencePage
