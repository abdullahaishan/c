import React, { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { usePlan } from '../../hooks/usePlan'
import { experienceService } from '../../lib/supabase'
import { EMPLOYMENT_TYPES, LOCATION_TYPES } from '../../utils/constants'
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
  Briefcase,
  MapPin,
  Calendar,
  Building
} from 'lucide-react'

const Experience = () => {
  const { user } = useAuth() // ✅ استخدم useAuth بدلاً من useDeveloper
  const { checkLimit, limits } = usePlan()
  const [experiences, setExperiences] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState(null)

  // جلب الخبرات عند تحميل الصفحة
  useEffect(() => {
    fetchExperiences()
  }, [user])

  const fetchExperiences = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      const data = await experienceService.getByDeveloperId(user.id)
      setExperiences(data || [])
    } catch (err) {
      console.error('Error fetching experiences:', err)
      setError('فشل في جلب الخبرات')
    } finally {
      setLoading(false)
    }
  }

  // نموذج خبرة جديدة
  const [newExperience, setNewExperience] = useState({
    job_title: '',
    company: '',
    location: '',
    location_type: 'on-site',
    employment_type: 'full-time',
    start_date: '',
    end_date: '',
    is_current: false,
    description: '',
    achievements: [],
    technologies: []
  })

  const [achievementInput, setAchievementInput] = useState('')
  const [techInput, setTechInput] = useState('')

  const handleAddExperience = async () => {
    // التحقق من حدود الباقة
    if (!checkLimit('experience', experiences.length)) {
      setError(`لقد وصلت للحد الأقصى (${limits.maxExperience} خبرة)`)
      return
    }

    if (!newExperience.job_title || !newExperience.company) {
      setError('المسمى الوظيفي واسم الشركة مطلوبان')
      return
    }

    setSaving(true)
    setError('')

    try {
      const experienceData = {
        ...newExperience,
        display_order: experiences.length
      }

      const created = await experienceService.create(user.id, experienceData)
      setExperiences([...experiences, created])
      
      // إعادة تعيين النموذج
      setNewExperience({
        job_title: '',
        company: '',
        location: '',
        location_type: 'on-site',
        employment_type: 'full-time',
        start_date: '',
        end_date: '',
        is_current: false,
        description: '',
        achievements: [],
        technologies: []
      })
      setAchievementInput('')
      setTechInput('')
    } catch (err) {
      console.error('Error adding experience:', err)
      setError('فشل في إضافة الخبرة')
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateExperience = async (id, updates) => {
    setSaving(true)
    try {
      const updated = await experienceService.update(id, updates)
      setExperiences(experiences.map(exp => exp.id === id ? updated : exp))
      setEditingId(null)
    } catch (err) {
      console.error('Error updating experience:', err)
      setError('فشل في تحديث الخبرة')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteExperience = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه الخبرة؟')) return

    try {
      await experienceService.delete(id)
      setExperiences(experiences.filter(exp => exp.id !== id))
    } catch (err) {
      console.error('Error deleting experience:', err)
      setError('فشل في حذف الخبرة')
    }
  }

  const handleMoveExperience = async (index, direction) => {
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= experiences.length) return

    const updatedExperiences = [...experiences]
    const temp = updatedExperiences[index]
    updatedExperiences[index] = updatedExperiences[newIndex]
    updatedExperiences[newIndex] = temp

    // تحديث ترتيب العرض
    updatedExperiences.forEach((exp, i) => {
      exp.display_order = i
    })

    setExperiences(updatedExperiences)

    // حفظ الترتيب الجديد في الخادم
    try {
      await Promise.all(
        updatedExperiences.map(exp => 
          experienceService.update(exp.id, { display_order: exp.display_order })
        )
      )
    } catch (err) {
      console.error('Error updating order:', err)
    }
  }

  const addAchievement = () => {
    if (achievementInput.trim() && !newExperience.achievements.includes(achievementInput.trim())) {
      setNewExperience({
        ...newExperience,
        achievements: [...newExperience.achievements, achievementInput.trim()]
      })
      setAchievementInput('')
    }
  }

  const removeAchievement = (achievement) => {
    setNewExperience({
      ...newExperience,
      achievements: newExperience.achievements.filter(a => a !== achievement)
    })
  }

  const addTechnology = () => {
    if (techInput.trim() && !newExperience.technologies.includes(techInput.trim())) {
      setNewExperience({
        ...newExperience,
        technologies: [...newExperience.technologies, techInput.trim()]
      })
      setTechInput('')
    }
  }

  const removeTechnology = (tech) => {
    setNewExperience({
      ...newExperience,
      technologies: newExperience.technologies.filter(t => t !== tech)
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030014] flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-[#6366f1] animate-spin mx-auto mb-4" />
          <p className="text-gray-400">جاري تحميل خبراتك...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">الخبرات العملية</h1>
        <div className="text-sm text-gray-400">
          {experiences.length} / {limits.maxExperience === -1 ? '∞' : limits.maxExperience}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Add new experience form - يظهر دائماً */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
        <h2 className="text-lg font-semibold text-white mb-4">إضافة خبرة جديدة</h2>
        
        <div className="space-y-4">
          {/* Job title and company */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">المسمى الوظيفي *</label>
              <input
                type="text"
                value={newExperience.job_title}
                onChange={(e) => setNewExperience({ ...newExperience, job_title: e.target.value })}
                className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white"
                placeholder="مثال: مطور واجهات أمامية أول"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">الشركة *</label>
              <input
                type="text"
                value={newExperience.company}
                onChange={(e) => setNewExperience({ ...newExperience, company: e.target.value })}
                className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white"
                placeholder="مثال: شركة جوجل"
              />
            </div>
          </div>

          {/* Location and type */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">الموقع</label>
              <input
                type="text"
                value={newExperience.location}
                onChange={(e) => setNewExperience({ ...newExperience, location: e.target.value })}
                className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white"
                placeholder="مثال: دبي، الإمارات"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">نوع الموقع</label>
              <select
                value={newExperience.location_type}
                onChange={(e) => setNewExperience({ ...newExperience, location_type: e.target.value })}
                className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white"
              >
                {LOCATION_TYPES.map(type => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">نوع العمل</label>
              <select
                value={newExperience.employment_type}
                onChange={(e) => setNewExperience({ ...newExperience, employment_type: e.target.value })}
                className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white"
              >
                {EMPLOYMENT_TYPES.map(type => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">تاريخ البداية</label>
              <input
                type="month"
                value={newExperience.start_date}
                onChange={(e) => setNewExperience({ ...newExperience, start_date: e.target.value })}
                className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">تاريخ النهاية</label>
              <div className="flex items-center gap-2">
                <input
                  type="month"
                  value={newExperience.end_date}
                  onChange={(e) => setNewExperience({ ...newExperience, end_date: e.target.value })}
                  disabled={newExperience.is_current}
                  className="flex-1 p-3 bg-white/10 border border-white/20 rounded-lg text-white disabled:opacity-50"
                />
                <label className="flex items-center gap-2 text-sm text-gray-400">
                  <input
                    type="checkbox"
                    checked={newExperience.is_current}
                    onChange={(e) => setNewExperience({ ...newExperience, is_current: e.target.checked })}
                    className="w-4 h-4 bg-white/10 border-white/20 rounded"
                  />
                  حتى الآن
                </label>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">الوصف</label>
            <textarea
              value={newExperience.description}
              onChange={(e) => setNewExperience({ ...newExperience, description: e.target.value })}
              rows="4"
              className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white"
              placeholder="صف مسؤولياتك وإنجازاتك..."
            />
          </div>

          {/* Achievements */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">الإنجازات الرئيسية</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={achievementInput}
                onChange={(e) => setAchievementInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addAchievement()}
                className="flex-1 p-3 bg-white/10 border border-white/20 rounded-lg text-white"
                placeholder="مثال: زيادة الأداء بنسبة 40%"
              />
              <button
                onClick={addAchievement}
                className="px-4 py-2 bg-[#6366f1] text-white rounded-lg hover:bg-[#a855f7] transition-colors"
              >
                إضافة
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {newExperience.achievements.map((achievement) => (
                <span
                  key={achievement}
                  className="flex items-center gap-1 px-3 py-1 bg-green-500/20 text-green-400 rounded-lg text-sm"
                >
                  {achievement}
                  <button onClick={() => removeAchievement(achievement)}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Technologies */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">التقنيات المستخدمة</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTechnology()}
                className="flex-1 p-3 bg-white/10 border border-white/20 rounded-lg text-white"
                placeholder="مثال: React"
              />
              <button
                onClick={addTechnology}
                className="px-4 py-2 bg-[#6366f1] text-white rounded-lg hover:bg-[#a855f7] transition-colors"
              >
                إضافة
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {newExperience.technologies.map((tech) => (
                <span
                  key={tech}
                  className="flex items-center gap-1 px-3 py-1 bg-[#6366f1]/20 text-[#6366f1] rounded-lg text-sm"
                >
                  {tech}
                  <button onClick={() => removeTechnology(tech)}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Submit button */}
          <button
            onClick={handleAddExperience}
            disabled={saving || !newExperience.job_title || !newExperience.company}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white rounded-xl font-semibold hover:scale-[1.02] transition-all disabled:opacity-50"
          >
            {saving ? <Loader className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
            إضافة خبرة
          </button>
        </div>
      </div>

      {/* Experiences list */}
      <div className="space-y-4">
        {experiences.length === 0 ? (
          <div className="text-center py-12">
            <Briefcase className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">لا توجد خبرات بعد</p>
            <p className="text-sm text-gray-500">أضف خبراتك العملية من النموذج أعلاه</p>
          </div>
        ) : (
          experiences.map((experience, index) => (
            <ExperienceCard
              key={experience.id}
              experience={experience}
              index={index}
              total={experiences.length}
              onEdit={() => setEditingId(experience.id)}
              onDelete={() => handleDeleteExperience(experience.id)}
              onMoveUp={() => handleMoveExperience(index, 'up')}
              onMoveDown={() => handleMoveExperience(index, 'down')}
              isEditing={editingId === experience.id}
              onUpdate={handleUpdateExperience}
            />
          ))
        )}
      </div>
    </div>
  )
}

// مكون بطاقة الخبرة (مع ترجمة)
const ExperienceCard = ({ 
  experience, 
  index, 
  total, 
  onEdit, 
  onDelete, 
  onMoveUp, 
  onMoveDown,
  isEditing,
  onUpdate 
}) => {
  const [editData, setEditData] = useState(experience)
  const [achievementInput, setAchievementInput] = useState('')
  const [techInput, setTechInput] = useState('')

  const addAchievement = () => {
    if (achievementInput.trim() && !editData.achievements.includes(achievementInput.trim())) {
      setEditData({
        ...editData,
        achievements: [...editData.achievements, achievementInput.trim()]
      })
      setAchievementInput('')
    }
  }

  const removeAchievement = (achievement) => {
    setEditData({
      ...editData,
      achievements: editData.achievements.filter(a => a !== achievement)
    })
  }

  const addTechnology = () => {
    if (techInput.trim() && !editData.technologies.includes(techInput.trim())) {
      setEditData({
        ...editData,
        technologies: [...editData.technologies, techInput.trim()]
      })
      setTechInput('')
    }
  }

  const removeTechnology = (tech) => {
    setEditData({
      ...editData,
      technologies: editData.technologies.filter(t => t !== tech)
    })
  }

  if (isEditing) {
    return (
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-[#6366f1]/50">
        <div className="space-y-4">
          {/* Job title and company */}
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              value={editData.job_title}
              onChange={(e) => setEditData({ ...editData, job_title: e.target.value })}
              className="p-3 bg-white/10 border border-white/20 rounded-lg text-white"
              placeholder="المسمى الوظيفي"
            />
            <input
              type="text"
              value={editData.company}
              onChange={(e) => setEditData({ ...editData, company: e.target.value })}
              className="p-3 bg-white/10 border border-white/20 rounded-lg text-white"
              placeholder="الشركة"
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <input
              type="month"
              value={editData.start_date}
              onChange={(e) => setEditData({ ...editData, start_date: e.target.value })}
              className="p-3 bg-white/10 border border-white/20 rounded-lg text-white"
            />
            <div className="flex items-center gap-2">
              <input
                type="month"
                value={editData.end_date}
                onChange={(e) => setEditData({ ...editData, end_date: e.target.value })}
                disabled={editData.is_current}
                className="flex-1 p-3 bg-white/10 border border-white/20 rounded-lg text-white disabled:opacity-50"
              />
              <label className="flex items-center gap-2 text-sm text-gray-400">
                <input
                  type="checkbox"
                  checked={editData.is_current}
                  onChange={(e) => setEditData({ ...editData, is_current: e.target.checked })}
                  className="w-4 h-4"
                />
                حتى الآن
              </label>
            </div>
          </div>

          {/* Description */}
          <textarea
            value={editData.description}
            onChange={(e) => setEditData({ ...editData, description: e.target.value })}
            rows="3"
            className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white"
            placeholder="الوصف"
          />

          {/* Achievements */}
          <div>
            <label className="text-sm text-gray-400">الإنجازات</label>
            <div className="flex gap-2 mt-2">
              <input
                value={achievementInput}
                onChange={(e) => setAchievementInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addAchievement()}
                className="flex-1 p-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm"
              />
              <button
                onClick={addAchievement}
                className="px-3 py-2 bg-[#6366f1] text-white rounded-lg text-sm"
              >
                إضافة
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {editData.achievements?.map((achievement) => (
                <span key={achievement} className="flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 rounded-lg text-xs">
                  {achievement}
                  <button onClick={() => removeAchievement(achievement)}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Technologies */}
          <div>
            <label className="text-sm text-gray-400">التقنيات</label>
            <div className="flex gap-2 mt-2">
              <input
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTechnology()}
                className="flex-1 p-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm"
              />
              <button
                onClick={addTechnology}
                className="px-3 py-2 bg-[#6366f1] text-white rounded-lg text-sm"
              >
                إضافة
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {editData.technologies?.map((tech) => (
                <span key={tech} className="flex items-center gap-1 px-2 py-1 bg-[#6366f1]/20 text-[#6366f1] rounded-lg text-xs">
                  {tech}
                  <button onClick={() => removeTechnology(tech)}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => onUpdate(experience.id, editData)}
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

  // حساب مدة الخبرة
  const calculateDuration = () => {
    const start = new Date(experience.start_date)
    const end = experience.is_current ? new Date() : new Date(experience.end_date)
    
    const years = end.getFullYear() - start.getFullYear()
    const months = end.getMonth() - start.getMonth()
    
    if (years === 0) return `${months} شهور`
    if (months === 0) return `${years} سنوات`
    if (months < 0) return `${years - 1} سنوات و ${12 + months} شهور`
    return `${years} سنوات و ${months} شهور`
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
        <h3 className="text-xl font-semibold text-white">{experience.job_title}</h3>
        <div className="flex flex-wrap items-center gap-4 mt-1 text-sm text-gray-400">
          <span className="flex items-center gap-1">
            <Building className="w-4 h-4" />
            {experience.company}
          </span>
          {experience.location && (
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {experience.location}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {new Date(experience.start_date).getFullYear()} - {experience.is_current ? 'حتى الآن' : new Date(experience.end_date).getFullYear()}
            <span className="text-xs text-gray-500 mr-1">({calculateDuration()})</span>
          </span>
        </div>
      </div>

      {/* Description */}
      {experience.description && (
        <p className="text-gray-300 text-sm mb-4 leading-relaxed">{experience.description}</p>
      )}

      {/* Achievements */}
      {experience.achievements?.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-400 mb-2">الإنجازات الرئيسية</h4>
          <ul className="space-y-1">
            {experience.achievements.map((achievement, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                <span className="text-green-400 mt-1">•</span>
                <span>{achievement}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Technologies */}
      {experience.technologies?.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {experience.technologies.map((tech) => (
            <span
              key={tech}
              className="px-2 py-1 bg-[#6366f1]/10 text-[#6366f1] rounded-lg text-xs"
            >
              {tech}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

export default Experience
