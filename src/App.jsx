import React, { useState } from 'react'
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
import Opportunities from './pages/dashboard/Opportunities'
import NotFound from './pages/NotFound'

// Providers
import { DeveloperProvider } from './context/DeveloperContext'
import { useAuth } from './hooks/useAuth'

const AppRoutes = () => {
  const [showWelcome, setShowWelcome] = useState(true)
  const { user, loading } = useAuth()

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
          {/* الصفحة الرئيسية - توجيه ذكي */}
          <Route 
            path="/" 
            element={
              user ? <Navigate to="/dashboard" replace /> : <LandingPage />
            } 
          />
          
          {/* مسارات المصادقة */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* AI Builder - للمستخدمين المسجلين */}
          <Route 
            path="/app/builder" 
            element={
              <ProtectedRoute>
                <Builder />
              </ProtectedRoute>
            } 
          />
          
          {/* لوحة التحكم - للمستخدمين المسجلين */}
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
          
          {/* صفحة 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      )}
    </>
  )
}

function App() {
  return (
    <DeveloperProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AppRoutes />
      </BrowserRouter>
    </DeveloperProvider>
  )
}

export default App
