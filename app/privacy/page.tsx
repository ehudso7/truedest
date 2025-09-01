'use client'

import { Shield, Lock, Eye, Database, Globe, Users, FileText, Mail, AlertCircle, CheckCircle } from 'lucide-react'

export default function PrivacyPage() {
  const sections = [
    {
      id: 'collection',
      title: 'Information We Collect',
      icon: Database,
      content: [
        {
          subtitle: 'Personal Information',
          items: [
            'Name, email address, and phone number',
            'Billing address and payment information',
            'Passport details and travel documents (when required)',
            'Date of birth and gender (for specific bookings)',
            'Travel preferences and dietary requirements'
          ]
        },
        {
          subtitle: 'Automatic Information',
          items: [
            'IP address and device information',
            'Browser type and operating system',
            'Pages visited and time spent on our site',
            'Referring website addresses',
            'Location data (with your permission)'
          ]
        }
      ]
    },
    {
      id: 'usage',
      title: 'How We Use Your Information',
      icon: Eye,
      content: [
        {
          subtitle: 'Service Delivery',
          items: [
            'Process your travel bookings and reservations',
            'Send booking confirmations and travel updates',
            'Provide customer support and respond to inquiries',
            'Process payments and prevent fraud',
            'Customize your travel experience'
          ]
        },
        {
          subtitle: 'Communication',
          items: [
            'Send promotional offers and travel deals (with consent)',
            'Share important travel advisories and updates',
            'Request feedback and conduct surveys',
            'Send service-related announcements'
          ]
        }
      ]
    },
    {
      id: 'sharing',
      title: 'Information Sharing',
      icon: Users,
      content: [
        {
          subtitle: 'We Share With',
          items: [
            'Airlines, hotels, and travel service providers',
            'Payment processors and financial institutions',
            'Government authorities (when legally required)',
            'Business partners (with your consent)',
            'Service providers who assist our operations'
          ]
        },
        {
          subtitle: 'We Never',
          items: [
            'Sell your personal information to third parties',
            'Share sensitive information without encryption',
            'Use your data for purposes you haven\'t agreed to',
            'Store payment details longer than necessary'
          ]
        }
      ]
    },
    {
      id: 'security',
      title: 'Data Security',
      icon: Lock,
      content: [
        {
          subtitle: 'Protection Measures',
          items: [
            '256-bit SSL encryption for all data transmission',
            'PCI DSS compliance for payment processing',
            'Regular security audits and penetration testing',
            'Secure data centers with 24/7 monitoring',
            'Employee training on data protection'
          ]
        },
        {
          subtitle: 'Your Responsibilities',
          items: [
            'Keep your account password secure',
            'Use secure networks when accessing your account',
            'Report suspicious activity immediately',
            'Keep your contact information updated'
          ]
        }
      ]
    },
    {
      id: 'rights',
      title: 'Your Rights',
      icon: Shield,
      content: [
        {
          subtitle: 'You Can',
          items: [
            'Access your personal information',
            'Correct inaccurate data',
            'Delete your account and data',
            'Opt-out of marketing communications',
            'Request data portability',
            'Object to certain data processing'
          ]
        }
      ]
    },
    {
      id: 'cookies',
      title: 'Cookies & Tracking',
      icon: Globe,
      content: [
        {
          subtitle: 'We Use Cookies To',
          items: [
            'Remember your preferences and settings',
            'Keep you signed in securely',
            'Analyze site traffic and usage patterns',
            'Personalize content and advertisements',
            'Improve website performance'
          ]
        }
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 to-purple-700 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <Shield className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-xl">Your privacy is our priority</p>
          <p className="text-sm mt-2 opacity-90">Last updated: March 15, 2024</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Introduction */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold mb-4">Our Commitment to Your Privacy</h2>
            <p className="text-gray-600 mb-4">
              At TrueDest, we understand that your privacy is important. This Privacy Policy explains how we collect, 
              use, disclose, and safeguard your information when you use our website and services. We are committed to 
              protecting your personal data and being transparent about how we handle it.
            </p>
            <p className="text-gray-600">
              By using our services, you agree to the collection and use of information in accordance with this policy. 
              If you have any questions or concerns, please don't hesitate to contact us.
            </p>
          </div>
        </div>

        {/* Quick Navigation */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="font-semibold mb-4">Quick Navigation</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {sections.map(section => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                >
                  <section.icon className="w-4 h-4" />
                  {section.title}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="max-w-4xl mx-auto space-y-8">
          {sections.map(section => {
            const Icon = section.icon
            return (
              <div key={section.id} id={section.id} className="bg-white rounded-lg shadow-md p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h2 className="text-2xl font-bold">{section.title}</h2>
                </div>
                
                {section.content.map((subsection, index) => (
                  <div key={index} className="mb-6 last:mb-0">
                    <h3 className="text-lg font-semibold mb-3">{subsection.subtitle}</h3>
                    <ul className="space-y-2">
                      {subsection.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-600">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )
          })}
        </div>

        {/* Additional Information */}
        <div className="max-w-4xl mx-auto mt-12 space-y-8">
          {/* Children's Privacy */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-yellow-900 mb-2">Children's Privacy</h3>
                <p className="text-yellow-800 text-sm">
                  Our services are not intended for individuals under 18 years of age. We do not knowingly collect 
                  personal information from children. If you become aware that a child has provided us with personal 
                  information, please contact us immediately.
                </p>
              </div>
            </div>
          </div>

          {/* International Transfers */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <h3 className="text-xl font-bold mb-4">International Data Transfers</h3>
            <p className="text-gray-600 mb-4">
              Your information may be transferred to and maintained on servers located outside of your country. 
              We ensure that such transfers comply with applicable data protection laws and that your information 
              remains protected to the standards described in this policy.
            </p>
          </div>

          {/* Changes to Policy */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <h3 className="text-xl font-bold mb-4">Changes to This Policy</h3>
            <p className="text-gray-600 mb-4">
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting 
              the new Privacy Policy on this page and updating the "Last updated" date. You are advised to review 
              this Privacy Policy periodically for any changes.
            </p>
          </div>

          {/* Contact Information */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">Contact Our Privacy Team</h3>
            <p className="mb-6">
              If you have questions about this Privacy Policy or how we handle your data, we're here to help.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5" />
                <span>privacy@truedest.com</span>
              </div>
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5" />
                <span>Data Protection Officer: dpo@truedest.com</span>
              </div>
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5" />
                <span>TrueDest Inc., 123 Fifth Avenue, New York, NY 10001</span>
              </div>
            </div>
            <div className="mt-6 flex gap-4">
              <a
                href="/contact"
                className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Contact Support
              </a>
              <a
                href="/cookies"
                className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors"
              >
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}