'use client'

import { FileText, Scale, CreditCard, AlertTriangle, Shield, Users, Globe, Ban, CheckCircle, Info } from 'lucide-react'
import { useState } from 'react'

export default function TermsPage() {
  const [activeSection, setActiveSection] = useState('general')

  const sections = [
    {
      id: 'general',
      title: 'General Terms',
      icon: FileText,
      content: [
        {
          subtitle: 'Acceptance of Terms',
          text: 'By accessing and using TrueDest\'s website and services, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.'
        },
        {
          subtitle: 'Service Description',
          text: 'TrueDest provides an online platform for booking travel services including flights, hotels, car rentals, and vacation packages. We act as an intermediary between you and various travel service providers.'
        },
        {
          subtitle: 'Eligibility',
          text: 'You must be at least 18 years old and have the legal capacity to enter into contracts to use our services. By using our services, you represent and warrant that you meet these requirements.'
        }
      ]
    },
    {
      id: 'booking',
      title: 'Booking Terms',
      icon: CreditCard,
      content: [
        {
          subtitle: 'Booking Process',
          text: 'When you make a booking through TrueDest, you are entering into a contract with the travel service provider, not with TrueDest. We facilitate the booking but are not responsible for the actual provision of travel services.'
        },
        {
          subtitle: 'Pricing and Payment',
          text: 'All prices displayed on our platform are subject to change without notice until a booking is confirmed. Prices may vary based on availability, dates, and other factors. Payment is required at the time of booking unless otherwise specified.'
        },
        {
          subtitle: 'Booking Confirmation',
          text: 'A booking is only confirmed when you receive a confirmation email with a booking reference number. Please review all details carefully and contact us immediately if any information is incorrect.'
        },
        {
          subtitle: 'Third-Party Terms',
          text: 'Your booking is also subject to the terms and conditions of the relevant travel service provider (airline, hotel, etc.). It is your responsibility to review and comply with these additional terms.'
        }
      ]
    },
    {
      id: 'cancellation',
      title: 'Cancellation & Refunds',
      icon: Ban,
      content: [
        {
          subtitle: 'Cancellation Policy',
          text: 'Cancellation policies vary by booking type and provider. The specific cancellation terms for your booking will be clearly displayed before you confirm your purchase. Please review these carefully as some bookings may be non-refundable.'
        },
        {
          subtitle: 'Refund Processing',
          text: 'Refunds, when applicable, will be processed according to the cancellation policy of your booking. Processing times may vary but typically take 7-14 business days. Refunds will be issued to the original payment method.'
        },
        {
          subtitle: 'Modification Fees',
          text: 'Changes to bookings may incur additional fees set by the travel service provider. These fees will be disclosed before you confirm any modifications.'
        }
      ]
    },
    {
      id: 'liability',
      title: 'Liability & Disclaimers',
      icon: AlertTriangle,
      content: [
        {
          subtitle: 'Limitation of Liability',
          text: 'TrueDest\'s liability is limited to the amount you paid for the booking through our platform. We are not liable for any indirect, consequential, or punitive damages arising from your use of our services.'
        },
        {
          subtitle: 'Service Provider Liability',
          text: 'We are not responsible for the acts, errors, omissions, representations, warranties, breaches, or negligence of any travel service providers or for any personal injuries, death, property damage, or other damages or expenses resulting therefrom.'
        },
        {
          subtitle: 'Travel Risks',
          text: 'Travel involves inherent risks. You acknowledge and assume all risks associated with travel, including but not limited to accidents, illness, political instability, and natural disasters.'
        },
        {
          subtitle: 'Accuracy of Information',
          text: 'While we strive to provide accurate information, we do not guarantee the accuracy, completeness, or timeliness of information on our platform. You should verify important details directly with service providers.'
        }
      ]
    },
    {
      id: 'user',
      title: 'User Responsibilities',
      icon: Users,
      content: [
        {
          subtitle: 'Accurate Information',
          text: 'You are responsible for providing accurate, current, and complete information during the booking process. Inaccurate information may result in booking cancellation or additional fees.'
        },
        {
          subtitle: 'Travel Documents',
          text: 'It is your responsibility to obtain and carry proper travel documents, including passports, visas, and health certificates. We are not responsible for any consequences arising from inadequate documentation.'
        },
        {
          subtitle: 'Compliance with Laws',
          text: 'You agree to comply with all applicable laws and regulations, including those of your departure and destination locations.'
        },
        {
          subtitle: 'Account Security',
          text: 'You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.'
        }
      ]
    },
    {
      id: 'intellectual',
      title: 'Intellectual Property',
      icon: Shield,
      content: [
        {
          subtitle: 'Ownership',
          text: 'All content on the TrueDest platform, including text, graphics, logos, images, and software, is the property of TrueDest or its licensors and is protected by intellectual property laws.'
        },
        {
          subtitle: 'Limited License',
          text: 'We grant you a limited, non-exclusive, non-transferable license to access and use our platform for personal, non-commercial purposes. This license does not include any right to resell or commercial use of our services or content.'
        },
        {
          subtitle: 'Prohibited Uses',
          text: 'You may not copy, modify, distribute, transmit, display, reproduce, or create derivative works from our platform or its content without our prior written consent.'
        }
      ]
    },
    {
      id: 'privacy',
      title: 'Privacy & Data',
      icon: Scale,
      content: [
        {
          subtitle: 'Data Collection',
          text: 'Your use of our services is subject to our Privacy Policy, which describes how we collect, use, and protect your personal information.'
        },
        {
          subtitle: 'Consent to Communications',
          text: 'By using our services, you consent to receive electronic communications from us related to your bookings and our services. You may opt-out of marketing communications at any time.'
        }
      ]
    },
    {
      id: 'dispute',
      title: 'Dispute Resolution',
      icon: Globe,
      content: [
        {
          subtitle: 'Governing Law',
          text: 'These Terms of Service are governed by the laws of the United States and the State of New York, without regard to conflict of law principles.'
        },
        {
          subtitle: 'Arbitration',
          text: 'Any disputes arising from these terms or your use of our services shall be resolved through binding arbitration in accordance with the American Arbitration Association rules.'
        },
        {
          subtitle: 'Class Action Waiver',
          text: 'You agree to resolve disputes with us on an individual basis and waive your right to participate in class actions or class arbitrations.'
        }
      ]
    }
  ]

  const currentSection = sections.find(s => s.id === activeSection) || sections[0]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 to-purple-700 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <Scale className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
          <p className="text-xl">Please read these terms carefully before using our services</p>
          <p className="text-sm mt-2 opacity-90">Effective Date: January 1, 2024</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Important Notice */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <Info className="w-6 h-6 text-yellow-600 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-yellow-900 mb-2">Important Legal Notice</h3>
                <p className="text-yellow-800 text-sm">
                  These Terms of Service constitute a legally binding agreement between you and TrueDest. 
                  By using our services, you acknowledge that you have read, understood, and agree to be bound by these terms. 
                  If you do not agree with any part of these terms, you must not use our services.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-4 sticky top-4">
                <h3 className="font-semibold mb-4">Table of Contents</h3>
                <nav className="space-y-2">
                  {sections.map(section => {
                    const Icon = section.icon
                    return (
                      <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left ${
                          activeSection === section.id
                            ? 'bg-blue-50 text-blue-600'
                            : 'hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        <span className="text-sm">{section.title}</span>
                      </button>
                    )
                  })}
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-lg shadow-md p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <currentSection.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h2 className="text-2xl font-bold">{currentSection.title}</h2>
                </div>

                <div className="space-y-6">
                  {currentSection.content.map((item, index) => (
                    <div key={index} className="border-b border-gray-200 pb-6 last:border-0">
                      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        {item.subtitle}
                      </h3>
                      <p className="text-gray-600 leading-relaxed">{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Additional Sections */}
              <div className="mt-8 space-y-6">
                {/* Updates to Terms */}
                <div className="bg-blue-50 rounded-lg p-6">
                  <h3 className="font-semibold mb-3">Updates to These Terms</h3>
                  <p className="text-sm text-gray-700">
                    We may update these Terms of Service from time to time. We will notify you of any material changes 
                    by posting the new terms on this page and updating the effective date. Your continued use of our 
                    services after such changes constitutes acceptance of the updated terms.
                  </p>
                </div>

                {/* Contact Information */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white">
                  <h3 className="text-2xl font-bold mb-4">Questions About Our Terms?</h3>
                  <p className="mb-6">
                    If you have any questions about these Terms of Service, please don't hesitate to contact our legal team.
                  </p>
                  <div className="space-y-2 mb-6">
                    <p>Email: legal@truedest.com</p>
                    <p>Phone: 1-800-TRAVEL (1-800-872-8354)</p>
                    <p>Address: TrueDest Inc., 123 Fifth Avenue, New York, NY 10001</p>
                  </div>
                  <div className="flex gap-4">
                    <a
                      href="/contact"
                      className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                    >
                      Contact Support
                    </a>
                    <a
                      href="/privacy"
                      className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors"
                    >
                      Privacy Policy
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Agreement Acknowledgment */}
        <div className="max-w-4xl mx-auto mt-12">
          <div className="bg-gray-100 rounded-lg p-6 text-center">
            <p className="text-sm text-gray-600">
              By using TrueDest's services, you acknowledge that you have read, understood, and agree to be bound by these 
              Terms of Service and our Privacy Policy. These terms were last updated on January 1, 2024.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}