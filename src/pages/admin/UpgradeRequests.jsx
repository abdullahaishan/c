import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { adminUpgradeRequestService, adminAnalyticsService } from '../../lib/adminService'
import {
  Crown,
  User,
  Calendar,
  CheckCircle,
  XCircle,
  Eye,
  AlertCircle,
  Package,
  TrendingUp,
  ArrowUp
} from 'lucide-react'

const AdminUpgradeRequests = () => {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [adminNote, setAdminNote] = useState('')
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    setLoading(true)
    const data = await adminUpgradeRequestService.getAllUpgradeRequests()
    setRequests(data)
    setLoading(false)
  }

  const handleApprove = async (request) => {
    if (!window.confirm(`Approve upgrade request from ${request.developers?.full_name}?`)) return
    
    setProcessing(true)
    try {
      const adminId = await adminAnalyticsService.getCurrentAdminId()
      await adminUpgradeRequestService.approveUpgradeRequest(request.id, adminId)
      await fetchRequests()
      setSelectedRequest(null)
    } catch (error) {
      console.error('Error approving request:', error)
      alert('Failed to approve request')
    } finally {
      setProcessing(false)
    }
  }

  const handleReject = async (request) => {
    if (!window.confirm(`Reject upgrade request from ${request.developers?.full_name}?`)) return
    
    setProcessing(true)
    try {
      const adminId = await adminAnalyticsService.getCurrentAdminId()
      await adminUpgradeRequestService.rejectUpgradeRequest(request.id, adminId, adminNote)
      await fetchRequests()
      setSelectedRequest(null)
      setAdminNote('')
    } catch (error) {
      console.error('Error rejecting request:', error)
      alert('Failed to reject request')
    } finally {
      setProcessing(false)
    }
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-400'
      case 'approved': return 'bg-green-500/20 text-green-400'
      case 'rejected': return 'bg-red-500/20 text-red-400'
      default: return 'bg-gray-500/20 text-gray-400'
    }
  }

  const pendingCount = requests.filter(r => r.status === 'pending').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Upgrade Requests</h1>
        <div className="flex items-center gap-3">
          <div className="bg-yellow-500/10 px-4 py-2 rounded-xl border border-yellow-500/20">
            <span className="text-2xl font-bold text-yellow-400">{pendingCount}</span>
            <span className="text-sm text-gray-400 ml-2">Pending</span>
          </div>
          <div className="bg-white/5 px-4 py-2 rounded-xl border border-white/10">
            <span className="text-2xl font-bold text-white">{requests.length}</span>
            <span className="text-sm text-gray-400 ml-2">Total</span>
          </div>
        </div>
      </div>

      {/* Requests List */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Loading requests...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-12">
            <Crown className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No upgrade requests found</p>
          </div>
        ) : (
          <div className="divide-y divide-white/10">
            {requests.map(req => (
              <div
                key={req.id}
                className={`p-6 hover:bg-white/5 transition ${
                  req.status === 'pending' ? 'bg-yellow-500/5' : ''
                }`}
                onClick={() => setSelectedRequest(req)}
              >
                <div className="flex items-start gap-4 cursor-pointer">
                  {/* Developer Avatar */}
                  <div className="relative">
                    <img
                      src={req.developers?.profile_image || '/default-avatar.png'}
                      alt={req.developers?.full_name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    {req.status === 'pending' && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full border-2 border-[#030014]" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-white font-semibold">{req.developers?.full_name}</h3>
                        <p className="text-sm text-gray-400">@{req.developers?.username}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(req.status)}`}>
                          {req.status}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(req.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Package className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-400">Current:</span>
                        <span className="text-white">{req.current_package_id?.name || 'Free'}</span>
                      </div>
                      <ArrowUp className="w-4 h-4 text-green-400" />
                      <div className="flex items-center gap-2 text-sm">
                        <Crown className="w-4 h-4 text-purple-400" />
                        <span className="text-gray-400">Requested:</span>
                        <span className="text-purple-400">{req.requested_package?.name}</span>
                      </div>
                    </div>

                    {req.payment_method && (
                      <p className="text-xs text-gray-500 mt-2">
                        Payment: {req.payment_method} • ${req.amount}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Request Details Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-[#030014] rounded-2xl border border-white/10 max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Upgrade Request Details</h2>
              <button
                onClick={() => setSelectedRequest(null)}
                className="p-2 text-gray-400 hover:text-white"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Developer Info */}
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <h3 className="text-sm font-medium text-gray-400 mb-3">Developer Information</h3>
                <div className="flex items-center gap-3">
                  <img
                    src={selectedRequest.developers?.profile_image || '/default-avatar.png'}
                    alt={selectedRequest.developers?.full_name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-white font-semibold">{selectedRequest.developers?.full_name}</p>
                    <p className="text-sm text-gray-400">@{selectedRequest.developers?.username}</p>
                    <p className="text-sm text-gray-400">{selectedRequest.developers?.email}</p>
                  </div>
                </div>
              </div>

              {/* Package Comparison */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <h3 className="text-sm font-medium text-gray-400 mb-3">Current Package</h3>
                  <p className="text-white font-semibold">{selectedRequest.current_package_id?.name || 'Free'}</p>
                  <p className="text-sm text-gray-400 mt-2">Price: ${selectedRequest.current_package_id?.price_monthly || 0}/mo</p>
                </div>
                <div className="bg-purple-500/10 rounded-xl p-4 border border-purple-500/20">
                  <h3 className="text-sm font-medium text-purple-400 mb-3">Requested Package</h3>
                  <p className="text-white font-semibold">{selectedRequest.requested_package?.name}</p>
                  <p className="text-sm text-gray-400 mt-2">Price: ${selectedRequest.requested_package?.price_monthly}/mo</p>
                </div>
              </div>

              {/* Payment Details */}
              {selectedRequest.payment_method && (
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <h3 className="text-sm font-medium text-gray-400 mb-3">Payment Details</h3>
                  <div className="space-y-2">
                    <p className="flex items-center justify-between">
                      <span className="text-gray-400">Method:</span>
                      <span className="text-white capitalize">{selectedRequest.payment_method}</span>
                    </p>
                    <p className="flex items-center justify-between">
                      <span className="text-gray-400">Amount:</span>
                      <span className="text-white font-semibold">${selectedRequest.amount}</span>
                    </p>
                    <p className="flex items-center justify-between">
                      <span className="text-gray-400">Type:</span>
                      <span className="text-white">{selectedRequest.subscription_type}</span>
                    </p>
                  </div>
                </div>
              )}

              {/* Admin Notes */}
              {selectedRequest.status === 'pending' && (
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <h3 className="text-sm font-medium text-gray-400 mb-3">Admin Notes</h3>
                  <textarea
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    placeholder="Add notes about this request (optional)"
                    rows="3"
                    className="w-full p-3 bg-white/5 border border-white/20 rounded-lg text-white resize-none"
                  />
                </div>
              )}

              {selectedRequest.admin_notes && (
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <h3 className="text-sm font-medium text-gray-400 mb-3">Admin Notes</h3>
                  <p className="text-white">{selectedRequest.admin_notes}</p>
                  {selectedRequest.processed_by && (
                    <p className="text-xs text-gray-500 mt-2">
                      Processed by: {selectedRequest.processed_by?.username}
                    </p>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              {selectedRequest.status === 'pending' && (
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => handleApprove(selectedRequest)}
                    disabled={processing}
                    className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold hover:scale-[1.02] transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Approve Upgrade
                  </button>
                  <button
                    onClick={() => handleReject(selectedRequest)}
                    disabled={processing}
                    className="flex-1 py-3 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-xl font-semibold hover:scale-[1.02] transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminUpgradeRequests
