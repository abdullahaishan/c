import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { projectService, storageService } from '../../lib/supabase'
import Swal from 'sweetalert2'
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
  FolderKanban,
  Eye,
  EyeOff,
  Star,
  Upload,
  Image as ImageIcon,
  Tag,
  ListChecks,
  Hash,
  Globe,
  Code,
  FileText
} from 'lucide-react'

const Projects = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  // =============================================
  // State management
  // =============================================
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [previewImage, setPreviewImage] = useState(null)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    technologies: [],
    github_url: '',
    live_url: '',
    features: [],
    image: null,
    status: 'draft',
    is_featured: false,
    category: ''
  })

  const [techInput, setTechInput] = useState('')
  const [featureInput, setFeatureInput] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  // =============================================
  // التحقق من صلاحية الباقة
  // =============================================
  const checkPlanPermission = () => {
    const userPlan = user?.plan_id || 1
    if (userPlan === 1) {
      setError('❌ هذه الميزة متاحة فقط في الباقة المدفوعة')
      return false
    }
    return true
  }

  // =============================================
  // جلب المشاريع
  // =============================================
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

  // =============================================
  // دوال مساعدة
  // =============================================
  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
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

  const handleImageSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFormData({ ...formData, image: file })
      setPreviewImage(URL.createObjectURL(file))
    }
  }

  // =============================================
  // إضافة التقنيات والميزات
  // =============================================
  const addTechnology = () => {
    if (techInput.trim() && !formData.technologies.includes(techInput.trim())) {
      setFormData({
        ...formData,
        technologies: [...formData.technologies, techInput.trim()]
      })
      setTechInput('')
    }
  }

  const removeTechnology = (tech) => {
    setFormData({
      ...formData,
      technologies: formData.technologies.filter(t => t !== tech)
    })
  }

  const addFeature = () => {
    if (featureInput.trim() && !formData.features.includes(featureInput.trim())) {
      setFormData({
        ...formData,
        features: [...formData.features, featureInput.trim()]
      })
      setFeatureInput('')
    }
  }

  const removeFeature = (feature) => {
    setFormData({
      ...formData,
      features: formData.features.filter(f => f !== feature)
    })
  }

  // =============================================
  // إعادة تعيين النموذج
  // =============================================
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      content: '',
      technologies: [],
      github_url: '',
      live_url: '',
      features: [],
      image: null,
      status: 'draft',
      is_featured: false,
      category: ''
    })
    setTechInput('')
    setFeatureInput('')
    setPreviewImage(null)
    setEditingId(null)
    setShowForm(false)
  }

  // =============================================
  // بدء التعديل على مشروع
  // =============================================
  const handleEdit = (project) => {
    setFormData({
      title: project.title || '',
      description: project.description || '',
      content: project.content || '',
      technologies: project.technologies || [],
      github_url: project.github_url || '',
      live_url: project.live_url || '',
      features: project.features || [],
      image: null,
      status: project.status || 'draft',
      is_featured: project.is_featured || false,
      category: project.category || ''
    })
    setPreviewImage(project.image || null)
    setEditingId(project.id)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // =============================================
  // إضافة مشروع جديد
  // =============================================
  const handleAddProject = async () => {
  if (!formData.title || !formData.description) {
    setError('العنوان والوصف مطلوبان')
    return
  }



  setSaving(true)
  setError('')
  setSuccess('')

  try {
    const slug = generateSlug(formData.title)
    
    // رفع الصورة
    let imageResult = null
    if (formData.image) {
      try {
        imageResult = await storageService.uploadProjectImage(formData.image, user.id)
      } catch (uploadErr) {
        setError('❌ ' + (uploadErr.message || JSON.stringify(uploadErr)))
        setSaving(false)
        return
      }
    }

    // إنشاء المشروع
    const projectData = {
      title: formData.title,
      slug,
      description: formData.description,
      content: formData.content || formData.description,
      technologies: formData.technologies,
      github_url: formData.github_url || null,
      live_url: formData.live_url || null,
      features: formData.features,
      image: imageResult?.url || null,
      display_order: projects.length,
      status: formData.status,
      is_featured: formData.is_featured,
      developer_id: user.id
    }

    const created = await projectService.create(user.id, projectData)
    
    // نقل الصورة إذا كانت في مجلد مؤقت
    if (created.id && imageResult?.isTemp && imageResult?.path) {
      const finalImageUrl = await storageService.moveProjectImage(
        imageResult.path, 
        user.id, 
        created.id
      )
      
      if (finalImageUrl) {
        await projectService.update(created.id, { image: finalImageUrl })
        created.image = finalImageUrl
      }
    }

    setProjects([...projects, created])
    resetForm()
    setSuccess('✅ تم إضافة المشروع بنجاح')
    
  } catch (err) {
    console.error('خطأ في إضافة المشروع:', err)
    setError(err.message || '❌ فشل في إضافة المشروع')
  } finally {
    setSaving(false)
    setTimeout(() => setSuccess(''), 3000)
    setTimeout(() => setError(''), 3000)
  }
}
  // =============================================
// تحديث مشروع موجود (مع حذف الصورة القديمة)
// =============================================
const handleUpdateProject = async () => {
  if (!formData.title || !formData.description) {
    setError('العنوان والوصف مطلوبان')
    return
  }

  setSaving(true)
  setError('')
  setSuccess('')

  try {
    // العثور على المشروع القديم قبل التحديث
    const oldProject = projects.find(p => p.id === editingId)
    const oldImageUrl = oldProject?.image || null

    // رفع الصورة الجديدة فقط إذا تم اختيار ملف
    let imageUrl = formData.image // الصورة الحالية في النموذج (قد تكون رابط أو null)

    // في handleUpdateProject، عند رفع الصورة
if (formData.image instanceof File) {
  try {
    console.log('رفع صورة جديدة للمشروع:', editingId)
    const uploadResult = await storageService.uploadProjectImage(formData.image, user.id, editingId)
    // ✅ استخدم uploadResult.url وليس النتيجة مباشرة
    imageUrl = uploadResult.url
    console.log('تم رفع الصورة:', imageUrl)
  } catch (uploadErr) {
    console.error('خطأ في رفع الصورة:', uploadErr)
    setError('❌ ' + (uploadErr.message || JSON.stringify(uploadErr)))
    setSaving(false)
    return
  }
}

    // بيانات التحديث
    const updates = {
      title: formData.title,
      description: formData.description,
      content: formData.content,
      technologies: formData.technologies,
      github_url: formData.github_url || null,
      live_url: formData.live_url || null,
      features: formData.features,
      image: imageUrl,
      status: formData.status,
      is_featured: formData.is_featured,
      category: formData.category
    }

    // تحديث المشروع
    const updated = await projectService.update(editingId, updates)
    
    // **حذف الصورة القديمة إذا وجدت وتم رفع صورة جديدة**
    if (oldImageUrl && formData.image instanceof File) {
      try {
        // استخراج المسار من الرابط
        const oldPath = oldImageUrl.split('/developers/')[1]
        if (oldPath) {
          await storageService.deleteFile(oldPath)
          console.log('تم حذف الصورة القديمة:', oldPath)
        }
      } catch (deleteErr) {
        console.error('فشل حذف الصورة القديمة:', deleteErr)
        // لا نوقف العملية إذا فشل الحذف
      }
    }
    
    // تحديث قائمة المشاريع
    setProjects(projects.map(p => p.id === editingId ? updated : p))
    
    // إعادة تعيين النموذج
    resetForm()
    setSuccess('✅ تم تحديث المشروع بنجاح')
    
  } catch (err) {
    console.error('خطأ في تحديث المشروع:', err)
    setError('❌ فشل في تحديث المشروع: ' + (err.message || JSON.stringify(err)))
  } finally {
    setSaving(false)
    setTimeout(() => setSuccess(''), 3000)
    setTimeout(() => setError(''), 3000)
  }
}

  // =============================================
  // حذف مشروع (للباقة المدفوعة فقط)
  // =============================================
  const handleDeleteProject = async (id) => {
    if (!checkPlanPermission()) return

    const result = await Swal.fire({
      title: 'هل أنت متأكد؟',
      text: "لن تتمكن من استعادة هذا المشروع بعد الحذف!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'نعم، احذف',
      cancelButtonText: 'إلغاء',
      background: '#1a1a1a',
      color: '#fff'
    })

    if (!result.isConfirmed) return

    try {
      await projectService.delete(id)
      setProjects(projects.filter(p => p.id !== id))
      setSuccess('✅ تم حذف المشروع')
    } catch (err) {
      setError('❌ فشل في حذف المشروع')
    } finally {
      setTimeout(() => setSuccess(''), 3000)
      setTimeout(() => setError(''), 3000)
    }
  }

  // =============================================
  // ترتيب المشاريع
  // =============================================
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

  // =============================================
  // فلترة المشاريع
  // =============================================
  const filteredProjects = projects.filter(p => 
    selectedCategory === 'all' ? true : 
    selectedCategory === 'published' ? p.status === 'published' :
    selectedCategory === 'draft' ? p.status === 'draft' :
    selectedCategory === 'featured' ? p.is_featured : true
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030014] flex items-center justify-center">
        <div className="text-center px-4">
          <Loader className="w-10 h-10 md:w-12 md:h-12 animate-spin text-[#6366f1] mx-auto mb-4" />
          <p className="text-sm md:text-base text-gray-400">جاري تحميل المشاريع...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 md:space-y-6 lg:space-y-8 p-3 md:p-4 lg:p-6 max-w-full overflow-x-hidden">
      
      {/* =========================================
          الهيدر مع الإحصائيات (متجاوب)
      ========================================= */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2">المشاريع</h1>
          <p className="text-sm md:text-base text-gray-400">إدارة وتنظيم مشاريعك وعرضها بشكل احترافي</p>
        </div>
        <div className="flex gap-2 md:gap-4 w-full sm:w-auto">
          <div className="flex-1 sm:flex-none text-center px-3 md:px-4 py-2 bg-white/5 rounded-xl">
            <div className="text-xl md:text-2xl font-bold text-[#a855f7]">{projects.length}</div>
            <div className="text-[10px] md:text-xs text-gray-400">إجمالي</div>
          </div>
          <div className="flex-1 sm:flex-none text-center px-3 md:px-4 py-2 bg-white/5 rounded-xl">
            <div className="text-xl md:text-2xl font-bold text-green-400">
              {projects.filter(p => p.status === 'published').length}
            </div>
            <div className="text-[10px] md:text-xs text-gray-400">منشور</div>
          </div>
        </div>
      </div>

      {/* =========================================
          رسائل النجاح والخطأ
      ========================================= */}
      {error && (
        <div className="flex items-center gap-2 p-3 md:p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm md:text-base">
          <AlertCircle className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
          <p className="flex-1">{error}</p>
          <button onClick={() => setError('')} className="hover:text-white">
            <X className="w-3 h-3 md:w-4 md:h-4" />
          </button>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 p-3 md:p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm md:text-base">
          <AlertCircle className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
          <p className="flex-1">{success}</p>
          <button onClick={() => setSuccess('')} className="hover:text-white">
            <X className="w-3 h-3 md:w-4 md:h-4" />
          </button>
        </div>
      )}

      {/* =========================================
          زر إظهار النموذج
      ========================================= */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 md:px-6 py-2.5 md:py-3 bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white rounded-xl font-semibold hover:scale-[1.02] transition-all text-sm md:text-base"
        >
          <Plus className="w-4 h-4 md:w-5 md:h-5" />
          إضافة مشروع جديد
        </button>
      )}

      {/* =========================================
          نموذج إضافة/تعديل المشروع (متجاوب)
      ========================================= */}
      {showForm && (
        <div className="bg-white/5 backdrop-blur-xl rounded-xl md:rounded-2xl p-4 md:p-6 border border-white/10">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h2 className="text-lg md:text-xl font-semibold text-white flex items-center gap-2">
              {editingId ? (
                <>
                  <Edit className="w-4 h-4 md:w-5 md:h-5 text-[#6366f1]" />
                  تعديل المشروع
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 md:w-5 md:h-5 text-[#6366f1]" />
                  إضافة مشروع جديد
                </>
              )}
            </h2>
            <button
              onClick={resetForm}
              className="p-1.5 md:p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition"
            >
              <X className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </div>

          {/* على الشاشات الصغيرة: عمود واحد، على الكبيرة: عمودين */}
          <div className="flex flex-col lg:grid lg:grid-cols-2 gap-4 md:gap-6">
            
            {/* =====================================
                العمود الأيمن (المعلومات الأساسية)
            ===================================== */}
            <div className="space-y-3 md:space-y-4">
              
              {/* عنوان المشروع */}
              <div>
                <label className="flex items-center gap-1 md:gap-2 text-xs md:text-sm text-gray-400 mb-1 md:mb-2">
                  <Tag className="w-3 h-3 md:w-4 md:h-4" />
                  عنوان المشروع <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-2 md:p-3 text-sm md:text-base bg-white/10 border border-white/20 rounded-lg text-white focus:border-[#6366f1] outline-none transition"
                  placeholder="مثال: منصة تعليمية متكاملة"
                />
              </div>

              {/* وصف مختصر */}
              <div>
                <label className="flex items-center gap-1 md:gap-2 text-xs md:text-sm text-gray-400 mb-1 md:mb-2">
                  <ListChecks className="w-3 h-3 md:w-4 md:h-4" />
                  وصف مختصر <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="3"
                  className="w-full p-2 md:p-3 text-sm md:text-base bg-white/10 border border-white/20 rounded-lg text-white focus:border-[#6366f1] outline-none transition"
                  placeholder="وصف موجز للمشروع..."
                />
              </div>

              {/* وصف تفصيلي */}
              <div>
                <label className="flex items-center gap-1 md:gap-2 text-xs md:text-sm text-gray-400 mb-1 md:mb-2">
                  <FileText className="w-3 h-3 md:w-4 md:h-4" />
                  وصف تفصيلي
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows="4"
                  className="w-full p-2 md:p-3 text-sm md:text-base bg-white/10 border border-white/20 rounded-lg text-white focus:border-[#6366f1] outline-none transition"
                  placeholder="شرح مفصل للمشروع، التحديات، الحلول..."
                />
              </div>

              {/* روابط المشروع */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="flex items-center gap-1 md:gap-2 text-xs md:text-sm text-gray-400 mb-1 md:mb-2">
                    <Github className="w-3 h-3 md:w-4 md:h-4" />
                    رابط GitHub
                  </label>
                  <input
                    type="url"
                    value={formData.github_url}
                    onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
                    className="w-full p-2 md:p-3 text-sm md:text-base bg-white/10 border border-white/20 rounded-lg text-white focus:border-[#6366f1] outline-none transition"
                    placeholder="https://github.com/..."
                  />
                </div>
                <div>
                  <label className="flex items-center gap-1 md:gap-2 text-xs md:text-sm text-gray-400 mb-1 md:mb-2">
                    <Globe className="w-3 h-3 md:w-4 md:h-4" />
                    رابط المشروع
                  </label>
                  <input
                    type="url"
                    value={formData.live_url}
                    onChange={(e) => setFormData({ ...formData, live_url: e.target.value })}
                    className="w-full p-2 md:p-3 text-sm md:text-base bg-white/10 border border-white/20 rounded-lg text-white focus:border-[#6366f1] outline-none transition"
                    placeholder="https://example.com"
                  />
                </div>
              </div>
            </div>

            {/* =====================================
                العمود الأيسر (التقنيات والميزات)
            ===================================== */}
            <div className="space-y-3 md:space-y-4">
              
              {/* التصنيف */}
              <div>
                <label className="flex items-center gap-1 md:gap-2 text-xs md:text-sm text-gray-400 mb-1 md:mb-2">
                  <Hash className="w-3 h-3 md:w-4 md:h-4" />
                  التصنيف
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full p-2 md:p-3 text-sm md:text-base bg-white/10 border border-white/20 rounded-lg text-white focus:border-[#6366f1] outline-none transition"
                  placeholder="مثال: ويب، موبايل، ذكاء اصطناعي"
                />
              </div>

              {/* التقنيات المستخدمة */}
              <div>
                <label className="flex items-center gap-1 md:gap-2 text-xs md:text-sm text-gray-400 mb-1 md:mb-2">
                  <Code className="w-3 h-3 md:w-4 md:h-4" />
                  التقنيات المستخدمة
                </label>
                <div className="flex flex-col sm:flex-row gap-2 mb-2">
                  <input
                    type="text"
                    value={techInput}
                    onChange={(e) => setTechInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTechnology()}
                    className="flex-1 p-2 md:p-3 text-sm md:text-base bg-white/10 border border-white/20 rounded-lg text-white focus:border-[#6366f1] outline-none transition"
                    placeholder="مثال: React"
                  />
                  <button
                    onClick={addTechnology}
                    className="w-full sm:w-auto px-4 py-2 bg-[#6366f1] text-white rounded-lg hover:bg-[#a855f7] transition-all text-sm"
                  >
                    إضافة
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 min-h-[40px] p-2 bg-white/5 rounded-lg">
                  {formData.technologies.map((tech) => (
                    <span
                      key={tech}
                      className="flex items-center gap-1 px-2 py-1 bg-[#6366f1]/20 text-[#6366f1] rounded-lg text-xs"
                    >
                      {tech}
                      <button onClick={() => removeTechnology(tech)} className="hover:text-white">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* الميزات الرئيسية */}
              <div>
                <label className="flex items-center gap-1 md:gap-2 text-xs md:text-sm text-gray-400 mb-1 md:mb-2">
                  <Star className="w-3 h-3 md:w-4 md:h-4" />
                  الميزات الرئيسية
                </label>
                <div className="flex flex-col sm:flex-row gap-2 mb-2">
                  <input
                    type="text"
                    value={featureInput}
                    onChange={(e) => setFeatureInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addFeature()}
                    className="flex-1 p-2 md:p-3 text-sm md:text-base bg-white/10 border border-white/20 rounded-lg text-white focus:border-[#6366f1] outline-none transition"
                    placeholder="مثال: تسجيل دخول آمن"
                  />
                  <button
                    onClick={addFeature}
                    className="w-full sm:w-auto px-4 py-2 bg-[#6366f1] text-white rounded-lg hover:bg-[#a855f7] transition-all text-sm"
                  >
                    إضافة
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 min-h-[40px] p-2 bg-white/5 rounded-lg">
                  {formData.features.map((feature) => (
                    <span
                      key={feature}
                      className="flex items-center gap-1 px-2 py-1 bg-purple-500/20 text-purple-400 rounded-lg text-xs"
                    >
                      {feature}
                      <button onClick={() => removeFeature(feature)} className="hover:text-white">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* صورة المشروع */}
              <div>
                <label className="flex items-center gap-1 md:gap-2 text-xs md:text-sm text-gray-400 mb-1 md:mb-2">
                  <ImageIcon className="w-3 h-3 md:w-4 md:h-4" />
                  صورة المشروع
                </label>
                <div className="relative">
                  {previewImage ? (
                    <div className="relative w-full h-32 md:h-40 rounded-lg overflow-hidden">
                      <img
                        src={previewImage}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => {
                          setFormData({ ...formData, image: null })
                          setPreviewImage(null)
                        }}
                        className="absolute top-2 right-2 p-1 bg-red-500/80 rounded-full hover:bg-red-600 transition"
                      >
                        <X className="w-3 h-3 md:w-4 md:h-4 text-white" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-32 md:h-40 border-2 border-dashed border-white/20 rounded-lg cursor-pointer hover:border-[#6366f1]/50 transition bg-white/5">
                      <Upload className="w-6 h-6 md:w-8 md:h-8 text-gray-400 mb-2" />
                      <span className="text-xs md:text-sm text-gray-400">اضغط لرفع صورة</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* حالة المشروع ومميز */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="flex items-center gap-1 md:gap-2 text-xs md:text-sm text-gray-400 mb-1 md:mb-2">
                    {formData.status === 'published' ? (
                      <Eye className="w-3 h-3 md:w-4 md:h-4 text-green-400" />
                    ) : (
                      <EyeOff className="w-3 h-3 md:w-4 md:h-4 text-yellow-400" />
                    )}
                    حالة المشروع
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full p-2 md:p-3 text-sm md:text-base bg-white/10 border border-white/20 rounded-lg text-white focus:border-[#6366f1] outline-none transition"
                  >
                    <option value="draft">🔒 مسودة</option>
                    <option value="published">🌍 منشور</option>
                  </select>
                </div>

                <div>
                  <label className="flex items-center gap-1 md:gap-2 text-xs md:text-sm text-gray-400 mb-1 md:mb-2">
                    <Star className={`w-3 h-3 md:w-4 md:h-4 ${formData.is_featured ? 'text-yellow-400' : ''}`} />
                    مشروع مميز
                  </label>
                  <div className="flex items-center h-[42px] md:h-[50px]">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.is_featured}
                        onChange={(e) =>
                          setFormData({ ...formData, is_featured: e.target.checked })
                        }
                        className="w-4 h-4"
                      />
                      <span className="text-xs md:text-sm text-gray-300">
                        {formData.is_featured ? 'مميز' : 'عادي'}
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* أزرار الحفظ والإلغاء */}
          <div className="flex flex-col sm:flex-row gap-3 mt-4 md:mt-6">
            <button
              onClick={editingId ? handleUpdateProject : handleAddProject}
              disabled={saving || !formData.title || !formData.description}
              className="flex-1 flex items-center justify-center gap-2 px-4 md:px-6 py-2.5 md:py-3 bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white rounded-xl font-semibold hover:scale-[1.02] transition-all disabled:opacity-50 text-sm md:text-base"
            >
              {saving ? (
                <>
                  <Loader className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                <>
                  {editingId ? <Save className="w-4 h-4 md:w-5 md:h-5" /> : <Plus className="w-4 h-4 md:w-5 md:h-5" />}
                  {editingId ? 'تحديث المشروع' : 'إضافة المشروع'}
                </>
              )}
            </button>
            <button
              onClick={resetForm}
              className="px-4 md:px-6 py-2.5 md:py-3 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/20 transition-all text-sm md:text-base"
            >
              إلغاء
            </button>
          </div>
        </div>
      )}

      {/* =========================================
          فلاتر المشاريع (متجاوبة)
      ========================================= */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h2 className="text-lg md:text-xl font-semibold text-white">المشاريع الحالية</h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-2 md:px-3 py-1 rounded-lg text-xs md:text-sm transition ${
              selectedCategory === 'all'
                ? 'bg-[#6366f1] text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            الكل ({projects.length})
          </button>
          <button
            onClick={() => setSelectedCategory('published')}
            className={`px-2 md:px-3 py-1 rounded-lg text-xs md:text-sm transition ${
              selectedCategory === 'published'
                ? 'bg-green-500/80 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            منشور ({projects.filter(p => p.status === 'published').length})
          </button>
          <button
            onClick={() => setSelectedCategory('draft')}
            className={`px-2 md:px-3 py-1 rounded-lg text-xs md:text-sm transition ${
              selectedCategory === 'draft'
                ? 'bg-yellow-500/80 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            مسودة ({projects.filter(p => p.status === 'draft').length})
          </button>
        </div>
      </div>

      {/* =========================================
          عرض المشاريع (متجاوب)
      ========================================= */}
      {filteredProjects.length === 0 ? (
        <div className="text-center py-8 md:py-12 bg-white/5 rounded-xl md:rounded-2xl">
          <FolderKanban className="w-12 h-12 md:w-16 md:h-16 text-gray-600 mx-auto mb-3 md:mb-4" />
          <p className="text-sm md:text-base text-gray-400">لا توجد مشاريع في هذا التصنيف</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:gap-4">
          {filteredProjects.map((project, index) => (
            <div
              key={project.id}
              className="bg-white/5 backdrop-blur-xl rounded-xl md:rounded-2xl p-4 md:p-6 border border-white/10 hover:border-[#6366f1]/50 transition-all group relative"
            >
              {/* أزرار التحكم (متجاوبة) */}
              <div className="absolute top-2 md:top-4 right-2 md:right-4 flex items-center gap-1 md:gap-2">
                <div className="flex flex-col">
                  {projects.findIndex(p => p.id === project.id) > 0 && (
                    <button
                      onClick={() => handleMoveProject(projects.findIndex(p => p.id === project.id), 'up')}
                      className="p-1 text-gray-400 hover:text-white hover:bg-white/10 rounded"
                    >
                      <ChevronUp className="w-3 h-3 md:w-4 md:h-4" />
                    </button>
                  )}
                  {projects.findIndex(p => p.id === project.id) < projects.length - 1 && (
                    <button
                      onClick={() => handleMoveProject(projects.findIndex(p => p.id === project.id), 'down')}
                      className="p-1 text-gray-400 hover:text-white hover:bg-white/10 rounded"
                    >
                      <ChevronDown className="w-3 h-3 md:w-4 md:h-4" />
                    </button>
                  )}
                </div>
                <button
                  onClick={() => handleEdit(project)}
                  className="p-1.5 md:p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg"
                >
                  <Edit className="w-3 h-3 md:w-4 md:h-4" />
                </button>
                
                {/* زر الحذف - للباقة المدفوعة فقط */}
                {user?.plan_id > 1 ? (
                  <button
                    onClick={() => handleDeleteProject(project.id)}
                    className="p-1.5 md:p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg"
                    title="حذف المشروع"
                  >
                    <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => setError('❌ ميزة الحذف متاحة فقط في الباقة المدفوعة')}
                    className="p-1.5 md:p-2 text-gray-600 cursor-not-allowed relative group"
                    title="متاح فقط في الباقة المدفوعة"
                  >
                    <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
                    <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 
                                     text-[10px] md:text-xs text-yellow-400 bg-black/80 px-2 py-1 rounded 
                                     opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-50">
                      🔒 الباقة المدفوعة فقط
                    </span>
                  </button>
                )}
              </div>

              {/* حالة المشروع (متجاوبة) */}
              <div className="absolute top-2 md:top-4 left-2 md:left-4 flex gap-1 md:gap-2">
                {project.status === 'published' ? (
                  <span className="flex items-center gap-1 px-1.5 md:px-2 py-0.5 md:py-1 bg-green-500/20 text-green-400 rounded-lg text-[10px] md:text-xs">
                    <Eye className="w-2 h-2 md:w-3 md:h-3" />
                    منشور
                  </span>
                ) : (
                  <span className="flex items-center gap-1 px-1.5 md:px-2 py-0.5 md:py-1 bg-yellow-500/20 text-yellow-400 rounded-lg text-[10px] md:text-xs">
                    <EyeOff className="w-2 h-2 md:w-3 md:h-3" />
                    مسودة
                  </span>
                )}
                {project.is_featured && (
                  <span className="flex items-center gap-1 px-1.5 md:px-2 py-0.5 md:py-1 bg-yellow-500/20 text-yellow-400 rounded-lg text-[10px] md:text-xs">
                    <Star className="w-2 h-2 md:w-3 md:h-3" />
                    مميز
                  </span>
                )}
              </div>

              {/* محتوى المشروع (متجاوب) */}
              <div className="mt-10 md:mt-12 cursor-pointer" onClick={() => navigate(`/project/${project.id}`)}>
                {project.image && (
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-32 md:h-48 object-cover rounded-lg mb-3 md:mb-4"
                  />
                )}

                <h3 className="text-base md:text-xl font-semibold text-white mb-2 pr-16 md:pr-24">
                  {project.title}
                </h3>

                {project.category && (
                  <span className="inline-block px-1.5 md:px-2 py-0.5 md:py-1 bg-[#6366f1]/10 text-[#6366f1] rounded-lg text-[10px] md:text-xs mb-2 md:mb-3">
                    {project.category}
                  </span>
                )}

                <p className="text-xs md:text-sm text-gray-400 mb-3 md:mb-4 line-clamp-2">
                  {project.description}
                </p>

                {project.technologies?.length > 0 && (
                  <div className="flex flex-wrap gap-1 md:gap-2 mb-3 md:mb-4">
                    {project.technologies.slice(0, 3).map((tech) => (
                      <span
                        key={tech}
                        className="px-1.5 md:px-2 py-0.5 md:py-1 bg-[#6366f1]/10 text-[#6366f1] rounded-lg text-[10px] md:text-xs"
                      >
                        {tech}
                      </span>
                    ))}
                    {project.technologies.length > 3 && (
                      <span className="px-1.5 md:px-2 py-0.5 md:py-1 bg-white/5 text-gray-400 rounded-lg text-[10px] md:text-xs">
                        +{project.technologies.length - 3}
                      </span>
                    )}
                  </div>
                )}

                <div className="flex gap-3 md:gap-4 text-xs md:text-sm">
                  {project.github_url && (
                    <a
                      href={project.github_url}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1 text-gray-400 hover:text-white transition"
                    >
                      <Github className="w-3 h-3 md:w-4 md:h-4" />
                      <span className="hidden sm:inline">GitHub</span>
                    </a>
                  )}
                  {project.live_url && (
                    <a
                      href={project.live_url}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1 text-gray-400 hover:text-white transition"
                    >
                      <ExternalLink className="w-3 h-3 md:w-4 md:h-4" />
                      <span className="hidden sm:inline">معاينة</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Projects
