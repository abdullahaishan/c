import React, { useState } from 'react'
import { useDeveloper } from '../../context/DeveloperContext'
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
  const { developer, getSkills, refresh } = useDeveloper()
  const { checkLimit, limits } = usePlan()
  const [skills, setSkills] = useState(getSkills())
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // نموذج مهارة جديدة
  const [newSkill, setNewSkill] = useState({
    name: '',
    category: 'Frontend',
    proficiency: 75,
    icon: ''
  })

  const handleAddSkill = async () => {
    // التحقق من حدود الباقة
    if (!checkLimit('skills', skills.length)) {
      setError(`You've reached the maximum limit of ${limits.maxSkills} skills`)
      return
    }

    if (!newSkill.name) {
      setError('Skill name is required')
      return
    }

    setLoading(true)
    setError('')

    try {
      const skillData = {
        name: newSkill.name,
        category: newSkill.category,
        proficiency: newSkill.proficiency,
        icon: newSkill.icon || `${newSkill.name.toLowerCase()}.svg`,
        display_order: skills.length
      }

      const created = await skillService.create(developer.id, skillData)
      setSkills([...skills, created])
      
      // إعادة تعيين النموذج
      setNewSkill({
        name: '',
        category: 'Frontend',
        proficiency: 75,
        icon: ''
      })
    } catch (err) {
      console.error('Error adding skill:', err)
      setError('Failed to add skill')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateSkill = async (id, updates) => {
    setLoading(true)
    try {
      const updated = await skillService.update(id, updates)
      setSkills(skills.map(s => s.id === id ? updated : s))
      setEditingId(null)
    } catch (err) {
      console.error('Error updating skill:', err)
      setError('Failed to update skill')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteSkill = async (id) => {
    if (!window.confirm('Are you sure you want to delete this skill?')) return

    setLoading(true)
    try {
      await skillService.delete(id)
      setSkills(skills.filter(s => s.id !== id))
    } catch (err) {
      console.error('Error deleting skill:', err)
      setError('Failed to delete skill')
    } finally {
      setLoading(false)
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
    const category = skill.category || 'Other'
    if (!acc[category]) acc[category] = []
    acc[category].push(skill)
    return acc
  }, {})

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Skills</h1>
        <div className="text-sm text-gray-400">
          {skills.length} / {limits.maxSkills === -1 ? '∞' : limits.maxSkills}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Add new skill form */}
      {checkLimit('skills', skills.length) && (
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
          <h2 className="text-lg font-semibold text-white mb-4">Add New Skill</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Skill name */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Skill Name *</label>
              <input
                type="text"
                value={newSkill.name}
                onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white"
                placeholder="e.g., React"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Category</label>
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
              <label className="block text-sm text-gray-400 mb-2">Proficiency</label>
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
            disabled={loading || !newSkill.name}
            className="mt-4 flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white rounded-xl font-semibold hover:scale-[1.02] transition-all disabled:opacity-50"
          >
            {loading ? <Loader className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
            Add Skill
          </button>
        </div>
      )}

      {/* Skills by category */}
      <div className="space-y-6">
        {Object.entries(skillsByCategory).map(([category, categorySkills]) => (
          <div key={category} className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
            <h2 className="text-lg font-semibold text-white mb-4">{category}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categorySkills.map((skill, index) => (
                <SkillCard
                  key={skill.id}
                  skill={skill}
                  index={index}
                  total={categorySkills.length}
                  onEdit={() => setEditingId(skill.id)}
                  onDelete={() => handleDeleteSkill(skill.id)}
                  onMoveUp={() => handleMoveSkill(skills.indexOf(skill), 'up')}
                  onMoveDown={() => handleMoveSkill(skills.indexOf(skill), 'down')}
                  isEditing={editingId === skill.id}
                  onUpdate={handleUpdateSkill}
                />
              ))}
            </div>
          </div>
        ))}

        {skills.length === 0 && (
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No skills yet</p>
            <p className="text-sm text-gray-500">Add your skills to showcase your expertise</p>
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
  const gradient = SKILL_GRADIENTS[editData.category] || 'from-gray-500 to-slate-500'

  if (isEditing) {
    return (
      <div className="bg-white/5 rounded-xl p-4 border border-[#6366f1]/50">
        <div className="space-y-3">
          <input
            type="text"
            value={editData.name}
            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
            className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm"
          />
          <select
            value={editData.category}
            onChange={(e) => setEditData({ ...editData, category: e.target.value })}
            className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm"
          >
            {SKILL_CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <select
            value={editData.proficiency}
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
              Save
            </button>
            <button
              onClick={onEdit}
              className="px-3 py-2 bg-white/10 text-white rounded-lg text-sm hover:bg-white/20"
            >
              Cancel
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
            <span className="text-white text-xs font-bold">{skill.name[0]}</span>
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
          <span className="text-gray-400">Proficiency</span>
          <span className="text-white">{skill.proficiency}%</span>
        </div>
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r ${gradient} transition-all duration-300`}
            style={{ width: `${skill.proficiency}%` }}
          />
        </div>
      </div>
    </div>
  )
}

export default Skills