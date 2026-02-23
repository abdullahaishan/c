import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { deepseekService } from '../portfolio-ai/services/deepseek';
import { portfolioService } from '../portfolio-ai/services/supabase';
import { Upload, FileText, Sparkles, Loader, CheckCircle, AlertCircle } from 'lucide-react';
import * as pdfjs from 'pdfjs-dist';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const Builder = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [extractedData, setExtractedData] = useState(null);
  const [step, setStep] = useState('upload'); // upload, processing, preview, success
  const { user } = useAuth();
  const navigate = useNavigate();

  const extractTextFromPDF = async (file) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        fullText += pageText + '\n';
        setProgress(Math.round((i / pdf.numPages) * 30));
      }

      return fullText;
    } catch (err) {
      throw new Error('فشل في قراءة ملف PDF. تأكد من أن الملف سليم.');
    }
  };

  const handleFileUpload = useCallback(async (e) => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return;

    // التحقق من نوع الملف
    if (uploadedFile.type !== 'application/pdf') {
      setError('الرجاء رفع ملف PDF فقط');
      return;
    }

    // التحقق من الحجم (max 10MB)
    if (uploadedFile.size > 10 * 1024 * 1024) {
      setError('الملف كبير جداً. الحد الأقصى 10 ميجابايت');
      return;
    }

    setFile(uploadedFile);
    setLoading(true);
    setError('');
    setProgress(0);
    setStep('processing');

    try {
      // 1. استخراج النص من PDF
      const text = await extractTextFromPDF(uploadedFile);
      setProgress(40);

      // 2. تحليل النص بالذكاء الاصطناعي
      const analysis = await deepseekService.analyzeResume(text);
      setProgress(80);

      if (analysis) {
        setExtractedData(analysis);
        
        // 3. إنشاء اسم مستخدم فريد
        const username = analysis.personal_info?.name
          ?.toLowerCase()
          .replace(/[^a-z0-9]/g, '-') + '-' + Math.random().toString(36).substring(2, 6);

        // 4. حفظ البيانات في Supabase
        const portfolio = await portfolioService.createPortfolio(user.id, {
          title: `${analysis.personal_info?.name || 'مطور'}`,
          about_me: analysis.personal_info?.summary || '',
          social_links: {
            email: analysis.personal_info?.email,
            phone: analysis.personal_info?.phone,
            location: analysis.personal_info?.location
          },
          slug: username,
          ai_generated: true,
          ai_confidence_score: 95
        });

        // 5. إضافة المهارات
        if (analysis.skills) {
          for (const skill of analysis.skills) {
            await portfolioService.addSkill(portfolio.id, skill);
          }
        }

        // 6. إضافة الخبرات
        if (analysis.experience) {
          for (const exp of analysis.experience) {
            await portfolioService.addExperience(portfolio.id, exp);
          }
        }

        // 7. إضافة التعليم
        if (analysis.education) {
          for (const edu of analysis.education) {
            await portfolioService.addEducation(portfolio.id, edu);
          }
        }

        // 8. إضافة المشاريع
        if (analysis.projects) {
          for (const project of analysis.projects) {
            await portfolioService.addProject(portfolio.id, project);
          }
        }

        setProgress(100);
        setStep('success');
        
        // التوجيه إلى لوحة التحكم بعد ثانيتين
        setTimeout(() => {
          navigate('/app/dashboard');
        }, 2000);
      }
    } catch (err) {
      console.error('Error:', err);
      setError('حدث خطأ أثناء المعالجة. حاول مرة أخرى.');
      setStep('upload');
    } finally {
      setLoading(false);
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-[#030014] py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#6366f1] to-[#a855f7] mb-4">
            أنشئ بورتفليوك في دقائق
          </h1>
          <p className="text-gray-400 text-lg">
            ارفع سيرتك الذاتية ودع الذكاء الاصطناعي يصنع لك موقعاً احترافياً
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-400">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* Upload Area */}
        {step === 'upload' && (
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8">
            <div
              className="border-2 border-dashed border-purple-500/30 rounded-xl p-12 text-center cursor-pointer hover:border-purple-500/50 transition-all group"
              onClick={() => document.getElementById('resume-upload').click()}
            >
              <Upload className="w-16 h-16 text-purple-400 mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <p className="text-white text-xl mb-2">اضغط لرفع السيرة الذاتية</p>
              <p className="text-gray-400">PDF فقط (الحد الأقصى 10 ميجابايت)</p>
              <input
                id="resume-upload"
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </div>
        )}

        {/* Processing */}
        {step === 'processing' && (
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8">
            <div className="text-center mb-8">
              <Loader className="w-16 h-16 text-purple-400 animate-spin mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-white mb-2">جاري معالجة السيرة</h3>
              <p className="text-gray-400">هذا قد يستغرق بضع ثواني...</p>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm text-gray-400 mb-2">
                  <span>استخراج النص من PDF</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#6366f1] to-[#a855f7] transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 text-gray-400 text-sm">
                {progress < 40 && (
                  <>
                    <FileText className="w-4 h-4 animate-pulse" />
                    <span>قراءة ملف PDF...</span>
                  </>
                )}
                {progress >= 40 && progress < 80 && (
                  <>
                    <Sparkles className="w-4 h-4 animate-pulse" />
                    <span>الذكاء الاصطناعي يحلل البيانات...</span>
                  </>
                )}
                {progress >= 80 && (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span>بناء البورتفليو...</span>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Success */}
        {step === 'success' && (
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-green-500/30 p-8 text-center">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">تم إنشاء بورتفليوك بنجاح!</h3>
            <p className="text-gray-400 mb-4">جاري تحويلك إلى لوحة التحكم...</p>
            <div className="w-8 h-8 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin mx-auto" />
          </div>
        )}
      </div>
    </div>
  );
};

export default Builder;
