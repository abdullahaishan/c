import React, { useState } from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { AnimatePresence } from 'framer-motion'
import "./index.css"
import WelcomeScreen from './pages/WelcomeScreen'
import LandingPage from './pages/LandingPage'

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
          <Route path="/login" element={<LandingPage />} />
          <Route path="/register" element={<LandingPage />} />
        </Routes>
      )}
    </BrowserRouter>
  )
}

export default App
