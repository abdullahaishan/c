import React, { useState } from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { AnimatePresence } from 'framer-motion'
import "./index.css"
import WelcomeScreen from './pages/WelcomeScreen'
import LandingPage from './pages/LandingPage'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'

function App() {
  const [showWelcome, setShowWelcome] = useState(true)

  return (
    <BrowserRouter>
      <AnimatePresence mode="wait">
        {showWelcome && (
          <WelcomeScreen onLoadingComplete={() => setShowWelcome(false)} />
        )}
      </AnimatePresence>

      {!showWelcome && (
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      )}
    </BrowserRouter>
  )
}

export default App
