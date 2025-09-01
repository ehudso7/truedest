'use client'

import { useState } from 'react'
import { ChevronRight, Plane, Calendar, Users } from 'lucide-react'

export default function PopularFlights() {
  const [selectedTab, setSelectedTab] = useState<'domestic' | 'international'>('domestic')
  
  const domesticFlights = [
    {
      id: 1,
      from: 'New York',
      fromCode: 'JFK',
      to: 'Los Angeles',
      toCode: 'LAX',
      price: 189,
      duration: '5h 45m',
      airline: 'Delta Airlines',
      logo: '✈️',
      departure: '08:00 AM',
      arrival: '11:45 AM',
      stops: 'Non-stop',
      discount: 15
    },
    {
      id: 2,
      from: 'Chicago',
      fromCode: 'ORD',
      to: 'Miami',
      toCode: 'MIA',
      price: 156,
      duration: '3h 15m',
      airline: 'United Airlines',
      logo: '✈️',
      departure: '10:30 AM',
      arrival: '02:45 PM',
      stops: 'Non-stop',
      discount: 20
    },
    {
      id: 3,
      from: 'San Francisco',
      fromCode: 'SFO',
      to: 'Seattle',
      toCode: 'SEA',
      price: 124,
      duration: '2h 10m',
      airline: 'Alaska Airlines',
      logo: '✈️',
      departure: '06:15 AM',
      arrival: '08:25 AM',
      stops: 'Non-stop',
      discount: 10
    },
    {
      id: 4,
      from: 'Boston',
      fromCode: 'BOS',
      to: 'Orlando',
      toCode: 'MCO',
      price: 142,
      duration: '3h 30m',
      airline: 'JetBlue',
      logo: '✈️',
      departure: '12:00 PM',
      arrival: '03:30 PM',
      stops: 'Non-stop',
      discount: 25
    }
  ]

  const internationalFlights = [
    {
      id: 5,
      from: 'New York',
      fromCode: 'JFK',
      to: 'London',
      toCode: 'LHR',
      price: 489,
      duration: '7h 30m',
      airline: 'British Airways',
      logo: '✈️',
      departure: '09:00 PM',
      arrival: '09:30 AM+1',
      stops: 'Non-stop',
      discount: 30
    },
    {
      id: 6,
      from: 'Los Angeles',
      fromCode: 'LAX',
      to: 'Tokyo',
      toCode: 'NRT',
      price: 756,
      duration: '11h 20m',
      airline: 'Japan Airlines',
      logo: '✈️',
      departure: '11:30 AM',
      arrival: '04:50 PM+1',
      stops: 'Non-stop',
      discount: 15
    },
    {
      id: 7,
      from: 'Miami',
      fromCode: 'MIA',
      to: 'Paris',
      toCode: 'CDG',
      price: 542,
      duration: '9h 15m',
      airline: 'Air France',
      logo: '✈️',
      departure: '05:45 PM',
      arrival: '09:00 AM+1',
      stops: 'Non-stop',
      discount: 20
    },
    {
      id: 8,
      from: 'San Francisco',
      fromCode: 'SFO',
      to: 'Dubai',
      toCode: 'DXB',
      price: 892,
      duration: '15h 45m',
      airline: 'Emirates',
      logo: '✈️',
      departure: '03:00 PM',
      arrival: '06:45 PM+1',
      stops: 'Non-stop',
      discount: 10
    }
  ]

  const flights = selectedTab === 'domestic' ? domesticFlights : internationalFlights

  return (
    <div className="container mx-auto px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold mb-2">Popular Flight Routes</h2>
          <p className="text-gray-600">Book your next journey at unbeatable prices</p>
        </div>
        <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setSelectedTab('domestic')}
            className={`px-4 py-2 rounded-md transition-all ${
              selectedTab === 'domestic'
                ? 'bg-white text-blue-600 shadow-sm font-semibold'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Domestic
          </button>
          <button
            onClick={() => setSelectedTab('international')}
            className={`px-4 py-2 rounded-md transition-all ${
              selectedTab === 'international'
                ? 'bg-white text-blue-600 shadow-sm font-semibold'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            International
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {flights.map((flight) => (
          <div
            key={flight.id}
            className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow p-6 cursor-pointer border border-gray-100"
          >
            {flight.discount > 0 && (
              <div className="inline-block bg-red-500 text-white text-xs px-2 py-1 rounded-full mb-3">
                {flight.discount}% OFF
              </div>
            )}
            
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{flight.logo}</span>
                <div>
                  <p className="font-semibold">{flight.airline}</p>
                  <p className="text-sm text-gray-500">{flight.stops}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-600">${flight.price}</p>
                {flight.discount > 0 && (
                  <p className="text-sm text-gray-500 line-through">
                    ${Math.round(flight.price / (1 - flight.discount / 100))}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between mb-4">
              <div className="flex-1">
                <p className="text-2xl font-bold">{flight.fromCode}</p>
                <p className="text-sm text-gray-600">{flight.from}</p>
                <p className="text-sm font-medium mt-1">{flight.departure}</p>
              </div>
              
              <div className="flex-1 flex flex-col items-center px-4">
                <p className="text-xs text-gray-500 mb-1">{flight.duration}</p>
                <div className="flex items-center w-full">
                  <div className="h-[2px] bg-gray-300 flex-1"></div>
                  <Plane className="w-5 h-5 text-gray-400 mx-2 rotate-90" />
                  <div className="h-[2px] bg-gray-300 flex-1"></div>
                </div>
              </div>
              
              <div className="flex-1 text-right">
                <p className="text-2xl font-bold">{flight.toCode}</p>
                <p className="text-sm text-gray-600">{flight.to}</p>
                <p className="text-sm font-medium mt-1">{flight.arrival}</p>
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t">
              <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold">
                Book Now
              </button>
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center mt-8">
        <button className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold">
          View All Flights
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}