'use client'

import { Map, Home, Search, Calendar, User, CreditCard, Heart, Bell, HelpCircle, Mail, FileText, Globe, ChevronRight } from 'lucide-react'
import Link from 'next/link'

export default function SitemapPage() {
  const sitemapSections = [
    {
      title: 'Main Pages',
      icon: Home,
      links: [
        { href: '/', label: 'Home', description: 'Start your journey here' },
        { href: '/search', label: 'Search', description: 'Find flights, hotels, and packages' },
        { href: '/deals', label: 'Special Deals', description: 'Exclusive offers and discounts' },
        { href: '/dashboard', label: 'Dashboard', description: 'Your personal travel hub' }
      ]
    },
    {
      title: 'Booking & Travel',
      icon: Calendar,
      links: [
        { href: '/booking', label: 'Book Now', description: 'Complete your reservation' },
        { href: '/trips', label: 'My Trips', description: 'View and manage your bookings' },
        { href: '/payment', label: 'Payment', description: 'Secure payment processing' },
        { href: '/cancellation', label: 'Cancellation', description: 'Cancel or modify bookings' }
      ]
    },
    {
      title: 'Account',
      icon: User,
      links: [
        { href: '/login', label: 'Login', description: 'Sign in to your account' },
        { href: '/register', label: 'Register', description: 'Create a new account' },
        { href: '/profile', label: 'Profile', description: 'Manage your personal information' },
        { href: '/wishlist', label: 'Wishlist', description: 'Your saved destinations' }
      ]
    },
    {
      title: 'Support & Help',
      icon: HelpCircle,
      links: [
        { href: '/help', label: 'Help Center', description: 'Browse help articles' },
        { href: '/faq', label: 'FAQs', description: 'Frequently asked questions' },
        { href: '/contact', label: 'Contact Us', description: 'Get in touch with support' },
        { href: '/reviews', label: 'Reviews', description: 'Customer feedback and ratings' }
      ]
    },
    {
      title: 'Legal & Policies',
      icon: FileText,
      links: [
        { href: '/terms', label: 'Terms of Service', description: 'Our terms and conditions' },
        { href: '/privacy', label: 'Privacy Policy', description: 'How we protect your data' },
        { href: '/cookies', label: 'Cookie Policy', description: 'Cookie usage information' },
        { href: '/sitemap', label: 'Sitemap', description: 'You are here' }
      ]
    },
    {
      title: 'Features',
      icon: Globe,
      links: [
        { href: '/notifications', label: 'Notifications', description: 'Manage alerts and updates' },
        { href: '/settings', label: 'Settings', description: 'Customize your experience' },
        { href: '/rewards', label: 'Rewards Program', description: 'Earn points and benefits' },
        { href: '/mobile', label: 'Mobile App', description: 'Download our app' }
      ]
    }
  ]

  const popularDestinations = [
    'Paris, France',
    'Tokyo, Japan',
    'New York, USA',
    'Bali, Indonesia',
    'London, UK',
    'Dubai, UAE',
    'Singapore',
    'Rome, Italy'
  ]

  const quickLinks = [
    { label: 'Flight Status', href: '/flight-status' },
    { label: 'Check-in Online', href: '/check-in' },
    { label: 'Baggage Info', href: '/baggage' },
    { label: 'Travel Insurance', href: '/insurance' },
    { label: 'Car Rentals', href: '/cars' },
    { label: 'Airport Transfers', href: '/transfers' },
    { label: 'Group Bookings', href: '/groups' },
    { label: 'Corporate Travel', href: '/corporate' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <Map className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-4">Sitemap</h1>
          <p className="text-xl">Navigate through all pages and features of TrueDest</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Breadcrumb */}
        <div className="max-w-6xl mx-auto mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-blue-600">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 font-medium">Sitemap</span>
          </div>
        </div>

        {/* Main Sitemap Grid */}
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {sitemapSections.map((section, index) => {
              const Icon = section.icon
              return (
                <div key={index} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <Icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <h2 className="text-xl font-bold">{section.title}</h2>
                  </div>
                  <ul className="space-y-3">
                    {section.links.map((link, linkIndex) => (
                      <li key={linkIndex}>
                        <Link 
                          href={link.href}
                          className="group flex items-start gap-2 hover:text-blue-600 transition-colors"
                        >
                          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="font-medium">{link.label}</span>
                            <p className="text-sm text-gray-500">{link.description}</p>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>

          {/* Popular Destinations */}
          <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6">Popular Destinations</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {popularDestinations.map((destination, index) => (
                <Link
                  key={index}
                  href={`/search?destination=${encodeURIComponent(destination)}`}
                  className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors"
                >
                  <Globe className="w-4 h-4" />
                  <span className="text-sm font-medium">{destination}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6">Quick Links</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {quickLinks.map((link, index) => (
                <Link
                  key={index}
                  href={link.href}
                  className="text-blue-600 hover:text-blue-700 hover:underline text-sm font-medium"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* SEO Information */}
          <div className="bg-gray-100 rounded-lg p-6 mb-8">
            <h3 className="font-semibold mb-3">Search Engine Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <p className="mb-2"><strong>XML Sitemap:</strong> <a href="/sitemap.xml" className="text-blue-600 hover:underline">/sitemap.xml</a></p>
                <p className="mb-2"><strong>Robots.txt:</strong> <a href="/robots.txt" className="text-blue-600 hover:underline">/robots.txt</a></p>
              </div>
              <div>
                <p className="mb-2"><strong>Last Updated:</strong> March 15, 2024</p>
                <p className="mb-2"><strong>Total Pages:</strong> 45+ pages</p>
              </div>
            </div>
          </div>

          {/* Help Section */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white text-center">
            <h2 className="text-2xl font-bold mb-4">Can't find what you're looking for?</h2>
            <p className="mb-6">
              Use our search feature or contact support for assistance
            </p>
            <div className="flex justify-center gap-4">
              <Link
                href="/search"
                className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center gap-2"
              >
                <Search className="w-5 h-5" />
                Search
              </Link>
              <Link
                href="/contact"
                className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors inline-flex items-center gap-2"
              >
                <Mail className="w-5 h-5" />
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}