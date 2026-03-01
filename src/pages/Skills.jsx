import React, { useEffect, useMemo, useState } from "react";
import { useDeveloper } from '../context/DeveloperContext';
import {
  Code,
  Database,
  Cloud,
  Cpu,
  Smartphone,
  Palette,
  Server,
  Globe,
  Shield,
  Wifi,
  Github as GithubIcon,
  Figma,
  Terminal
} from "lucide-react";
import AOS from "aos";
import "aos/dist/aos.css";

// ✅ أيقونات من CDN للمهارات الشائعة
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
    'Sass': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/sass/sass-original.svg',
    'Bootstrap': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/bootstrap/bootstrap-original.svg',
    
    // Backend
    'Node.js': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg',
    'Python': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg',
    'PHP': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/php/php-original.svg',
    'Java': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg',
    'Go': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/go/go-original.svg',
    'Ruby': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/ruby/ruby-original.svg',
    'Laravel': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/laravel/laravel-plain.svg',
    'Django': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/django/django-plain.svg',
    'Express': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg',
    
    // Databases
    'MySQL': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg',
    'PostgreSQL': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg',
    'MongoDB': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg',
    'Firebase': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/firebase/firebase-plain.svg',
    'Redis': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redis/redis-original.svg',
    'SQLite': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/sqlite/sqlite-original.svg',
    
    // Cloud & DevOps
    'AWS': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/amazonwebservices/amazonwebservices-original.svg',
    'Docker': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg',
    'Kubernetes': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kubernetes/kubernetes-plain.svg',
    'Git': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg',
    'GitHub': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg',
    'GitLab': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/gitlab/gitlab-original.svg',
    
    // Mobile
    'Flutter': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/flutter/flutter-original.svg',
    'Dart': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/dart/dart-original.svg',
    'Swift': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/swift/swift-original.svg',
    'Kotlin': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kotlin/kotlin-original.svg',
    'React Native': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg',
    
    // Tools
    'Figma': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/figma/figma-original.svg',
    'VSCode': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vscode/vscode-original.svg',
    'Postman': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postman/postman-original.svg',
    'Jira': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/jira/jira-original.svg',
  };
  
  return icons[techName] || null;
};

// ✅ أيقونة افتراضية حسب التصنيف
const getDefaultIcon = (category) => {
  const cat = category?.toLowerCase() || '';
  if (cat.includes('frontend') || cat.includes('front')) return <Palette className="w-8 h-8 text-blue-400" />;
  if (cat.includes('backend') || cat.includes('back')) return <Server className="w-8 h-8 text-green-400" />;
  if (cat.includes('database') || cat.includes('db')) return <Database className="w-8 h-8 text-yellow-400" />;
  if (cat.includes('cloud') || cat.includes('devops')) return <Cloud className="w-8 h-8 text-purple-400" />;
  if (cat.includes('mobile')) return <Smartphone className="w-8 h-8 text-orange-400" />;
  if (cat.includes('tool') || cat.includes('ide')) return <Terminal className="w-8 h-8 text-gray-400" />;
  return <Code className="w-8 h-8 text-gray-400" />;
};

// ✅ مكون أيقونة المهارة
const SkillIcon = ({ skill }) => {
  const [iconError, setIconError] = useState(false);
  const [useDefault, setUseDefault] = useState(false);
  
  // محاولة جلب الأيقونة من الإنترنت
  const onlineIconUrl = getTechIconUrl(skill.name);
  
  // محاولة جلب الأيقونة المحلية
  const localIconUrl = skill.icon ? `/icons/${skill.icon}` : null;

  // إذا كان لدينا أيقونة من الإنترنت ولم تفشل
  if (onlineIconUrl && !iconError && !useDefault) {
    return (
      <div className="w-12 h-12 flex items-center justify-center bg-white/5 rounded-lg p-2">
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
  if (localIconUrl && !iconError && !useDefault) {
    return (
      <div className="w-12 h-12 flex items-center justify-center bg-white/5 rounded-lg p-2">
        <img
          src={localIconUrl}
          alt={skill.name}
          className="w-8 h-8 object-contain"
          onError={() => setIconError(true)}
        />
      </div>
    );
  }

  // أيقونة افتراضية حسب التصنيف أو اللون المختار
  return (
    <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${
      skill.color || 'from-blue-500 to-purple-500'
    } flex items-center justify-center`}>
      {getDefaultIcon(skill.category)}
    </div>
  );
};

// ✅ مكون شريط التقدم الملون حسب النسبة
const ProgressBar = ({ proficiency, color }) => {
  // تحديد لون الشريط حسب النسبة
  const getProgressColor = (level) => {
    if (level >= 80) return 'from-green-500 to-emerald-500';
    if (level >= 60) return 'from-blue-500 to-cyan-500';
    if (level >= 40) return 'from-yellow-500 to-orange-500';
    if (level >= 20) return 'from-orange-500 to-red-500';
    return 'from-red-500 to-rose-500';
  };

  const barColor = color || getProgressColor(proficiency);

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-400">الإتقان</span>
        <span className="text-white font-medium">{proficiency}%</span>
      </div>
      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${barColor} transition-all duration-500`}
          style={{ width: `${proficiency}%` }}
        />
      </div>
    </div>
  );
};

// ✅ مكون بطاقة المهارة
{/*const SkillCard = ({ skill }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="bg-white/5 rounded-xl p-5 border border-white/10 hover:border-[#6366f1]/50 transition-all group cursor-pointer"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-start gap-4">
      
        <SkillIcon skill={skill} />
        
        <div className="flex-1">
          
          <div className="flex items-center justify-between mb-2">
            <div>
              <h4 className="text-white font-semibold flex items-center gap-2">
                {skill.name}
                {skill.is_main && (
                  <span className="text-xs px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded-full">
                    رئيسية
                  </span>
                )}
              </h4>
              <p className="text-xs text-gray-400">{skill.category || 'غير مصنف'}</p>
            </div>
          </div>
          
      
          <ProgressBar proficiency={skill.proficiency || 0} color={skill.color} />
          
          
          {skill.years_of_experience > 0 && (
            <div className="mt-2 text-xs text-gray-500 flex items-center gap-1">
              <span>📅</span>
              {skill.years_of_experience} {skill.years_of_experience === 1 ? 'سنة' : 'سنوات'} خبرة
            </div>
          )}
          
      
          {expanded && skill.description && (
            <p className="mt-3 text-sm text-gray-400 border-t border-white/10 pt-3">
              {skill.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// ✅ مكون مجموعة المهارات حسب التصنيف
const SkillCategory = ({ title, skills, icon: Icon, color }) => {
  if (skills.length === 0) return null;
  
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${color} flex items-center justify-center`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
        <h3 className="text-xl font-semibold text-white">{title}</h3>
        <span className="text-sm text-gray-400 ml-auto">{skills.length} مهارات</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {skills.map((skill) => (
          <SkillCard key={skill.id} skill={skill} />
        ))}
      </div>
    </div>
  );
};*/}
// ✅ تعديل SkillCard
const SkillCard = ({ skill }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="bg-gradient-to-br from-white/15 to-white/5 rounded-xl p-5 border border-white/20 hover:border-[#6366f1]/50 transition-all group cursor-pointer hover:shadow-lg hover:shadow-purple-500/10"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-start gap-4">
        {/* أيقونة المهارة */}
        <SkillIcon skill={skill} />
        
        <div className="flex-1">
          {/* رأس البطاقة */}
          <div className="flex items-center justify-between mb-2">
            <div>
              <h4 className="text-white font-semibold flex items-center gap-2">
                {skill.name}
                {skill.is_main && (
                  <span className="text-xs px-2 py-0.5 bg-yellow-500/30 text-yellow-400 rounded-full border border-yellow-500/30">
                    رئيسية
                  </span>
                )}
              </h4>
              <p className="text-xs text-gray-400">{skill.category || 'غير مصنف'}</p>
            </div>
          </div>
          
          {/* شريط التقدم */}
          <ProgressBar proficiency={skill.proficiency || 0} color={skill.color} />
          
          {/* سنوات الخبرة */}
          {skill.years_of_experience > 0 && (
            <div className="mt-2 text-xs text-gray-400 flex items-center gap-1">
              <span>📅</span>
              {skill.years_of_experience} {skill.years_of_experience === 1 ? 'سنة' : 'سنوات'} خبرة
            </div>
          )}
          
          {/* وصف المهارة (يظهر عند التوسيع) */}
          {expanded && skill.description && (
            <p className="mt-3 text-sm text-gray-300 border-t border-white/20 pt-3">
              {skill.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// ✅ تعديل SkillCategory (اختياري)
const SkillCategory = ({ title, skills, icon: Icon, color }) => {
  if (skills.length === 0) return null;
  
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${color} flex items-center justify-center shadow-lg`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
        <h3 className="text-xl font-semibold text-white">{title}</h3>
        <span className="text-sm text-gray-400 ml-auto">{skills.length} مهارات</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {skills.map((skill) => (
          <SkillCard key={skill.id} skill={skill} />
        ))}
      </div>
    </div>
  );
};

// ✅ المكون الرئيسي
const Skills = ({ developer: propDeveloper }) => {
  const context = useDeveloper();
  const developer = propDeveloper || context.publicDeveloper;
  const { getSkills } = context;

  const skills = getSkills();

  // ✅ تنظيم المهارات حسب التصنيف
  const categorizedSkills = useMemo(() => {
    const categories = {
      frontend: [],
      backend: [],
      database: [],
      cloud: [],
      mobile: [],
      tools: [],
      other: []
    };

    skills.forEach(skill => {
      const cat = skill.category?.toLowerCase() || '';
      
      if (cat.includes('frontend') || cat.includes('front')) {
        categories.frontend.push(skill);
      } else if (cat.includes('backend') || cat.includes('back')) {
        categories.backend.push(skill);
      } else if (cat.includes('database') || cat.includes('db')) {
        categories.database.push(skill);
      } else if (cat.includes('cloud') || cat.includes('devops')) {
        categories.cloud.push(skill);
      } else if (cat.includes('mobile')) {
        categories.mobile.push(skill);
      } else if (cat.includes('tool') || cat.includes('ide')) {
        categories.tools.push(skill);
      } else {
        categories.other.push(skill);
      }
    });

    return categories;
  }, [skills]);

  useEffect(() => {
    AOS.init({ once: false });
  }, []);

  return (
    <div className="relative min-h-screen bg-[#030014] overflow-hidden" id="Skills">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Header */}
        <div className="text-center mb-12" data-aos="fade-up">
          <h2 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#6366f1] to-[#a855f7] mb-4">
            Technical Skills
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            My expertise across different technologies and tools
          </p>
        </div>

        {/* عرض المهارات حسب التصنيف */}
        {skills.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400">No skills added yet</p>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto">
            {/* Frontend */}
            <SkillCategory
              title="Frontend Development"
              skills={categorizedSkills.frontend}
              icon={Palette}
              color="from-blue-500 to-cyan-500"
            />
            
            {/* Backend */}
            <SkillCategory
              title="Backend Development"
              skills={categorizedSkills.backend}
              icon={Server}
              color="from-green-500 to-emerald-500"
            />
            
            {/* Databases */}
            <SkillCategory
              title="Databases"
              skills={categorizedSkills.database}
              icon={Database}
              color="from-yellow-500 to-orange-500"
            />
            
            {/* Cloud & DevOps */}
            <SkillCategory
              title="Cloud & DevOps"
              skills={categorizedSkills.cloud}
              icon={Cloud}
              color="from-purple-500 to-pink-500"
            />
            
            {/* Mobile Development */}
            <SkillCategory
              title="Mobile Development"
              skills={categorizedSkills.mobile}
              icon={Smartphone}
              color="from-indigo-500 to-purple-500"
            />
            
            {/* Tools */}
            <SkillCategory
              title="Development Tools"
              skills={categorizedSkills.tools}
              icon={Terminal}
              color="from-gray-500 to-slate-500"
            />
            
            {/* Other Skills */}
            {categorizedSkills.other.length > 0 && (
              <SkillCategory
                title="Other Skills"
                skills={categorizedSkills.other}
                icon={Code}
                color="from-gray-600 to-gray-800"
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Skills;
