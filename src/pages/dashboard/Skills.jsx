import React, { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { usePlan } from '../../hooks/usePlan'
import { skillService } from '../../lib/supabase'
import { supabase } from '../../lib/supabase'
import { SKILL_CATEGORIES, PROFICIENCY_LEVELS } from '../../utils/constants'
import {
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Loader,
  AlertCircle,
  Star,
  Palette,
  Briefcase,
  FileText,
  Users
} from 'lucide-react'

const Skills = () => {
  const { user } = useAuth()
  const { limits, checkLimit } = usePlan()
  const [skills, setSkills] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [editingId, setEditingId] = useState(null)

  // ألوان المهارات المتاحة
  const colorOptions = [
    { value: 'from-blue-500 to-cyan-500', label: 'أزرق', bg: 'bg-blue-500' },
    { value: 'from-purple-500 to-pink-500', label: 'بنفسجي', bg: 'bg-purple-500' },
    { value: 'from-green-500 to-emerald-500', label: 'أخضر', bg: 'bg-green-500' },
    { value: 'from-yellow-500 to-orange-500', label: 'أصفر', bg: 'bg-yellow-500' },
    { value: 'from-red-500 to-rose-500', label: 'أحمر', bg: 'bg-red-500' },
    { value: 'from-indigo-500 to-purple-500', label: 'نيلي', bg: 'bg-indigo-500' },
  ]

  // نموذج مهارة جديدة
  const [newSkill, setNewSkill] = useState({
    name: '',
    category: 'Frontend',
    proficiency: 75,
    icon: '',
    description: '',
    years_of_experience: 0,
    is_main: false,
    color: 'from-blue-500 to-cyan-500'
  })

  useEffect(() => {
    fetchSkills()
  }, [user])

  const fetchSkills = async () => {
    if (!user) return
    setLoading(true)
    try {
      const data = await skillService.getByDeveloperId(user.id)
      setSkills(data || [])
    } catch (err) {
      setError('فشل في جلب المهارات')
    } finally {
      setLoading(false)
    }
  }

  const handleAddSkill = async () => {
    if (!checkLimit('skills', skills.length)) {
      setError(`لقد وصلت للحد الأقصى (${limits.maxSkills} مهارة)`)
      return
    }

    if (!newSkill.name) {
      setError('اسم المهارة مطلوب')
      return
    }

    setSaving(true)
    try {
      const created = await skillService.create(user.id, {
        ...newSkill,
        display_order: skills.length,
        developer_id: user.id
      })
      setSkills([...skills, created])
      setNewSkill({
        name: '',
        category: 'Frontend',
        proficiency: 75,
        icon: '',
        description: '',
        years_of_experience: 0,
        is_main: false,
        color: 'from-blue-500 to-cyan-500'
      })
      setSuccess('✅ تم إضافة المهارة بنجاح')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateSkill = async (id, updates) => {
    setSaving(true)
    try {
      const updated = await skillService.update(id, updates)
      setSkills(skills.map(s => s.id === id ? updated : s))
      setEditingId(null)
      setSuccess('✅ تم تحديث المهارة بنجاح')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteSkill = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه المهارة؟')) return
    try {
      await skillService.delete(id)
      setSkills(skills.filter(s => s.id !== id))
      setSuccess('✅ تم حذف المهارة بنجاح')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.message)
    }
  }

  const toggleMainSkill = async (id, currentValue) => {
    try {
      await skillService.update(id, { is_main: !currentValue })
      setSkills(skills.map(s => 
        s.id === id ? { ...s, is_main: !currentValue } : s
      ))
    } catch (err) {
      setError('فشل في تحديث حالة المهارة')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030014] flex items-center justify-center">
        <Loader className="w-12 h-12 text-[#6366f1] animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">المهارات</h1>
        <div className="text-sm text-gray-400">
          {skills.length} / {limits?.maxSkills || 10}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
          <AlertCircle className="w-5 h-5" />
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400">
          <AlertCircle className="w-5 h-5" />
          <p>{success}</p>
        </div>
      )}

      {/* نموذج إضافة مهارة جديدة */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
        <h2 className="text-lg font-semibold text-white mb-4">إضافة مهارة جديدة</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* اسم المهارة */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">اسم المهارة *</label>
            <input
              type="text"
              value={newSkill.name}
              onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
              className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white"
              placeholder="مثال: React"
            />
          </div>

          {/* التصنيف */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">التصنيف</label>
            <select
              value={newSkill.category}
              onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value })}
              className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white"
            >
              {SKILL_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* نسبة الإتقان */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">نسبة الإتقان</label>
            <select
              value={newSkill.proficiency}
              onChange={(e) => setNewSkill({ ...newSkill, proficiency: Number(e.target.value) })}
              className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white"
            >
              {PROFICIENCY_LEVELS.map(level => (
                <option key={level.value} value={level.value}>{level.label}</option>
              ))}
            </select>
          </div>

          {/* سنوات الخبرة */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">سنوات الخبرة</label>
            <input
              type="number"
              min="0"
              max="50"
              value={newSkill.years_of_experience}
              onChange={(e) => setNewSkill({ ...newSkill, years_of_experience: parseInt(e.target.value) })}
              className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white"
            />
          </div>

          {/* لون المهارة */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">اللون</label>
            <select
              value={newSkill.color}
              onChange={(e) => setNewSkill({ ...newSkill, color: e.target.value })}
              className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white"
            >
              {colorOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            {/* معاينة اللون */}
            <div className={`mt-2 h-2 rounded-full bg-gradient-to-r ${newSkill.color}`} />
          </div>

          {/* مهارة رئيسية */}
          <div className="flex items-center gap-2 mt-8">
            <input
              type="checkbox"
              id="is_main"
              checked={newSkill.is_main}
              onChange={(e) => setNewSkill({ ...newSkill, is_main: e.target.checked })}
              className="w-5 h-5 bg-white/10 border-white/20 rounded"
            />
            <label htmlFor="is_main" className="text-sm text-gray-400 flex items-center gap-1">
              <Star className="w-4 h-4" />
              مهارة رئيسية (تظهر في النص المتحرك)
            </label>
          </div>
        </div>

        {/* وصف المهارة */}
        <div className="mt-4">
          <label className="block text-sm text-gray-400 mb-2 flex items-center gap-1">
            <FileText className="w-4 h-4" />
            وصف المهارة (اختياري)
          </label>
          <textarea
            value={newSkill.description}
            onChange={(e) => setNewSkill({ ...newSkill, description: e.target.value })}
            rows="3"
            className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white"
            placeholder="أضف وصفاً لهذه المهارة..."
          />
        </div>

        <button
          onClick={handleAddSkill}
          disabled={saving || !newSkill.name}
          className="mt-4 flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white rounded-xl font-semibold hover:scale-[1.02] transition-all disabled:opacity-50"
        >
          {saving ? <Loader className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
          إضافة مهارة
        </button>
      </div>

      {/* عرض المهارات */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {skills.map((skill) => (
          <div
            key={skill.id}
            className={`bg-white/5 rounded-xl p-4 border ${
              skill.is_main ? 'border-yellow-500/50' : 'border-white/10'
            } hover:border-[#6366f1]/50 transition-all group`}
          >
            {/* رأس البطاقة */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {/* أيقونة المهارة (يمكن إضافتها لاحقاً) */}
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${skill.color} flex items-center justify-center`}>
                  <span className="text-white font-bold text-lg">
                    {skill.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <h3 className="text-white font-semibold flex items-center gap-2">
                    {skill.name}
                    {skill.is_main && (
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    )}
                  </h3>
                  <p className="text-xs text-gray-400">{skill.category}</p>
                </div>
              </div>
              
              {/* أزرار التحكم */}
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => toggleMainSkill(skill.id, skill.is_main)}
                  className="p-1.5 text-gray-400 hover:text-yellow-400 rounded-lg hover:bg-white/5"
                  title={skill.is_main ? 'إزالة من الرئيسية' : 'جعله مهارة رئيسية'}
                >
                  <Star className={`w-4 h-4 ${skill.is_main ? 'fill-yellow-400' : ''}`} />
                </button>
                <button
                  onClick={() => setEditingId(skill.id)}
                  className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/5"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteSkill(skill.id)}
                  className="p-1.5 text-gray-400 hover:text-red-400 rounded-lg hover:bg-white/5"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* وصف المهارة */}
            {skill.description && (
              <p className="text-sm text-gray-300 mb-3 line-clamp-2">
                {skill.description}
              </p>
            )}

            {/* سنوات الخبرة */}
            {skill.years_of_experience > 0 && (
              <div className="flex items-center gap-2 mb-3 text-sm">
                <Briefcase className="w-4 h-4 text-gray-400" />
                <span className="text-gray-400">
                  {skill.years_of_experience} سنة خبرة
                </span>
              </div>
            )}

            {/* شريط التقدم */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">نسبة الإتقان</span>
                <span className="text-white font-medium">{skill.proficiency}%</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${skill.color} transition-all duration-300`}
                  style={{ width: `${skill.proficiency}%` }}
                />
              </div>
            </div>
          </div>
        ))}

        {skills.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-400">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>لا توجد مهارات بعد</p>
            <p className="text-sm">أضف مهاراتك من النموذج أعلاه</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Skills
