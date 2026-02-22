import React from 'react'
import { Link } from 'react-router-dom'
import { Home, AlertCircle } from 'lucide-react'

const NotFound = () => {
  return (
    <div className="min-h-screen bg-[#030014] flex items-center justify-center px-4">
      <div className="text-center">
        {/* Animated 404 */}
        <div className="relative mb-8">
          <h1 className="text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#6366f1] to-[#a855f7]">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center opacity-20">
            <AlertCircle className="w-32 h-32 text-[#a855f7]" />
          </div>
        </div>

        {/* Message */}
        <h2 className="text-3xl font-bold text-white mb-4">Page Not Found</h2>
        <p className="text-gray-400 text-lg mb-8 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="px-6 py-3 bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:scale-[1.02] transition-all"
          >
            <Home className="w-5 h-5" />
            Back to Home
          </Link>
          <Link
            to="/dashboard"
            className="px-6 py-3 bg-white/5 border border-white/10 text-white rounded-xl font-semibold hover:bg-white/10 transition-all"
          >
            Go to Dashboard
          </Link>
        </div>

        {/* Developer Link */}
        <div className="mt-12">
          <Link
            to="/u/eki"
            className="text-sm text-gray-500 hover:text-[#a855f7] transition-colors"
          >
            Visit Developer Profile →
          </Link>
        </div>
      </div>
    </div>
  )
}

export default NotFound