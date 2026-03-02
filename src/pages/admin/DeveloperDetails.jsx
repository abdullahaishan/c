import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { adminDeveloperService, adminPlanService, adminNotificationService } from '../../lib/adminService'
import { useAdminAuth } from '../../hooks/useAdminAuth'
import {
  ArrowLeft,
  Crown,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Globe,
  Github,
  Linkedin,
  Twitter,
  MessageCircle,
  Copy,
  CheckCircle,
  XCircle,
  AlertCircle,
  Save,
  Edit,
  User,
  Briefcase,
  Award,
  GraduationCap,
  FolderKanban,
  Code,
  ExternalLink
} from 'lucide-react'

const DeveloperDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { admin } = useAdminAuth()
  const [developer, setDeveloper] = useState(null)
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    loadData()
  }, [id])

  const loadData = async () => {
    setLoading(true)
    try {
      const [devData, plansData] = await Promise.all([
        adminDeveloperService.getDeveloperDetails(id),
        adminPlanService.getAllPlans(0, 100)
      ])
      setDeveloper(devData)
      setPlans(plansData.data)
      setSelectedPlan(devData.plan_id)
    } catch (error) {
      console.error('Error loading developer details:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChangePlan = async () => {
    if (!selectedPlan || selectedPlan === developer.plan_id) {
      setEditing(false)
      return
    }

    setSaving(true)
    try {
      await adminDeveloperService.updateDeveloperPlan(developer.id, selectedPlan, admin.id)
      
      // إرسال إشعار للمطور
      const plan = plans.find(p => p.id === selectedPlan)
      await adminNotificationService.sendToDeveloper(developer.id, {
        title: 'تم تحديث باقتك',
        message: `تم تغيير باقتك إلى ${plan?.name_ar || plan?.name}`,
        type: 'info'
      })

      await loadData()
      setEditing(false)
    } catch (error) {
      console.error('Error changing plan:', error)
      alert('حدث خطأ أثناء تغيير الباقة')
    } finally {
      setSaving(false)
    }
  }

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(developer.email)
    alert('✅ تم نسخ البريد الإلكتروني')
  }

  const handleCopyProfile = () => {
    const url = `${window.location.origin}/u/${developer.username}`
    navigator.clipboard.writeText(url)
    alert('✅ تم نسخ رابط الملف الشخصي')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
      </div>
    )
  }

  if (!developer) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">المطور غير موجود</p>
      </div>
    )
  }

  const currentPlan = plans.find(p => p.id === developer.plan_id)

  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/admin/developers')}
          className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-white">تفاصيل المطور</h1>
      </div>

      {/* Profile Card */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Avatar */}
          <div className="relative">
            <img
              src={developer.profile_image || '/default-avatar.png'}
              alt={developer.full_name}
              className="w-24 h-24 md:w-32 md:h-32 rounded-2xl object-cover border-4 border-purple-500/30"
            />
            <div className={`absolute -bottom-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center ${
              developer.is_active ? 'bg-green-500' : 'bg-red-500'
            }`}>
              {developer.is_active ? (
                <CheckCircle className="w-4 h-4 text-white" />
              ) : (
                <XCircle className="w-4 h-4 text-white" />
              )}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">{developer.full_name}</h2>
                <p className="text-purple-400">@{developer.username}</p>
                <p className="text-gray-400 mt-1">{developer.title || 'مطور'}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyProfile}
                  className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg"
                  title="نسخ الرابط"
                >
                  <Copy className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Bio */}
            {developer.bio && (
              <p className="text-gray-300 mt-4 text-sm">{developer.bio}</p>
            )}
          </div>
        </div>

        {/* Contact Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="flex items-center gap-2 p-3 bg-white/5 rounded-lg">
            <Mail className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-gray-300 flex-1">{developer.email}</span>
            <button
              onClick={handleCopyEmail}
              className="p-1 text-gray-400 hover:text-white"
            >
              <Copy className="w-3 h-3" />
            </button>
          </div>
          {developer.phone && (
            <div className="flex items-center gap-2 p-3 bg-white/5 rounded-lg">
              <Phone className="w-4 h-4 text-green-400" />
              <span className="text-sm text-gray-300">{developer.phone}</span>
            </div>
          )}
          {developer.location && (
            <div className="flex items-center gap-2 p-3 bg-white/5 rounded-lg">
              <MapPin className="w-4 h-4 text-red-400" />
              <span className="text-sm text-gray-300">{developer.location}</span>
            </div>
          )}
        </div>
      </div>

      {/* Plan Management */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
        <h2 className="text-lg font-semibold text-white mb-4">إدارة الباقة</h2>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Crown className={`w-5 h-5 ${
              currentPlan?.id === 1 ? 'text-gray-400' :
              currentPlan?.id === 2 ? 'text-blue-400' :
              currentPlan?.id === 3 ? 'text-yellow-400' : 'text-purple-400'
            }`} />
            <span className="text-white font-medium">الباقة الحالية:</span>
            <span className="text-purple-400">{currentPlan?.name_ar || currentPlan?.name}</span>
          </div>

          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              تغيير الباقة
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <select
                value={selectedPlan}
                onChange={(e) => setSelectedPlan(Number(e.target.value))}
                className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
              >
                {plans.map(plan => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name_ar || plan.name} - ${plan.price_monthly}/شهر
                  </option>
                ))}
              </select>
              <button
                onClick={handleChangePlan}
                disabled={saving}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                حفظ
              </button>
              <button
                onClick={() => {
                  setEditing(false)
                  setSelectedPlan(developer.plan_id)
                }}
                className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition"
              >
                إلغاء
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-4">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-lg transition ${
            activeTab === 'overview'
              ? 'bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          نظرة عامة
        </button>
        <button
          onClick={() => setActiveTab('projects')}
          className={`px-4 py-2 rounded-lg transition ${
            activeTab === 'projects'
              ? 'bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          المشاريع ({developer.projects?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('skills')}
          className={`px-4 py-2 rounded-lg transition ${
            activeTab === 'skills'
              ? 'bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          المهارات ({developer.skills?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('certificates')}
          className={`px-4 py-2 rounded-lg transition ${
            activeTab === 'certificates'
              ? 'bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          الشهادات ({developer.certificates?.length || 0})
        </button>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Experience */}
            {developer.experience?.length > 0 && (
              <div>
                <h3 className="text-md font-medium text-white mb-3 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-purple-400" />
                  الخبرات
                </h3>
                <div className="space-y-3">
                  {developer.experience.map((exp, idx) => (
                    <div key={idx} className="bg-white/5 rounded-lg p-4">
                      <h4 className="text-white font-medium">{exp.job_title}</h4>
                      <p className="text-sm text-gray-400">{exp.company}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {exp.start_date} - {exp.is_current ? 'حالياً' : exp.end_date}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {developer.education?.length > 0 && (
              <div>
                <h3 className="text-md font-medium text-white mb-3 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-blue-400" />
                  التعليم
                </h3>
                <div className="space-y-3">
                  {developer.education.map((edu, idx) => (
                    <div key={idx} className="bg-white/5 rounded-lg p-4">
                      <h4 className="text-white font-medium">{edu.degree}</h4>
                      <p className="text-sm text-gray-400">{edu.institution}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Social Links */}
            {developer.social_links?.length > 0 && (
              <div>
                <h3 className="text-md font-medium text-white mb-3">روابط التواصل</h3>
                <div className="flex flex-wrap gap-2">
                  {developer.social_links.map((link, idx) => (
                    <a
                      key={idx}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition"
                    >
                      {link.platform === 'github' && <Github className="w-4 h-4" />}
                      {link.platform === 'linkedin' && <Linkedin className="w-4 h-4" />}
                      {link.platform === 'twitter' && <Twitter className="w-4 h-4" />}
                      <span className="text-sm text-gray-300">{link.platform}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'projects' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {developer.projects?.map((project) => (
              <div key={project.id} className="bg-white/5 rounded-lg p-4">
                <h4 className="text-white font-medium">{project.title}</h4>
                <p className="text-sm text-gray-400 mt-1 line-clamp-2">{project.description}</p>
                <div className="flex items-center gap-3 mt-3">
                  {project.live_url && (
                    <a href={project.live_url} target="_blank" rel="noopener noreferrer" className="text-xs text-purple-400 hover:underline flex items-center gap-1">
                      <ExternalLink className="w-3 h-3" /> معاينة
                    </a>
                  )}
                  {project.github_url && (
                    <a href={project.github_url} target="_blank" rel="noopener noreferrer" className="text-xs text-gray-400 hover:text-white flex items-center gap-1">
                      <Github className="w-3 h-3" /> GitHub
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'skills' && (
          <div className="flex flex-wrap gap-2">
            {developer.skills?.map((skill) => (
              <span key={skill.id} className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-lg text-sm">
                {skill.name} {skill.proficiency ? `(${skill.proficiency}%)` : ''}
              </span>
            ))}
          </div>
        )}

        {activeTab === 'certificates' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {developer.certificates?.map((cert) => (
              <div key={cert.id} className="bg-white/5 rounded-lg p-4">
                {cert.image && (
                  <img src={cert.image} alt={cert.name} className="w-full h-32 object-cover rounded-lg mb-3" />
                )}
                <h4 className="text-white font-medium">{cert.name}</h4>
                <p className="text-sm text-gray-400">{cert.issuer}</p>
                {cert.credential_url && (
                  <a href={cert.credential_url} target="_blank" rel="noopener noreferrer" className="text-xs text-purple-400 hover:underline mt-2 inline-block">
                    عرض الشهادة
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default DeveloperDetails
