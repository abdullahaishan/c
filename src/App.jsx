import React from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom"
import "./index.css"

// صفحة بسيطة جداً للاختبار
const SimplePage = () => {
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#030014',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      textAlign: 'center'
    }}>
      <h1 style={{ fontSize: '48px', marginBottom: '20px', background: 'linear-gradient(to right, #6366f1, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        PortfolioAI
      </h1>
      <p style={{ fontSize: '20px', color: '#9ca3af', marginBottom: '40px' }}>
        منصة المطورين المتكاملة
      </p>
      <div style={{ display: 'flex', gap: '20px' }}>
        <a href="/login" style={{ padding: '12px 24px', background: 'linear-gradient(to right, #6366f1, #a855f7)', color: 'white', borderRadius: '8px', textDecoration: 'none' }}>
          تسجيل دخول
        </a>
        <a href="/register" style={{ padding: '12px 24px', background: 'rgba(255,255,255,0.1)', color: 'white', borderRadius: '8px', textDecoration: 'none' }}>
          حساب جديد
        </a>
      </div>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SimplePage />} />
        <Route path="/login" element={<SimplePage />} />
        <Route path="/register" element={<SimplePage />} />
        <Route path="*" element={<SimplePage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
