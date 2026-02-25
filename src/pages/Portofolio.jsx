import React, { useEffect, useState } from "react"
import { useDeveloper } from '../context/DeveloperContext'
import CardProject from "../components/CardProject"
import TechStackIcon from "../components/TechStackIcon"
import Certificate from "../components/Certificate"
import { Code, Award, Boxes, ExternalLink, Github } from "lucide-react"
import AOS from "aos"
import "aos/dist/aos.css"
import LoadingScreen from "../components/LoadingScreen"

// مكون العلامة المائية
const Watermark = () => (
  <div className="fixed inset-0 pointer-events-none select-none flex items-center justify-center opacity-[0.03] text-8xl font-bold text-white rotate-[-30deg] scale-150 uppercase tracking-wider">
    Portfolio-v5
  </div>
)

const techIcons = [
  { icon: "../../public/icons/html.svg", name: "HTML" },
  { icon: "../../public/icons/css.svg", name: "CSS" },
  { icon: "../../public/icons/javascript.svg", name: "JavaScript" },
  { icon: "../../public/icons/tailwind.svg", name: "Tailwind CSS" },
  { icon: "../../public/icons/reactjs.svg", name: "ReactJS" },
  { icon: "../../public/icons/nodejs.svg", name: "Node JS" },
  { icon: "../../public/icons/python.svg", name: "Python" },
  { icon: "../../public/icons/django.svg", name: "Django" },
]

const Portfolio = ({ developer: propDeveloper }) => {
  const context = useDeveloper()
  const developer = propDeveloper || context.publicDeveloper
  const { loading } = context
  
  const [activeTab, setActiveTab] = useState(0)
  const [showAllProjects, setShowAllProjects] = useState(false)
  const [showAllCerts, setShowAllCerts] = useState(false)

  const projects = developer?.projects || []
  const certificates = developer?.certificates || []
  const skills = developer?.skills || []

  const [initialItems, setInitialItems] = useState(6)

  useEffect(() => {
    const handleResize = () => {
      setInitialItems(window.innerWidth < 768 ? 4 : 6)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const displayedProjects = showAllProjects ? projects : projects.slice(0, initialItems)
  const displayedCerts = showAllCerts ? certificates : certificates.slice(0, initialItems)

  useEffect(() => {
    AOS.init({ once: false })
  }, [])

  if (loading) {
    return <LoadingScreen />
  }

  return (
    <div className="md:px-[10%] px-[5%] w-full bg-[#030014] overflow-hidden relative" id="Portfolio">
      <Watermark />
      
      <div className="text-center pb-10" data-aos="fade-up">
        <h2 className="inline-block text-3xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#6366f1] to-[#a855f7]">
          Portfolio Showcase
        </h2>
        <p className="text-slate-400 max-w-2xl mx-auto text-sm md:text-base mt-2">
          Explore my journey through projects, certifications, and technical expertise.
        </p>
      </div>

      <div className="flex justify-center gap-4 mb-8">
        <button
          onClick={() => setActiveTab(0)}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all ${
            activeTab === 0
              ? 'bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white'
              : 'bg-white/5 text-gray-400 hover:bg-white/10'
          }`}
        >
          <Code className="w-5 h-5" />
          <span>Projects ({projects.length})</span>
        </button>
        <button
          onClick={() => setActiveTab(1)}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all ${
            activeTab === 1
              ? 'bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white'
              : 'bg-white/5 text-gray-400 hover:bg-white/10'
          }`}
        >
          <Award className="w-5 h-5" />
          <span>Certificates ({certificates.length})</span>
        </button>
        <button
          onClick={() => setActiveTab(2)}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all ${
            activeTab === 2
              ? 'bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white'
              : 'bg-white/5 text-gray-400 hover:bg-white/10'
          }`}
        >
          <Boxes className="w-5 h-5" />
          <span>Tech Stack ({skills.length || techIcons.length})</span>
        </button>
      </div>

      <div className="mt-8">
        {activeTab === 0 && (
          <div>
            {projects.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400">No projects yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayedProjects.map((project, index) => (
                  <div
                    key={project.id}
                    data-aos="fade-up"
                    data-aos-delay={index * 100}
                  >
                    <CardProject
                      Img={project.image || "/default-project.jpg"}
                      Title={project.title}
                      Description={project.description}
                      Link={project.live_url}
                      Github={project.github_url}
                      id={project.id}
                    />
                  </div>
                ))}
              </div>
            )}
            {projects.length > initialItems && (
              <button
                onClick={() => setShowAllProjects(!showAllProjects)}
                className="mt-6 px-4 py-2 bg-white/5 text-gray-300 rounded-lg hover:bg-white/10 transition-all"
              >
                {showAllProjects ? 'Show Less' : `Show All (${projects.length})`}
              </button>
            )}
          </div>
        )}

        {activeTab === 1 && (
          <div>
            {certificates.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400">No certificates yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {displayedCerts.map((cert, index) => (
                  <div
                    key={cert.id}
                    data-aos="fade-up"
                    data-aos-delay={index * 100}
                  >
                    <Certificate ImgSertif={cert.image || "/default-cert.jpg"} />
                  </div>
                ))}
              </div>
            )}
            {certificates.length > initialItems && (
              <button
                onClick={() => setShowAllCerts(!showAllCerts)}
                className="mt-6 px-4 py-2 bg-white/5 text-gray-300 rounded-lg hover:bg-white/10 transition-all"
              >
                {showAllCerts ? 'Show Less' : `Show All (${certificates.length})`}
              </button>
            )}
          </div>
        )}

        {activeTab === 2 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {skills.length > 0 ? (
              skills.map((skill, index) => (
                <div
                  key={skill.id}
                  data-aos="fade-up"
                  data-aos-delay={index * 50}
                >
                  <TechStackIcon
                    TechStackIcon={`/icons/${skill.icon || 'reactjs.svg'}`}
                    Language={skill.name}
                  />
                </div>
              ))
            ) : (
              techIcons.map((tech, index) => (
                <div
                  key={index}
                  data-aos="fade-up"
                  data-aos-delay={index * 50}
                >
                  <TechStackIcon
                    TechStackIcon={tech.icon}
                    Language={tech.name}
                  />
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Portfolio
