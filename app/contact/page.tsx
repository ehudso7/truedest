'use client'

import { useState } from 'react'
import { Phone, Mail, MapPin, Clock, Send, MessageSquare, Facebook, Twitter, Instagram, Youtube } from 'lucide-react'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    category: 'general'
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false)
      setSubmitted(true)
      // Reset after showing success
      setTimeout(() => {
        setSubmitted(false)
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: '',
          category: 'general'
        })
      }, 5000)
    }, 2000)
  }

  const offices = [
    {
      city: 'New York',
      address: '123 Fifth Avenue, Suite 600',
      city2: 'New York, NY 10001',
      phone: '+1 (212) 555-0123',
      email: 'ny@truedest.com'
    },
    {
      city: 'London',
      address: '456 Oxford Street',
      city2: 'London, W1C 1AP',
      phone: '+44 20 7123 4567',
      email: 'london@truedest.com'
    },
    {
      city: 'Singapore',
      address: '789 Orchard Road',
      city2: 'Singapore 238839',
      phone: '+65 6123 4567',
      email: 'sg@truedest.com'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 to-purple-700 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Get in Touch</h1>
          <p className="text-xl">We're here to help with all your travel needs</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-bold mb-6">Send us a Message</h2>
              
              {submitted ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-green-800 mb-2">Message Sent Successfully!</h3>
                  <p className="text-green-700">We'll get back to you within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">Your Name *</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Email Address *</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">Phone Number</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="+1 234 567 8900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Category *</label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="general">General Inquiry</option>
                        <option value="booking">Booking Issue</option>
                        <option value="refund">Refund Request</option>
                        <option value="complaint">Complaint</option>
                        <option value="partnership">Partnership</option>
                        <option value="press">Press Inquiry</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Subject *</label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="How can we help you?"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Message *</label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={6}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Tell us more about your inquiry..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            {/* Quick Contact */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold mb-4">Quick Contact</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <Phone className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Call us</p>
                    <p className="font-semibold">1-800-TRAVEL</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 p-2 rounded-full">
                    <Mail className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email us</p>
                    <p className="font-semibold">support@truedest.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-purple-100 p-2 rounded-full">
                    <MessageSquare className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Live Chat</p>
                    <p className="font-semibold">Available 24/7</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-orange-100 p-2 rounded-full">
                    <Clock className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Business Hours</p>
                    <p className="font-semibold">Mon-Fri 9AM-6PM EST</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold mb-4">Follow Us</h3>
              <div className="grid grid-cols-2 gap-3">
                <a href="#" className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                  <Facebook className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium">Facebook</span>
                </a>
                <a href="#" className="flex items-center gap-2 p-3 bg-sky-50 rounded-lg hover:bg-sky-100 transition-colors">
                  <Twitter className="w-5 h-5 text-sky-600" />
                  <span className="text-sm font-medium">Twitter</span>
                </a>
                <a href="#" className="flex items-center gap-2 p-3 bg-pink-50 rounded-lg hover:bg-pink-100 transition-colors">
                  <Instagram className="w-5 h-5 text-pink-600" />
                  <span className="text-sm font-medium">Instagram</span>
                </a>
                <a href="#" className="flex items-center gap-2 p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                  <Youtube className="w-5 h-5 text-red-600" />
                  <span className="text-sm font-medium">YouTube</span>
                </a>
              </div>
            </div>

            {/* FAQ Link */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
              <h3 className="text-xl font-bold mb-2">Need Quick Answers?</h3>
              <p className="text-sm mb-4">Check our FAQ section for instant help</p>
              <a href="/faq" className="inline-flex items-center gap-2 bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                View FAQs
                <MessageSquare className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Office Locations */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Our Offices</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {offices.map((office, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-start gap-3 mb-4">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <MapPin className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">{office.city}</h3>
                    <p className="text-sm text-gray-600">{office.address}</p>
                    <p className="text-sm text-gray-600">{office.city2}</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <p className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    {office.phone}
                  </p>
                  <p className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    {office.email}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}