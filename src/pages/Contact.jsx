import React, { useState, useEffect } from "react"
import { Share2, User, Mail, MessageSquare, Send, MessageCircle, Phone } from "lucide-react"
import { useDeveloper } from '../context/DeveloperContext'
import SocialLinks from "../components/SocialLinks"
import Komentar from "../components/Commentar"
import Swal from "sweetalert2"
import AOS from "aos"
import "aos/dist/aos.css"

// مكون العلامة المائية
const Watermark = () => (
  <div className="fixed inset-0 pointer-events-none select-none flex items-center justify-center opacity-[0.03] text-8xl font-bold text-white rotate-[-30deg] scale-150 uppercase tracking-wider">
    Portfolio Website
  </div>
)

const ContactPage = ({ developer: propDeveloper }) => {
  const context = useDeveloper()
  const developer = propDeveloper || context.publicDeveloper
  const { getSocialLinks } = context
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const socialLinks = getSocialLinks()

  useEffect(() => {
    AOS.init({ once: false })
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    Swal.fire({
      title: 'Sending Message...',
      html: 'Please wait while we send your message',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    })

    try {
      const form = e.target
      await form.submit()

      Swal.fire({
        title: 'Success!',
        text: 'Your message has been sent successfully!',
        icon: 'success',
        confirmButtonColor: '#6366f1',
        timer: 2000
      })

      setFormData({ name: "", email: "", message: "" })
    } catch (error) {
      Swal.fire({
        title: 'Error!',
        text: 'Something went wrong. Please try again later.',
        icon: 'error',
        confirmButtonColor: '#6366f1'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="relative min-h-screen bg-[#030014]" id="Contact">
      <Watermark />
      
      <div className="text-center lg:mt-[5%] mt-10 mb-2 sm:px-0 px-[5%]">
        <h2
          data-aos="fade-down"
          className="inline-block text-3xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#6366f1] to-[#a855f7]"
        >
          Contact Me
        </h2>
        <p
          data-aos="fade-up"
          className="text-slate-400 max-w-2xl mx-auto text-sm md:text-base mt-2"
        >
          Get in touch with me. Send me a message and I'll get back to you soon.
        </p>
      </div>

      <div className="h-auto py-10 flex items-center justify-center px-[5%] md:px-0">
        <div className="container px-[1%] grid grid-cols-1 lg:grid-cols-[45%_55%] gap-12">
          
          {/* نموذج الاتصال */}
          <div
            data-aos="fade-right"
            className="bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl p-5 py-10 sm:p-10 transform transition-all duration-300 hover:shadow-[#6366f1]/10"
          >
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-4xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-[#6366f1] to-[#a855f7]">
                  Get in Touch
                </h2>
                <p className="text-gray-400">
                  Have something to discuss? Send me a message and let's talk.
                </p>
              </div>
              <Share2 className="w-10 h-10 text-[#6366f1] opacity-50" />
            </div>

            {/* طرق التواصل السريعة */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <a
                href="https://wa.me/967771315459"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 bg-green-600/20 rounded-xl hover:bg-green-600/30 transition-all group"
              >
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="text-white font-medium">WhatsApp</h4>
                  <p className="text-xs text-gray-400">Quick response within 1 hour</p>
                </div>
              </a>
              
              <a
                href="mailto:your@email.com"
                className="flex items-center gap-3 p-4 bg-blue-600/20 rounded-xl hover:bg-blue-600/30 transition-all group"
              >
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="text-white font-medium">Email</h4>
                  <p className="text-xs text-gray-400">Response within 24 hours</p>
                </div>
              </a>
            </div>

            <form 
              action="https://formsubmit.co/YOUR_EMAIL_HERE"
              method="POST"
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              <input type="hidden" name="_template" value="table" />
              <input type="hidden" name="_captcha" value="false" />

              <div className="relative group">
                <User className="absolute left-4 top-4 w-5 h-5 text-gray-400 group-focus-within:text-[#6366f1] transition-colors" />
                <input
                  type="text"
                  name="name"
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="w-full p-4 pl-12 bg-white/10 rounded-xl border border-white/20 placeholder-gray-500 text-white focus:outline-none focus:ring-2 focus:ring-[#6366f1]/30 transition-all disabled:opacity-50"
                  required
                />
              </div>

              <div className="relative group">
                <Mail className="absolute left-4 top-4 w-5 h-5 text-gray-400 group-focus-within:text-[#6366f1] transition-colors" />
                <input
                  type="email"
                  name="email"
                  placeholder="Your Email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="w-full p-4 pl-12 bg-white/10 rounded-xl border border-white/20 placeholder-gray-500 text-white focus:outline-none focus:ring-2 focus:ring-[#6366f1]/30 transition-all disabled:opacity-50"
                  required
                />
              </div>

              <div className="relative group">
                <MessageSquare className="absolute left-4 top-4 w-5 h-5 text-gray-400 group-focus-within:text-[#6366f1] transition-colors" />
                <textarea
                  name="message"
                  placeholder="Your Message"
                  value={formData.message}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  rows="5"
                  className="w-full p-4 pl-12 bg-white/10 rounded-xl border border-white/20 placeholder-gray-500 text-white focus:outline-none focus:ring-2 focus:ring-[#6366f1]/30 transition-all resize-none disabled:opacity-50"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-[#6366f1] to-[#a855f7] text-white py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-[#6366f1]/20 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Send className="w-5 h-5" />
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>

          {/* قسم التعليقات */}
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-3 py-3 md:p-10 md:py-8 shadow-2xl">
            <Komentar />
          </div>
        </div>
      </div>
    </div>
  )
}

export default ContactPage
