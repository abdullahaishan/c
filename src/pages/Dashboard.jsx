import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { portfolioService, planService } from '../services/supabase';
import {
  LayoutDashboard,
  FolderKanban,
  Award,
  GraduationCap,
  Briefcase,
  Settings,
  Eye,
  Edit,
  Trash2,
  Plus,
  Save,
  X,
  Sparkles,
  ExternalLink,
  BarChart3,
  Users,
  MessageSquare,
  DollarSign,
  Calendar,
  TrendingUp
} from 'lucide-react';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadPortfolio();
  }, [user]);

  const loadPortfolio = async () => {
    try {
      const data = await portfolioService.getUserPortfolio(user.id);
      if (data) {
        setPortfolio(data);
        setFormData(data);
      } else {
        // لا يوجد بورتفليو بعد، توجه إلى صفحة الإنشاء
        navigate('/app/builder');
      }
    } catch (error) {
      console.error('Error loading portfolio:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await portfolioService.updatePortfolio(portfolio.id, formData);
      setPortfolio({ ...portfolio, ...formData });
      setEditing(false);
    } catch (error) {
      console.error('Error saving:', error);
    }
  };

  const handlePublish = async () => {
    try {
      await portfolioService.publishPortfolio(portfolio.id);
      setPortfolio({ ...portfolio, is_published: true });
    } catch (error) {
      console.error('Error publishing:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030014] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030014]">
      {/* Header */}
      <div className="bg-white/5 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-white">لوحة التحكم</h1>
              {portfolio?.is_published ? (
                <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm border border-green-500/30">
                  منشور
                </span>
              ) : (
                <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm border border-yellow-500/30">
                  مسودة
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              {!editing && (
                <>
                  <button
                    onClick={() => window.open(`/p/${portfolio?.slug}`, '_blank')}
                    className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    معاينة
                  </button>
                  
                  {!portfolio?.is_published && (
                    <button
                      onClick={handlePublish}
                      className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:scale-105 transition-all flex items-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      نشر
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-6 mt-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'overview' && (
          <OverviewTab portfolio={portfolio} />
        )}

        {activeTab === 'projects' && (
          <ProjectsTab
            portfolio={portfolio}
            editing={editing}
            formData={formData}
            setFormData={setFormData}
          />
        )}

        {activeTab === 'skills' && (
          <SkillsTab
            portfolio={portfolio}
            editing={editing}
            formData={formData}
            setFormData={setFormData}
          />
        )}

        {activeTab === 'experience' && (
          <ExperienceTab
            portfolio={portfolio}
            editing={editing}
            formData={formData}
            setFormData={setFormData}
          />
        )}

        {activeTab === 'education' && (
          <EducationTab
            portfolio={portfolio}
            editing={editing}
            formData={formData}
            setFormData={setFormData}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsTab
            portfolio={portfolio}
            editing={editing}
            formData={formData}
            setFormData={setFormData}
            onSave={handleSave}
            onEdit={() => setEditing(true)}
            onCancel={() => {
              setEditing(false);
              setFormData(portfolio);
            }}
          />
        )}

        {/* Save/Cancel Buttons */}
        {editing && activeTab !== 'settings' && (
          <div className="fixed bottom-8 right-8 flex gap-3">
            <button
              onClick={() => {
                setEditing(false);
                setFormData(portfolio);
              }}
              className="px-6 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all flex items-center gap-2"
            >
              <X className="w-5 h-5" />
              إلغاء
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:scale-105 transition-all flex items-center gap-2"
            >
              <Save className="w-5 h-5" />
              حفظ التغييرات
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Overview Tab Component
const OverviewTab = ({ portfolio }) => {
  const stats = [
    { icon: <Eye className="w-5 h-5" />, label: 'المشاهدات', value: portfolio?.views_count || 0 },
    { icon: <Users className="w-5 h-5" />, label: 'الزوار الفريدون', value: portfolio?.unique_visitors || 0 },
    { icon: <MessageSquare className="w-5 h-5" />, label: 'الرسائل', value: 0 },
    { icon: <FolderKanban className="w-5 h-5" />, label: 'المشاريع', value: portfolio?.projects?.length || 0 },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-500/20 rounded-lg">
                {stat.icon}
              </div>
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
            <p className="text-gray-400">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* AI Suggestions */}
      <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-2xl p-8 border border-purple-500/30">
        <div className="flex items-center gap-3 mb-6">
          <Sparkles className="w-6 h-6 text-purple-400" />
          <h3 className="text-xl font-semibold text-white">اقتراحات الذكاء الاصطناعي</h3>
        </div>
        
        <div className="space-y-4">
          {!portfolio?.about_me && (
            <div className="bg-white/5 rounded-lg p-4 flex items-center justify-between">
              <p className="text-gray-300">أضف نبذة عن نفسك لتحسين ظهورك</p>
              <button className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-lg text-sm hover:bg-purple-500/30">
                إضافة
              </button>
            </div>
          )}
          
          {(!portfolio?.projects || portfolio.projects.length < 3) && (
            <div className="bg-white/5 rounded-lg p-4 flex items-center justify-between">
              <p className="text-gray-300">أضف المزيد من المشاريع (3+ مشاريع تزيد فرصك)</p>
              <button className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-lg text-sm hover:bg-purple-500/30">
                إضافة
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Projects Tab Component
const ProjectsTab = ({ portfolio, editing, formData, setFormData }) => {
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    technologies: [],
    project_url: '',
    github_url: ''
  });

  const addProject = () => {
    if (!newProject.title) return;
    
    setFormData({
      ...formData,
      projects: [...(formData.projects || []), { ...newProject, id: Date.now() }]
    });
    
    setNewProject({
      title: '',
      description: '',
      technologies: [],
      project_url: '',
      github_url: ''
    });
  };

  const removeProject = (id) => {
    setFormData({
      ...formData,
      projects: formData.projects.filter(p => p.id !== id)
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">المشاريع</h2>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-all flex items-center gap-2"
          >
            <Edit className="w-4 h-4" />
            تعديل
          </button>
        )}
      </div>

      <div className="grid gap-6">
        {(editing ? formData.projects : portfolio?.projects)?.map((project, index) => (
          <div key={project.id || index} className="bg-white/5 rounded-xl p-6 border border-white/10">
            {editing ? (
              <div className="space-y-4">
                <input
                  type="text"
                  value={project.title}
                  onChange={(e) => {
                    const updated = [...formData.projects];
                    updated[index].title = e.target.value;
                    setFormData({ ...formData, projects: updated });
                  }}
                  className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white"
                  placeholder="عنوان المشروع"
                />
                <textarea
                  value={project.description}
                  onChange={(e) => {
                    const updated = [...formData.projects];
                    updated[index].description = e.target.value;
                    setFormData({ ...formData, projects: updated });
                  }}
                  className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white"
                  placeholder="وصف المشروع"
                  rows="3"
                />
                <button
                  onClick={() => removeProject(project.id)}
                  className="text-red-400 hover:text-red-300 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  حذف
                </button>
              </div>
            ) : (
              <>
                <h3 className="text-xl font-semibold text-white mb-2">{project.title}</h3>
                <p className="text-gray-400 mb-3">{project.description}</p>
                {project.technologies?.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((tech, i) => (
                      <span key={i} className="px-2 py-1 bg-purple-500/10 text-purple-300 rounded-lg text-sm">
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        ))}

        {editing && (
          <div className="bg-white/5 rounded-xl p-6 border border-white/10 border-dashed">
            <h4 className="text-lg font-semibold text-white mb-4">إضافة مشروع جديد</h4>
            <div className="space-y-4">
              <input
                type="text"
                value={newProject.title}
                onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white"
                placeholder="عنوان المشروع"
              />
              <textarea
                value={newProject.description}
                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white"
                placeholder="وصف المشروع"
                rows="3"
              />
              <button
                onClick={addProject}
                className="px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                إضافة مشروع
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Skills Tab Component
const SkillsTab = ({ portfolio, editing, formData, setFormData }) => {
  const [newSkill, setNewSkill] = useState({ name: '', category: 'Frontend', proficiency: 80 });

  const categories = ['Frontend', 'Backend', 'Database', 'DevOps', 'Design', 'Soft Skills'];

  const addSkill = () => {
    if (!newSkill.name) return;
    
    setFormData({
      ...formData,
      skills: [...(formData.skills || []), { ...newSkill, id: Date.now() }]
    });
    
    setNewSkill({ name: '', category: 'Frontend', proficiency: 80 });
  };

  const removeSkill = (id) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter(s => s.id !== id)
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">المهارات</h2>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-all flex items-center gap-2"
          >
            <Edit className="w-4 h-4" />
            تعديل
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {(editing ? formData.skills : portfolio?.skills)?.map((skill, index) => (
          <div key={skill.id || index} className="bg-white/5 rounded-xl p-4 border border-white/10">
            {editing ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={skill.name}
                  onChange={(e) => {
                    const updated = [...formData.skills];
                    updated[index].name = e.target.value;
                    setFormData({ ...formData, skills: updated });
                  }}
                  className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm"
                />
                <button
                  onClick={() => removeSkill(skill.id)}
                  className="text-red-400 hover:text-red-300 text-sm"
                >
                  حذف
                </button>
              </div>
            ) : (
              <>
                <span className="text-white font-medium">{skill.name}</span>
                <span className="block text-sm text-gray-400 mt-1">{skill.category}</span>
              </>
            )}
          </div>
        ))}

        {editing && (
          <div className="bg-white/5 rounded-xl p-4 border border-white/10 border-dashed">
            <h4 className="text-sm font-semibold text-white mb-3">إضافة مهارة</h4>
            <div className="space-y-3">
              <input
                type="text"
                value={newSkill.name}
                onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm"
                placeholder="اسم المهارة"
              />
              <select
                value={newSkill.category}
                onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value })}
                className="w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <button
                onClick={addSkill}
                className="w-full px-3 py-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-all text-sm flex items-center justify-center gap-2"
              >
                <Plus className="w-3 h-3" />
                إضافة
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Experience Tab Component
const ExperienceTab = ({ portfolio, editing, formData, setFormData }) => {
  const [newExp, setNewExp] = useState({
    job_title: '',
    company: '',
    start_date: '',
    end_date: '',
    description: ''
  });

  const addExperience = () => {
    if (!newExp.job_title || !newExp.company) return;
    
    setFormData({
      ...formData,
      experience: [...(formData.experience || []), { ...newExp, id: Date.now() }]
    });
    
    setNewExp({
      job_title: '',
      company: '',
      start_date: '',
      end_date: '',
      description: ''
    });
  };

  const removeExperience = (id) => {
    setFormData({
      ...formData,
      experience: formData.experience.filter(e => e.id !== id)
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">الخبرات</h2>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-all flex items-center gap-2"
          >
            <Edit className="w-4 h-4" />
            تعديل
          </button>
        )}
      </div>

      <div className="space-y-4">
        {(editing ? formData.experience : portfolio?.experience)?.map((exp, index) => (
          <div key={exp.id || index} className="bg-white/5 rounded-xl p-6 border border-white/10">
            {editing ? (
              <div className="space-y-4">
                <input
                  type="text"
                  value={exp.job_title}
                  onChange={(e) => {
                    const updated = [...formData.experience];
                    updated[index].job_title = e.target.value;
                    setFormData({ ...formData, experience: updated });
                  }}
                  className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white"
                  placeholder="المسمى الوظيفي"
                />
                <input
                  type="text"
                  value={exp.company}
                  onChange={(e) => {
                    const updated = [...formData.experience];
                    updated[index].company = e.target.value;
                    setFormData({ ...formData, experience: updated });
                  }}
                  className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white"
                  placeholder="الشركة"
                />
                <button
                  onClick={() => removeExperience(exp.id)}
                  className="text-red-400 hover:text-red-300 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  حذف
                </button>
              </div>
            ) : (
              <>
                <h3 className="text-xl font-semibold text-white mb-1">{exp.job_title}</h3>
                <p className="text-purple-400 mb-2">{exp.company}</p>
                <p className="text-gray-400 text-sm mb-2">{exp.start_date} - {exp.end_date || 'حالياً'}</p>
                <p className="text-gray-300">{exp.description}</p>
              </>
            )}
          </div>
        ))}

        {editing && (
          <div className="bg-white/5 rounded-xl p-6 border border-white/10 border-dashed">
            <h4 className="text-lg font-semibold text-white mb-4">إضافة خبرة جديدة</h4>
            <div className="space-y-4">
              <input
                type="text"
                value={newExp.job_title}
                onChange={(e) => setNewExp({ ...newExp, job_title: e.target.value })}
                className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white"
                placeholder="المسمى الوظيفي"
              />
              <input
                type="text"
                value={newExp.company}
                onChange={(e) => setNewExp({ ...newExp, company: e.target.value })}
                className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white"
                placeholder="الشركة"
              />
              <button
                onClick={addExperience}
                className="px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                إضافة خبرة
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Education Tab Component
const EducationTab = ({ portfolio, editing, formData, setFormData }) => {
  const [newEdu, setNewEdu] = useState({
    degree: '',
    field_of_study: '',
    institution: '',
    start_date: '',
    end_date: ''
  });

  const addEducation = () => {
    if (!newEdu.degree || !newEdu.institution) return;
    
    setFormData({
      ...formData,
      education: [...(formData.education || []), { ...newEdu, id: Date.now() }]
    });
    
    setNewEdu({
      degree: '',
      field_of_study: '',
      institution: '',
      start_date: '',
      end_date: ''
    });
  };

  const removeEducation = (id) => {
    setFormData({
      ...formData,
      education: formData.education.filter(e => e.id !== id)
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">التعليم</h2>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-all flex items-center gap-2"
          >
            <Edit className="w-4 h-4" />
            تعديل
          </button>
        )}
      </div>

      <div className="space-y-4">
        {(editing ? formData.education : portfolio?.education)?.map((edu, index) => (
          <div key={edu.id || index} className="bg-white/5 rounded-xl p-6 border border-white/10">
            {editing ? (
              <div className="space-y-4">
                <input
                  type="text"
                  value={edu.degree}
                  onChange={(e) => {
                    const updated = [...formData.education];
                    updated[index].degree = e.target.value;
                    setFormData({ ...formData, education: updated });
                  }}
                  className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white"
                  placeholder="الشهادة"
                />
                <input
                  type="text"
                  value={edu.institution}
                  onChange={(e) => {
                    const updated = [...formData.education];
                    updated[index].institution = e.target.value;
                    setFormData({ ...formData, education: updated });
                  }}
                  className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white"
                  placeholder="الجامعة/المؤسسة"
                />
                <button
                  onClick={() => removeEducation(edu.id)}
                  className="text-red-400 hover:text-red-300 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  حذف
                </button>
              </div>
            ) : (
              <>
                <h3 className="text-xl font-semibold text-white mb-1">{edu.degree}</h3>
                <p className="text-purple-400 mb-2">{edu.institution}</p>
                <p className="text-gray-400 text-sm">{edu.field_of_study}</p>
              </>
            )}
          </div>
        ))}

        {editing && (
          <div className="bg-white/5 rounded-xl p-6 border border-white/10 border-dashed">
            <h4 className="text-lg font-semibold text-white mb-4">إضافة تعليم جديد</h4>
            <div className="space-y-4">
              <input
                type="text"
                value={newEdu.degree}
                onChange={(e) => setNewEdu({ ...newEdu, degree: e.target.value })}
                className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white"
                placeholder="الشهادة"
              />
              <input
                type="text"
                value={newEdu.institution}
                onChange={(e) => setNewEdu({ ...newEdu, institution: e.target.value })}
                className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white"
                placeholder="الجامعة/المؤسسة"
              />
              <button
                onClick={addEducation}
                className="px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                إضافة تعليم
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Settings Tab Component
const SettingsTab = ({ portfolio, editing, formData, setFormData, onSave, onEdit, onCancel }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">إعدادات البورتفليو</h2>
        {!editing && (
          <button
            onClick={onEdit}
            className="px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-all flex items-center gap-2"
          >
            <Edit className="w-4 h-4" />
            تعديل
          </button>
        )}
      </div>

      <div className="bg-white/5 rounded-xl p-6 border border-white/10 space-y-6">
        {/* Basic Info */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">المعلومات الأساسية</h3>
          
          <div>
            <label className="block text-gray-400 mb-2">عنوان البورتفليو</label>
            <input
              type="text"
              value={editing ? formData.title : portfolio?.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              disabled={!editing}
              className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-gray-400 mb-2">نبذة عنك</label>
            <textarea
              value={editing ? formData.about_me : portfolio?.about_me}
              onChange={(e) => setFormData({ ...formData, about_me: e.target.value })}
              disabled={!editing}
              rows="5"
              className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white disabled:opacity-50"
            />
          </div>
        </div>

        {/* URL Settings */}
        <div className="space-y-4 pt-6 border-t border-white/10">
          <h3 className="text-lg font-semibold text-white">رابط البورتفليو</h3>
          
          <div>
            <label className="block text-gray-400 mb-2">الرابط الخاص</label>
            <div className="flex items-center gap-2">
              <span className="text-gray-400">portfolioai.com/p/</span>
              <input
                type="text"
                value={editing ? formData.slug : portfolio?.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                disabled={!editing}
                className="flex-1 p-3 bg-white/10 border border-white/20 rounded-lg text-white disabled:opacity-50"
              />
            </div>
          </div>
        </div>

        {/* Publish Status */}
        <div className="space-y-4 pt-6 border-t border-white/10">
          <h3 className="text-lg font-semibold text-white">حالة النشر</h3>
          
          <div className="flex items-center gap-4">
            <span className="text-gray-400">الحالة:</span>
            {portfolio?.is_published ? (
              <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">منشور</span>
            ) : (
              <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm">مسودة</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const tabs = [
  { id: 'overview', label: 'نظرة عامة', icon: <LayoutDashboard className="w-5 h-5" /> },
  { id: 'projects', label: 'المشاريع', icon: <FolderKanban className="w-5 h-5" /> },
  { id: 'skills', label: 'المهارات', icon: <Award className="w-5 h-5" /> },
  { id: 'experience', label: 'الخبرات', icon: <Briefcase className="w-5 h-5" /> },
  { id: 'education', label: 'التعليم', icon: <GraduationCap className="w-5 h-5" /> },
  { id: 'settings', label: 'الإعدادات', icon: <Settings className="w-5 h-5" /> },
];

export default Dashboard;