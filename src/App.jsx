import { useParams } from "react-router-dom"
import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { AnimatePresence } from 'framer-motion'
import "./index.css"

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

import AdminLayout from './pages/admin/AdminLayout'
import AdminOverview from './pages/admin/Overview'
import AdminDevelopers from './pages/admin/Developers'
import AdminPlans from './pages/admin/Plans'
import AdminPayments from './pages/admin/Payments'

  <Route index element={<AdminOverview />} />
  <Route path="developers" element={<AdminDevelopers />} />
  <Route path="plans" element={<AdminPlans />} />
  <Route path="payments" element={<AdminPayments />} />
</Route>
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
  // ✅ نتحقق من sessionStorage أولاً
  const [showWelcome, setShowWelcome] = useState(() => {
    // هل شاهد المستخدم الشاشة من قبل في هذه الجلسة؟
    const hasSeenWelcome = sessionStorage.getItem('hasSeenWelcome')
    return hasSeenWelcome !== 'true' // إذا لم يشاهدها، نعرضها
  })
  
  const { user, loading } = useAuth()
  const [redirectTo, setRedirectTo] = useState(null)

  // عند انتهاء شاشة الترحيب
  const handleWelcomeComplete = () => {
    // ✅ نسجل أنه شاهد الشاشة
    sessionStorage.setItem('hasSeenWelcome', 'true')
    
    if (user) {
      setRedirectTo('/dashboard')
    } else {
      setShowWelcome(false)
    }
  }

  // إذا كان فيه توجيه، ننفذه
  if (redirectTo) {
    return <Navigate to={redirectTo} replace />
  }

  // أثناء التحميل، نظهر شاشة الترحيب فقط إذا لم يشاهدها من قبل
  if (loading && showWelcome) {
    return <WelcomeScreen onLoadingComplete={handleWelcomeComplete} />
  }

  return (
    <>
      <AnimatePresence mode="wait">
        {showWelcome && (
          <WelcomeScreen onLoadingComplete={handleWelcomeComplete} />
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
          <Route 
  path="/admin" 
  element={
    <ProtectedRoute adminOnly>
      <AdminLayout />
    </ProtectedRoute>
  }
>
          {/* المصادقة */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* الصفحة العامة للمطور */}
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
