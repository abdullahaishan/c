import { BrowserRouter, Routes, Route } from "react-router-dom"
import React, { useState } from 'react'
import "./index.css"

// الصفحات الحالية
import Home from "./pages/Home"
import About from "./pages/About"
import AnimatedBackground from "./components/Background"
import Navbar from "./components/Navbar"
import Portofolio from "./pages/Portofolio"
import ContactPage from "./pages/Contact"
import ProjectDetails from "./components/ProjectDetail"
import WelcomeScreen from "./pages/WelcomeScreen"
import ThankYouPage from "./pages/ThankYou"

// المكونات الجديدة
import { DeveloperProvider, useDeveloper } from './context/DeveloperContext'
import LoadingScreen from './components/LoadingScreen'
import ProtectedRoute from './components/ProtectedRoute'

// صفحات النظام الجديدة
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import DashboardLayout from './pages/dashboard/DashboardLayout'
import Overview from './pages/dashboard/Overview'
import Projects from './pages/dashboard/Projects'
import Skills from './pages/dashboard/Skills'
import Certificates from './pages/dashboard/Certificates'
import Experience from './pages/dashboard/Experience'
import Education from './pages/dashboard/Education'
import Settings from './pages/dashboard/Settings'
import PlansPage from './pages/plans/PlansPage'

// صفحة الخطأ 404
import NotFound from './pages/NotFound'

import { AnimatePresence } from 'framer-motion'

// تخطيط الصفحة الرئيسية
const MainLayout = ({ children, showWelcome, setShowWelcome }) => {
  const { loading, error } = useDeveloper()

  if (loading) {
    return <LoadingScreen />
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#030014] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">404</h1>
          <p className="text-gray-400">{error}</p>
        </div>
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
        <>
          <Navbar />
          <AnimatedBackground />
          {children}
          <footer>
            <center>
              <hr className="my-3 border-gray-400 opacity-15 sm:mx-auto lg:my-6 text-center" />
              <span className="block text-sm pb-4 text-gray-500 text-center dark:text-gray-400">
                © 2025 Portfolio Platform. All Rights Reserved.
              </span>
            </center>
          </footer>
        </>
      )}
    </>
  )
}

function App() {
  const [showWelcome, setShowWelcome] = useState(true)

  return (
    <DeveloperProvider>
      <BrowserRouter>
        <Routes>
          
          <Route path="/" element={
  <MainLayout showWelcome={showWelcome} setShowWelcome={setShowWelcome}>
    <Home />
    <About />
  </MainLayout>
} />
          <Route path="/u/:username" element={
            <MainLayout showWelcome={showWelcome} setShowWelcome={setShowWelcome}>
              <Home />
              <About />
              <Portofolio />
              <ContactPage />
            </MainLayout>
          } />
          
          <Route path="/project/:id" element={<ProjectDetails />} />
          <Route path="/u/:username/project/:id" element={<ProjectDetails />} />
          
          <Route path="/thank-you" element={<ThankYouPage />} />
          
          {/* مسارات المصادقة */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* مسارات لوحة التحكم (محمية) */}
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
          
          {/* صفحة الباقات */}
          <Route path="/plans" element={<PlansPage />} />
          
          {/* صفحة 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </DeveloperProvider>
  );
}

export default App;
