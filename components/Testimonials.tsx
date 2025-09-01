'use client'

import { useState } from 'react'
import { Star, Quote, ChevronLeft, ChevronRight, MapPin, Plane, Hotel, Calendar, Users, Briefcase, Heart, Compass } from 'lucide-react'

export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0)

  const testimonials = [
    {
      id: 1,
      name: 'Sarah Johnson',
      location: 'New York, USA',
      avatar: 'https://i.pravatar.cc/150?img=1',
      rating: 5,
      date: '2 weeks ago',
      tripType: 'Family Vacation',
      destination: 'Bali, Indonesia',
      title: 'Unforgettable family trip to Bali!',
      content: 'TrueDest made our dream vacation a reality! The booking process was seamless, and the customer service was exceptional. Our hotel was perfect, and the suggested activities were amazing. We created memories that will last a lifetime!',
      highlights: ['Great Service', 'Best Price', 'Easy Booking'],
      verified: true
    },
    {
      id: 2,
      name: 'Michael Chen',
      location: 'San Francisco, USA',
      avatar: 'https://i.pravatar.cc/150?img=3',
      rating: 5,
      date: '1 month ago',
      tripType: 'Business Travel',
      destination: 'Tokyo, Japan',
      title: 'Smooth business trip arrangement',
      content: 'As a frequent business traveler, I appreciate efficiency. TrueDest delivered beyond expectations - from flight bookings to hotel arrangements. The 24/7 support came in handy when I needed to change my return flight last minute.',
      highlights: ['24/7 Support', 'Flexible Booking', 'Professional'],
      verified: true
    },
    {
      id: 3,
      name: 'Emma Williams',
      location: 'London, UK',
      avatar: 'https://i.pravatar.cc/150?img=5',
      rating: 5,
      date: '3 weeks ago',
      tripType: 'Honeymoon',
      destination: 'Maldives',
      title: 'Perfect honeymoon experience',
      content: 'TrueDest helped us plan the most romantic honeymoon in the Maldives. Every detail was perfect - from the overwater villa to the private dinner on the beach. The prices were unbeatable compared to other sites!',
      highlights: ['Romantic', 'Great Value', 'Attention to Detail'],
      verified: true
    },
    {
      id: 4,
      name: 'David Martinez',
      location: 'Miami, USA',
      avatar: 'https://i.pravatar.cc/150?img=8',
      rating: 4,
      date: '1 week ago',
      tripType: 'Solo Adventure',
      destination: 'Peru',
      title: 'Amazing solo trek to Machu Picchu',
      content: 'Booked my entire Peru adventure through TrueDest. The guided tours were fantastic, and I met amazing people. The app made it easy to manage everything on the go. Only minor hiccup was a slight delay in email confirmation.',
      highlights: ['Adventure', 'Mobile App', 'Great Tours'],
      verified: true
    },
    {
      id: 5,
      name: 'Lisa Anderson',
      location: 'Chicago, USA',
      avatar: 'https://i.pravatar.cc/150?img=9',
      rating: 5,
      date: '2 months ago',
      tripType: 'Girls Trip',
      destination: 'Dubai, UAE',
      title: 'Luxury girls trip to Dubai',
      content: 'Five stars all the way! TrueDest found us the best deals on a luxury hotel in Dubai. The package included spa treatments and desert safari. Customer service helped us customize our itinerary perfectly.',
      highlights: ['Luxury', 'Customizable', 'Great Deals'],
      verified: true
    },
    {
      id: 6,
      name: 'Robert Taylor',
      location: 'Sydney, Australia',
      avatar: 'https://i.pravatar.cc/150?img=12',
      rating: 5,
      date: '1 month ago',
      tripType: 'Family Reunion',
      destination: 'Paris, France',
      title: 'Seamless European family reunion',
      content: 'Coordinating travel for 12 family members seemed daunting, but TrueDest made it simple. Group booking discounts saved us thousands. Everyone arrived smoothly, and our Paris apartment was exactly as advertised.',
      highlights: ['Group Booking', 'Cost Savings', 'Reliable'],
      verified: true
    }
  ]

  const stats = [
    { label: 'Happy Travelers', value: '2.5M+' },
    { label: 'Average Rating', value: '4.8/5' },
    { label: 'Reviews', value: '50K+' },
    { label: 'Repeat Customers', value: '73%' }
  ]

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
  }

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  const visibleTestimonials = [
    testimonials[currentIndex],
    testimonials[(currentIndex + 1) % testimonials.length],
    testimonials[(currentIndex + 2) % testimonials.length]
  ]

  return (
    <div className="py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">What Our Travelers Say</h2>
          <p className="text-gray-600 text-lg">Real experiences from real people around the world</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => (
            <div key={index} className="text-center p-6 bg-white rounded-xl shadow-sm">
              <p className="text-3xl font-bold text-blue-600 mb-2">{stat.value}</p>
              <p className="text-gray-600">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="relative">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {visibleTestimonials.map((testimonial, index) => (
              <div
                key={testimonial.id}
                className={`bg-white rounded-xl shadow-lg p-6 transition-all ${
                  index === 0 ? 'md:scale-105 md:shadow-xl' : 'md:opacity-90'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <Quote className="w-8 h-8 text-blue-200" />
                  {testimonial.verified && (
                    <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">
                      Verified Booking
                    </span>
                  )}
                </div>

                <div className="flex items-center mb-4">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full mr-3"
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold">{testimonial.name}</h4>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-3 h-3 mr-1" />
                      {testimonial.location}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 mb-3 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    {testimonial.tripType === 'Family Vacation' && <Users className="w-4 h-4" />}
                    {testimonial.tripType === 'Business Travel' && <Briefcase className="w-4 h-4" />}
                    {testimonial.tripType === 'Honeymoon' && <Heart className="w-4 h-4" />}
                    {testimonial.tripType === 'Solo Adventure' && <Compass className="w-4 h-4" />}
                    {testimonial.tripType === 'Girls Trip' && <Users className="w-4 h-4" />}
                    {testimonial.tripType === 'Family Reunion' && <Users className="w-4 h-4" />}
                    {testimonial.tripType}
                  </span>
                  <span>•</span>
                  <span>{testimonial.destination}</span>
                </div>

                <div className="flex items-center mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < testimonial.rating
                          ? 'text-yellow-500 fill-yellow-500'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-sm text-gray-600">{testimonial.date}</span>
                </div>

                <h3 className="font-semibold mb-2">{testimonial.title}</h3>
                <p className="text-gray-600 mb-4 line-clamp-4">{testimonial.content}</p>

                <div className="flex flex-wrap gap-2">
                  {testimonial.highlights.map((highlight, idx) => (
                    <span
                      key={idx}
                      className="bg-blue-50 text-blue-600 text-xs px-2 py-1 rounded-full"
                    >
                      {highlight}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={prevTestimonial}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow md:block hidden"
          >
            <ChevronLeft className="w-6 h-6 text-gray-600" />
          </button>
          <button
            onClick={nextTestimonial}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow md:block hidden"
          >
            <ChevronRight className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <div className="text-center mt-12">
          <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
            Read More Reviews
          </button>
        </div>
      </div>
    </div>
  )
}