import React, { useState, useEffect } from 'react';
import { getErrors, clearErrors, downloadErrors, logError } from '../utils/Logger';

const CrashReporter = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);

  // اعتراض الأخطاء العالمية
  useEffect(() => {
    const handleError = (event) => {
      logError(event.error || new Error(event.message), 'Global');
    };

    const handleRejection = (event) => {
      logError(event.reason, 'UnhandledPromise');
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);

    // اعتراض console.error
    const originalConsoleError = console.error;
    console.error = (...args) => {
      logError(new Error(args.join(' ')), 'ConsoleError');
      originalConsoleError.apply(console, args);
    };

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
      console.error = originalConsoleError;
    };
  }, []);

  const loadErrors = async () => {
    setLoading(true);
    try {
      const errorList = await getErrors();
      setErrors(errorList);
    } catch (error) {
      console.error('Failed to load errors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => {
    setModalVisible(true);
    loadErrors();
  };

  const handleClear = async () => {
    if (window.confirm('هل أنت متأكد من حذف جميع سجلات الأخطاء؟')) {
      await clearErrors();
      setErrors([]);
      alert('تم حذف جميع السجلات');
    }
  };

  // لا تعرض شيئاً إذا كان هناك أخطاء في التحميل (لن يتم استدعاء هذا أصلاً)
  return (
    <>
      {/* الزر العائم - عنصر HTML <button> */}
      <button
        onClick={handleOpen}
        style={styles.floatingButton}
        aria-label="فتح سجل الأخطاء"
      >
        <span style={styles.buttonText}>🐛</span>
      </button>

      {/* نافذة عرض الأخطاء - نافذة مخصصة */}
      {modalVisible && (
        <div style={styles.modalOverlay} onClick={() => setModalVisible(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>
              📋 سجلات الأعطال
            </h2>

            <p style={styles.errorCount}>
              عدد الأخطاء: {errors.length}
            </p>

            {loading ? (
              <div style={styles.loadingContainer}>
                <div style={styles.spinner}></div>
              </div>
            ) : (
              <div style={styles.errorList}>
                {errors.length === 0 ? (
                  <p style={styles.noErrors}>✨ لا توجد أخطاء مسجلة</p>
                ) : (
                  errors.map((error, index) => (
                    <div key={error.id || index} style={styles.errorItem}>
                      <p style={styles.errorTime}>🕒 {new Date(error.timestamp).toLocaleString()}</p>
                      <p style={styles.errorComponent}>📁 {error.component}</p>
                      <p style={styles.errorMessage}>❌ {error.message}</p>
                      <p style={styles.errorUrl}>🔗 {error.url}</p>
                      {error.stack && error.stack !== 'No stack trace' && (
                        <pre style={styles.errorStack}>
                          {error.stack.substring(0, 200)}...
                        </pre>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* الأزرار */}
            <div style={styles.buttonContainer}>
              <button
                onClick={downloadErrors}
                style={{...styles.button, ...styles.downloadButton}}
              >
                📥 تحميل
              </button>

              <button
                onClick={handleClear}
                style={{...styles.button, ...styles.clearButton}}
              >
                🗑️ تنظيف
              </button>

              <button
                onClick={() => setModalVisible(false)}
                style={{...styles.button, ...styles.closeButton}}
              >
                ❌ إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// أنماط CSS داخل JavaScript (مشابهة لـ StyleSheet.create)
const styles = {
  floatingButton: {
    position: 'fixed',
    bottom: '80px',
    right: '20px',
    backgroundColor: '#a855f7',
    width: '50px',
    height: '50px',
    borderRadius: '25px',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
  },
  buttonText: {
    color: 'white',
    fontSize: '20px',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.9)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px',
    zIndex: 10000,
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: '20px',
    padding: '20px',
    maxHeight: '80%',
    width: '90%',
    maxWidth: '800px',
    overflow: 'auto',
    color: 'white',
  },
  modalTitle: {
    color: '#a855f7',
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '15px',
    textAlign: 'center',
  },
  errorCount: {
    color: '#888',
    marginBottom: '10px',
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    padding: '20px',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #2a2a2a',
    borderTop: '4px solid #a855f7',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  errorList: {
    backgroundColor: '#2a2a2a',
    borderRadius: '10px',
    padding: '15px',
    maxHeight: '400px',
    overflowY: 'auto',
  },
  errorItem: {
    marginBottom: '15px',
    padding: '10px',
    backgroundColor: '#333',
    borderRadius: '8px',
  },
  errorTime: {
    color: '#888',
    fontSize: '11px',
    margin: '0 0 2px 0',
  },
  errorComponent: {
    color: '#a855f7',
    fontSize: '12px',
    margin: '2px 0',
  },
  errorMessage: {
    color: '#ef4444',
    fontSize: '14px',
    margin: '5px 0',
  },
  errorUrl: {
    color: '#4caf50',
    fontSize: '11px',
    margin: '2px 0',
  },
  errorStack: {
    color: '#888',
    fontSize: '11px',
    margin: '5px 0 0 0',
    fontFamily: 'monospace',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  },
  noErrors: {
    color: '#4caf50',
    textAlign: 'center',
    padding: '20px',
    margin: 0,
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'space-around',
    marginTop: '20px',
    gap: '10px',
  },
  button: {
    padding: '12px',
    borderRadius: '10px',
    border: 'none',
    cursor: 'pointer',
    flex: 1,
    color: 'white',
    fontSize: '14px',
  },
  downloadButton: {
    backgroundColor: '#6366f1',
  },
  clearButton: {
    backgroundColor: '#ef4444',
  },
  closeButton: {
    backgroundColor: '#4b5563',
  },
};

// إضافة animation للـ spinner (يحتاج أن يكون في ملف CSS عام أو داخل <style>)
// يمكنك إضافته في ملف index.css الرئيسي
/*
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
*/

export default CrashReporter;
