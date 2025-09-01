'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, MapPin, Plane, Hotel, Package, Clock, Download, Eye, MessageSquare, Star, Filter, Search, ChevronDown } from 'lucide-react'

export default function TripsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'cancelled'>('upcoming')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [sortBy, setSortBy] = useState('date')

  const upcomingTrips = [
    {
      id: 'TB123456789',
      type: 'package',
      title: 'Paris Romantic Getaway',
      destination: 'Paris, France',
      dates: 'Mar 15 - Mar 22, 2024',
      departureDate: '2024-03-15',
      returnDate: '2024-03-22',
      status: 'confirmed',
      price: 2899,
      travelers: 2,
      bookingDate: '2024-01-15',
      airline: 'Air France',
      hotel: 'Hotel Le Marais',
      flightNumber: 'AF 123',
      seatNumbers: '12A, 12B',
      checkInTime: '14:00',
      checkOutTime: '11:00',
      activities: ['Eiffel Tower Tour', 'Seine River Cruise', 'Louvre Museum'],
      canCancel: true,
      canModify: true
    },
    {
      id: 'TB987654321',
      type: 'flight',
      title: 'Business Trip to Tokyo',
      destination: 'Tokyo, Japan',
      dates: 'Apr 5 - Apr 8, 2024',
      departureDate: '2024-04-05',
      returnDate: '2024-04-08',
      status: 'pending',
      price: 1899,
      travelers: 1,
      bookingDate: '2024-02-20',
      airline: 'Japan Airlines',
      flightNumber: 'JL 061',
      seatNumbers: '3A',
      canCancel: true,
      canModify: true
    },
    {
      id: 'TB456789123',
      type: 'hotel',
      title: 'Beach Resort Stay',
      destination: 'Maldives',
      dates: 'May 10 - May 17, 2024',
      departureDate: '2024-05-10',
      returnDate: '2024-05-17',
      status: 'confirmed',
      price: 3499,
      travelers: 2,
      bookingDate: '2024-03-01',
      hotel: 'Paradise Island Resort',
      roomType: 'Overwater Villa',
      checkInTime: '15:00',
      checkOutTime: '12:00',
      mealPlan: 'All Inclusive',
      canCancel: false,
      canModify: false
    }
  ]

  const pastTrips = [
    {
      id: 'TB111222333',
      type: 'package',
      title: 'Bali Adventure',
      destination: 'Bali, Indonesia',
      dates: 'Dec 10 - Dec 17, 2023',
      departureDate: '2023-12-10',
      returnDate: '2023-12-17',
      status: 'completed',
      price: 2199,
      travelers: 2,
      bookingDate: '2023-10-15',
      rating: 0,
      reviewed: false
    },
    {
      id: 'TB444555666',
      type: 'flight',
      title: 'New York City Break',
      destination: 'New York, USA',
      dates: 'Nov 20 - Nov 25, 2023',
      departureDate: '2023-11-20',
      returnDate: '2023-11-25',
      status: 'completed',
      price: 899,
      travelers: 1,
      bookingDate: '2023-09-30',
      rating: 5,
      reviewed: true
    }
  ]

  const cancelledTrips = [
    {
      id: 'TB777888999',
      type: 'hotel',
      title: 'London Hotel Stay',
      destination: 'London, UK',
      dates: 'Feb 1 - Feb 5, 2024',
      departureDate: '2024-02-01',
      returnDate: '2024-02-05',
      status: 'cancelled',
      price: 1299,
      travelers: 2,
      bookingDate: '2023-12-20',
      cancellationDate: '2024-01-10',
      refundAmount: 1099,
      refundStatus: 'processed'
    }
  ]

  const allTrips = {
    upcoming: upcomingTrips,
    past: pastTrips,
    cancelled: cancelledTrips
  }

  const currentTrips = allTrips[activeTab]

  const filteredTrips = currentTrips.filter(trip => {
    const matchesSearch = trip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         trip.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         trip.id.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filterType === 'all' || trip.type === filterType
    return matchesSearch && matchesFilter
  })

  const sortedTrips = [...filteredTrips].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.departureDate).getTime() - new Date(a.departureDate).getTime()
    } else if (sortBy === 'price') {
      return b.price - a.price
    }
    return 0
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-700'
      case 'pending': return 'bg-yellow-100 text-yellow-700'
      case 'completed': return 'bg-blue-100 text-blue-700'
      case 'cancelled': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'flight': return Plane
      case 'hotel': return Hotel
      case 'package': return Package
      default: return MapPin
    }
  }

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
    }
  }, [router])

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Trips</h1>
          <p className="text-gray-600">Manage and view all your travel bookings</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{upcomingTrips.length}</p>
                <p className="text-sm text-gray-600">Upcoming Trips</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{pastTrips.length}</p>
                <p className="text-sm text-gray-600">Past Trips</p>
              </div>
              <Clock className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">8</p>
                <p className="text-sm text-gray-600">Countries Visited</p>
              </div>
              <MapPin className="w-8 h-8 text-purple-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">$12.5k</p>
                <p className="text-sm text-gray-600">Total Spent</p>
              </div>
              <Star className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by destination, booking ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="flight">Flights</option>
                <option value="hotel">Hotels</option>
                <option value="package">Packages</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="date">Sort by Date</option>
                <option value="price">Sort by Price</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="border-b">
            <div className="flex">
              <button
                onClick={() => setActiveTab('upcoming')}
                className={`flex-1 px-6 py-3 font-medium transition-colors ${
                  activeTab === 'upcoming'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Upcoming ({upcomingTrips.length})
              </button>
              <button
                onClick={() => setActiveTab('past')}
                className={`flex-1 px-6 py-3 font-medium transition-colors ${
                  activeTab === 'past'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Past ({pastTrips.length})
              </button>
              <button
                onClick={() => setActiveTab('cancelled')}
                className={`flex-1 px-6 py-3 font-medium transition-colors ${
                  activeTab === 'cancelled'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Cancelled ({cancelledTrips.length})
              </button>
            </div>
          </div>

          <div className="p-6">
            {sortedTrips.length === 0 ? (
              <div className="text-center py-12">
                <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No trips found</p>
                <p className="text-gray-400 mt-2">Your {activeTab} trips will appear here</p>
                {activeTab === 'upcoming' && (
                  <button
                    onClick={() => router.push('/')}
                    className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Book a Trip
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {sortedTrips.map((trip) => {
                  const Icon = getTypeIcon(trip.type)
                  return (
                    <div key={trip.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Icon className="w-6 h-6 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold">{trip.title}</h3>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(trip.status)}`}>
                                {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                              <span className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {trip.destination}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {trip.dates}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-sm">
                              <span className="text-gray-600">Booking ID: <span className="font-mono font-medium">{trip.id}</span></span>
                              <span className="text-gray-600">{trip.travelers} Traveler{trip.travelers > 1 ? 's' : ''}</span>
                            </div>

                            {/* Additional details for upcoming trips */}
                            {activeTab === 'upcoming' && 'airline' in trip && (
                              <div className="mt-3 p-3 bg-gray-50 rounded-lg text-sm">
                                <div className="grid grid-cols-2 gap-2">
                                  {trip.airline && (
                                    <div>
                                      <span className="text-gray-600">Airline: </span>
                                      <span className="font-medium">{trip.airline}</span>
                                    </div>
                                  )}
                                  {trip.flightNumber && (
                                    <div>
                                      <span className="text-gray-600">Flight: </span>
                                      <span className="font-medium">{trip.flightNumber}</span>
                                    </div>
                                  )}
                                  {trip.hotel && (
                                    <div>
                                      <span className="text-gray-600">Hotel: </span>
                                      <span className="font-medium">{trip.hotel}</span>
                                    </div>
                                  )}
                                  {trip.seatNumbers && (
                                    <div>
                                      <span className="text-gray-600">Seats: </span>
                                      <span className="font-medium">{trip.seatNumbers}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Review prompt for past trips */}
                            {activeTab === 'past' && 'reviewed' in trip && !trip.reviewed && (
                              <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                                <p className="text-sm text-blue-800 mb-2">How was your trip?</p>
                                <div className="flex items-center gap-2">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <button key={star} className="text-gray-300 hover:text-yellow-500">
                                      <Star className="w-5 h-5 fill-current" />
                                    </button>
                                  ))}
                                  <button className="ml-2 text-sm text-blue-600 hover:text-blue-700">
                                    Write a Review
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* Refund info for cancelled trips */}
                            {activeTab === 'cancelled' && 'refundStatus' in trip && (
                              <div className="mt-3 p-3 bg-red-50 rounded-lg text-sm">
                                <p className="text-red-800">
                                  Cancelled on {new Date(trip.cancellationDate).toLocaleDateString()}
                                </p>
                                <p className="text-red-700 mt-1">
                                  Refund: ${trip.refundAmount} - Status: {trip.refundStatus}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-2xl font-bold text-blue-600 mb-3">${trip.price}</p>
                          <div className="flex flex-col gap-2">
                            {activeTab === 'upcoming' && (
                              <>
                                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm flex items-center gap-1">
                                  <Eye className="w-4 h-4" />
                                  View Details
                                </button>
                                {'canModify' in trip && trip.canModify && (
                                  <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                                    Modify
                                  </button>
                                )}
                                {'canCancel' in trip && trip.canCancel && (
                                  <button className="px-4 py-2 text-red-600 hover:text-red-700 text-sm">
                                    Cancel Trip
                                  </button>
                                )}
                              </>
                            )}
                            {activeTab === 'past' && (
                              <>
                                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm flex items-center gap-1">
                                  <Download className="w-4 h-4" />
                                  Download Invoice
                                </button>
                                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                                  Book Again
                                </button>
                              </>
                            )}
                            {activeTab === 'cancelled' && (
                              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm flex items-center gap-1">
                                <MessageSquare className="w-4 h-4" />
                                Contact Support
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}