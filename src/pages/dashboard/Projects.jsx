import React, { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { projectService, storageService } from '../../lib/supabase'
import {
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Eye,
  Github,
  ExternalLink,
  Upload,
  Loader,
  AlertCircle,
  ChevronUp,
  ChevronDown,
  FolderKanban
} from 'lucide-react'

const Projects = () => {
  const { user } = useAuth()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState(null)

  // نموذج مشروع جديد
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    technologies: [],
    github_url: '',
    live_url: '',
    features: [],
    image: null
  })

  const [techInput, setTechInput] = useState('')
  const [featureInput, setFeatureInput] = useState('')

  // جلب المشاريع عند تحميل الصفحة
  useEffect(() => {
    fetchProjects()
  }, [user])

  const fetchProjects = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      const data = await projectService.getByDeveloperId(user.id)
      setProjects(data || [])
    } catch (err) {
      console.error('Error fetching projects:', err)
      setError('فشل في جلب المشاريع')
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (file) => {
    if (!file) return null
    
    setUploading(true)
    try {
      const imageUrl = await storageService.uploadImage(
        file,
        `projects/${user.id}`
      )
      return imageUrl
    } catch (err) {
      console.error('Error uploading image:', err)
      setError('فشل في رفع الصورة')
      return null
    } finally {
      setUploading(false)
    }
  }

  const handleAddProject = async () => {
    if (!newProject.title || !newProject.description) {
      setError('عنوان المشروع والوصف مطلوبان')
      return
    }

    setSaving(true)
    setError('')

    try {
      let imageUrl = null
      if (newProject.image) {
        imageUrl = await handleImageUpload(newProject.image)
      }

      const projectData = {
        title: newProject.title,
        description: newProject.description,
        technologies: newProject.technologies,
        github_url: newProject.github_url,
        live_url: newProject.live_url,
        features: newProject.features,
        image: imageUrl,
        display_order: projects.length
      }

      const created = await projectService.create(user.id, projectData)
      setProjects([...projects, created])
      
      // إعادة تعيين النموذج
      setNewProject({
        title: '',
        description: '',
        technologies: [],
        github_url: '',
        live_url: '',
        features: [],
        image: null
      })
      setTechInput('')
      setFeatureInput('')
    } catch (err) {
      console.error('Error adding project:', err)
      setError('فشل في إضافة المشروع')
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateProject = async (id, updates) => {
    setSaving(true)
    try {
      const updated = await projectService.update(id, updates)
      setProjects(projects.map(p => p.id === id ? updated : p))
      setEditingId(null)
    } catch (err) {
      console.error('Error updating project:', err)
      setError('فشل في تحديث المشروع')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteProject = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المشروع؟')) return

    try {
      await projectService.delete(id)
      setProjects(projects.filter(p => p.id !== id))
    } catch (err) {
      console.error('Error deleting project:', err)
      setError('فشل في حذف المشروع')
    }
  }

  const handleMoveProject = async (index, direction) => {
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= projects.length) return

    const updatedProjects = [...projects]
    const temp = updatedProjects[index]
    updatedProjects[index] = updatedProjects[newIndex]
    updatedProjects[newIndex] = temp

    // تحديث ترتيب العرض
    updatedProjects.forEach((p, i) => {
      p.display_order = i
    })

    setProjects(updatedProjects)

    // حفظ الترتيب الجديد في الخادم
    try {
      await Promise.all(
        updatedProjects.map(p => 
          projectService.update(p.id, { display_order: p.display_order })
        )
      )
    } catch (err) {
      console.error('Error updating order:', err)
    }
  }

  const addTechnology = () => {
    if (techInput.trim() && !newProject.technologies.includes(techInput.trim())) {
      setNewProject({
        ...newProject,
        technologies: [...newProject.technologies, techInput.trim()]
      })
      setTechInput('')
    }
  }

  const removeTechnology = (tech) => {
    setNewProject({
      ...newProject,
      technologies: newProject.technologies.filter(t => t !== tech)
    })
  }

  const addFeature = () => {
    if (featureInput.trim() && !newProject.features.includes(featureInput.trim())) {
      setNewProject({
        ...newProject,
        features: [...newProject.features, featureInput.trim()]
      })
      setFeatureInput('')
    }
  }

  const removeFeature = (feature) => {
    setNewProject({
      ...newProject,
      features: newProject.features.filter(f => f !== feature)
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030014] flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-[#6366f1] animate-spin mx-auto mb-4" />
          <p className="text-gray-400">جاري تحميل مشاريعك...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">المشاريع</h1>
        <div className="text-sm text-gray-400">
          {projects.length} مشروع
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Add new project form - يظهر دائماً */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
        <h2 className="text-lg font-semibold text-white mb-4">إضافة مشروع جديد</h2>
        
        <div className="space-y-4">
          {/* Image upload */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">صورة المشروع</label>
            <div className="flex items-center gap-4">
              {newProject.image ? (
                <div className="relative">
                  <img
                    src={URL.createObjectURL(newProject.image)}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => setNewProject({ ...newProject, image: null })}
                    className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg cursor-pointer hover:bg-white/10">
                  <Upload className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-300">رفع صورة</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setNewProject({ ...newProject, image: e.target.files[0] })}
                    className="hidden"
                  />
                </label>
              )}
              {uploading && <Loader className="w-5 h-5 text-[#6366f1] animate-spin" />}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">عنوان المشروع *</label>
            <input
              type="text"
              value={newProject.title}
              onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
              className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white"
              placeholder="مثال: متجر إلكتروني متكامل"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">الوصف *</label>
            <textarea
              value={newProject.description}
              onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
              rows="4"
              className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white"
              placeholder="صف مشروعك..."
            />
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
              {newProject.technologies.map((tech) => (
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

          {/* Features */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">الميزات الرئيسية</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={featureInput}
                onChange={(e) => setFeatureInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addFeature()}
                className="flex-1 p-3 bg-white/10 border border-white/20 rounded-lg text-white"
                placeholder="مثال: تسجيل دخول آمن"
              />
              <button
                onClick={addFeature}
                className="px-4 py-2 bg-[#6366f1] text-white rounded-lg hover:bg-[#a855f7] transition-colors"
              >
                إضافة
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {newProject.features.map((feature) => (
                <span
                  key={feature}
                  className="flex items-center gap-1 px-3 py-1 bg-purple-500/20 text-purple-400 rounded-lg text-sm"
                >
                  {feature}
                  <button onClick={() => removeFeature(feature)}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* URLs */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">رابط GitHub</label>
              <input
                type="url"
                value={newProject.github_url}
                onChange={(e) => setNewProject({ ...newProject, github_url: e.target.value })}
                className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white"
                placeholder="https://github.com/..."
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">رابط المشروع</label>
              <input
                type="url"
                value={newProject.live_url}
                onChange={(e) => setNewProject({ ...newProject, live_url: e.target.value })}
                className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white"
                placeholder="https://example.com"
              />
            </div>
          </div>

          {/* Submit button */}
          <button
            onClick={handleAddProject}
            disabled={saving || !newProject.title || !newProject.description}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white rounded-xl font-semibold hover:scale-[1.02] transition-all disabled:opacity-50"
          >
            {saving ? <Loader className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
            إضافة مشروع
          </button>
        </div>
      </div>

      {/* Projects list */}
      <div className="space-y-4">
        {projects.length === 0 ? (
          <div className="text-center py-12">
            <FolderKanban className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">لا توجد مشاريع بعد</p>
            <p className="text-sm text-gray-500">أضف مشروعك الأول من النموذج أعلاه</p>
          </div>
        ) : (
          projects.map((project, index) => (
            <ProjectCard
              key={project.id}
              project={project}
              index={index}
              total={projects.length}
              onEdit={() => setEditingId(project.id)}
              onDelete={() => handleDeleteProject(project.id)}
              onMoveUp={() => handleMoveProject(index, 'up')}
              onMoveDown={() => handleMoveProject(index, 'down')}
              isEditing={editingId === project.id}
              onUpdate={handleUpdateProject}
            />
          ))
        )}
      </div>
    </div>
  )
}

// مكون بطاقة المشروع
const ProjectCard = ({ 
  project, 
  index, 
  total, 
  onEdit, 
  onDelete, 
  onMoveUp, 
  onMoveDown,
  isEditing,
  onUpdate 
}) => {
  const [editData, setEditData] = useState(project)
  const [techInput, setTechInput] = useState('')
  const [featureInput, setFeatureInput] = useState('')

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

  const addFeature = () => {
    if (featureInput.trim() && !editData.features.includes(featureInput.trim())) {
      setEditData({
        ...editData,
        features: [...editData.features, featureInput.trim()]
      })
      setFeatureInput('')
    }
  }

  const removeFeature = (feature) => {
    setEditData({
      ...editData,
      features: editData.features.filter(f => f !== feature)
    })
  }

  if (isEditing) {
    return (
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-[#6366f1]/50">
        <div className="space-y-4">
          <input
            type="text"
            value={editData.title}
            onChange={(e) => setEditData({ ...editData, title: e.target.value })}
            className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white"
            placeholder="عنوان المشروع"
          />
          <textarea
            value={editData.description}
            onChange={(e) => setEditData({ ...editData, description: e.target.value })}
            rows="3"
            className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white"
            placeholder="وصف المشروع"
          />
          
          {/* Technologies */}
          <div>
            <label className="text-sm text-gray-400">التقنيات</label>
            <div className="flex gap-2 mt-2">
              <input
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTechnology()}
                className="flex-1 p-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm"
                placeholder="أضف تقنية"
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

          {/* URLs */}
          <div className="grid grid-cols-2 gap-4">
            <input
              type="url"
              value={editData.github_url}
              onChange={(e) => setEditData({ ...editData, github_url: e.target.value })}
              className="p-3 bg-white/10 border border-white/20 rounded-lg text-white"
              placeholder="رابط GitHub"
            />
            <input
              type="url"
              value={editData.live_url}
              onChange={(e) => setEditData({ ...editData, live_url: e.target.value })}
              className="p-3 bg-white/10 border border-white/20 rounded-lg text-white"
              placeholder="رابط المشروع"
            />
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => onUpdate(project.id, editData)}
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
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all group">
      <div className="flex gap-6">
        {/* Project image */}
        {project.image && (
          <div className="w-32 h-32 rounded-lg overflow-hidden flex-shrink-0">
            <img
              src={project.image}
              alt={project.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Project info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-xl font-semibold text-white">{project.title}</h3>
            <div className="flex items-center gap-2">
              {/* Move buttons */}
              <div className="flex flex-col">
                {index > 0 && (
                  <button
                    onClick={onMoveUp}
                    className="p-1 text-gray-400 hover:text-white hover:bg-white/10 rounded"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                )}
                {index < total - 1 && (
                  <button
                    onClick={onMoveDown}
                    className="p-1 text-gray-400 hover:text-white hover:bg-white/10 rounded"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Action buttons */}
              <button
                onClick={onEdit}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={onDelete}
                className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <p className="text-gray-400 text-sm mb-3 line-clamp-2">{project.description}</p>

          {/* Technologies */}
          {project.technologies?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {project.technologies.map((tech) => (
                <span
                  key={tech}
                  className="px-2 py-1 bg-[#6366f1]/10 text-[#6366f1] rounded-lg text-xs"
                >
                  {tech}
                </span>
              ))}
            </div>
          )}

          {/* Links */}
          <div className="flex gap-3">
            {project.github_url && (
              <a
                href={project.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-gray-400 hover:text-white"
              >
                <Github className="w-4 h-4" />
                <span>GitHub</span>
              </a>
            )}
            {project.live_url && (
              <a
                href={project.live_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-gray-400 hover:text-white"
              >
                <ExternalLink className="w-4 h-4" />
                <span>عرض المشروع</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Projects
