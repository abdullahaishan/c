import { BrowserRouter, Routes, Route } from "react-router-dom"
import React from 'react'
import "./index.css"

// فقط صفحات المصادقة
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import { DeveloperProvider } from './context/DeveloperContext'

function App() {
  return (
    <DeveloperProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<div style={{ 
            minHeight: '100vh', 
            background: '#030014', 
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: '20px'
          }}>
            <h1 style={{ fontSize: '2rem' }}>اختر:</h1>
            <div style={{ display: 'flex', gap: '20px' }}>
              <a href="/login" style={{ 
                padding: '10px 20px', 
                background: 'linear-gradient(to right, #6366f1, #a855f7)',
                color: 'white',
                borderRadius: '8px',
                textDecoration: 'none'
              }}>تسجيل دخول</a>
              <a href="/register" style={{ 
                padding: '10px 20px', 
                background: 'rgba(255,255,255,0.1)',
                color: 'white',
                borderRadius: '8px',
                textDecoration: 'none'
              }}>حساب جديد</a>
            </div>
          </div>} />
        </Routes>
      </BrowserRouter>
    </DeveloperProvider>
  )
}

export default App
