import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Tilt from 'react-parallax-tilt'
import Confetti from 'react-confetti'
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
  Coffee,
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
  Flower,
  Tree,
  Mountain
} from 'lucide-react'
import AOS from 'aos'
import 'aos/dist/aos.css'
import { supabase } from '../lib/supabase'

// مكون الرقم المتحرك
const AnimatedNumber = ({ value }) => {
  const [count, setCount] = useState(0)
  const { ref, inView } = useInView({ triggerOnce: true })

  useEffect(() => {
    if (inView) {
      let start = 0
      const end = parseInt(value.replace(/[^0-9]/g, ''))
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
      {count}
      {value.includes('+') && '+'}
      {value.includes('%') && '%'}
      {value.includes('K') && 'K'}
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

// مكون الصورة الشخصية المتحركة
const ProfileCard = ({ profile, index }) => {
  const [showConfetti, setShowConfetti] = useState(false)
  
  const emojis = [
    <Star className="w-4 h-4 text-yellow-400" />,
    <Crown className="w-4 h-4 text-yellow-500" />,
    <Gem className="w-4 h-4 text-purple-400" />,
    <Flame className="w-4 h-4 text-orange-500" />,
    <Brain className="w-4 h-4 text-blue-400" />,
    <Target className="w-4 h-4 text-red-400" />,
    <Compass className="w-4 h-4 text-green-400" />,
    <Feather className="w-4 h-4 text-indigo-400" />,
    <Wind className="w-4 h-4 text-cyan-400" />,
    <Sun className="w-4 h-4 text-yellow-400" />,
    <Moon className="w-4 h-4 text-gray-400" />,
    <Cloud className="w-4 h-4 text-blue-300" />,
    <Droplet className="w-4 h-4 text-blue-500" />,
    <Leaf className="w-4 h-4 text-green-500" />,
    <Flower className="w-4 h-4 text-pink-400" />,
    <Tree className="w-4 h-4 text-green-600" />,
    <Mountain className="w-4 h-4 text-gray-500" />
  ]

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
      whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ 
        duration: 0.8, 
        delay: index * 0.2,
        type: "spring",
        stiffness: 100
      }}
      whileHover={{ 
        scale: 1.1, 
        rotate: 2,
        transition: { duration: 0.3 }
      }}
      viewport={{ once: true }}
    >
      <Tilt
        tiltMaxAngleX={15}
        tiltMaxAngleY={15}
        perspective={1000}
        scale={1}
        transitionSpeed={2000}
        glareEnable={true}
        glareMaxOpacity={0.3}
        glareColor="#a855f7"
      >
        <Link
          to={`/u/${profile.username}`}
          className="group relative block bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/20 overflow-hidden"
          onMouseEnter={() => setShowConfetti(true)}
          onMouseLeave={() => setShowConfetti(false)}
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
          
          {/* تأثير الكونفيتي عند التحويم */}
          {showConfetti && (
            <Confetti
              width={300}
              height={300}
              numberOfPieces={20}
              recycle={false}
              colors={['#6366f1', '#a855f7', '#f59e0b', '#10b981']}
            />
          )}

          <div className="relative z-10">
            <div className="flex items-start gap-4">
              {/* الصورة مع تأثيرات */}
              <motion.div
                className="relative"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 1 }}
              >
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
                
                {/* أيقونة عائمة */}
                <motion.div
                  className="absolute -top-2 -right-2"
                  animate={{
                    y: [0, -5, 0],
                    rotate: [0, 10, 0]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity
                  }}
                >
                  <div className="w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg">
                    {emojis[index % emojis.length]}
                  </div>
                </motion.div>
              </motion.div>

              {/* معلومات الملف */}
              <div className="flex-1 min-w-0">
                <motion.h3 
                  className="text-lg font-semibold text-white mb-1 truncate"
                  whileHover={{ x: 5 }}
                >
                  {profile.full_name}
                </motion.h3>
                
                {profile.title && (
                  <motion.p 
                    className="text-sm text-gray-400 mb-2 truncate"
                    animate={{ opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    {profile.title}
                  </motion.p>
                )}
                
                {/* إحصائيات متحركة */}
                <motion.div 
                  className="flex items-center gap-3 text-xs text-gray-500"
                  whileHover={{ scale: 1.1 }}
                >
                  <motion.div 
                    className="flex items-center gap-1"
                    whileHover={{ color: '#6366f1' }}
                  >
                    <Eye className="w-3 h-3" />
                    <span>{profile.views_count || 0}</span>
                  </motion.div>
                  <motion.div 
                    className="flex items-center gap-1"
                    whileHover={{ color: '#a855f7' }}
                  >
                    <Heart className="w-3 h-3" />
                    <span>{profile.likes_count || 0}</span>
                  </motion.div>
                </motion.div>
              </div>

              {/* سهم متحرك */}
              <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-[#a855f7]" />
              </motion.div>
            </div>
          </div>
        </Link>
      </Tilt>
    </motion.div>
  )
}

const LandingPage = () => {
  const [stats, setStats] = useState({
    users: 0,
    portfolios: 0,
    profiles: []
  })

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
      const { count: usersCount } = await supabase
        .from('developers')
        .select('*', { count: 'exact', head: true })

      const { count: portfoliosCount } = await supabase
        .from('portfolios')
        .select('*', { count: 'exact', head: true })
        .eq('is_published', true)

      const { data: profiles } = await supabase
        .from('developers')
        .select(`
          id,
          full_name,
          username,
          profile_image,
          title,
          views_count,
          likes_count,
          plan_id
        `)
        .eq('is_active', true)
        .not('plan_id', 'eq', 1)
        .order('views_count', { ascending: false })
        .limit(6)

      setStats({
        users: usersCount || 0,
        portfolios: portfoliosCount || 0,
        profiles: profiles || []
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#030014] via-[#0a0a1f] to-[#030014] overflow-hidden">
      {/* Hero Section */}
      <motion.div 
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
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
                    strings: [`${stats.users}+ مستخدم يثقون بنا`, 'منصة المطورين المحترفين'],
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
                  to="/u/eki"
                  className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-white/5 backdrop-blur-sm border border-white/20 text-white rounded-xl font-semibold text-base sm:text-lg hover:bg-white/10 transition-all"
                >
                  شاهد مثالاً حياً
                </Link>
              </motion.div>
            </motion.div>

            {/* شارات المميزات */}
            <motion.div 
              className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm text-gray-400 px-4"
              initial={{ y: 30, opacity: 0 }}
              animate={heroInView ? { y: 0, opacity: 1 } : {}}
              transition={{ duration: 0.8, delay: 1 }}
            >
              {[
                { icon: Zap, text: 'سرعة فائقة', color: 'text-yellow-500' },
                { icon: Shield, text: 'خصوصية كاملة', color: 'text-green-500' },
                { icon: Globe, text: 'نطاق مخصص', color: 'text-blue-500' }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  className="flex items-center gap-2"
                  whileHover={{ scale: 1.1, color: '#fff' }}
                >
                  <item.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${item.color}`} />
                  <span>{item.text}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* إحصائيات متحركة */}
      <div ref={statsRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          {[
            { value: `${stats.users}+`, label: 'مستخدم نشط', color: 'from-[#6366f1] to-[#a855f7]' },
            { value: `${stats.portfolios}+`, label: 'بورتفليو منشور', color: 'from-[#a855f7] to-[#f59e0b]' },
            { value: '50+', label: 'قالب احترافي', color: 'from-[#10b981] to-[#6366f1]' },
            { value: '95%', label: 'رضا العملاء', color: 'from-[#f59e0b] to-[#a855f7]' }
          ].map((stat, index) => (
            <motion.div
              key={index}
              className="text-center"
              initial={{ opacity: 0, y: 50 }}
              animate={statsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.2 }}
            >
              <motion.div
                className={`text-3xl sm:text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${stat.color} mb-2`}
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: index * 0.5
                }}
              >
                <AnimatedNumber value={stat.value} />
              </motion.div>
              <div className="text-sm text-gray-400">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* الملفات الشخصية المميزة */}
      {stats.profiles.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              <span className="text-[#a855f7]">ملفات شخصية</span> مميزة
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              اكتشف أبرز الملفات الشخصية للمطورين المحترفين
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {stats.profiles.map((profile, index) => (
              <ProfileCard key={profile.id} profile={profile} index={index} />
            ))}
          </div>
        </div>
      )}

      {/* باقي الأقسام مع إضافة تأثيرات مشابهة... */}
      {/* يمكن إضافة نفس التأثيرات لبقية الأقسام بنفس النمط */}

    </div>
  )
}

export default LandingPage
