import React, { useEffect, useState, useMemo } from "react";
import { useDeveloper } from '../context/DeveloperContext';
import { projectService } from '../lib/supabase';
import CardProject from "../components/CardProject";
import TechStackIcon from "../components/TechStackIcon";
import Certificate from "../components/Certificate";
import { Code, Award, Boxes, Filter, X, Globe, Server, Database, Cloud, Cpu, Smartphone, Palette, Loader } from "lucide-react";
import AOS from "aos";
import "aos/dist/aos.css";
import LoadingScreen from "../components/LoadingScreen";

// أيقونات التقنيات الافتراضية (من CDN)
const getTechIconUrl = (techName) => {
  const icons = {
    // Frontend
    'React': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg',
    'JavaScript': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg',
    'TypeScript': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg',
    'HTML': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg',
    'CSS': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg',
    'Tailwind': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-plain.svg',
    'Vue': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vuejs/vuejs-original.svg',
    'Angular': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/angularjs/angularjs-original.svg',
    
    // Backend
    'Node.js': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg',
    'Python': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg',
    'PHP': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/php/php-original.svg',
    'Java': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg',
    'Go': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/go/go-original.svg',
    'Ruby': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/ruby/ruby-original.svg',
    
    // Databases
    'MySQL': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg',
    'PostgreSQL': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg',
    'MongoDB': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg',
    'Firebase': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/firebase/firebase-plain.svg',
    'Redis': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redis/redis-original.svg',
    
    // Cloud & DevOps
    'AWS': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/amazonwebservices/amazonwebservices-original.svg',
    'Docker': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg',
    'Kubernetes': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kubernetes/kubernetes-plain.svg',
    'Git': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg',
    'GitHub': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg',
    
    // Mobile
    'Flutter': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/flutter/flutter-original.svg',
    'Dart': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/dart/dart-original.svg',
    'Swift': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/swift/swift-original.svg',
    'Kotlin': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kotlin/kotlin-original.svg',
    
    // Tools
    'Figma': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/figma/figma-original.svg',
    'VSCode': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vscode/vscode-original.svg',
    'Postman': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postman/postman-original.svg',
  };
  
  return icons[techName] || null;
};

// مكون أيقونة المهارة مع دعم الأيقونات من الإنترنت
const SkillIcon = ({ skill }) => {
  const [iconError, setIconError] = useState(false);
  const [useDefault, setUseDefault] = useState(!skill.icon);
  
  // محاولة جلب الأيقونة من الإنترنت
  const onlineIconUrl = getTechIconUrl(skill.name);
  
  // تحديد الأيقونة المناسبة حسب التصنيف إذا فشل كل شيء
  const getDefaultIcon = () => {
    const category = skill.category?.toLowerCase() || '';
    if (category.includes('frontend')) return <Palette className="w-8 h-8 text-blue-400" />;
    if (category.includes('backend')) return <Server className="w-8 h-8 text-green-400" />;
    if (category.includes('database')) return <Database className="w-8 h-8 text-yellow-400" />;
    if (category.includes('cloud')) return <Cloud className="w-8 h-8 text-purple-400" />;
    if (category.includes('mobile')) return <Smartphone className="w-8 h-8 text-orange-400" />;
    return <Code className="w-8 h-8 text-gray-400" />;
  };

  // إذا كان لدينا أيقونة من الإنترنت ولم تفشل
  if (onlineIconUrl && !iconError && !useDefault) {
    return (
      <div className="w-10 h-10 flex items-center justify-center">
        <img
          src={onlineIconUrl}
          alt={skill.name}
          className="w-8 h-8 object-contain"
          onError={() => setIconError(true)}
        />
      </div>
    );
  }

  // إذا كان لدينا أيقونة محلية ولم تفشل
  if (skill.icon && !iconError && !useDefault) {
    return (
      <div className="w-10 h-10 flex items-center justify-center">
        <img
          src={`/icons/${skill.icon}`}
          alt={skill.name}
          className="w-8 h-8 object-contain"
          onError={() => setIconError(true)}
        />
      </div>
    );
  }

  // أيقونة افتراضية حسب التصنيف
  return (
    <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${
      skill.color || 'from-blue-500 to-purple-500'
    } flex items-center justify-center`}>
      {getDefaultIcon()}
    </div>
  );
};

// مكون بطاقة المهارة المحسنة
const SkillCard = ({ skill }) => {
  const [expanded, setExpanded] = useState(false);
  
  // تحديد لون شريط التقدم حسب النسبة
  const getProgressColor = (level) => {
    if (level >= 80) return 'from-green-500 to-emerald-500';
    if (level >= 60) return 'from-blue-500 to-cyan-500';
    if (level >= 40) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-rose-500';
  };

  return (
    <div 
      className="bg-white/5 rounded-xl p-4 border border-white/10 hover:border-[#6366f1]/50 transition-all group cursor-pointer"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-start gap-3">
        {/* أيقونة المهارة */}
        <SkillIcon skill={skill} />
        
        <div className="flex-1">
          {/* اسم المهارة والتصنيف */}
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-white font-semibold">{skill.name}</h4>
            <span className="text-xs px-2 py-0.5 bg-white/10 rounded-full text-gray-300">
              {skill.category || 'Other'}
            </span>
          </div>
          
          {/* شريط المستوى المحسن */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Proficiency</span>
              <span className="text-[#a855f7] font-medium">{skill.proficiency || 0}%</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${getProgressColor(skill.proficiency || 0)} transition-all duration-500`}
                style={{ width: `${skill.proficiency || 0}%` }}
              />
            </div>
          </div>
          
          {/* وصف المهارة (إذا وجد) - يظهر عند التوسيع */}
          {expanded && skill.description && (
            <p className="mt-3 text-sm text-gray-400 border-t border-white/10 pt-2">
              {skill.description}
            </p>
          )}
          
          {/* سنوات الخبرة (إذا وجدت) */}
          {skill.years_of_experience > 0 && (
            <div className="mt-2 text-xs text-gray-500">
              {skill.years_of_experience}+ years experience
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// مكون مجموعة المهارات حسب التصنيف
const SkillCategory = ({ title, skills, icon: Icon, color }) => {
  if (skills.length === 0) return null;
  
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${color} flex items-center justify-center`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
        <h3 className="text-xl font-semibold text-white">{title}</h3>
        <span className="text-sm text-gray-400 ml-auto">{skills.length} skills</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {skills.map((skill) => (
          <SkillCard key={skill.id} skill={skill} />
        ))}
      </div>
    </div>
  );
};

// مكون بطاقة الشهادة المحسنة
const EnhancedCertificate = ({ certificate }) => {
  const [imageError, setImageError] = useState(false);
  
  return (
    <div className="group relative bg-white/5 rounded-xl overflow-hidden border border-white/10 hover:border-[#6366f1]/50 transition-all">
      <div className="relative aspect-[4/3] overflow-hidden">
        {/* صورة الشهادة */}
        {!imageError && certificate.image ? (
          <img
            src={certificate.image}
            alt={certificate.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#6366f1]/20 to-[#a855f7]/20 flex items-center justify-center">
            <Award className="w-12 h-12 text-gray-500" />
          </div>
        )}
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
          <div>
            <h4 className="text-white font-semibold">{certificate.name}</h4>
            {certificate.issuer && (
              <p className="text-sm text-gray-300">{certificate.issuer}</p>
            )}
            {certificate.issue_date && (
              <p className="text-xs text-gray-400 mt-1">
                {new Date(certificate.issue_date).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'short' 
                })}
              </p>
            )}
          </div>
        </div>
        
        {/* شارة الجهة المانحة */}
        {certificate.issuer && (
          <div className="absolute top-2 right-2 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-lg text-xs text-white">
            {certificate.issuer}
          </div>
        )}
      </div>
      
      {/* رابط الشهادة (إذا وجد) */}
      {certificate.credential_url && (
        <a
          href={certificate.credential_url}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute inset-0"
          aria-label="View certificate"
        />
      )}
    </div>
  );
};

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

// مكون زر التبديل
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

const Portfolio = ({ developer: propDeveloper }) => {
  const context = useDeveloper();
  const developer = propDeveloper || context.publicDeveloper;
  const { loading: contextLoading, isFreePlan } = context;

  // ✅ دالة واحدة تجلب كل المحتوى
  const [content, setContent] = useState({
    projects: [],
    certificates: [],
    skills: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!developer?.id) return;

    const loadAllContent = async () => {
      try {
        setLoading(true);
        const data = await projectService.getDeveloperContent(developer.id);
        setContent(data);
      } catch (error) {
        console.error('Error loading portfolio content:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAllContent();
  }, [developer?.id]);

  const { projects, certificates, skills } = content;

  const [activeTab, setActiveTab] = useState(0);
  const [showAllProjects, setShowAllProjects] = useState(false);
  const [showAllCertificates, setShowAllCertificates] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [initialItems, setInitialItems] = useState(6);

  // تنظيم المهارات حسب التصنيف
  const categorizedSkills = useMemo(() => {
    const categories = {
      frontend: skills.filter(s => 
        s.category?.toLowerCase().includes('frontend') || 
        ['React', 'Vue', 'Angular', 'HTML', 'CSS', 'JavaScript', 'TypeScript', 'Tailwind'].includes(s.name)
      ),
      backend: skills.filter(s => 
        s.category?.toLowerCase().includes('backend') ||
        ['Node.js', 'Python', 'PHP', 'Java', 'Go', 'Ruby', 'Django', 'Laravel'].includes(s.name)
      ),
      database: skills.filter(s => 
        s.category?.toLowerCase().includes('database') ||
        ['MySQL', 'PostgreSQL', 'MongoDB', 'Firebase', 'Redis', 'SQLite'].includes(s.name)
      ),
      cloud: skills.filter(s => 
        s.category?.toLowerCase().includes('cloud') ||
        ['AWS', 'Docker', 'Kubernetes', 'Google Cloud', 'Azure', 'DevOps'].includes(s.name)
      ),
      mobile: skills.filter(s => 
        s.category?.toLowerCase().includes('mobile') ||
        ['Flutter', 'React Native', 'Swift', 'Kotlin', 'Android', 'iOS'].includes(s.name)
      ),
      other: skills.filter(s => {
        const allCats = ['frontend', 'backend', 'database', 'cloud', 'mobile'];
        return !allCats.some(cat => 
          s.category?.toLowerCase().includes(cat) || 
          allCats.some(c => cat === c && s.category?.toLowerCase().includes(c))
        );
      })
    };
    return categories;
  }, [skills]);

  // استخراج تصنيفات المشاريع
  const projectCategories = useMemo(() => {
    const cats = new Set();
    projects.forEach(p => {
      if (p.category) cats.add(p.category);
    });
    return Array.from(cats);
  }, [projects]);

  // فلترة المشاريع
  const filteredProjects = useMemo(() => {
    if (selectedCategory === 'all') return projects;
    return projects.filter(p => p.category === selectedCategory);
  }, [projects, selectedCategory]);

  // تحديد عدد العناصر حسب الشاشة
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

  // إذا كان السياق لا يزال يحمّل
  if (contextLoading) {
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

        {/* Tabs مع عرض الأعداد */}
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
            <span>Tech Stack ({skills.length})</span>
          </button>
        </div>

        {/* محتوى التبويبات */}
        <div className="mt-8">
          {/* Projects Tab */}
          {activeTab === 0 && (
            <div>
              {loading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
                  <p className="text-gray-400 mr-3">جاري تحميل المشاريع...</p>
                </div>
              ) : (
                <>
                  {projectCategories.length > 0 && (
                    <FilterBar
                      categories={projectCategories}
                      selectedCategory={selectedCategory}
                      onSelectCategory={setSelectedCategory}
                    />
                  )}

                  {projects.length === 0 ? (
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
                      
                      {projects.length > initialItems && (
                        <div className="mt-8">
                          <ToggleButton
                            onClick={() => setShowAllProjects(!showAllProjects)}
                            isShowingMore={showAllProjects}
                            count={projects.length}
                          />
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          )}

          {/* Certificates Tab */}
          {activeTab === 1 && (
            <div>
              {loading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
                  <p className="text-gray-400 mr-3">جاري تحميل الشهادات...</p>
                </div>
              ) : (
                <>
                  {certificates.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-400">No certificates yet</p>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {displayedCertificates.map((cert, index) => (
                          <div
                            key={cert.id}
                            data-aos="fade-up"
                            data-aos-delay={index * 100}
                          >
                            <EnhancedCertificate certificate={cert} />
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
                </>
              )}
            </div>
          )}

          {/* Tech Stack Tab */}
          {activeTab === 2 && (
            <div className="space-y-8">
              {loading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
                  <p className="text-gray-400 mr-3">جاري تحميل المهارات...</p>
                </div>
              ) : (
                <>
                  {skills.length === 0 ? (
                    <p className="text-center text-gray-400">No skills added yet</p>
                  ) : (
                    <>
                      {/* Frontend Skills */}
                      {categorizedSkills.frontend.length > 0 && (
                        <SkillCategory
                          title="Frontend Development"
                          skills={categorizedSkills.frontend}
                          icon={Palette}
                          color="from-blue-500 to-cyan-500"
                        />
                      )}
                      
                      {/* Backend Skills */}
                      {categorizedSkills.backend.length > 0 && (
                        <SkillCategory
                          title="Backend Development"
                          skills={categorizedSkills.backend}
                          icon={Server}
                          color="from-green-500 to-emerald-500"
                        />
                      )}
                      
                      {/* Database Skills */}
                      {categorizedSkills.database.length > 0 && (
                        <SkillCategory
                          title="Databases"
                          skills={categorizedSkills.database}
                          icon={Database}
                          color="from-yellow-500 to-orange-500"
                        />
                      )}
                      
                      {/* Cloud & DevOps */}
                      {categorizedSkills.cloud.length > 0 && (
                        <SkillCategory
                          title="Cloud & DevOps"
                          skills={categorizedSkills.cloud}
                          icon={Cloud}
                          color="from-purple-500 to-pink-500"
                        />
                      )}
                      
                      {/* Mobile Development */}
                      {categorizedSkills.mobile.length > 0 && (
                        <SkillCategory
                          title="Mobile Development"
                          skills={categorizedSkills.mobile}
                          icon={Smartphone}
                          color="from-indigo-500 to-purple-500"
                        />
                      )}
                      
                      {/* Other Skills */}
                      {categorizedSkills.other.length > 0 && (
                        <SkillCategory
                          title="Other Skills"
                          skills={categorizedSkills.other}
                          icon={Code}
                          color="from-gray-500 to-slate-500"
                        />
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        
      </div>
    </div>
  );
};

export default Portfolio;
