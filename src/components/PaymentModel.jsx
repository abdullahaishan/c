import React, { useState } from 'react';
import { X, Upload, Bitcoin, Wallet, Landmark, CheckCircle } from 'lucide-react';
import { planService } from '../services/supabase';

const PaymentModal = ({ plan, onClose, userId }) => {
  const [step, setStep] = useState('method'); // method, upload, success
  const [method, setMethod] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const paymentMethods = [
    { id: 'crypto', name: 'عملات رقمية', icon: <Bitcoin className="w-6 h-6" /> },
    { id: 'onecash', name: 'ون كاش', icon: <Wallet className="w-6 h-6" /> },
    { id: 'bank', name: 'تحويل بنكي', icon: <Landmark className="w-6 h-6" /> }
  ];

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    
    try {
      // هنا يمكن إضافة منطق رفع الصورة وحفظ البيانات
      await planService.createSubscription(userId, plan.id, {
        method,
        transaction_image: imagePreview
      });
      
      setStep('success');
      setTimeout(() => {
        onClose();
      }, 3000);
    } catch (error) {
      console.error('Payment error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-2xl max-w-md w-full">
        <div className="p-6 border-b border-white/10 flex justify-between items-center">
          <h3 className="text-xl font-bold text-white">ترقية الباقة</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {step === 'method' && (
            <div className="space-y-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-white mb-2">${plan.price_monthly}</p>
                <p className="text-gray-400">{plan.name}</p>
              </div>

              <div className="space-y-3">
                {paymentMethods.map((pm) => (
                  <button
                    key={pm.id}
                    onClick={() => setMethod(pm.id)}
                    className={`w-full p-4 rounded-xl border transition-all flex items-center gap-3 ${
                      method === pm.id
                        ? 'border-purple-500 bg-purple-500/20'
                        : 'border-white/10 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    {pm.icon}
                    <span className="text-white">{pm.name}</span>
                  </button>
                ))}
              </div>

              {method && (
                <button
                  onClick={() => setStep('upload')}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:scale-105 transition-all"
                >
                  متابعة
                </button>
              )}
            </div>
          )}

          {step === 'upload' && (
            <div className="space-y-6">
              <p className="text-gray-400 text-center">
                أرسل صورة التحويل لتأكيد عملية الدفع
              </p>

              {!imagePreview ? (
                <div
                  onClick={() => document.getElementById('payment-image').click()}
                  className="border-2 border-dashed border-purple-500/30 rounded-xl p-8 text-center cursor-pointer hover:border-purple-500/50 transition-all"
                >
                  <Upload className="w-12 h-12 text-purple-400 mx-auto mb-3" />
                  <p className="text-white">اضغط لرفع الصورة</p>
                  <p className="text-gray-400 text-sm mt-2">PNG, JPG (Max 5MB)</p>
                  <input
                    id="payment-image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Payment proof"
                    className="w-full rounded-xl"
                  />
                  <button
                    onClick={() => {
                      setImagePreview(null);
                      setImageFile(null);
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {imagePreview && (
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold hover:scale-105 transition-all disabled:opacity-50"
                >
                  {loading ? 'جاري المعالجة...' : 'تأكيد وإرسال'}
                </button>
              )}
            </div>
          )}

          {step === 'success' && (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-green-400" />
              </div>
              <h4 className="text-xl font-bold text-white mb-2">تم إرسال الطلب!</h4>
              <p className="text-gray-400">سيتم التواصل معك قريباً لتأكيد الترقية</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;