import React, { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { PAYMENT_METHODS } from '../../utils/constants'
import { storageService } from '../../lib/supabase'
import {
  X,
  Upload,
  Check,
  Loader,
  AlertCircle,
  Bitcoin,
  Wallet,
  Landmark,
  Copy,
  CheckCircle
} from 'lucide-react'

const PaymentModal = ({ plan, billingCycle, onClose }) => {
  const [step, setStep] = useState('method') // method, upload, success
  const [method, setMethod] = useState('')
  const [cryptoType, setCryptoType] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  
  const { user } = useAuth()

  // عنوان المحفظة (مثال - استبدل بعناوين حقيقية)
  const walletAddresses = {
    btc: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    eth: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    usdt: 'TXkZ3XqKqLQkzQkzQkzQkzQkzQkzQkzQkz'
  }

  // حساب السعر
  const price = billingCycle === 'yearly' && plan.price_yearly
    ? plan.price_yearly
    : plan.price_monthly || plan.price

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    // التحقق من حجم الملف (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB')
      return
    }

    // التحقق من نوع الملف
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file')
      return
    }

    setImageFile(file)
    const reader = new FileReader()
    reader.onloadend = () => setImagePreview(reader.result)
    reader.readAsDataURL(file)
    setError('')
  }

  const handleCopyAddress = (address) => {
    navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError('')

    try {
      // رفع صورة التحويل
      let imageUrl = null
      if (imageFile) {
        imageUrl = await storageService.uploadImage(
          imageFile,
          `payments/${user.id}`
        )
      }

      // هنا يمكن إضافة منطق حفظ بيانات الدفع في قاعدة البيانات
      console.log('Payment data:', {
        userId: user.id,
        planId: plan.id,
        amount: price,
        method,
        cryptoType,
        transactionImage: imageUrl,
        billingCycle
      })

      setStep('success')
      setTimeout(() => {
        onClose()
      }, 3000)
    } catch (err) {
      console.error('Payment error:', err)
      setError('Failed to process payment. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1a1a2e] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">
            {step === 'method' && 'Choose Payment Method'}
            {step === 'upload' && 'Upload Payment Proof'}
            {step === 'success' && 'Payment Submitted!'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Plan Summary */}
          <div className="mb-6 p-4 bg-white/5 rounded-xl border border-white/10">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-400 text-sm">Selected Plan</p>
                <p className="text-xl font-bold text-white">{plan.name}</p>
              </div>
              <div className="text-right">
                <p className="text-gray-400 text-sm">Amount</p>
                <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#6366f1] to-[#a855f7]">
                  ${price}
                </p>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {/* Step 1: Payment Method */}
          {step === 'method' && (
            <div className="space-y-4">
              {PAYMENT_METHODS.map((pm) => (
                <button
                  key={pm.id}
                  onClick={() => {
                    setMethod(pm.id)
                    if (pm.id === 'crypto') {
                      setStep('crypto')
                    } else {
                      setStep('upload')
                    }
                  }}
                  className="w-full p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all flex items-center gap-4"
                >
                  <div className="w-12 h-12 bg-gradient-to-r from-[#6366f1] to-[#a855f7] rounded-lg flex items-center justify-center">
                    {pm.id === 'crypto' && <Bitcoin className="w-6 h-6 text-white" />}
                    {pm.id === 'onecash' && <Wallet className="w-6 h-6 text-white" />}
                    {pm.id === 'bank' && <Landmark className="w-6 h-6 text-white" />}
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="text-white font-semibold">{pm.name}</h3>
                    <p className="text-sm text-gray-400">
                      {pm.id === 'crypto' && 'Bitcoin, Ethereum, USDT'}
                      {pm.id === 'onecash' && 'Send via OneCash app'}
                      {pm.id === 'bank' && 'International bank transfer'}
                    </p>
                  </div>
                  <Check className="w-5 h-5 text-green-400" />
                </button>
              ))}
            </div>
          )}

          {/* Step 1.5: Crypto Selection */}
          {step === 'crypto' && (
            <div className="space-y-4">
              {PAYMENT_METHODS.find(m => m.id === 'crypto').types.map((type) => (
                <button
                  key={type.id}
                  onClick={() => {
                    setCryptoType(type.id)
                    setStep('upload')
                  }}
                  className="w-full p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all flex items-center gap-4"
                >
                  <div className="flex-1 text-left">
                    <h3 className="text-white font-semibold">{type.name}</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {walletAddresses[type.id]}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleCopyAddress(walletAddresses[type.id])
                    }}
                    className="p-2 hover:bg-white/10 rounded-lg"
                  >
                    {copied ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : (
                      <Copy className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                </button>
              ))}

              <button
                onClick={() => setStep('method')}
                className="text-[#a855f7] hover:text-[#6366f1] text-sm"
              >
                ← Back to payment methods
              </button>
            </div>
          )}

          {/* Step 2: Upload Proof */}
          {step === 'upload' && (
            <div className="space-y-6">
              {/* Wallet Address (for crypto) */}
              {method === 'crypto' && cryptoType && (
                <div className="p-4 bg-black/30 rounded-xl">
                  <p className="text-sm text-gray-400 mb-2">Send to this address:</p>
                  <div className="flex items-center gap-2 p-3 bg-white/5 rounded-lg">
                    <code className="flex-1 text-white font-mono text-sm">
                      {walletAddresses[cryptoType]}
                    </code>
                    <button
                      onClick={() => handleCopyAddress(walletAddresses[cryptoType])}
                      className="p-2 hover:bg-white/10 rounded-lg"
                    >
                      {copied ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Instructions */}
              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                <p className="text-sm text-blue-400">
                  {method === 'crypto' && 'After sending the payment, upload a screenshot of the transaction.'}
                  {method === 'onecash' && 'Send the amount via OneCash and upload a screenshot of the receipt.'}
                  {method === 'bank' && 'Make the bank transfer and upload a photo of the transfer receipt.'}
                </p>
              </div>

              {/* Image Upload */}
              {!imagePreview ? (
                <label className="block border-2 border-dashed border-white/20 rounded-xl p-8 text-center cursor-pointer hover:border-[#a855f7]/50 transition-all">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-white mb-2">Click to upload payment proof</p>
                  <p className="text-sm text-gray-500">PNG, JPG, JPEG (Max 5MB)</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Payment proof"
                    className="w-full rounded-xl"
                  />
                  <button
                    onClick={() => {
                      setImagePreview(null)
                      setImageFile(null)
                    }}
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setStep('method')}
                  className="flex-1 px-4 py-3 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/20 transition-all"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading || !imageFile}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white rounded-xl font-semibold hover:scale-[1.02] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Submit Payment'
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Success */}
          {step === 'success' && (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Payment Submitted!</h3>
              <p className="text-gray-400 mb-4">
                Your payment request has been received. We'll review it and upgrade your account within 24 hours.
              </p>
              <p className="text-sm text-gray-500">
                You'll receive a confirmation email once approved.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PaymentModal