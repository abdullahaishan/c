import React, { useState } from 'react'
import { useDeveloper } from '../../context/DeveloperContext'
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
  const { developer, getCertificates, refresh } = useDeveloper()
  const { checkLimit, limits } = usePlan()
  const [certificates, setCertificates] = useState(getCertificates())
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  // نموذج شهادة جديدة
  const [newCertificate, setNewCertificate] = useState({
    name: '',
    issuer: '',
    issue_date: '',
    credential_url: '',
    image: null
  })

  const handleImageUpload = async (file) => {
    if (!file) return null
    
    setUploading(true)
    try {
      const imageUrl = await storageService.uploadImage(
        file,
        `certificates/${developer.id}`
      )
      return imageUrl
    } catch (err) {
      console.error('Error uploading image:', err)
      setError('Failed to upload image')
      return null
    } finally {
      setUploading(false)
    }
  }

  const handleAddCertificate = async () => {
    // التحقق من حدود الباقة
    if (!checkLimit('certificates', certificates.length)) {
      setError(`You've reached the maximum limit of ${limits.maxCertificates} certificates`)
      return
    }

    if (!newCertificate.name || !newCertificate.issuer) {
      setError('Certificate name and issuer are required')
      return
    }

    setLoading(true)
    setError('')

    try {
      let imageUrl = null
      if (newCertificate.image) {
        imageUrl = await handleImageUpload(newCertificate.image)
      }

      const certificateData = {
        name: newCertificate.name,
        issuer: newCertificate.issuer,
        issue_date: newCertificate.issue_date || null,
        credential_url: newCertificate.credential_url,
        image: imageUrl,
        display_order: certificates.length
      }

      const created = await certificateService.create(developer.id, certificateData)
      setCertificates([...certificates, created])
      
      // إعادة تعيين النموذج
      setNewCertificate({
        name: '',
        issuer: '',
        issue_date: '',
        credential_url: '',
        image: null
      })
    } catch (err) {
      console.error('Error adding certificate:', err)
      setError('Failed to add certificate')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateCertificate = async (id, updates) => {
    setLoading(true)
    try {
      const updated = await certificateService.update(id, updates)
      setCertificates(certificates.map(c => c.id === id ? updated : c))
      setEditingId(null)
    } catch (err) {
      console.error('Error updating certificate:', err)
      setError('Failed to update certificate')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteCertificate = async (id) => {
    if (!window.confirm('Are you sure you want to delete this certificate?')) return

    setLoading(true)
    try {
      await certificateService.delete(id)
      setCertificates(certificates.filter(c => c.id !== id))
    } catch (err) {
      console.error('Error deleting certificate:', err)
      setError('Failed to delete certificate')
    } finally {
      setLoading(false)
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Certificates</h1>
        <div className="text-sm text-gray-400">
          {certificates.length} / {limits.maxCertificates === -1 ? '∞' : limits.maxCertificates}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Add new certificate form */}
      {checkLimit('certificates', certificates.length) && (
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
          <h2 className="text-lg font-semibold text-white mb-4">Add New Certificate</h2>
          
          <div className="space-y-4">
            {/* Image upload */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Certificate Image</label>
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
                    <span className="text-gray-300">Upload Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setNewCertificate({ ...newCertificate, image: e.target.files[0] })}
                      className="hidden"
                    />
                  </label>
                )}
                {uploading && <Loader className="w-5 h-5 text-[#6366f1] animate-spin" />}
              </div>
            </div>

            {/* Certificate name */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Certificate Name *</label>
              <input
                type="text"
                value={newCertificate.name}
                onChange={(e) => setNewCertificate({ ...newCertificate, name: e.target.value })}
                className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white"
                placeholder="e.g., Meta Frontend Developer"
              />
            </div>

            {/* Issuer */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Issuing Organization *</label>
              <input
                type="text"
                value={newCertificate.issuer}
                onChange={(e) => setNewCertificate({ ...newCertificate, issuer: e.target.value })}
                className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white"
                placeholder="e.g., Meta"
              />
            </div>

            {/* Issue date */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Issue Date</label>
              <input
                type="date"
                value={newCertificate.issue_date}
                onChange={(e) => setNewCertificate({ ...newCertificate, issue_date: e.target.value })}
                className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white"
              />
            </div>

            {/* Credential URL */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Credential URL</label>
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
              disabled={loading || !newCertificate.name || !newCertificate.issuer}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white rounded-xl font-semibold hover:scale-[1.02] transition-all disabled:opacity-50"
            >
              {loading ? <Loader className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
              Add Certificate
            </button>
          </div>
        </div>
      )}

      {/* Certificates grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {certificates.map((certificate, index) => (
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
        ))}

        {certificates.length === 0 && (
          <div className="col-span-full text-center py-12">
            <AlertCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No certificates yet</p>
            <p className="text-sm text-gray-500">Add your certificates to showcase your achievements</p>
          </div>
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

  if (isEditing) {
    return (
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-[#6366f1]/50">
        <div className="space-y-3">
          <input
            type="text"
            value={editData.name}
            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
            className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm"
            placeholder="Certificate name"
          />
          <input
            type="text"
            value={editData.issuer}
            onChange={(e) => setEditData({ ...editData, issuer: e.target.value })}
            className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm"
            placeholder="Issuer"
          />
          <input
            type="date"
            value={editData.issue_date}
            onChange={(e) => setEditData({ ...editData, issue_date: e.target.value })}
            className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm"
          />
          <div className="flex gap-2">
            <button
              onClick={() => onUpdate(certificate.id, editData)}
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
            <span className="text-4xl font-bold text-white/30">{certificate.name[0]}</span>
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

        {/* Move buttons */}
        <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
            Issued: {new Date(certificate.issue_date).toLocaleDateString()}
          </p>
        )}

        {certificate.credential_url && (
          <a
            href={certificate.credential_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1 text-xs text-[#a855f7] hover:text-[#6366f1]"
          >
            <span>View Credential</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    </div>
  )
}

export default Certificates