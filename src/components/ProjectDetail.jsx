import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { projectService } from "../lib/supabase";
import AnimatedBackground from "./AnimatedBackground";
import Lottie from "lottie-web";
import {
  ArrowLeft,
  ExternalLink,
  Github,
  Code2,
  Star,
  ChevronRight,
  Layers,
  Package,
  Tag,
  Calendar,
  Info,
  Eye,
  EyeOff,
  Loader,
  XCircle,
  Share2,
  Twitter,
  Linkedin,
  Facebook,
  Link2,
  Check
} from "lucide-react";
import Swal from "sweetalert2";

// أيقونات التقنيات
const TECH_ICONS = {
  React: Code2,
  'Next.js': Code2,
  'Vue.js': Code2,
  Angular: Code2,
  'Node.js': Code2,
  Express: Code2,
  Python: Code2,
  Django: Code2,
  Laravel: Code2,
  PHP: Code2,
  Java: Code2,
  Spring: Code2,
  'C#': Code2,
  '.NET': Code2,
  Go: Code2,
  Rust: Code2,
  TypeScript: Code2,
  JavaScript: Code2,
  HTML: Code2,
  CSS: Code2,
  Sass: Code2,
  Tailwind: Code2,
  Bootstrap: Code2,
  MySQL: Code2,
  PostgreSQL: Code2,
  MongoDB: Code2,
  Firebase: Code2,
  Redis: Code2,
  GraphQL: Code2,
  Docker: Code2,
  Kubernetes: Code2,
  AWS: Code2,
  Azure: Code2,
  GCP: Code2,
  Flutter: Code2,
  'React Native': Code2,
  Swift: Code2,
  Kotlin: Code2,
  default: Package,
};

// مكون شاشة التحميل المتحركة
const LoadingAnimation = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      const anim = Lottie.loadAnimation({
        container: containerRef.current,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: 'https://assets2.lottiefiles.com/packages/lf20_p8bfn5do.json' // أنيميشن تحميل جميل
      });

      return () => anim.destroy();
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#030014] flex items-center justify-center">
      <div className="text-center">
        <div ref={containerRef} className="w-48 h-48 mx-auto mb-6" />
        <p className="text-white text-lg font-light tracking-wider">
          جاري تحميل المشروع
          <span className="inline-flex animate-pulse">...</span>
        </p>
        <button
          onClick={() => window.history.back()}
          className="mt-8 text-gray-400 hover:text-white transition flex items-center gap-2 mx-auto text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          العودة
        </button>
      </div>
    </div>
  );
};

// مكون شارة التقنية
const TechBadge = ({ tech }) => {
  const Icon = TECH_ICONS[tech] || TECH_ICONS["default"];
  
  if (!tech) return null;

  return (
    <div className="px-3 py-2 bg-white/5 rounded-lg border border-white/10 flex items-center gap-2 hover:bg-white/10 transition group">
      <Icon className="w-4 h-4 text-purple-400 group-hover:text-purple-300 transition" />
      <span className="text-sm text-gray-300 group-hover:text-white transition">{tech}</span>
    </div>
  );
};

// مكون عنصر الميزة
const FeatureItem = ({ feature }) => {
  if (!feature) return null;
  
  return (
    <li className="flex items-start gap-2 text-gray-300 group hover:text-white transition">
      <span className="w-2 h-2 mt-2 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 group-hover:scale-125 transition flex-shrink-0" />
      <span className="text-sm md:text-base">{feature}</span>
    </li>
  );
};

// مكون القسم الفارغ
const EmptySection = ({ icon: Icon, title, message }) => (
  <div className="bg-white/5 rounded-xl p-8 text-center border border-white/10">
    <Icon className="w-12 h-12 text-gray-600 mx-auto mb-3" />
    <h4 className="text-gray-400 font-medium mb-1">{title}</h4>
    <p className="text-sm text-gray-500">{message}</p>
  </div>
);

// مكون أزرار المشاركة
const ShareButtons = ({ project }) => {
  const [copied, setCopied] = useState(false);
  
  const projectUrl = project.slug 
    ? `${window.location.origin}/project/${project.slug}`
    : `${window.location.origin}/project/${project.id}`;
  
  const shareTitle = project.title;
  
  const copyLink = () => {
    navigator.clipboard.writeText(projectUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    
    Swal.fire({
      icon: "success",
      title: "تم النسخ!",
      text: "رابط المشروع تم نسخه إلى الحافظة",
      timer: 2000,
      showConfirmButton: false,
      background: "#030014",
      color: "#ffffff"
    });
  };
  
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(projectUrl)}`;
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(projectUrl)}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(projectUrl)}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareTitle + ' ' + projectUrl)}`;
  
  return (
    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
      <h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
        <Share2 className="w-4 h-4" />
        مشاركة المشروع
      </h3>
      
      <div className="flex flex-wrap gap-2">
        <button
          onClick={copyLink}
          className="flex items-center gap-1 px-3 py-2 bg-white/10 rounded-lg hover:bg-white/15 transition group"
          title="نسخ الرابط"
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-400" />
          ) : (
            <Link2 className="w-4 h-4 text-gray-400 group-hover:text-white" />
          )}
          <span className="text-xs text-gray-400 group-hover:text-white hidden sm:inline">
            {copied ? "تم النسخ" : "نسخ الرابط"}
          </span>
        </button>
        
        <a href={twitterUrl} target="_blank" rel="noopener noreferrer" className="p-2 bg-[#1DA1F2]/10 rounded-lg hover:bg-[#1DA1F2]/20 transition" title="Twitter">
          <Twitter className="w-4 h-4 text-[#1DA1F2]" />
        </a>
        <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" className="p-2 bg-[#0A66C2]/10 rounded-lg hover:bg-[#0A66C2]/20 transition" title="LinkedIn">
          <Linkedin className="w-4 h-4 text-[#0A66C2]" />
        </a>
        <a href={facebookUrl} target="_blank" rel="noopener noreferrer" className="p-2 bg-[#1877F2]/10 rounded-lg hover:bg-[#1877F2]/20 transition" title="Facebook">
          <Facebook className="w-4 h-4 text-[#1877F2]" />
        </a>
        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="p-2 bg-[#25D366]/10 rounded-lg hover:bg-[#25D366]/20 transition" title="WhatsApp">
          <svg className="w-4 h-4 text-[#25D366]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.032 21.97c-1.808 0-3.57-.44-5.103-1.28l-5.062 1.33 1.354-4.94C2.57 15.49 2.03 13.77 2.03 11.96c0-5.52 4.48-10 10-10s10 4.48 10 10-4.48 10-10 10zm0-18c-4.41 0-8 3.59-8 8 0 1.66.46 3.26 1.33 4.66l-.87 3.18 3.28-.86c1.37.79 2.92 1.22 4.56 1.22 4.41 0 8-3.59 8-8s-3.59-8-8-8z"/>
          </svg>
        </a>
      </div>
    </div>
  );
};

// معالج رابط GitHub
const handleGithubClick = (githubLink) => {
  if (!githubLink || githubLink === "Private") {
    Swal.fire({
      icon: "info",
      title: "المصدر غير متاح",
      text: "عذراً، المصدر البرمجي لهذا المشروع خاص أو غير متاح حالياً.",
      confirmButtonColor: "#6366f1",
      background: "#030014",
      color: "#ffffff",
    });
    return false;
  }
  return true;
};

const ProjectDetails = () => {
  const { id, slug } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    const fetchProject = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log("🔍 جلب المشروع:", id || slug);
        
      
        const projectData = await projectService.getProjectByIdOrSlug(id || slug);
        
        if (!projectData) {
          setError("المشروع غير موجود");
          return;
        }
        
        console.log("✅ تم جلب المشروع:", projectData);
        
        setProject({
          id: projectData.id,
          slug: projectData.slug,
          title: projectData.title || "بدون عنوان",
          description: projectData.description || "لا يوجد وصف لهذا المشروع",
          content: projectData.content || projectData.description || "لا يوجد محتوى تفصيلي",
          image: projectData.image || null,
          technologies: Array.isArray(projectData.technologies) ? projectData.technologies : [],
          features: Array.isArray(projectData.features) ? projectData.features : [],
          live_url: projectData.live_url || null,
          github_url: projectData.github_url || null,
          status: projectData.status || "draft",
          is_featured: projectData.is_featured || false,
          category: projectData.category || null,
          created_at: projectData.created_at || null,
          updated_at: projectData.updated_at || null
        });
        
      } catch (err) {
        console.error("❌ خطأ في جلب المشروع:", err);
        setError(err.message || "فشل في تحميل المشروع");
      } finally {
        setLoading(false);
      }
    };
    
    if (id || slug) {
      fetchProject();
    }
  }, [id, slug]);

  const handleGoBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  // حالة التحميل مع Lottie
  if (loading) {
    return <LoadingAnimation />;
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-[#030014] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <XCircle className="w-20 h-20 text-red-500/50 mx-auto mb-6" />
          <h2 className="text-2xl text-white mb-3">المشروع غير موجود</h2>
          <p className="text-gray-400 mb-8">
            {error || "عذراً، لم نتمكن من العثور على المشروع الذي تبحث عنه."}
          </p>
          <button
            onClick={handleGoBack}
            className="px-8 py-3 bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white rounded-xl font-semibold hover:scale-105 transition"
          >
            العودة للصفحة الرئيسية
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#030014] overflow-hidden">
      <AnimatedBackground />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 py-12">
        <button
          onClick={handleGoBack}
          className="flex items-center gap-2 mb-8 text-gray-400 hover:text-white transition group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition" />
          العودة
        </button>

        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 mb-8">
          <span>المشاريع</span>
          <ChevronRight className="w-4 h-4" />
          <span className="text-white truncate max-w-[200px] md:max-w-md">{project.title}</span>
          
          {project.status === "draft" ? (
            <span className="flex items-center gap-1 px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-lg">
              <EyeOff className="w-3 h-3" />
              مسودة
            </span>
          ) : (
            <span className="flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-lg">
              <Eye className="w-3 h-3" />
              منشور
            </span>
          )}
          
          {project.is_featured && (
            <span className="flex items-center gap-1 px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-lg">
              <Star className="w-3 h-3" />
              مميز
            </span>
          )}
        </div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          
          {/* الجزء الأيمن */}
          <div className="space-y-8">
            
            <div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 bg-clip-text text-transparent mb-4">
                {project.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-sm">
                {project.category ? (
                  <div className="flex items-center gap-1 text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full">
                    <Tag className="w-3 h-3" />
                    <span>{project.category}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-gray-500 bg-white/5 px-3 py-1 rounded-full">
                    <Tag className="w-3 h-3" />
                    <span>بدون تصنيف</span>
                  </div>
                )}

                {project.created_at && (
                  <div className="flex items-center gap-1 text-gray-400">
                    <Calendar className="w-3 h-3" />
                    <span>أضيف في: {new Date(project.created_at).toLocaleDateString('ar-SA')}</span>
                  </div>
                )}
              </div>
            </div>

            <ShareButtons project={project} />

            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-400" />
                نظرة عامة
              </h2>
              <p className="text-gray-300 leading-relaxed">
                {project.description}
              </p>
            </div>

            {project.content && project.content !== project.description && (
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <Info className="w-4 h-4 text-purple-400" />
                  وصف تفصيلي
                </h2>
                <p className="text-gray-300 leading-relaxed whitespace-pre-line">
                  {project.content}
                </p>
              </div>
            )}

            <div className="flex flex-wrap gap-4 pt-4">
              {project.live_url ? (
                <a
  href={project.live_url}
  target="_blank"
  rel="noopener noreferrer"
  className="px-6 py-3 bg-gradient-to-r from-[#6366f1] to-[#a855f7] rounded-xl flex items-center gap-2 hover:scale-105 transition font-medium text-white"
>
  <ExternalLink className="w-4 h-4" />
  معاينة المشروع
</a>
              ) : (
                <div className="px-6 py-3 bg-white/5 rounded-xl flex items-center gap-2 text-gray-400 cursor-not-allowed">
                  <ExternalLink className="w-4 h-4" />
                  لا يوجد رابط معاينة
                </div>
              )}

              {project.github_url ? (
                <a
                  href={project.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => !handleGithubClick(project.github_url) && e.preventDefault()}
                  className="px-6 py-3 border border-white/20 rounded-xl flex items-center gap-2 hover:bg-white/5 transition font-medium"
                >
                  <Github className="w-4 h-4" />
                  مستودع GitHub
                </a>
              ) : (
                <div className="px-6 py-3 border border-white/20 rounded-xl flex items-center gap-2 text-gray-400 cursor-not-allowed">
                  <Github className="w-4 h-4" />
                  لا يوجد مستودع
                </div>
              )}
            </div>

            <div className="pt-4">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Code2 className="w-5 h-5 text-purple-400" />
                التقنيات المستخدمة
              </h3>

              {project.technologies.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                  {project.technologies.map((tech, index) => (
                    <TechBadge key={index} tech={tech} />
                  ))}
                </div>
              ) : (
                <EmptySection
                  icon={Package}
                  title="لا توجد تقنيات مضافة"
                  message="لم يتم إضافة أي تقنيات لهذا المشروع بعد"
                />
              )}
            </div>

            <div className="pt-4">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
  <Star className="w-5 h-5 text-yellow-400" />
  الميزات الرئيسية
</h3>

              {project.features.length > 0 ? (
                <ul className="space-y-3 bg-white/5 rounded-xl p-6 border border-white/10">
                  {project.features.map((feature, index) => (
                    <FeatureItem key={index} feature={feature} />
                  ))}
                </ul>
              ) : (
                <EmptySection
                  icon={Star}
                  title="لا توجد ميزات مضافة"
                  message="لم يتم إضافة أي ميزات لهذا المشروع بعد"
                />
              )}
            </div>
          </div>

          {/* الجزء الأيسر - الصورة */}
          <div className="lg:col-span-1">
            {project.image ? (
              <div className="sticky top-24">
                <div className="relative rounded-2xl overflow-hidden border border-white/10 group bg-white/5">
                  <div className="flex items-center justify-center p-4 min-h-[300px] md:min-h-[400px]">
                    {!imageLoaded && !imageError && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-10 h-10 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
                      </div>
                    )}
                    
                    <img
                      src={project.image}
                      alt={project.title}
                      className={`max-w-full h-auto rounded-lg shadow-2xl transition-opacity duration-500 ${
                        imageLoaded ? 'opacity-100' : 'opacity-0'
                      }`}
                      style={{ maxHeight: '70vh', width: 'auto', objectFit: 'contain' }}
                      onLoad={() => {
                        setImageLoaded(true);
                        setImageError(false);
                      }}
                      onError={() => {
                        setImageError(true);
                        setImageLoaded(true);
                      }}
                    />
                  </div>
                  
                  <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/50 backdrop-blur rounded text-xs text-gray-300">
                    صورة المشروع
                  </div>

                  {imageError && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                      <div className="text-center">
                        <XCircle className="w-12 h-12 text-red-500/50 mx-auto mb-2" />
                        <p className="text-sm text-gray-400">فشل تحميل الصورة</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="sticky top-24 h-96 bg-gradient-to-br from-white/5 to-white/10 rounded-2xl flex items-center justify-center border border-white/10">
                <div className="text-center">
                  <Layers className="w-16 h-16 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">لا توجد صورة لهذا المشروع</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {project.updated_at && (
          <div className="mt-12 pt-6 border-t border-white/10 text-center text-xs text-gray-500">
            آخر تحديث: {new Date(project.updated_at).toLocaleDateString('ar-SA')}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetails;
