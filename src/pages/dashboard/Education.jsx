import React, { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { usePlan } from '../../hooks/usePlan'
import { educationService } from '../../lib/supabase'
import { DEGREE_TYPES } from '../../utils/constants'
import {
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Loader,
  AlertCircle,
  ChevronUp,
  ChevronDown,
  GraduationCap,
  Calendar,
  MapPin,
  Award
} from 'lucide-react'

const Education = () => {
  const { user } = useAuth()
  const { checkLimit, limits } = usePlan()
  const [educations, setEducations] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [editingId, setEditingId] = useState(null)

  // جلب التعليم عند تحميل الصفحة
  useEffect(() => {
    fetchEducation()
  }, [user])

  const fetchEducation = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      const data = await educationService.getByDeveloperId(user.id)
      setEducations(data || [])
    } catch (err) {
      console.error('Error fetching education:', err)
      setError('فشل في جلب المؤهلات التعليمية')
    } finally {
      setLoading(false)
    }
  }

  // نموذج تعليم جديد
  const [newEducation, setNewEducation] = useState({
    degree: '',
    field_of_study: '',
    institution: '',
    location: '',
    start_date: '',
    end_date: '',
    is_current: false,
    grade: '',
    description: '',
    activities: ''
  })
// دالة تحويل تنسيق الشهر (YYYY-MM) إلى تاريخ كامل (YYYY-MM-DD)
const formatDateForDB = (monthString) => {
  if (!monthString) return null
  return `${monthString}-01` // إضافة اليوم الأول من الشهر
}
  const handleAddEducation = async () => {
    // التحقق من حدود الباقة
    if (!checkLimit('education', educations.length)) {
      setError(`لقد وصلت للحد الأقصى (${limits.maxEducation} مؤهل)`)
      return
    }

    if (!newEducation.degree || !newEducation.institution) {
      setError('الدرجة العلمية والمؤسسة مطلوبان')
      return
    }

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const educationData = {
      ...newEducation,
      start_date: formatDateForDB(newEducation.start_date),
      end_date: formatDateForDB(newEducation.end_date),
      display_order: educations.length,
      developer_id: user.id
    }

      const created = await educationService.create(user.id, educationData)
      setEducations([...educations, created])
      
      // إعادة تعيين النموذج
      setNewEducation({
        degree: '',
        field_of_study: '',
        institution: '',
        location: '',
        start_date: '',
        end_date: '',
        is_current: false,
        grade: '',
        description: '',
        activities: ''
      })
      
      setSuccess('✅ تم إضافة المؤهل بنجاح')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      console.error('Error adding education:', err)
      setError(err.message || 'فشل في إضافة المؤهل التعليمي')
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateEducation = async (id, updates) => {
  setSaving(true)
  setError('')
  setSuccess('')
  
  try {
    // ✅ تحويل التواريخ قبل الإرسال
    const formattedUpdates = {
      ...updates,
      start_date: formatDateForDB(updates.start_date),
      end_date: formatDateForDB(updates.end_date)
    }
    
    const updated = await educationService.update(id, formattedUpdates)
    setEducations(educations.map(edu => edu.id === id ? updated : edu))
    setEditingId(null)
    setSuccess('✅ تم تحديث المؤهل بنجاح')
    setTimeout(() => setSuccess(''), 3000)
  } catch (err) {
    console.error('Error updating education:', err)
    setError(err.message || 'فشل في تحديث المؤهل التعليمي')
  } finally {
    setSaving(false)
  }
}

  const handleDeleteEducation = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المؤهل التعليمي؟')) return

    try {
      await educationService.delete(id)
      setEducations(educations.filter(edu => edu.id !== id))
      setSuccess('✅ تم حذف المؤهل بنجاح')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      console.error('Error deleting education:', err)
      setError(err.message || 'فشل في حذف المؤهل التعليمي')
    }
  }

  const handleMoveEducation = async (index, direction) => {
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= educations.length) return

    const updatedEducations = [...educations]
    const temp = updatedEducations[index]
    updatedEducations[index] = updatedEducations[newIndex]
    updatedEducations[newIndex] = temp

    // تحديث ترتيب العرض
    updatedEducations.forEach((edu, i) => {
      edu.display_order = i
    })

    setEducations(updatedEducations)

    // حفظ الترتيب الجديد في الخادم
    try {
      await Promise.all(
        updatedEducations.map(edu => 
          educationService.update(edu.id, { display_order: edu.display_order })
        )
      )
    } catch (err) {
      console.error('Error updating order:', err)
    }
  }

  // تنسيق التاريخ للعرض
  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('ar-SA', { year: 'numeric', month: 'long' })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030014] flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-[#6366f1] animate-spin mx-auto mb-4" />
          <p className="text-gray-400">جاري تحميل مؤهلاتك التعليمية...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">المؤهلات التعليمية</h1>
        <div className="text-sm text-gray-400">
          {educations.length} / {limits?.maxEducation === -1 ? '∞' : limits?.maxEducation || 5}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Success message */}
      {success && (
        <div className="flex items-center gap-2 p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>{success}</p>
        </div>
      )}

      {/* Add new education form */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
        <h2 className="text-lg font-semibold text-white mb-4">إضافة مؤهل تعليمي جديد</h2>
        
        <div className="space-y-4">
          {/* Degree and field */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">الدرجة العلمية *</label>
              <select
                value={newEducation.degree}
                onChange={(e) => setNewEducation({ ...newEducation, degree: e.target.value })}
                className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white"
              >
                <option value="">اختر الدرجة</option>
                {DEGREE_TYPES.map(degree => (
                  <option key={degree} value={degree}>{degree}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">التخصص</label>
              <input
                type="text"
                value={newEducation.field_of_study}
                onChange={(e) => setNewEducation({ ...newEducation, field_of_study: e.target.value })}
                className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white"
                placeholder="مثال: علوم الحاسب"
              />
            </div>
          </div>

          {/* Institution and location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">الجامعة / المؤسسة *</label>
              <input
                type="text"
                value={newEducation.institution}
                onChange={(e) => setNewEducation({ ...newEducation, institution: e.target.value })}
                className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white"
                placeholder="مثال: جامعة القاهرة"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">الموقع</label>
              <input
                type="text"
                value={newEducation.location}
                onChange={(e) => setNewEducation({ ...newEducation, location: e.target.value })}
                className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white"
                placeholder="مثال: القاهرة، مصر"
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">تاريخ البداية</label>
              <input
                type="month"
                value={newEducation.start_date}
                onChange={(e) => setNewEducation({ ...newEducation, start_date: e.target.value })}
                className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">تاريخ النهاية</label>
              <div className="flex items-center gap-2">
                <input
                  type="month"
                  value={newEducation.end_date}
                  onChange={(e) => setNewEducation({ ...newEducation, end_date: e.target.value })}
                  disabled={newEducation.is_current}
                  className="flex-1 p-3 bg-white/10 border border-white/20 rounded-lg text-white disabled:opacity-50"
                />
                <label className="flex items-center gap-2 text-sm text-gray-400 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={newEducation.is_current}
                    onChange={(e) => setNewEducation({ ...newEducation, is_current: e.target.checked })}
                    className="w-4 h-4 bg-white/10 border-white/20 rounded"
                  />
                  حتى الآن
                </label>
              </div>
            </div>
          </div>

          {/* Grade */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">التقدير / المعدل</label>
            <input
              type="text"
              value={newEducation.grade}
              onChange={(e) => setNewEducation({ ...newEducation, grade: e.target.value })}
              className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white"
              placeholder="مثال: 3.8/4.0"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">الوصف</label>
            <textarea
              value={newEducation.description}
              onChange={(e) => setNewEducation({ ...newEducation, description: e.target.value })}
              rows="3"
              className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white"
              placeholder="صف دراستك، مشروع التخرج، إلخ..."
            />
          </div>

          {/* Activities */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">الأنشطة</label>
            <textarea
              value={newEducation.activities}
              onChange={(e) => setNewEducation({ ...newEducation, activities: e.target.value })}
              rows="3"
              className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white"
              placeholder="الأنشطة الطلابية، الأندية، إلخ..."
            />
          </div>

          {/* Submit button */}
          <button
            onClick={handleAddEducation}
            disabled={saving || !newEducation.degree || !newEducation.institution}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white rounded-xl font-semibold hover:scale-[1.02] transition-all disabled:opacity-50"
          >
            {saving ? <Loader className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
            إضافة مؤهل
          </button>
        </div>
      </div>

      {/* Education list */}
      <div className="space-y-4">
        {educations.length === 0 ? (
          <div className="text-center py-12">
            <GraduationCap className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">لا توجد مؤهلات تعليمية بعد</p>
            <p className="text-sm text-gray-500">أضف مؤهلاتك من النموذج أعلاه</p>
          </div>
        ) : (
          educations.map((education, index) => (
            <EducationCard
              key={education.id}
              education={education}
              index={index}
              total={educations.length}
              onEdit={() => setEditingId(education.id)}
              onDelete={() => handleDeleteEducation(education.id)}
              onMoveUp={() => handleMoveEducation(index, 'up')}
              onMoveDown={() => handleMoveEducation(index, 'down')}
              isEditing={editingId === education.id}
              onUpdate={handleUpdateEducation}
              formatDate={formatDate}
            />
          ))
        )}
      </div>
    </div>
  )
}

// مكون بطاقة التعليم
const EducationCard = ({ 
  education, 
  index, 
  total, 
  onEdit, 
  onDelete, 
  onMoveUp, 
  onMoveDown,
  isEditing,
  onUpdate,
  formatDate 
}) => {
  const [editData, setEditData] = useState(education)

  if (isEditing) {
    return (
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-[#6366f1]/50">
        <div className="space-y-4">
          {/* Degree and field */}
          <div className="grid grid-cols-2 gap-4">
            <select
              value={editData.degree || ''}
              onChange={(e) => setEditData({ ...editData, degree: e.target.value })}
              className="p-3 bg-white/10 border border-white/20 rounded-lg text-white"
            >
              {DEGREE_TYPES.map(degree => (
                <option key={degree} value={degree}>{degree}</option>
              ))}
            </select>
            <input
              type="text"
              value={editData.field_of_study || ''}
              onChange={(e) => setEditData({ ...editData, field_of_study: e.target.value })}
              className="p-3 bg-white/10 border border-white/20 rounded-lg text-white"
              placeholder="التخصص"
            />
          </div>

          {/* Institution and location */}
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              value={editData.institution || ''}
              onChange={(e) => setEditData({ ...editData, institution: e.target.value })}
              className="p-3 bg-white/10 border border-white/20 rounded-lg text-white"
              placeholder="الجامعة"
            />
            <input
              type="text"
              value={editData.location || ''}
              onChange={(e) => setEditData({ ...editData, location: e.target.value })}
              className="p-3 bg-white/10 border border-white/20 rounded-lg text-white"
              placeholder="الموقع"
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <input
              type="month"
              value={editData.start_date || ''}
              onChange={(e) => setEditData({ ...editData, start_date: e.target.value })}
              className="p-3 bg-white/10 border border-white/20 rounded-lg text-white"
            />
            <div className="flex items-center gap-2">
              <input
                type="month"
                value={editData.end_date || ''}
                onChange={(e) => setEditData({ ...editData, end_date: e.target.value })}
                disabled={editData.is_current}
                className="flex-1 p-3 bg-white/10 border border-white/20 rounded-lg text-white disabled:opacity-50"
              />
              <label className="flex items-center gap-2 text-sm text-gray-400 whitespace-nowrap">
                <input
                  type="checkbox"
                  checked={editData.is_current || false}
                  onChange={(e) => setEditData({ ...editData, is_current: e.target.checked })}
                  className="w-4 h-4"
                />
                حتى الآن
              </label>
            </div>
          </div>

          {/* Grade */}
          <input
            type="text"
            value={editData.grade || ''}
            onChange={(e) => setEditData({ ...editData, grade: e.target.value })}
            className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white"
            placeholder="التقدير"
          />

          {/* Description */}
          <textarea
            value={editData.description || ''}
            onChange={(e) => setEditData({ ...editData, description: e.target.value })}
            rows="2"
            className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white"
            placeholder="الوصف"
          />

          {/* Activities */}
          <textarea
            value={editData.activities || ''}
            onChange={(e) => setEditData({ ...editData, activities: e.target.value })}
            rows="2"
            className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white"
            placeholder="الأنشطة"
          />

          {/* Action buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => onUpdate(education.id, editData)}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              <Save className="w-4 h-4" />
              حفظ
            </button>
            <button
              onClick={onEdit}
              className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20"
            >
              إلغاء
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="group relative bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all">
      {/* Move buttons */}
      <div className="absolute left-4 top-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {index > 0 && (
          <button onClick={onMoveUp} className="p-1 text-gray-400 hover:text-white hover:bg-white/10 rounded">
            <ChevronUp className="w-4 h-4" />
          </button>
        )}
        {index < total - 1 && (
          <button onClick={onMoveDown} className="p-1 text-gray-400 hover:text-white hover:bg-white/10 rounded">
            <ChevronDown className="w-4 h-4" />
          </button>
        )}
        <button onClick={onEdit} className="p-1 text-gray-400 hover:text-white hover:bg-white/10 rounded">
          <Edit className="w-4 h-4" />
        </button>
        <button onClick={onDelete} className="p-1 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Header */}
      <div className="mb-4">
        <h3 className="text-xl font-semibold text-white">{education.degree}</h3>
        <div className="flex flex-wrap items-center gap-4 mt-1 text-sm text-gray-400">
          <span className="flex items-center gap-1">
            <GraduationCap className="w-4 h-4" />
            {education.institution}
          </span>
          {education.field_of_study && (
            <span className="text-gray-500">{education.field_of_study}</span>
          )}
        </div>
      </div>

      {/* Details */}
      <div className="space-y-3">
        {/* Dates */}
        {(education.start_date || education.end_date) && (
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <span className="flex items-center gap-1 text-gray-400">
              <Calendar className="w-4 h-4" />
              {formatDate(education.start_date)} - {education.is_current ? 'حتى الآن' : formatDate(education.end_date)}
            </span>
            {education.grade && (
              <span className="flex items-center gap-1 text-gray-400">
                <Award className="w-4 h-4" />
                {education.grade}
              </span>
            )}
          </div>
        )}

        {/* Location */}
        {education.location && (
          <div className="flex items-center gap-1 text-sm text-gray-400">
            <MapPin className="w-4 h-4" />
            {education.location}
          </div>
        )}

        {/* Description */}
        {education.description && (
          <p className="text-gray-300 text-sm leading-relaxed">{education.description}</p>
        )}

        {/* Activities */}
        {education.activities && (
          <div>
            <h4 className="text-sm font-medium text-gray-400 mb-1">الأنشطة</h4>
            <p className="text-gray-300 text-sm">{education.activities}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Education
