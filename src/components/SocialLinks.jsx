import React from 'react';
import {
  Github,
  Linkedin,
  Instagram,
  Facebook,
  Youtube,
  Twitter,
  Mail,
  Globe,
  MessageCircle  // لإضافة أيقونة WhatsApp
} from 'lucide-react';
// مكون رابط غير متوفر
const UnavailableLink = ({ platform }) => (
  <div className="group relative cursor-not-allowed opacity-50">
    <div className="relative w-12 h-12 sm:w-14 sm:h-14 bg-white/5 rounded-xl flex items-center justify-center border border-white/10">
      {platform === 'github' && <Github className="w-6 h-6 text-gray-600" />}
      {platform === 'linkedin' && <Linkedin className="w-6 h-6 text-gray-600" />}
      {platform === 'instagram' && <Instagram className="w-6 h-6 text-gray-600" />}
      {platform === 'facebook' && <Facebook className="w-6 h-6 text-gray-600" />}
      {platform === 'youtube' && <Youtube className="w-6 h-6 text-gray-600" />}
      {platform === 'twitter' && <Twitter className="w-6 h-6 text-gray-600" />}
      {platform === 'email' && <Mail className="w-6 h-6 text-gray-600" />}
      {platform === 'website' && <Globe className="w-6 h-6 text-gray-600" />}
      {platform === 'whatsapp' && <MessageCircle className="w-6 h-6 text-gray-600" />}
    </div>
    <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 
                 text-xs text-gray-500 bg-black/80 backdrop-blur-sm 
                 px-2 py-1 rounded opacity-0 group-hover:opacity-100 
                 transition-opacity duration-300 whitespace-nowrap z-50">
      Not available
    </span>
  </div>
);

const SocialLinks = ({ 
  links = {}, 
  isPaid = false, 
  isFreePlan = false, 
  adminLinks = {} 
}) => {
  // تحديد الروابط المستخدمة
  const usedLinks = isFreePlan ? adminLinks : links;
  
  const socialIcons = [
    { icon: Github, platform: 'github', label: 'GitHub', color: 'hover:bg-[#333]' },
    { icon: Linkedin, platform: 'linkedin', label: 'LinkedIn', color: 'hover:bg-[#0077b5]' },
    { icon: Instagram, platform: 'instagram', label: 'Instagram', color: 'hover:bg-[#e4405f]' },
    { icon: Facebook, platform: 'facebook', label: 'Facebook', color: 'hover:bg-[#1877f2]' },
    { icon: Youtube, platform: 'youtube', label: 'YouTube', color: 'hover:bg-[#ff0000]' },
    { icon: Twitter, platform: 'twitter', label: 'Twitter', color: 'hover:bg-[#1da1f2]' },
    { icon: Mail, platform: 'email', label: 'Email', color: 'hover:bg-[#6366f1]' },
    { icon: Globe, platform: 'website', label: 'Website', color: 'hover:bg-[#a855f7]' },
    { icon: MessageCircle, platform: 'whatsapp', label: 'WhatsApp', color: 'hover:bg-[#25D366]' }
  ];

  // التحقق من وجود أي روابط (بدون استخدام try/catch مع optional chaining)
  const hasAnyLinks = socialIcons.some(({ platform }) => 
    usedLinks?.[platform] && usedLinks[platform].trim() !== ''
  );

  if (!hasAnyLinks && !isFreePlan) return null;

  return (
    <div className="w-full">
      {/* عنوان */}
      {isPaid && (
        <h3 className="text-sm text-gray-400 mb-3 text-center lg:text-right">
          Connect with me
        </h3>
      )}

      {/* الأيقونات */}
      <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
        {socialIcons.map(({ icon: Icon, platform, label, color }) => {
          const link = usedLinks?.[platform];
          const hasValidLink = link && typeof link === 'string' && link.trim() !== '';
          
          // إذا كان الرابط موجوداً
          if (hasValidLink) {
            return (
              <a
                key={platform}
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative"
                aria-label={label}
              >
                {/* glow effect */}
                <div className={`absolute inset-0 ${color.replace('hover:', '')} rounded-lg blur opacity-0 group-hover:opacity-50 transition duration-300`}></div>
                
                {/* الأيقونة */}
                <div className={`
                  relative w-12 h-12 sm:w-14 sm:h-14 
                  bg-white/5 backdrop-blur-sm 
                  rounded-xl 
                  flex items-center justify-center 
                  transition-all duration-300 
                  border border-white/10 
                  group-hover:border-white/20 
                  group-hover:scale-110
                  group-hover:shadow-lg
                  ${color}
                `}>
                  <Icon className="w-6 h-6 sm:w-6 sm:h-6 text-gray-400 group-hover:text-white transition-colors" />
                </div>

                {/* tooltip */}
                <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 
                             text-xs text-white bg-black/80 backdrop-blur-sm 
                             px-2 py-1 rounded opacity-0 group-hover:opacity-100 
                             transition-opacity duration-300 whitespace-nowrap z-50">
                  {label}
                </span>
              </a>
            );
          }
          
          // إذا كان الرابط غير موجود، نعرض نسخة معتمة
          return <UnavailableLink key={platform} platform={platform} />;
        })}
      </div>

      {/* إشعار الباقة المجانية */}
      {isFreePlan && (
        <p className="text-xs text-yellow-500/70 mt-4 text-center lg:text-right">
          ✨ Free Plan - Showing admin contacts
        </p>
      )}
    </div>
  );
};

export default SocialLinks;
