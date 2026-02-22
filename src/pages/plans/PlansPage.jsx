import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { PLANS } from '../../utils/constants'
import { Check, Sparkles, Crown, Zap, Infinity, ArrowRight } from 'lucide-react'
import PaymentModal from './PaymentModel.jsx';

const PlansPage = () => {
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [showPayment, setShowPayment] = useState(false)
  const [billingCycle, setBillingCycle] = useState('monthly') // monthly, yearly
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const handleSelectPlan = (plan) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/plans' } })
      return
    }
    setSelectedPlan(plan)
    setShowPayment(true)
  }

  // حساب السعر حسب الدورة
  const getPrice = (plan) => {
    if (billingCycle === 'yearly' && plan.price_yearly) {
      return plan.price_yearly
    }
    return plan.price_monthly || plan.price
  }

  const getSavings = (plan) => {
    if (billingCycle === 'yearly' && plan.price_yearly && plan.price_monthly) {
      const monthlyTotal = plan.price_monthly * 12
      const savings = monthlyTotal - plan.price_yearly
      return Math.round((savings / monthlyTotal) * 100)
    }
    return 0
  }

  return (
    <div className="min-h-screen bg-[#030014] py-20 px-4">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#6366f1] to-[#a855f7] mb-4">
          Choose Your Plan
        </h1>
        <p className="text-gray-400 text-xl max-w-2xl mx-auto">
          Unlock more features and showcase your portfolio like a pro
        </p>
      </div>

      {/* Billing Toggle */}
      <div className="flex items-center justify-center gap-4 mb-12">
        <button
          onClick={() => setBillingCycle('monthly')}
          className={`px-6 py-2 rounded-full transition-all ${
            billingCycle === 'monthly'
              ? 'bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white'
              : 'bg-white/5 text-gray-400 hover:bg-white/10'
          }`}
        >
          Monthly
        </button>
        <button
          onClick={() => setBillingCycle('yearly')}
          className={`px-6 py-2 rounded-full transition-all relative ${
            billingCycle === 'yearly'
              ? 'bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white'
              : 'bg-white/5 text-gray-400 hover:bg-white/10'
          }`}
        >
          Yearly
          <span className="absolute -top-2 -right-2 px-2 py-0.5 bg-green-500 text-white text-xs rounded-full">
            Save 20%
          </span>
        </button>
      </div>

      {/* Plans Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`relative bg-white/5 backdrop-blur-xl rounded-2xl border ${
              plan.isPopular
                ? 'border-[#a855f7] shadow-[0_0_30px_rgba(168,85,247,0.3)]'
                : 'border-white/10'
            } p-8 hover:scale-105 transition-all duration-300 group`}
          >
            {/* Popular Badge */}
            {plan.isPopular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white px-4 py-1 rounded-full text-sm font-bold whitespace-nowrap">
                Most Popular
              </div>
            )}

            {/* Plan Icon */}
            <div className="mb-6">
              {plan.id === 1 && <Zap className="w-12 h-12 text-blue-400" />}
              {plan.id === 2 && <Sparkles className="w-12 h-12 text-purple-400" />}
              {plan.id === 3 && <Crown className="w-12 h-12 text-yellow-400" />}
              {plan.id === 4 && <Infinity className="w-12 h-12 text-green-400" />}
            </div>

            {/* Plan Name */}
            <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
            <p className="text-gray-400 text-sm mb-4">{plan.name_ar}</p>

            {/* Price */}
            <div className="mb-6">
              <span className="text-4xl font-bold text-white">
                ${getPrice(plan)}
              </span>
              <span className="text-gray-400">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
              {billingCycle === 'yearly' && getSavings(plan) > 0 && (
                <p className="text-sm text-green-400 mt-1">
                  Save {getSavings(plan)}% compared to monthly
                </p>
              )}
            </div>

            {/* Features */}
            <ul className="space-y-3 mb-8">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2 text-gray-300">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>

            {/* Action Button */}
            <button
              onClick={() => handleSelectPlan(plan)}
              className="w-full py-3 bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white rounded-xl font-semibold flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Payment Modal */}
      {showPayment && selectedPlan && (
        <PaymentModal
          plan={selectedPlan}
          billingCycle={billingCycle}
          onClose={() => setShowPayment(false)}
        />
      )}
    </div>
  )
}

export default PlansPage
