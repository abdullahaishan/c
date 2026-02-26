// src/components/ExperienceSection.jsx
import React from 'react'
import { useDeveloper } from '../context/DeveloperContext'

const ExperienceSection = () => {
  const { getExperience, getTotalExperienceYears } = useDeveloper()
  const experience = getExperience()

  if (!experience || experience.length === 0) return null

  return (
    <section className="py-16 px-6 max-w-5xl mx-auto" id="Experience">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white">Professional Experience</h2>
        <p className="text-gray-400 mt-2">{getTotalExperienceYears()} years experience</p>
      </div>

      <div className="space-y-6">
        {experience.map(exp => (
          <div key={exp.id} className="bg-white/5 p-6 rounded-xl border border-white/10">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-semibold text-white">{exp.job_title || exp.position || 'Job Title'}</h3>
                <p className="text-sm text-purple-300">{exp.company || exp.company_name || ''}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {exp.start_date ? new Date(exp.start_date).toLocaleDateString() : ''} — {exp.is_current ? 'Present' : (exp.end_date ? new Date(exp.end_date).toLocaleDateString() : '')}
                </p>
              </div>
            </div>

            {exp.description && (
              <p className="text-gray-300 mt-4">{exp.description}</p>
            )}

            {exp.technologies && exp.technologies.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {exp.technologies.map((t, i) => (
                  <span key={i} className="px-2 py-1 text-xs bg-[#6366f1]/10 text-[#6366f1] rounded">{t}</span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}

export default ExperienceSection
