// src/utils/logger.js - نسخة الويب
import localForage from 'localforage';

// تهيئة مخزن الأخطاء
const initErrorStore = () => {
  return localForage.createInstance({
    name: 'CrashLogger',
    storeName: 'crash_logs'
  });
};

const errorStore = initErrorStore();

// تسجيل خطأ
export const logError = async (error, componentName) => {
  try {
    const errorLog = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      component: componentName || 'unknown',
      message: error?.message || 'Unknown error',
      stack: error?.stack || 'No stack trace',
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    // احصل على السجلات السابقة
    const existingLogs = await errorStore.getItem('logs') || [];
    
    // أضف السجل الجديد
    const updatedLogs = [errorLog, ...existingLogs].slice(0, 50); // احتفظ بآخر 50 خطأ فقط
    
    // احفظ في LocalStorage
    await errorStore.setItem('logs', updatedLogs);
    
    // أيضاً احفظ في localStorage العادي كنسخة احتياطية
    localStorage.setItem('crash_logs', JSON.stringify(updatedLogs));
    
    console.log('✅ Error logged:', errorLog);
  } catch (e) {
    console.error('❌ Failed to log error:', e);
  }
};

// جلب جميع الأخطاء
export const getErrors = async () => {
  try {
    // حاول من localForage أولاً
    const logs = await errorStore.getItem('logs');
    if (logs) return logs;
    
    // إذا لم يجد، حاول من localStorage
    const localLogs = localStorage.getItem('crash_logs');
    return localLogs ? JSON.parse(localLogs) : [];
  } catch (error) {
    console.error('❌ Failed to get errors:', error);
    return [];
  }
};

// مسح جميع الأخطاء
export const clearErrors = async () => {
  try {
    await errorStore.setItem('logs', []);
    localStorage.removeItem('crash_logs');
    console.log('✅ Errors cleared');
  } catch (error) {
    console.error('❌ Failed to clear errors:', error);
  }
};

// تصدير الأخطاء كنص
export const exportErrorsAsText = async () => {
  const errors = await getErrors();
  
  let text = '=== CRASH LOGS ===\n';
  text += `Generated: ${new Date().toISOString()}\n`;
  text += `URL: ${window.location.href}\n`;
  text += `User Agent: ${navigator.userAgent}\n`;
  text += '='.repeat(50) + '\n\n';
  
  errors.forEach((error, index) => {
    text += `\n--- ERROR #${index + 1} ---\n`;
    text += `Time: ${error.timestamp}\n`;
    text += `Component: ${error.component}\n`;
    text += `Message: ${error.message}\n`;
    text += `Stack: ${error.stack}\n`;
    text += '-'.repeat(30) + '\n';
  });
  
  return text;
};

// حفظ الأخطاء في ملف للتحميل
export const downloadErrors = async () => {
  const text = await exportErrorsAsText();
  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `crash-logs-${new Date().toISOString()}.txt`;
  a.click();
  URL.revokeObjectURL(url);
};
