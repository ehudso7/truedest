'use client'

import { useState } from 'react'
import { Search, Phone, Mail, MessageSquare, Clock, Book, CreditCard, MapPin, Shield, Users, ChevronRight, HelpCircle } from 'lucide-react'

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const categories = [
    { id: 'all', name: 'All Topics', icon: Book, count: 24 },
    { id: 'booking', name: 'Booking', icon: CreditCard, count: 8 },
    { id: 'cancellation', name: 'Cancellation', icon: Shield, count: 5 },
    { id: 'payment', name: 'Payment', icon: CreditCard, count: 4 },
    { id: 'account', name: 'Account', icon: Users, count: 3 },
    { id: 'travel', name: 'Travel Info', icon: MapPin, count: 4 }
  ]

  const helpArticles = [
    {
      id: 1,
      category: 'booking',
      title: 'How to book a flight',
      description: 'Step-by-step guide to booking your perfect flight',
      views: 15234,
      helpful: 94
    },
    {
      id: 2,
      category: 'booking',
      title: 'Choosing the right hotel',
      description: 'Tips for selecting the best accommodation for your needs',
      views: 8921,
      helpful: 89
    },
    {
      id: 3,
      category: 'cancellation',
      title: 'Cancellation policy explained',
      description: 'Understanding our cancellation terms and refund process',
      views: 12456,
      helpful: 87
    },
    {
      id: 4,
      category: 'cancellation',
      title: 'How to cancel your booking',
      description: 'Quick guide to cancelling flights, hotels, and packages',
      views: 9876,
      helpful: 91
    },
    {
      id: 5,
      category: 'payment',
      title: 'Payment methods accepted',
      description: 'All the ways you can pay for your travel bookings',
      views: 7654,
      helpful: 95
    },
    {
      id: 6,
      category: 'payment',
      title: 'Understanding travel insurance',
      description: 'What travel insurance covers and why you need it',
      views: 6543,
      helpful: 88
    },
    {
      id: 7,
      category: 'account',
      title: 'Creating your TrueDest account',
      description: 'Get started with your personal travel account',
      views: 5432,
      helpful: 92
    },
    {
      id: 8,
      category: 'account',
      title: 'Managing saved trips',
      description: 'How to save and organize your favorite destinations',
      views: 4321,
      helpful: 86
    },
    {
      id: 9,
      category: 'travel',
      title: 'Travel document requirements',
      description: 'Passport, visa, and other document information',
      views: 11234,
      helpful: 96
    },
    {
      id: 10,
      category: 'travel',
      title: 'Baggage allowance guide',
      description: 'Understanding airline baggage policies and fees',
      views: 10123,
      helpful: 90
    }
  ]

  const filteredArticles = helpArticles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const popularQuestions = [
    'Can I change my flight dates after booking?',
    'What happens if my flight is cancelled?',
    'How do I add baggage to my booking?',
    'Is travel insurance mandatory?',
    'How can I get a refund?',
    'Can I book for someone else?'
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 to-purple-700 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <HelpCircle className="w-16 h-16 mx-auto mb-4" />
            <h1 className="text-4xl font-bold mb-4">How can we help you?</h1>
            <p className="text-xl mb-8">Search our help center or browse by category</p>
            
            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search for help articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <a href="/contact" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <MessageSquare className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Live Chat</h3>
                <p className="text-sm text-gray-600">Chat with our support team</p>
                <p className="text-xs text-green-600 mt-1">Available 24/7</p>
              </div>
            </div>
          </a>

          <a href="tel:+1-800-TRAVEL" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4">
              <div className="bg-green-100 p-3 rounded-full">
                <Phone className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Call Us</h3>
                <p className="text-sm text-gray-600">1-800-TRAVEL</p>
                <p className="text-xs text-gray-500 mt-1">Mon-Fri 9AM-6PM EST</p>
              </div>
            </div>
          </a>

          <a href="mailto:support@truedest.com" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-4">
              <div className="bg-purple-100 p-3 rounded-full">
                <Mail className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Email Support</h3>
                <p className="text-sm text-gray-600">support@truedest.com</p>
                <p className="text-xs text-gray-500 mt-1">Response within 24 hours</p>
              </div>
            </div>
          </a>
        </div>

        {/* Categories */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">Browse by Category</h2>
          <div className="flex flex-wrap gap-3">
            {categories.map(category => {
              const Icon = category.icon
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    selectedCategory === category.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {category.name}
                  <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                    {category.count}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {filteredArticles.map(article => (
            <div key={article.id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer">
              <h3 className="text-lg font-semibold mb-2">{article.title}</h3>
              <p className="text-gray-600 mb-4">{article.description}</p>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-4 text-gray-500">
                  <span>{article.views.toLocaleString()} views</span>
                  <span>{article.helpful}% found helpful</span>
                </div>
                <ChevronRight className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          ))}
        </div>

        {/* Popular Questions */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold mb-6">Popular Questions</h2>
          <div className="space-y-4">
            {popularQuestions.map((question, index) => (
              <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <span className="flex items-center gap-3">
                  <HelpCircle className="w-5 h-5 text-gray-400" />
                  {question}
                </span>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            ))}
          </div>
        </div>

        {/* Still Need Help */}
        <div className="mt-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Still need help?</h2>
          <p className="text-lg mb-6">Our customer support team is here to assist you</p>
          <div className="flex justify-center gap-4">
            <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Start Live Chat
            </button>
            <button className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors">
              Submit a Ticket
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}