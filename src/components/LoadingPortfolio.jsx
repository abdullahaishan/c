import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Code, Sparkles, User, Briefcase, Award, Clock, 
  AlertCircle, CheckCircle, XCircle, Database, Link as LinkIcon,
  Image, FileText, Loader
} from 'lucide-react';
import { loadingTracker } from '../lib/loadingTracker';
import { developerService } from '../lib/supabase';

const LoadingPortfolio = ({ username, onComplete, onError }) => {
  const [progress, setProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState('Starting...');
  const [loadedTables, setLoadedTables] = useState({});
  const [failedTables, setFailedTables] = useState({});
  const [error, setError] = useState(null);
  const [startTime] = useState(Date.now());
  const [developerId, setDeveloperId] = useState(null);

  // Tables configuration
  const tables = [
    { id: 'developers', name: 'Developer Profile', icon: User, weight: 15 },
    { id: 'skills', name: 'Skills', icon: Code, weight: 20 },
    { id: 'projects', name: 'Projects', icon: Briefcase, weight: 20 },
    { id: 'certificates', name: 'Certificates', icon: Award, weight: 15 },
    { id: 'experience', name: 'Experience', icon: Clock, weight: 15 },
    { id: 'education', name: 'Education', icon: Database, weight: 10 },
    { id: 'social_links', name: 'Social Links', icon: LinkIcon, weight: 5 },
  ];

  useEffect(() => {
    let mounted = true;

    const startLoading = async () => {
      try {
        // 1. أولاً: جلب الـ developer ID
        setCurrentStage('Finding developer...');
        const developer = await developerService.getByUsername(username);
        
        if (!developer) {
          throw new Error('Developer not found');
        }

        setDeveloperId(developer.id);
        setLoadedTables(prev => ({ ...prev, developers: true }));

        // 2. تحميل كل الجداول بالتوازي
        setCurrentStage('Loading portfolio data...');
        
        const results = await loadingTracker.loadAll(developer.id, (progress) => {
          if (!mounted) return;
          
          // تحديث الحالة لكل جدول
          const { completed, total, currentTable, result } = progress;
          
          if (result.success) {
            setLoadedTables(prev => ({ ...prev, [currentTable]: true }));
          } else {
            setFailedTables(prev => ({ ...prev, [currentTable]: true }));
          }
          
          // تحديث شريط التقدم
          const newProgress = (completed / total) * 100;
          setProgress(newProgress);
          
          // تحديث المرحلة الحالية
          setCurrentStage(`Loading ${currentTable}...`);
        });

        // 3. اكتمل التحميل
        if (mounted) {
          setProgress(100);
          setCurrentStage('Complete!');
          
          console.log('📊 Loading Summary:', results.summary);
          
          // إذا كان هناك جداول فشلت
          if (results.summary.failed > 0) {
            onError?.({
              message: `Failed to load ${results.summary.failed} sections`,
              failed: results.summary.failedTables,
              results: results.results
            });
          }
          
          // نكمل مع البيانات المتوفرة
          setTimeout(() => onComplete?.(results.results), 500);
        }

      } catch (err) {
        console.error('❌ Loading error:', err);
        if (mounted) {
          setError(err.message);
          onError?.({ message: err.message, fatal: true });
        }
      }
    };

    startLoading();

    // Safety timeout (30 seconds)
    const safetyTimeout = setTimeout(() => {
      if (mounted && progress < 100) {
        setError('Loading took too long');
        onError?.({ message: 'Loading timeout', timeout: true });
      }
    }, 30000);

    return () => {
      mounted = false;
      clearTimeout(safetyTimeout);
    };
  }, [username]);

  const elapsedSeconds = ((Date.now() - startTime) / 1000).toFixed(1);

  return (
    <div className="fixed inset-0 bg-[#030014] z-50 flex items-center justify-center overflow-hidden">
      {/* Background Animation */}
      <div className="absolute inset-0">
        <motion.div
          animate={{ x: [0, 100, -50, 0], y: [0, -50, 50, 0] }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute top-20 left-20 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-20"
        />
        <motion.div
          animate={{ x: [0, -80, 40, 0], y: [0, 60, -30, 0] }}
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
          className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10"
        >
          {/* Current Stage */}
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-gradient-to-r from-[#6366f1]/20 to-[#a855f7]/20 rounded-xl">
              {currentStage.includes('Loading') ? (
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
                Time: {elapsedSeconds}s
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Overall Progress</span>
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

          {/* Error Display */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl"
              >
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-red-400 text-sm font-medium mb-2">
                      {error}
                    </p>
                    <button
                      onClick={() => window.location.reload()}
                      className="text-xs px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all"
                    >
                      Retry
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tips */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            className="mt-6 text-center"
          >
            <p className="text-xs text-gray-500">
              {progress < 30 && '🔍 Fetching developer data...'}
              {progress >= 30 && progress < 60 && '📦 Loading projects and skills...'}
              {progress >= 60 && progress < 90 && '✨ Preparing your portfolio...'}
              {progress >= 90 && '🎯 Almost ready...'}
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
