import React, { useState } from 'react';
import {
  Github,
  Linkedin,
  Mail,
  MapPin,
  Briefcase,
  GraduationCap,
  Award,
  ExternalLink,
  Code,
  Calendar,
  Send,
  X
} from 'lucide-react';

const PortfolioTemplate = ({ data }) => {
  const [showContact, setShowContact] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    message: ''
  });

  const {
    title,
    about_me,
    profile_image,
    cover_image,
    social_links,
    theme_color = '#6366f1',
    projects = [],
    skills = [],
    experience = [],
    education = [],
    certificates = []
  } = data;

  const handleContactSubmit = (e) => {
    e.preventDefault();
    // هنا يمكن إضافة منطق إرسال الرسالة
    console.log('Contact form:', contactForm);
    setShowContact(false);
    setContactForm({ name: '', email: '', message: '' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      {/* Cover Image */}
      <div className="relative h-64 md:h-80 bg-gradient-to-r from-purple-600 to-blue-600">
        {cover_image && (
          <img
            src={cover_image}
            alt="Cover"
            className="w-full h-full object-cover opacity-50"
          />
        )}
        
        {/* Profile Image */}
        <div className="absolute -bottom-16 left-8 md:left-16">
          <div className="relative">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white overflow-hidden bg-gray-800">
              {profile_image ? (
                <img
                  src={profile_image}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
                  <span className="text-4xl font-bold text-white">
                    {title?.charAt(0) || 'U'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Profile Info */}
      <div className="pt-20 px-8 md:px-16 pb-8 border-b border-white/10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{title || 'مطور برمجيات'}</h1>
            <div className="flex flex-wrap items-center gap-4 text-gray-300">
              {social_links?.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {social_links.location}
                </span>
              )}
              {social_links?.email && (
                <a
                  href={`mailto:${social_links.email}`}
                  className="flex items-center gap-1 hover:text-purple-400 transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  {social_links.email}
                </a>
              )}
            </div>
          </div>

          {/* Social Links */}
          <div className="flex gap-3">
            {social_links?.github && (
              <a
                href={social_links.github}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all"
              >
                <Github className="w-5 h-5" />
              </a>
            )}
            {social_links?.linkedin && (
              <a
                href={social_links.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            )}
            <button
              onClick={() => setShowContact(true)}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg hover:scale-105 transition-all flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              تواصل معي
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-8 md:px-16 py-8">
        {/* About */}
        {about_me && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <span className="w-1 h-8 bg-purple-500 rounded-full" />
              عني
            </h2>
            <p className="text-gray-300 leading-relaxed">{about_me}</p>
          </section>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <span className="w-1 h-8 bg-blue-500 rounded-full" />
              <Code className="w-6 h-6" />
              المهارات
            </h2>
            <div className="flex flex-wrap gap-3">
              {skills.map((skill, index) => (
                <div
                  key={index}
                  className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all"
                >
                  <span className="text-white font-medium">{skill.name}</span>
                  {skill.proficiency && (
                    <div className="mt-2 w-24 h-1 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
                        style={{ width: `${skill.proficiency}%` }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <span className="w-1 h-8 bg-green-500 rounded-full" />
              <Briefcase className="w-6 h-6" />
              المشاريع
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project, index) => (
                <div
                  key={index}
                  className="bg-white/5 rounded-xl overflow-hidden border border-white/10 hover:scale-105 transition-all group"
                >
                  {project.cover_image && (
                    <img
                      src={project.cover_image}
                      alt={project.title}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  )}
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2">{project.title}</h3>
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                      {project.description}
                    </p>
                    {project.technologies && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {project.technologies.slice(0, 3).map((tech, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 bg-purple-500/10 text-purple-300 rounded text-xs"
                          >
                            {tech}
                          </span>
                        ))}
                        {project.technologies.length > 3 && (
                          <span className="text-xs text-gray-400">+{project.technologies.length - 3}</span>
                        )}
                      </div>
                    )}
                    {project.project_url && (
                      <a
                        href={project.project_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300"
                      >
                        <span>عرض المشروع</span>
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Experience & Education Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Experience */}
          {experience.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <span className="w-1 h-8 bg-yellow-500 rounded-full" />
                <Briefcase className="w-6 h-6" />
                الخبرات
              </h2>
              <div className="space-y-4">
                {experience.map((exp, index) => (
                  <div key={index} className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <h3 className="text-lg font-semibold">{exp.job_title}</h3>
                    <p className="text-purple-400 text-sm mb-2">{exp.company}</p>
                    {(exp.start_date || exp.end_date) && (
                      <p className="text-gray-400 text-xs mb-2">
                        {exp.start_date} - {exp.end_date || 'حالياً'}
                      </p>
                    )}
                    <p className="text-gray-300 text-sm">{exp.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {education.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <span className="w-1 h-8 bg-red-500 rounded-full" />
                <GraduationCap className="w-6 h-6" />
                التعليم
              </h2>
              <div className="space-y-4">
                {education.map((edu, index) => (
                  <div key={index} className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <h3 className="text-lg font-semibold">{edu.degree}</h3>
                    <p className="text-blue-400 text-sm mb-2">{edu.institution}</p>
                    <p className="text-gray-300 text-sm">{edu.field_of_study}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Certificates */}
        {certificates.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <span className="w-1 h-8 bg-purple-500 rounded-full" />
              <Award className="w-6 h-6" />
              الشهادات
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {certificates.map((cert, index) => (
                <div key={index} className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <h3 className="font-semibold mb-1">{cert.name}</h3>
                  <p className="text-sm text-gray-400">{cert.issuer}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Contact Modal */}
      {showContact && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl max-w-md w-full">
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">تواصل معي</h3>
              <button
                onClick={() => setShowContact(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleContactSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-gray-400 mb-2">الاسم</label>
                <input
                  type="text"
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  required
                  className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-2">البريد الإلكتروني</label>
                <input
                  type="email"
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  required
                  className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-2">الرسالة</label>
                <textarea
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  required
                  rows="4"
                  className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:scale-105 transition-all"
              >
                إرسال
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioTemplate;