import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import { adminDeveloperService, adminPlanMonitorService } from '../../lib/adminService'
import { useAdminAuth } from '../../hooks/useAdminAuth'
import {
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Trash2,
  Crown,
  AlertCircle,
  Loader,
  MoreVertical,
  Mail,
  Phone,
  MapPin,
  Calendar,
  TrendingUp,
  Shield,
  UserCheck,
  UserX
} from 'lucide-react'

const Developers = () => {
  const { admin } = useAdminAuth()
  const [developers, setDevelopers] = useState([])
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(0)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [selectedDev, setSelectedDev] = useState(null)
  const [showDetails, setShowDetails] = useState(false)
  const [overages, setOverages] = useState([])
  const observerRef = useRef()

  // تحميل المطورين
  const loadDevelopers = async (pageNum, searchTerm = search, filterType = filter) => {
    if (loading) return
    
    setLoading(true)
    try {
      let result
      if (searchTerm) {
        result = await adminDeveloperService.searchDevelopers(searchTerm, pageNum, 20)
      } else {
        result = await adminDeveloperService.getAllDevelopers(pageNum, 20)
      }
      
      if (pageNum === 0) {
        setDevelopers(result.data)
      } else {
        setDevelopers(prev => [...prev, ...result.data])
      }
      
      setHasMore(result.hasMore)
      setTotal(result.count)
      setPage(pageNum)
    } catch (error) {
      console.error('Error loading developers:', error)
    } finally {
      setLoading(false)
    }
  }

  // تحميل المطورين المتجاوزين للحدود
  const loadOverages = async () => {
    try {
      const result = await adminPlanMonitorService.checkPlanOverages(0, 100)
      setOverages(result.data)
    } catch (error) {
      console.error('Error loading overages:', error)
    }
  }

  useEffect(() => {
    loadDevelopers(0)
    loadOverages()
  }, [])

  // البحث مع debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      loadDevelopers(0, search, filter)
    }, 500)

    return () => clearTimeout(timer)
  }, [search, filter])

  // Infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0]
        if (first.isIntersecting && hasMore && !loading) {
          loadDevelopers(page + 1, search, filter)
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
  }, [hasMore, loading, page, search, filter])

  const handleToggleStatus = async (devId, currentStatus) => {
    if (!window.confirm(`هل أنت متأكد من ${currentStatus ? 'تعطيل' : 'تفعيل'} هذا المطور؟`)) return
    
    try {
      await adminDeveloperService.toggleDeveloperStatus(devId, !currentStatus, admin.id)
      loadDevelopers(0, search, filter)
    } catch (error) {
      console.error('Error toggling status:', error)
      alert('حدث خطأ أثناء تحديث الحالة')
    }
  }

  const handleDelete = async (devId) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المطور؟ لا يمكن التراجع عن هذا الإجراء.')) return
    
    try {
      await adminDeveloperService.deleteDeveloper(devId)
      loadDevelopers(0, search, filter)
    } catch (error) {
      console.error('Error deleting developer:', error)
      alert('حدث خطأ أثناء الحذف')
    }
  }

  const getStatusBadge = (dev) => {
    const isOverLimit = overages.some(o => o.developer.id === dev.id)
    
    if (!dev.is_active) {
      return <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-xs">معطل</span>
    }
    if (isOverLimit) {
      return <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs flex items-center gap-1">
        <AlertCircle className="w-3 h-3" /> تجاوز الحدود
      </span>
    }
    return <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">نشط</span>
  }

  const filteredDevelopers = developers.filter(dev => {
    if (filter === 'active') return dev.is_active
    if (filter === 'inactive') return !dev.is_active
    if (filter === 'overLimit') return overages.some(o => o.developer.id === dev.id)
    return true
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">إدارة المطورين</h1>
        <div className="text-sm text-gray-400">
          الإجمالي: {total} مطور
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <p className="text-2xl font-bold text-white">{developers.filter(d => d.is_active).length}</p>
          <p className="text-xs text-gray-400">نشط</p>
        </div>
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <p className="text-2xl font-bold text-white">{developers.filter(d => !d.is_active).length}</p>
          <p className="text-xs text-gray-400">معطل</p>
        </div>
        <div className="bg-yellow-500/10 rounded-xl p-4 border border-yellow-500/20">
          <p className="text-2xl font-bold text-yellow-400">{overages.length}</p>
          <p className="text-xs text-gray-400">تجاوز الحدود</p>
        </div>
        <div className="bg-green-500/10 rounded-xl p-4 border border-green-500/20">
          <p className="text-2xl font-bold text-green-400">{developers.filter(d => d.plan_id > 1).length}</p>
          <p className="text-xs text-gray-400">مشتركين</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="بحث بالاسم أو البريد أو اسم المستخدم..."
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
          <option value="all">الكل</option>
          <option value="active">نشط</option>
          <option value="inactive">معطل</option>
          <option value="overLimit">تجاوز الحدود</option>
        </select>
      </div>

      {/* Developers Grid */}
      <div className="grid grid-cols-1 gap-4">
        {filteredDevelopers.map((dev) => {
          const isOverLimit = overages.some(o => o.developer.id === dev.id)
          const overageDetails = overages.find(o => o.developer.id === dev.id)
          
          return (
            <div
              key={dev.id}
              className={`bg-white/5 backdrop-blur-xl rounded-2xl p-6 border ${
                isOverLimit ? 'border-yellow-500/50' : 'border-white/10'
              } hover:border-purple-500/50 transition-all`}
            >
              <div className="flex flex-col md:flex-row gap-6">
                {/* Avatar & Basic Info */}
                <div className="flex items-start gap-4 flex-1">
                  <img
                    src={dev.profile_image || '/default-avatar.png'}
                    alt={dev.full_name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold text-white">{dev.full_name}</h3>
                      {getStatusBadge(dev)}
                    </div>
                    <p className="text-sm text-gray-400">@{dev.username}</p>
                    <p className="text-sm text-gray-400">{dev.email}</p>
                    
                    {/* Stats */}
                    <div className="flex items-center gap-4 mt-3 text-xs">
                      <span className="text-gray-500">📊 مشاريع: {dev.stats?.projects || 0}</span>
                      <span className="text-gray-500">🛠️ مهارات: {dev.stats?.skills || 0}</span>
                      <span className="text-gray-500">📜 شهادات: {dev.stats?.certificates || 0}</span>
                    </div>
                  </div>
                </div>

                {/* Plan Info */}
                <div className="md:w-48">
                  <div className="flex items-center gap-2 mb-2">
                    <Crown className={`w-4 h-4 ${
                      dev.plan_id === 1 ? 'text-gray-400' :
                      dev.plan_id === 2 ? 'text-blue-400' :
                      dev.plan_id === 3 ? 'text-yellow-400' : 'text-purple-400'
                    }`} />
                    <span className="text-white font-medium">{dev.plans?.name || 'مجانية'}</span>
                  </div>
                  
                  {/* Overage Warning */}
                  {isOverLimit && overageDetails && (
                    <div className="mt-2 p-2 bg-yellow-500/10 rounded-lg">
                      <p className="text-xs text-yellow-400 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        تجاوز في: {overageDetails.issues.join('، ')}
                      </p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Link
                    to={`/admin/developers/${dev.id}`}
                    className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg"
                    title="تفاصيل"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>
                  <a
                    href={`/u/${dev.username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-gray-400 hover:bg-white/10 rounded-lg"
                    title="عرض الملف الشخصي"
                  >
                    <Eye className="w-4 h-4" />
                  </a>
                  {dev.is_active ? (
                    <button
                      onClick={() => handleToggleStatus(dev.id, true)}
                      className="p-2 text-yellow-400 hover:bg-yellow-500/10 rounded-lg"
                      title="تعطيل"
                    >
                      <UserX className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleToggleStatus(dev.id, false)}
                      className="p-2 text-green-400 hover:bg-green-500/10 rounded-lg"
                      title="تفعيل"
                    >
                      <UserCheck className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(dev.id)}
                    className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg"
                    title="حذف"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Loading Indicator */}
      <div ref={observerRef} className="h-10 flex justify-center">
        {loading && (
          <Loader className="w-6 h-6 animate-spin text-purple-400" />
        )}
      </div>

      {/* No More Data */}
      {!hasMore && developers.length > 0 && (
        <p className="text-center text-gray-500 py-4">
          تم تحميل جميع المطورين ({developers.length} من {total})
        </p>
      )}
    </div>
  )
}

export default Developers
