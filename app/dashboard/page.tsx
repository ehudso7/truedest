'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Calendar, MapPin, Plane, Hotel, CreditCard, TrendingUp } from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [stats, setStats] = useState({
    upcomingTrips: 0,
    pastTrips: 0,
    savedAmount: 0,
    points: 0
  })

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user.name}!
          </h1>
          <p className="text-gray-600 mt-2">
            Here's what's happening with your travel plans
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Upcoming Trips</p>
                <p className="text-2xl font-bold text-gray-900">{stats.upcomingTrips}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Past Trips</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pastTrips}</p>
              </div>
              <MapPin className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Saved This Year</p>
                <p className="text-2xl font-bold text-gray-900">${stats.savedAmount}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Reward Points</p>
                <p className="text-2xl font-bold text-gray-900">{stats.points}</p>
              </div>
              <CreditCard className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/search?type=flights"
              className="flex items-center justify-center gap-2 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition"
            >
              <Plane className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-blue-900">Search Flights</span>
            </Link>
            <Link
              href="/search?type=hotels"
              className="flex items-center justify-center gap-2 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition"
            >
              <Hotel className="h-5 w-5 text-green-600" />
              <span className="font-medium text-green-900">Find Hotels</span>
            </Link>
            <Link
              href="/trips"
              className="flex items-center justify-center gap-2 p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition"
            >
              <MapPin className="h-5 w-5 text-purple-600" />
              <span className="font-medium text-purple-900">My Trips</span>
            </Link>
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Bookings</h2>
          <div className="space-y-4">
            <p className="text-gray-500 text-center py-8">
              No recent bookings. Start planning your next adventure!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}