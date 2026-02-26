import React, { useEffect, useMemo } from "react";
import { useDeveloper } from '../context/DeveloperContext';
import { Code, Database, Cloud, Wifi, Shield, Cpu } from "lucide-react";
import AOS from "aos";
import "aos/dist/aos.css";

// مكون مجموعة المهارات
const SkillCategory = ({ title, skills, icon: Icon }) => {
  return (
    <div className="bg-white/5 rounded-2xl p-6 border border-white/10 hover:border-[#6366f1]/50 transition-all" data-aos="fade-up">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-r from-[#6366f1] to-[#a855f7] rounded-lg flex items-center justify-center">
          <Icon className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-xl font-semibold text-white">{title}</h3>
      </div>

      <div className="space-y-4">
        {skills.map((skill, index) => (
          <div key={index} className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-300">{skill.name}</span>
              <span className="text-[#a855f7] font-medium">{skill.proficiency}%</span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#6366f1] to-[#a855f7]"
                style={{ width: `${skill.proficiency}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const Skills = ({ developer: propDeveloper }) => {
  const context = useDeveloper();
  const developer = propDeveloper || context.publicDeveloper;
  const { getSkills, isFreePlan } = context;

  // تنظيم المهارات حسب التصنيف
  const categorizedSkills = useMemo(() => {
    const skills = getSkills();
    
    return {
      databases: skills.filter(s => s.category === 'Database' || s.name.includes('MySQL') || s.name.includes('Firebase')),
      apis: skills.filter(s => s.category === 'API' || s.name.includes('REST') || s.name.includes('Cloud')),
      backend: skills.filter(s => s.category === 'Backend' || s.name.includes('PHP') || s.name.includes('Node')),
      frontend: skills.filter(s => s.category === 'Frontend' || s.name.includes('React') || s.name.includes('Flutter')),
    };
  }, [developer]);

  // مهارات افتراضية إذا لم توجد
  const defaultSkills = {
    databases: [
      { name: "Firebase", proficiency: 70 },
      { name: "MySQL", proficiency: 75 }
    ],
    apis: [
      { name: "REST APIs", proficiency: 70 },
      { name: "Firebase Authentication", proficiency: 75 },
      { name: "Firebase Notifications", proficiency: 80 },
      { name: "Cloud Functions", proficiency: 85 },
      { name: "OpenStreetMap", proficiency: 90 }
    ]
  };

  const databaseSkills = categorizedSkills.databases.length > 0 ? categorizedSkills.databases : defaultSkills.databases;
  const apiSkills = categorizedSkills.apis.length > 0 ? categorizedSkills.apis : defaultSkills.apis;

  useEffect(() => {
    AOS.init({ once: false });
  }, []);

  return (
    <div className="relative min-h-screen bg-[#030014] overflow-hidden" id="Skills">
      <div className="container mx-auto px-[5%] py-20">
        {/* Header */}
        <div className="text-center mb-12" data-aos="fade-up">
          <h2 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#6366f1] to-[#a855f7] mb-4">
            Technical Skills
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            My expertise across different technologies and tools
          </p>
        </div>

        {/* Grid المهارات */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Databases */}
          <SkillCategory
            title="Databases"
            icon={Database}
            skills={databaseSkills}
          />

          {/* API & Integrations */}
          <SkillCategory
            title="API & Integrations"
            icon={Cloud}
            skills={apiSkills}
          />

          {/* Backend Development (إذا وجد) */}
          {categorizedSkills.backend.length > 0 && (
            <SkillCategory
              title="Backend Development"
              icon={Cpu}
              skills={categorizedSkills.backend}
            />
          )}

          {/* Frontend Development (إذا وجد) */}
          {categorizedSkills.frontend.length > 0 && (
            <SkillCategory
              title="Frontend Development"
              icon={Code}
              skills={categorizedSkills.frontend}
            />
          )}
        </div>

        {/* Free Plan Notice */}
        {isFreePlan && (
          <div className="mt-8 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-center max-w-4xl mx-auto">
            <p className="text-yellow-400 text-sm">
              ✨ You're on the Free Plan - Add more skills from dashboard
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Skills;
