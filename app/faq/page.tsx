'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Search, HelpCircle, CreditCard, Shield, Calendar, MapPin, Users, Phone } from 'lucide-react'

interface FAQItem {
  id: number
  category: string
  question: string
  answer: string
}

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [expandedItems, setExpandedItems] = useState<number[]>([])

  const categories = [
    { id: 'all', name: 'All Questions', icon: HelpCircle },
    { id: 'booking', name: 'Booking', icon: Calendar },
    { id: 'payment', name: 'Payment', icon: CreditCard },
    { id: 'cancellation', name: 'Cancellation', icon: Shield },
    { id: 'travel', name: 'Travel', icon: MapPin },
    { id: 'account', name: 'Account', icon: Users }
  ]

  const faqs: FAQItem[] = [
    {
      id: 1,
      category: 'booking',
      question: 'How far in advance should I book my flight?',
      answer: 'For domestic flights, we recommend booking 1-3 months in advance for the best prices. For international flights, 2-8 months in advance is ideal. Peak travel seasons may require earlier booking to secure availability and better rates.'
    },
    {
      id: 2,
      category: 'booking',
      question: 'Can I book a flight for someone else?',
      answer: "Yes, you can book flights for other people. You'll need their full name as it appears on their passport or ID, date of birth, and contact information. Make sure all details are accurate as name changes can be costly or impossible with some airlines."
    },
    {
      id: 3,
      category: 'booking',
      question: 'Can I reserve a booking without paying immediately?',
      answer: 'Some airlines and hotels offer hold options for 24-72 hours. This feature is available on select bookings and will be clearly indicated during the booking process. A small fee may apply for this service.'
    },
    {
      id: 4,
      category: 'payment',
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards (Visa, Mastercard, American Express, Discover), debit cards, PayPal, and cryptocurrency for select bookings. We also offer payment plans through our partners for bookings over $500.'
    },
    {
      id: 5,
      category: 'payment',
      question: 'Is my payment information secure?',
      answer: 'Absolutely. We use industry-standard 256-bit SSL encryption to protect your payment information. We are PCI DSS compliant and never store your full credit card details on our servers. All transactions are processed through secure payment gateways.'
    },
    {
      id: 6,
      category: 'payment',
      question: 'When will I be charged for my booking?',
      answer: "Most bookings are charged immediately upon confirmation. However, some hotels offer 'Pay at Property' options where you'll be charged upon arrival. The payment terms will be clearly displayed before you complete your booking."
    },
    {
      id: 7,
      category: 'cancellation',
      question: 'What is your cancellation policy?',
      answer: 'Cancellation policies vary by provider and fare type. Flexible fares typically allow free cancellation up to 24-48 hours before travel. Non-refundable fares may only offer credit for future travel. Always review the specific cancellation terms during booking.'
    },
    {
      id: 8,
      category: 'cancellation',
      question: 'How do I cancel my booking?',
      answer: "Log into your account, go to 'My Trips', find your booking, and click 'Cancel Booking'. Follow the prompts to complete the cancellation. You'll receive a confirmation email with any applicable refund or credit information."
    },
    {
      id: 9,
      category: 'cancellation',
      question: 'How long does it take to receive a refund?',
      answer: "Refunds typically process within 7-14 business days, depending on your payment method and bank. Credit card refunds may take 1-2 billing cycles to appear on your statement. We'll send you a confirmation once the refund is initiated."
    },
    {
      id: 10,
      category: 'travel',
      question: 'Do I need a visa for my destination?',
      answer: 'Visa requirements depend on your nationality and destination. We recommend checking with the embassy or consulate of your destination country. Many countries offer visa-on-arrival or e-visa options. Always ensure your passport is valid for at least 6 months beyond your travel dates.'
    },
    {
      id: 11,
      category: 'travel',
      question: 'What documents do I need for international travel?',
      answer: "You'll need a valid passport, any required visas, and your booking confirmation. Some countries require proof of onward travel and sufficient funds. We recommend carrying printed copies of all documents and storing digital copies securely online."
    },
    {
      id: 12,
      category: 'travel',
      question: 'Can I change my flight dates after booking?',
      answer: "Most airlines allow date changes for a fee, though some basic economy fares don't permit changes. The change fee and fare difference (if any) will apply. Contact us or manage your booking online to check your options and associated costs."
    },
    {
      id: 13,
      category: 'account',
      question: 'How do I create an account?',
      answer: "Click 'Sign Up' at the top of any page. Enter your email address, create a password, and provide your name. You'll receive a verification email to activate your account. Having an account lets you track bookings, save preferences, and earn rewards."
    },
    {
      id: 14,
      category: 'account',
      question: 'I forgot my password. How do I reset it?',
      answer: "Click 'Sign In' then 'Forgot Password'. Enter your email address and we'll send you a password reset link. The link expires after 24 hours for security. If you don't receive the email, check your spam folder or contact support."
    },
    {
      id: 15,
      category: 'account',
      question: 'How do I update my personal information?',
      answer: "Log into your account and go to 'Profile Settings'. Here you can update your contact information, travel preferences, and payment methods. Make sure your name matches your travel documents exactly to avoid issues during check-in."
    }
  ]

  const toggleExpand = (id: number) => {
    setExpandedItems(prev =>
      prev.includes(id)
        ? prev.filter(item => item !== id)
        : [...prev, id]
    )
  }

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 to-purple-700 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <HelpCircle className="w-16 h-16 mx-auto mb-4" />
            <h1 className="text-4xl font-bold mb-4">Frequently Asked Questions</h1>
            <p className="text-xl mb-8">Find answers to common questions about booking and travel</p>
            
            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search FAQs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Categories */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map(category => {
            const Icon = category.icon
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-100 shadow-md'
                }`}
              >
                <Icon className="w-5 h-5" />
                {category.name}
              </button>
            )
          })}
        </div>

        {/* FAQ Items */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md">
            {filteredFAQs.length === 0 ? (
              <div className="p-12 text-center">
                <HelpCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No questions found matching your search.</p>
                <p className="text-gray-400 mt-2">Try different keywords or browse all categories.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredFAQs.map((faq, index) => (
                  <div key={faq.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <button
                      onClick={() => toggleExpand(faq.id)}
                      className="w-full text-left flex items-start justify-between gap-4"
                    >
                      <div className="flex-1">
                        <div className="flex items-start gap-3">
                          <span className="text-blue-600 font-semibold text-lg">
                            Q{index + 1}.
                          </span>
                          <h3 className="font-semibold text-lg text-gray-900">
                            {faq.question}
                          </h3>
                        </div>
                      </div>
                      {expandedItems.includes(faq.id) ? (
                        <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />
                      )}
                    </button>
                    {expandedItems.includes(faq.id) && (
                      <div className="mt-4 pl-9 text-gray-600 animate-fade-in">
                        <p>{faq.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">{faqs.length}</div>
              <p className="text-gray-600">Questions Answered</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">24/7</div>
              <p className="text-gray-600">Customer Support</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">4.8/5</div>
              <p className="text-gray-600">Customer Satisfaction</p>
            </div>
          </div>

          {/* Still Need Help */}
          <div className="mt-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white">
            <div className="text-center">
              <Phone className="w-12 h-12 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-4">Can't find what you're looking for?</h2>
              <p className="mb-6">Our customer support team is ready to help you</p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <a
                  href="/contact"
                  className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-block"
                >
                  Contact Support
                </a>
                <a
                  href="/help"
                  className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors inline-block"
                >
                  Visit Help Center
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}