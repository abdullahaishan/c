import React, { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { usePlan } from '../../hooks/usePlan'
import { skillService } from '../../lib/supabase'
import { SKILL_CATEGORIES, PROFICIENCY_LEVELS, SKILL_GRADIENTS } from '../../utils/constants'
import {
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Loader,
  AlertCircle,
  ChevronUp,
  ChevronDown
} from 'lucide-react'

const Skills = () => {
  const { user } = useAuth()
  const { checkLimit, limits } = usePlan()
  const [skills, setSkills] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [editingId, setEditingId] = useState(null)

  // نموذج مهارة جديدة
  const [newSkill, setNewSkill] = useState({
    name: '',
    category: 'Frontend',
    proficiency: 75,
    icon: ''
  })

  // جلب المهارات عند تحميل الصفحة
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
      console.error('Error fetching skills:', err)
      setError('فشل في جلب المهارات')
    } finally {
      setLoading(false)
    }
  }

  const handleAddSkill = async () => {
    // التحقق من حدود الباقة
    if (!checkLimit('skills', skills.length)) {
      setError(`لقد وصلت للحد الأقصى (${limits.maxSkills} مهارة)`)
      return
    }

    if (!newSkill.name) {
      setError('اسم المهارة مطلوب')
      return
    }

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const skillData = {
        name: newSkill.name,
        category: newSkill.category,
        proficiency: newSkill.proficiency,
        icon: newSkill.icon || `${newSkill.name.toLowerCase().replace(/\s+/g, '-')}.svg`,
        display_order: skills.length,
        developer_id: user.id  // ✅ مهم: ربط المهارة بالمطور
      }

      const created = await skillService.create(user.id, skillData)
      setSkills([...skills, created])
      
      // إعادة تعيين النموذج
      setNewSkill({
        name: '',
        category: 'Frontend',
        proficiency: 75,
        icon: ''
      })
      
      setSuccess('✅ تم إضافة المهارة بنجاح')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      console.error('Error adding skill:', err)
      setError(err.message || 'فشل في إضافة المهارة')
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateSkill = async (id, updates) => {
    setSaving(true)
    setError('')
    setSuccess('')
    
    try {
      const updated = await skillService.update(id, updates)
      setSkills(skills.map(s => s.id === id ? updated : s))
      setEditingId(null)
      setSuccess('✅ تم تحديث المهارة بنجاح')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      console.error('Error updating skill:', err)
      setError(err.message || 'فشل في تحديث المهارة')
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
      console.error('Error deleting skill:', err)
      setError(err.message || 'فشل في حذف المهارة')
    }
  }

  const handleMoveSkill = async (index, direction) => {
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= skills.length) return

    const updatedSkills = [...skills]
    const temp = updatedSkills[index]
    updatedSkills[index] = updatedSkills[newIndex]
    updatedSkills[newIndex] = temp

    // تحديث ترتيب العرض
    updatedSkills.forEach((s, i) => {
      s.display_order = i
    })

    setSkills(updatedSkills)

    // حفظ الترتيب الجديد في الخادم
    try {
      await Promise.all(
        updatedSkills.map(s => 
          skillService.update(s.id, { display_order: s.display_order })
        )
      )
    } catch (err) {
      console.error('Error updating order:', err)
    }
  }

  // تجميع المهارات حسب الفئة
  const skillsByCategory = skills.reduce((acc, skill) => {
    const category = skill.category || 'أخرى'
    if (!acc[category]) acc[category] = []
    acc[category].push(skill)
    return acc
  }, {})

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030014] flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-[#6366f1] animate-spin mx-auto mb-4" />
          <p className="text-gray-400">جاري تحميل مهاراتك...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">المهارات</h1>
        <div className="text-sm text-gray-400">
          {skills.length} / {limits?.maxSkills === -1 ? '∞' : limits?.maxSkills || 10}
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

      {/* Add new skill form */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
        <h2 className="text-lg font-semibold text-white mb-4">إضافة مهارة جديدة</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Skill name */}
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

          {/* Category */}
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

          {/* Proficiency */}
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
        </div>

        {/* Submit button */}
        <button
          onClick={handleAddSkill}
          disabled={saving || !newSkill.name}
          className="mt-4 flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white rounded-xl font-semibold hover:scale-[1.02] transition-all disabled:opacity-50"
        >
          {saving ? <Loader className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
          إضافة مهارة
        </button>
      </div>

      {/* Skills by category */}
      <div className="space-y-6">
        {Object.keys(skillsByCategory).length > 0 ? (
          Object.entries(skillsByCategory).map(([category, categorySkills]) => (
            <div key={category} className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
              <h2 className="text-lg font-semibold text-white mb-4">{category}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categorySkills.map((skill, index) => {
                  // البحث عن المؤشر الحقيقي في المصفوفة الكاملة
                  const globalIndex = skills.findIndex(s => s.id === skill.id)
                  return (
                    <SkillCard
                      key={skill.id}
                      skill={skill}
                      index={globalIndex}
                      total={skills.length}
                      onEdit={() => setEditingId(skill.id)}
                      onDelete={() => handleDeleteSkill(skill.id)}
                      onMoveUp={() => handleMoveSkill(globalIndex, 'up')}
                      onMoveDown={() => handleMoveSkill(globalIndex, 'down')}
                      isEditing={editingId === skill.id}
                      onUpdate={handleUpdateSkill}
                    />
                  )
                })}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">لا توجد مهارات بعد</p>
            <p className="text-sm text-gray-500">أضف مهاراتك من النموذج أعلاه</p>
          </div>
        )}
      </div>
    </div>
  )
}

// مكون بطاقة المهارة
const SkillCard = ({ 
  skill, 
  index, 
  total, 
  onEdit, 
  onDelete, 
  onMoveUp, 
  onMoveDown,
  isEditing,
  onUpdate 
}) => {
  const [editData, setEditData] = useState(skill)
  const gradient = SKILL_GRADIENTS?.[editData.category] || 'from-gray-500 to-slate-500'

  if (isEditing) {
    return (
      <div className="bg-white/5 rounded-xl p-4 border border-[#6366f1]/50">
        <div className="space-y-3">
          <input
            type="text"
            value={editData.name || ''}
            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
            className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm"
            placeholder="اسم المهارة"
          />
          <select
            value={editData.category || 'Frontend'}
            onChange={(e) => setEditData({ ...editData, category: e.target.value })}
            className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm"
          >
            {SKILL_CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <select
            value={editData.proficiency || 75}
            onChange={(e) => setEditData({ ...editData, proficiency: Number(e.target.value) })}
            className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm"
          >
            {PROFICIENCY_LEVELS.map(level => (
              <option key={level.value} value={level.value}>{level.label}</option>
            ))}
          </select>
          <div className="flex gap-2">
            <button
              onClick={() => onUpdate(skill.id, editData)}
              className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600"
            >
              <Save className="w-4 h-4" />
              حفظ
            </button>
            <button
              onClick={onEdit}
              className="px-3 py-2 bg-white/10 text-white rounded-lg text-sm hover:bg-white/20"
            >
              إلغاء
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative group bg-white/5 rounded-xl p-4 border border-white/10 hover:border-white/20 transition-all">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${gradient} flex items-center justify-center`}>
            <span className="text-white text-xs font-bold">
              {skill.name?.[0]?.toUpperCase() || '?'}
            </span>
          </div>
          <h3 className="font-medium text-white">{skill.name}</h3>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {/* Move buttons */}
          <div className="flex flex-col">
            {index > 0 && (
              <button onClick={onMoveUp} className="p-1 text-gray-400 hover:text-white">
                <ChevronUp className="w-3 h-3" />
              </button>
            )}
            {index < total - 1 && (
              <button onClick={onMoveDown} className="p-1 text-gray-400 hover:text-white">
                <ChevronDown className="w-3 h-3" />
              </button>
            )}
          </div>
          <button onClick={onEdit} className="p-1 text-gray-400 hover:text-white">
            <Edit className="w-4 h-4" />
          </button>
          <button onClick={onDelete} className="p-1 text-gray-400 hover:text-red-400">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Proficiency bar */}
      <div className="mt-3">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-gray-400">نسبة الإتقان</span>
          <span className="text-white">{skill.proficiency || 0}%</span>
        </div>
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r ${gradient} transition-all duration-300`}
            style={{ width: `${skill.proficiency || 0}%` }}
          />
        </div>
      </div>
    </div>
  )
}

export default Skills
