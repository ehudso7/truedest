'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, MapPin, Calendar, Users, Hotel, Plane, Package, ChevronDown } from 'lucide-react'

interface SearchFormProps {
  type: 'flights' | 'hotels' | 'packages'
  onTypeChange: (type: 'flights' | 'hotels' | 'packages') => void
}

export default function SearchForm({ type, onTypeChange }: SearchFormProps) {
  const router = useRouter()
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [guests, setGuests] = useState('2')
  const [tripType, setTripType] = useState<'roundtrip' | 'oneway'>('roundtrip')
  const [cabinClass, setCabinClass] = useState('economy')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Build query parameters
    const params = new URLSearchParams({
      type,
      ...(type === 'flights' && { from, to }),
      ...(type === 'hotels' && { destination: to || from }),
      ...(type === 'packages' && { destination: to || from }),
      checkIn,
      checkOut,
      guests,
      ...(type === 'flights' && { tripType, class: cabinClass })
    })

    // Navigate to search page with parameters
    router.push(`/search?${params.toString()}`)
  }

  const popularDestinations = [
    'Paris, France',
    'Tokyo, Japan',
    'Bali, Indonesia',
    'New York, USA',
    'Dubai, UAE'
  ]

  return (
    <div className="w-full">
      {/* Tab Selection */}
      <div className="flex gap-2 mb-6">
        <button
          type="button"
          onClick={() => onTypeChange('flights')}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
            type === 'flights'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Plane className="w-4 h-4" />
          Flights
        </button>
        <button
          type="button"
          onClick={() => onTypeChange('hotels')}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
            type === 'hotels'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Hotel className="w-4 h-4" />
          Hotels
        </button>
        <button
          type="button"
          onClick={() => onTypeChange('packages')}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
            type === 'packages'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Package className="w-4 h-4" />
          Packages
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Flight specific options */}
        {type === 'flights' && (
          <div className="flex gap-4 mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="tripType"
                value="roundtrip"
                checked={tripType === 'roundtrip'}
                onChange={(e) => setTripType(e.target.value as 'roundtrip')}
                className="text-blue-600"
              />
              <span className="text-gray-700">Round Trip</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="tripType"
                value="oneway"
                checked={tripType === 'oneway'}
                onChange={(e) => setTripType(e.target.value as 'oneway')}
                className="text-blue-600"
              />
              <span className="text-gray-700">One Way</span>
            </label>
          </div>
        )}

        {/* Main search inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {type === 'flights' ? (
            <>
              {/* From */}
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="From where?"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  required
                  list="from-destinations"
                />
                <datalist id="from-destinations">
                  {popularDestinations.map(dest => (
                    <option key={dest} value={dest} />
                  ))}
                </datalist>
              </div>

              {/* To */}
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="To where?"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  required
                  list="to-destinations"
                />
                <datalist id="to-destinations">
                  {popularDestinations.map(dest => (
                    <option key={dest} value={dest} />
                  ))}
                </datalist>
              </div>
            </>
          ) : (
            /* Destination for hotels/packages */
            <div className="relative md:col-span-2">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Where are you going?"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                required
                list="destinations"
              />
              <datalist id="destinations">
                {popularDestinations.map(dest => (
                  <option key={dest} value={dest} />
                ))}
              </datalist>
            </div>
          )}

          {/* Check-in Date */}
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              required
            />
            <label className="absolute -top-2 left-2 bg-white px-1 text-xs text-gray-600">
              {type === 'flights' ? 'Departure' : 'Check-in'}
            </label>
          </div>

          {/* Check-out Date */}
          {(type !== 'flights' || tripType === 'roundtrip') && (
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                min={checkIn || new Date().toISOString().split('T')[0]}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                required={type !== 'flights' || tripType === 'roundtrip'}
              />
              <label className="absolute -top-2 left-2 bg-white px-1 text-xs text-gray-600">
                {type === 'flights' ? 'Return' : 'Check-out'}
              </label>
            </div>
          )}
        </div>

        {/* Additional options row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Guests/Travelers */}
          <div className="relative">
            <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={guests}
              onChange={(e) => setGuests(e.target.value)}
              className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 appearance-none cursor-pointer"
            >
              <option value="1">1 {type === 'flights' ? 'Traveler' : 'Guest'}</option>
              <option value="2">2 {type === 'flights' ? 'Travelers' : 'Guests'}</option>
              <option value="3">3 {type === 'flights' ? 'Travelers' : 'Guests'}</option>
              <option value="4">4 {type === 'flights' ? 'Travelers' : 'Guests'}</option>
              <option value="5">5+ {type === 'flights' ? 'Travelers' : 'Guests'}</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>

          {/* Cabin Class for flights */}
          {type === 'flights' && (
            <div className="relative">
              <select
                value={cabinClass}
                onChange={(e) => setCabinClass(e.target.value)}
                className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 appearance-none cursor-pointer"
              >
                <option value="economy">Economy</option>
                <option value="premium">Premium Economy</option>
                <option value="business">Business</option>
                <option value="first">First Class</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          )}

          {/* Search Button */}
          <button
            type="submit"
            className="md:col-span-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all flex items-center justify-center gap-2 shadow-lg"
          >
            <Search className="w-5 h-5" />
            Search {type === 'flights' ? 'Flights' : type === 'hotels' ? 'Hotels' : 'Packages'}
          </button>
        </div>
      </form>

      {/* Popular searches */}
      <div className="mt-6 flex items-center gap-2 flex-wrap">
        <span className="text-sm text-gray-600">Popular:</span>
        {popularDestinations.slice(0, 3).map(dest => (
          <button
            key={dest}
            type="button"
            onClick={() => setTo(dest)}
            className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
          >
            {dest}
          </button>
        ))}
      </div>
    </div>
  )
}