import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import Typewriter from 'typewriter-effect'
import { 
  Sparkles, 
  Zap, 
  Shield, 
  Globe, 
  Users, 
  Rocket, 
  ArrowRight,
  Github,
  Twitter,
  Linkedin,
  FileText,
  Code,
  Award,
  ChevronRight,
  Eye,
  Heart,
  Star,
  Crown,
  Gem,
  Flame,
  Brain,
  Target,
  Compass,
  Feather,
  Wind,
  Sun,
  Moon,
  Cloud,
  Droplet,
  Leaf,
  Flower2,
  Box,
  MountainSnow,
  Layout,
  ThumbsUp,
  Menu,
  X,
  LogIn,
  UserPlus,
  Home,
  Briefcase,
  GraduationCap,
  Mail,
  Info
} from 'lucide-react'
import AOS from 'aos'
import 'aos/dist/aos.css'
import { developerService, likeService } from '../lib/supabase'
import Swal from 'sweetalert2'

// مكون الرقم المتحرك
const AnimatedNumber = ({ value }) => {
  const [count, setCount] = useState(0)
  const { ref, inView } = useInView({ triggerOnce: true })

  useEffect(() => {
    if (inView) {
      let start = 0
      const end = parseInt(value.toString().replace(/[^0-9]/g, ''))
      const duration = 2000
      const increment = end / (duration / 16)
      
      const timer = setInterval(() => {
        start += increment
        if (start > end) {
          setCount(end)
          clearInterval(timer)
        } else {
          setCount(Math.floor(start))
        }
      }, 16)
      
      return () => clearInterval(timer)
    }
  }, [inView, value])

  return (
    <span ref={ref} className="text-3xl sm:text-4xl md:text-5xl font-bold">
      {count.toLocaleString()}
      {value.toString().includes('+') && '+'}
      {value.toString().includes('%') && '%'}
    </span>
  )
}

// مكون البطاقة المتحركة
const AnimatedCard = ({ children, delay = 0, className = "" }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.05 }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// مكون الصورة الشخصية مع زر الإعجاب
const ProfileCard = ({ profile, index, onLike }) => {
  const [liked, setLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(profile.likes_count || 0)
  const [loading, setLoading] = useState(false)

  const handleLike = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (liked) {
      Swal.fire({
        icon: 'info',
        title: 'تم الإعجاب مسبقاً',
        text: 'لقد أعجبت بهذا الملف من قبل',
        timer: 2000,
        showConfirmButton: false,
        background: '#030014',
        color: '#ffffff'
      })
      return
    }

    setLoading(true)
    try {
      const visitorIp = await fetch('https://api.ipify.org?format=json')
        .then(res => res.json())
        .then(data => data.ip)
        .catch(() => 'unknown')

      await likeService.addLike(profile.id, visitorIp)
      setLiked(true)
      setLikesCount(prev => prev + 1)
      
      if (onLike) onLike(profile.id)

      Swal.fire({
        icon: 'success',
        title: 'شكراً لك!',
        text: 'تم تسجيل إعجابك بهذا الملف',
        timer: 2000,
        showConfirmButton: false,
        background: '#030014',
        color: '#ffffff'
      })
    } catch (error) {
      console.error('Error liking:', error)
      if (error.message === 'Already liked') {
        setLiked(true)
      }
    } finally {
      setLoading(false)
    }
  }

  const emojis = [
    <Star className="w-4 h-4 text-yellow-400" />,
    <Crown className="w-4 h-4 text-yellow-500" />,
    <Gem className="w-4 h-4 text-purple-400" />,
    <Flame className="w-4 h-4 text-orange-500" />
  ]

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      whileHover={{ y: -5 }}
    >
      <Link
        to={`/u/${profile.username}`}
        className="group relative block bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/20 overflow-hidden"
      >
        {/* خلفية متحركة */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-[#6366f1]/20 to-[#a855f7]/20"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />

        <div className="relative z-10">
          <div className="flex items-start gap-4">
            {/* الصورة */}
            <div className="relative">
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-r from-[#6366f1] to-[#a855f7] p-0.5">
                <img
                  src={profile.profile_image || "/default-avatar.png"}
                  alt={profile.full_name}
                  className="w-full h-full object-cover rounded-xl"
                  onError={(e) => {
                    e.target.src = "/default-avatar.png"
                  }}
                />
              </div>
              
              {/* أيقونة مميز */}
              {profile.username === 'abdullah_aishan' && (
                <motion.div
                  className="absolute -top-2 -right-2"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity }}
                >
                  <div className="w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center">
                    <Crown className="w-3 h-3 text-white" />
                  </div>
                </motion.div>
              )}
            </div>

            {/* معلومات الملف */}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-white mb-1 truncate">
                {profile.full_name}
                {profile.username === 'abdullah_aishan' && (
                  <span className="ml-2 text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full">
                    Founder
                  </span>
                )}
              </h3>
              
              {profile.title && (
                <p className="text-sm text-gray-400 mb-2 truncate">
                  {profile.title}
                </p>
              )}
              
              {/* إحصائيات */}
              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1 text-gray-500">
                  <Eye className="w-3 h-3" />
                  <span>{profile.views_count || 0}</span>
                </div>
                <button 
                  onClick={handleLike}
                  disabled={loading}
                  className="flex items-center gap-1 text-gray-500 hover:text-pink-400 transition"
                >
                  <Heart className={`w-3 h-3 ${liked ? 'fill-pink-400 text-pink-400' : ''}`} />
                  <span>{likesCount}</span>
                </button>
              </div>
            </div>

            {/* سهم */}
            <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-[#a855f7] group-hover:translate-x-1 transition-all" />
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

// مكون الـ Navbar
const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-[#030014]/80 backdrop-blur-xl border-b border-white/10' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-[#6366f1] to-[#a855f7] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">P</span>
            </div>
            <span className="text-white font-semibold hidden sm:block">Portfolio-v5</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-gray-300 hover:text-white transition flex items-center gap-1">
              <Home className="w-4 h-4" />
              <span>الرئيسية</span>
            </Link>
            <Link to="/about" className="text-gray-300 hover:text-white transition flex items-center gap-1">
              <Info className="w-4 h-4" />
              <span>عن المنصة</span>
            </Link>
            <Link to="/u/abdullah_aishan" className="text-gray-300 hover:text-white transition flex items-center gap-1">
              <Briefcase className="w-4 h-4" />
              <span>مثال حي</span>
            </Link>
            <Link to="/contact" className="text-gray-300 hover:text-white transition flex items-center gap-1">
              <Mail className="w-4 h-4" />
              <span>اتصل بنا</span>
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2 text-gray-300 hover:text-white transition flex items-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              <span>دخول</span>
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white rounded-lg font-semibold hover:scale-105 transition flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>انضم مجاناً</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-gray-400 hover:text-white"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <motion.div
        initial={false}
        animate={isOpen ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="md:hidden overflow-hidden bg-[#030014]/95 backdrop-blur-xl border-t border-white/10"
      >
        <div className="px-4 py-4 space-y-3">
          <Link
            to="/"
            className="block py-2 text-gray-300 hover:text-white transition"
            onClick={() => setIsOpen(false)}
          >
            الرئيسية
          </Link>
          <Link
            to="/about"
            className="block py-2 text-gray-300 hover:text-white transition"
            onClick={() => setIsOpen(false)}
          >
            عن المنصة
          </Link>
          <Link
            to="/u/abdullah_aishan"
            className="block py-2 text-gray-300 hover:text-white transition"
            onClick={() => setIsOpen(false)}
          >
            مثال حي
          </Link>
          <Link
            to="/contact"
            className="block py-2 text-gray-300 hover:text-white transition"
            onClick={() => setIsOpen(false)}
          >
            اتصل بنا
          </Link>
          <div className="pt-3 border-t border-white/10 flex gap-3">
            <Link
              to="/login"
              className="flex-1 py-2 text-center text-gray-300 border border-white/20 rounded-lg hover:bg-white/5 transition"
              onClick={() => setIsOpen(false)}
            >
              دخول
            </Link>
            <Link
              to="/register"
              className="flex-1 py-2 text-center bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white rounded-lg font-semibold hover:scale-105 transition"
              onClick={() => setIsOpen(false)}
            >
              انضم مجاناً
            </Link>
          </div>
        </div>
      </motion.div>
    </motion.nav>
  )
}

const LandingPage = () => {
  const [stats, setStats] = useState({
    users: 0,
    portfolios: 0,
    projects: 0,
    templates: 50,
    satisfaction: 95,
    featuredDeveloper: null,
    featuredProfiles: [],
    totalViews: 0,
    totalLikes: 0
  })
  const [loading, setLoading] = useState(true)

  const { ref: heroRef, inView: heroInView } = useInView({ triggerOnce: true })
  const { ref: statsRef, inView: statsInView } = useInView({ triggerOnce: true })

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      easing: 'ease-out-cubic'
    })

    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const platformStats = await developerService.getPlatformStats()
      setStats(platformStats)
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleProfileLike = (profileId) => {
    // تحديث الإحصائيات بعد الإعجاب
    setStats(prev => ({
      ...prev,
      totalLikes: prev.totalLikes + 1
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#030014] via-[#0a0a1f] to-[#030014] overflow-hidden">
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <motion.div 
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16"
        initial={{ opacity: 0 }}
        animate={heroInView ? { opacity: 1 } : {}}
        transition={{ duration: 1.5 }}
      >
        {/* خلفية متحركة */}
        <div className="absolute inset-0">
          <motion.div
            className="absolute top-20 left-10 w-72 h-72 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
            animate={{
              x: [0, 100, 0],
              y: [0, -50, 0],
              scale: [1, 1.2, 1]
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
          <motion.div
            className="absolute top-40 right-10 w-72 h-72 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
            animate={{
              x: [0, -100, 0],
              y: [0, 50, 0],
              scale: [1, 1.3, 1]
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
          <motion.div
            className="absolute bottom-20 left-1/3 w-72 h-72 bg-pink-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
            animate={{
              x: [0, 50, 0],
              y: [0, -100, 0],
              scale: [1, 1.4, 1]
            }}
            transition={{
              duration: 30,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
        </div>

        {/* محتوى الهيرو */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <motion.div
            className="text-center"
            initial={{ y: 50, opacity: 0 }}
            animate={heroInView ? { y: 0, opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {/* شارة مع تأثير كتابة */}
            <motion.div
              className="inline-block mb-6 sm:mb-8"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="px-3 sm:px-4 py-2 bg-white/5 backdrop-blur-sm rounded-full text-xs sm:text-sm text-[#a855f7] border border-white/10">
                ✨ <Typewriter
                  options={{
                    strings: [
                      `${stats.users.toLocaleString()}+ مستخدم`,
                      `${stats.portfolios.toLocaleString()}+ بورتفليو`,
                      `بواسطة ${stats.featuredDeveloper?.full_name || 'Abdullah Aishan'}`
                    ],
                    autoStart: true,
                    loop: true,
                    delay: 75,
                    deleteSpeed: 50,
                  }}
                />
              </span>
            </motion.div>
            
            {/* العنوان الرئيسي */}
            <motion.h1 
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 sm:mb-6 px-4"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={heroInView ? { scale: 1, opacity: 1 } : {}}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <span className="block">أنشئ بورتفليو احترافي</span>
              <motion.span 
                className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-[#6366f1] to-[#a855f7]"
                animate={{
                  textShadow: [
                    "0 0 20px rgba(168, 85, 247, 0)",
                    "0 0 40px rgba(168, 85, 247, 0.5)",
                    "0 0 20px rgba(168, 85, 247, 0)"
                  ]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity
                }}
              >
                في دقائق معدودة
              </motion.span>
            </motion.h1>
            
            {/* الوصف */}
            <motion.p 
              className="text-base sm:text-lg md:text-xl text-gray-400 mb-8 sm:mb-10 max-w-3xl mx-auto px-4 leading-relaxed"
              initial={{ y: 30, opacity: 0 }}
              animate={heroInView ? { y: 0, opacity: 1 } : {}}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <span className="block mb-2">منصة المطورين المحترفين - Portfolio-v5</span>
              <span className="block">اعرض مشاريعك وخبراتك وشهاداتك في قالب احترافي</span>
            </motion.p>

            {/* أزرار الدعوة */}
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center items-center px-4 mb-12 sm:mb-16"
              initial={{ y: 30, opacity: 0 }}
              animate={heroInView ? { y: 0, opacity: 1 } : {}}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/register"
                  className="group w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white rounded-xl font-semibold text-base sm:text-lg flex items-center justify-center gap-2 relative overflow-hidden"
                >
                  <motion.div
                    className="absolute inset-0 bg-white"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "100%" }}
                    transition={{ duration: 0.5 }}
                    style={{ opacity: 0.2 }}
                  />
                  <span>ابدأ مجاناً</span>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/u/abdullah_aishan"
                  className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-white/5 backdrop-blur-sm border border-white/20 text-white rounded-xl font-semibold text-base sm:text-lg hover:bg-white/10 transition-all"
                >
                  شاهد مثالاً حياً
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* إحصائيات المنصة */}
      <div ref={statsRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 50 }}
            animate={statsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0 }}
          >
            <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#6366f1] to-[#a855f7] mb-2">
              <AnimatedNumber value={stats.users} />
            </div>
            <div className="text-sm text-gray-400">مستخدم نشط</div>
          </motion.div>

          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 50 }}
            animate={statsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#a855f7] to-[#f59e0b] mb-2">
              <AnimatedNumber value={stats.portfolios} />
            </div>
            <div className="text-sm text-gray-400">بورتفليو منشور</div>
          </motion.div>

          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 50 }}
            animate={statsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#10b981] to-[#6366f1] mb-2">
              <AnimatedNumber value={stats.templates} />
            </div>
            <div className="text-sm text-gray-400">قالب احترافي</div>
          </motion.div>

          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 50 }}
            animate={statsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#f59e0b] to-[#a855f7] mb-2">
              <AnimatedNumber value={`${stats.satisfaction}%`} />
            </div>
            <div className="text-sm text-gray-400">رضا العملاء</div>
          </motion.div>
        </div>

        {/* إحصائيات إضافية */}
        <div className="grid grid-cols-2 gap-6 max-w-2xl mx-auto mt-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={statsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center p-4 bg-white/5 rounded-xl border border-white/10"
          >
            <Eye className="w-6 h-6 text-purple-400 mx-auto mb-2" />
            <div className="text-xl font-bold text-white">
              <AnimatedNumber value={stats.totalViews} />
            </div>
            <div className="text-xs text-gray-400">إجمالي الزيارات</div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={statsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-center p-4 bg-white/5 rounded-xl border border-white/10"
          >
            <Heart className="w-6 h-6 text-pink-400 mx-auto mb-2" />
            <div className="text-xl font-bold text-white">
              <AnimatedNumber value={stats.totalLikes} />
            </div>
            <div className="text-xs text-gray-400">إجمالي الإعجابات</div>
          </motion.div>
        </div>
      </div>

      {/* الملف الشخصي للمؤسس */}
      {stats.featuredDeveloper && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              مؤسس <span className="text-[#a855f7]">المنصة</span>
            </h2>
            <p className="text-gray-400">تعرف على مؤسس المنصة ومطورها الرئيسي</p>
          </motion.div>

          <div className="max-w-md mx-auto">
            <ProfileCard 
              profile={stats.featuredDeveloper} 
              index={0} 
              onLike={handleProfileLike}
            />
          </div>
        </div>
      )}

      {/* ملفات شخصية مميزة أخرى */}
      {stats.featuredProfiles.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              <span className="text-[#a855f7]">مطورين</span> مميزين
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              اكتشف أبرز المطورين المحترفين على المنصة
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {stats.featuredProfiles.map((profile, index) => (
              <ProfileCard 
                key={profile.id} 
                profile={profile} 
                index={index + 1} 
                onLike={handleProfileLike}
              />
            ))}
          </div>
        </div>
      )}

      {/* باقي الأقسام (How It Works, Features, CTA, Footer) كما هي من الكود السابق */}
      {/* ... */}

    </div>
  )
}

export default LandingPage
