import React, { useState } from 'react'
import { useDeveloper } from '../../context/DeveloperContext'
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
  const { developer, getEducation, refresh } = useDeveloper()
  const { checkLimit, limits } = usePlan()
  const [educations, setEducations] = useState(getEducation())
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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

  const handleAddEducation = async () => {
    // التحقق من حدود الباقة
    if (!checkLimit('education', educations.length)) {
      setError(`You've reached the maximum limit of ${limits.maxEducation} education entries`)
      return
    }

    if (!newEducation.degree || !newEducation.institution) {
      setError('Degree and institution are required')
      return
    }

    setLoading(true)
    setError('')

    try {
      const educationData = {
        ...newEducation,
        display_order: educations.length
      }

      const created = await educationService.create(developer.id, educationData)
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
    } catch (err) {
      console.error('Error adding education:', err)
      setError('Failed to add education')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateEducation = async (id, updates) => {
    setLoading(true)
    try {
      const updated = await educationService.update(id, updates)
      setEducations(educations.map(edu => edu.id === id ? updated : edu))
      setEditingId(null)
    } catch (err) {
      console.error('Error updating education:', err)
      setError('Failed to update education')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteEducation = async (id) => {
    if (!window.confirm('Are you sure you want to delete this education entry?')) return

    setLoading(true)
    try {
      await educationService.delete(id)
      setEducations(educations.filter(edu => edu.id !== id))
    } catch (err) {
      console.error('Error deleting education:', err)
      setError('Failed to delete education')
    } finally {
      setLoading(false)
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Education</h1>
        <div className="text-sm text-gray-400">
          {educations.length} / {limits.maxEducation === -1 ? '∞' : limits.maxEducation}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Add new education form */}
      {checkLimit('education', educations.length) && (
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
          <h2 className="text-lg font-semibold text-white mb-4">Add New Education</h2>
          
          <div className="space-y-4">
            {/* Degree and field */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Degree *</label>
                <select
                  value={newEducation.degree}
                  onChange={(e) => setNewEducation({ ...newEducation, degree: e.target.value })}
                  className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white"
                >
                  <option value="">Select degree</option>
                  {DEGREE_TYPES.map(degree => (
                    <option key={degree} value={degree}>{degree}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Field of Study</label>
                <input
                  type="text"
                  value={newEducation.field_of_study}
                  onChange={(e) => setNewEducation({ ...newEducation, field_of_study: e.target.value })}
                  className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white"
                  placeholder="e.g., Computer Science"
                />
              </div>
            </div>

            {/* Institution and location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Institution *</label>
                <input
                  type="text"
                  value={newEducation.institution}
                  onChange={(e) => setNewEducation({ ...newEducation, institution: e.target.value })}
                  className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white"
                  placeholder="e.g., Cairo University"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Location</label>
                <input
                  type="text"
                  value={newEducation.location}
                  onChange={(e) => setNewEducation({ ...newEducation, location: e.target.value })}
                  className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white"
                  placeholder="e.g., Cairo, Egypt"
                />
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Start Date</label>
                <input
                  type="month"
                  value={newEducation.start_date}
                  onChange={(e) => setNewEducation({ ...newEducation, start_date: e.target.value })}
                  className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">End Date</label>
                <div className="flex items-center gap-2">
                  <input
                    type="month"
                    value={newEducation.end_date}
                    onChange={(e) => setNewEducation({ ...newEducation, end_date: e.target.value })}
                    disabled={newEducation.is_current}
                    className="flex-1 p-3 bg-white/10 border border-white/20 rounded-lg text-white disabled:opacity-50"
                  />
                  <label className="flex items-center gap-2 text-sm text-gray-400">
                    <input
                      type="checkbox"
                      checked={newEducation.is_current}
                      onChange={(e) => setNewEducation({ ...newEducation, is_current: e.target.checked })}
                      className="w-4 h-4 bg-white/10 border-white/20 rounded"
                    />
                    Current
                  </label>
                </div>
              </div>
            </div>

            {/* Grade */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Grade / GPA</label>
              <input
                type="text"
                value={newEducation.grade}
                onChange={(e) => setNewEducation({ ...newEducation, grade: e.target.value })}
                className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white"
                placeholder="e.g., 3.8/4.0"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Description</label>
              <textarea
                value={newEducation.description}
                onChange={(e) => setNewEducation({ ...newEducation, description: e.target.value })}
                rows="3"
                className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white"
                placeholder="Describe your studies, thesis, etc..."
              />
            </div>

            {/* Activities */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Activities & Societies</label>
              <textarea
                value={newEducation.activities}
                onChange={(e) => setNewEducation({ ...newEducation, activities: e.target.value })}
                rows="3"
                className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white"
                placeholder="List your extracurricular activities..."
              />
            </div>

            {/* Submit button */}
            <button
              onClick={handleAddEducation}
              disabled={loading || !newEducation.degree || !newEducation.institution}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white rounded-xl font-semibold hover:scale-[1.02] transition-all disabled:opacity-50"
            >
              {loading ? <Loader className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
              Add Education
            </button>
          </div>
        </div>
      )}

      {/* Education list */}
      <div className="space-y-4">
        {educations.map((education, index) => (
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
          />
        ))}

        {educations.length === 0 && (
          <div className="text-center py-12">
            <GraduationCap className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No education yet</p>
            <p className="text-sm text-gray-500">Add your educational background</p>
          </div>
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
  onUpdate 
}) => {
  const [editData, setEditData] = useState(education)

  if (isEditing) {
    return (
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-[#6366f1]/50">
        <div className="space-y-4">
          {/* Degree and field */}
          <div className="grid grid-cols-2 gap-4">
            <select
              value={editData.degree}
              onChange={(e) => setEditData({ ...editData, degree: e.target.value })}
              className="p-3 bg-white/10 border border-white/20 rounded-lg text-white"
            >
              {DEGREE_TYPES.map(degree => (
                <option key={degree} value={degree}>{degree}</option>
              ))}
            </select>
            <input
              type="text"
              value={editData.field_of_study}
              onChange={(e) => setEditData({ ...editData, field_of_study: e.target.value })}
              className="p-3 bg-white/10 border border-white/20 rounded-lg text-white"
              placeholder="Field of Study"
            />
          </div>

          {/* Institution */}
          <input
            type="text"
            value={editData.institution}
            onChange={(e) => setEditData({ ...editData, institution: e.target.value })}
            className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white"
            placeholder="Institution"
          />

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
                Current
              </label>
            </div>
          </div>

          {/* Grade */}
          <input
            type="text"
            value={editData.grade}
            onChange={(e) => setEditData({ ...editData, grade: e.target.value })}
            className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white"
            placeholder="Grade"
          />

          {/* Description */}
          <textarea
            value={editData.description}
            onChange={(e) => setEditData({ ...editData, description: e.target.value })}
            rows="2"
            className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white"
            placeholder="Description"
          />

          {/* Activities */}
          <textarea
            value={editData.activities}
            onChange={(e) => setEditData({ ...editData, activities: e.target.value })}
            rows="2"
            className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white"
            placeholder="Activities"
          />

          {/* Action buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => onUpdate(education.id, editData)}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              <Save className="w-4 h-4" />
              Save
            </button>
            <button
              onClick={onEdit}
              className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="group relative bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all">
      {/* Move buttons */}
      <div className="absolute right-4 top-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
        <div className="flex items-center gap-4 mt-1 text-sm text-gray-400">
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
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1 text-gray-400">
              <Calendar className="w-4 h-4" />
              {new Date(education.start_date).getFullYear()} - {education.is_current ? 'Present' : new Date(education.end_date).getFullYear()}
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
          <p className="text-gray-300 text-sm">{education.description}</p>
        )}

        {/* Activities */}
        {education.activities && (
          <div>
            <h4 className="text-sm font-medium text-gray-400 mb-1">Activities</h4>
            <p className="text-gray-300 text-sm">{education.activities}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Education