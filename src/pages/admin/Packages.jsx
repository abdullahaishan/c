import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import {
  Package,
  Plus,
  Edit,
  Save,
  X,
  Crown,
  Check,
  XCircle,
  ArrowUp,
  ArrowDown,
  DollarSign,
  Calendar,
  Users,
  Settings,
  Copy
} from 'lucide-react'

const AdminPackages = () => {
  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [editData, setEditData] = useState({})
  const [showAddModal, setShowAddModal] = useState(false)
  const [newPackage, setNewPackage] = useState({
    name: '',
    name_ar: '',
    price_monthly: 0,
    price_yearly: null,
    max_projects: 3,
    max_skills: 10,
    max_experience: 1,
    max_education: 1,
    max_certifications: 1,
    max_languages: 1,
    max_social_links: 2,
    has_stats: false,
    has_priority: false,
    team_members: 1,
    is_active: true
  })

  useEffect(() => {
    fetchPackages()
  }, [])

  const fetchPackages = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('packages')
      .select('*')
      .order('sort_order')
      .order('price_monthly')

    if (!error) setPackages(data || [])
    setLoading(false)
  }

  const handleEdit = (pkg) => {
    setEditingId(pkg.id)
    setEditData(pkg)
  }

  const handleSave = async () => {
    await supabase
      .from('packages')
      .update(editData)
      .eq('id', editingId)
    setEditingId(null)
    fetchPackages()
  }

  const handleCancel = () => {
    setEditingId(null)
  }

  const handleAdd = async () => {
    await supabase
      .from('packages')
      .insert([newPackage])
    setShowAddModal(false)
    setNewPackage({
      name: '',
      name_ar: '',
      price_monthly: 0,
      price_yearly: null,
      max_projects: 3,
      max_skills: 10,
      max_experience: 1,
      max_education: 1,
      max_certifications: 1,
      max_languages: 1,
      max_social_links: 2,
      has_stats: false,
      has_priority: false,
      team_members: 1,
      is_active: true
    })
    fetchPackages()
  }

  const handleToggleActive = async (id, current) => {
    await supabase
      .from('packages')
      .update({ is_active: !current })
      .eq('id', id)
    fetchPackages()
  }

  const handleMove = async (id, direction) => {
    const index = packages.findIndex(p => p.id === id)
    if (direction === 'up' && index > 0) {
      const temp = packages[index].sort_order
      packages[index].sort_order = packages[index - 1].sort_order
      packages[index - 1].sort_order = temp
      
      await supabase
        .from('packages')
        .update({ sort_order: packages[index].sort_order })
        .eq('id', packages[index].id)
      
      await supabase
        .from('packages')
        .update({ sort_order: packages[index - 1].sort_order })
        .eq('id', packages[index - 1].id)
      
      fetchPackages()
    } else if (direction === 'down' && index < packages.length - 1) {
      const temp = packages[index].sort_order
      packages[index].sort_order = packages[index + 1].sort_order
      packages[index + 1].sort_order = temp
      
      await supabase
        .from('packages')
        .update({ sort_order: packages[index].sort_order })
        .eq('id', packages[index].id)
      
      await supabase
        .from('packages')
        .update({ sort_order: packages[index + 1].sort_order })
        .eq('id', packages[index + 1].id)
      
      fetchPackages()
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Manage Packages</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white rounded-lg hover:scale-105 transition"
        >
          <Plus className="w-4 h-4" />
          Add Package
        </button>
      </div>

      {/* Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.map((pkg, index) => (
          <div
            key={pkg.id}
            className={`bg-white/5 backdrop-blur-xl rounded-2xl p-6 border ${
              pkg.is_active ? 'border-white/10' : 'border-red-500/30 opacity-60'
            }`}
          >
            {editingId === pkg.id ? (
              // Edit Mode
              <div className="space-y-4">
                <input
                  type="text"
                  value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white"
                  placeholder="Name"
                />
                <input
                  type="text"
                  value={editData.name_ar}
                  onChange={(e) => setEditData({ ...editData, name_ar: e.target.value })}
                  className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white"
                  placeholder="Arabic Name"
                />
                <input
                  type="number"
                  value={editData.price_monthly}
                  onChange={(e) => setEditData({ ...editData, price_monthly: parseFloat(e.target.value) })}
                  className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white"
                  placeholder="Monthly Price"
                />
                <input
                  type="number"
                  value={editData.price_yearly || ''}
                  onChange={(e) => setEditData({ ...editData, price_yearly: e.target.value ? parseFloat(e.target.value) : null })}
                  className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white"
                  placeholder="Yearly Price"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    className="flex-1 px-3 py-2 bg-green-500 text-white rounded-lg"
                  >
                    <Save className="w-4 h-4 mx-auto" />
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex-1 px-3 py-2 bg-white/10 text-white rounded-lg"
                  >
                    <X className="w-4 h-4 mx-auto" />
                  </button>
                </div>
              </div>
            ) : (
              // View Mode
              <>
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${
                    pkg.id === 1 ? 'from-gray-500 to-gray-600' :
                    pkg.id === 2 ? 'from-blue-500 to-cyan-500' :
                    pkg.id === 3 ? 'from-yellow-500 to-orange-500' :
                    'from-purple-500 to-pink-500'
                  } flex items-center justify-center`}>
                    <Package className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleMove(pkg.id, 'up')}
                      disabled={index === 0}
                      className="p-1 text-gray-400 hover:text-white disabled:opacity-30"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleMove(pkg.id, 'down')}
                      disabled={index === packages.length - 1}
                      className="p-1 text-gray-400 hover:text-white disabled:opacity-30"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-xl font-bold text-white">{pkg.name}</h3>
                    <p className="text-sm text-gray-400">{pkg.name_ar}</p>
                  </div>
                  <button
                    onClick={() => handleToggleActive(pkg.id, pkg.is_active)}
                    className={`p-2 rounded-lg ${
                      pkg.is_active ? 'text-green-400 hover:bg-green-500/10' : 'text-red-400 hover:bg-red-500/10'
                    }`}
                  >
                    {pkg.is_active ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  </button>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="flex items-center gap-2 text-2xl font-bold text-white">
                    <DollarSign className="w-5 h-5 text-green-400" />
                    {pkg.price_monthly}
                    <span className="text-sm text-gray-400 font-normal">/month</span>
                  </div>
                  {pkg.price_yearly && (
                    <div className="flex items-center gap-2 text-lg text-gray-300">
                      <Calendar className="w-4 h-4 text-blue-400" />
                      ${pkg.price_yearly}/year
                    </div>
                  )}

                  <div className="pt-3 border-t border-white/10 space-y-2">
                    <p className="text-sm text-gray-400 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Team members: {pkg.team_members}
                    </p>
                    <p className="text-sm text-gray-400">Projects: {pkg.max_projects}</p>
                    <p className="text-sm text-gray-400">Skills: {pkg.max_skills}</p>
                    <p className="text-sm text-gray-400">Experience: {pkg.max_experience}</p>
                    <p className="text-sm text-gray-400">Education: {pkg.max_education}</p>
                    <p className="text-sm text-gray-400">Certifications: {pkg.max_certifications}</p>
                    <p className="text-sm text-gray-400">Languages: {pkg.max_languages}</p>
                    <p className="text-sm text-gray-400">Social links: {pkg.max_social_links}</p>
                  </div>

                  <div className="pt-3 space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      {pkg.has_stats ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <X className="w-4 h-4 text-red-400" />
                      )}
                      <span className="text-gray-300">Statistics</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      {pkg.has_priority ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <X className="w-4 h-4 text-red-400" />
                      )}
                      <span className="text-gray-300">Priority Support</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex gap-2">
                  <button
                    onClick={() => handleEdit(pkg)}
                    className="flex-1 px-3 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {/* Duplicate */}}
                    className="px-3 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Add Package Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-[#030014] rounded-2xl border border-white/10 max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Add New Package</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Name</label>
                  <input
                    type="text"
                    value={newPackage.name}
                    onChange={(e) => setNewPackage({ ...newPackage, name: e.target.value })}
                    className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white"
                    placeholder="e.g., Basic"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Arabic Name</label>
                  <input
                    type="text"
                    value={newPackage.name_ar}
                    onChange={(e) => setNewPackage({ ...newPackage, name_ar: e.target.value })}
                    className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white"
                    placeholder="مثلاً: أساسي"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Monthly Price ($)</label>
                  <input
                    type="number"
                    value={newPackage.price_monthly}
                    onChange={(e) => setNewPackage({ ...newPackage, price_monthly: parseFloat(e.target.value) })}
                    className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Yearly Price ($) (Optional)</label>
                  <input
                    type="number"
                    value={newPackage.price_yearly || ''}
                    onChange={(e) => setNewPackage({ ...newPackage, price_yearly: e.target.value ? parseFloat(e.target.value) : null })}
                    className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Max Projects</label>
                  <input
                    type="number"
                    value={newPackage.max_projects}
                    onChange={(e) => setNewPackage({ ...newPackage, max_projects: parseInt(e.target.value) })}
                    className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Max Skills</label>
                  <input
                    type="number"
                    value={newPackage.max_skills}
                    onChange={(e) => setNewPackage({ ...newPackage, max_skills: parseInt(e.target.value) })}
                    className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Max Experience</label>
                  <input
                    type="number"
                    value={newPackage.max_experience}
                    onChange={(e) => setNewPackage({ ...newPackage, max_experience: parseInt(e.target.value) })}
                    className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Max Education</label>
                  <input
                    type="number"
                    value={newPackage.max_education}
                    onChange={(e) => setNewPackage({ ...newPackage, max_education: parseInt(e.target.value) })}
                    className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Max Certifications</label>
                  <input
                    type="number"
                    value={newPackage.max_certifications}
                    onChange={(e) => setNewPackage({ ...newPackage, max_certifications: parseInt(e.target.value) })}
                    className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Max Languages</label>
                  <input
                    type="number"
                    value={newPackage.max_languages}
                    onChange={(e) => setNewPackage({ ...newPackage, max_languages: parseInt(e.target.value) })}
                    className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Max Social Links</label>
                <input
                  type="number"
                  value={newPackage.max_social_links}
                  onChange={(e) => setNewPackage({ ...newPackage, max_social_links: parseInt(e.target.value) })}
                  className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Team Members</label>
                <input
                  type="number"
                  value={newPackage.team_members}
                  onChange={(e) => setNewPackage({ ...newPackage, team_members: parseInt(e.target.value) })}
                  className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newPackage.has_stats}
                    onChange={(e) => setNewPackage({ ...newPackage, has_stats: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-gray-300">Enable Statistics</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newPackage.has_priority}
                    onChange={(e) => setNewPackage({ ...newPackage, has_priority: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-gray-300">Priority Support</span>
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={handleAdd}
                className="flex-1 py-3 bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white rounded-xl font-semibold hover:scale-[1.02] transition"
              >
                Create Package
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-3 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/20 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminPackages
