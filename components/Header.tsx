'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { Menu, X, User, LogOut, Plane } from 'lucide-react'

export default function Header() {
  const { user, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="bg-white shadow-sm border-b">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Plane className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">TrueDest</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/search?type=flights" className="text-gray-700 hover:text-blue-600">
              Flights
            </Link>
            <Link href="/search?type=hotels" className="text-gray-700 hover:text-blue-600">
              Hotels
            </Link>
            <Link href="/search?type=packages" className="text-gray-700 hover:text-blue-600">
              Packages
            </Link>
            {user ? (
              <>
                <Link href="/trips" className="text-gray-700 hover:text-blue-600">
                  My Trips
                </Link>
                <Link href="/dashboard" className="text-gray-700 hover:text-blue-600">
                  Dashboard
                </Link>
              </>
            ) : null}
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <Link
                  href="/profile"
                  className="flex items-center space-x-2 text-gray-700 hover:text-blue-600"
                >
                  <User className="h-5 w-5" />
                  <span>{user.name}</span>
                </Link>
                <button
                  onClick={logout}
                  className="flex items-center space-x-2 text-gray-700 hover:text-red-600"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-gray-700 hover:text-blue-600"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-700 hover:text-blue-600"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-2">
            <Link
              href="/search?type=flights"
              className="block px-3 py-2 text-gray-700 hover:text-blue-600"
            >
              Flights
            </Link>
            <Link
              href="/search?type=hotels"
              className="block px-3 py-2 text-gray-700 hover:text-blue-600"
            >
              Hotels
            </Link>
            <Link
              href="/search?type=packages"
              className="block px-3 py-2 text-gray-700 hover:text-blue-600"
            >
              Packages
            </Link>
            {user ? (
              <>
                <Link
                  href="/trips"
                  className="block px-3 py-2 text-gray-700 hover:text-blue-600"
                >
                  My Trips
                </Link>
                <Link
                  href="/dashboard"
                  className="block px-3 py-2 text-gray-700 hover:text-blue-600"
                >
                  Dashboard
                </Link>
                <Link
                  href="/profile"
                  className="block px-3 py-2 text-gray-700 hover:text-blue-600"
                >
                  Profile
                </Link>
                <button
                  onClick={logout}
                  className="block w-full text-left px-3 py-2 text-gray-700 hover:text-red-600"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="block px-3 py-2 text-gray-700 hover:text-blue-600"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="block px-3 py-2 text-gray-700 hover:text-blue-600"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        )}
      </nav>
    </header>
  )
}