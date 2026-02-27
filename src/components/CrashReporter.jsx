// src/components/CrashReporter.js - نسخة الويب
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Modal, 
  ScrollView,
  ActivityIndicator,
  StyleSheet 
} from 'react-native';
import { getErrors, clearErrors, downloadErrors } from '../utils/logger';

const CrashReporter = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);

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

  const handleDownload = async () => {
    await downloadErrors();
  };

  // اعتراض الأخطاء العالمية
  useEffect(() => {
    const handleError = (event) => {
      logError(event.error || new Error(event.message), 'Global');
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', (event) => {
      logError(event.reason, 'UnhandledPromise');
    });

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleError);
    };
  }, []);

  return (
    <>
      {/* الزر العائم */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={handleOpen}
      >
        <Text style={styles.buttonText}>🐛</Text>
      </TouchableOpacity>

      {/* نافذة عرض الأخطاء */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              📋 سجلات الأعطال
            </Text>

            <Text style={styles.errorCount}>
              عدد الأخطاء: {errors.length}
            </Text>

            {loading ? (
              <ActivityIndicator size="large" color="#a855f7" />
            ) : (
              <ScrollView style={styles.errorList}>
                {errors.length === 0 ? (
                  <Text style={styles.noErrors}>✨ لا توجد أخطاء مسجلة</Text>
                ) : (
                  errors.map((error, index) => (
                    <View key={error.id || index} style={styles.errorItem}>
                      <Text style={styles.errorTime}>🕒 {new Date(error.timestamp).toLocaleString()}</Text>
                      <Text style={styles.errorComponent}>📁 {error.component}</Text>
                      <Text style={styles.errorMessage}>❌ {error.message}</Text>
                      {error.stack && (
                        <Text style={styles.errorStack} numberOfLines={3}>
                          {error.stack}
                        </Text>
                      )}
                    </View>
                  ))
                )}
              </ScrollView>
            )}

            {/* الأزرار */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.downloadButton]}
                onPress={handleDownload}
              >
                <Text style={styles.buttonText}>📥 تحميل</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.clearButton]}
                onPress={handleClear}
              >
                <Text style={styles.buttonText}>🗑️ تنظيف</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.closeButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText}>❌ إغلاق</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  floatingButton: {
    position: 'fixed',
    bottom: 80,
    right: 20,
    backgroundColor: '#a855f7',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
    cursor: 'pointer'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    padding: 20
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 20,
    maxHeight: '80%'
  },
  modalTitle: {
    color: '#a855f7',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center'
  },
  errorCount: {
    color: '#888',
    marginBottom: 10
  },
  errorList: {
    backgroundColor: '#2a2a2a',
    borderRadius: 10,
    padding: 15,
    maxHeight: 400
  },
  errorItem: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#333',
    borderRadius: 8
  },
  errorTime: {
    color: '#888',
    fontSize: 11
  },
  errorComponent: {
    color: '#a855f7',
    fontSize: 12,
    marginTop: 2
  },
  errorMessage: {
    color: '#ef4444',
    fontSize: 14,
    marginTop: 5
  },
  errorStack: {
    color: '#888',
    fontSize: 11,
    marginTop: 5,
    fontFamily: 'monospace'
  },
  noErrors: {
    color: '#4caf50',
    textAlign: 'center',
    padding: 20
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    gap: 10
  },
  button: {
    padding: 12,
    borderRadius: 10,
    flex: 1,
    alignItems: 'center'
  },
  downloadButton: {
    backgroundColor: '#6366f1'
  },
  clearButton: {
    backgroundColor: '#ef4444'
  },
  closeButton: {
    backgroundColor: '#4b5563'
  },
  buttonText: {
    color: 'white',
    textAlign: 'center'
  }
});

export default CrashReporter;
