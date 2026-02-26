import React from 'react';
import {
  Github,
  Linkedin,
  Instagram,
  Facebook,
  Youtube,
  Twitter,
  Mail,
  Globe
} from 'lucide-react';

const SocialLinks = ({ links, isPaid = false, isFreePlan = false, adminLinks = {} }) => {
  // تحديد الروابط المستخدمة
  const usedLinks = isFreePlan ? adminLinks : links;
  
  // ترتيب الأيقونات مع ألوانها
  const socialIcons = [
    { icon: Github, platform: 'github', label: 'GitHub', color: 'hover:bg-[#333]', bg: 'bg-[#333]' },
    { icon: Linkedin, platform: 'linkedin', label: 'LinkedIn', color: 'hover:bg-[#0077b5]', bg: 'bg-[#0077b5]' },
    { icon: Instagram, platform: 'instagram', label: 'Instagram', color: 'hover:bg-[#e4405f]', bg: 'bg-[#e4405f]' },
    { icon: Facebook, platform: 'facebook', label: 'Facebook', color: 'hover:bg-[#1877f2]', bg: 'bg-[#1877f2]' },
    { icon: Youtube, platform: 'youtube', label: 'YouTube', color: 'hover:bg-[#ff0000]', bg: 'bg-[#ff0000]' },
    { icon: Twitter, platform: 'twitter', label: 'Twitter', color: 'hover:bg-[#1da1f2]', bg: 'bg-[#1da1f2]' },
    { icon: Mail, platform: 'email', label: 'Email', color: 'hover:bg-[#6366f1]', bg: 'bg-[#6366f1]' },
    { icon: Globe, platform: 'website', label: 'Website', color: 'hover:bg-[#a855f7]', bg: 'bg-[#a855f7]' }
  ];

  // تصفية الروابط الموجودة فقط
  const availableLinks = socialIcons.filter(({ platform }) => usedLinks[platform]);

  // إذا لم توجد روابط، لا تعرض شيئاً
  if (availableLinks.length === 0) return null;

  return (
    <div className="w-full">
      {/* عنوان - يظهر فقط للباقة المدفوعة */}
      {isPaid && availableLinks.length > 0 && (
        <h3 className="text-sm text-gray-400 mb-3 text-center lg:text-right">
          Connect with me
        </h3>
      )}

      {/* الأيقونات - تصميم أفقي متجاوب */}
      <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
        {availableLinks.map(({ icon: Icon, platform, label, color, bg }) => (
          <a
            key={platform}
            href={usedLinks[platform]}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative"
            aria-label={label}
          >
            {/* glow effect - يظهر عند hover */}
            <div className={`absolute inset-0 ${bg} rounded-lg blur opacity-0 group-hover:opacity-50 transition duration-300`}></div>
            
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

            {/* tooltip - يظهر عند hover على الشاشات الكبيرة */}
            <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 
                         text-xs text-white bg-black/80 backdrop-blur-sm 
                         px-2 py-1 rounded opacity-0 group-hover:opacity-100 
                         transition-opacity duration-300 whitespace-nowrap
                         hidden sm:block z-50">
              {label}
            </span>
          </a>
        ))}
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
