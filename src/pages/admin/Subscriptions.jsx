import React, { useState, useEffect, useCallback, useRef } from 'react'
import { adminSubscriptionService } from '../../lib/adminService'
import { useAdminAuth } from '../../hooks/useAdminAuth'
import {
  CheckCircle,
  XCircle,
  Eye,
  Clock,
  User,
  Calendar,
  CreditCard,
  Crown,
  AlertCircle,
  Check,
  X,
  Loader,
  Download,
  Image as ImageIcon
} from 'lucide-react'

const Subscriptions = () => {
  const { admin } = useAdminAuth()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(0)
  const [total, setTotal] = useState(0)
  const [selectedImage, setSelectedImage] = useState(null)
  const [processingId, setProcessingId] = useState(null)
  const [rejectReason, setRejectReason] = useState('')
  const [showRejectModal, setShowRejectModal] = useState(null)
  const [stats, setStats] = useState({
    pendingSubscriptions: 0,
    pendingUpgrades: 0,
    activeSubscribers: 0,
    totalRevenue: 0
  })
  const observerRef = useRef()

  useEffect(() => {
    loadRequests(0)
    loadStats()
  }, [])

  const loadRequests = async (pageNum) => {
    if (loading && pageNum > 0) return
    
    setLoading(true)
    try {
      const result = await adminSubscriptionService.getAllSubscriptions(pageNum, 20)
      
      if (pageNum === 0) {
        setRequests(result.data)
      } else {
        setRequests(prev => [...prev, ...result.data])
      }
      
      setHasMore(result.hasMore)
      setTotal(result.count)
      setPage(pageNum)
    } catch (error) {
      console.error('Error loading subscriptions:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const data = await adminSubscriptionService.getSubscriptionStats()
      setStats(data)
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  // Infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0]
        if (first.isIntersecting && hasMore && !loading) {
          loadRequests(page + 1)
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    )

    const currentObserver = observerRef.current
    if (currentObserver) {
      observer.observe(currentObserver)
    }

    return () => {
      if (currentObserver) {
        observer.unobserve(currentObserver)
      }
    }
  }, [hasMore, loading, page])

  const handleApprove = async (payment) => {
    setProcessingId(payment.id)
    try {
      await adminSubscriptionService.approveSubscription(payment.id, admin.id)
      await loadRequests(0)
      await loadStats()
    } catch (error) {
      console.error('Error approving:', error)
      alert('حدث خطأ أثناء الموافقة')
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async (payment) => {
    setProcessingId(payment.id)
    try {
      await adminSubscriptionService.rejectSubscription(payment.id, admin.id, rejectReason)
      setShowRejectModal(null)
      setRejectReason('')
      await loadRequests(0)
      await loadStats()
    } catch (error) {
      console.error('Error rejecting:', error)
      alert('حدث خطأ أثناء الرفض')
    } finally {
      setProcessingId(null)
    }
  }

  const getStatusBadge = (status) => {
    switch(status) {
      case 'pending':
        return <span className="flex items-center gap-1 px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm">
          <Clock className="w-4 h-4" /> قيد الانتظار
        </span>
      case 'approved':
        return <span className="flex items-center gap-1 px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
          <CheckCircle className="w-4 h-4" /> تمت الموافقة
        </span>
      case 'rejected':
        return <span className="flex items-center gap-1 px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm">
          <XCircle className="w-4 h-4" /> مرفوض
        </span>
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">طلبات الاشتراك</h1>
        <div className="flex items-center gap-3">
          <div className="bg-yellow-500/10 px-4 py-2 rounded-xl border border-yellow-500/20">
            <span className="text-2xl font-bold text-yellow-400">{stats.pendingSubscriptions}</span>
            <span className="text-sm text-gray-400 mr-2">معلق</span>
          </div>
          <div className="bg-green-500/10 px-4 py-2 rounded-xl border border-green-500/20">
            <span className="text-2xl font-bold text-green-400">${stats.totalRevenue}</span>
            <span className="text-sm text-gray-400 mr-2">إيرادات</span>
          </div>
          <div className="bg-white/5 px-4 py-2 rounded-xl border border-white/10">
            <span className="text-2xl font-bold text-white">{total}</span>
            <span className="text-sm text-gray-400 mr-2">إجمالي</span>
          </div>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
        {loading && page === 0 ? (
          <div className="text-center py-12">
            <Loader className="w-12 h-12 animate-spin text-purple-400 mx-auto mb-4" />
            <p className="text-gray-400">جاري تحميل الطلبات...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-12">
            <CreditCard className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">لا توجد طلبات اشتراك</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 text-right text-sm font-medium text-gray-400">المستخدم</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-gray-400">الباقة</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-gray-400">المبلغ</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-gray-400">طريقة الدفع</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-gray-400">التاريخ</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-gray-400">الحالة</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-gray-400">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {requests.map((request) => (
                  <tr key={request.id} className="hover:bg-white/5">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={request.developers?.profile_image || '/default-avatar.png'}
                          alt={request.developers?.full_name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <p className="text-white font-medium">{request.developers?.full_name}</p>
                          <p className="text-sm text-gray-400">@{request.developers?.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Crown className="w-4 h-4 text-purple-400" />
                        <span className="text-white">{request.plans?.name_ar || request.plans?.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-white font-bold">${request.amount}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-300 capitalize">{request.payment_method}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-400">
                        {new Date(request.created_at).toLocaleDateString('ar-EG')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(request.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {request.transaction_image && (
                          <button
                            onClick={() => setSelectedImage(request.transaction_image)}
                            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg"
                            title="عرض صورة التحويل"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}
                        
                        {request.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(request)}
                              disabled={processingId === request.id}
                              className="p-2 text-green-400 hover:bg-green-500/10 rounded-lg disabled:opacity-50"
                              title="موافقة"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setShowRejectModal(request)}
                              disabled={processingId === request.id}
                              className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg disabled:opacity-50"
                              title="رفض"
                            >
                              <X className="w-4 h-4" />
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
        )}
      </div>

      {/* Loading Indicator */}
      <div ref={observerRef} className="h-10 flex justify-center">
        {loading && page > 0 && (
          <Loader className="w-6 h-6 animate-spin text-purple-400" />
        )}
      </div>

      {/* Image Preview Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <img
            src={selectedImage}
            alt="Payment proof"
            className="max-w-full max-h-full rounded-lg"
          />
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-white mb-4">رفض طلب الاشتراك</h3>
            <p className="text-gray-400 mb-4">
              هل أنت متأكد من رفض طلب {showRejectModal.developers?.full_name}؟
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="سبب الرفض (اختياري)"
              className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white mb-4"
              rows="3"
            />
            <div className="flex gap-3">
              <button
                onClick={() => handleReject(showRejectModal)}
                disabled={processingId === showRejectModal.id}
                className="flex-1 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
              >
                {processingId === showRejectModal.id ? 'جاري...' : 'تأكيد الرفض'}
              </button>
              <button
                onClick={() => {
                  setShowRejectModal(null)
                  setRejectReason('')
                }}
                className="flex-1 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Subscriptions
