import { useDeveloper } from '../context/DeveloperContext'

const ExperienceSection = () => {

  const { experience, getTotalExperienceYears } = useDeveloper()

  if (!experience || experience.length === 0) return null

  return (
    <section className="py-20 px-6 max-w-5xl mx-auto">

      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold">
          Professional Experience
        </h2>
        <p className="text-gray-400 mt-2">
          {getTotalExperienceYears()}+ Years Experience
        </p>
      </div>

      <div className="space-y-10">

        {experience.map((exp) => (
          <div key={exp.id} className="bg-gray-900 p-6 rounded-xl">

            <h3 className="text-xl font-semibold">
              {exp.position}
            </h3>

            <p className="text-blue-400">
              {exp.company_name}
            </p>

            <p className="text-gray-500 text-sm mb-3">
              {exp.start_date} – {exp.is_current ? 'Present' : exp.end_date}
            </p>

            <p className="text-gray-300">
              {exp.description}
            </p>

          </div>
        ))}

      </div>
    </section>
  )
}

export default ExperienceSection
