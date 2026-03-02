import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAdminAuth } from '../../hooks/useAdminAuth'
import {
  Save,
  Globe,
  Mail,
  CreditCard,
  Smartphone,
  DollarSign,
  Image,
  Type,
  Palette,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Shield,
  Users,
  Lock,
  Bell,
  Sliders
} from 'lucide-react'

const Settings = () => {
  const { admin } = useAdminAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('general')

  // General Settings
  const [general, setGeneral] = useState({
    site_title: 'Portfolio-v5',
    site_description: 'منصة المطورين المحترفين',
    logo_text: 'Portfolio-v5',
    primary_color: '#6366f1',
    secondary_color: '#a855f7',
    background_color: '#030014',
    font_family: 'Poppins'
  })

  // Payment Settings
  const [payment, setPayment] = useState({
    karimi_number: '',
    karimi_name: '',
    bank_name: '',
    bank_account_name: '',
    bank_iban: '',
    bank_account_number: '',
    usdt_wallet_address: '',
    usdt_network: 'TRC20',
    admin_whatsapp: '',
    currency: 'USD'
  })

  // Email Settings
  const [email, setEmail] = useState({
    smtp_host: '',
    smtp_port: '587',
    smtp_user: '',
    smtp_pass: '',
    from_email: '',
    from_name: 'Portfolio-v5'
  })

  // Security Settings
  const [security, setSecurity] = useState({
    require_email_confirmation: true,
    allow_registration: true,
    session_duration: 30,
    max_login_attempts: 5,
    two_factor_auth: false
  })

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    setLoading(true)
    try {
      // Load general settings
      const { data: generalData } = await supabase
        .from('settings')
        .select('*')
        .single()
      
      if (generalData) {
        setGeneral({
          site_title: generalData.site_title || 'Portfolio-v5',
          site_description: generalData.site_description || 'منصة المطورين المحترفين',
          logo_text: generalData.logo_text || 'Portfolio-v5',
          primary_color: generalData.primary_color || '#6366f1',
          secondary_color: generalData.secondary_color || '#a855f7',
          background_color: generalData.background_color || '#030014',
          font_family: generalData.font_family || 'Poppins'
        })
      }

      // Load payment settings
      const { data: paymentData } = await supabase
        .from('payment_settings')
        .select('*')
        .single()

      if (paymentData) {
        setPayment({
          karimi_number: paymentData.karimi_number || '',
          karimi_name: paymentData.karimi_name || '',
          bank_name: paymentData.bank_name || '',
          bank_account_name: paymentData.bank_account_name || '',
          bank_iban: paymentData.bank_iban || '',
          bank_account_number: paymentData.bank_account_number || '',
          usdt_wallet_address: paymentData.usdt_wallet_address || '',
          usdt_network: paymentData.usdt_network || 'TRC20',
          admin_whatsapp: paymentData.admin_whatsapp || '',
          currency: paymentData.currency || 'USD'
        })
      }
    } catch (error) {
      console.error('Error loading settings:', error)
      setError('فشل تحميل الإعدادات')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveGeneral = async () => {
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const { error } = await supabase
        .from('settings')
        .upsert({
          id: 1,
          ...general,
          updated_at: new Date().toISOString(),
          updated_by: admin.id
        })

      if (error) throw error
      setSuccess('تم حفظ الإعدادات العامة بنجاح')
    } catch (error) {
      console.error('Error saving general settings:', error)
      setError('فشل حفظ الإعدادات العامة')
    } finally {
      setSaving(false)
      setTimeout(() => setSuccess(''), 3000)
    }
  }

  const handleSavePayment = async () => {
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const { error } = await supabase
        .from('payment_settings')
        .upsert({
          id: 1,
          ...payment,
          updated_at: new Date().toISOString(),
          updated_by: admin.id
        })

      if (error) throw error
      setSuccess('تم حفظ إعدادات الدفع بنجاح')
    } catch (error) {
      console.error('Error saving payment settings:', error)
      setError('فشل حفظ إعدادات الدفع')
    } finally {
      setSaving(false)
      setTimeout(() => setSuccess(''), 3000)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 animate-spin text-purple-400 mx-auto mb-4" />
          <p className="text-gray-400">جاري تحميل الإعدادات...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">إعدادات النظام</h1>
      </div>

      {/* Messages */}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
          <AlertCircle className="w-5 h-5" />
          <p>{error}</p>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400">
          <CheckCircle className="w-5 h-5" />
          <p>{success}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-4 flex-wrap">
        <button
          onClick={() => setActiveTab('general')}
          className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${
            activeTab === 'general'
              ? 'bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Globe className="w-4 h-4" />
          عام
        </button>
        <button
          onClick={() => setActiveTab('payment')}
          className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${
            activeTab === 'payment'
              ? 'bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          الدفع
        </button>
        <button
          onClick={() => setActiveTab('email')}
          className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${
            activeTab === 'email'
              ? 'bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Mail className="w-4 h-4" />
          البريد
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${
            activeTab === 'security'
              ? 'bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Shield className="w-4 h-4" />
          الأمان
        </button>
      </div>

      {/* General Settings */}
      {activeTab === 'general' && (
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
          <h2 className="text-lg font-semibold text-white mb-6">الإعدادات العامة</h2>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-gray-400 mb-2">عنوان الموقع</label>
                <input
                  type="text"
                  value={general.site_title}
                  onChange={(e) => setGeneral({ ...general, site_title: e.target.value })}
                  className="w-full p-3 bg-white/5 border border-white/20 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">نص الشعار</label>
                <input
                  type="text"
                  value={general.logo_text}
                  onChange={(e) => setGeneral({ ...general, logo_text: e.target.value })}
                  className="w-full p-3 bg-white/5 border border-white/20 rounded-lg text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">وصف الموقع</label>
              <textarea
                value={general.site_description}
                onChange={(e) => setGeneral({ ...general, site_description: e.target.value })}
                rows="3"
                className="w-full p-3 bg-white/5 border border-white/20 rounded-lg text-white resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm text-gray-400 mb-2">اللون الأساسي</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={general.primary_color}
                    onChange={(e) => setGeneral({ ...general, primary_color: e.target.value })}
                    className="w-12 h-10 rounded bg-transparent"
                  />
                  <input
                    type="text"
                    value={general.primary_color}
                    onChange={(e) => setGeneral({ ...general, primary_color: e.target.value })}
                    className="flex-1 p-3 bg-white/5 border border-white/20 rounded-lg text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">اللون الثانوي</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={general.secondary_color}
                    onChange={(e) => setGeneral({ ...general, secondary_color: e.target.value })}
                    className="w-12 h-10 rounded bg-transparent"
                  />
                  <input
                    type="text"
                    value={general.secondary_color}
                    onChange={(e) => setGeneral({ ...general, secondary_color: e.target.value })}
                    className="flex-1 p-3 bg-white/5 border border-white/20 rounded-lg text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">لون الخلفية</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={general.background_color}
                    onChange={(e) => setGeneral({ ...general, background_color: e.target.value })}
                    className="w-12 h-10 rounded bg-transparent"
                  />
                  <input
                    type="text"
                    value={general.background_color}
                    onChange={(e) => setGeneral({ ...general, background_color: e.target.value })}
                    className="flex-1 p-3 bg-white/5 border border-white/20 rounded-lg text-white"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">نوع الخط</label>
              <select
                value={general.font_family}
                onChange={(e) => setGeneral({ ...general, font_family: e.target.value })}
                className="w-full p-3 bg-white/5 border border-white/20 rounded-lg text-white"
              >
                <option value="Poppins">Poppins</option>
                <option value="Inter">Inter</option>
                <option value="Roboto">Roboto</option>
                <option value="Open Sans">Open Sans</option>
                <option value="Cairo">Cairo</option>
              </select>
            </div>

            <button
              onClick={handleSaveGeneral}
              disabled={saving}
              className="px-6 py-3 bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white rounded-xl font-semibold hover:scale-[1.02] transition disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  حفظ الإعدادات
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Payment Settings */}
      {activeTab === 'payment' && (
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
          <h2 className="text-lg font-semibold text-white mb-6">إعدادات الدفع</h2>
          
          <div className="space-y-6">
            <h3 className="text-md font-medium text-white flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-green-400" />
              كريمي (تحويل موبايل)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-gray-400 mb-2">رقم كريمي</label>
                <input
                  type="text"
                  value={payment.karimi_number}
                  onChange={(e) => setPayment({ ...payment, karimi_number: e.target.value })}
                  className="w-full p-3 bg-white/5 border border-white/20 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">اسم الحساب</label>
                <input
                  type="text"
                  value={payment.karimi_name}
                  onChange={(e) => setPayment({ ...payment, karimi_name: e.target.value })}
                  className="w-full p-3 bg-white/5 border border-white/20 rounded-lg text-white"
                />
              </div>
            </div>

            <h3 className="text-md font-medium text-white flex items-center gap-2 mt-6">
              <CreditCard className="w-4 h-4 text-blue-400" />
              تحويل بنكي
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-gray-400 mb-2">اسم البنك</label>
                <input
                  type="text"
                  value={payment.bank_name}
                  onChange={(e) => setPayment({ ...payment, bank_name: e.target.value })}
                  className="w-full p-3 bg-white/5 border border-white/20 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">اسم صاحب الحساب</label>
                <input
                  type="text"
                  value={payment.bank_account_name}
                  onChange={(e) => setPayment({ ...payment, bank_account_name: e.target.value })}
                  className="w-full p-3 bg-white/5 border border-white/20 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">رقم الحساب</label>
                <input
                  type="text"
                  value={payment.bank_account_number}
                  onChange={(e) => setPayment({ ...payment, bank_account_number: e.target.value })}
                  className="w-full p-3 bg-white/5 border border-white/20 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">IBAN</label>
                <input
                  type="text"
                  value={payment.bank_iban}
                  onChange={(e) => setPayment({ ...payment, bank_iban: e.target.value })}
                  className="w-full p-3 bg-white/5 border border-white/20 rounded-lg text-white"
                />
              </div>
            </div>

            <h3 className="text-md font-medium text-white flex items-center gap-2 mt-6">
              <DollarSign className="w-4 h-4 text-yellow-400" />
              USDT (عملات رقمية)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-gray-400 mb-2">عنوان المحفظة</label>
                <input
                  type="text"
                  value={payment.usdt_wallet_address}
                  onChange={(e) => setPayment({ ...payment, usdt_wallet_address: e.target.value })}
                  className="w-full p-3 bg-white/5 border border-white/20 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">الشبكة</label>
                <select
                  value={payment.usdt_network}
                  onChange={(e) => setPayment({ ...payment, usdt_network: e.target.value })}
                  className="w-full p-3 bg-white/5 border border-white/20 rounded-lg text-white"
                >
                  <option value="TRC20">TRC20 (Tron)</option>
                  <option value="ERC20">ERC20 (Ethereum)</option>
                  <option value="BEP20">BEP20 (BSC)</option>
                </select>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm text-gray-400 mb-2">رقم واتساب للإشعارات</label>
              <input
                type="text"
                value={payment.admin_whatsapp}
                onChange={(e) => setPayment({ ...payment, admin_whatsapp: e.target.value })}
                className="w-full p-3 bg-white/5 border border-white/20 rounded-lg text-white"
                placeholder="967771315459"
              />
            </div>

            <button
              onClick={handleSavePayment}
              disabled={saving}
              className="px-6 py-3 bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white rounded-xl font-semibold hover:scale-[1.02] transition disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  حفظ إعدادات الدفع
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Email Settings */}
      {activeTab === 'email' && (
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
          <h2 className="text-lg font-semibold text-white mb-6">إعدادات البريد الإلكتروني</h2>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-gray-400 mb-2">SMTP Host</label>
                <input
                  type="text"
                  value={email.smtp_host}
                  onChange={(e) => setEmail({ ...email, smtp_host: e.target.value })}
                  className="w-full p-3 bg-white/5 border border-white/20 rounded-lg text-white"
                  placeholder="smtp.gmail.com"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">SMTP Port</label>
                <input
                  type="text"
                  value={email.smtp_port}
                  onChange={(e) => setEmail({ ...email, smtp_port: e.target.value })}
                  className="w-full p-3 bg-white/5 border border-white/20 rounded-lg text-white"
                  placeholder="587"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-gray-400 mb-2">SMTP Username</label>
                <input
                  type="text"
                  value={email.smtp_user}
                  onChange={(e) => setEmail({ ...email, smtp_user: e.target.value })}
                  className="w-full p-3 bg-white/5 border border-white/20 rounded-lg text-white"
                  placeholder="your-email@gmail.com"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">SMTP Password</label>
                <input
                  type="password"
                  value={email.smtp_pass}
                  onChange={(e) => setEmail({ ...email, smtp_pass: e.target.value })}
                  className="w-full p-3 bg-white/5 border border-white/20 rounded-lg text-white"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-gray-400 mb-2">From Email</label>
                <input
                  type="email"
                  value={email.from_email}
                  onChange={(e) => setEmail({ ...email, from_email: e.target.value })}
                  className="w-full p-3 bg-white/5 border border-white/20 rounded-lg text-white"
                  placeholder="noreply@portfolio-v5.com"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">From Name</label>
                <input
                  type="text"
                  value={email.from_name}
                  onChange={(e) => setEmail({ ...email, from_name: e.target.value })}
                  className="w-full p-3 bg-white/5 border border-white/20 rounded-lg text-white"
                  placeholder="Portfolio-v5"
                />
              </div>
            </div>

            <button
              onClick={() => alert('يتم حفظ إعدادات البريد')}
              className="px-6 py-3 bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white rounded-xl font-semibold hover:scale-[1.02] transition disabled:opacity-50 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              حفظ إعدادات البريد
            </button>
          </div>
        </div>
      )}

      {/* Security Settings */}
      {activeTab === 'security' && (
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
          <h2 className="text-lg font-semibold text-white mb-6">إعدادات الأمان</h2>
          
          <div className="space-y-4">
            <label className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
              <div>
                <p className="text-white font-medium">تأكيد البريد الإلكتروني</p>
                <p className="text-xs text-gray-400">يتطلب تأكيد البريد قبل تسجيل الدخول</p>
              </div>
              <input
                type="checkbox"
                checked={security.require_email_confirmation}
                onChange={(e) => setSecurity({ ...security, require_email_confirmation: e.target.checked })}
                className="w-5 h-5"
              />
            </label>

            <label className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
              <div>
                <p className="text-white font-medium">السماح بالتسجيل</p>
                <p className="text-xs text-gray-400">يمكن للمستخدمين الجدد إنشاء حسابات</p>
              </div>
              <input
                type="checkbox"
                checked={security.allow_registration}
                onChange={(e) => setSecurity({ ...security, allow_registration: e.target.checked })}
                className="w-5 h-5"
              />
            </label>

            <label className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
              <div>
                <p className="text-white font-medium">المصادقة الثنائية</p>
                <p className="text-xs text-gray-400">تفعيل المصادقة الثنائية للأدمن</p>
              </div>
              <input
                type="checkbox"
                checked={security.two_factor_auth}
                onChange={(e) => setSecurity({ ...security, two_factor_auth: e.target.checked })}
                className="w-5 h-5"
              />
            </label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <label className="block text-sm text-gray-400 mb-2">مدة الجلسة (أيام)</label>
                <input
                  type="number"
                  value={security.session_duration}
                  onChange={(e) => setSecurity({ ...security, session_duration: parseInt(e.target.value) })}
                  className="w-full p-3 bg-white/5 border border-white/20 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">حد محاولات الدخول</label>
                <input
                  type="number"
                  value={security.max_login_attempts}
                  onChange={(e) => setSecurity({ ...security, max_login_attempts: parseInt(e.target.value) })}
                  className="w-full p-3 bg-white/5 border border-white/20 rounded-lg text-white"
                />
              </div>
            </div>

            <button
              onClick={() => alert('يتم حفظ إعدادات الأمان')}
              className="mt-6 px-6 py-3 bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white rounded-xl font-semibold hover:scale-[1.02] transition disabled:opacity-50 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              حفظ إعدادات الأمان
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Settings
