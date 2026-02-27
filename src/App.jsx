import { useParams } from "react-router-dom"
import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { AnimatePresence } from 'framer-motion'
import "./index.css"
import { logError } from './utils/Logger';
import CrashReporter from './components/CrashReporter';

// الصفحات العامة
import WelcomeScreen from './pages/WelcomeScreen'
import LandingPage from './pages/LandingPage'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'

// AI Builder
import Builder from './pages/Builder'

// الصفحة العامة للمطور
import PublicPortfolio from './pages/PublicPortfolio'

// صفحات لوحة التحكم
import ProtectedRoute from './components/ProtectedRoute'
import DashboardLayout from './pages/dashboard/DashboardLayout'
import Overview from './pages/dashboard/Overview'
import Projects from './pages/dashboard/Projects'
import Skills from './pages/dashboard/Skills'
import Certificates from './pages/dashboard/Certificates'
import Experience from './pages/dashboard/Experience'
import Education from './pages/dashboard/Education'
import Settings from './pages/dashboard/Settings'
import PlanStatus from './pages/dashboard/PlanStatus'
import Messages from './pages/dashboard/Messages'
import NotFound from './pages/NotFound'

// صفحات المشروع
import ProjectDetail from './components/ProjectDetail'

// Provider
import { DeveloperProvider } from './context/DeveloperContext'
import { useAuth } from './hooks/useAuth'

const PublicPortfolioWrapper = () => {
  const { username } = useParams()
  return (
    <DeveloperProvider username={username}>
      <PublicPortfolio />
    </DeveloperProvider>
  )
}

const AppRoutes = () => {
  const [showWelcome, setShowWelcome] = useState(true)
  const { user, loading } = useAuth()

  useEffect(() => {
    // تسجيل بداية التطبيق
    console.log('🚀 App started at:', new Date().toISOString());
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030014] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#6366f1]/20 border-t-[#6366f1] rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <>
      <AnimatePresence mode="wait">
        {showWelcome && (
          <WelcomeScreen onLoadingComplete={() => setShowWelcome(false)} />
        )}
      </AnimatePresence>

      {!showWelcome && (
        <Routes>
          {/* الصفحة الرئيسية */}
          <Route 
            path="/" 
            element={
              user ? <Navigate to="/dashboard" replace /> : <LandingPage />
            } 
          />
          
          {/* المصادقة */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* ⭐ الصفحة العامة للمطور */}
          <Route 
            path="/u/:username" 
            element={<PublicPortfolioWrapper />} 
          />
          
          {/* تفاصيل مشروع */}
          <Route path="/project/:id" element={<ProjectDetail />} />
          
          {/* AI Builder */}
          <Route 
            path="/app/builder" 
            element={
              <ProtectedRoute>
                <Builder />
              </ProtectedRoute>
            } 
          />
          
          {/* لوحة التحكم */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Overview />} />
            <Route path="projects" element={<Projects />} />
            <Route path="skills" element={<Skills />} />
            <Route path="certificates" element={<Certificates />} />
            <Route path="experience" element={<Experience />} />
            <Route path="education" element={<Education />} />
            <Route path="settings" element={<Settings />} />
            <Route path="plan-status" element={<PlanStatus />} />
            <Route path="messages" element={<Messages />} />
          </Route>
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      )}
      
      {/* ✅ زر تتبع الأخطاء - خارج Routes حتى يظهر في كل الصفحات */}
      <CrashReporter />
    </>
  )
}

function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AppRoutes />
    </BrowserRouter>
  )
}

export default App
