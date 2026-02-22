// src/pages/admin/Payments.jsx
import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { CheckCircle, XCircle, Eye, Download, AlertCircle } from 'lucide-react'

const Payments = () => {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(null)

  useEffect(() => {
    fetchPayments()
  }, [])

  const fetchPayments = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('payments')
      .select(`
        *,
        developers (full_name, username, email),
        plans (name)
      `)
      .order('created_at', { ascending: false })
    setPayments(data || [])
    setLoading(false)
  }

  // عند الموافقة على الدفع
const handleApprove = async (paymentId) => {
  // 1. تحديث حالة الدفع
  await supabase
    .from('payments')
    .update({ status: 'approved' })
    .eq('id', paymentId)
  
  // 2. ترقية حساب المطور
  await supabase
    .from('developers')
    .update({ 
      plan_id: payment.plan_id,
      plan_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 يوم
    })
    .eq('id', payment.user_id)
}

  const handleReject = async (id) => {
    await supabase
      .from('payments')
      .update({ status: 'rejected' })
      .eq('id', id)
    fetchPayments()
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-400'
      case 'approved': return 'bg-green-500/20 text-green-400'
      case 'rejected': return 'bg-red-500/20 text-red-400'
      default: return 'bg-gray-500/20 text-gray-400'
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Payment Requests</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white/5 rounded-xl p-6">
          <p className="text-3xl font-bold text-white">{payments.length}</p>
          <p className="text-sm text-gray-400">Total Payments</p>
        </div>
        <div className="bg-yellow-500/10 rounded-xl p-6">
          <p className="text-3xl font-bold text-yellow-400">
            {payments.filter(p => p.status === 'pending').length}
          </p>
          <p className="text-sm text-gray-400">Pending</p>
        </div>
        <div className="bg-green-500/10 rounded-xl p-6">
          <p className="text-3xl font-bold text-green-400">
            {payments.filter(p => p.status === 'approved').length}
          </p>
          <p className="text-sm text-gray-400">Approved</p>
        </div>
        <div className="bg-red-500/10 rounded-xl p-6">
          <p className="text-3xl font-bold text-red-400">
            {payments.filter(p => p.status === 'rejected').length}
          </p>
          <p className="text-sm text-gray-400">Rejected</p>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
        <table className="w-full">
          <thead className="border-b border-white/10">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Developer</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Plan</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Amount</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Method</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Status</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Date</th>
              <th className="px-6 py-4 text-right text-sm font-medium text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {payments.map(payment => (
              <tr key={payment.id} className="hover:bg-white/5">
                <td className="px-6 py-4">
                  <div>
                    <p className="text-white font-medium">{payment.developers?.full_name}</p>
                    <p className="text-sm text-gray-400">@{payment.developers?.username}</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-white">{payment.plans?.name}</td>
                <td className="px-6 py-4 text-white">${payment.amount}</td>
                <td className="px-6 py-4">
                  <span className="capitalize text-gray-300">{payment.payment_method}</span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(payment.status)}`}>
                    {payment.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-400">
                  {new Date(payment.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {payment.transaction_image && (
                      <button
                        onClick={() => setSelectedImage(payment.transaction_image)}
                        className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    )}
                    {payment.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApprove(payment.id)}
                          className="p-2 text-green-400 hover:bg-green-500/10 rounded-lg"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleReject(payment.id)}
                          className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <img
            src={selectedImage}
            alt="Payment proof"
            className="max-w-full max-h-full rounded-lg"
          />
        </div>
      )}
    </div>
  )
}

export default Payments