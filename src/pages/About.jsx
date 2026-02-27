import React, { useEffect, useMemo, memo } from "react";
import {
  FileText,
  Code,
  Award,
  Globe,
  Sparkles,
  Github,
  Linkedin,
  Instagram,
  Facebook,
  Mail,
  Phone,
  MapPin
} from "lucide-react";
import AOS from "aos";
import "aos/dist/aos.css";
import { useDeveloper } from '../context/DeveloperContext';

const About = ({ developer: propDeveloper }) => {
  const context = useDeveloper();
  const developer = propDeveloper || context.developer;

  // ⚠️ منع انهيار الصفحة قبل تحميل البيانات
  if (!developer) {
    return (
      <div className="text-center py-20 text-gray-400">
        Loading developer data...
      </div>
    );
  }

  const {
    getProfileImage,
    getProjects,
    getCertificates,
    getSkills,
    getExperience,
    getEducation,
    getTotalExperienceYears,
    getSocialLinks,
    isFreePlan,
    getAdminSocialLinks
  } = context;

  // ⚡ الروابط الاجتماعية الديناميكية
  const socialLinks = getSocialLinks() || {};
  const adminLinks = getAdminSocialLinks() || {};
  {/* Social Links - مع تحقق إضافي */}
{usedLinks && typeof usedLinks === 'object' && Object.keys(usedLinks).length > 0 && (
  <div className="flex gap-3 pt-4">
    {usedLinks.github && (
      <a href={usedLinks.github} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center hover:bg-[#6366f1] transition-all">
        <Github className="w-5 h-5 text-gray-400" />
      </a>
    )}
    {usedLinks.linkedin && (
      <a href={usedLinks.linkedin} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center hover:bg-[#0077b5] transition-all">
        <Linkedin className="w-5 h-5 text-gray-400" />
      </a>
    )}
    {usedLinks.instagram && (
      <a href={usedLinks.instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center hover:bg-[#e4405f] transition-all">
        <Instagram className="w-5 h-5 text-gray-400" />
      </a>
    )}
    {usedLinks.facebook && (
      <a href={usedLinks.facebook} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center hover:bg-[#1877f2] transition-all">
        <Facebook className="w-5 h-5 text-gray-400" />
      </a>
    )}
  </div>
)}
  // ⚡ الإحصائيات
  const stats = useMemo(() => {
    return {
      experience: getTotalExperienceYears() || 0,
      projects: (getProjects() || []).length,
      skills: (getSkills() || []).length,
      certificates: (getCertificates() || []).length
    };
  }, [developer]);

  // ⚡ معلومات الاتصال
  const contactInfo = {
    email: usedLinks.email || "eng.abdullah.z.aishan@gmail.com",
    phone: "+967-771-315-459",
    location: "Sana'a, Yemen"
  };

  useEffect(() => {
    AOS.init({ once: true });
  }, []);

  // ⚡ دوال مساعدة للتحقق من وجود بيانات قبل العرض
  const renderProjects = () => {
    const projects = getProjects() || [];
    if (!projects.length) return <p className="text-gray-400 text-center">No projects yet.</p>;
    return (
      <div className="grid md:grid-cols-2 gap-6">
        {projects.map((p) => (
          <div key={p.id} className="p-4 bg-white/5 rounded-xl">
            <img
              src={p.image || "/placeholder.png"}
              alt={p.title}
              className="w-full h-40 object-cover rounded-md mb-2"
            />
            <h4 className="text-white font-semibold">{p.title}</h4>
            <p className="text-gray-300 text-sm">{p.description || "No description provided."}</p>
            <div className="flex gap-2 mt-2 flex-wrap">
              {Array.isArray(p.technologies) && p.technologies.map((tech, idx) => (
                <span key={idx} className="text-xs text-purple-300 bg-white/10 px-2 py-1 rounded">{tech}</span>
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              {p.github_url && (
                <a href={p.github_url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-purple-400 text-sm">GitHub</a>
              )}
              {p.live_url && (
                <a href={p.live_url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-purple-400 text-sm">Live</a>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderSkills = () => {
    const skills = getSkills() || [];
    if (!skills.length) return <p className="text-gray-400 text-center">No skills yet.</p>;
    return (
      <div className="flex flex-wrap gap-3">
        {skills.map((skill) => (
          <span key={skill.id} className={`px-3 py-1 rounded text-sm text-white ${skill.color || 'bg-gradient-to-r from-blue-500 to-cyan-500'}`}>
            {skill.name} ({skill.proficiency || 0}%)
          </span>
        ))}
      </div>
    );
  };

  const renderCertificates = () => {
    const certificates = getCertificates() || [];
    if (!certificates.length) return <p className="text-gray-400 text-center">No certificates yet.</p>;
    return (
      <div className="grid md:grid-cols-2 gap-6">
        {certificates.map((cert) => (
          <div key={cert.id} className="p-4 bg-white/5 rounded-xl">
            {cert.image && <img src={cert.image} alt={cert.name} className="w-full h-36 object-cover rounded-md mb-2" />}
            <h4 className="text-white font-semibold">{cert.name}</h4>
            <p className="text-gray-300 text-sm">{cert.issuer || "Unknown issuer"}</p>
            {cert.credential_url && (
              <a href={cert.credential_url} target="_blank" rel="noopener noreferrer" className="text-purple-400 text-sm hover:underline">View Credential</a>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderExperience = () => {
    const experience = getExperience() || [];
    if (!experience.length) return <p className="text-gray-400 text-center">No experience yet.</p>;
    return (
      <div className="space-y-4">
        {experience.map((exp) => (
          <div key={exp.id} className="p-4 bg-white/5 rounded-xl">
            <h4 className="text-white font-semibold">{exp.job_title}</h4>
            <p className="text-gray-300 text-sm">{exp.company || "Unknown company"}</p>
            <p className="text-gray-400 text-xs">{exp.start_date ? new Date(exp.start_date).getFullYear() : "?"} - {exp.is_current ? "Present" : exp.end_date ? new Date(exp.end_date).getFullYear() : "?"}</p>
            {exp.description && <p className="text-gray-300 text-sm mt-1">{exp.description}</p>}
          </div>
        ))}
      </div>
    );
  };

  const renderEducation = () => {
    const education = getEducation() || [];
    if (!education.length) return <p className="text-gray-400 text-center">No education yet.</p>;
    return (
      <div className="space-y-4">
        {education.map((edu) => (
          <div key={edu.id} className="p-4 bg-white/5 rounded-xl">
            <h4 className="text-white font-semibold">{edu.degree}</h4>
            <p className="text-gray-300 text-sm">{edu.institution || "Unknown institution"}</p>
            <p className="text-gray-400 text-xs">{edu.start_date ? new Date(edu.start_date).getFullYear() : "?"} - {edu.is_current ? "Present" : edu.end_date ? new Date(edu.end_date).getFullYear() : "?"}</p>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="relative min-h-screen bg-[#030014] overflow-hidden" id="About">
      <div className="container mx-auto px-[5%] py-20">

        {/* Header */}
        <div className="text-center mb-12" data-aos="fade-up">
          <h2 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#6366f1] to-[#a855f7] mb-4">
            About Me
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            Transforming ideas into digital experiences
            <Sparkles className="w-5 h-5 text-purple-400" />
          </p>
        </div>

        {/* Main Info */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          <div className="space-y-6" data-aos="fade-right">
            <h3 className="text-3xl font-bold text-white">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6366f1] to-[#a855f7]">
                Hello, I'm
              </span>
              <span className="block mt-2">{developer.full_name || developer.username}</span>
            </h3>
            <p className="text-gray-300 leading-relaxed">{developer.bio || "Passionate developer building smart digital solutions."}</p>
            {developer.resume_file && (
              <a href={developer.resume_file} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white rounded-xl font-semibold hover:scale-105 transition-all">
                <FileText className="w-5 h-5" /> Download CV
              </a>
            )}

            {/* Social Links */}
            {usedLinks && Object.keys(usedLinks).length > 0 && (
              <div className="flex gap-3 pt-4">
                {usedLinks.github && <a href={usedLinks.github} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center hover:bg-[#6366f1] transition-all"><Github className="w-5 h-5 text-gray-400" /></a>}
                {usedLinks.linkedin && <a href={usedLinks.linkedin} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center hover:bg-[#0077b5] transition-all"><Linkedin className="w-5 h-5 text-gray-400" /></a>}
                {usedLinks.instagram && <a href={usedLinks.instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center hover:bg-[#e4405f] transition-all"><Instagram className="w-5 h-5 text-gray-400" /></a>}
                {usedLinks.facebook && <a href={usedLinks.facebook} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center hover:bg-[#1877f2] transition-all"><Facebook className="w-5 h-5 text-gray-400" /></a>}
              </div>
            )}
          </div>

          {/* Profile Image */}
          <div className="relative" data-aos="fade-left">
            <div className="relative w-72 h-72 mx-auto">
              <div className="absolute inset-0 bg-gradient-to-r from-[#6366f1] to-[#a855f7] rounded-full blur-3xl opacity-30"></div>
              <img src={getProfileImage()} alt="Profile" className="relative w-full h-full object-cover rounded-full border-4 border-white/10"/>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto" data-aos="fade-up">
          <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl"><Mail className="w-5 h-5 text-[#a855f7]" /><span className="text-gray-300 text-sm">{contactInfo.email}</span></div>
          <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl"><Phone className="w-5 h-5 text-[#a855f7]" /><span className="text-gray-300 text-sm">{contactInfo.phone}</span></div>
          <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl"><MapPin className="w-5 h-5 text-[#a855f7]" /><span className="text-gray-300 text-sm">{contactInfo.location}</span></div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
          <div className="text-center p-4 bg-white/5 rounded-xl"><div className="text-2xl font-bold text-[#a855f7]">{stats.experience}+</div><div className="text-xs text-gray-400">Years Experience</div></div>
          <div className="text-center p-4 bg-white/5 rounded-xl"><div className="text-2xl font-bold text-[#a855f7]">{stats.projects}+</div><div className="text-xs text-gray-400">Projects Completed</div></div>
          <div className="text-center p-4 bg-white/5 rounded-xl"><div className="text-2xl font-bold text-[#a855f7]">{stats.skills}+</div><div className="text-xs text-gray-400">Skills</div></div>
          <div className="text-center p-4 bg-white/5 rounded-xl"><div className="text-2xl font-bold text-[#a855f7]">{stats.certificates}+</div><div className="text-xs text-gray-400">Certificates</div></div>
        </div>

        {/* Sections */}
        <section className="mt-16">
          <h3 className="text-2xl font-bold text-white mb-4">Projects</h3>
          {renderProjects()}
        </section>

        <section className="mt-16">
          <h3 className="text-2xl font-bold text-white mb-4">Skills</h3>
          {renderSkills()}
        </section>

        <section className="mt-16">
          <h3 className="text-2xl font-bold text-white mb-4">Certificates</h3>
          {renderCertificates()}
        </section>

        <section className="mt-16">
          <h3 className="text-2xl font-bold text-white mb-4">Experience</h3>
          {renderExperience()}
        </section>

        <section className="mt-16 mb-20">
          <h3 className="text-2xl font-bold text-white mb-4">Education</h3>
          {renderEducation()}
        </section>

      </div>
    </div>
  );
};

export default memo(About);
