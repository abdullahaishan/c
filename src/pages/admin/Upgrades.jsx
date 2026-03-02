import React, { useState, useEffect, useCallback, useRef } from 'react'
import { adminSubscriptionService, adminDeveloperService, adminNotificationService } from '../../lib/adminService'
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
  TrendingUp,
  ArrowUp,
  ArrowDown,
  Info
} from 'lucide-react'

const Upgrades = () => {
  const { admin } = useAdminAuth()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(0)
  const [total, setTotal] = useState(0)
  const [processingId, setProcessingId] = useState(null)
  const [rejectReason, setRejectReason] = useState('')
  const [showRejectModal, setShowRejectModal] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(null)
  const observerRef = useRef()

  useEffect(() => {
    loadRequests(0)
  }, [])

  const loadRequests = async (pageNum) => {
    if (loading && pageNum > 0) return
    
    setLoading(true)
    try {
      const result = await adminSubscriptionService.getAllUpgradeRequests(pageNum, 20)
      
      if (pageNum === 0) {
        setRequests(result.data)
      } else {
        setRequests(prev => [...prev, ...result.data])
      }
      
      setHasMore(result.hasMore)
      setTotal(result.count)
      setPage(pageNum)
    } catch (error) {
      console.error('Error loading upgrade requests:', error)
    } finally {
      setLoading(false)
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

  const handleApprove = async (request) => {
    setProcessingId(request.id)
    try {
      await adminSubscriptionService.approveUpgradeRequest(request.id, admin.id)
      await loadRequests(0)
    } catch (error) {
      console.error('Error approving upgrade:', error)
      alert('حدث خطأ أثناء الموافقة على الترقية')
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async (request) => {
    setProcessingId(request.id)
    try {
      await adminSubscriptionService.rejectUpgradeRequest(request.id, admin.id, rejectReason)
      setShowRejectModal(null)
      setRejectReason('')
      await loadRequests(0)
    } catch (error) {
      console.error('Error rejecting upgrade:', error)
      alert('حدث خطأ أثناء رفض الترقية')
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
        <h1 className="text-2xl font-bold text-white">طلبات الترقية</h1>
        <div className="flex items-center gap-3">
          <div className="bg-yellow-500/10 px-4 py-2 rounded-xl border border-yellow-500/20">
            <span className="text-2xl font-bold text-yellow-400">
              {requests.filter(r => r.status === 'pending').length}
            </span>
            <span className="text-sm text-gray-400 mr-2">معلق</span>
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
            <TrendingUp className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">لا توجد طلبات ترقية</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 text-right text-sm font-medium text-gray-400">المستخدم</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-gray-400">الباقة الحالية</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-gray-400">الباقة المطلوبة</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-gray-400">الفرق</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-gray-400">التاريخ</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-gray-400">الحالة</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-gray-400">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {requests.map((request) => {
                  const priceDiff = (request.requested_plan?.price_monthly || 0) - (request.current_plan?.price_monthly || 0)
                  
                  return (
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
                          <Crown className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-300">{request.current_plan?.name || 'مجانية'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Crown className="w-4 h-4 text-yellow-400" />
                          <span className="text-white">{request.requested_plan?.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`flex items-center gap-1 ${
                          priceDiff > 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {priceDiff > 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                          <span>${Math.abs(priceDiff)}</span>
                        </div>
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
                          <button
                            onClick={() => setShowDetailsModal(request)}
                            className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg"
                            title="تفاصيل"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          
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
                  )
                })}
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

      {/* Details Modal */}
      {showDetailsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-gray-900 rounded-2xl max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">تفاصيل طلب الترقية</h3>
              <button
                onClick={() => setShowDetailsModal(null)}
                className="p-2 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Developer Info */}
              <div className="bg-white/5 rounded-xl p-4">
                <h4 className="text-sm text-gray-400 mb-2">المطور</h4>
                <div className="flex items-center gap-3">
                  <img
                    src={showDetailsModal.developers?.profile_image || '/default-avatar.png'}
                    alt={showDetailsModal.developers?.full_name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-white font-medium">{showDetailsModal.developers?.full_name}</p>
                    <p className="text-sm text-gray-400">@{showDetailsModal.developers?.username}</p>
                    <p className="text-xs text-gray-500">{showDetailsModal.developers?.email}</p>
                  </div>
                </div>
              </div>

              {/* Plan Comparison */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-xl p-4">
                  <h4 className="text-sm text-gray-400 mb-3">الباقة الحالية</h4>
                  <p className="text-white font-semibold">{showDetailsModal.current_plan?.name || 'مجانية'}</p>
                  <p className="text-2xl font-bold text-white mt-2">
                    ${showDetailsModal.current_plan?.price_monthly || 0}
                  </p>
                  <p className="text-xs text-gray-400">شهرياً</p>
                </div>

                <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl p-4 border border-purple-500/30">
                  <h4 className="text-sm text-purple-400 mb-3">الباقة المطلوبة</h4>
                  <p className="text-white font-semibold">{showDetailsModal.requested_plan?.name}</p>
                  <p className="text-2xl font-bold text-white mt-2">
                    ${showDetailsModal.requested_plan?.price_monthly}
                  </p>
                  <p className="text-xs text-gray-400">شهرياً</p>
                </div>
              </div>

              {/* Limits Comparison */}
              {showDetailsModal.requested_plan && (
                <div className="bg-white/5 rounded-xl p-4">
                  <h4 className="text-sm text-gray-400 mb-3">مقارنة الحدود</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">المشاريع</span>
                      <span className="text-white">
                        {showDetailsModal.current_plan?.max_projects || 3} → {showDetailsModal.requested_plan.max_projects}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">المهارات</span>
                      <span className="text-white">
                        {showDetailsModal.current_plan?.max_skills || 10} → {showDetailsModal.requested_plan.max_skills}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">الشهادات</span>
                      <span className="text-white">
                        {showDetailsModal.current_plan?.max_certificates || 3} → {showDetailsModal.requested_plan.max_certificates}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Info */}
              {showDetailsModal.payment_method && (
                <div className="bg-white/5 rounded-xl p-4">
                  <h4 className="text-sm text-gray-400 mb-2">معلومات الدفع</h4>
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-green-400" />
                    <span className="text-white capitalize">{showDetailsModal.payment_method}</span>
                    {showDetailsModal.amount && (
                      <span className="text-white font-bold mr-auto">${showDetailsModal.amount}</span>
                    )}
                  </div>
                </div>
              )}

              <button
                onClick={() => setShowDetailsModal(null)}
                className="w-full py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-white mb-4">رفض طلب الترقية</h3>
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

export default Upgrades
