import React, { useState, useEffect } from 'react'
import { adminPlanService } from '../../lib/adminService'
import { useAdminAuth } from '../../hooks/useAdminAuth'
import {
  Crown,
  Edit,
  Save,
  X,
  Plus,
  Check,
  Copy,
  Trash2,
  Eye,
  EyeOff,
  Loader,
  DollarSign,
  Calendar,
  Users,
  HardDrive,
  Globe,
  Sparkles,
  TrendingUp,
  MessageCircle,
  Award,
  Shield,
  Settings,
  Sliders,
  Cpu,
  BarChart3,
  HelpCircle,
  Briefcase,
  GraduationCap
} from 'lucide-react'

const Plans = () => {
  const { admin } = useAdminAuth()
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [editData, setEditData] = useState({})
  const [showAddModal, setShowAddModal] = useState(false)
  const [newPlan, setNewPlan] = useState({
    name: '',
    name_ar: '',
    description: '',
    price_monthly: 0,
    price_yearly: null,
    currency: 'USD',
    max_projects: 3,
    max_skills: 10,
    max_certificates: 3,
    max_experience: 5,
    max_education: 5,
    storage_limit: 50,
    custom_domain: false,
    remove_branding: false,
    analytics: false,
    priority_support: false,
    ai_analysis: false,
    max_ai_analyses: 1,
    has_advanced_stats: false,
    has_reports: false,
    has_priority_support: false,
    has_remove_branding: false,
    is_popular: false,
    is_active: true,
    sort_order: 0
  })

  useEffect(() => {
    loadPlans()
  }, [])

  const loadPlans = async () => {
    setLoading(true)
    try {
      const result = await adminPlanService.getAllPlans(0, 100)
      setPlans(result.data || [])
    } catch (error) {
      console.error('Error loading plans:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (plan) => {
    if (!plan) return
    
    // ✅ التحقق من وجود البيانات قبل استخدامها
    setEditingId(plan.id)
    setEditData({
      id: plan.id || '',
      name: plan.name || '',
      name_ar: plan.name_ar || '',
      description: plan.description || '',
      price_monthly: plan.price_monthly || 0,
      price_yearly: plan.price_yearly || null,
      currency: plan.currency || 'USD',
      max_projects: plan.max_projects || 3,
      max_skills: plan.max_skills || 10,
      max_certificates: plan.max_certificates || 3,
      max_experience: plan.max_experience || 5,
      max_education: plan.max_education || 5,
      storage_limit: plan.storage_limit || 50,
      custom_domain: plan.custom_domain || false,
      remove_branding: plan.remove_branding || false,
      analytics: plan.analytics || false,
      priority_support: plan.priority_support || false,
      ai_analysis: plan.ai_analysis || false,
      max_ai_analyses: plan.max_ai_analyses || 1,
      has_advanced_stats: plan.has_advanced_stats || false,
      has_reports: plan.has_reports || false,
      has_priority_support: plan.has_priority_support || false,
      has_remove_branding: plan.has_remove_branding || false,
      is_popular: plan.is_popular || false,
      is_active: plan.is_active !== false,
      sort_order: plan.sort_order || 0,
      subscribers: plan.subscribers || 0
    })
  }

  const handleSave = async () => {
    if (!editingId) return
    
    try {
      await adminPlanService.updatePlan(editingId, editData, admin?.id)
      setEditingId(null)
      loadPlans()
    } catch (error) {
      console.error('Error updating plan:', error)
      alert('حدث خطأ أثناء تحديث الباقة')
    }
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditData({})
  }

  const handleToggleActive = async (planId, current) => {
    if (!planId) return
    
    try {
      await adminPlanService.togglePlanStatus(planId, !current, admin?.id)
      loadPlans()
    } catch (error) {
      console.error('Error toggling plan:', error)
      alert('حدث خطأ أثناء تغيير حالة الباقة')
    }
  }

  const handleDelete = async (plan) => {
    if (!plan?.id) return
    if (!window.confirm(`هل أنت متأكد من حذف باقة ${plan.name || 'هذه'}؟`)) return
    
    try {
      await adminPlanService.deletePlan(plan.id)
      loadPlans()
    } catch (error) {
      console.error('Error deleting plan:', error)
      alert(error.message || 'حدث خطأ أثناء حذف الباقة')
    }
  }

  const handleDuplicate = async (plan) => {
    if (!plan?.id) return
    
    try {
      await adminPlanService.duplicatePlan(plan.id, admin?.id)
      loadPlans()
    } catch (error) {
      console.error('Error duplicating plan:', error)
      alert('حدث خطأ أثناء نسخ الباقة')
    }
  }

  const handleAddNewPlan = async () => {
    try {
      await adminPlanService.createPlan(newPlan, admin?.id)
      setShowAddModal(false)
      setNewPlan({
        name: '',
        name_ar: '',
        description: '',
        price_monthly: 0,
        price_yearly: null,
        currency: 'USD',
        max_projects: 3,
        max_skills: 10,
        max_certificates: 3,
        max_experience: 5,
        max_education: 5,
        storage_limit: 50,
        custom_domain: false,
        remove_branding: false,
        analytics: false,
        priority_support: false,
        ai_analysis: false,
        max_ai_analyses: 1,
        has_advanced_stats: false,
        has_reports: false,
        has_priority_support: false,
        has_remove_branding: false,
        is_popular: false,
        is_active: true,
        sort_order: plans.length
      })
      loadPlans()
    } catch (error) {
      console.error('Error creating plan:', error)
      alert('حدث خطأ أثناء إنشاء الباقة')
    }
  }

  const FeatureToggle = ({ label, field, icon: Icon, color = 'text-purple-400' }) => (
    <label className="flex items-center gap-2 p-2 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition">
      <input
        type="checkbox"
        checked={editData[field] || false}
        onChange={(e) => setEditData({ ...editData, [field]: e.target.checked })}
        className="w-4 h-4"
      />
      <Icon className={`w-4 h-4 ${color}`} />
      <span className="text-sm text-gray-300 flex-1">{label}</span>
      {editData[field] ? (
        <Check className="w-4 h-4 text-green-400" />
      ) : (
        <X className="w-4 h-4 text-red-400" />
      )}
    </label>
  )

  const FeatureDisplay = ({ label, value, icon: Icon, color = 'text-gray-400' }) => (
    <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
      <Icon className={`w-4 h-4 ${color}`} />
      <span className="text-sm text-gray-300 flex-1">{label}</span>
      {value === true ? (
        <Check className="w-4 h-4 text-green-400" />
      ) : value === false ? (
        <X className="w-4 h-4 text-red-400" />
      ) : (
        <span className="text-sm text-white">{value}</span>
      )}
    </div>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 animate-spin text-purple-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">إدارة الباقات</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white rounded-lg hover:scale-105 transition"
        >
          <Plus className="w-4 h-4" />
          إضافة باقة جديدة
        </button>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`bg-white/5 backdrop-blur-xl rounded-2xl p-6 border ${
              !plan.is_active ? 'border-red-500/30 opacity-60' :
              plan.is_popular ? 'border-yellow-500/50 shadow-lg shadow-yellow-500/10' :
              'border-white/10'
            }`}
          >
            {editingId === plan.id ? (
              // ==================== وضع التعديل ====================
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-white mb-4">تعديل الباقة</h2>
                
                {/* المعلومات الأساسية */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">الاسم (إنجليزي)</label>
                    <input
                      type="text"
                      value={editData.name || ''}
                      onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                      className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">الاسم (عربي)</label>
                    <input
                      type="text"
                      value={editData.name_ar || ''}
                      onChange={(e) => setEditData({ ...editData, name_ar: e.target.value })}
                      className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1">الوصف</label>
                  <textarea
                    value={editData.description || ''}
                    onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                    rows="2"
                    className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm resize-none"
                  />
                </div>

                {/* الأسعار */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">السعر الشهري ($)</label>
                    <input
                      type="number"
                      value={editData.price_monthly || 0}
                      onChange={(e) => setEditData({ ...editData, price_monthly: parseFloat(e.target.value) || 0 })}
                      className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">السعر السنوي ($)</label>
                    <input
                      type="number"
                      value={editData.price_yearly || ''}
                      onChange={(e) => setEditData({ ...editData, price_yearly: e.target.value ? parseFloat(e.target.value) : null })}
                      className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm"
                      placeholder="اختياري"
                    />
                  </div>
                </div>

                {/* الحدود الكمية */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">المشاريع</label>
                    <input
                      type="number"
                      value={editData.max_projects || 0}
                      onChange={(e) => setEditData({ ...editData, max_projects: parseInt(e.target.value) || 0 })}
                      className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">المهارات</label>
                    <input
                      type="number"
                      value={editData.max_skills || 0}
                      onChange={(e) => setEditData({ ...editData, max_skills: parseInt(e.target.value) || 0 })}
                      className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">الشهادات</label>
                    <input
                      type="number"
                      value={editData.max_certificates || 0}
                      onChange={(e) => setEditData({ ...editData, max_certificates: parseInt(e.target.value) || 0 })}
                      className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">الخبرات</label>
                    <input
                      type="number"
                      value={editData.max_experience || 0}
                      onChange={(e) => setEditData({ ...editData, max_experience: parseInt(e.target.value) || 0 })}
                      className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">التعليم</label>
                    <input
                      type="number"
                      value={editData.max_education || 0}
                      onChange={(e) => setEditData({ ...editData, max_education: parseInt(e.target.value) || 0 })}
                      className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">التخزين (MB)</label>
                    <input
                      type="number"
                      value={editData.storage_limit || 0}
                      onChange={(e) => setEditData({ ...editData, storage_limit: parseInt(e.target.value) || 0 })}
                      className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm"
                    />
                  </div>
                </div>

                {/* المميزات (Boolean) */}
                <div className="grid grid-cols-2 gap-3">
                  <FeatureToggle label="نطاق مخصص" field="custom_domain" icon={Globe} />
                  <FeatureToggle label="إزالة العلامة" field="remove_branding" icon={Shield} />
                  <FeatureToggle label="تحليلات" field="analytics" icon={TrendingUp} />
                  <FeatureToggle label="دعم أولوية" field="priority_support" icon={MessageCircle} />
                  <FeatureToggle label="تحليل ذكاء اصطناعي" field="ai_analysis" icon={Cpu} />
                  <FeatureToggle label="إحصائيات متقدمة" field="has_advanced_stats" icon={BarChart3} />
                  <FeatureToggle label="تقارير" field="has_reports" icon={Award} />
                  <FeatureToggle label="دعم VIP" field="has_priority_support" icon={Star} />
                </div>

                {/* خيارات إضافية */}
                <div className="flex items-center gap-4 pt-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editData.is_popular || false}
                      onChange={(e) => setEditData({ ...editData, is_popular: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-gray-300">باقة شائعة</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editData.is_active !== false}
                      onChange={(e) => setEditData({ ...editData, is_active: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-gray-300">مفعلة</span>
                  </label>
                </div>

                {/* أزرار الحفظ */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleSave}
                    className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    حفظ التغييرات
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex-1 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition flex items-center justify-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    إلغاء
                  </button>
                </div>
              </div>
            ) : (
              // ==================== وضع العرض ====================
              <div>
                {/* Header with actions */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${
                      plan.id === 1 ? 'from-gray-500 to-gray-600' :
                      plan.id === 2 ? 'from-blue-500 to-cyan-500' :
                      plan.id === 3 ? 'from-purple-500 to-pink-500' :
                      'from-yellow-500 to-orange-500'
                    } flex items-center justify-center`}>
                      <Crown className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                      <p className="text-sm text-gray-400">{plan.name_ar}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEdit(plan)}
                      className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg"
                      title="تعديل"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDuplicate(plan)}
                      className="p-2 text-green-400 hover:bg-green-500/10 rounded-lg"
                      title="نسخ"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleToggleActive(plan.id, plan.is_active)}
                      className={`p-2 ${
                        plan.is_active ? 'text-yellow-400 hover:bg-yellow-500/10' : 'text-green-400 hover:bg-green-500/10'
                      } rounded-lg`}
                      title={plan.is_active ? 'تعطيل' : 'تفعيل'}
                    >
                      {plan.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => handleDelete(plan)}
                      className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg"
                      title="حذف"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Price */}
                <div className="mb-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-white">${plan.price_monthly}</span>
                    <span className="text-sm text-gray-400">/شهر</span>
                  </div>
                  {plan.price_yearly && (
                    <div className="text-sm text-green-400">
                      ${plan.price_yearly}/سنة (وفر {Math.round((1 - plan.price_yearly/(plan.price_monthly*12)) * 100)}%)
                    </div>
                  )}
                </div>

                {/* Limits */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <FeatureDisplay label="المشاريع" value={plan.max_projects} icon={Award} />
                  <FeatureDisplay label="المهارات" value={plan.max_skills} icon={Sparkles} />
                  <FeatureDisplay label="الشهادات" value={plan.max_certificates} icon={Award} />
                  <FeatureDisplay label="الخبرات" value={plan.max_experience} icon={Briefcase} />
                  <FeatureDisplay label="التعليم" value={plan.max_education} icon={GraduationCap} />
                  <FeatureDisplay label="التخزين" value={`${plan.storage_limit}MB`} icon={HardDrive} />
                </div>

                {/* Features */}
                <div className="grid grid-cols-2 gap-2">
                  <FeatureDisplay label="نطاق مخصص" value={plan.custom_domain} icon={Globe} color="text-blue-400" />
                  <FeatureDisplay label="إزالة العلامة" value={plan.remove_branding} icon={Shield} color="text-green-400" />
                  <FeatureDisplay label="تحليلات" value={plan.analytics} icon={TrendingUp} color="text-purple-400" />
                  <FeatureDisplay label="دعم أولوية" value={plan.priority_support} icon={MessageCircle} color="text-yellow-400" />
                  <FeatureDisplay label="تحليل ذكاء" value={plan.ai_analysis} icon={Cpu} color="text-pink-400" />
                  <FeatureDisplay label="إحصائيات متقدمة" value={plan.has_advanced_stats} icon={BarChart3} color="text-indigo-400" />
                </div>

                {/* Badges */}
                <div className="flex items-center gap-2 mt-4">
                  {plan.is_popular && (
                    <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs">
                      ★ شائع
                    </span>
                  )}
                  {!plan.is_active && (
                    <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-xs">
                      معطل
                    </span>
                  )}
                  <span className="text-xs text-gray-500">
                    عدد المشتركين: {plan.subscribers || 0}
                  </span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Plan Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-[#030014] rounded-2xl border border-white/10 max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">إضافة باقة جديدة</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">الاسم (إنجليزي)</label>
                  <input
                    type="text"
                    value={newPlan.name}
                    onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
                    className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">الاسم (عربي)</label>
                  <input
                    type="text"
                    value={newPlan.name_ar}
                    onChange={(e) => setNewPlan({ ...newPlan, name_ar: e.target.value })}
                    className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">الوصف</label>
                <textarea
                  value={newPlan.description}
                  onChange={(e) => setNewPlan({ ...newPlan, description: e.target.value })}
                  rows="2"
                  className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">السعر الشهري ($)</label>
                  <input
                    type="number"
                    value={newPlan.price_monthly}
                    onChange={(e) => setNewPlan({ ...newPlan, price_monthly: parseFloat(e.target.value) || 0 })}
                    className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">السعر السنوي ($)</label>
                  <input
                    type="number"
                    value={newPlan.price_yearly || ''}
                    onChange={(e) => setNewPlan({ ...newPlan, price_yearly: e.target.value ? parseFloat(e.target.value) : null })}
                    className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">المشاريع</label>
                  <input
                    type="number"
                    value={newPlan.max_projects}
                    onChange={(e) => setNewPlan({ ...newPlan, max_projects: parseInt(e.target.value) || 0 })}
                    className="w-full p-2 bg-white/5 border border-white/10 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">المهارات</label>
                  <input
                    type="number"
                    value={newPlan.max_skills}
                    onChange={(e) => setNewPlan({ ...newPlan, max_skills: parseInt(e.target.value) || 0 })}
                    className="w-full p-2 bg-white/5 border border-white/10 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">الشهادات</label>
                  <input
                    type="number"
                    value={newPlan.max_certificates}
                    onChange={(e) => setNewPlan({ ...newPlan, max_certificates: parseInt(e.target.value) || 0 })}
                    className="w-full p-2 bg-white/5 border border-white/10 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">الخبرات</label>
                  <input
                    type="number"
                    value={newPlan.max_experience}
                    onChange={(e) => setNewPlan({ ...newPlan, max_experience: parseInt(e.target.value) || 0 })}
                    className="w-full p-2 bg-white/5 border border-white/10 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">التعليم</label>
                  <input
                    type="number"
                    value={newPlan.max_education}
                    onChange={(e) => setNewPlan({ ...newPlan, max_education: parseInt(e.target.value) || 0 })}
                    className="w-full p-2 bg-white/5 border border-white/10 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">التخزين (MB)</label>
                  <input
                    type="number"
                    value={newPlan.storage_limit}
                    onChange={(e) => setNewPlan({ ...newPlan, storage_limit: parseInt(e.target.value) || 0 })}
                    className="w-full p-2 bg-white/5 border border-white/10 rounded-lg text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
                  <input
                    type="checkbox"
                    checked={newPlan.custom_domain}
                    onChange={(e) => setNewPlan({ ...newPlan, custom_domain: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-gray-300">نطاق مخصص</span>
                </label>
                <label className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
                  <input
                    type="checkbox"
                    checked={newPlan.remove_branding}
                    onChange={(e) => setNewPlan({ ...newPlan, remove_branding: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-gray-300">إزالة العلامة</span>
                </label>
                <label className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
                  <input
                    type="checkbox"
                    checked={newPlan.analytics}
                    onChange={(e) => setNewPlan({ ...newPlan, analytics: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-gray-300">تحليلات</span>
                </label>
                <label className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
                  <input
                    type="checkbox"
                    checked={newPlan.priority_support}
                    onChange={(e) => setNewPlan({ ...newPlan, priority_support: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-gray-300">دعم أولوية</span>
                </label>
                <label className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
                  <input
                    type="checkbox"
                    checked={newPlan.ai_analysis}
                    onChange={(e) => setNewPlan({ ...newPlan, ai_analysis: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-gray-300">تحليل ذكاء</span>
                </label>
                <label className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
                  <input
                    type="checkbox"
                    checked={newPlan.has_advanced_stats}
                    onChange={(e) => setNewPlan({ ...newPlan, has_advanced_stats: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-gray-300">إحصائيات متقدمة</span>
                </label>
              </div>

              <div className="flex items-center gap-4 pt-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newPlan.is_popular}
                    onChange={(e) => setNewPlan({ ...newPlan, is_popular: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-gray-300">باقة شائعة</span>
                </label>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={handleAddNewPlan}
                  className="flex-1 py-3 bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white rounded-xl font-semibold hover:scale-[1.02] transition"
                >
                  إنشاء الباقة
                </button>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/20 transition"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}



export default Plans
