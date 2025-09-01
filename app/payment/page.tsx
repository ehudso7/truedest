'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CreditCard, Shield, Lock, Check, AlertCircle, Info } from 'lucide-react'

function PaymentContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const amount = searchParams.get('amount') || '0'
  const bookingId = searchParams.get('bookingId') || ''
  
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal' | 'crypto'>('card')
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentComplete, setPaymentComplete] = useState(false)
  
  const [cardDetails, setCardDetails] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: '',
    saveCard: false
  })

  const [billingAddress, setBillingAddress] = useState({
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US'
  })

  const [errors, setErrors] = useState<any>({})

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    const matches = v.match(/\d{4,16}/g)
    const match = (matches && matches[0]) || ''
    const parts = []
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    if (parts.length) {
      return parts.join(' ')
    } else {
      return value
    }
  }

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    if (v.length >= 2) {
      return v.slice(0, 2) + (v.length > 2 ? '/' + v.slice(2, 4) : '')
    }
    return v
  }

  const handleCardInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    let formattedValue = value

    if (name === 'number') {
      formattedValue = formatCardNumber(value)
    } else if (name === 'expiry') {
      formattedValue = formatExpiry(value)
    } else if (name === 'cvv') {
      formattedValue = value.replace(/\D/g, '').slice(0, 4)
    }

    setCardDetails(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : formattedValue
    }))

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev: any) => ({ ...prev, [name]: '' }))
    }
  }

  const handleBillingInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setBillingAddress(prev => ({
      ...prev,
      [name]: value
    }))

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev: any) => ({ ...prev, [name]: '' }))
    }
  }

  const validatePayment = () => {
    const newErrors: any = {}

    if (paymentMethod === 'card') {
      if (!cardDetails.number) newErrors.number = 'Card number is required'
      else if (cardDetails.number.replace(/\s/g, '').length < 13) newErrors.number = 'Invalid card number'
      
      if (!cardDetails.name) newErrors.name = 'Cardholder name is required'
      
      if (!cardDetails.expiry) newErrors.expiry = 'Expiry date is required'
      else if (!/^\d{2}\/\d{2}$/.test(cardDetails.expiry)) newErrors.expiry = 'Invalid expiry date'
      
      if (!cardDetails.cvv) newErrors.cvv = 'CVV is required'
      else if (cardDetails.cvv.length < 3) newErrors.cvv = 'Invalid CVV'

      if (!billingAddress.address) newErrors.address = 'Address is required'
      if (!billingAddress.city) newErrors.city = 'City is required'
      if (!billingAddress.zipCode) newErrors.zipCode = 'ZIP code is required'
      if (!billingAddress.country) newErrors.country = 'Country is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handlePayment = async () => {
    if (!validatePayment()) return

    setIsProcessing(true)
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false)
      setPaymentComplete(true)
      
      // Redirect after 3 seconds
      setTimeout(() => {
        router.push(`/booking/confirmation?bookingId=${bookingId}`)
      }, 3000)
    }, 2000)
  }

  const getCardType = (number: string) => {
    const cleaned = number.replace(/\s/g, '')
    if (/^4/.test(cleaned)) return 'Visa'
    if (/^5[1-5]/.test(cleaned)) return 'Mastercard'
    if (/^3[47]/.test(cleaned)) return 'Amex'
    if (/^6(?:011|5)/.test(cleaned)) return 'Discover'
    return ''
  }

  if (paymentComplete) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
          <p className="text-gray-600 mb-4">
            Your payment of ${amount} has been processed successfully.
          </p>
          <p className="text-sm text-gray-500">
            Redirecting to confirmation page...
          </p>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Secure Payment</h1>
          <p className="text-gray-600">Complete your booking with our secure payment system</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Form */}
          <div className="lg:col-span-2">
            {/* Security Badge */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-3">
                <Shield className="w-6 h-6 text-green-600" />
                <div>
                  <p className="font-semibold text-green-800">Secure Payment</p>
                  <p className="text-sm text-green-700">Your payment information is encrypted and secure</p>
                </div>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">Payment Method</h2>
              <div className="grid grid-cols-3 gap-3 mb-6">
                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3 border rounded-lg transition-all ${
                    paymentMethod === 'card'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <CreditCard className="w-6 h-6 mx-auto mb-1" />
                  <p className="text-sm">Credit Card</p>
                </button>
                <button
                  onClick={() => setPaymentMethod('paypal')}
                  className={`p-3 border rounded-lg transition-all ${
                    paymentMethod === 'paypal'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="w-6 h-6 mx-auto mb-1 font-bold text-blue-600">PP</div>
                  <p className="text-sm">PayPal</p>
                </button>
                <button
                  onClick={() => setPaymentMethod('crypto')}
                  className={`p-3 border rounded-lg transition-all ${
                    paymentMethod === 'crypto'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="w-6 h-6 mx-auto mb-1">₿</div>
                  <p className="text-sm">Crypto</p>
                </button>
              </div>

              {paymentMethod === 'card' && (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Card Number</label>
                    <div className="relative">
                      <input
                        type="text"
                        name="number"
                        value={cardDetails.number}
                        onChange={handleCardInputChange}
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                        className={`w-full px-4 py-2 pr-20 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.number ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {getCardType(cardDetails.number) && (
                        <span className="absolute right-3 top-3 text-sm font-medium text-gray-600">
                          {getCardType(cardDetails.number)}
                        </span>
                      )}
                    </div>
                    {errors.number && <p className="text-red-500 text-sm mt-1">{errors.number}</p>}
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Cardholder Name</label>
                    <input
                      type="text"
                      name="name"
                      value={cardDetails.name}
                      onChange={handleCardInputChange}
                      placeholder="JOHN DOE"
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Expiry Date</label>
                      <input
                        type="text"
                        name="expiry"
                        value={cardDetails.expiry}
                        onChange={handleCardInputChange}
                        placeholder="MM/YY"
                        maxLength={5}
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.expiry ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.expiry && <p className="text-red-500 text-sm mt-1">{errors.expiry}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">CVV</label>
                      <div className="relative">
                        <input
                          type="text"
                          name="cvv"
                          value={cardDetails.cvv}
                          onChange={handleCardInputChange}
                          placeholder="123"
                          maxLength={4}
                          className={`w-full px-4 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.cvv ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        <Info className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
                      </div>
                      {errors.cvv && <p className="text-red-500 text-sm mt-1">{errors.cvv}</p>}
                    </div>
                  </div>

                  <div className="flex items-center mb-4">
                    <input
                      type="checkbox"
                      name="saveCard"
                      checked={cardDetails.saveCard}
                      onChange={handleCardInputChange}
                      className="mr-2"
                    />
                    <label className="text-sm">Save this card for future bookings</label>
                  </div>
                </>
              )}

              {paymentMethod === 'paypal' && (
                <div className="text-center py-8">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-blue-600">PP</span>
                  </div>
                  <p className="text-gray-600 mb-4">You will be redirected to PayPal to complete your payment</p>
                  <button className="px-6 py-2 bg-yellow-400 text-blue-800 rounded-lg font-semibold hover:bg-yellow-500">
                    Continue with PayPal
                  </button>
                </div>
              )}

              {paymentMethod === 'crypto' && (
                <div className="text-center py-8">
                  <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">₿</span>
                  </div>
                  <p className="text-gray-600 mb-4">Pay with Bitcoin, Ethereum, or other cryptocurrencies</p>
                  <div className="flex justify-center gap-3">
                    <button className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600">Bitcoin</button>
                    <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">Ethereum</button>
                    <button className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600">USDT</button>
                  </div>
                </div>
              )}
            </div>

            {/* Billing Address */}
            {paymentMethod === 'card' && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold mb-4">Billing Address</h2>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Street Address</label>
                  <input
                    type="text"
                    name="address"
                    value={billingAddress.address}
                    onChange={handleBillingInputChange}
                    placeholder="123 Main Street"
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.address ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">City</label>
                    <input
                      type="text"
                      name="city"
                      value={billingAddress.city}
                      onChange={handleBillingInputChange}
                      placeholder="New York"
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.city ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">State</label>
                    <input
                      type="text"
                      name="state"
                      value={billingAddress.state}
                      onChange={handleBillingInputChange}
                      placeholder="NY"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">ZIP Code</label>
                    <input
                      type="text"
                      name="zipCode"
                      value={billingAddress.zipCode}
                      onChange={handleBillingInputChange}
                      placeholder="10001"
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.zipCode ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.zipCode && <p className="text-red-500 text-sm mt-1">{errors.zipCode}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Country</label>
                    <select
                      name="country"
                      value={billingAddress.country}
                      onChange={handleBillingInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.country ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="US">United States</option>
                      <option value="UK">United Kingdom</option>
                      <option value="CA">Canada</option>
                      <option value="AU">Australia</option>
                    </select>
                    {errors.country && <p className="text-red-500 text-sm mt-1">{errors.country}</p>}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">${amount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Taxes & Fees</span>
                  <span className="font-medium">${(parseFloat(amount) * 0.15).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Service Charge</span>
                  <span className="font-medium">$25.00</span>
                </div>
              </div>

              <div className="border-t pt-4 mb-6">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span className="text-blue-600">
                    ${(parseFloat(amount) * 1.15 + 25).toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                onClick={handlePayment}
                disabled={isProcessing}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5" />
                    Pay ${(parseFloat(amount) * 1.15 + 25).toFixed(2)}
                  </>
                )}
              </button>

              <div className="mt-4 text-center">
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                  <Lock className="w-4 h-4" />
                  <span>Secured by 256-bit SSL encryption</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t">
                <p className="text-xs text-gray-500 text-center">
                  By completing this purchase you agree to our Terms of Service and Privacy Policy
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center"><div className="text-center"><div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div><p>Loading...</p></div></div>}>
      <PaymentContent />
    </Suspense>
  )
}