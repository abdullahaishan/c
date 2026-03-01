import { useParams, useLocation } from "react-router-dom" // ✅ أضف useLocation هنا
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

// صفحات الأدمن
import AdminLogin from './pages/admin/Login'
import AdminLayout from './pages/admin/AdminLayout'
import AdminOverview from './pages/admin/Overview'
import AdminDevelopers from './pages/admin/Developers'
import AdminPlans from './pages/admin/Plans'
import AdminPayments from './pages/admin/Payments'
import AdminMessages from './pages/admin/Messages'
import AdminUpgradeRequests from './pages/admin/UpgradeRequests'

// صفحات التأكيد
import VerifyEmail from './pages/auth/VerifyEmail'
import ConfirmEmail from './pages/auth/ConfirmEmail'

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
  const location = useLocation()
  const { user, loading } = useAuth()
  const [redirectTo, setRedirectTo] = useState(null)
  
  // ✅ تعريف showWelcome بشكل صحيح
  const [showWelcome, setShowWelcome] = useState(() => {
    // لا تظهر شاشة الترحيب في صفحات معينة
    const noWelcomePaths = ['/confirm', '/verify-email', '/login', '/register']
    if (noWelcomePaths.includes(location.pathname)) {
      return false
    }
    
    const hasSeenWelcome = sessionStorage.getItem('hasSeenWelcome')
    return hasSeenWelcome !== 'true'
  })

  const handleWelcomeComplete = () => {
    sessionStorage.setItem('hasSeenWelcome', 'true')
    
    if (user) {
      setRedirectTo('/dashboard')
    } else {
      setShowWelcome(false)
    }
  }

  if (redirectTo) {
    return <Navigate to={redirectTo} replace />
  }

  // ✅ صفحات التأكيد تظهر دائماً حتى أثناء التحميل
  if (location.pathname === '/confirm' || location.pathname === '/verify-email') {
    return (
      <Routes>
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/confirm" element={<ConfirmEmail />} />
      </Routes>
    )
  }

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
          {/* ========== الصفحات العامة ========== */}
          <Route 
            path="/" 
            element={
              user ? <Navigate to="/dashboard" replace /> : <LandingPage />
            } 
          />
          
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/u/:username" element={<PublicPortfolioWrapper />} />
          <Route path="/project/:id" element={<ProjectDetail />} />
          
          {/* ========== AI Builder ========== */}
          <Route 
            path="/app/builder" 
            element={
              <ProtectedRoute>
                <Builder />
              </ProtectedRoute>
            } 
          />
          
          {/* ========== لوحة تحكم المستخدم ========== */}
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
          
          {/* ========== صفحات الأدمن ========== */}
          <Route path="/admin/login" element={<AdminLogin />} />
          
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute adminOnly>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminOverview />} />
            <Route path="developers" element={<AdminDevelopers />} />
            <Route path="plans" element={<AdminPlans />} />
            <Route path="payments" element={<AdminPayments />} />
            <Route path="messages" element={<AdminMessages />} />
            <Route path="upgrade-requests" element={<AdminUpgradeRequests />} />
          </Route>
          
          {/* ========== 404 ========== */}
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
