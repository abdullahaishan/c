import React, { useState } from 'react'
import { MessageCircle, Instagram, Facebook, X, ChevronDown, Send, Copy, Check } from 'lucide-react'

// ============================================
// بيانات التواصل
// ============================================
const CONTACT_METHODS = {
  whatsapp: {
    id: 'whatsapp',
    name: 'واتساب',
    icon: MessageCircle,
    color: 'from-green-500 to-green-600',
    bgColor: 'bg-green-500/10',
    textColor: 'text-green-400',
    borderColor: 'border-green-500/30',
    hoverColor: 'hover:bg-green-500',
    username: '+967771315459',
    link: 'https://wa.me/967771315459',
    qrCode: null
  },
  instagram: {
    id: 'instagram',
    name: 'انستغرام',
    icon: Instagram,
    color: 'from-pink-500 to-purple-600',
    bgColor: 'bg-pink-500/10',
    textColor: 'text-pink-400',
    borderColor: 'border-pink-500/30',
    hoverColor: 'hover:bg-gradient-to-r hover:from-pink-500 hover:to-purple-600',
    username: 'aishan.2025',
    link: 'https://instagram.com/aishan.2025',
    qrCode: null
  },
  facebook: {
    id: 'facebook',
    name: 'فيسبوك',
    icon: Facebook,
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-500/10',
    textColor: 'text-blue-400',
    borderColor: 'border-blue-500/30',
    hoverColor: 'hover:bg-blue-500',
    username: 'abdullah.aishan.2025',
    link: 'https://facebook.com/abdullah.aishan.2025',
    qrCode: null
  }
}

// ============================================
// مكون بطريقة التواصل الواحدة
// ============================================
const ContactMethodCard = ({ method, isSelected, onSelect, onCopy, copiedId }) => {
  const Icon = method.icon
  
  return (
    <button
      onClick={() => onSelect(method)}
      className={`relative group w-full p-6 rounded-2xl border-2 transition-all duration-300 ${
        isSelected
          ? `border-${method.id === 'whatsapp' ? 'green' : method.id === 'instagram' ? 'pink' : 'blue'}-500/50 shadow-lg`
          : 'border-white/10 hover:border-white/20'
      } ${method.bgColor} hover:scale-105`}
    >
      {/* خلفية متدرجة عند التمرير */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-2xl ${
        method.id === 'whatsapp' ? 'bg-green-500' :
        method.id === 'instagram' ? 'bg-gradient-to-r from-pink-500 to-purple-600' :
        'bg-blue-500'
      }`}></div>
      
      <div className="relative flex items-center gap-4">
        {/* الأيقونة */}
        <div className={`p-4 rounded-xl bg-gradient-to-br ${method.color} shadow-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        
        {/* معلومات التواصل */}
        <div className="flex-1 text-right">
          <h3 className="text-lg font-bold text-white mb-1">{method.name}</h3>
          <p className={`text-sm ${method.textColor} font-mono`}>{method.username}</p>
        </div>
        
        {/* علامة الاختيار */}
        {isSelected && (
          <div className={`w-6 h-6 rounded-full bg-gradient-to-r ${method.color} flex items-center justify-center`}>
            <Check className="w-4 h-4 text-white" />
          </div>
        )}
      </div>
      
      {/* أزرار الإجراءات (تظهر عند الاختيار) */}
      {isSelected && (
        <div className="flex items-center justify-center gap-3 mt-4 pt-4 border-t border-white/10">
          {/* زر نسخ اسم المستخدم */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              onCopy(method.username, method.id)
            }}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/15 rounded-xl transition-all text-sm text-white"
          >
            {copiedId === method.id ? (
              <>
                <Check className="w-4 h-4 text-green-400" />
                <span className="text-green-400">تم النسخ!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>نسخ اسم المستخدم</span>
              </>
            )}
          </button>
          
          {/* زر فتح الرابط */}
          <a
            href={method.link}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className={`flex items-center gap-2 px-4 py-2 ${method.hoverColor} text-white rounded-xl transition-all text-sm`}
          >
            <Send className="w-4 h-4" />
            <span>فتح {method.name}</span>
          </a>
        </div>
      )}
    </button>
  )
}

// ============================================
// المكون الرئيسي لاختيار طريقة التواصل
// ============================================
const ContactSupport = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedMethod, setSelectedMethod] = useState(null)
  const [copiedId, setCopiedId] = useState(null)
  
  const handleSelectMethod = (method) => {
    setSelectedMethod(method)
  }
  
  const handleCopy = async (text, id) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }
  
  return (
    <div className="relative">
      {/* زر فتح قائمة التواصل */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative overflow-hidden px-6 py-3 bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-[#6366f1]/25 transition-all flex items-center gap-2"
      >
        <MessageCircle className="w-5 h-5" />
        <span>تواصل مع الدعم</span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
        
        {/* تأثير تموج عند التمرير */}
        <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
      </button>
      
      {/* نافذة اختيار طريقة التواصل */}
      {isOpen && (
        <>
          {/* خلفية معتمة */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={() => setIsOpen(false)}
          />
          
          {/* نافذة الاختيار - ✅ SVG مُصلح هنا */}
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-gradient-to-b from-[#1a1a2e] to-[#16213e] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden">
            {/* الهيدر */}
            <div className="relative p-6 border-b border-white/10">
              {/* ✅ SVG مُصلح - استخدام style بدلاً من bg-[] */}
              <div className="absolute inset-0 opacity-20" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                backgroundRepeat: 'repeat'
              }}></div>
              
              <div className="relative flex items-center justify-between">
                <h2 className="text-2xl font-bold bg-gradient-to-l from-[#6366f1] to-[#a855f7] bg-clip-text text-transparent">
                  اختر طريقة التواصل
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-xl transition-all"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              
              <p className="relative text-gray-400 mt-2">
                يمكنك التواصل معنا عبر أي من الطرق التالية
              </p>
            </div>
            
            {/* شبكة طرق التواصل */}
            <div className="p-6 space-y-4">
              {Object.values(CONTACT_METHODS).map((method) => (
                <ContactMethodCard
                  key={method.id}
                  method={method}
                  isSelected={selectedMethod?.id === method.id}
                  onSelect={handleSelectMethod}
                  onCopy={handleCopy}
                  copiedId={copiedId}
                />
              ))}
            </div>
            
            {/* تذييل */}
            <div className="p-4 bg-white/5 border-t border-white/10 text-center">
              <p className="text-sm text-gray-400">
                فريق الدعم متواجد للإجابة على استفساراتك في أقرب وقت
              </p>
            </div>
          </div>
        </>
      )}
      
      {/* عرض مختصر للطريقة المحددة (إذا كانت موجودة) */}
      {selectedMethod && !isOpen && (
        <div className="mt-4 p-4 bg-white/5 rounded-xl border border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-gradient-to-r ${selectedMethod.color}`}>
                <selectedMethod.icon className="w-4 h-4 text-white" />
              </div>
              <span className="text-white">
                تم اختيار: <span className={`font-semibold ${selectedMethod.textColor}`}>{selectedMethod.name}</span>
              </span>
            </div>
            <button
              onClick={() => setSelectedMethod(null)}
              className="text-sm text-gray-400 hover:text-white transition-all"
            >
              تغيير
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================
// نسخة مصغرة للاستخدام في الشريط الجانبي
// ============================================
const ContactSupportMini = () => {
  const [copiedId, setCopiedId] = useState(null)
  
  const handleCopy = async (text, id) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }
  
  return (
    <div className="space-y-3">
      {Object.values(CONTACT_METHODS).map((method) => {
        const Icon = method.icon
        const isCopied = copiedId === method.id
        
        return (
          <a
            key={method.id}
            href={method.link}
            target="_blank"
            rel="noopener noreferrer"
            className={`group flex items-center justify-between p-3 ${method.bgColor} hover:bg-white/5 rounded-xl border ${method.borderColor} transition-all`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-gradient-to-r ${method.color}`}>
                <Icon className="w-4 h-4 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm text-white">{method.name}</p>
                <p className={`text-xs ${method.textColor} font-mono`}>{method.username}</p>
              </div>
            </div>
            
            <button
              onClick={(e) => {
                e.preventDefault()
                handleCopy(method.username, method.id)
              }}
              className="p-2 hover:bg-white/10 rounded-lg transition-all"
              title="نسخ اسم المستخدم"
            >
              {isCopied ? (
                <Check className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4 text-gray-400 group-hover:text-white" />
              )}
            </button>
          </a>
        )
      })}
    </div>
  )
}

// ============================================
// تصدير المكونات
// ============================================
export { ContactSupport, ContactSupportMini }
export default ContactSupport
