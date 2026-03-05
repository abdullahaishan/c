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
    phone: developer.phone || "+900-000-000-000",
    location: developer.location || "City, State"
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
            {/* أزرار التواصل الاجتماعي - نسخة كاملة مع جميع المنصات */}
{Object.keys(socialLinks).length > 0 && (
  <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10" data-aos="fade-up" data-aos-delay="400">
    <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
      <span className="w-1 h-4 bg-purple-500 rounded-full" />
      Connect With Me
    </h4>
    <div className="flex flex-wrap gap-3">
      {/* ✅ GitHub */}
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
      
      {/* ✅ LinkedIn */}
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
      
      {/* ✅ X (Twitter) */}
      {socialLinks.twitter && (
        <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer"
           className="group relative p-3 bg-white/5 rounded-xl hover:bg-[#000000] transition-all duration-300"
           title="X (Twitter)">
          <Twitter className="w-5 h-5 text-gray-400 group-hover:text-white" />
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs bg-black/90 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
            X
          </span>
        </a>
      )}
      
      {/* ✅ Instagram */}
      {socialLinks.instagram && (
        <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer"
           className="group relative p-3 bg-white/5 rounded-xl hover:bg-gradient-to-r hover:from-[#833ab4] hover:via-[#fd1d1d] hover:to-[#f77737] transition-all duration-300"
           title="Instagram">
          <Instagram className="w-5 h-5 text-gray-400 group-hover:text-white" />
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs bg-black/90 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
            Instagram
          </span>
        </a>
      )}
      
      {/* ✅ Facebook */}
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
      
      {/* ✅ YouTube */}
      {socialLinks.youtube && (
        <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer"
           className="group relative p-3 bg-white/5 rounded-xl hover:bg-[#FF0000] transition-all duration-300"
           title="YouTube">
          <Youtube className="w-5 h-5 text-gray-400 group-hover:text-white" />
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs bg-black/90 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
            YouTube
          </span>
        </a>
      )}
      
      {/* ✅ TikTok */}
      {socialLinks.tiktok && (
        <a href={socialLinks.tiktok} target="_blank" rel="noopener noreferrer"
           className="group relative p-3 bg-white/5 rounded-xl hover:bg-[#000000] transition-all duration-300"
           title="TikTok">
          <svg className="w-5 h-5 text-gray-400 group-hover:text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
          </svg>
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs bg-black/90 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
            TikTok
          </span>
        </a>
      )}
      
      {/* ✅ Discord */}
      {socialLinks.discord && (
        <a href={socialLinks.discord} target="_blank" rel="noopener noreferrer"
           className="group relative p-3 bg-white/5 rounded-xl hover:bg-[#5865F2] transition-all duration-300"
           title="Discord">
          <svg className="w-5 h-5 text-gray-400 group-hover:text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515c-.074.134-.16.314-.212.471a18.344 18.344 0 0 0-5.506 0 3.474 3.474 0 0 0-.212-.471 19.733 19.733 0 0 0-4.885 1.515c-2.66 3.942-3.438 7.744-3.07 11.484 2.176 1.614 4.258 2.554 6.301 3.166.54-.74 1.018-1.53 1.424-2.374a12.284 12.284 0 0 1-2.233-1.075 9.528 9.528 0 0 0 .553-.431 14.638 14.638 0 0 0 12.12 0c.178.147.36.293.553.431-.7.432-1.448.814-2.233 1.075.406.844.884 1.634 1.424 2.374 2.043-.612 4.125-1.552 6.301-3.166.426-4.287-.636-8.079-3.07-11.484zM8.988 14.236c-1.182 0-2.158-1.091-2.158-2.432 0-1.34.946-2.432 2.158-2.432 1.211 0 2.157 1.092 2.158 2.432 0 1.341-.946 2.432-2.158 2.432zm6.024 0c-1.182 0-2.158-1.091-2.158-2.432 0-1.34.946-2.432 2.158-2.432s2.158 1.092 2.158 2.432c0 1.341-.946 2.432-2.158 2.432z"/>
          </svg>
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs bg-black/90 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
            Discord
          </span>
        </a>
      )}
      
      {/* ✅ Telegram */}
      {socialLinks.telegram && (
        <a href={socialLinks.telegram} target="_blank" rel="noopener noreferrer"
           className="group relative p-3 bg-white/5 rounded-xl hover:bg-[#0088cc] transition-all duration-300"
           title="Telegram">
          <svg className="w-5 h-5 text-gray-400 group-hover:text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.914.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.244-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
          </svg>
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs bg-black/90 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
            Telegram
          </span>
        </a>
      )}
      
      {/* ✅ WhatsApp */}
      {socialLinks.whatsapp && (
        <a href={socialLinks.whatsapp} target="_blank" rel="noopener noreferrer"
           className="group relative p-3 bg-white/5 rounded-xl hover:bg-[#25D366] transition-all duration-300"
           title="WhatsApp">
          <svg className="w-5 h-5 text-gray-400 group-hover:text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.064 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
          </svg>
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs bg-black/90 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
            WhatsApp
          </span>
        </a>
      )}
      
      {/* ✅ الموقع الشخصي */}
      {socialLinks.website && (
        <a href={socialLinks.website} target="_blank" rel="noopener noreferrer"
           className="group relative p-3 bg-white/5 rounded-xl hover:bg-purple-600 transition-all duration-300"
           title="Website">
          <Globe className="w-5 h-5 text-gray-400 group-hover:text-white" />
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs bg-black/90 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
            Website
          </span>
        </a>
      )}
      
      {/* ✅ البريد الإلكتروني */}
      {socialLinks.email && (
        <a href={`mailto:${socialLinks.email}`} target="_blank" rel="noopener noreferrer"
           className="group relative p-3 bg-white/5 rounded-xl hover:bg-purple-600 transition-all duration-300"
           title="Email">
          <Mail className="w-5 h-5 text-gray-400 group-hover:text-white" />
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs bg-black/90 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
            Email
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
