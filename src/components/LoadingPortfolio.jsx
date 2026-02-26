import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Code, Sparkles, User, Briefcase, Award, Clock, 
  AlertCircle, CheckCircle, XCircle, Database, Link as LinkIcon,
  Image, Loader
} from 'lucide-react';
import { supabase } from '../lib/supabase';

const LoadingPortfolio = ({ username, onComplete, onError }) => {
  const [progress, setProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState('Starting...');
  const [loadedTables, setLoadedTables] = useState({});
  const [failedTables, setFailedTables] = useState({});
  const [error, setError] = useState(null);
  const [startTime] = useState(Date.now());
  const [developerId, setDeveloperId] = useState(null);
  const [results, setResults] = useState({});

  // Tables configuration with real database queries
  const tables = [
    { 
      id: 'developers', 
      name: 'Developer Profile', 
      icon: User, 
      query: 'developers',
      weight: 15,
      depends: false 
    },
    { 
      id: 'skills', 
      name: 'Skills', 
      icon: Code, 
      query: 'skills',
      weight: 20,
      depends: true 
    },
    { 
      id: 'projects', 
      name: 'Projects', 
      icon: Briefcase, 
      query: 'projects',
      weight: 20,
      depends: true 
    },
    { 
      id: 'certificates', 
      name: 'Certificates', 
      icon: Award, 
      query: 'certificates',
      weight: 15,
      depends: true 
    },
    { 
      id: 'experience', 
      name: 'Experience', 
      icon: Clock, 
      query: 'experience',
      weight: 15,
      depends: true 
    },
    { 
      id: 'social_links', 
      name: 'Social Links', 
      icon: LinkIcon, 
      query: 'social_links',
      weight: 10,
      depends: true 
    },
    { 
      id: 'profile_image', 
      name: 'Profile Image', 
      icon: Image, 
      query: null,
      weight: 5,
      depends: true 
    },
  ];

  useEffect(() => {
    let mounted = true;
    const loadedData = {};

    const loadDeveloper = async () => {
      try {
        // ✅ الخطوة 1: تحميل بيانات المطور (حقيقي)
        setCurrentStage('Fetching developer profile...');
        
        const { data: developer, error: devError } = await supabase
          .from('developers')
          .select('*')
          .eq('username', username)
          .maybeSingle();

        if (devError) throw devError;
        
        if (!developer) {
          throw new Error(`Developer "${username}" not found`);
        }

        // حفظ ID المطور لاستخدامه في الجداول الأخرى
        const devId = developer.id;
        setDeveloperId(devId);
        loadedData.developers = developer;
        
        if (mounted) {
          setLoadedTables(prev => ({ ...prev, developers: true }));
          setProgress(15);
          setCurrentStage('Developer loaded ✓');
        }

        return devId;
      } catch (err) {
        throw err;
      }
    };

    const loadTable = async (table, devId) => {
      if (!mounted) return;

      setCurrentStage(`Loading ${table.name}...`);
      
      try {
        const startTime = Date.now();
        
        // ✅ طلب حقيقي لـ Supabase
        const { data, error, count } = await supabase
          .from(table.query)
          .select('*', { count: 'exact' })
          .eq('developer_id', devId);

        const loadTime = ((Date.now() - startTime) / 1000).toFixed(2);

        if (error) throw error;

        console.log(`✅ ${table.name}: ${data?.length || 0} items (${loadTime}s)`);

        // حفظ النتائج
        loadedData[table.id] = data || [];

        if (mounted) {
          setLoadedTables(prev => ({ ...prev, [table.id]: true }));
          setCurrentStage(`${table.name} loaded ✓`);
        }

        return { success: true, count: data?.length || 0 };
      } catch (err) {
        console.error(`❌ Failed to load ${table.name}:`, err.message);
        
        if (mounted) {
          setFailedTables(prev => ({ ...prev, [table.id]: true }));
        }
        
        return { success: false, error: err.message };
      }
    };

    const loadProfileImage = async (imageUrl) => {
      if (!imageUrl) {
        if (mounted) {
          setLoadedTables(prev => ({ ...prev, profile_image: true }));
        }
        return { success: true, url: '/Coding.gif' };
      }

      try {
        // التحقق من وجود الصورة
        const response = await fetch(imageUrl, { method: 'HEAD' });
        if (!response.ok) throw new Error('Image not found');
        
        if (mounted) {
          setLoadedTables(prev => ({ ...prev, profile_image: true }));
        }
        
        return { success: true, url: imageUrl };
      } catch (err) {
        console.log('Using default image');
        if (mounted) {
          setLoadedTables(prev => ({ ...prev, profile_image: true }));
        }
        return { success: true, url: '/Coding.gif' };
      }
    };

    const loadAllData = async () => {
      try {
        // ✅ 1. تحميل المطور أولاً
        const devId = await loadDeveloper();
        if (!devId) return;

        // ✅ 2. تحميل كل الجداول بالتوازي
        const dependentTables = tables.filter(t => t.depends && t.query);
        
        const promises = dependentTables.map(table => loadTable(table, devId));
        
        // تنفيذ كل الطلبات بالتوازي
        await Promise.all(promises);

        // ✅ 3. تحميل الصورة الشخصية
        const developer = loadedData.developers;
        await loadProfileImage(developer?.profile_image);

        // ✅ 4. اكتمل التحميل
        if (mounted) {
          setProgress(100);
          setCurrentStage('Complete!');
          
          // تجميع كل النتائج
          const finalData = {
            ...loadedData.developers,
            skills: loadedData.skills || [],
            projects: loadedData.projects || [],
            certificates: loadedData.certificates || [],
            experience: loadedData.experience || [],
            social_links: loadedData.social_links || [],
          };

          const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
          console.log(`✅ Portfolio loaded in ${totalTime}s`);
          
          setTimeout(() => onComplete?.(finalData), 500);
        }

      } catch (err) {
        console.error('❌ Fatal loading error:', err);
        if (mounted) {
          setError(err.message);
          onError?.({ message: err.message, fatal: true });
        }
      }
    };

    loadAllData();

    // Safety timeout (15 seconds)
    const safetyTimeout = setTimeout(() => {
      if (mounted && progress < 100) {
        setError('Loading timeout - please check your connection');
        onError?.({ message: 'Loading timeout', timeout: true });
      }
    }, 15000);

    return () => {
      mounted = false;
      clearTimeout(safetyTimeout);
    };
  }, [username]);

  const elapsedSeconds = ((Date.now() - startTime) / 1000).toFixed(1);

  // Error state
  if (error) {
    return (
      <div className="fixed inset-0 bg-[#030014] z-50 flex items-center justify-center p-4">
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 max-w-md w-full border border-white/10">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Loading Failed</h2>
            <p className="text-gray-400 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white rounded-lg hover:scale-105 transition-all"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[#030014] z-50 flex items-center justify-center overflow-hidden">
      {/* Animated Background */}
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

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-md mx-auto px-4">
        {/* Username Display */}
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

        {/* Loading Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10"
        >
          {/* Current Stage */}
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-gradient-to-r from-[#6366f1]/20 to-[#a855f7]/20 rounded-xl">
              {progress < 100 ? (
                <Loader className="w-5 h-5 text-white animate-spin" />
              ) : (
                <CheckCircle className="w-5 h-5 text-green-400" />
              )}
            </div>
            <div className="flex-1">
              <p className="text-white font-medium">
                {currentStage}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Time: {elapsedSeconds}s • {progress}% complete
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2 mb-6">
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-[#6366f1] to-[#a855f7]"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Tables Status - Real-time */}
          <div className="space-y-3 mb-4">
            {tables.map((table) => (
              <div key={table.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <table.icon className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-300">{table.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  {loadedTables[table.id] && (
                    <>
                      <span className="text-xs text-green-400">Loaded</span>
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    </>
                  )}
                  {failedTables[table.id] && (
                    <>
                      <span className="text-xs text-red-400">Failed</span>
                      <XCircle className="w-4 h-4 text-red-400" />
                    </>
                  )}
                  {!loadedTables[table.id] && !failedTables[table.id] && (
                    <>
                      <span className="text-xs text-gray-500">Loading...</span>
                      <div className="w-4 h-4 border-2 border-t-transparent border-[#6366f1] rounded-full animate-spin" />
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Loading Tips */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            transition={{ delay: 1 }}
            className="mt-6 text-center"
          >
            <p className="text-xs text-gray-500">
              {progress < 30 && '🔍 Fetching developer data from database...'}
              {progress >= 30 && progress < 60 && '📦 Loading projects and skills from Supabase...'}
              {progress >= 60 && progress < 90 && '✨ Preparing your portfolio...'}
              {progress >= 90 && progress < 100 && '🎯 Almost ready...'}
              {progress === 100 && '✅ Portfolio loaded successfully!'}
            </p>
          </motion.div>
        </motion.div>

        {/* Progress Dots */}
        <div className="mt-4 text-center">
          <div className="flex justify-center gap-2">
            {tables.map((table, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  loadedTables[table.id]
                    ? 'bg-green-400'
                    : failedTables[table.id]
                    ? 'bg-red-400'
                    : 'bg-white/20 animate-pulse'
                }`}
              />
            ))}
          </div>
          <p className="text-xs text-gray-600 mt-2">
            {Object.keys(loadedTables).length} of {tables.length} sections loaded
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoadingPortfolio;
