import React from 'react'
import { Loader, AlertCircle, Crown } from 'lucide-react'
import AnimatedBackground from '../components/AnimatedBackground'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Home from './Home'
import AboutPage from './About'
import Skills from './Skills'
import Portfolio from './Portfolio'
import WhyMe from './WhyMe'
import ExperienceSection from '../components/ExperienceSection'
import { useDeveloper } from '../context/DeveloperContext'
import { useParams } from 'react-router-dom'
import { developerService } from '../lib/supabase'
const { username } = useParams()
const { developer, setDeveloper, loading, setLoading, error, setError } = useDeveloper()

useEffect(() => {
  const loadDeveloper = async () => {
    try {
      setLoading(true)
      setError(null)

      const data = await developerService.getByUsername(username)

      if (!data) {
        setDeveloper(null)
        setError("Developer not found")
      } else {
        setDeveloper(data)
      }

    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (username) {
    loadDeveloper()
  }
}, [username])
const PublicPortfolio = () => {
  const {
    developer,
    loading,
    error,
    getProjects,
    isPaidPlan,
    getProfileImage
  } = useDeveloper()

  // شاشة تحميل مع عرض خطأ الكونسول (لو وجد) لتتمكن من نسخه
  if (loading) {
    return (
      <div className="min-h-screen bg-[#030014] flex items-center justify-center px-4">
        <div className="text-center max-w-2xl w-full">
          <Loader className="w-16 h-16 text-[#6366f1] animate-spin mx-auto mb-4" />
          <p className="text-gray-300 mb-2">جاري تحميل البورتفوليو...</p>
          <p className="text-gray-400 text-sm">إذا ظهرت أخطاء في الكونسول، ستظهر هنا لنسخها.</p>
        </div>
      </div>
    )
  }

  if (error || !developer) {
    return (
      <div className="min-h-screen bg-[#030014] flex items-center justify-center px-4">
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 max-w-3xl w-full text-center border border-white/10">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-10 h-10 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">البورتفوليو غير متاح</h1>
          <p className="text-gray-400 mb-4">
            {error || 'لم نتمكن من العثور على هذا المطور.'}
          </p>

          <div className="text-left bg-black/40 rounded-lg p-4 mt-4 text-xs text-green-300 overflow-auto" style={{maxHeight: 300}}>
            <strong>Debug - developer data (copy if needed):</strong>
            <pre className="whitespace-pre-wrap break-words mt-2">
              {JSON.stringify({ error, developer }, null, 2)}
            </pre>
            <p className="text-gray-400 text-xs mt-2">انسخ المخرجات أعلاه وأرسلها لي لكي أتحقق منها.</p>
          </div>

        </div>
      </div>
    )
  }

  return (
    <>
      <AnimatedBackground />
      <Navbar />
      <main className="relative z-10">
        {/* مرر بيانات المطور كمزايا إذا أردت - لكن غالباً المكونات تأخذها من useDeveloper */}
        <Home developer={developer} />
        <AboutPage developer={developer} />
        <Skills developer={developer} />
        <Portfolio developer={developer} />
        <ExperienceSection experience={getProjects() /* <-- إن أردتعرض مشاريع هنا بشكل تجريبي */} />
        {!isPaidPlan() && <WhyMe developer={developer} />}
      </main>
      <Footer />

      {isPaidPlan() && (
        <div className="fixed top-16 right-4 z-50">
          <div className="bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 shadow-lg">
            <Crown className="w-4 h-4" />
            Premium Plan
          </div>
        </div>
      )}
    </>
  )
}

export default PublicPortfolio
