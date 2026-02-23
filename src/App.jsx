import React, { useState } from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { AnimatePresence } from 'framer-motion'
import "./index.css"
    
// الصفحات العامة
import WelcomeScreen from './pages/WelcomeScreen'
import LandingPage from './pages/LandingPage'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'

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

// صفحة 404
import NotFound from './pages/NotFound'

// Providers
import { DeveloperProvider } from './context/DeveloperContext'

function App() {
  const [showWelcome, setShowWelcome] = useState(true)

  return (
    <DeveloperProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
  
        <AnimatePresence mode="wait">
          {showWelcome && (
            <WelcomeScreen onLoadingComplete={() => setShowWelcome(false)} />
          )}
        </AnimatePresence>

        {!showWelcome && (
          <Routes>
            {/* الصفحات العامة */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* لوحة التحكم (محمية) */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Overview />} />
              <Route path="projects" element={<Projects />} />
              <Route path="skills" element={<Skills />} />
              <Route path="certificates" element={<Certificates />} />
              <Route path="experience" element={<Experience />} />
              <Route path="education" element={<Education />} />
              <Route path="settings" element={<Settings />} />
            </Route>
            
            {/* صفحة 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        )}
      </BrowserRouter>
    </DeveloperProvider>
  )
}

export default App
