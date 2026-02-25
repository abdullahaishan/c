import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, ArrowRight, Github } from 'lucide-react';

const CardProject = ({ Img, Title, Description, Link: ProjectLink, Github: GithubLink, id }) => {
  // التحقق من وجود الرابط
  const handleLiveDemo = (e) => {
    if (!ProjectLink) {
      e.preventDefault();
      alert("Live demo link is not available");
    }
  };
  
  const handleGithubClick = (e) => {
    if (!GithubLink) {
      e.preventDefault();
      alert("GitHub repository is not available");
    }
  };
  
  const handleDetails = (e) => {
    if (!id) {
      e.preventDefault();
      alert("Project details are not available");
    }
  };

  return (
    <div className="group relative w-full">
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-lg border border-white/10 shadow-2xl transition-all duration-300 hover:shadow-purple-500/20">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 opacity-50 group-hover:opacity-70 transition-opacity duration-300"></div>
    
        <div className="relative p-5 z-10">
          {/* صورة المشروع */}
          <div className="relative overflow-hidden rounded-lg aspect-video">
            <img
              src={Img || "/default-project.jpg"}
              alt={Title}
              className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
            {/* Overlay للتأثير عند التمرير */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          
          {/* محتوى البطاقة */}
          <div className="mt-4 space-y-3">
            <h3 className="text-xl font-semibold bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 bg-clip-text text-transparent">
              {Title}
            </h3>
            
            <p className="text-gray-300/80 text-sm leading-relaxed line-clamp-2">
              {Description}
            </p>
            
            {/* الأزرار */}
            <div className="pt-4 flex items-center justify-between">
              {/* زر Live Demo */}
              {ProjectLink ? (
                <a
                  href={ProjectLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleLiveDemo}
                  className="inline-flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors duration-200"
                >
                  <span className="text-sm font-medium">Live Demo</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              ) : (
                <span className="text-gray-500 text-sm">Demo Not Available</span>
              )}
              
              {/* زر Details (يجب أن يربط بصفحة التفاصيل) */}
              {id ? (
                <Link
                  to={`/project/${id}`}
                  onClick={handleDetails}
                  className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/90 transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                >
                  <span className="text-sm font-medium">Details</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <span className="text-gray-500 text-sm">Details Not Available</span>
              )}
            </div>

            {/* زر GitHub (منفصل) - يمكن وضعه تحت الأزرار */}
            {GithubLink && (
              <div className="pt-2">
                <a
                  href={GithubLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleGithubClick}
                  className="inline-flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors"
                >
                  <Github className="w-4 h-4" />
                  <span>View Source</span>
                </a>
              </div>
            )}
          </div>
          
          {/* Border effect */}
          <div className="absolute inset-0 border border-white/0 group-hover:border-purple-500/50 rounded-xl transition-colors duration-300 -z-50"></div>
        </div>
      </div>
    </div>
  );
};

export default CardProject;
