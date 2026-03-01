import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import {
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Crown,
  Mail,
  Phone,
  MapPin,
  Calendar,
  MoreVertical,
  UserCheck,
  UserX
} from 'lucide-react'
import { Link } from 'react-router-dom'

const AdminDevelopers = () => {
  const [developers, setDevelopers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [selectedDev, setSelectedDev] = useState(null)

  useEffect(() => {
    fetchDevelopers()
  }, [])

  const fetchDevelopers = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('developers')
      .select(`
        *,
        packages (name, name_ar),
        payments (count),
        cv_downloads (count),
        developer_visitors (count)
      `)
      .order('created_at', { ascending: false })

    if (!error) setDevelopers(data || [])
    setLoading(false)
  }

  const handleStatusChange = async (id, status) => {
    await supabase
      .from('developers')
      .update({ subscription_status: status })
      .eq('id', id)
    fetchDevelopers()
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure? This will delete all developer data.')) return
    await supabase
      .from('developers')
      .delete()
      .eq('id', id)
    fetchDevelopers()
  }

  const filteredDevelopers = developers.filter(dev => {
    if (filter === 'active') return dev.subscription_status === 'active'
    if (filter === 'inactive') return dev.subscription_status !== 'active'
    if (filter === 'pending') return !dev.approved_by
    return true
  }).filter(dev =>
    dev.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    dev.email?.toLowerCase().includes(search.toLowerCase()) ||
    dev.username?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Manage Developers</h1>
        <div className="text-sm text-gray-400">
          Total: {developers.length} developers
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search developers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
        >
          <option value="all">All Developers</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="pending">Pending Approval</option>
        </select>
      </div>

      {/* Developers Table */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Loading developers...</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="border-b border-white/10">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Developer</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Package</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Status</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Stats</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Joined</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredDevelopers.map(dev => (
                <tr key={dev.id} className="hover:bg-white/5">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={dev.profile_image || '/default-avatar.png'}
                        alt={dev.full_name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="text-white font-medium">{dev.full_name || 'Unnamed'}</p>
                        <p className="text-sm text-gray-400">@{dev.username}</p>
                        <p className="text-xs text-gray-500">{dev.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {dev.packages ? (
                      <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm">
                        {dev.packages.name}
                      </span>
                    ) : (
                      <span className="text-gray-500">Free</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {dev.subscription_status === 'active' ? (
                      <span className="flex items-center gap-1 text-green-400">
                        <CheckCircle className="w-4 h-4" />
                        Active
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-red-400">
                        <XCircle className="w-4 h-4" />
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1 text-sm">
                      <p className="text-gray-400">Projects: {dev.projects_count || 0}</p>
                      <p className="text-gray-400">Skills: {dev.skills_count || 0}</p>
                      <p className="text-gray-400">Views: {dev.visitors_count || 0}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-400">
                    {new Date(dev.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        to={`/u/${dev.username}`}
                        target="_blank"
                        className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      {dev.subscription_status === 'active' ? (
                        <button
                          onClick={() => handleStatusChange(dev.id, 'inactive')}
                          className="p-2 text-yellow-400 hover:bg-yellow-500/10 rounded-lg"
                        >
                          <UserX className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStatusChange(dev.id, 'active')}
                          className="p-2 text-green-400 hover:bg-green-500/10 rounded-lg"
                        >
                          <UserCheck className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(dev.id)}
                        className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default AdminDevelopers
