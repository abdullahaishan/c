import React, { useEffect, useState, memo } from "react";
import {
  FileText,
  Sparkles,
  Github,
  Linkedin,
  Instagram,
  Facebook,
  Youtube,
  Twitter,
  Mail,
  Phone,
  MapPin,
  Award,
  Briefcase,
  Code,
  FolderKanban,
  Eye,
  Heart,
  Calendar,
  ChevronRight,
  Globe
} from "lucide-react";
import AOS from "aos";
import "aos/dist/aos.css";
import { developerService } from '../lib/supabase';
import { useParams } from 'react-router-dom';

const About = () => {
  const { username } = useParams();
  const [aboutData, setAboutData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAboutData = async () => {
      try {
        setLoading(true);
        const data = await developerService.getAboutData(username);
        setAboutData(data);
      } catch (err) {
        console.error('Error fetching about data:', err);
        setError('فشل تحميل المعلومات');
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchAboutData();
    }
  }, [username]);

  useEffect(() => {
    AOS.init({ 
      once: true,
      duration: 800,
      easing: 'ease-in-out'
    });
  }, []);

  if (loading) {
    return (
      <div className="relative min-h-screen bg-[#030014] overflow-hidden">
        
        <div className="relative z-10 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-6" />
              <div className="absolute inset-0 bg-purple-500/20 blur-3xl rounded-full" />
            </div>
            <p className="text-gray-400 text-lg font-light tracking-wider animate-pulse">
              جاري تحميل المعلومات
              <span className="inline-flex ml-1">...</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !aboutData) {
    return (
      <div className="relative min-h-screen bg-[#030014] overflow-hidden">
        
        <div className="relative z-10 min-h-screen flex items-center justify-center">
          <div className="text-center max-w-md px-4">
            <div className="relative inline-block mb-6">
              <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center">
                <span className="text-5xl">😕</span>
              </div>
              <div className="absolute inset-0 bg-red-500/20 blur-3xl rounded-full" />
            </div>
            <h3 className="text-2xl text-white font-bold mb-3">عذراً!</h3>
            <p className="text-gray-400 mb-8">{error || 'لم يتم العثور على المطور'}</p>
            <button 
              onClick={() => window.location.reload()}
              className="group relative px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-white font-semibold overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25"
            >
              <span className="relative z-10 flex items-center gap-2">
                إعادة المحاولة
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/50 to-pink-600/50 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { developer, socialLinks, stats } = aboutData;

  const contactInfo = {
    email: developer.email || socialLinks.email || "eng.abdullah.z.aishan@gmail.com",
    phone: developer.phone || "+967-771-315-459",
    location: developer.location || "Sana'a, Yemen"
  };

  // تنسيق تاريخ الانضمام
  const memberSince = developer.created_at 
    ? new Date(developer.created_at).toLocaleDateString('ar-SA', { 
        year: 'numeric', 
        month: 'long' 
      })
    : '2024';

  return (
    <div className="relative min-h-screen bg-[#030014] overflow-hidden">
      
      
      {/* حاوية المحتوى الرئيسية */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">

        {/* Header مع تأثير متحرك */}
        <div className="text-center mb-16" data-aos="fade-up">
          <div className="relative inline-block mb-4">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/30 to-pink-500/30 blur-3xl" />
            <h2 className="relative text-5xl md:text-6xl font-bold">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6366f1] via-purple-400 to-[#a855f7]">
                About Me
              </span>
            </h2>
          </div>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed" data-aos="fade-up" data-aos-delay="100">
            Get to know the person behind the code – my journey, skills, and passion for creating digital experiences.
          </p>
        </div>

        {/* القسم الرئيسي - شبكة 2 عمود */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start mb-20">
          
          {/* العمود الأيمن - المعلومات الشخصية */}
          <div className="space-y-8" data-aos="fade-right">
            {/* بطاقة الترحيب */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <Sparkles className="w-8 h-8 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-[#030014]" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-white mb-1">
                      {developer.full_name || developer.username || "Developer"}
                    </h3>
                    <p className="text-purple-400 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      عضو منذ {memberSince}
                    </p>
                  </div>
                </div>

                <p className="text-gray-300 leading-relaxed text-lg">
                  {developer.bio || "Passionate developer building smart digital solutions with modern technologies."}
                </p>
              </div>
            </div>

            {/* بطاقة الإحصائيات المتقدمة */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-purple-500/50 transition-all group" data-aos="fade-up" data-aos-delay="200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Eye className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">{stats.views.toLocaleString()}</div>
                    <div className="text-xs text-gray-400">Profile Views</div>
                  </div>
                </div>
                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full w-3/4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" />
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-pink-500/50 transition-all group" data-aos="fade-up" data-aos-delay="300">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-pink-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Heart className="w-5 h-5 text-pink-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">{stats.likes.toLocaleString()}</div>
                    <div className="text-xs text-gray-400">Likes Received</div>
                  </div>
                </div>
                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full w-2/3 bg-gradient-to-r from-pink-500 to-orange-500 rounded-full" />
                </div>
              </div>
            </div>

            {/* أزرار التواصل الاجتماعي */}
            {Object.keys(socialLinks).length > 0 && (
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10" data-aos="fade-up" data-aos-delay="400">
                <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <span className="w-1 h-4 bg-purple-500 rounded-full" />
                  Connect With Me
                </h4>
                <div className="flex flex-wrap gap-3">
                  {socialLinks.github && (
                    <a href={socialLinks.github} target="_blank" rel="noopener noreferrer"
                       className="group relative p-3 bg-white/5 rounded-xl hover:bg-[#333] transition-all duration-300"
                       title="GitHub">
                      <Github className="w-5 h-5 text-gray-400 group-hover:text-white" />
                      <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs bg-black/90 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                        GitHub
                      </span>
                    </a>
                  )}
                  {socialLinks.linkedin && (
                    <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer"
                       className="group relative p-3 bg-white/5 rounded-xl hover:bg-[#0077b5] transition-all duration-300"
                       title="LinkedIn">
                      <Linkedin className="w-5 h-5 text-gray-400 group-hover:text-white" />
                      <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs bg-black/90 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                        LinkedIn
                      </span>
                    </a>
                  )}
                  {socialLinks.instagram && (
                    <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer"
                       className="group relative p-3 bg-white/5 rounded-xl hover:bg-[#e4405f] transition-all duration-300"
                       title="Instagram">
                      <Instagram className="w-5 h-5 text-gray-400 group-hover:text-white" />
                      <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs bg-black/90 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                        Instagram
                      </span>
                    </a>
                  )}
                  {socialLinks.facebook && (
                    <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer"
                       className="group relative p-3 bg-white/5 rounded-xl hover:bg-[#1877f2] transition-all duration-300"
                       title="Facebook">
                      <Facebook className="w-5 h-5 text-gray-400 group-hover:text-white" />
                      <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs bg-black/90 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                        Facebook
                      </span>
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* العمود الأيسر - الإحصائيات والصورة */}
          <div className="space-y-8" data-aos="fade-left">
            
            {/* صورة الملف الشخصي */}
            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-purple-600/30 to-pink-600/30 rounded-[40px] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative aspect-square rounded-[32px] overflow-hidden border-4 border-white/10 group-hover:border-purple-500/50 transition-all duration-500">
                <img
                  src={developer.profile_image || "/Coding.gif"}
                  alt={developer.full_name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  onError={(e) => {
                    e.target.src = "/Coding.gif";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>

            {/* بطاقة معلومات الاتصال */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 space-y-4">
              <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                <span className="w-1 h-4 bg-pink-500 rounded-full" />
                Contact Information
              </h4>
              
              <a href={`mailto:${contactInfo.email}`} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition group">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center group-hover:scale-110 transition">
                  <Mail className="w-4 h-4 text-purple-400" />
                </div>
                <span className="text-gray-300 text-sm group-hover:text-white transition truncate">
                  {contactInfo.email}
                </span>
              </a>

              <a href={`tel:${contactInfo.phone}`} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition group">
                <div className="w-8 h-8 rounded-lg bg-pink-500/20 flex items-center justify-center group-hover:scale-110 transition">
                  <Phone className="w-4 h-4 text-pink-400" />
                </div>
                <span className="text-gray-300 text-sm group-hover:text-white transition">
                  {contactInfo.phone}
                </span>
              </a>

              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-blue-400" />
                </div>
                <span className="text-gray-300 text-sm">
                  {contactInfo.location}
                </span>
              </div>
            </div>

            {/* زر تحميل السيرة الذاتية */}
            {developer?.resume_file && (
              <a
                href={developer.resume_file}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative block w-full overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 p-6 hover:scale-[1.02] transition-all duration-300"
                data-aos="fade-up"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="w-6 h-6 text-white" />
                    <span className="text-white font-semibold">Download CV</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform" />
                </div>
              </a>
            )}
          </div>
        </div>

        {/* إحصائيات المشاريع والمهارات */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-20" data-aos="fade-up">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-transparent rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition" />
            <div className="relative bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 text-center hover:border-purple-500/50 transition">
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-purple-500/20 flex items-center justify-center group-hover:scale-110 transition">
                <Briefcase className="w-6 h-6 text-purple-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">{stats.experience}+</div>
              <div className="text-xs text-gray-400">Years Experience</div>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-pink-600/20 to-transparent rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition" />
            <div className="relative bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 text-center hover:border-pink-500/50 transition">
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-pink-500/20 flex items-center justify-center group-hover:scale-110 transition">
                <FolderKanban className="w-6 h-6 text-pink-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">{stats.projects}+</div>
              <div className="text-xs text-gray-400">Projects Completed</div>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-transparent rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition" />
            <div className="relative bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 text-center hover:border-blue-500/50 transition">
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition">
                <Code className="w-6 h-6 text-blue-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">{stats.skills}+</div>
              <div className="text-xs text-gray-400">Skills</div>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-600/20 to-transparent rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition" />
            <div className="relative bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 text-center hover:border-amber-500/50 transition">
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-amber-500/20 flex items-center justify-center group-hover:scale-110 transition">
                <Award className="w-6 h-6 text-amber-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">{stats.certificates}+</div>
              <div className="text-xs text-gray-400">Certificates</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default memo(About);
