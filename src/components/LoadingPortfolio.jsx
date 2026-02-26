import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  User, Code, Briefcase, Award, Clock, Link as LinkIcon,
  CheckCircle, XCircle, Loader, AlertCircle 
} from 'lucide-react';
import { supabase } from '../lib/supabase';

const LoadingPortfolio = ({ username, onComplete, onError }) => {
  const [tables, setTables] = useState([
    { id: 'developers', name: 'بيانات المطور', icon: User, status: 'pending', weight: 20 },
    { id: 'skills', name: 'المهارات', icon: Code, status: 'pending', weight: 20 },
    { id: 'projects', name: 'المشاريع', icon: Briefcase, status: 'pending', weight: 20 },
    { id: 'certificates', name: 'الشهادات', icon: Award, status: 'pending', weight: 15 },
    { id: 'experience', name: 'الخبرات', icon: Clock, status: 'pending', weight: 15 },
    { id: 'social_links', name: 'روابط التواصل', icon: LinkIcon, status: 'pending', weight: 10 },
  ]);

  const [progress, setProgress] = useState(0);
  const [developerId, setDeveloperId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    const results = {};

    // تحميل المطور أولاً
    const loadDeveloper = async () => {
      try {
        const { data, error } = await supabase
          .from('developers')
          .select('id, username, full_name, profile_image, plan_id, title, bio')
          .eq('username', username)
          .single();

        if (error || !data) {
          throw new Error('المطور غير موجود');
        }

        results.developers = data;
        setDeveloperId(data.id);
        
        updateTableStatus('developers', 'success');
        return data.id;
      } catch (err) {
        updateTableStatus('developers', 'error');
        throw err;
      }
    };

    // تحميل جدول معين
    const loadTable = async (tableName, devId) => {
      try {
        const { data, error, count } = await supabase
          .from(tableName)
          .select('*', { count: 'exact' })
          .eq('developer_id', devId);

        if (error) throw error;
        
        results[tableName] = data || [];
        updateTableStatus(tableName, 'success', count);
        return data;
      } catch (err) {
        updateTableStatus(tableName, 'error');
        results[tableName] = [];
      }
    };

    // تحديث حالة الجدول
    const updateTableStatus = (tableId, status, count = 0) => {
      if (!mounted) return;
      
      setTables(prev => prev.map(t => 
        t.id === tableId ? { ...t, status, count } : t
      ));

      // حساب التقدم
      const totalWeight = tables.reduce((sum, t) => sum + t.weight, 0);
      const completedWeight = tables.reduce((sum, t) => {
        if (t.id === tableId) {
          return sum + (status === 'success' || status === 'error' ? t.weight : 0);
        }
        return sum + (t.status === 'success' || t.status === 'error' ? t.weight : 0);
      }, 0);
      
      setProgress(Math.round((completedWeight / totalWeight) * 100));
    };

    // التحميل الرئيسي
    const loadAllData = async () => {
      try {
        // 1. تحميل المطور
        const devId = await loadDeveloper();
        if (!devId) return;

        // 2. تحميل باقي الجداول بالتوازي
        const otherTables = ['skills', 'projects', 'certificates', 'experience', 'social_links'];
        await Promise.all(otherTables.map(table => loadTable(table, devId)));

        // 3. اكتمل التحميل
        if (mounted) {
          setProgress(100);
          setTimeout(() => {
            onComplete?.(results);
          }, 500);
        }

      } catch (err) {
        if (mounted) {
          setError(err.message);
          onError?.(err.message);
        }
      }
    };

    loadAllData();

    return () => { mounted = false; };
  }, [username]);

  // حساب الإحصائيات
  const loadedCount = tables.filter(t => t.status === 'success').length;
  const failedCount = tables.filter(t => t.status === 'error').length;
  const totalCount = tables.length;

  return (
    <div className="fixed inset-0 bg-[#030014] z-50 flex items-center justify-center overflow-hidden">
      {/* خلفية */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-blue-900/20" />

      <div className="relative z-10 w-full max-w-md mx-auto px-4">
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
          
          {/* العنوان */}
          <h2 className="text-xl font-bold text-white mb-1">@{username}</h2>
          <p className="text-sm text-gray-400 mb-4">جاري تحميل البورتفليو...</p>

          {/* شريط التقدم */}
          <div className="mb-4">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-400">التقدم العام</span>
              <span className="text-[#a855f7] font-bold">{progress}%</span>
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

          {/* قائمة الجداول */}
          <div className="space-y-2 mb-4">
            {tables.map(table => (
              <div key={table.id} className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                <div className="flex items-center gap-2">
                  <table.icon className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-300">{table.name}</span>
                  {table.count > 0 && (
                    <span className="text-xs bg-[#6366f1]/20 text-[#6366f1] px-1.5 rounded-full">
                      {table.count}
                    </span>
                  )}
                </div>
                <div>
                  {table.status === 'pending' && (
                    <Loader className="w-4 h-4 text-gray-500 animate-spin" />
                  )}
                  {table.status === 'success' && (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  )}
                  {table.status === 'error' && (
                    <XCircle className="w-4 h-4 text-red-400" />
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* إحصائيات التحميل */}
          <div className="flex justify-between text-xs text-gray-500 border-t border-white/10 pt-3">
            <span>✅ تم: {loadedCount}/{totalCount}</span>
            {failedCount > 0 && (
              <span className="text-red-400">❌ فشل: {failedCount}</span>
            )}
          </div>

          {/* رسالة خطأ */}
          {error && (
            <div className="mt-3 p-2 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span className="text-xs text-red-400">{error}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoadingPortfolio;
