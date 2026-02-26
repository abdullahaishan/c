import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Code, Sparkles, Rocket, Award, Users } from 'lucide-react';

const LoadingPortfolio = ({ username }) => {
  const [progress, setProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);

  // رسائل قصيرة وجذابة
  const messages = [
    { text: "اكتشف مهارات احترافية", icon: <Code className="w-5 h-5" /> },
    { text: "مشاريع مميزة", icon: <Rocket className="w-5 h-5" /> },
    { text: "شهادات معتمدة", icon: <Award className="w-5 h-5" /> },
    { text: "تواصل مع مطورين", icon: <Users className="w-5 h-5" /> },
    { text: "تصميم متجاوب", icon: <Sparkles className="w-5 h-5" /> },
  ];

  useEffect(() => {
    // ✅ تقدم سريع إلى 100% (2 ثانية)
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2;
      });
    }, 40);

    // تغيير الرسالة كل ثانية
    const msgInterval = setInterval(() => {
      setMessageIndex(prev => (prev + 1) % messages.length);
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(msgInterval);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-[#030014] z-50 flex items-center justify-center overflow-hidden">
      {/* خلفية ناعمة */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-900/10 via-transparent to-blue-900/10" />
      </div>

      <div className="relative z-10 text-center px-4 max-w-md">
        {/* Logo متحرك */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="w-20 h-20 mx-auto mb-6 rounded-full border-2 border-dashed border-purple-500/30 flex items-center justify-center"
        >
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#6366f1] to-[#a855f7] flex items-center justify-center">
            <Code className="w-8 h-8 text-white" />
          </div>
        </motion.div>

        {/* اسم المستخدم */}
        <h2 className="text-2xl font-bold text-white mb-2">@{username}</h2>
        
        {/* رسالة متغيرة مع أيقونة */}
        <motion.div
          key={messageIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="flex items-center justify-center gap-2 text-gray-300 mb-6"
        >
          {messages[messageIndex].icon}
          <span>{messages[messageIndex].text}</span>
        </motion.div>

        {/* شريط التقدم */}
        <div className="space-y-2 mb-4">
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-[#6366f1] to-[#a855f7]"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-gray-500">{progress}%</p>
        </div>

        {/* إحصائيات صغيرة */}
        <div className="flex justify-center gap-4 text-xs text-gray-500">
          <span>✨ 1000+</span>
          <span>🚀 500+</span>
          <span>💎 24/7</span>
        </div>
      </div>
    </div>
  );
};

export default LoadingPortfolio;
