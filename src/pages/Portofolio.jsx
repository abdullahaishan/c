import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useDeveloper } from '../context/DeveloperContext';
import CardProject from "../components/CardProject";
import TechStackIcon from "../components/TechStackIcon";
import Certificate from "../components/Certificate";
import { Code, Award, Boxes } from "lucide-react";
import AOS from "aos";
import "aos/dist/aos.css";

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
];

// Separate ShowMore/ShowLess button component
const ToggleButton = ({ onClick, isShowingMore }) => (
  <button
    onClick={onClick}
    className="
      px-3 py-1.5
      text-slate-300 
      hover:text-white 
      text-sm 
      font-medium 
      transition-all 
      duration-300 
      ease-in-out
      flex 
      items-center 
      gap-2
      bg-white/5 
      hover:bg-white/10
      rounded-md
      border 
      border-white/10
      hover:border-white/20
      backdrop-blur-sm
      group
      relative
      overflow-hidden
    "
  >
    <span className="relative z-10 flex items-center gap-2">
      {isShowingMore ? "See Less" : "See More"}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`
          transition-transform 
          duration-300 
          ${isShowingMore ? "group-hover:-translate-y-0.5" : "group-hover:translate-y-0.5"}
        `}
      >
        <polyline points={isShowingMore ? "18 15 12 9 6 15" : "6 9 12 15 18 9"}></polyline>
      </svg>
    </span>
    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-purple-500/50 transition-all duration-300 group-hover:w-full"></span>
  </button>
);

const Portfolio = ({ developer: propDeveloper }) => {
  const context = useDeveloper();
  const developer = propDeveloper || context.publicDeveloper;
  const { getProjects, getCertificates, getSkills, loading } = context;

  const [showAllProjects, setShowAllProjects] = useState(false);
  const [showAllCertificates, setShowAllCertificates] = useState(false);
  const [value, setValue] = useState(0);
  
  const projects = getProjects();
  const certificates = getCertificates();
  const skills = getSkills();

  // عدد العناصر في العرض الأول
  const initialItems = window.innerWidth < 768 ? 4 : 6;

  const displayedProjects = showAllProjects ? projects : projects.slice(0, initialItems);
  const displayedCertificates = showAllCertificates ? certificates : certificates.slice(0, initialItems);

  useEffect(() => {
    AOS.init({ once: false });
  }, []);

  const toggleShowMore = useCallback((type) => {
    if (type === 'projects') {
      setShowAllProjects(prev => !prev);
    } else {
      setShowAllCertificates(prev => !prev);
    }
  }, []);

  return (
    <div className="md:px-[10%] px-[5%] w-full sm:mt-0 mt-[3rem] bg-[#030014] overflow-hidden" id="Portofolio">
      {/* Header */}
      <div className="text-center pb-10" data-aos="fade-up" data-aos-duration="1000">
        <h2 className="inline-block text-3xl md:text-5xl font-bold text-center mx-auto text-transparent bg-clip-text bg-gradient-to-r from-[#6366f1] to-[#a855f7]">
          <span style={{
            color: '#6366f1',
            backgroundImage: 'linear-gradient(45deg, #6366f1 10%, #a855f7 93%)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Portfolio Showcase
          </span>
        </h2>
        <p className="text-slate-400 max-w-2xl mx-auto text-sm md:text-base mt-2">
          Explore my journey through projects, certifications, and technical expertise. 
          Each section represents a milestone in my continuous learning path.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center gap-4 mb-8">
        <button
          onClick={() => setValue(0)}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all ${
            value === 0
              ? 'bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white'
              : 'bg-white/5 text-gray-400 hover:bg-white/10'
          }`}
        >
          <Code className="w-5 h-5" />
          <span>Projects ({projects.length})</span>
        </button>
        <button
          onClick={() => setValue(1)}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all ${
            value === 1
              ? 'bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white'
              : 'bg-white/5 text-gray-400 hover:bg-white/10'
          }`}
        >
          <Award className="w-5 h-5" />
          <span>Certificates ({certificates.length})</span>
        </button>
        <button
          onClick={() => setValue(2)}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all ${
            value === 2
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
        {/* Projects Tab */}
        {value === 0 && (
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
                    data-aos={index % 3 === 0 ? "fade-up-right" : index % 3 === 1 ? "fade-up" : "fade-up-left"}
                    data-aos-duration={index % 3 === 0 ? "1000" : index % 3 === 1 ? "1200" : "1000"}
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
              <div className="mt-6 w-full flex justify-start">
                <ToggleButton
                  onClick={() => toggleShowMore('projects')}
                  isShowingMore={showAllProjects}
                />
              </div>
            )}
          </div>
        )}

        {/* Certificates Tab */}
        {value === 1 && (
          <div>
            {certificates.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400">No certificates yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {displayedCertificates.map((cert, index) => (
                  <div
                    key={cert.id}
                    data-aos={index % 3 === 0 ? "fade-up-right" : index % 3 === 1 ? "fade-up" : "fade-up-left"}
                    data-aos-duration={index % 3 === 0 ? "1000" : index % 3 === 1 ? "1200" : "1000"}
                  >
                    <Certificate ImgSertif={cert.image || "/default-cert.jpg"} />
                  </div>
                ))}
              </div>
            )}
            {certificates.length > initialItems && (
              <div className="mt-6 w-full flex justify-start">
                <ToggleButton
                  onClick={() => toggleShowMore('certificates')}
                  isShowingMore={showAllCertificates}
                />
              </div>
            )}
          </div>
        )}

        {/* Tech Stack Tab */}
        {value === 2 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 pb-[5%]">
            {skills.length > 0 ? (
              skills.map((skill, index) => (
                <div
                  key={skill.id}
                  data-aos={index % 3 === 0 ? "fade-up-right" : index % 3 === 1 ? "fade-up" : "fade-up-left"}
                  data-aos-duration={index % 3 === 0 ? "1000" : index % 3 === 1 ? "1200" : "1000"}
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
                  data-aos={index % 3 === 0 ? "fade-up-right" : index % 3 === 1 ? "fade-up" : "fade-up-left"}
                  data-aos-duration={index % 3 === 0 ? "1000" : index % 3 === 1 ? "1200" : "1000"}
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
  );
};

export default Portfolio;
