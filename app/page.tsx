'use client'

import { useState } from 'react'
import Hero from '@/components/Hero'
import SearchForm from '@/components/SearchForm'
import FeaturedDestinations from '@/components/FeaturedDestinations'
import PopularFlights from '@/components/PopularFlights'
import TravelDeals from '@/components/TravelDeals'
import Testimonials from '@/components/Testimonials'
import Newsletter from '@/components/Newsletter'

export default function HomePage() {
  const [searchType, setSearchType] = useState<'flights' | 'hotels' | 'packages'>('flights')

  return (
    <div className="min-h-screen">
      {/* Hero Section with Search */}
      <section className="relative bg-gradient-to-br from-blue-600 to-purple-700 text-white">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative container mx-auto px-4 py-20">
          <div className="text-center mb-10">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Your Next Adventure Awaits
            </h1>
            <p className="text-xl md:text-2xl text-blue-100">
              Discover amazing destinations with AI-powered travel planning
            </p>
          </div>
          
          {/* Search Form */}
          <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-2xl p-6">
            <SearchForm type={searchType} onTypeChange={setSearchType} />
          </div>
        </div>
      </section>

      {/* Featured Destinations */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Trending Destinations
          </h2>
          <FeaturedDestinations />
        </div>
      </section>

      {/* Popular Flights */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Popular Flight Routes
          </h2>
          <PopularFlights />
        </div>
      </section>

      {/* Travel Deals */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Exclusive Deals
          </h2>
          <TravelDeals />
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            What Our Travelers Say
          </h2>
          <Testimonials />
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <Newsletter />
      </section>
    </div>
  )
}