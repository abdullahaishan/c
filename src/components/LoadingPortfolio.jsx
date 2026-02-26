import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Rocket, Sparkles, Globe, Award, Users, Heart, Code, Zap,
  CheckCircle, Loader
} from 'lucide-react';

const LoadingPortfolio = ({ username }) => {
  const [progress, setProgress] = useState(0);
  const [currentMessage, setCurrentMessage] = useState(0);

  // رسائل تحفيزية جذابة للزوار
  const messages = [
    {
      icon: <Rocket className="w-12 h-12 text-purple-400" />,
      title: "انطلق إلى عالم الاحترافية",
      text: "نحن نجهز لك أفضل تجربة لعرض المهارات والمشاريع",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: <Sparkles className="w-12 h-12 text-yellow-400" />,
      title: "محتوى حصري ومنظم",
      text: "كل مهارة وشهادة في مكانها المناسب لتعكس خبرتك",
      color: "from-yellow-500 to-orange-500"
    },
    {
      icon: <Globe className="w-12 h-12 text-blue-400" />,
      title: "تواصل مع العالم",
      text: "اعرض أعمالك للمطورين والشركات من جميع أنحاء العالم",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: <Award className="w-12 h-12 text-green-400" />,
      title: "شهادات معتمدة",
      text: "وثق مهاراتك بشهادات مهنية تزيد من فرصك الوظيفية",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: <Users className="w-12 h-12 text-pink-400" />,
      title: "مجتمع المبدعين",
      text: "تواصل مع مطورين آخرين وشارك الخبرات والمعرفة",
      color: "from-pink-500 to-rose-500"
    }
  ];

  useEffect(() => {
    // تقدم سلس حتى 100%
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 1;
      });
    }, 50);

    // تغيير الرسالة كل 3 ثواني
    const messageInterval = setInterval(() => {
      setCurrentMessage(prev => (prev + 1) % messages.length);
    }, 3000);

    return () => {
      clearInterval(interval);
      clearInterval(messageInterval);
    };
  }, []);

  const currentMsg = messages[currentMessage];

  return (
    <div className="fixed inset-0 bg-[#030014] z-50 flex items-center justify-center overflow-hidden">
      {/* خلفية متحركة متطورة */}
      <div className="absolute inset-0">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
            rotate: [0, 90, 0],
          }}
          transition={{ duration: 15, repeat: Infinity }}
          className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full mix-blend-multiply filter blur-[128px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
            rotate: [0, -90, 0],
          }}
          transition={{ duration: 18, repeat: Infinity }}
          className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full mix-blend-multiply filter blur-[128px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.15, 0.3, 0.15],
          }}
          transition={{ duration: 12, repeat: Infinity }}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-yellow-600 to-orange-600 rounded-full mix-blend-multiply filter blur-[128px]"
        />
        
        {/* شبكة خلفية متحركة */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f20_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f20_1px,transparent_1px)] bg-[size:64px_64px]" />
      </div>

      {/* المحتوى الرئيسي */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-4">
        <div className="text-center">
          {/* الشعار مع تأثير */}
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, type: "spring" }}
            className="mb-8"
          >
            <div className="relative inline-block">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-full border-2 border-dashed border-purple-500/30"
              />
              <div className="relative bg-gradient-to-r from-[#6366f1] to-[#a855f7] p-6 rounded-2xl">
                <h1 className="text-5xl font-bold text-white">
                  Portfolio<span className="text-white/70">-v5</span>
                </h1>
              </div>
            </div>
            <p className="text-gray-400 mt-3 text-lg">@{username}</p>
          </motion.div>

          {/* بطاقة الرسالة المتحركة */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentMessage}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -30, scale: 0.9 }}
              transition={{ duration: 0.6, type: "spring" }}
              className="mb-10"
            >
              <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 max-w-2xl mx-auto">
                {/* أيقونة متحركة */}
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -10, 0]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="flex justify-center mb-6"
                >
                  <div className={`w-24 h-24 rounded-full bg-gradient-to-r ${currentMsg.color} bg-opacity-20 flex items-center justify-center`}>
                    <div className="w-20 h-20 rounded-full bg-gradient-to-r ${currentMsg.color} flex items-center justify-center">
                      {currentMsg.icon}
                    </div>
                  </div>
                </motion.div>

                <h2 className="text-3xl font-bold text-white mb-3">
                  {currentMsg.title}
                </h2>
                <p className="text-gray-300 text-lg leading-relaxed">
                  {currentMsg.text}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* شريط التقدم المتطور */}
          <div className="max-w-xl mx-auto space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">تقدم التحميل</span>
              <span className="text-[#a855f7] font-bold">{progress}%</span>
            </div>
            
            <div className="h-3 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-[#6366f1] to-[#a855f7]"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            {/* رسالة حسب التقدم */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              className="text-sm text-gray-400"
            >
              {progress < 30 && '🔍 تجهيز أفضل المحتوى لك...'}
              {progress >= 30 && progress < 60 && '🚀 نقوم بتنظيم المهارات والمشاريع...'}
              {progress >= 60 && progress < 90 && '✨ تجهيز واجهة احترافية...'}
              {progress >= 90 && '🎯 على وشك الانتهاء...'}
            </motion.p>
          </div>

          {/* إحصائيات سريعة لجذب الزوار */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-12 grid grid-cols-3 gap-6 max-w-lg mx-auto"
          >
            <div className="text-center">
              <div className="text-3xl font-bold text-[#a855f7]">1000+</div>
              <div className="text-xs text-gray-500">مستخدم نشط</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#a855f7]">5000+</div>
              <div className="text-xs text-gray-500">مشروع منشور</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#a855f7]">24/7</div>
              <div className="text-xs text-gray-500">دعم فني</div>
            </div>
          </motion.div>

          {/* نقاط التحميل المتحركة */}
          <div className="mt-8 flex justify-center gap-2">
            {messages.map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  scale: i === currentMessage ? [1, 1.3, 1] : 1,
                  opacity: i === currentMessage ? 1 : 0.3
                }}
                transition={{ duration: 0.5, repeat: i === currentMessage ? Infinity : 0 }}
                className={`w-2 h-2 rounded-full ${
                  i === currentMessage ? 'bg-[#a855f7] w-4' : 'bg-white/20'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingPortfolio;
