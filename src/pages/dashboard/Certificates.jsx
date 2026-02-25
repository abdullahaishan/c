import React, { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { usePlan } from '../../hooks/usePlan'
import { certificateService, storageService } from '../../lib/supabase'
import {
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Upload,
  Loader,
  AlertCircle,
  ChevronUp,
  ChevronDown,
  ExternalLink
} from 'lucide-react'

const Certificates = () => {
  const { user } = useAuth()
  const { checkLimit, limits } = usePlan()
  const [certificates, setCertificates] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [editingId, setEditingId] = useState(null)

  // جلب الشهادات عند تحميل الصفحة
  useEffect(() => {
    fetchCertificates()
  }, [user])

  const fetchCertificates = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      const data = await certificateService.getByDeveloperId(user.id)
      setCertificates(data || [])
    } catch (err) {
      console.error('Error fetching certificates:', err)
      setError('فشل في جلب الشهادات')
    } finally {
      setLoading(false)
    }
  }

  // نموذج شهادة جديدة
  const [newCertificate, setNewCertificate] = useState({
    name: '',
    issuer: '',
    issue_date: '',
    credential_url: '',
    image: null
  })

  // دالة تحويل التاريخ
  const formatDateForDB = (dateString) => {
    if (!dateString) return null
    return dateString // input type="date" يعيد YYYY-MM-DD وهذا مقبول في Supabase
  }

  const handleImageUpload = async (file) => {
    if (!file) return null
    
    setUploading(true)
    try {
      // استخدام دالة رفع صور الشهادات المخصصة
      const imageUrl = await storageService.uploadCertificateImage(
        file,
        user.id,
        null
      )
      return imageUrl
    } catch (err) {
      console.error('Error uploading image:', err)
      setError('فشل في رفع الصورة: ' + err.message)
      return null
    } finally {
      setUploading(false)
    }
  }

  const handleAddCertificate = async () => {
    // التحقق من حدود الباقة
    if (!checkLimit('certificates', certificates.length)) {
      setError(`لقد وصلت للحد الأقصى (${limits.maxCertificates} شهادة)`)
      return
    }

    if (!newCertificate.name || !newCertificate.issuer) {
      setError('اسم الشهادة والجهة المانحة مطلوبان')
      return
    }

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      let imageUrl = null
      if (newCertificate.image) {
        imageUrl = await handleImageUpload(newCertificate.image)
      }

      const certificateData = {
        name: newCertificate.name,
        issuer: newCertificate.issuer,
        issue_date: formatDateForDB(newCertificate.issue_date),
        credential_url: newCertificate.credential_url || null,
        image: imageUrl,
        display_order: certificates.length,
        developer_id: user.id  // ✅ مهم: ربط الشهادة بالمطور
      }

      const created = await certificateService.create(user.id, certificateData)
      setCertificates([...certificates, created])
      
      // إعادة تعيين النموذج
      setNewCertificate({
        name: '',
        issuer: '',
        issue_date: '',
        credential_url: '',
        image: null
      })
      
      setSuccess('✅ تم إضافة الشهادة بنجاح')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      console.error('Error adding certificate:', err)
      setError(err.message || 'فشل في إضافة الشهادة')
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateCertificate = async (id, updates) => {
    setSaving(true)
    setError('')
    setSuccess('')
    
    try {
      const formattedUpdates = {
        ...updates,
        issue_date: formatDateForDB(updates.issue_date)
      }
      
      const updated = await certificateService.update(id, formattedUpdates)
      setCertificates(certificates.map(c => c.id === id ? updated : c))
      setEditingId(null)
      setSuccess('✅ تم تحديث الشهادة بنجاح')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      console.error('Error updating certificate:', err)
      setError(err.message || 'فشل في تحديث الشهادة')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteCertificate = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه الشهادة؟')) return

    try {
      await certificateService.delete(id)
      setCertificates(certificates.filter(c => c.id !== id))
      setSuccess('✅ تم حذف الشهادة بنجاح')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      console.error('Error deleting certificate:', err)
      setError(err.message || 'فشل في حذف الشهادة')
    }
  }

  const handleMoveCertificate = async (index, direction) => {
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= certificates.length) return

    const updatedCertificates = [...certificates]
    const temp = updatedCertificates[index]
    updatedCertificates[index] = updatedCertificates[newIndex]
    updatedCertificates[newIndex] = temp

    // تحديث ترتيب العرض
    updatedCertificates.forEach((c, i) => {
      c.display_order = i
    })

    setCertificates(updatedCertificates)

    // حفظ الترتيب الجديد في الخادم
    try {
      await Promise.all(
        updatedCertificates.map(c => 
          certificateService.update(c.id, { display_order: c.display_order })
        )
      )
    } catch (err) {
      console.error('Error updating order:', err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030014] flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-[#6366f1] animate-spin mx-auto mb-4" />
          <p className="text-gray-400">جاري تحميل شهاداتك...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">الشهادات</h1>
        <div className="text-sm text-gray-400">
          {certificates.length} / {limits?.maxCertificates === -1 ? '∞' : limits?.maxCertificates || 3}
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

      {/* Add new certificate form */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
        <h2 className="text-lg font-semibold text-white mb-4">إضافة شهادة جديدة</h2>
        
        <div className="space-y-4">
          {/* Image upload */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">صورة الشهادة</label>
            <div className="flex items-center gap-4">
              {newCertificate.image ? (
                <div className="relative">
                  <img
                    src={URL.createObjectURL(newCertificate.image)}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => setNewCertificate({ ...newCertificate, image: null })}
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
                    onChange={(e) => setNewCertificate({ ...newCertificate, image: e.target.files[0] })}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              )}
              {uploading && <Loader className="w-5 h-5 text-[#6366f1] animate-spin" />}
            </div>
          </div>

          {/* Certificate name */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">اسم الشهادة *</label>
            <input
              type="text"
              value={newCertificate.name}
              onChange={(e) => setNewCertificate({ ...newCertificate, name: e.target.value })}
              className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white"
              placeholder="مثال: ميتا فرونت إند ديفيلوبر"
            />
          </div>

          {/* Issuer */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">الجهة المانحة *</label>
            <input
              type="text"
              value={newCertificate.issuer}
              onChange={(e) => setNewCertificate({ ...newCertificate, issuer: e.target.value })}
              className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white"
              placeholder="مثال: ميتا"
            />
          </div>

          {/* Issue date */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">تاريخ الإصدار</label>
            <input
              type="date"
              value={newCertificate.issue_date}
              onChange={(e) => setNewCertificate({ ...newCertificate, issue_date: e.target.value })}
              className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white"
            />
          </div>

          {/* Credential URL */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">رابط التحقق</label>
            <input
              type="url"
              value={newCertificate.credential_url}
              onChange={(e) => setNewCertificate({ ...newCertificate, credential_url: e.target.value })}
              className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white"
              placeholder="https://coursera.org/verify/..."
            />
          </div>

          {/* Submit button */}
          <button
            onClick={handleAddCertificate}
            disabled={saving || !newCertificate.name || !newCertificate.issuer}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white rounded-xl font-semibold hover:scale-[1.02] transition-all disabled:opacity-50"
          >
            {saving ? <Loader className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
            إضافة شهادة
          </button>
        </div>
      </div>

      {/* Certificates grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {certificates.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <AlertCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">لا توجد شهادات بعد</p>
            <p className="text-sm text-gray-500">أضف شهاداتك من النموذج أعلاه</p>
          </div>
        ) : (
          certificates.map((certificate, index) => (
            <CertificateCard
              key={certificate.id}
              certificate={certificate}
              index={index}
              total={certificates.length}
              onEdit={() => setEditingId(certificate.id)}
              onDelete={() => handleDeleteCertificate(certificate.id)}
              onMoveUp={() => handleMoveCertificate(index, 'up')}
              onMoveDown={() => handleMoveCertificate(index, 'down')}
              isEditing={editingId === certificate.id}
              onUpdate={handleUpdateCertificate}
            />
          ))
        )}
      </div>
    </div>
  )
}

// مكون بطاقة الشهادة
const CertificateCard = ({ 
  certificate, 
  index, 
  total, 
  onEdit, 
  onDelete, 
  onMoveUp, 
  onMoveDown,
  isEditing,
  onUpdate 
}) => {
  const [editData, setEditData] = useState(certificate)

  // دالة تحويل التاريخ
  const formatDateForDB = (dateString) => {
    if (!dateString) return null
    return dateString
  }

  if (isEditing) {
    return (
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-[#6366f1]/50">
        <div className="space-y-3">
          <input
            type="text"
            value={editData.name || ''}
            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
            className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm"
            placeholder="اسم الشهادة"
          />
          <input
            type="text"
            value={editData.issuer || ''}
            onChange={(e) => setEditData({ ...editData, issuer: e.target.value })}
            className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm"
            placeholder="الجهة المانحة"
          />
          <input
            type="date"
            value={editData.issue_date || ''}
            onChange={(e) => setEditData({ ...editData, issue_date: e.target.value })}
            className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm"
          />
          <div className="flex gap-2">
            <button
              onClick={() => onUpdate(certificate.id, editData)}
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
    <div className="group relative bg-white/5 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/10 hover:border-white/20 transition-all">
      {/* Certificate image */}
      <div className="relative h-48 overflow-hidden">
        {certificate.image ? (
          <img
            src={certificate.image}
            alt={certificate.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#6366f1]/20 to-[#a855f7]/20 flex items-center justify-center">
            <span className="text-4xl font-bold text-white/30">
              {certificate.name?.[0]?.toUpperCase() || '?'}
            </span>
          </div>
        )}

        {/* Overlay with actions */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <button
            onClick={onEdit}
            className="p-2 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20 transition-all"
          >
            <Edit className="w-5 h-5 text-white" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-red-500/20 transition-all"
          >
            <Trash2 className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Move buttons - على اليسار للعربية */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {index > 0 && (
            <button onClick={onMoveUp} className="p-1 bg-black/50 backdrop-blur-sm rounded hover:bg-black/70">
              <ChevronUp className="w-4 h-4 text-white" />
            </button>
          )}
          {index < total - 1 && (
            <button onClick={onMoveDown} className="p-1 bg-black/50 backdrop-blur-sm rounded hover:bg-black/70">
              <ChevronDown className="w-4 h-4 text-white" />
            </button>
          )}
        </div>
      </div>

      {/* Certificate info */}
      <div className="p-4">
        <h3 className="font-semibold text-white mb-1">{certificate.name}</h3>
        <p className="text-sm text-gray-400 mb-2">{certificate.issuer}</p>
        
        {certificate.issue_date && (
          <p className="text-xs text-gray-500">
            تاريخ الإصدار: {new Date(certificate.issue_date).toLocaleDateString('ar-SA')}
          </p>
        )}

        {certificate.credential_url && (
          <a
            href={certificate.credential_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1 text-xs text-[#a855f7] hover:text-[#6366f1]"
          >
            <span>عرض الشهادة</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    </div>
  )
}

export default Certificates
