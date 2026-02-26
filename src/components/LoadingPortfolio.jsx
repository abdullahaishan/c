import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Rocket, Zap, Globe, Award, Users, Code, Heart,
  CheckCircle, Loader
} from 'lucide-react';
import { developerService } from '../lib/supabase';

const LoadingPortfolio = ({ username, onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [currentMessage, setCurrentMessage] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  // رسائل تحفيزية وجذابة للزوار
  const messages = [
    {
      icon: <Rocket className="w-12 h-12 text-purple-400" />,
      title: "انطلق إلى عالم الاحترافية",
      text: "نحن نجهز لك أفضل تجربة لعرض المهارات والمشاريع"
    },
    {
      icon: <Sparkles className="w-12 h-12 text-yellow-400" />,
      title: "محتوى حصري ومنظم",
      text: "كل مهارة وشهادة في مكانها المناسب لتعكس خبرتك الحقيقية"
    },
    {
      icon: <Globe className="w-12 h-12 text-blue-400" />,
      title: "تواصل مع العالم",
      text: "اعرض أعمالك للمطورين والشركات من جميع أنحاء العالم"
    },
    {
      icon: <Award className="w-12 h-12 text-green-400" />,
      title: "شهادات معتمدة",
      text: "وثق مهاراتك بشهادات مهنية تزيد من فرصك الوظيفية"
    },
    {
      icon: <Users className="w-12 h-12 text-pink-400" />,
      title: "انضم لمجتمع المبدعين",
      text: "تواصل مع مطورين آخرين وشارك الخبرات والمعرفة"
    },
    {
      icon: <Heart className="w-12 h-12 text-red-400" />,
      title: "صمم بحب واحترافية",
      text: "واجهة مستخدم سلسة وتجربة تفاعلية لا تُنسى"
    }
  ];

  useEffect(() => {
    let mounted = true;
    
    // تغيير الرسالة كل 3 ثواني
    const messageInterval = setInterval(() => {
      setCurrentMessage(prev => (prev + 1) % messages.length);
    }, 3000);

    // محاكاة التقدم السلس
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) return prev;
        return prev + 1;
      });
    }, 50);

    // التحميل الحقيقي في الخلفية
    const loadData = async () => {
      try {
        const data = await developerService.getByUsername(username);
        
        if (mounted && data) {
          setProgress(100);
          setIsLoaded(true);
          
          // تأخير بسيط قبل الانتقال
          setTimeout(() => {
            onComplete?.(data);
          }, 1500);
        }
      } catch (err) {
        console.error('❌ خطأ في التحميل:', err);
        // حتى لو فشل، نكمل مع رسالة خطأ لطيفة
        setTimeout(() => {
          onComplete?.(null);
        }, 3000);
      }
    };

    loadData();

    return () => {
      mounted = false;
      clearInterval(messageInterval);
      clearInterval(progressInterval);
    };
  }, [username]);

  const currentMsg = messages[currentMessage];

  return (
    <div className="fixed inset-0 bg-[#030014] z-50 flex items-center justify-center overflow-hidden">
      {/* خلفية متحركة */}
      <div className="absolute inset-0">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-20 left-20 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-[128px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute bottom-20 right-20 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-[128px]"
        />
      </div>

      {/* المحتوى الرئيسي */}
      <div className="relative z-10 w-full max-w-2xl mx-auto px-4 text-center">
        
        {/* الشعار */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-12"
        >
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#6366f1] to-[#a855f7]">
            Portfolio<span className="text-white">-v5</span>
          </h1>
          <p className="text-gray-400 mt-2">@{username}</p>
        </motion.div>

        {/* الرسالة المتحركة */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentMessage}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="flex justify-center mb-4">
              <div className="relative">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 rounded-full border-2 border-dashed border-purple-500/30"
                />
                <div className="relative w-24 h-24 bg-gradient-to-br from-[#6366f1]/20 to-[#a855f7]/20 rounded-full flex items-center justify-center">
                  {currentMsg.icon}
                </div>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {currentMsg.title}
            </h2>
            <p className="text-gray-400 max-w-md mx-auto">
              {currentMsg.text}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* شريط التقدم */}
        <div className="max-w-md mx-auto space-y-3">
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-[#6366f1] to-[#a855f7]"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">
              {isLoaded ? '✅ جاهز!' : '⚡ تجهيز المنصة...'}
            </span>
            <span className="text-[#a855f7] font-semibold">
              {progress}%
            </span>
          </div>
        </div>

        {/* إحصائيات سريعة */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-12 grid grid-cols-3 gap-4 max-w-md mx-auto"
        >
          <div className="text-center">
            <div className="text-2xl font-bold text-[#a855f7]">1000+</div>
            <div className="text-xs text-gray-500">مستخدم</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-[#a855f7]">5000+</div>
            <div className="text-xs text-gray-500">مشروع</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-[#a855f7]">24/7</div>
            <div className="text-xs text-gray-500">دعم</div>
          </div>
        </motion.div>

        {/* نقاط التحميل */}
        <div className="mt-8 flex justify-center gap-2">
          {messages.map((_, i) => (
            <motion.div
              key={i}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i === currentMessage ? 'w-6 bg-[#a855f7]' : 'bg-white/20'
              }`}
              animate={i === currentMessage ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 0.5, repeat: Infinity }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoadingPortfolio;
