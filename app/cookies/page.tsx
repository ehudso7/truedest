'use client'

import { useState } from 'react'
import { Cookie, Shield, Settings, BarChart, Users, Globe, Info, Check, X, AlertCircle } from 'lucide-react'

export default function CookiesPage() {
  const [cookiePreferences, setCookiePreferences] = useState({
    necessary: true,
    functional: true,
    analytics: true,
    advertising: false,
    social: false
  })

  const cookieTypes = [
    {
      id: 'necessary',
      name: 'Necessary Cookies',
      icon: Shield,
      required: true,
      description: 'Essential for the website to function properly. These cookies enable basic functions like page navigation and access to secure areas.',
      examples: [
        'Session cookies to keep you logged in',
        'Security cookies for fraud prevention',
        'Load balancing cookies for site performance',
        'Shopping cart cookies for booking process'
      ]
    },
    {
      id: 'functional',
      name: 'Functional Cookies',
      icon: Settings,
      required: false,
      description: 'Enable enhanced functionality and personalization. These cookies remember your preferences and choices.',
      examples: [
        'Language and currency preferences',
        'Recently viewed destinations',
        'Search history and filters',
        'Accessibility settings'
      ]
    },
    {
      id: 'analytics',
      name: 'Analytics Cookies',
      icon: BarChart,
      required: false,
      description: 'Help us understand how visitors interact with our website by collecting and reporting information anonymously.',
      examples: [
        'Google Analytics for traffic analysis',
        'Hotjar for user behavior insights',
        'Performance monitoring cookies',
        'A/B testing cookies'
      ]
    },
    {
      id: 'advertising',
      name: 'Advertising Cookies',
      icon: Globe,
      required: false,
      description: 'Used to deliver relevant advertisements and track advertising campaign effectiveness.',
      examples: [
        'Retargeting cookies for personalized ads',
        'Google Ads conversion tracking',
        'Facebook Pixel for social media ads',
        'Third-party advertising networks'
      ]
    },
    {
      id: 'social',
      name: 'Social Media Cookies',
      icon: Users,
      required: false,
      description: 'Enable sharing of content on social media platforms and track social media interactions.',
      examples: [
        'Facebook Like button',
        'Twitter Share functionality',
        'Instagram embed cookies',
        'LinkedIn social plugins'
      ]
    }
  ]

  const handleToggle = (cookieType: string) => {
    if (cookieType === 'necessary') return // Can't disable necessary cookies
    
    setCookiePreferences(prev => ({
      ...prev,
      [cookieType]: !prev[cookieType]
    }))
  }

  const handleAcceptAll = () => {
    setCookiePreferences({
      necessary: true,
      functional: true,
      analytics: true,
      advertising: true,
      social: true
    })
  }

  const handleRejectAll = () => {
    setCookiePreferences({
      necessary: true,
      functional: false,
      analytics: false,
      advertising: false,
      social: false
    })
  }

  const handleSavePreferences = () => {
    // In a real app, this would save to localStorage or send to server
    console.log('Saving cookie preferences:', cookiePreferences)
    alert('Your cookie preferences have been saved.')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-purple-600 to-pink-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <Cookie className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-4">Cookie Policy</h1>
          <p className="text-xl">Understanding how we use cookies to improve your experience</p>
          <p className="text-sm mt-2 opacity-90">Last updated: March 15, 2024</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Introduction */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold mb-4">What Are Cookies?</h2>
            <p className="text-gray-600 mb-4">
              Cookies are small text files that are placed on your device when you visit our website. They help us provide 
              you with a better experience by remembering your preferences, understanding how you use our site, and showing 
              you relevant content and advertisements.
            </p>
            <p className="text-gray-600">
              This Cookie Policy explains what cookies are, how we use them, and how you can manage your cookie preferences. 
              By using our website, you consent to our use of cookies in accordance with this policy.
            </p>
          </div>
        </div>

        {/* Cookie Management */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="bg-blue-50 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Manage Your Cookie Preferences</h3>
              <div className="flex gap-2">
                <button
                  onClick={handleAcceptAll}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Accept All
                </button>
                <button
                  onClick={handleRejectAll}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Reject All
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              Choose which types of cookies you want to accept. Note that necessary cookies cannot be disabled as they are 
              required for the website to function properly.
            </p>

            {/* Cookie Types */}
            <div className="space-y-4">
              {cookieTypes.map(cookie => {
                const Icon = cookie.icon
                const isEnabled = cookiePreferences[cookie.id as keyof typeof cookiePreferences]
                
                return (
                  <div key={cookie.id} className="bg-white rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`p-2 rounded-full ${isEnabled ? 'bg-green-100' : 'bg-gray-100'}`}>
                            <Icon className={`w-5 h-5 ${isEnabled ? 'text-green-600' : 'text-gray-600'}`} />
                          </div>
                          <h4 className="font-semibold text-lg">{cookie.name}</h4>
                          {cookie.required && (
                            <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">Required</span>
                          )}
                        </div>
                        <p className="text-gray-600 mb-3">{cookie.description}</p>
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-gray-700">Examples:</p>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {cookie.examples.map((example, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <span className="text-gray-400 mt-1">•</span>
                                {example}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      <div className="ml-4">
                        <button
                          onClick={() => handleToggle(cookie.id)}
                          disabled={cookie.required}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            isEnabled ? 'bg-green-600' : 'bg-gray-300'
                          } ${cookie.required ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              isEnabled ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <button
              onClick={handleSavePreferences}
              className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Save My Preferences
            </button>
          </div>
        </div>

        {/* Additional Information */}
        <div className="max-w-4xl mx-auto space-y-8">
          {/* How to Control Cookies */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <h3 className="text-xl font-bold mb-4">How to Control Cookies in Your Browser</h3>
            <p className="text-gray-600 mb-4">
              Most web browsers allow you to control cookies through their settings. You can set your browser to refuse 
              cookies or delete certain cookies. However, please note that blocking or deleting cookies may impact your 
              experience on our website.
            </p>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-600">
                  <strong>Chrome:</strong> Settings → Privacy and security → Cookies and other site data
                </p>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-600">
                  <strong>Firefox:</strong> Settings → Privacy & Security → Cookies and Site Data
                </p>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-600">
                  <strong>Safari:</strong> Preferences → Privacy → Cookies and website data
                </p>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-600">
                  <strong>Edge:</strong> Settings → Privacy, search, and services → Cookies and site permissions
                </p>
              </div>
            </div>
          </div>

          {/* Third-Party Cookies */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-yellow-900 mb-2">Third-Party Cookies</h3>
                <p className="text-yellow-800 text-sm">
                  Please note that third parties (including advertising networks and providers of external services) may also 
                  use cookies on our website. We have no control over these cookies and encourage you to check the third party's 
                  privacy policy for more information.
                </p>
              </div>
            </div>
          </div>

          {/* Updates to Cookie Policy */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <h3 className="text-xl font-bold mb-4">Updates to This Cookie Policy</h3>
            <p className="text-gray-600">
              We may update this Cookie Policy from time to time to reflect changes in our practices or for other operational, 
              legal, or regulatory reasons. We will notify you of any material changes by posting the new Cookie Policy on 
              this page and updating the "Last updated" date.
            </p>
          </div>

          {/* Contact Section */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">Questions About Cookies?</h3>
            <p className="mb-6">
              If you have any questions about our use of cookies or this Cookie Policy, please contact our privacy team.
            </p>
            <div className="space-y-2 mb-6">
              <p>Email: privacy@truedest.com</p>
              <p>Phone: 1-800-TRAVEL (1-800-872-8354)</p>
            </div>
            <div className="flex gap-4">
              <a
                href="/privacy"
                className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="/contact"
                className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors"
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}