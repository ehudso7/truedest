'use client'

import { useState } from 'react'
import { Clock, MapPin, Star, Calendar, TrendingUp, Filter, Search, Heart, Percent } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function DealsPage() {
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('discount')
  const [savedDeals, setSavedDeals] = useState<string[]>([])

  const allDeals = [
    {
      id: 'DEAL001',
      title: 'Last Minute Paris Escape',
      category: 'lastminute',
      destination: 'Paris, France',
      originalPrice: 1299,
      discountedPrice: 799,
      discount: 38,
      validUntil: '2024-03-20',
      image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800',
      rating: 4.8,
      reviews: 445,
      type: 'Flight + Hotel',
      duration: '5 Days',
      departsIn: 3,
      spotsLeft: 2
    },
    {
      id: 'DEAL002',
      title: 'Maldives All-Inclusive Resort',
      category: 'exclusive',
      destination: 'Maldives',
      originalPrice: 3999,
      discountedPrice: 2399,
      discount: 40,
      validUntil: '2024-04-15',
      image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800',
      rating: 4.9,
      reviews: 234,
      type: 'Hotel',
      duration: '7 Nights',
      departsIn: 14,
      spotsLeft: 5
    },
    {
      id: 'DEAL003',
      title: 'Tokyo Cherry Blossom Special',
      category: 'seasonal',
      destination: 'Tokyo, Japan',
      originalPrice: 2199,
      discountedPrice: 1599,
      discount: 27,
      validUntil: '2024-03-31',
      image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800',
      rating: 4.7,
      reviews: 567,
      type: 'Package',
      duration: '8 Days',
      departsIn: 21,
      spotsLeft: 8
    },
    {
      id: 'DEAL004',
      title: 'Bali Yoga Retreat',
      category: 'wellness',
      destination: 'Bali, Indonesia',
      originalPrice: 1899,
      discountedPrice: 1299,
      discount: 32,
      validUntil: '2024-04-30',
      image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800',
      rating: 4.8,
      reviews: 123,
      type: 'Package',
      duration: '10 Days',
      departsIn: 30,
      spotsLeft: 4
    },
    {
      id: 'DEAL005',
      title: 'Dubai Shopping Festival',
      category: 'festival',
      destination: 'Dubai, UAE',
      originalPrice: 1499,
      discountedPrice: 999,
      discount: 33,
      validUntil: '2024-03-25',
      image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800',
      rating: 4.6,
      reviews: 789,
      type: 'Flight + Hotel',
      duration: '4 Days',
      departsIn: 7,
      spotsLeft: 12
    },
    {
      id: 'DEAL006',
      title: 'Greek Island Hopping',
      category: 'summer',
      destination: 'Santorini, Greece',
      originalPrice: 2799,
      discountedPrice: 1999,
      discount: 29,
      validUntil: '2024-05-31',
      image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800',
      rating: 4.9,
      reviews: 445,
      type: 'Cruise + Stay',
      duration: '12 Days',
      departsIn: 45,
      spotsLeft: 6
    }
  ]

  const categories = [
    { id: 'all', label: 'All Deals', icon: Percent },
    { id: 'lastminute', label: 'Last Minute', icon: Clock },
    { id: 'exclusive', label: 'Exclusive', icon: Star },
    { id: 'seasonal', label: 'Seasonal', icon: Calendar },
    { id: 'wellness', label: 'Wellness', icon: Heart },
    { id: 'festival', label: 'Festivals', icon: TrendingUp },
    { id: 'summer', label: 'Summer', icon: MapPin }
  ]

  const filteredDeals = selectedCategory === 'all' 
    ? allDeals 
    : allDeals.filter(deal => deal.category === selectedCategory)

  const sortedDeals = [...filteredDeals].sort((a, b) => {
    if (sortBy === 'discount') return b.discount - a.discount
    if (sortBy === 'price') return a.discountedPrice - b.discountedPrice
    if (sortBy === 'departing') return a.departsIn - b.departsIn
    return 0
  })

  const toggleSave = (dealId: string) => {
    setSavedDeals(prev => 
      prev.includes(dealId) 
        ? prev.filter(id => id !== dealId)
        : [...prev, dealId]
    )
  }

  const handleBookDeal = (deal: any) => {
    const params = new URLSearchParams({
      type: deal.type.toLowerCase().includes('flight') ? 'package' : 'hotel',
      destination: deal.destination,
      price: deal.discountedPrice.toString()
    })
    router.push(`/booking?${params.toString()}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">Exclusive Travel Deals</h1>
          <p className="text-xl mb-8">Save up to 50% on your dream vacation</p>
          <div className="inline-flex items-center gap-2 bg-white/20 px-6 py-3 rounded-full">
            <TrendingUp className="w-5 h-5" />
            <span className="font-semibold">{allDeals.length} Active Deals</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              <Filter className="w-5 h-5 text-gray-600" />
              <span className="font-semibold">Filter by:</span>
              <div className="flex flex-wrap gap-2">
                {categories.map(cat => {
                  const Icon = cat.icon
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`flex items-center gap-1 px-4 py-2 rounded-full transition-all ${
                        selectedCategory === cat.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {cat.label}
                    </button>
                  )
                })}
              </div>
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="discount">Highest Discount</option>
              <option value="price">Lowest Price</option>
              <option value="departing">Departing Soon</option>
            </select>
          </div>
        </div>

        {/* Deals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedDeals.map(deal => (
            <div key={deal.id} className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all overflow-hidden group">
              <div className="relative h-48">
                <img 
                  src={deal.image} 
                  alt={deal.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4">
                  <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                    {deal.discount}% OFF
                  </div>
                </div>
                <button
                  onClick={() => toggleSave(deal.id)}
                  className="absolute top-4 right-4 bg-white/90 p-2 rounded-full hover:bg-white transition-colors"
                >
                  <Heart 
                    className={`w-5 h-5 ${
                      savedDeals.includes(deal.id) 
                        ? 'fill-red-500 text-red-500' 
                        : 'text-gray-600'
                    }`}
                  />
                </button>
                {deal.departsIn <= 7 && (
                  <div className="absolute bottom-4 left-4 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                    Departs in {deal.departsIn} days
                  </div>
                )}
                <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-xs">
                  {deal.spotsLeft} spots left
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center gap-2 text-gray-600 text-sm mb-2">
                  <MapPin className="w-4 h-4" />
                  {deal.destination}
                </div>
                
                <h3 className="text-xl font-bold mb-2">{deal.title}</h3>
                
                <div className="flex items-center gap-4 mb-3">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="font-medium">{deal.rating}</span>
                    <span className="text-gray-500 text-sm">({deal.reviews})</span>
                  </div>
                  <span className="text-gray-500">•</span>
                  <span className="text-sm text-gray-600">{deal.type}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                  <Calendar className="w-4 h-4" />
                  {deal.duration}
                  <span className="text-gray-500">•</span>
                  <span>Valid until {new Date(deal.validUntil).toLocaleDateString()}</span>
                </div>

                <div className="flex items-end justify-between mb-4">
                  <div>
                    <p className="text-gray-500 line-through text-sm">${deal.originalPrice}</p>
                    <p className="text-3xl font-bold text-blue-600">${deal.discountedPrice}</p>
                  </div>
                  <p className="text-sm text-gray-600">per person</p>
                </div>

                <button
                  onClick={() => handleBookDeal(deal)}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all"
                >
                  Book This Deal
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Newsletter Signup */}
        <div className="mt-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Don't Miss Out!</h2>
          <p className="text-lg mb-6">Subscribe to get exclusive deals delivered to your inbox</p>
          <form className="max-w-md mx-auto flex gap-2">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none"
            />
            <button
              type="submit"
              className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}