'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Calendar, Clock, Users, MapPin, CreditCard, Shield, Check, AlertCircle, Plane, Hotel, Package } from 'lucide-react'

function BookingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [step, setStep] = useState(1)
  const [isProcessing, setIsProcessing] = useState(false)
  
  // Booking details from search params or defaults
  const bookingType = searchParams.get('type') || 'flight'
  const destination = searchParams.get('destination') || 'Paris, France'
  const dates = searchParams.get('dates') || 'Mar 15 - Mar 22, 2024'
  const guests = searchParams.get('guests') || '2'
  const price = searchParams.get('price') || '899'

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    passportNumber: '',
    passportExpiry: '',
    nationality: '',
    specialRequests: '',
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
    billingAddress: '',
    city: '',
    zipCode: '',
    country: '',
    saveCard: false,
    insurance: false,
    newsletter: true
  })

  const [errors, setErrors] = useState<any>({})

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev: any) => ({ ...prev, [name]: '' }))
    }
  }

  const validateStep = (stepNumber: number) => {
    const newErrors: any = {}
    
    if (stepNumber === 1) {
      if (!formData.firstName) newErrors.firstName = 'First name is required'
      if (!formData.lastName) newErrors.lastName = 'Last name is required'
      if (!formData.email) newErrors.email = 'Email is required'
      if (!formData.phone) newErrors.phone = 'Phone number is required'
      if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required'
    }
    
    if (stepNumber === 2) {
      if (!formData.cardNumber) newErrors.cardNumber = 'Card number is required'
      if (!formData.cardName) newErrors.cardName = 'Cardholder name is required'
      if (!formData.expiryDate) newErrors.expiryDate = 'Expiry date is required'
      if (!formData.cvv) newErrors.cvv = 'CVV is required'
      if (!formData.billingAddress) newErrors.billingAddress = 'Billing address is required'
      if (!formData.city) newErrors.city = 'City is required'
      if (!formData.zipCode) newErrors.zipCode = 'ZIP code is required'
      if (!formData.country) newErrors.country = 'Country is required'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1)
    }
  }

  const handlePreviousStep = () => {
    setStep(step - 1)
  }

  const handleBooking = async () => {
    if (!validateStep(2)) return
    
    setIsProcessing(true)
    // Simulate booking process
    setTimeout(() => {
      setIsProcessing(false)
      setStep(3) // Go to confirmation
      // Redirect to trips page after 3 seconds
      setTimeout(() => {
        router.push('/trips')
      }, 3000)
    }, 2000)
  }

  const bookingDetails = {
    flight: {
      icon: Plane,
      title: 'Flight to ' + destination,
      details: ['Economy Class', 'Non-stop', '2 Adults']
    },
    hotel: {
      icon: Hotel,
      title: 'Hotel in ' + destination,
      details: ['Deluxe Room', '7 Nights', '2 Guests']
    },
    package: {
      icon: Package,
      title: 'Package to ' + destination,
      details: ['Flight + Hotel', '7 Days', '2 Adults']
    }
  }

  const currentBooking = bookingDetails[bookingType as keyof typeof bookingDetails] || bookingDetails.flight
  const Icon = currentBooking.icon

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex-1 flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  step >= i ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {step > i ? <Check className="w-5 h-5" /> : i}
                </div>
                {i < 3 && (
                  <div className={`flex-1 h-1 mx-2 ${
                    step > i ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-sm">Traveler Details</span>
            <span className="text-sm">Payment</span>
            <span className="text-sm">Confirmation</span>
          </div>
        </div>

        {/* Booking Summary */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="font-semibold mb-4">Booking Summary</h3>
          <div className="flex items-start gap-4">
            <Icon className="w-8 h-8 text-blue-600 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-semibold">{currentBooking.title}</h4>
              <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {dates}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {guests} Guests
                </span>
              </div>
              <div className="flex gap-2 mt-2">
                {currentBooking.details.map((detail, idx) => (
                  <span key={idx} className="bg-blue-50 text-blue-600 text-xs px-2 py-1 rounded">
                    {detail}
                  </span>
                ))}
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-blue-600">${price}</p>
              <p className="text-sm text-gray-600">per person</p>
            </div>
          </div>
        </div>

        {/* Step 1: Traveler Details */}
        {step === 1 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-6">Traveler Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2">First Name *</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.firstName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="John"
                />
                {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Last Name *</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.lastName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Doe"
                />
                {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="john@example.com"
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Phone *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="+1 234 567 8900"
                />
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Date of Birth *</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.dateOfBirth ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.dateOfBirth && <p className="text-red-500 text-sm mt-1">{errors.dateOfBirth}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Nationality</label>
                <select
                  name="nationality"
                  value={formData.nationality}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Nationality</option>
                  <option value="US">United States</option>
                  <option value="UK">United Kingdom</option>
                  <option value="CA">Canada</option>
                  <option value="AU">Australia</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Special Requests</label>
              <textarea
                name="specialRequests"
                value={formData.specialRequests}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Any special requests or requirements..."
              />
            </div>

            <div className="flex items-center mb-6">
              <input
                type="checkbox"
                name="insurance"
                checked={formData.insurance}
                onChange={handleInputChange}
                className="mr-2"
              />
              <label className="text-sm">
                Add travel insurance (+$49) - Protect your trip against cancellations
              </label>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => router.back()}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleNextStep}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Continue to Payment
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Payment */}
        {step === 2 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-6">Payment Details</h2>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 text-blue-800">
                <Shield className="w-5 h-5" />
                <span className="font-semibold">Secure Payment</span>
              </div>
              <p className="text-sm text-blue-700 mt-1">
                Your payment information is encrypted and secure. We never store your card details.
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Card Number *</label>
              <input
                type="text"
                name="cardNumber"
                value={formData.cardNumber}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.cardNumber ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="1234 5678 9012 3456"
                maxLength={19}
              />
              {errors.cardNumber && <p className="text-red-500 text-sm mt-1">{errors.cardNumber}</p>}
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Cardholder Name *</label>
              <input
                type="text"
                name="cardName"
                value={formData.cardName}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.cardName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="JOHN DOE"
              />
              {errors.cardName && <p className="text-red-500 text-sm mt-1">{errors.cardName}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2">Expiry Date *</label>
                <input
                  type="text"
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.expiryDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="MM/YY"
                  maxLength={5}
                />
                {errors.expiryDate && <p className="text-red-500 text-sm mt-1">{errors.expiryDate}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">CVV *</label>
                <input
                  type="text"
                  name="cvv"
                  value={formData.cvv}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.cvv ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="123"
                  maxLength={4}
                />
                {errors.cvv && <p className="text-red-500 text-sm mt-1">{errors.cvv}</p>}
              </div>
            </div>

            <h3 className="font-semibold mb-4">Billing Address</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Address *</label>
              <input
                type="text"
                name="billingAddress"
                value={formData.billingAddress}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.billingAddress ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="123 Main Street"
              />
              {errors.billingAddress && <p className="text-red-500 text-sm mt-1">{errors.billingAddress}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2">City *</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.city ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="New York"
                />
                {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">ZIP Code *</label>
                <input
                  type="text"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.zipCode ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="10001"
                />
                {errors.zipCode && <p className="text-red-500 text-sm mt-1">{errors.zipCode}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Country *</label>
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.country ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select Country</option>
                  <option value="US">United States</option>
                  <option value="UK">United Kingdom</option>
                  <option value="CA">Canada</option>
                  <option value="AU">Australia</option>
                </select>
                {errors.country && <p className="text-red-500 text-sm mt-1">{errors.country}</p>}
              </div>
            </div>

            <div className="flex items-center mb-6">
              <input
                type="checkbox"
                name="saveCard"
                checked={formData.saveCard}
                onChange={handleInputChange}
                className="mr-2"
              />
              <label className="text-sm">
                Save this card for future bookings
              </label>
            </div>

            <div className="border-t pt-4 mb-6">
              <div className="flex justify-between mb-2">
                <span>Subtotal</span>
                <span>${parseInt(price) * parseInt(guests)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Taxes & Fees</span>
                <span>${Math.round(parseInt(price) * parseInt(guests) * 0.15)}</span>
              </div>
              {formData.insurance && (
                <div className="flex justify-between mb-2">
                  <span>Travel Insurance</span>
                  <span>$49</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Total</span>
                <span className="text-blue-600">
                  ${parseInt(price) * parseInt(guests) + Math.round(parseInt(price) * parseInt(guests) * 0.15) + (formData.insurance ? 49 : 0)}
                </span>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={handlePreviousStep}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Back
              </button>
              <button
                onClick={handleBooking}
                disabled={isProcessing}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    Complete Booking
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {step === 3 && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Booking Confirmed!</h2>
            <p className="text-gray-600 mb-6">
              Your booking has been successfully confirmed. We've sent a confirmation email to {formData.email}
            </p>
            
            <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
              <h3 className="font-semibold mb-3">Booking Reference</h3>
              <p className="text-2xl font-mono font-bold text-blue-600 mb-4">TB{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Traveler</span>
                  <span className="font-medium">{formData.firstName} {formData.lastName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Destination</span>
                  <span className="font-medium">{destination}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Travel Dates</span>
                  <span className="font-medium">{dates}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Paid</span>
                  <span className="font-bold text-blue-600">
                    ${parseInt(price) * parseInt(guests) + Math.round(parseInt(price) * parseInt(guests) * 0.15) + (formData.insurance ? 49 : 0)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <button
                onClick={() => router.push('/trips')}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
              >
                View My Trips
              </button>
              <button
                onClick={() => router.push('/')}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold"
              >
                Book Another Trip
              </button>
            </div>

            <p className="text-sm text-gray-500 mt-6">
              Redirecting to your trips in 3 seconds...
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function BookingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center"><div className="text-center"><div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div><p>Loading...</p></div></div>}>
      <BookingContent />
    </Suspense>
  )
}