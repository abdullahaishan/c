import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Code, Sparkles, User, Briefcase, Award, Clock, AlertCircle } from 'lucide-react';

const LoadingPortfolio = ({ username, timeout = 8000, onRetry }) => {
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState('جاري الاتصال...');
  const [showTimeout, setShowTimeout] = useState(false);
  const [dots, setDots] = useState('');

  // مراحل التحميل
  const stages = [
    { text: 'جاري الاتصال بالخادم...', icon: <Clock className="w-5 h-5" /> },
    { text: 'جلب بيانات المطور...', icon: <User className="w-5 h-5" /> },
    { text: 'تحميل المهارات...', icon: <Code className="w-5 h-5" /> },
    { text: 'تحميل المشاريع...', icon: <Briefcase className="w-5 h-5" /> },
    { text: 'تحميل الشهادات...', icon: <Award className="w-5 h-5" /> },
    { text: 'تجهيز البورتفليو...', icon: <Sparkles className="w-5 h-5" /> },
  ];

  useEffect(() => {
    // محاكاة تقدم التحميل
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) return prev;
        return prev + 1;
      });
    }, 80);

    // تغيير مرحلة التحميل
    const stageInterval = setInterval(() => {
      setStage(prev => {
        const currentIndex = stages.findIndex(s => s.text === prev);
        const nextIndex = (currentIndex + 1) % stages.length;
        return stages[nextIndex].text;
      });
    }, 1500);

    // تأثير النقاط المتحركة
    const dotsInterval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 400);

    // مؤقت للتحقق من التأخير
    const timeoutTimer = setTimeout(() => {
      setShowTimeout(true);
    }, timeout);

    return () => {
      clearInterval(progressInterval);
      clearInterval(stageInterval);
      clearInterval(dotsInterval);
      clearTimeout(timeoutTimer);
    };
  }, [timeout]);

  const currentStage = stages.find(s => s.text === stage) || stages[0];

  return (
    <div className="fixed inset-0 bg-[#030014] z-50 flex items-center justify-center overflow-hidden">
      {/* خلفية متحركة */}
      <div className="absolute inset-0">
        <motion.div
          animate={{
            x: [0, 100, -50, 0],
            y: [0, -50, 50, 0],
          }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute top-20 left-20 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-20"
        />
        <motion.div
          animate={{
            x: [0, -80, 40, 0],
            y: [0, 60, -30, 0],
          }}
          transition={{ duration: 18, repeat: Infinity }}
          className="absolute top-40 right-20 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-20"
        />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f10_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f10_1px,transparent_1px)] bg-[size:48px_48px]" />
      </div>

      {/* المحتوى الرئيسي */}
      <div className="relative z-10 w-full max-w-md mx-auto px-4">
        {/* الشعار */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-gradient-to-r from-[#6366f1] to-[#a855f7] rounded-full blur-2xl opacity-30" />
            <div className="relative bg-gradient-to-r from-[#6366f1] to-[#a855f7] p-4 rounded-2xl">
              <span className="text-3xl font-bold text-white">@{username}</span>
            </div>
          </div>
        </motion.div>

        {/* بطاقة التحميل */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10"
        >
          {/* المرحلة الحالية */}
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-gradient-to-r from-[#6366f1]/20 to-[#a855f7]/20 rounded-xl">
              {currentStage.icon}
            </div>
            <div className="flex-1">
              <p className="text-white font-medium">
                {stage}
                <span className="text-[#a855f7]">{dots}</span>
              </p>
              <p className="text-xs text-gray-400 mt-1">
                قد يستغرق التحميل بضع ثوان
              </p>
            </div>
          </div>

          {/* شريط التقدم */}
          <div className="space-y-2 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">تقدم التحميل</span>
              <span className="text-[#a855f7] font-semibold">{progress}%</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-[#6366f1] to-[#a855f7]"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* رسالة التأخير - تظهر بعد 8 ثواني */}
          <AnimatePresence>
            {showTimeout && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl"
              >
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-yellow-400 text-sm font-medium mb-2">
                      يستغرق التحميل وقتاً أطول من المعتاد
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={onRetry}
                        className="text-xs px-3 py-1.5 bg-yellow-500/20 text-yellow-400 rounded-lg hover:bg-yellow-500/30 transition-all"
                      >
                        إعادة المحاولة
                      </button>
                      <button
                        onClick={() => window.location.reload()}
                        className="text-xs px-3 py-1.5 bg-white/5 text-gray-300 rounded-lg hover:bg-white/10 transition-all"
                      >
                        تحديث الصفحة
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* نصائح سريعة */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            transition={{ delay: 1 }}
            className="mt-6 text-center"
          >
            <p className="text-xs text-gray-500">
              {progress < 30 && '✨ جاري تجهيز بيانات المطور...'}
              {progress >= 30 && progress < 60 && '🚀 يتم تحميل المشاريع والمهارات...'}
              {progress >= 60 && progress < 90 && '💎 نقوم بتنسيق البورتفليو...'}
              {progress >= 90 && '🎯 على وشك الانتهاء...'}
            </p>
          </motion.div>
        </motion.div>

        {/* شريط التحميل السفلي */}
        <div className="mt-4 text-center">
          <div className="flex justify-center gap-2">
            {stages.map((s, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  stages.findIndex(st => st.text === stage) === i
                    ? 'bg-[#a855f7] w-4'
                    : 'bg-white/20'
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
