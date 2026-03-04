import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import Typewriter from 'typewriter-effect'
import { 
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
  Menu,
  X,
  LogIn,
  UserPlus,
  Home,
  Briefcase,
  Mail,
  Info,
  MessageCircle,
  UserCircle2,
  ThumbsUp,
  Facebook,
  Instagram,
  Youtube,
  MapPin,
  Phone,
  Send,
  LogOut
} from 'lucide-react'
import AOS from 'aos'
import 'aos/dist/aos.css'
import { developerService, likeService } from '../lib/supabase'
import Swal from 'sweetalert2'
import Komentar from '../components/Commentar'
import { useAuth } from '../hooks/useAuth' // ✅ استيراد useAuth

// مكون الرقم المتحرك
// مكون الرقم المتحرك المعدل
const AnimatedNumber = ({ value }) => {
  const [count, setCount] = useState(0)
  const { ref, inView } = useInView({ triggerOnce: true })

  useEffect(() => {
    if (inView && value > 0) {
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

  // ✅ إذا كانت القيمة 0 أو أقل، اعرض "جاري التحميل"
  if (!value || value === 0) {
    return (
      <span ref={ref} className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-400">
        جاري التحميل...
      </span>
    )
  }

  return (
    <span ref={ref} className="text-3xl sm:text-4xl md:text-5xl font-bold">
      {count.toLocaleString()}
      {value.toString().includes('+') && '+'}
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
        title: 'Already Liked',
        text: 'You have already liked this profile',
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
        title: 'Thank You!',
        text: 'Your like has been recorded',
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
          className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-purple-600/20"
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
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-600 p-0.5">
                <img
                  src={profile.profile_image || "/default-avatar.png"}
                  alt={profile.full_name}
                  className="w-full h-full object-cover rounded-xl"
                  onError={(e) => {
                    e.target.src = "/default-avatar.png"
                  }}
                />
              </div>
              
              {/* أيقونة مميز للمؤسس */}
              {profile.username === 'abdullah_aishan' && (
                <motion.div
                  className="absolute -top-2 -right-2"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity }}
                >
                  <div className="w-6 h-6 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center">
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
                  <span className="ml-2 text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full">
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
            <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

// ✅ مكون الـ Navbar المحسن
const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { user, logout } = useAuth() // ✅ استخدام useAuth
  const navigate = useNavigate()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/')
    setIsOpen(false)
  }

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
            <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">P</span>
            </div>
            <span className="text-white font-semibold hidden sm:block">Portfolio-v5</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-gray-300 hover:text-white transition flex items-center gap-1">
              <Home className="w-4 h-4" />
              <span>Home</span>
            </Link>
            <Link to="/about" className="text-gray-300 hover:text-white transition flex items-center gap-1">
              <Info className="w-4 h-4" />
              <span>About</span>
            </Link>
            <Link to="/u/abdullah_aishan" className="text-gray-300 hover:text-white transition flex items-center gap-1">
              <Briefcase className="w-4 h-4" />
              <span>Live Demo</span>
            </Link>
            <Link to="#contact" className="text-gray-300 hover:text-white transition flex items-center gap-1">
              <Mail className="w-4 h-4" />
              <span>Contact</span>
            </Link>
          </div>

          {/* ✅ Auth Buttons - يظهر حسب حالة المستخدم */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              // ✅ المستخدم مسجل دخول
              <>
                <Link
                  to="/dashboard"
                  className="px-4 py-2 text-gray-300 hover:text-white transition flex items-center gap-2"
                >
                  <UserCircle2 className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
                {/* صورة المستخدم الصغيرة */}
                <img
                  src={user?.profile_image || '/default-avatar.png'}
                  alt={user?.full_name}
                  className="w-8 h-8 rounded-full object-cover border-2 border-indigo-500/30"
                  onError={(e) => e.target.src = '/default-avatar.png'}
                />
              </>
            ) : (
              // ✅ زائر - أظهر أزرار التسجيل
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-gray-300 hover:text-white transition flex items-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Login</span>
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:scale-105 transition flex items-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Sign Up</span>
                </Link>
              </>
            )}
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
            Home
          </Link>
          <Link
            to="/about"
            className="block py-2 text-gray-300 hover:text-white transition"
            onClick={() => setIsOpen(false)}
          >
            About
          </Link>
          <Link
            to="/u/abdullah_aishan"
            className="block py-2 text-gray-300 hover:text-white transition"
            onClick={() => setIsOpen(false)}
          >
            Live Demo
          </Link>
          <Link
            to="#contact"
            className="block py-2 text-gray-300 hover:text-white transition"
            onClick={() => setIsOpen(false)}
          >
            Contact
          </Link>
          
          {/* ✅ Mobile Auth Buttons */}
          {user ? (
            // ✅ مستخدم مسجل
            <>
              <Link
                to="/dashboard"
                className="block py-2 text-gray-300 hover:text-white transition"
                onClick={() => setIsOpen(false)}
              >
                <div className="flex items-center gap-2">
                  <UserCircle2 className="w-4 h-4" />
                  <span>Dashboard</span>
                </div>
              </Link>
              <div className="pt-3 border-t border-white/10">
                <button
                  onClick={handleLogout}
                  className="w-full py-2 text-center bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition"
                >
                  <div className="flex items-center justify-center gap-2">
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </div>
                </button>
              </div>
            </>
          ) : (
            // ✅ زائر
            <div className="pt-3 border-t border-white/10 flex gap-3">
              <Link
                to="/login"
                className="flex-1 py-2 text-center text-gray-300 border border-white/20 rounded-lg hover:bg-white/5 transition"
                onClick={() => setIsOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/register"
                className="flex-1 py-2 text-center bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:scale-105 transition"
                onClick={() => setIsOpen(false)}
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </motion.div>
    </motion.nav>
  )
}

// مكون الفوتر
const Footer = () => {
  return (
    <footer className="border-t border-white/10 bg-[#030014]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About Section */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">P</span>
              </div>
              <span className="text-white font-semibold">Portfolio-v5</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              Professional portfolio platform for developers and creators. 
              Showcase your projects, skills, and achievements in a modern way.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-gray-400 hover:text-white transition">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-white transition text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-400 hover:text-white transition text-sm">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/u/abdullah_aishan" className="text-gray-400 hover:text-white transition text-sm">
                  Live Demo
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-white transition text-sm">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact Info</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-gray-400 text-sm">
                <MapPin className="w-4 h-4 text-indigo-400" />
                <span>Sana'a, Yemen</span>
              </li>
              <li className="flex items-center gap-2 text-gray-400 text-sm">
                <Phone className="w-4 h-4 text-indigo-400" />
                <span>+967 771 315 459</span>
              </li>
              <li className="flex items-center gap-2 text-gray-400 text-sm">
                <Mail className="w-4 h-4 text-indigo-400" />
                <span>eng.abdullah.z.aishan@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-white/10 text-center">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} Portfolio-v5. All rights reserved. 
            Developed by{' '}
            <Link 
              to="/u/abdullah_aishan" 
              className="text-indigo-400 hover:text-indigo-300 transition"
            >
              Abdullah Aishan
            </Link>
          </p>
        </div>
      </div>
    </footer>
  )
}

const LandingPage = () => {
  const [stats, setStats] = useState({
    users: 0,
    projects: 0,
    templates: 50,
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
        {/* Animated background */}
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
            className="absolute top-40 right-10 w-72 h-72 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
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

        {/* Hero content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <motion.div
            className="text-center"
            initial={{ y: 50, opacity: 0 }}
            animate={heroInView ? { y: 0, opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {/* Typewriter badge */}
            <motion.div
              className="inline-block mb-6 sm:mb-8"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="px-3 sm:px-4 py-2 bg-white/5 backdrop-blur-sm rounded-full text-xs sm:text-sm text-indigo-400 border border-white/10">
                <Typewriter
                  options={{
                    strings: [
                      `${stats.users.toLocaleString()}+ Active Users`,
                      `Built by Abdullah Aishan`,
                      `Join the community`
                    ],
                    autoStart: true,
                    loop: true,
                    delay: 75,
                    deleteSpeed: 50,
                  }}
                />
              </span>
            </motion.div>
            
            {/* Main title */}
            <motion.h1 
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 sm:mb-6 px-4"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={heroInView ? { scale: 1, opacity: 1 } : {}}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <span className="block">Create Professional</span>
              <motion.span 
                className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400"
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
                Portfolio in Minutes
              </motion.span>
            </motion.h1>
            
            {/* Description */}
            <motion.p 
              className="text-base sm:text-lg md:text-xl text-gray-400 mb-8 sm:mb-10 max-w-3xl mx-auto px-4 leading-relaxed"
              initial={{ y: 30, opacity: 0 }}
              animate={heroInView ? { y: 0, opacity: 1 } : {}}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <span className="block mb-2">Professional Developers Platform - Portfolio-v5</span>
              <span className="block">Showcase your projects, skills, and certificates in a modern way</span>
            </motion.p>

            {/* CTA Buttons */}
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
                  className="group w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold text-base sm:text-lg flex items-center justify-center gap-2 relative overflow-hidden"
                >
                  <motion.div
                    className="absolute inset-0 bg-white"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "100%" }}
                    transition={{ duration: 0.5 }}
                    style={{ opacity: 0.2 }}
                  />
                  <span>Get Started Free</span>
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
                  View Live Demo
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Platform Stats */}
      <div ref={statsRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 50 }}
            animate={statsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0 }}
          >
            <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 mb-2">
              <AnimatedNumber value={stats.users} />
            </div>
            <div className="text-sm text-gray-400">Active Users</div>
          </motion.div>

          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 50 }}
            animate={statsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-2">
              <AnimatedNumber value={stats.projects} />
            </div>
            <div className="text-sm text-gray-400">Projects</div>
          </motion.div>

          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 50 }}
            animate={statsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-indigo-400 mb-2">
              <AnimatedNumber value={stats.templates} />
            </div>
            <div className="text-sm text-gray-400">Templates</div>
          </motion.div>

          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 50 }}
            animate={statsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400 mb-2">
              <AnimatedNumber value={stats.totalLikes} />
            </div>
            <div className="text-sm text-gray-400">Total Likes</div>
          </motion.div>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-2 gap-6 max-w-2xl mx-auto mt-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={statsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center p-4 bg-white/5 rounded-xl border border-white/10"
          >
            <Eye className="w-6 h-6 text-indigo-400 mx-auto mb-2" />
            <div className="text-xl font-bold text-white">
              <AnimatedNumber value={stats.totalViews} />
            </div>
            <div className="text-xs text-gray-400">Total Views</div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={statsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-center p-4 bg-white/5 rounded-xl border border-white/10"
          >
            <Users className="w-6 h-6 text-purple-400 mx-auto mb-2" />
            <div className="text-xl font-bold text-white">
              <AnimatedNumber value={stats.users} />
            </div>
            <div className="text-xs text-gray-400">Community Members</div>
          </motion.div>
        </div>
      </div>

      {/* Founder Profile */}
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
              Platform <span className="text-indigo-400">Founder</span>
            </h2>
            <p className="text-gray-400">Meet the creator and lead developer</p>
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

      {/* Featured Developers */}
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
              <span className="text-indigo-400">Featured</span> Developers
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Discover top professionals on our platform
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

      {/* How It Works Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="text-center mb-12">
          <motion.h2 
            className="text-3xl sm:text-4xl font-bold text-white mb-4"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            How It <span className="text-indigo-400">Works</span>
          </motion.h2>
          <motion.p 
            className="text-gray-400 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Three simple steps to your professional portfolio
          </motion.p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: FileText, title: 'Create Account', desc: 'Sign up for free and add your basic information', color: 'from-indigo-400 to-purple-400' },
            { icon: Code, title: 'Add Projects', desc: 'Showcase your projects, skills, and achievements', color: 'from-purple-400 to-pink-400' },
            { icon: Globe, title: 'Publish', desc: 'Get your unique URL and share with the world', color: 'from-emerald-400 to-indigo-400' }
          ].map((step, index) => (
            <AnimatedCard key={index} delay={index * 0.2}>
              <div className="text-center p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-indigo-500/50 transition-all">
                <div className="relative mb-6 inline-block">
                  <div className={`w-20 h-20 bg-gradient-to-r ${step.color} rounded-2xl flex items-center justify-center mx-auto`}>
                    <step.icon className="w-10 h-10 text-white" />
                  </div>
                  <motion.div 
                    className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center text-indigo-600 font-bold text-sm"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {index + 1}
                  </motion.div>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{step.title}</h3>
                <p className="text-gray-400 leading-relaxed">{step.desc}</p>
              </div>
            </AnimatedCard>
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="text-center mb-12">
          <motion.h2 
            className="text-3xl sm:text-4xl font-bold text-white mb-4"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            Why Choose <span className="text-indigo-400">Portfolio-v5</span>
          </motion.h2>
          <motion.p 
            className="text-gray-400 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Everything you need to build your professional identity
          </motion.p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: Zap, title: 'Lightning Fast', desc: 'Create your portfolio in minutes' },
            { icon: Shield, title: 'Secure & Private', desc: 'Your data is encrypted and secure' },
            { icon: Globe, title: 'Custom Domain', desc: 'Use your own domain or our subdomain' },
            { icon: Users, title: 'Active Community', desc: `Join ${stats.users.toLocaleString()}+ developers` },
            { icon: Award, title: 'Professional Design', desc: 'Modern templates for your work' },
            { icon: Rocket, title: 'Regular Updates', desc: 'New features and templates added regularly' }
          ].map((feature, index) => (
            <AnimatedCard key={index} delay={index * 0.1}>
              <div className="group bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-indigo-500/50 transition-all hover:scale-105 hover:shadow-xl">
                <motion.div 
                  className="w-12 h-12 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-xl flex items-center justify-center mb-4"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <feature.icon className="w-6 h-6 text-white" />
                </motion.div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{feature.desc}</p>
              </div>
            </AnimatedCard>
          ))}
        </div>
      </div>

      {/* Comments Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20" id="comments">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-8 text-center"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Community <span className="text-indigo-400">Feedback</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Share your thoughts and join the conversation
          </p>
        </motion.div>

        <Komentar />
      </div>

      {/* CTA Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <motion.div
          className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center border border-white/10"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4">
            Start Your Journey Today
          </h2>
          <p className="text-base sm:text-lg text-gray-400 mb-6 sm:mb-8 max-w-2xl mx-auto">
            Join {stats.users.toLocaleString()}+ developers building their professional identity
          </p>
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold text-base sm:text-lg"
            >
              <span>Create Free Account</span>
              <Rocket className="w-4 h-4 sm:w-5 sm:h-5" />
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
}

export default LandingPage
