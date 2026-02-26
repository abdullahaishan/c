import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useDeveloper } from '../context/DeveloperContext';
import CardProject from "../components/CardProject";
import TechStackIcon from "../components/TechStackIcon";
import Certificate from "../components/Certificate";
import { Code, Award, Boxes, Filter, X } from "lucide-react";
import AOS from "aos";
import "aos/dist/aos.css";
import LoadingScreen from "../components/LoadingScreen";

// أيقونات التقنيات (من المجلد public/icons)
const techIcons = [
  { icon: "/icons/html.svg", name: "HTML" },
  { icon: "/icons/css.svg", name: "CSS" },
  { icon: "/icons/javascript.svg", name: "JavaScript" },
  { icon: "/icons/tailwind.svg", name: "Tailwind CSS" },
  { icon: "/icons/reactjs.svg", name: "ReactJS" },
  { icon: "/icons/nodejs.svg", name: "Node JS" },
  { icon: "/icons/python.svg", name: "Python" },
  { icon: "/icons/django.svg", name: "Django" },
  { icon: "/icons/firebase.svg", name: "Firebase" },
  { icon: "/icons/github.svg", name: "GitHub" },
  { icon: "/icons/vercel.svg", name: "Vercel" },
  { icon: "/icons/figma.svg", name: "Figma" },
];

// مكون زر التبديل (Show More/Less)
const ToggleButton = ({ onClick, isShowingMore, count }) => (
  <button
    onClick={onClick}
    className="px-4 py-2 bg-white/5 text-gray-300 rounded-lg hover:bg-white/10 transition-all flex items-center gap-2 mx-auto"
  >
    <span>{isShowingMore ? 'Show Less' : `Show All (${count})`}</span>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={`transition-transform duration-300 ${isShowingMore ? 'rotate-180' : ''}`}
    >
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
  </button>
);

// مكون فلترة المشاريع
const FilterBar = ({ categories, selectedCategory, onSelectCategory }) => {
  if (categories.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 justify-center mb-8">
      <button
        onClick={() => onSelectCategory('all')}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
          selectedCategory === 'all'
            ? 'bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white'
            : 'bg-white/5 text-gray-400 hover:bg-white/10'
        }`}
      >
        All Projects
      </button>
      {categories.map(cat => (
        <button
          key={cat}
          onClick={() => onSelectCategory(cat)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            selectedCategory === cat
              ? 'bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white'
              : 'bg-white/5 text-gray-400 hover:bg-white/10'
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
};

const Portfolio = ({ developer: propDeveloper }) => {
  const context = useDeveloper();
  const developer = propDeveloper || context.publicDeveloper;
  const { getProjects, getCertificates, getSkills, loading, isFreePlan } = context;

  const [activeTab, setActiveTab] = useState(0);
  const [showAllProjects, setShowAllProjects] = useState(false);
  const [showAllCertificates, setShowAllCertificates] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [initialItems, setInitialItems] = useState(6);

  const projects = getProjects();
  const certificates = getCertificates();
  const skills = getSkills();

  // استخراج التصنيفات الفريدة من المشاريع
  const categories = useMemo(() => {
    const cats = new Set();
    projects.forEach(p => {
      if (p.category) cats.add(p.category);
    });
    return Array.from(cats);
  }, [projects]);

  // فلترة المشاريح حسب التصنيف
  const filteredProjects = useMemo(() => {
    if (selectedCategory === 'all') return projects;
    return projects.filter(p => p.category === selectedCategory);
  }, [projects, selectedCategory]);

  // تحديد عدد العناصر حسب حجم الشاشة
  useEffect(() => {
    const handleResize = () => {
      setInitialItems(window.innerWidth < 768 ? 4 : 6);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const displayedProjects = showAllProjects ? filteredProjects : filteredProjects.slice(0, initialItems);
  const displayedCertificates = showAllCertificates ? certificates : certificates.slice(0, initialItems);

  useEffect(() => {
    AOS.init({ once: false });
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="relative min-h-screen bg-[#030014] overflow-hidden" id="Portfolio">
      <div className="container mx-auto px-[5%] py-20">
        {/* Header */}
        <div className="text-center mb-12" data-aos="fade-up">
          <h2 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#6366f1] to-[#a855f7] mb-4">
            Portfolio Showcase
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Explore my journey through projects, certifications, and technical expertise.
            Each section represents a milestone in my continuous learning path.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center gap-4 mb-8" data-aos="fade-up">
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
          {/* Projects Tab */}
          {activeTab === 0 && (
            <div>
              {/* Filter Bar - فقط إذا كان هناك تصنيفات */}
              {categories.length > 0 && (
                <FilterBar
                  categories={categories}
                  selectedCategory={selectedCategory}
                  onSelectCategory={setSelectedCategory}
                />
              )}

              {filteredProjects.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-400">No projects yet</p>
                </div>
              ) : (
                <>
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
                  
                  {filteredProjects.length > initialItems && (
                    <div className="mt-8">
                      <ToggleButton
                        onClick={() => setShowAllProjects(!showAllProjects)}
                        isShowingMore={showAllProjects}
                        count={filteredProjects.length}
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Certificates Tab */}
          {activeTab === 1 && (
            <div>
              {certificates.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-400">No certificates yet</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {displayedCertificates.map((cert, index) => (
                      <div
                        key={cert.id}
                        data-aos="fade-up"
                        data-aos-delay={index * 100}
                      >
                        <Certificate ImgSertif={cert.image || "/default-cert.jpg"} />
                      </div>
                    ))}
                  </div>
                  
                  {certificates.length > initialItems && (
                    <div className="mt-8">
                      <ToggleButton
                        onClick={() => setShowAllCertificates(!showAllCertificates)}
                        isShowingMore={showAllCertificates}
                        count={certificates.length}
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Tech Stack Tab */}
          {activeTab === 2 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
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

        {/* Free Plan Notice */}
        {isFreePlan && (
          <div className="mt-8 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-center">
            <p className="text-yellow-400 text-sm">
              ✨ You're on the Free Plan - Upgrade to showcase more projects
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Portfolio;
