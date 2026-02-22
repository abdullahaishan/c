import React, { useEffect, useState } from "react"
import { useDeveloper } from '../context/DeveloperContext'
import CardProject from "../components/CardProject"
import TechStackIcon from "../components/TechStackIcon"
import Certificate from "../components/Certificate"
import { Code, Award, Boxes } from "lucide-react"
import AOS from "aos"
import "aos/dist/aos.css"

// أيقونات التقنيات (من المجلد public/icons)
const techIcons = [
  { icon: "/icons/html.svg", name: "HTML" },
  { icon: "/icons/css.svg", name: "CSS" },
  { icon: "/icons/javascript.svg", name: "JavaScript" },
  { icon: "/icons/tailwind.svg", name: "Tailwind CSS" },
  { icon: "/icons/reactjs.svg", name: "ReactJS" },
  { icon: "/icons/vite.svg", name: "Vite" },
  { icon: "/icons/nodejs.svg", name: "Node JS" },
  { icon: "/icons/bootstrap.svg", name: "Bootstrap" },
  { icon: "/icons/firebase.svg", name: "Firebase" },
  { icon: "/icons/MUI.svg", name: "Material UI" },
  { icon: "/icons/vercel.svg", name: "Vercel" },
  { icon: "/icons/SweetAlert.svg", name: "SweetAlert2" },
]

const Portofolio = () => {
  const { developer, loading } = useDeveloper()
  const [activeTab, setActiveTab] = useState(0)
  const [showAllProjects, setShowAllProjects] = useState(false)
  const [showAllCerts, setShowAllCerts] = useState(false)

  // مشاريع المطور
  const projects = developer?.projects || []
  const certificates = developer?.certificates || []
  const skills = developer?.skills || []

  // عدد العناصر في العرض الأول
  const initialItems = window.innerWidth < 768 ? 4 : 6
  const displayedProjects = showAllProjects ? projects : projects.slice(0, initialItems)
  const displayedCerts = showAllCerts ? certificates : certificates.slice(0, initialItems)

  useEffect(() => {
    AOS.init({ once: false })
  }, [])

  if (loading) {
    return <LoadingScreen />
  }

  return (
    <div className="md:px-[10%] px-[5%] w-full bg-[#030014] overflow-hidden" id="Portofolio">
      {/* Header */}
      <div className="text-center pb-10" data-aos="fade-up">
        <h2 className="inline-block text-3xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#6366f1] to-[#a855f7]">
          Portfolio Showcase
        </h2>
        <p className="text-slate-400 max-w-2xl mx-auto text-sm md:text-base mt-2">
          {developer?.bio?.substring(0, 100) || "Explore my journey through projects, certifications, and technical expertise."}
        </p>
      </div>

      {/* Tabs */}
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

      {/* محتوى التبويبات */}
      <div className="mt-8">
        {/* تبويب المشاريع */}
        {activeTab === 0 && (
          <div>
            {projects.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400">لا توجد مشاريع بعد</p>
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

        {/* تبويب الشهادات */}
        {activeTab === 1 && (
          <div>
            {certificates.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400">لا توجد شهادات بعد</p>
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

        {/* تبويب التقنيات */}
        {activeTab === 2 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {skills.length > 0 ? (
              // عرض مهارات المطور إذا وجدت
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
              // عرض الأيقونات الافتراضية
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

export default Portofolio