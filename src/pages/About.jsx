import React, { useEffect, memo, useMemo, useState } from "react";
import {
  FileText,
  Code,
  Award,
  Globe,
  ArrowUpRight,
  Sparkles,
  Users,
  ChevronLeft,
  ChevronRight,
  User,
  Star
} from "lucide-react";
import { Link } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import { useDeveloper } from '../context/DeveloperContext';
import { supabase } from '../lib/supabase';

// مكون بطاقة المطور المقترح
const DeveloperCard = memo(({ developer }) => {
  const [imageError, setImageError] = useState(false);
  
  return (
    <Link to={`/u/${developer.username}`} className="block group">
      <div className="bg-white/5 rounded-2xl p-4 border border-white/10 hover:border-[#6366f1]/50 transition-all duration-300 hover:scale-105">
        <div className="flex flex-col items-center text-center">
          {/* الصورة الشخصية */}
          <div className="relative mb-3">
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-[#6366f1]/30 group-hover:border-[#a855f7] transition-all">
              {!imageError && developer.profile_image ? (
                <img
                  src={developer.profile_image}
                  alt={developer.full_name}
                  className="w-full h-full object-cover"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-[#6366f1] to-[#a855f7] flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
              )}
            </div>
            {/* أيقونة المهارات المشتركة */}
            {developer.matchScore > 70 && (
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-[#030014]">
                <Star className="w-3 h-3 text-white fill-white" />
              </div>
            )}
          </div>
          
          {/* الاسم */}
          <h4 className="text-white font-semibold mb-1 line-clamp-1">
            {developer.full_name || developer.username}
          </h4>
          
          {/* اسم المستخدم */}
          <p className="text-xs text-gray-400 mb-2">@{developer.username}</p>
          
          {/* المسمى الوظيفي */}
          {developer.title && (
            <p className="text-xs text-gray-300 mb-3 line-clamp-1">{developer.title}</p>
          )}
          
          {/* نسبة التوافق (إذا وجدت) */}
          {developer.matchScore && (
            <div className="w-full mt-2">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-gray-400">توافق</span>
                <span className="text-[#a855f7]">{developer.matchScore}%</span>
              </div>
              <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#6366f1] to-[#a855f7]"
                  style={{ width: `${developer.matchScore}%` }}
                />
              </div>
            </div>
          )}
          
          {/* زر العرض */}
          <button className="mt-3 w-full py-2 text-xs bg-white/5 rounded-lg text-gray-300 hover:bg-white/10 transition-all">
            عرض البورتفليو
          </button>
        </div>
      </div>
    </Link>
  );
});

// مكون شريط المطورين الأفقي
const DevelopersSlider = memo(({ developers, title }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerView = window.innerWidth < 768 ? 2 : 4;
  const maxIndex = Math.max(0, developers.length - itemsPerView);

  const nextSlide = () => {
    setCurrentIndex(prev => Math.min(prev + 1, maxIndex));
  };

  const prevSlide = () => {
    setCurrentIndex(prev => Math.max(prev - 1, 0));
  };

  if (developers.length === 0) return null;

  return (
    <div className="mt-12">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-[#6366f1]" />
          {title}
        </h3>
        
        {/* أزرار التنقل */}
        <div className="flex gap-2">
          <button
            onClick={prevSlide}
            disabled={currentIndex === 0}
            className={`p-2 rounded-lg transition-all ${
              currentIndex === 0
                ? 'bg-white/5 text-gray-600 cursor-not-allowed'
                : 'bg-white/10 text-gray-400 hover:text-white hover:bg-white/20'
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextSlide}
            disabled={currentIndex >= maxIndex}
            className={`p-2 rounded-lg transition-all ${
              currentIndex >= maxIndex
                ? 'bg-white/5 text-gray-600 cursor-not-allowed'
                : 'bg-white/10 text-gray-400 hover:text-white hover:bg-white/20'
            }`}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* شريط المطورين */}
      <div className="relative overflow-hidden">
        <div
          className="flex gap-4 transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)` }}
        >
          {developers.map((dev) => (
            <div
              key={dev.id}
              className="flex-shrink-0"
              style={{ width: `calc(${100 / itemsPerView}% - 12px)` }}
            >
              <DeveloperCard developer={dev} />
            </div>
          ))}
        </div>
      </div>

      {/* نقاط التصفح للموبايل */}
      <div className="flex justify-center gap-1 mt-4 md:hidden">
        {Array.from({ length: maxIndex + 1 }).map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={`w-2 h-2 rounded-full transition-all ${
              i === currentIndex
                ? 'w-4 bg-[#a855f7]'
                : 'bg-white/20 hover:bg-white/40'
            }`}
          />
        ))}
      </div>
    </div>
  );
});

// مكون بطاقة المهارة
const SkillCard = memo(({ skill }) => {
  return (
    <div className="bg-white/5 rounded-xl p-4 border border-white/10 hover:border-[#6366f1]/50 transition-all group">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${skill.color || 'from-blue-500 to-cyan-500'} flex items-center justify-center`}>
          <span className="text-white font-bold text-lg">
            {skill.name.charAt(0)}
          </span>
        </div>
        <div>
          <h4 className="text-white font-semibold">{skill.name}</h4>
          <p className="text-xs text-gray-400">{skill.category}</p>
        </div>
      </div>

      {skill.description && (
        <p className="text-sm text-gray-300 mb-3 line-clamp-2">
          {skill.description}
        </p>
      )}

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-400">نسبة الإتقان</span>
          <span className="text-white">{skill.proficiency}%</span>
        </div>
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r ${skill.color || 'from-blue-500 to-cyan-500'}`}
            style={{ width: `${skill.proficiency}%` }}
          />
        </div>
      </div>

      {skill.years_of_experience > 0 && (
        <div className="mt-3 text-xs text-gray-400">
          {skill.years_of_experience} سنة خبرة
        </div>
      )}
    </div>
  );
});

// المكون الرئيسي
const AboutPage = ({ developer: propDeveloper }) => {
  const context = useDeveloper();
  const developer = propDeveloper || context.publicDeveloper;
  const {
    getProfileImage,
    getProjects,
    getCertificates,
    getSkills,
    getExperience,
    getTotalExperienceYears,
    isFreePlan
  } = context;

  const [similarDevelopers, setSimilarDevelopers] = useState([]);
  const [loadingDevelopers, setLoadingDevelopers] = useState(false);

  // حساب الإحصائيات
  const stats = useMemo(() => {
    const projects = getProjects();
    const certificates = getCertificates();
    const skills = getSkills();
    const totalYears = getTotalExperienceYears();

    return {
      projects: projects?.length || 0,
      certificates: certificates?.length || 0,
      skills: skills?.length || 0,
      experience: totalYears || 0
    };
  }, [developer]);

  // جلب مطورين مشابهين (للباقة المجانية)
  useEffect(() => {
    if (!isFreePlan() || !developer) return;

    const fetchSimilarDevelopers = async () => {
      setLoadingDevelopers(true);
      try {
        // جلب مطورين عشوائيين أو بناءً على نفس المهارات
        const { data, error } = await supabase
          .from('developers')
          .select(`
            id,
            username,
            full_name,
            title,
            profile_image,
            skills!inner(name, proficiency)
          `)
          .neq('id', developer.id)
          .eq('is_active', true)
          .limit(8);

        if (error) throw error;

        // حساب نسبة التوافق مع المطور الحالي
        const currentSkills = getSkills().map(s => s.name);
        const developersWithMatch = data?.map(dev => {
          const devSkills = dev.skills?.map(s => s.name) || [];
          const commonSkills = devSkills.filter(s => currentSkills.includes(s));
          const matchScore = currentSkills.length > 0
            ? Math.round((commonSkills.length / currentSkills.length) * 100)
            : 50;

          return {
            ...dev,
            matchScore: Math.min(matchScore, 100)
          };
        }).sort((a, b) => b.matchScore - a.matchScore);

        setSimilarDevelopers(developersWithMatch || []);
      } catch (error) {
        console.error('Error fetching similar developers:', error);
      } finally {
        setLoadingDevelopers(false);
      }
    };

    fetchSimilarDevelopers();
  }, [developer, isFreePlan]);

  // الحصول على المهارات مع الألوان
  const skills = getSkills();

  useEffect(() => {
    AOS.init({ once: false });
  }, []);

  return (
    <div className="relative min-h-screen bg-[#030014] overflow-hidden" id="About">
      <div className="container mx-auto px-[5%] py-20">
        {/* الهيدر */}
        <div className="text-center mb-12" data-aos="fade-up">
          <h2 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#6366f1] to-[#a855f7] mb-4">
            About Me
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Transforming ideas into digital experiences
          </p>
        </div>

        {/* القسم التعريفي */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          <div className="space-y-6" data-aos="fade-right">
            <h3 className="text-3xl font-bold text-white">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6366f1] to-[#a855f7]">
                Hello, I'm
              </span>
              <span className="block mt-2">
                {developer?.full_name || "Developer Name"}
              </span>
            </h3>

            <p className="text-gray-300 leading-relaxed">
              {developer?.bio || "Passionate developer with expertise in creating innovative web solutions. Committed to delivering high-quality work and continuously learning new technologies."}
            </p>

            <div className="flex flex-wrap gap-4">
              <a
                href={developer?.resume_file || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white rounded-xl font-semibold hover:scale-105 transition-all"
              >
                <FileText className="w-5 h-5" />
                Download CV
              </a>
            </div>

            {/* إحصائيات سريعة */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-[#a855f7]">{stats.projects}</div>
                <div className="text-xs text-gray-400">مشاريع</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#a855f7]">{stats.certificates}</div>
                <div className="text-xs text-gray-400">شهادات</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#a855f7]">{stats.skills}</div>
                <div className="text-xs text-gray-400">مهارات</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#a855f7]">{stats.experience}</div>
                <div className="text-xs text-gray-400">سنوات خبرة</div>
              </div>
            </div>
          </div>

          {/* الصورة الشخصية */}
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

        {/* قسم المهارات - بطاقات جميلة */}
        {skills.length > 0 && (
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-white mb-8 text-center" data-aos="fade-up">
              المهارات التقنية
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {skills.map((skill, index) => (
                <div key={skill.id} data-aos="fade-up" data-aos-delay={index * 100}>
                  <SkillCard skill={skill} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* مطورين مقترحين - فقط للباقة المجانية */}
        {isFreePlan() && similarDevelopers.length > 0 && (
          <DevelopersSlider
            developers={similarDevelopers}
            title="مطورين قد يهمونك"
          />
        )}

        {/* إشعار الباقة المجانية */}
        {isFreePlan() && (
          <div className="mt-8 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-center">
            <p className="text-yellow-400 text-sm">
              ✨ أنت تستخدم الباقة المجانية - يتم عرض مطورين مقترحين بناءً على مهاراتك
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(AboutPage);
