'use client'

import { useState } from 'react'
import { AlertCircle, Shield, Clock, DollarSign, FileText, CheckCircle, XCircle, Info, Calendar, CreditCard } from 'lucide-react'

export default function CancellationPage() {
  const [bookingId, setBookingId] = useState('')
  const [email, setEmail] = useState('')
  const [reason, setReason] = useState('')
  const [showPolicy, setShowPolicy] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    setTimeout(() => {
      setIsSubmitting(false)
      setSubmitted(true)
    }, 2000)
  }

  const cancellationPolicies = [
    {
      type: 'Flexible',
      icon: CheckCircle,
      color: 'green',
      features: [
        'Free cancellation up to 24 hours before check-in',
        '100% refund if cancelled within policy',
        'No questions asked',
        'Instant refund processing'
      ]
    },
    {
      type: 'Moderate',
      icon: Info,
      color: 'yellow',
      features: [
        'Free cancellation up to 5 days before check-in',
        '50% refund if cancelled 2-5 days before',
        'No refund within 48 hours',
        'Refund processed within 7-10 days'
      ]
    },
    {
      type: 'Strict',
      icon: AlertCircle,
      color: 'orange',
      features: [
        'Free cancellation up to 14 days before check-in',
        '50% refund if cancelled 7-14 days before',
        'No refund within 7 days',
        'Processing fee may apply'
      ]
    },
    {
      type: 'Non-refundable',
      icon: XCircle,
      color: 'red',
      features: [
        'No refund available',
        'Cannot be cancelled',
        'May be eligible for date change',
        'Travel insurance recommended'
      ]
    }
  ]

  const refundTimeline = [
    { days: '0-1', stage: 'Cancellation Requested', description: 'Your cancellation request is received and processed' },
    { days: '1-3', stage: 'Verification', description: 'We verify your booking and eligibility for refund' },
    { days: '3-7', stage: 'Processing', description: 'Refund is approved and sent to payment processor' },
    { days: '7-14', stage: 'Completion', description: 'Funds appear in your account or card statement' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-orange-600 to-red-700 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <Shield className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-4">Cancellation Policy & Request</h1>
          <p className="text-xl">Understand our policies and cancel your booking if needed</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Cancellation Form */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold mb-6">Cancel Your Booking</h2>
            
            {submitted ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Cancellation Request Submitted</h3>
                <p className="text-gray-600 mb-4">
                  Your cancellation request has been received. You'll receive a confirmation email shortly.
                </p>
                <p className="text-sm text-gray-500">
                  Reference Number: <span className="font-mono font-bold">CN{Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-yellow-800">
                      <p className="font-semibold mb-1">Before you cancel:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Check the cancellation policy for your booking</li>
                        <li>Refund amount depends on the policy and timing</li>
                        <li>Some bookings may be non-refundable</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Booking Reference *</label>
                  <input
                    type="text"
                    value={bookingId}
                    onChange={(e) => setBookingId(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="e.g., TB123456789"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Email Address *</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Email used for booking"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Reason for Cancellation *</label>
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">Select a reason</option>
                    <option value="plans-changed">Change of plans</option>
                    <option value="found-better">Found better deal</option>
                    <option value="emergency">Emergency/Illness</option>
                    <option value="visa-issues">Visa/Document issues</option>
                    <option value="flight-cancelled">Flight cancelled by airline</option>
                    <option value="other">Other reason</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Additional Comments</label>
                  <textarea
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Please provide any additional details..."
                  />
                </div>

                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    required
                    className="mt-1"
                  />
                  <label className="text-sm text-gray-600">
                    I understand that the refund amount will be determined by the cancellation policy of my booking and processing fees may apply.
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Processing...' : 'Submit Cancellation Request'}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Cancellation Policies */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">Understanding Our Cancellation Policies</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {cancellationPolicies.map((policy) => {
              const Icon = policy.icon
              const colorClasses = {
                green: 'bg-green-100 text-green-600 border-green-200',
                yellow: 'bg-yellow-100 text-yellow-600 border-yellow-200',
                orange: 'bg-orange-100 text-orange-600 border-orange-200',
                red: 'bg-red-100 text-red-600 border-red-200'
              }
              const colors = colorClasses[policy.color as keyof typeof colorClasses]
              
              return (
                <div key={policy.type} className="bg-white rounded-lg shadow-md p-6">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${colors}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-semibold mb-3">{policy.type}</h3>
                  <ul className="space-y-2">
                    {policy.features.map((feature, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                        <span className="text-gray-400 mt-1">•</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        </div>

        {/* Refund Timeline */}
        <div className="max-w-4xl mx-auto mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">Refund Processing Timeline</h2>
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="relative">
              {refundTimeline.map((item, index) => (
                <div key={index} className="flex gap-4 mb-6 last:mb-0">
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      index === 0 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                    }`}>
                      {index + 1}
                    </div>
                    {index < refundTimeline.length - 1 && (
                      <div className="w-0.5 h-16 bg-gray-200 mt-2"></div>
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm text-gray-500">Day {item.days}</span>
                      <Clock className="w-4 h-4 text-gray-400" />
                    </div>
                    <h4 className="font-semibold mb-1">{item.stage}</h4>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Important Information */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <Info className="w-6 h-6 text-blue-600 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">Important Information</h3>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li>• Cancellation fees may vary based on the supplier's policy</li>
                  <li>• Group bookings may have different cancellation terms</li>
                  <li>• Travel insurance can protect against unexpected cancellations</li>
                  <li>• Peak season bookings may have stricter cancellation policies</li>
                  <li>• Always check the specific terms for your booking before cancelling</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Support */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">Need help with your cancellation?</p>
          <div className="flex justify-center gap-4">
            <a
              href="/contact"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700"
            >
              Contact Support
            </a>
            <a
              href="/faq"
              className="border border-gray-300 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50"
            >
              View FAQs
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}