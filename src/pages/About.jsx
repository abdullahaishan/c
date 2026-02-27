import React, { useEffect, useMemo, memo } from "react";

// =============================================
// 🔴 جميع الاستيرادات الخارجية مُعلقة - لن تسبب انهيار
// =============================================

// ❌ استيرادات خارجية - علقها كلها
 import {
   FileText,
//   Code,
//   Award,
//   Globe,
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


// داخل المكون، استبدل البيانات الافتراضية بـ:
const context = useDeveloper();
const developer = propDeveloper || context.developer;

const {
  getProfileImage,
  getProjects,
  getCertificates,
  getSkills,
  getExperience,
  getEducation,
  getTotalExperienceYears,
  //getSocialLinks,
  //isFreePlan,
  //getAdminSocialLinks
} = context;

  const context = useDeveloper();
  const developer = propDeveloper || context.developer;

  // ✅ استخدم دوال context مع قيم افتراضية آمنة
  const getProfileImage = context.getProfileImage || (() => "/Coding.gif");
  const getProjects = context.getProjects || (() => []);
  const getCertificates = context.getCertificates || (() => []);
  const getSkills = context.getSkills || (() => []);
  const getExperience = context.getExperience || (() => []);
  const getEducation = context.getEducation || (() => []);
  const getTotalExperienceYears = context.getTotalExperienceYears || (() => 5);
  
  // ✅ أضف دوال التواصل (كانت معلقة)
//  const getSocialLinks = context.getSocialLinks || (() => ({}));
//  const isFreePlan = context.isFreePlan || (() => true);
//  const getAdminSocialLinks = context.getAdminSocialLinks || (() => ({}));

  // ⚡ الروابط الاجتماعية (مع قيم افتراضية آمنة)
 const socialLinks = getSocialLinks() || {};
  const adminLinks = getAdminSocialLinks() || {};
 const usedLinks = (isFreePlan() ? adminLinks : socialLinks) || {};

  // ⚡ الإحصائيات (استخدم الدوال بشكل صحيح)
  const stats = {
    experience: getTotalExperienceYears() || 0,
    projects: (getProjects() || []).length,
    skills: (getSkills() || []).length,
    certificates: (getCertificates() || []).length
  };

  // ⚡ معلومات الاتصال
 // const contactInfo = {
   // email: usedLinks.email || "eng.abdullah.z.aishan@gmail.com",
   // phone: "+967-771-315-459",
   // location: "Sana'a, Yemen"
//  };
   
  useEffect(() => {
  AOS.init({ once: true });
  console.log("AboutPage mounted - AOS active");
}, []);

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
            
            {/* CV Button */}
            {developer?.resume_file && (
              <a 
                href={developer.resume_file} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white rounded-xl font-semibold hover:scale-105 transition-all"
              >
                <FileText className="w-5 h-5" /> Download CV
              </a>
            )}

            {/* Social Links - معطل حالياً، للتفعيل استخدم الخيار 2 أعلاه */}
            {/* 
            {Object.keys(usedLinks).length > 0 && (
              <div className="flex gap-3 pt-4">
                {usedLinks.github && (
                  <a href={usedLinks.github} target="_blank" rel="noopener noreferrer" 
                     className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center hover:bg-[#6366f1] transition-all">
                    <Github className="w-5 h-5 text-gray-400" />
                  </a>
                )}
                {usedLinks.linkedin && (
                  <a href={usedLinks.linkedin} target="_blank" rel="noopener noreferrer" 
                     className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center hover:bg-[#0077b5] transition-all">
                    <Linkedin className="w-5 h-5 text-gray-400" />
                  </a>
                )}
                {usedLinks.instagram && (
                  <a href={usedLinks.instagram} target="_blank" rel="noopener noreferrer" 
                     className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center hover:bg-[#e4405f] transition-all">
                    <Instagram className="w-5 h-5 text-gray-400" />
                  </a>
                )}
                {usedLinks.facebook && (
                  <a href={usedLinks.facebook} target="_blank" rel="noopener noreferrer" 
                     className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center hover:bg-[#1877f2] transition-all">
                    <Facebook className="w-5 h-5 text-gray-400" />
                  </a>
                )}
              </div>
            )}
            */}
          </div>

          {/* Profile Image */}
          <div className="relative" data-aos="fade-left">
            <div className="relative w-72 h-72 mx-auto">
              <div className="absolute inset-0 bg-gradient-to-r from-[#6366f1] to-[#a855f7] rounded-full blur-3xl opacity-30"></div>
              <img 
                src={getProfileImage()} 
                alt="Profile" 
                className="relative w-full h-full object-cover rounded-full border-4 border-white/10"
              />
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto" data-aos="fade-up">
          <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl">
            <Mail className="w-5 h-5 text-[#a855f7]" />
            <span className="text-gray-300 text-sm">{contactInfo.email}</span>
          </div>
          <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl">
            <Phone className="w-5 h-5 text-[#a855f7]" />
            <span className="text-gray-300 text-sm">{contactInfo.phone}</span>
          </div>
          <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl">
            <MapPin className="w-5 h-5 text-[#a855f7]" />
            <span className="text-gray-300 text-sm">{contactInfo.location}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
          <div className="text-center p-4 bg-white/5 rounded-xl">
            <div className="text-2xl font-bold text-[#a855f7]">{stats.experience}+</div>
            <div className="text-xs text-gray-400">Years Experience</div>
          </div>
          <div className="text-center p-4 bg-white/5 rounded-xl">
            <div className="text-2xl font-bold text-[#a855f7]">{stats.projects}+</div>
            <div className="text-xs text-gray-400">Projects Completed</div>
          </div>
          <div className="text-center p-4 bg-white/5 rounded-xl">
            <div className="text-2xl font-bold text-[#a855f7]">{stats.skills}+</div>
            <div className="text-xs text-gray-400">Skills</div>
          </div>
          <div className="text-center p-4 bg-white/5 rounded-xl">
            <div className="text-2xl font-bold text-[#a855f7]">{stats.certificates}+</div>
            <div className="text-xs text-gray-400">Certificates</div>
          </div>
        </div>

        {/* رسالة تشخيصية */}
        <div className="mt-8 p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-center">
          <p className="text-green-500">
            ✅ المكون يعمل بشكل صحيح
          </p>
        </div>
      </div>
    </div>
  );
};

export default memo(About);
};

export default memo(About);
