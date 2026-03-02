import React, { useState, useEffect, useCallback, useRef } from 'react'
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
  Shield
} from 'lucide-react'

const Plans = () => {
  const { admin } = useAdminAuth()
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(0)
  const [total, setTotal] = useState(0)
  const [editingId, setEditingId] = useState(null)
  const [editData, setEditData] = useState({})
  const [showAddModal, setShowAddModal] = useState(false)
  const [newPlan, setNewPlan] = useState({
    name: '',
    name_ar: '',
    price_monthly: 0,
    price_yearly: null,
    price_lifetime: null,
    max_projects: 3,
    max_skills: 10,
    max_certificates: 3,
    max_experience: 5,
    max_education: 5,
    storage_limit: 100,
    custom_domain: false,
    remove_branding: false,
    analytics: false,
    priority_support: false,
    ai_analysis: false,
    description: '',
    features: [],
    sort_order: 0,
    is_active: true
  })
  const [featureInput, setFeatureInput] = useState('')
  const observerRef = useRef()

  useEffect(() => {
    loadPlans(0)
  }, [])

  const loadPlans = async (pageNum) => {
    if (loading && pageNum > 0) return
    
    setLoading(true)
    try {
      const result = await adminPlanService.getAllPlans(pageNum, 10)
      
      if (pageNum === 0) {
        setPlans(result.data)
      } else {
        setPlans(prev => [...prev, ...result.data])
      }
      
      setHasMore(result.hasMore)
      setTotal(result.count)
      setPage(pageNum)
    } catch (error) {
      console.error('Error loading plans:', error)
    } finally {
      setLoading(false)
    }
  }

  // Infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0]
        if (first.isIntersecting && hasMore && !loading) {
          loadPlans(page + 1)
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    )

    const currentObserver = observerRef.current
    if (currentObserver) {
      observer.observe(currentObserver)
    }

    return () => {
      if (currentObserver) {
        observer.unobserve(currentObserver)
      }
    }
  }, [hasMore, loading, page])

  const handleEdit = (plan) => {
    setEditingId(plan.id)
    setEditData({
      name: plan.name,
      name_ar: plan.name_ar,
      price_monthly: plan.price_monthly,
      price_yearly: plan.price_yearly,
      price_lifetime: plan.price_lifetime,
      max_projects: plan.max_projects,
      max_skills: plan.max_skills,
      max_certificates: plan.max_certificates,
      max_experience: plan.max_experience,
      max_education: plan.max_education,
      storage_limit: plan.storage_limit,
      custom_domain: plan.custom_domain,
      remove_branding: plan.remove_branding,
      analytics: plan.analytics,
      priority_support: plan.priority_support,
      ai_analysis: plan.ai_analysis,
      description: plan.description,
      features: plan.features || [],
      sort_order: plan.sort_order
    })
  }

  const handleSave = async () => {
    try {
      await adminPlanService.updatePlan(editingId, editData, admin.id)
      setEditingId(null)
      loadPlans(0)
    } catch (error) {
      console.error('Error updating plan:', error)
      alert('حدث خطأ أثناء تحديث الباقة')
    }
  }

  const handleCancel = () => {
    setEditingId(null)
  }

  const handleToggleActive = async (planId, current) => {
    try {
      await adminPlanService.togglePlanStatus(planId, !current, admin.id)
      loadPlans(0)
    } catch (error) {
      console.error('Error toggling plan:', error)
      alert('حدث خطأ أثناء تغيير حالة الباقة')
    }
  }

  const handleDelete = async (plan) => {
    if (!window.confirm(`هل أنت متأكد من حذف باقة ${plan.name}؟`)) return
    
    try {
      await adminPlanService.deletePlan(plan.id)
      loadPlans(0)
    } catch (error) {
      console.error('Error deleting plan:', error)
      alert(error.message || 'حدث خطأ أثناء حذف الباقة')
    }
  }

  const handleDuplicate = async (plan) => {
    try {
      await adminPlanService.duplicatePlan(plan.id, admin.id)
      loadPlans(0)
    } catch (error) {
      console.error('Error duplicating plan:', error)
      alert('حدث خطأ أثناء نسخ الباقة')
    }
  }

  const handleAddFeature = () => {
    if (featureInput.trim()) {
      setEditData({
        ...editData,
        features: [...(editData.features || []), featureInput.trim()]
      })
      setFeatureInput('')
    }
  }

  const handleRemoveFeature = (index) => {
    setEditData({
      ...editData,
      features: editData.features.filter((_, i) => i !== index)
    })
  }

  const handleAddNewPlan = async () => {
    try {
      await adminPlanService.createPlan(newPlan, admin.id)
      setShowAddModal(false)
      setNewPlan({
        name: '',
        name_ar: '',
        price_monthly: 0,
        price_yearly: null,
        price_lifetime: null,
        max_projects: 3,
        max_skills: 10,
        max_certificates: 3,
        max_experience: 5,
        max_education: 5,
        storage_limit: 100,
        custom_domain: false,
        remove_branding: false,
        analytics: false,
        priority_support: false,
        ai_analysis: false,
        description: '',
        features: [],
        sort_order: plans.length,
        is_active: true
      })
      loadPlans(0)
    } catch (error) {
      console.error('Error creating plan:', error)
      alert('حدث خطأ أثناء إنشاء الباقة')
    }
  }

  const handleReorder = async (planId, direction) => {
    const index = plans.findIndex(p => p.id === planId)
    if (direction === 'up' && index > 0) {
      const newPlans = [...plans]
      const temp = newPlans[index]
      newPlans[index] = newPlans[index - 1]
      newPlans[index - 1] = temp
      
      try {
        await adminPlanService.reorderPlans(
          newPlans.map(p => p.id),
          admin.id
        )
        setPlans(newPlans)
      } catch (error) {
        console.error('Error reordering plans:', error)
      }
    } else if (direction === 'down' && index < plans.length - 1) {
      const newPlans = [...plans]
      const temp = newPlans[index]
      newPlans[index] = newPlans[index + 1]
      newPlans[index + 1] = temp
      
      try {
        await adminPlanService.reorderPlans(
          newPlans.map(p => p.id),
          admin.id
        )
        setPlans(newPlans)
      } catch (error) {
        console.error('Error reordering plans:', error)
      }
    }
  }

  return (
    <div className="space-y-6">
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan, index) => (
          <div
            key={plan.id}
            className={`bg-white/5 backdrop-blur-xl rounded-2xl p-6 border ${
              !plan.is_active ? 'border-red-500/30 opacity-60' :
              plan.id === 1 ? 'border-gray-500/30' :
              plan.id === 2 ? 'border-blue-500/30' :
              plan.id === 3 ? 'border-yellow-500/30' :
              'border-purple-500/30'
            }`}
          >
            {editingId === plan.id ? (
              // Edit Mode
              <div className="space-y-4">
                <input
                  type="text"
                  value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white"
                  placeholder="اسم الباقة (إنجليزي)"
                />
                <input
                  type="text"
                  value={editData.name_ar}
                  onChange={(e) => setEditData({ ...editData, name_ar: e.target.value })}
                  className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white"
                  placeholder="اسم الباقة (عربي)"
                />

                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    value={editData.price_monthly}
                    onChange={(e) => setEditData({ ...editData, price_monthly: parseFloat(e.target.value) })}
                    className="p-2 bg-white/10 border border-white/20 rounded-lg text-white"
                    placeholder="شهري"
                  />
                  <input
                    type="number"
                    value={editData.price_yearly || ''}
                    onChange={(e) => setEditData({ ...editData, price_yearly: e.target.value ? parseFloat(e.target.value) : null })}
                    className="p-2 bg-white/10 border border-white/20 rounded-lg text-white"
                    placeholder="سنوي"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    value={editData.max_projects}
                    onChange={(e) => setEditData({ ...editData, max_projects: parseInt(e.target.value) })}
                    className="p-2 bg-white/10 border border-white/20 rounded-lg text-white"
                    placeholder="المشاريع"
                  />
                  <input
                    type="number"
                    value={editData.max_skills}
                    onChange={(e) => setEditData({ ...editData, max_skills: parseInt(e.target.value) })}
                    className="p-2 bg-white/10 border border-white/20 rounded-lg text-white"
                    placeholder="المهارات"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    value={editData.max_certificates}
                    onChange={(e) => setEditData({ ...editData, max_certificates: parseInt(e.target.value) })}
                    className="p-2 bg-white/10 border border-white/20 rounded-lg text-white"
                    placeholder="الشهادات"
                  />
                  <input
                    type="number"
                    value={editData.storage_limit}
                    onChange={(e) => setEditData({ ...editData, storage_limit: parseInt(e.target.value) })}
                    className="p-2 bg-white/10 border border-white/20 rounded-lg text-white"
                    placeholder="التخزين (MB)"
                  />
                </div>

                {/* Features */}
                <div>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={featureInput}
                      onChange={(e) => setFeatureInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddFeature()}
                      className="flex-1 p-2 bg-white/10 border border-white/20 rounded-lg text-white"
                      placeholder="ميزة جديدة"
                    />
                    <button
                      onClick={handleAddFeature}
                      className="px-3 py-2 bg-[#6366f1] text-white rounded-lg"
                    >
                      إضافة
                    </button>
                  </div>
                  <div className="space-y-1">
                    {editData.features?.map((feature, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                        <span className="text-sm text-gray-300">{feature}</span>
                        <button
                          onClick={() => handleRemoveFeature(idx)}
                          className="p-1 text-red-400 hover:bg-red-500/10 rounded"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Features Toggles */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editData.custom_domain}
                      onChange={(e) => setEditData({ ...editData, custom_domain: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-gray-300">نطاق مخصص</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editData.remove_branding}
                      onChange={(e) => setEditData({ ...editData, remove_branding: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-gray-300">إزالة العلامة التجارية</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editData.analytics}
                      onChange={(e) => setEditData({ ...editData, analytics: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-gray-300">تحليلات متقدمة</span>
                  </label>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    className="flex-1 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                  >
                    <Save className="w-4 h-4 mx-auto" />
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex-1 px-3 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition"
                  >
                    <X className="w-4 h-4 mx-auto" />
                  </button>
                </div>
              </div>
            ) : (
              // View Mode
              <>
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${
                    plan.id === 1 ? 'from-gray-500 to-gray-600' :
                    plan.id === 2 ? 'from-blue-500 to-cyan-500' :
                    plan.id === 3 ? 'from-yellow-500 to-orange-500' :
                    'from-purple-500 to-pink-500'
                  } flex items-center justify-center`}>
                    <Crown className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleReorder(plan.id, 'up')}
                      disabled={index === 0}
                      className="p-1 text-gray-400 hover:text-white disabled:opacity-30"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => handleReorder(plan.id, 'down')}
                      disabled={index === plans.length - 1}
                      className="p-1 text-gray-400 hover:text-white disabled:opacity-30"
                    >
                      ↓
                    </button>
                  </div>
                </div>

                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                    <p className="text-sm text-gray-400">{plan.name_ar}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEdit(plan)}
                      className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDuplicate(plan)}
                      className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg"
                      title="نسخ"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleToggleActive(plan.id, plan.is_active)}
                      className={`p-2 ${
                        plan.is_active ? 'text-green-400 hover:bg-green-500/10' : 'text-red-400 hover:bg-red-500/10'
                      } rounded-lg`}
                    >
                      {plan.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => handleDelete(plan)}
                      className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="flex items-center gap-2 text-2xl font-bold text-white">
                    <DollarSign className="w-5 h-5 text-green-400" />
                    {plan.price_monthly}
                    <span className="text-sm text-gray-400 font-normal">/شهر</span>
                  </div>
                  {plan.price_yearly && (
                    <div className="flex items-center gap-2 text-lg text-gray-300">
                      <Calendar className="w-4 h-4 text-blue-400" />
                      ${plan.price_yearly}/سنة
                    </div>
                  )}

                  <div className="pt-3 border-t border-white/10 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400 flex items-center gap-1">
                        <Users className="w-4 h-4" /> المشتركين
                      </span>
                      <span className="text-white">{plan.subscribers || 0}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400 flex items-center gap-1">
                        <HardDrive className="w-4 h-4" /> التخزين
                      </span>
                      <span className="text-white">{plan.storage_limit}MB</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">المشاريع</span>
                      <span className="text-white">{plan.max_projects}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">المهارات</span>
                      <span className="text-white">{plan.max_skills}</span>
                    </div>
                  </div>

                  {/* Features */}
                  {plan.features?.length > 0 && (
                    <div className="pt-3 border-t border-white/10">
                      <p className="text-sm text-gray-400 mb-2">المميزات:</p>
                      <ul className="space-y-1">
                        {plan.features.slice(0, 3).map((feature, idx) => (
                          <li key={idx} className="text-xs text-gray-300 flex items-center gap-1">
                            <Check className="w-3 h-3 text-green-400" />
                            {feature}
                          </li>
                        ))}
                        {plan.features.length > 3 && (
                          <li className="text-xs text-gray-500">+{plan.features.length - 3} مميزات أخرى</li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Loading Indicator */}
      <div ref={observerRef} className="h-10 flex justify-center">
        {loading && (
          <Loader className="w-6 h-6 animate-spin text-purple-400" />
        )}
      </div>

      {/* Add Plan Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-[#030014] rounded-2xl border border-white/10 max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
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
                  <label className="block text-sm text-gray-400 mb-2">اسم الباقة (إنجليزي)</label>
                  <input
                    type="text"
                    value={newPlan.name}
                    onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
                    className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">اسم الباقة (عربي)</label>
                  <input
                    type="text"
                    value={newPlan.name_ar}
                    onChange={(e) => setNewPlan({ ...newPlan, name_ar: e.target.value })}
                    className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">السعر الشهري ($)</label>
                  <input
                    type="number"
                    value={newPlan.price_monthly}
                    onChange={(e) => setNewPlan({ ...newPlan, price_monthly: parseFloat(e.target.value) })}
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">الحد الأقصى للمشاريع</label>
                  <input
                    type="number"
                    value={newPlan.max_projects}
                    onChange={(e) => setNewPlan({ ...newPlan, max_projects: parseInt(e.target.value) })}
                    className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">الحد الأقصى للمهارات</label>
                  <input
                    type="number"
                    value={newPlan.max_skills}
                    onChange={(e) => setNewPlan({ ...newPlan, max_skills: parseInt(e.target.value) })}
                    className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">الوصف</label>
                <textarea
                  value={newPlan.description}
                  onChange={(e) => setNewPlan({ ...newPlan, description: e.target.value })}
                  rows="3"
                  className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newPlan.custom_domain}
                    onChange={(e) => setNewPlan({ ...newPlan, custom_domain: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-gray-300">نطاق مخصص</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newPlan.remove_branding}
                    onChange={(e) => setNewPlan({ ...newPlan, remove_branding: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-gray-300">إزالة العلامة التجارية</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newPlan.analytics}
                    onChange={(e) => setNewPlan({ ...newPlan, analytics: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-gray-300">تحليلات متقدمة</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newPlan.priority_support}
                    onChange={(e) => setNewPlan({ ...newPlan, priority_support: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-gray-300">دعم ذو أولوية</span>
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
