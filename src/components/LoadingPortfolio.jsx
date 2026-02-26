import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Code, Sparkles, User, Briefcase, Award, Clock, 
  AlertCircle, CheckCircle, XCircle, Database, Link as LinkIcon,
  Image, FileText, Github, Linkedin, Globe
} from 'lucide-react';

const LoadingPortfolio = ({ username, onComplete, onError }) => {
  const [progress, setProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState('Connecting...');
  const [loadedTables, setLoadedTables] = useState({});
  const [failedTables, setFailedTables] = useState({});
  const [error, setError] = useState(null);
  const [startTime] = useState(Date.now());

  // Tables to load
  const tables = [
    { id: 'developers', name: 'Developer Profile', icon: User, weight: 20 },
    { id: 'skills', name: 'Skills', icon: Code, weight: 15 },
    { id: 'projects', name: 'Projects', icon: Briefcase, weight: 20 },
    { id: 'certificates', name: 'Certificates', icon: Award, weight: 15 },
    { id: 'experience', name: 'Experience', icon: Clock, weight: 15 },
    { id: 'social_links', name: 'Social Links', icon: LinkIcon, weight: 10 },
    { id: 'profile_image', name: 'Profile Image', icon: Image, weight: 5 },
  ];

  useEffect(() => {
    let mounted = true;
    const loaded = {};
    const failed = {};

    const checkTable = async (table) => {
      try {
        // Simulate real loading (replace with actual Supabase queries)
        await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
        
        if (mounted) {
          loaded[table.id] = true;
          setLoadedTables(prev => ({ ...prev, [table.id]: true }));
          setCurrentStage(`Loaded ${table.name}`);
          
          // Update progress
          const newProgress = Object.keys(loaded).reduce((sum, key) => {
            const t = tables.find(t => t.id === key);
            return sum + (t?.weight || 0);
          }, 0);
          setProgress(newProgress);
        }
      } catch (err) {
        if (mounted) {
          failed[table.id] = true;
          setFailedTables(prev => ({ ...prev, [table.id]: true }));
          console.error(`❌ Failed to load ${table.name}:`, err);
        }
      }
    };

    // Start loading all tables in parallel
    tables.forEach(table => checkTable(table));

    // Monitor progress every 100ms
    const interval = setInterval(() => {
      if (!mounted) return;

      const loadedCount = Object.keys(loaded).length;
      const failedCount = Object.keys(failed).length;
      const totalTables = tables.length;

      // If all tables are processed (success or fail)
      if (loadedCount + failedCount === totalTables) {
        clearInterval(interval);
        
        const elapsedTime = (Date.now() - startTime) / 1000;
        console.log(`✅ Loading completed in ${elapsedTime.toFixed(1)} seconds`);
        console.log(`📊 Success: ${loadedCount}, Failed: ${failedCount}`);

        if (mounted) {
          setProgress(100);
          setCurrentStage('Loading Complete');
          
          // If there are failed tables, send warning
          if (failedCount > 0) {
            onError?.({
              message: `Failed to load ${failedCount} items`,
              failed: failed
            });
          }
          
          // Continue with available data
          setTimeout(() => onComplete?.(loaded, failed), 500);
        }
      }
    }, 100);

    // Safety timeout (30 seconds)
    const safetyTimeout = setTimeout(() => {
      if (mounted && loadedCount + failedCount < totalTables) {
        clearInterval(interval);
        setError('Loading took too long');
        onError?.({ message: 'Loading took too long. Please check your connection.', timeout: true });
      }
    }, 30000);

    return () => {
      mounted = false;
      clearInterval(interval);
      clearTimeout(safetyTimeout);
    };
  }, [username]);

  // Calculate elapsed time
  const elapsedSeconds = ((Date.now() - startTime) / 1000).toFixed(1);

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
        {/* Logo */}
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
              {tables.find(t => t.name === currentStage.replace('Loaded ', ''))?.icon || <Clock className="w-5 h-5 text-white" />}
            </div>
            <div className="flex-1">
              <p className="text-white font-medium">
                {currentStage}
                <span className="text-[#a855f7] animate-pulse">...</span>
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Time: {elapsedSeconds}s
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Loading Progress</span>
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

          {/* Tables Status */}
          <div className="space-y-2 mb-4">
            {tables.map((table) => (
              <div key={table.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <table.icon className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-300">{table.name}</span>
                </div>
                <div>
                  {loadedTables[table.id] && (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  )}
                  {failedTables[table.id] && (
                    <XCircle className="w-4 h-4 text-red-400" />
                  )}
                  {!loadedTables[table.id] && !failedTables[table.id] && (
                    <div className="w-4 h-4 border-2 border-t-transparent border-[#6366f1] rounded-full animate-spin" />
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Error Message */}
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
                      Refresh Page
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Loading Tips */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            transition={{ delay: 1 }}
            className="mt-6 text-center"
          >
            <p className="text-xs text-gray-500">
              {progress < 30 && '✨ Preparing developer data...'}
              {progress >= 30 && progress < 60 && '🚀 Loading projects and skills...'}
              {progress >= 60 && progress < 90 && '💎 Formatting portfolio...'}
              {progress >= 90 && '🎯 Almost there...'}
            </p>
          </motion.div>
        </motion.div>

        {/* Bottom Progress Indicators */}
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
                    : 'bg-white/20'
                }`}
              />
            ))}
          </div>
          <p className="text-xs text-gray-600 mt-2">
            {Object.keys(loadedTables).length} of {tables.length} items loaded
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoadingPortfolio;
