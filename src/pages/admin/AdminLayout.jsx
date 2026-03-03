import React from 'react'
import { Outlet } from 'react-router-dom'

const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-[#030014] p-8">
      <h1 className="text-3xl text-white text-center">✅ AdminLayout يعمل بنجاح</h1>
      <div className="mt-8">
        <Outlet />
      </div>
    </div>
  )
}

export default AdminLayout
