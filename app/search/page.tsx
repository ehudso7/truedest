'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Search, Filter, MapPin, Calendar, Users, DollarSign, Star, Heart, Plane, Hotel, Package, SlidersHorizontal, X, ChevronDown } from 'lucide-react'

function SearchContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [searchType, setSearchType] = useState(searchParams.get('type') || 'flights')
  const [destination, setDestination] = useState(searchParams.get('destination') || '')
  const [checkIn, setCheckIn] = useState(searchParams.get('checkIn') || '')
  const [checkOut, setCheckOut] = useState(searchParams.get('checkOut') || '')
  const [guests, setGuests] = useState(searchParams.get('guests') || '2')
  
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState('recommended')
  const [priceRange, setPriceRange] = useState([0, 5000])
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])
  const [selectedRating, setSelectedRating] = useState(0)
  
  const [results, setResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [favorites, setFavorites] = useState<string[]>([])

  // Simulate search results
  useEffect(() => {
    if (destination) {
      setIsLoading(true)
      setTimeout(() => {
        generateResults()
        setIsLoading(false)
      }, 1000)
    }
  }, [destination, searchType, checkIn, checkOut, guests])

  const generateResults = () => {
    const flightResults = [
      {
        id: 'FL001',
        type: 'flight',
        airline: 'Delta Airlines',
        from: 'New York (JFK)',
        to: destination || 'Paris (CDG)',
        departure: '08:00 AM',
        arrival: '09:30 PM',
        duration: '7h 30m',
        stops: 'Non-stop',
        price: 899,
        originalPrice: 1199,
        discount: 25,
        rating: 4.5,
        reviews: 234,
        class: 'Economy',
        baggage: '2 bags included'
      },
      {
        id: 'FL002',
        type: 'flight',
        airline: 'Air France',
        from: 'New York (JFK)',
        to: destination || 'Paris (CDG)',
        departure: '11:30 AM',
        arrival: '01:15 AM+1',
        duration: '7h 45m',
        stops: 'Non-stop',
        price: 1099,
        originalPrice: 1399,
        discount: 21,
        rating: 4.7,
        reviews: 567,
        class: 'Premium Economy',
        baggage: '2 bags + priority'
      },
      {
        id: 'FL003',
        type: 'flight',
        airline: 'United Airlines',
        from: 'New York (EWR)',
        to: destination || 'Paris (CDG)',
        departure: '06:00 PM',
        arrival: '07:30 AM+1',
        duration: '7h 30m',
        stops: 'Non-stop',
        price: 799,
        originalPrice: 999,
        discount: 20,
        rating: 4.3,
        reviews: 189,
        class: 'Economy',
        baggage: '1 bag included'
      }
    ]

    const hotelResults = [
      {
        id: 'HT001',
        type: 'hotel',
        name: 'Grand Hotel ' + (destination || 'Paris'),
        location: 'City Center',
        image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
        price: 289,
        originalPrice: 389,
        discount: 26,
        rating: 4.8,
        reviews: 1234,
        amenities: ['Free WiFi', 'Pool', 'Spa', 'Restaurant', 'Gym'],
        roomType: 'Deluxe King Room',
        cancellation: 'Free cancellation',
        breakfast: 'Breakfast included'
      },
      {
        id: 'HT002',
        type: 'hotel',
        name: 'Boutique Hotel ' + (destination || 'Paris'),
        location: 'Historic District',
        image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800',
        price: 199,
        originalPrice: 249,
        discount: 20,
        rating: 4.6,
        reviews: 567,
        amenities: ['Free WiFi', 'Restaurant', 'Bar', 'Concierge'],
        roomType: 'Superior Double Room',
        cancellation: 'Free cancellation until 24h',
        breakfast: 'Continental breakfast'
      },
      {
        id: 'HT003',
        type: 'hotel',
        name: 'Luxury Resort ' + (destination || 'Paris'),
        location: 'Beachfront',
        image: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800',
        price: 459,
        originalPrice: 599,
        discount: 23,
        rating: 4.9,
        reviews: 2345,
        amenities: ['Beach Access', 'Multiple Pools', 'Spa', '3 Restaurants', 'Kids Club'],
        roomType: 'Ocean View Suite',
        cancellation: 'Non-refundable',
        breakfast: 'All meals included'
      }
    ]

    const packageResults = [
      {
        id: 'PK001',
        type: 'package',
        title: (destination || 'Paris') + ' Complete Experience',
        image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800',
        duration: '7 Days / 6 Nights',
        includes: ['Round-trip Flight', '4-Star Hotel', 'Airport Transfers', 'City Tour'],
        price: 1899,
        originalPrice: 2499,
        discount: 24,
        rating: 4.7,
        reviews: 445,
        highlights: ['Eiffel Tower', 'Louvre Museum', 'Seine Cruise'],
        departure: 'Daily departures'
      },
      {
        id: 'PK002',
        type: 'package',
        title: (destination || 'Paris') + ' Romantic Getaway',
        image: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800',
        duration: '5 Days / 4 Nights',
        includes: ['Flight', 'Boutique Hotel', 'Breakfast', 'Dinner Cruise'],
        price: 1599,
        originalPrice: 1999,
        discount: 20,
        rating: 4.8,
        reviews: 234,
        highlights: ['Private Tours', 'Wine Tasting', 'Couples Spa'],
        departure: 'Flexible dates'
      }
    ]

    if (searchType === 'flights') setResults(flightResults)
    else if (searchType === 'hotels') setResults(hotelResults)
    else if (searchType === 'packages') setResults(packageResults)
    else setResults([...flightResults.slice(0, 1), ...hotelResults.slice(0, 1), ...packageResults.slice(0, 1)])
  }

  const toggleFavorite = (id: string) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    )
  }

  const handleBook = (item: any) => {
    const params = new URLSearchParams({
      type: item.type,
      destination: destination || 'Paris',
      dates: `${checkIn} - ${checkOut}`,
      guests: guests,
      price: item.price.toString()
    })
    router.push(`/booking?${params}`)
  }

  const amenities = ['Free WiFi', 'Pool', 'Spa', 'Gym', 'Restaurant', 'Bar', 'Parking', 'Pet Friendly']

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Header */}
      <div className="bg-white shadow-md sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Type Tabs */}
            <div className="flex gap-2">
              {['flights', 'hotels', 'packages'].map((type) => (
                <button
                  key={type}
                  onClick={() => setSearchType(type)}
                  className={`px-4 py-2 rounded-lg font-medium capitalize transition-all ${
                    searchType === type
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {type === 'flights' && <Plane className="w-4 h-4 inline mr-1" />}
                  {type === 'hotels' && <Hotel className="w-4 h-4 inline mr-1" />}
                  {type === 'packages' && <Package className="w-4 h-4 inline mr-1" />}
                  {type}
                </button>
              ))}
            </div>

            {/* Search Fields */}
            <div className="flex-1 flex gap-2">
              <div className="flex-1 relative">
                <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Where to?"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="relative">
                <Users className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <select
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                  className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                >
                  <option value="1">1 Guest</option>
                  <option value="2">2 Guests</option>
                  <option value="3">3 Guests</option>
                  <option value="4">4+ Guests</option>
                </select>
                <ChevronDown className="absolute right-3 top-3 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
              <button
                onClick={() => generateResults()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Search className="w-5 h-5" />
                Search
              </button>
            </div>
          </div>

          {/* Filters and Sort */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {showFilters && <X className="w-4 h-4" />}
            </button>

            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {results.length} results found
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="recommended">Recommended</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Filters Sidebar */}
          {showFilters && (
            <div className="w-64 bg-white rounded-lg shadow-md p-6 h-fit sticky top-32">
              <h3 className="font-semibold mb-4">Filters</h3>
              
              {/* Price Range */}
              <div className="mb-6">
                <h4 className="text-sm font-medium mb-3">Price Range</h4>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="number"
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                    className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                    placeholder="Min"
                  />
                  <span>-</span>
                  <input
                    type="number"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                    placeholder="Max"
                  />
                </div>
                <input
                  type="range"
                  min="0"
                  max="5000"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                  className="w-full"
                />
              </div>

              {/* Rating */}
              <div className="mb-6">
                <h4 className="text-sm font-medium mb-3">Minimum Rating</h4>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setSelectedRating(star)}
                      className={`p-1 ${star <= selectedRating ? 'text-yellow-500' : 'text-gray-300'}`}
                    >
                      <Star className="w-5 h-5 fill-current" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Amenities */}
              {searchType === 'hotels' && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium mb-3">Amenities</h4>
                  <div className="space-y-2">
                    {amenities.map((amenity) => (
                      <label key={amenity} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={selectedAmenities.includes(amenity)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedAmenities([...selectedAmenities, amenity])
                            } else {
                              setSelectedAmenities(selectedAmenities.filter(a => a !== amenity))
                            }
                          }}
                          className="rounded"
                        />
                        {amenity}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
                Apply Filters
              </button>
            </div>
          )}

          {/* Results */}
          <div className="flex-1">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600">Searching for the best deals...</p>
                </div>
              </div>
            ) : results.length === 0 ? (
              <div className="text-center py-20">
                <Search className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Start Your Search</h3>
                <p className="text-gray-600">Enter a destination to find amazing deals</p>
              </div>
            ) : (
              <div className="space-y-4">
                {results.map((result) => (
                  <div key={result.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                    <div className="p-6">
                      {result.type === 'flight' && (
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-4 mb-3">
                              <Plane className="w-6 h-6 text-blue-600" />
                              <h3 className="text-lg font-semibold">{result.airline}</h3>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                result.discount > 20 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                              }`}>
                                {result.discount}% OFF
                              </span>
                            </div>
                            <div className="flex items-center gap-8">
                              <div>
                                <p className="text-2xl font-bold">{result.departure}</p>
                                <p className="text-gray-600">{result.from}</p>
                              </div>
                              <div className="flex-1 flex flex-col items-center">
                                <p className="text-sm text-gray-500 mb-1">{result.duration}</p>
                                <div className="w-full h-[2px] bg-gray-300 relative">
                                  <Plane className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 rotate-90" />
                                </div>
                                <p className="text-sm text-gray-500 mt-1">{result.stops}</p>
                              </div>
                              <div>
                                <p className="text-2xl font-bold">{result.arrival}</p>
                                <p className="text-gray-600">{result.to}</p>
                              </div>
                            </div>
                            <div className="flex gap-4 mt-3 text-sm text-gray-600">
                              <span>{result.class}</span>
                              <span>•</span>
                              <span>{result.baggage}</span>
                            </div>
                          </div>
                          <div className="text-right ml-8">
                            <button
                              onClick={() => toggleFavorite(result.id)}
                              className="mb-2"
                            >
                              <Heart className={`w-5 h-5 ${
                                favorites.includes(result.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'
                              }`} />
                            </button>
                            <p className="text-gray-500 line-through text-sm">${result.originalPrice}</p>
                            <p className="text-3xl font-bold text-blue-600">${result.price}</p>
                            <div className="flex items-center gap-1 mt-1">
                              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                              <span className="text-sm">{result.rating}</span>
                              <span className="text-sm text-gray-500">({result.reviews})</span>
                            </div>
                            <button
                              onClick={() => handleBook(result)}
                              className="mt-3 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                              Select
                            </button>
                          </div>
                        </div>
                      )}

                      {result.type === 'hotel' && (
                        <div className="flex gap-6">
                          <img
                            src={result.image}
                            alt={result.name}
                            className="w-48 h-32 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="text-lg font-semibold mb-1">{result.name}</h3>
                                <p className="text-gray-600 text-sm mb-2">{result.location}</p>
                                <div className="flex items-center gap-1 mb-3">
                                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                  <span className="font-medium">{result.rating}</span>
                                  <span className="text-sm text-gray-500">({result.reviews} reviews)</span>
                                </div>
                                <div className="flex flex-wrap gap-2 mb-3">
                                  {result.amenities.slice(0, 4).map((amenity: string) => (
                                    <span key={amenity} className="bg-gray-100 px-2 py-1 rounded text-xs">
                                      {amenity}
                                    </span>
                                  ))}
                                </div>
                                <p className="text-sm text-green-600 font-medium">{result.cancellation}</p>
                                <p className="text-sm text-gray-600">{result.breakfast}</p>
                              </div>
                              <div className="text-right">
                                <button
                                  onClick={() => toggleFavorite(result.id)}
                                  className="mb-2"
                                >
                                  <Heart className={`w-5 h-5 ${
                                    favorites.includes(result.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'
                                  }`} />
                                </button>
                                {result.discount > 0 && (
                                  <span className="inline-block bg-red-500 text-white text-xs px-2 py-1 rounded-full mb-2">
                                    {result.discount}% OFF
                                  </span>
                                )}
                                <p className="text-gray-500 line-through text-sm">${result.originalPrice}</p>
                                <p className="text-3xl font-bold text-blue-600">${result.price}</p>
                                <p className="text-sm text-gray-600 mb-3">per night</p>
                                <button
                                  onClick={() => handleBook(result)}
                                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                  Book Now
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {result.type === 'package' && (
                        <div className="flex gap-6">
                          <img
                            src={result.image}
                            alt={result.title}
                            className="w-48 h-32 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="text-lg font-semibold mb-1">{result.title}</h3>
                                <p className="text-gray-600 text-sm mb-2">{result.duration}</p>
                                <div className="flex items-center gap-1 mb-3">
                                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                  <span className="font-medium">{result.rating}</span>
                                  <span className="text-sm text-gray-500">({result.reviews} reviews)</span>
                                </div>
                                <div className="mb-3">
                                  <p className="text-sm font-medium mb-1">Includes:</p>
                                  <div className="flex flex-wrap gap-2">
                                    {result.includes.map((item: string) => (
                                      <span key={item} className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs">
                                        {item}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                                <p className="text-sm text-gray-600">{result.departure}</p>
                              </div>
                              <div className="text-right">
                                <button
                                  onClick={() => toggleFavorite(result.id)}
                                  className="mb-2"
                                >
                                  <Heart className={`w-5 h-5 ${
                                    favorites.includes(result.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'
                                  }`} />
                                </button>
                                {result.discount > 0 && (
                                  <span className="inline-block bg-red-500 text-white text-xs px-2 py-1 rounded-full mb-2">
                                    Save ${result.originalPrice - result.price}
                                  </span>
                                )}
                                <p className="text-gray-500 line-through text-sm">${result.originalPrice}</p>
                                <p className="text-3xl font-bold text-blue-600">${result.price}</p>
                                <p className="text-sm text-gray-600 mb-3">per person</p>
                                <button
                                  onClick={() => handleBook(result)}
                                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                  View Details
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center"><div className="text-center"><div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div><p>Loading...</p></div></div>}>
      <SearchContent />
    </Suspense>
  )
}