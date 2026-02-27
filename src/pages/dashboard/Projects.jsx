import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { projectService, storageService } from '../../lib/supabase'
import {
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Github,
  ExternalLink,
  Loader,
  AlertCircle,
  ChevronUp,
  ChevronDown,
  FolderKanban
} from 'lucide-react'

const Projects = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [editingId, setEditingId] = useState(null)

  const [newProject, setNewProject] = useState({
  title: '',
  description: '',
  technologies: [],
  github_url: '',
  live_url: '',
  features: [],
  image: null,
  status: 'draft',
  is_featured: false
})

  const [techInput, setTechInput] = useState('')
  const [featureInput, setFeatureInput] = useState('')

  useEffect(() => {
    if (user) fetchProjects()
  }, [user])

  const fetchProjects = async () => {
    setLoading(true)
    try {
      const data = await projectService.getByDeveloperId(user.id)
      const sorted = (data || []).sort((a, b) => a.display_order - b.display_order)
      setProjects(sorted)
    } catch (err) {
      setError('فشل في جلب المشاريع')
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (file, projectId = 'new') => {
    if (!file) return null
    try {
      const url = await storageService.uploadProjectImage(file, user.id, projectId)
      return url
    } catch (err) {
      setError('فشل في رفع الصورة')
      return null
    }
  }

  const handleAddProject = async () => {
    if (!newProject.title || !newProject.description) {
      setError('العنوان والوصف مطلوبان')
      return
    }

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      let imageUrl = null
      if (newProject.image) {
        imageUrl = await handleImageUpload(newProject.image)
      }

      const slug = generateSlug(newProject.title)

const projectData = {
  title: newProject.title,
  slug,
  description: newProject.description,
  technologies: newProject.technologies,
  github_url: newProject.github_url || null,
  live_url: newProject.live_url || null,
  features: newProject.features,
  image: imageUrl,
  display_order: projects.length,
  status: newProject.status,
  is_featured: newProject.is_featured,
  developer_id: user.id
}

      const created = await projectService.create(user.id, projectData)

      setProjects([...projects, created])

      setNewProject({
        title: '',
        description: '',
        technologies: [],
        github_url: '',
        live_url: '',
        features: [],
        image: null
      })

      setSuccess('تم إضافة المشروع بنجاح')
    } catch (err) {
      if (err.message?.includes('permission')) {
  setError('ليس لديك صلاحية لإضافة مشروع')
} else if (err.message?.includes('quota')) {
  setError('تم تجاوز حد التخزين المسموح')
} else {
  setError(err.message || 'فشل في إضافة المشروع')
}
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateProject = async (id, updates) => {
    setSaving(true)
    try {
      if (updates.image instanceof File) {
        const imageUrl = await handleImageUpload(updates.image, id)
        updates.image_url = imageUrl
      }

      updates.technologies = updates.technologies || []
      updates.features = updates.features || []

      const updated = await projectService.update(id, updates)

      setProjects(projects.map(p => p.id === id ? updated : p))
      setEditingId(null)
      setSuccess('تم تحديث المشروع')
    } catch (err) {
      setError('فشل في التحديث')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteProject = async (id) => {
    if (!window.confirm('هل أنت متأكد؟')) return
    await projectService.delete(id)
    setProjects(projects.filter(p => p.id !== id))
  }

  const handleMoveProject = async (index, direction) => {
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= projects.length) return

    const updated = [...projects]
    const temp = updated[index]
    updated[index] = updated[newIndex]
    updated[newIndex] = temp

    updated.forEach((p, i) => p.display_order = i)
    setProjects(updated)

    await Promise.all(
      updated.map(p => projectService.update(p.id, { display_order: p.display_order }))
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030014] flex items-center justify-center">
        <Loader className="w-10 h-10 animate-spin text-[#6366f1]" />
      </div>
    )
  }

  return (
    <div className="space-y-6">

      <h1 className="text-2xl font-bold text-white">المشاريع</h1>

      {error && <div className="text-red-400">{error}</div>}
      {success && <div className="text-green-400">{success}</div>}
{/* Status */}
      <label className="flex items-center gap-2 text-sm text-gray-400">
  <input
    type="checkbox"
    checked={newProject.is_featured}
    onChange={(e) =>
      setNewProject({ ...newProject, is_featured: e.target.checked })
    }
    className="w-4 h-4"
  />
  تمييز كمشروع بارز
</label>
<div>
  <label className="block text-sm text-gray-400 mb-2">حالة المشروع</label>
  <select
    value={newProject.status}
    onChange={(e) => setNewProject({ ...newProject, status: e.target.value })}
    className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white"
  >
    <option value="draft">مسودة</option>
    <option value="published">منشور</option>
  </select>
</div>
      <button
        onClick={handleAddProject}
        disabled={saving}
        className="px-6 py-3 bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white rounded-xl"
      >
        {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Plus />}
        إضافة مشروع
      </button>

      {projects.length === 0 ? (
        <div className="text-gray-400">لا توجد مشاريع</div>
      ) : (
        projects.map((project, index) => (
          <div
            key={project.id}
            onClick={() => navigate(`/project/${project.id}`)}
            className="bg-white/5 p-6 rounded-2xl border border-white/10 hover:border-[#6366f1] cursor-pointer transition-all"
          >
            <h3 className="text-white text-lg font-semibold mb-2">
              {project.title}
            </h3>

            <p className="text-gray-400 mb-3">
              {project.description}
            </p>

            {project.image_url && (
              <img
                src={project.image_url}
                alt={project.title}
                className="w-full h-40 object-cover rounded-lg mb-3"
              />
            )}

            <div className="flex flex-wrap gap-2 mb-3">
              {(project.technologies || []).map(tech => (
                <span
                  key={tech}
                  className="px-2 py-1 bg-[#6366f1]/10 text-[#6366f1] rounded-lg text-xs"
                >
                  {tech}
                </span>
              ))}
            </div>

            <div className="flex gap-4 text-sm">
              {project.github_url && (
                <a
                  href={project.github_url}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1 text-gray-400 hover:text-white"
                >
                  <Github className="w-4 h-4" />
                  GitHub
                </a>
              )}

              {project.live_url && (
                <a
                  href={project.live_url}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1 text-gray-400 hover:text-white"
                >
                  <ExternalLink className="w-4 h-4" />
                  عرض
                </a>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  )
}

export default Projects
