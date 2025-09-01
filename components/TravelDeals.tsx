'use client'

import { useState, useEffect } from 'react'
import { Clock, MapPin, Star, Users, Calendar, TrendingUp } from 'lucide-react'

export default function TravelDeals() {
  const [timeLeft, setTimeLeft] = useState({ hours: 23, minutes: 59, seconds: 59 })
  const [activeCategory, setActiveCategory] = useState('all')

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 }
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 }
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 }
        }
        return { hours: 23, minutes: 59, seconds: 59 }
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const deals = [
    {
      id: 1,
      category: 'package',
      title: 'Bali Paradise Getaway',
      location: 'Bali, Indonesia',
      originalPrice: 2499,
      discountedPrice: 1749,
      discount: 30,
      image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800',
      rating: 4.8,
      reviews: 324,
      duration: '7 Days / 6 Nights',
      includes: ['Flights', 'Hotel', 'Breakfast', 'Tours'],
      availableSlots: 5,
      trending: true
    },
    {
      id: 2,
      category: 'hotel',
      title: 'Luxury Resort Maldives',
      location: 'Maldives',
      originalPrice: 899,
      discountedPrice: 449,
      discount: 50,
      image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800',
      rating: 4.9,
      reviews: 567,
      duration: 'Per Night',
      includes: ['Breakfast', 'Spa', 'Water Sports'],
      availableSlots: 3,
      trending: true
    },
    {
      id: 3,
      category: 'flight',
      title: 'Tokyo Adventure',
      location: 'Tokyo, Japan',
      originalPrice: 1299,
      discountedPrice: 899,
      discount: 31,
      image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800',
      rating: 4.7,
      reviews: 892,
      duration: 'Round Trip',
      includes: ['Premium Economy', 'Extra Baggage'],
      availableSlots: 12,
      trending: false
    },
    {
      id: 4,
      category: 'package',
      title: 'European Grand Tour',
      location: 'Paris, Rome, Barcelona',
      originalPrice: 4999,
      discountedPrice: 3499,
      discount: 30,
      image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800',
      rating: 4.9,
      reviews: 1203,
      duration: '14 Days / 13 Nights',
      includes: ['Flights', 'Hotels', 'Tours', 'Meals'],
      availableSlots: 8,
      trending: true
    },
    {
      id: 5,
      category: 'cruise',
      title: 'Caribbean Cruise',
      location: 'Caribbean Islands',
      originalPrice: 2199,
      discountedPrice: 1649,
      discount: 25,
      image: 'https://images.unsplash.com/photo-1559599746-8823b38544c6?w=800',
      rating: 4.6,
      reviews: 445,
      duration: '7 Days',
      includes: ['All Meals', 'Entertainment', 'Shore Excursions'],
      availableSlots: 15,
      trending: false
    },
    {
      id: 6,
      category: 'hotel',
      title: 'Dubai Luxury Stay',
      location: 'Dubai, UAE',
      originalPrice: 599,
      discountedPrice: 359,
      discount: 40,
      image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800',
      rating: 4.8,
      reviews: 778,
      duration: 'Per Night',
      includes: ['Breakfast', 'Airport Transfer', 'City Tour'],
      availableSlots: 6,
      trending: true
    }
  ]

  const categories = [
    { id: 'all', name: 'All Deals', count: deals.length },
    { id: 'package', name: 'Packages', count: deals.filter(d => d.category === 'package').length },
    { id: 'hotel', name: 'Hotels', count: deals.filter(d => d.category === 'hotel').length },
    { id: 'flight', name: 'Flights', count: deals.filter(d => d.category === 'flight').length },
    { id: 'cruise', name: 'Cruises', count: deals.filter(d => d.category === 'cruise').length }
  ]

  const filteredDeals = activeCategory === 'all' 
    ? deals 
    : deals.filter(deal => deal.category === activeCategory)

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold mb-4">Exclusive Travel Deals</h2>
        <p className="text-gray-600 text-lg mb-6">Limited time offers on your dream destinations</p>
        
        <div className="inline-flex items-center gap-4 bg-gradient-to-r from-red-500 to-orange-500 text-white px-6 py-3 rounded-full">
          <Clock className="w-5 h-5" />
          <span className="font-semibold">Flash Sale Ends In:</span>
          <div className="flex gap-2">
            <div className="bg-white/20 px-3 py-1 rounded">
              <span className="font-bold">{String(timeLeft.hours).padStart(2, '0')}</span>
            </div>
            <span className="font-bold">:</span>
            <div className="bg-white/20 px-3 py-1 rounded">
              <span className="font-bold">{String(timeLeft.minutes).padStart(2, '0')}</span>
            </div>
            <span className="font-bold">:</span>
            <div className="bg-white/20 px-3 py-1 rounded">
              <span className="font-bold">{String(timeLeft.seconds).padStart(2, '0')}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-4 mb-8">
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={`px-6 py-3 rounded-full font-medium transition-all ${
              activeCategory === category.id
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {category.name}
            <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-white/20">
              {category.count}
            </span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDeals.map((deal) => (
          <div key={deal.id} className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all group overflow-hidden">
            <div className="relative h-48 overflow-hidden">
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
              {deal.trending && (
                <div className="absolute top-4 right-4 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  Trending
                </div>
              )}
              <div className="absolute bottom-4 left-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                {deal.availableSlots} spots left
              </div>
            </div>

            <div className="p-6">
              <div className="flex items-center gap-2 text-gray-600 text-sm mb-2">
                <MapPin className="w-4 h-4" />
                {deal.location}
              </div>
              
              <h3 className="text-xl font-bold mb-2">{deal.title}</h3>
              
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span className="font-semibold ml-1">{deal.rating}</span>
                </div>
                <span className="text-gray-500 text-sm">({deal.reviews} reviews)</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                <Calendar className="w-4 h-4" />
                {deal.duration}
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {deal.includes.map((item, index) => (
                  <span key={index} className="bg-blue-50 text-blue-600 px-2 py-1 rounded text-xs">
                    {item}
                  </span>
                ))}
              </div>

              <div className="flex items-end justify-between mb-4">
                <div>
                  <p className="text-gray-500 line-through text-sm">${deal.originalPrice}</p>
                  <p className="text-3xl font-bold text-blue-600">${deal.discountedPrice}</p>
                </div>
                <p className="text-sm text-gray-600">per person</p>
              </div>

              <button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all">
                Book Now
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center mt-12">
        <button className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-8 py-3 rounded-lg font-semibold transition-colors">
          Load More Deals
        </button>
      </div>
    </div>
  )
}