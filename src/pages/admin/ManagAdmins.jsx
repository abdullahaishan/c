
// src/pages/admin/ManageAdmins.jsx
import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { 
  UserPlus, 
  Shield, 
  Crown, 
  Star,
  Trash2,
  CheckCircle,
  XCircle,
  Search
} from 'lucide-react'

const ManageAdmins = () => {
  const [developers, setDevelopers] = useState([])
  const [admins, setAdmins] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedDev, setSelectedDev] = useState(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    
    // جلب جميع المطورين
    const { data: devs } = await supabase
      .from('developers')
      .select('id, username, email, full_name, profile_image, role, plan_id')
      .order('created_at', { ascending: false })

    // جلب جميع الأدمن
    const { data: adminList } = await supabase
      .from('admins')
      .select('*, developers(*)')

    setDevelopers(devs || [])
    setAdmins(adminList || [])
    setLoading(false)
  }

  const promoteToAdmin = async (developer, role, permissions = []) => {
    try {
      // استدعاء دالة PostgreSQL
      const { error } = await supabase
        .rpc('promote_to_admin', {
          target_developer_id: developer.id,
          admin_role: role,
          admin_permissions: permissions,
          created_by_id: admin.id
        })

      if (error) throw error
      
      setShowAddModal(false)
      fetchData()
    } catch (error) {
      console.error('Error promoting to admin:', error)
      alert('Failed to promote user')
    }
  }

  const demoteFromAdmin = async (developerId) => {
    if (!confirm('Are you sure you want to remove admin privileges?')) return

    try {
      const { error } = await supabase
        .rpc('demote_from_admin', {
          target_developer_id: developerId
        })

      if (error) throw error
      
      fetchData()
    } catch (error) {
      console.error('Error demoting admin:', error)
      alert('Failed to demote user')
    }
  }

  const adminIds = admins.map(a => a.developer_id)
  const nonAdmins = developers.filter(d => !adminIds.includes(d.id))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Manage Administrators</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white rounded-lg"
        >
          <UserPlus className="w-4 h-4" />
          Add Admin
        </button>
      </div>

      {/* Current Admins */}
      <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
        <h2 className="text-lg font-semibold text-white mb-4">Current Administrators</h2>
        <div className="space-y-3">
          {admins.map(admin => (
            <div key={admin.developer_id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
              <div className="flex items-center gap-3">
                <img
                  src={admin.developers?.profile_image || '/default-avatar.png'}
                  alt={admin.developers?.full_name}
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <p className="text-white font-medium">{admin.developers?.full_name}</p>
                  <p className="text-sm text-gray-400">@{admin.developers?.username}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-sm ${
                  admin.role === 'super_admin' ? 'bg-purple-500/20 text-purple-400' :
                  admin.role === 'admin' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-green-500/20 text-green-400'
                }`}>
                  {admin.role}
                </span>
                <button
                  onClick={() => demoteFromAdmin(admin.developer_id)}
                  className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Admin Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-[#030014] rounded-2xl p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-white mb-4">Select Developer to Promote</h2>
            
            <input
              type="text"
              placeholder="Search developers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white mb-4"
            />

            <div className="max-h-96 overflow-y-auto space-y-2">
              {nonAdmins
                .filter(d => 
                  d.full_name?.toLowerCase().includes(search.toLowerCase()) ||
                  d.username?.toLowerCase().includes(search.toLowerCase()) ||
                  d.email?.toLowerCase().includes(search.toLowerCase())
                )
                .map(dev => (
                  <button
                    key={dev.id}
                    onClick={() => setSelectedDev(dev)}
                    className="w-full flex items-center gap-3 p-3 bg-white/5 rounded-xl hover:bg-white/10 text-left"
                  >
                    <img
                      src={dev.profile_image || '/default-avatar.png'}
                      alt={dev.full_name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="flex-1">
                      <p className="text-white font-medium">{dev.full_name}</p>
                      <p className="text-sm text-gray-400">@{dev.username}</p>
                    </div>
                  </button>
                ))}
            </div>

            {selectedDev && (
              <div className="mt-4 p-4 bg-purple-500/10 rounded-xl">
                <p className="text-white mb-3">Promote <span className="text-purple-400">{selectedDev.full_name}</span> to:</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => promoteToAdmin(selectedDev, 'admin', [])}
                    className="flex-1 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30"
                  >
                    Admin
                  </button>
                  <button
                    onClick={() => promoteToAdmin(selectedDev, 'super_admin', [])}
                    className="flex-1 py-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30"
                  >
                    Super Admin
                  </button>
                  <button
                    onClick={() => promoteToAdmin(selectedDev, 'moderator', [])}
                    className="flex-1 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30"
                  >
                    Moderator
                  </button>
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-2 bg-white/10 text-white rounded-lg"
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

export default ManageAdmins
