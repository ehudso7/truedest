'use client'

import { useState } from 'react'
import { Mail, CheckCircle, Send, Gift, Bell, Shield } from 'lucide-react'

export default function Newsletter() {
  const [email, setEmail] = useState('')
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!email) {
      setError('Please enter your email address')
      return
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address')
      return
    }

    setIsLoading(true)
    
    // Simulate API call
    setTimeout(() => {
      setIsSubscribed(true)
      setIsLoading(false)
      // Reset after 5 seconds
      setTimeout(() => {
        setIsSubscribed(false)
        setEmail('')
      }, 5000)
    }, 1000)
  }

  const benefits = [
    { icon: Gift, text: 'Exclusive deals & discounts' },
    { icon: Bell, text: 'Early access to flash sales' },
    { icon: Mail, text: 'Weekly travel inspiration' },
    { icon: Shield, text: 'No spam, unsubscribe anytime' }
  ]

  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-700 py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center text-white">
          {!isSubscribed ? (
            <>
              <div className="mb-8">
                <Mail className="w-16 h-16 mx-auto mb-4 text-white/90" />
                <h2 className="text-4xl font-bold mb-4">Subscribe to Our Newsletter</h2>
                <p className="text-xl mb-2">Get the latest deals and travel tips delivered to your inbox</p>
                <p className="text-white/80">Join 500,000+ travelers who save big on their trips</p>
              </div>

              <form onSubmit={handleSubmit} className="max-w-md mx-auto mb-8">
                <div className="flex gap-2">
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address" 
                    className="flex-1 px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
                    disabled={isLoading}
                  />
                  <button 
                    type="submit"
                    disabled={isLoading}
                    className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        Subscribing...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Subscribe
                      </>
                    )}
                  </button>
                </div>
                {error && (
                  <p className="text-red-200 text-sm mt-2 text-left">{error}</p>
                )}
              </form>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
                {benefits.map((benefit, index) => {
                  const Icon = benefit.icon
                  return (
                    <div key={index} className="flex items-center gap-2 text-white/90">
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <span className="text-sm text-left">{benefit.text}</span>
                    </div>
                  )
                })}
              </div>

              <div className="mt-8 text-white/70 text-sm">
                <p>🎁 New subscribers get <span className="font-semibold text-white">10% OFF</span> their first booking!</p>
              </div>
            </>
          ) : (
            <div className="py-8 animate-fade-in">
              <CheckCircle className="w-20 h-20 mx-auto mb-4 text-green-300" />
              <h3 className="text-3xl font-bold mb-4">Welcome to TrueDest!</h3>
              <p className="text-xl mb-2">You're successfully subscribed!</p>
              <p className="text-white/80 mb-6">Check your inbox for a special welcome offer 🎉</p>
              <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
                <Mail className="w-4 h-4" />
                <span className="font-medium">{email}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}