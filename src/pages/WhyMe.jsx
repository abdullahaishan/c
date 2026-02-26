import React, { useEffect, useMemo } from "react";
import {
  Shield,
  Cpu,
  Database,
  Lock,
  Users,
  Clock,
  Zap,
  Globe,
  Award,
  Heart,
  Code,
  Smartphone,
  Cloud,
  GitBranch,
  Layers,
  Target
} from "lucide-react";
import AOS from "aos";
import "aos/dist/aos.css";
import { useDeveloper } from '../context/DeveloperContext';

// مكون بطاقة الميزة
const FeatureCard = ({ icon: Icon, title, description, color, index }) => {
  const gradientColors = {
    blue: 'from-blue-500 to-cyan-500',
    purple: 'from-purple-500 to-pink-500',
    green: 'from-green-500 to-emerald-500',
    yellow: 'from-yellow-500 to-orange-500',
    red: 'from-red-500 to-rose-500',
    indigo: 'from-indigo-500 to-purple-500',
  };

  const selectedColor = gradientColors[color] || gradientColors.blue;

  return (
    <div
      className="group relative bg-white/5 rounded-2xl p-6 border border-white/10 hover:border-transparent transition-all duration-500 overflow-hidden"
      data-aos="fade-up"
      data-aos-delay={index * 100}
    >
      {/* خلفية متدرجة عند التمرير */}
      <div className={`absolute inset-0 bg-gradient-to-br ${selectedColor} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
      
      {/* أيقونة */}
      <div className={`relative w-14 h-14 rounded-xl bg-gradient-to-r ${selectedColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
        <Icon className="w-7 h-7 text-white" />
      </div>
      
      {/* العنوان */}
      <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-300 transition-all duration-300">
        {title}
      </h3>
      
      {/* الوصف */}
      <p className="text-gray-400 text-sm leading-relaxed">
        {description}
      </p>

      {/* خط سفلي متحرك */}
      <div className={`absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r ${selectedColor} group-hover:w-full transition-all duration-500`}></div>
    </div>
  );
};

// مكون بطاقة الإحصائيات
const StatCard = ({ value, label, icon: Icon, color }) => {
  const gradientColors = {
    blue: 'from-blue-500 to-cyan-500',
    purple: 'from-purple-500 to-pink-500',
    green: 'from-green-500 to-emerald-500',
    yellow: 'from-yellow-500 to-orange-500',
  };

  const selectedColor = gradientColors[color] || gradientColors.blue;

  return (
    <div className="text-center p-6 bg-white/5 rounded-xl border border-white/10 hover:border-[#6366f1]/50 transition-all group">
      <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${selectedColor} bg-opacity-20 mb-3 group-hover:scale-110 transition-transform`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className="text-3xl font-bold text-[#a855f7] mb-1">{value}</div>
      <div className="text-sm text-gray-400">{label}</div>
    </div>
  );
};

// مكون شريط التقدم
const ProgressBar = ({ label, percentage, color }) => {
  const gradientColors = {
    blue: 'from-blue-500 to-cyan-500',
    purple: 'from-purple-500 to-pink-500',
    green: 'from-green-500 to-emerald-500',
  };

  const selectedColor = gradientColors[color] || gradientColors.blue;

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-gray-300">{label}</span>
        <span className="text-white font-medium">{percentage}%</span>
      </div>
      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${selectedColor} transition-all duration-1000`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

// المكون الرئيسي
const WhyMe = ({ developer: propDeveloper }) => {
  const context = useDeveloper();
  const developer = propDeveloper || context.publicDeveloper;
  const { getSkills, getTotalExperienceYears, getProjects, isFreePlan } = context;

  // حساب الإحصائيات
  const stats = useMemo(() => {
    const skills = getSkills();
    const projects = getProjects();
    const totalYears = getTotalExperienceYears();

    // حساب متوسط الإتقان
    const avgProficiency = skills.length > 0
      ? Math.round(skills.reduce((acc, s) => acc + s.proficiency, 0) / skills.length)
      : 85;

    return {
      experience: totalYears || 5,
      projects: projects.length || 15,
      skills: skills.length || 20,
      satisfaction: 98,
      avgProficiency,
      clients: 25
    };
  }, [developer]);

  // قائمة المميزات
  const features = [
    {
      icon: Shield,
      title: "Clean Architecture",
      description: "I build scalable and maintainable applications with clean, modular code structure following industry best practices.",
      color: "blue"
    },
    {
      icon: Cpu,
      title: "Performance Optimized",
      description: "Every line of code is optimized for maximum performance, ensuring fast load times and smooth user experiences.",
      color: "purple"
    },
    {
      icon: Lock,
      title: "Security First",
      description: "Implementing robust security measures to protect your data and applications from potential threats.",
      color: "green"
    },
    {
      icon: Clock,
      title: "On-Time Delivery",
      description: "I respect deadlines and always deliver projects on time without compromising on quality.",
      color: "yellow"
    },
    {
      icon: Smartphone,
      title: "Responsive Design",
      description: "Creating seamless experiences across all devices - from mobile phones to desktop screens.",
      color: "red"
    },
    {
      icon: Cloud,
      title: "Cloud Integration",
      description: "Expertise in integrating cloud services like Firebase, AWS, and Supabase for scalable solutions.",
      color: "indigo"
    },
    {
      icon: GitBranch,
      title: "Version Control",
      description: "Professional Git workflow with proper branching strategy and code review processes.",
      color: "blue"
    },
    {
      icon: Layers,
      title: "Scalable Solutions",
      description: "Building applications that can grow with your business needs without technical debt.",
      color: "purple"
    },
    {
      icon: Target,
      title: "Problem Solver",
      description: "Strong analytical skills to identify and solve complex technical challenges efficiently.",
      color: "green"
    }
  ];

  // إحصائيات إضافية
  const additionalStats = [
    { value: stats.experience + "+", label: "Years Experience", icon: Award, color: "blue" },
    { value: stats.projects + "+", label: "Projects Completed", icon: Code, color: "purple" },
    { value: stats.clients + "+", label: "Happy Clients", icon: Users, color: "green" },
    { value: "24/7", label: "Support Available", icon: Clock, color: "yellow" }
  ];

  useEffect(() => {
    AOS.init({ once: false });
  }, []);

  return (
    <div className="relative min-h-screen bg-[#030014] overflow-hidden" id="WhyMe">
      <div className="container mx-auto px-[5%] py-20">
        {/* Header */}
        <div className="text-center mb-12" data-aos="fade-up">
          <h2 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#6366f1] to-[#a855f7] mb-4">
            Why Choose Me?
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            I combine technical expertise with creative problem-solving to deliver exceptional results
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16" data-aos="fade-up">
          {additionalStats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        {/* Key Strengths Progress */}
        <div className="grid md:grid-cols-2 gap-8 mb-16" data-aos="fade-up">
          <div className="bg-white/5 rounded-2xl p-8 border border-white/10">
            <h3 className="text-2xl font-semibold text-white mb-6">Core Strengths</h3>
            <div className="space-y-4">
              <ProgressBar label="Code Quality" percentage={98} color="blue" />
              <ProgressBar label="Performance" percentage={95} color="purple" />
              <ProgressBar label="Security" percentage={92} color="green" />
              <ProgressBar label="User Experience" percentage={96} color="blue" />
            </div>
          </div>

          <div className="bg-white/5 rounded-2xl p-8 border border-white/10">
            <h3 className="text-2xl font-semibold text-white mb-6">Technical Proficiency</h3>
            <div className="space-y-4">
              <ProgressBar label="Frontend Development" percentage={stats.avgProficiency} color="blue" />
              <ProgressBar label="Backend Integration" percentage={88} color="purple" />
              <ProgressBar label="Database Design" percentage={85} color="green" />
              <ProgressBar label="DevOps & Deployment" percentage={82} color="blue" />
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} index={index} />
          ))}
        </div>

        {/* Testimonial/Quote Section */}
        <div className="mt-16 p-8 bg-gradient-to-r from-[#6366f1]/10 to-[#a855f7]/10 rounded-2xl border border-white/10 text-center" data-aos="fade-up">
          <Heart className="w-12 h-12 text-[#a855f7] mx-auto mb-4 opacity-50" />
          <p className="text-xl text-gray-300 italic max-w-3xl mx-auto">
            "I don't just write code – I create solutions that make a difference. 
            Every project is an opportunity to innovate and deliver value."
          </p>
          <div className="mt-4 text-white font-semibold">
            {developer?.full_name || "Your Developer"}
          </div>
          <div className="text-sm text-gray-400">
            {stats.experience}+ Years of Experience
          </div>
        </div>

        {/* Free Plan Notice */}
        {isFreePlan && (
          <div className="mt-8 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-center">
            <p className="text-yellow-400 text-sm">
              ✨ You're on the Free Plan - Some premium features are limited
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WhyMe;
