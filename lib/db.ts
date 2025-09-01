// Simplified in-memory database for immediate functionality
// This provides a working implementation without external dependencies

export interface User {
  id: string
  email: string
  password: string
  name: string
  loyaltyPoints: number
  bookings: Booking[]
  createdAt: Date
}

export interface Flight {
  id: string
  airline: string
  flightNumber: string
  from: string
  to: string
  departureTime: Date
  arrivalTime: Date
  price: number
  availableSeats: number
}

export interface Hotel {
  id: string
  name: string
  city: string
  country: string
  rating: number
  pricePerNight: number
  availableRooms: number
  amenities: string[]
  images: string[]
}

export interface Booking {
  id: string
  userId: string
  type: 'flight' | 'hotel' | 'package'
  status: 'pending' | 'confirmed' | 'cancelled'
  totalAmount: number
  createdAt: Date
  details: any
}

// Mock data stores
const users = new Map<string, User>()
const flights = new Map<string, Flight>()
const hotels = new Map<string, Hotel>()
const bookings = new Map<string, Booking>()

// Initialize with sample data
function initializeMockData() {
  // Sample flights
  const sampleFlights: Flight[] = [
    {
      id: 'FL001',
      airline: 'United Airlines',
      flightNumber: 'UA123',
      from: 'New York (JFK)',
      to: 'London (LHR)',
      departureTime: new Date('2024-04-15T14:00:00'),
      arrivalTime: new Date('2024-04-16T02:00:00'),
      price: 599,
      availableSeats: 45
    },
    {
      id: 'FL002',
      airline: 'Delta Airlines',
      flightNumber: 'DL456',
      from: 'Los Angeles (LAX)',
      to: 'Tokyo (NRT)',
      departureTime: new Date('2024-04-20T11:00:00'),
      arrivalTime: new Date('2024-04-21T16:00:00'),
      price: 899,
      availableSeats: 32
    },
    {
      id: 'FL003',
      airline: 'Emirates',
      flightNumber: 'EK789',
      from: 'Dubai (DXB)',
      to: 'Singapore (SIN)',
      departureTime: new Date('2024-04-18T03:00:00'),
      arrivalTime: new Date('2024-04-18T14:30:00'),
      price: 450,
      availableSeats: 28
    },
    {
      id: 'FL004',
      airline: 'Air France',
      flightNumber: 'AF234',
      from: 'Paris (CDG)',
      to: 'New York (JFK)',
      departureTime: new Date('2024-04-22T10:00:00'),
      arrivalTime: new Date('2024-04-22T13:00:00'),
      price: 650,
      availableSeats: 15
    },
    {
      id: 'FL005',
      airline: 'Singapore Airlines',
      flightNumber: 'SQ567',
      from: 'Singapore (SIN)',
      to: 'Sydney (SYD)',
      departureTime: new Date('2024-04-25T20:00:00'),
      arrivalTime: new Date('2024-04-26T06:00:00'),
      price: 520,
      availableSeats: 60
    }
  ]

  // Sample hotels
  const sampleHotels: Hotel[] = [
    {
      id: 'HTL001',
      name: 'The Plaza Hotel',
      city: 'New York',
      country: 'USA',
      rating: 5,
      pricePerNight: 795,
      availableRooms: 12,
      amenities: ['Spa', 'Gym', 'Restaurant', 'Bar', 'WiFi', 'Pool'],
      images: ['https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800']
    },
    {
      id: 'HTL002',
      name: 'Marina Bay Sands',
      city: 'Singapore',
      country: 'Singapore',
      rating: 5,
      pricePerNight: 650,
      availableRooms: 25,
      amenities: ['Infinity Pool', 'Casino', 'Spa', 'Multiple Restaurants', 'WiFi'],
      images: ['https://images.unsplash.com/photo-1569288052389-dac9b0ac9495?w=800']
    },
    {
      id: 'HTL003',
      name: 'The Ritz London',
      city: 'London',
      country: 'UK',
      rating: 5,
      pricePerNight: 850,
      availableRooms: 8,
      amenities: ['Afternoon Tea', 'Fine Dining', 'Spa', 'Concierge', 'WiFi'],
      images: ['https://images.unsplash.com/photo-1559599238-308793637427?w=800']
    },
    {
      id: 'HTL004',
      name: 'Park Hyatt Tokyo',
      city: 'Tokyo',
      country: 'Japan',
      rating: 5,
      pricePerNight: 680,
      availableRooms: 18,
      amenities: ['Spa', 'Pool', 'Gym', 'Restaurant', 'Bar', 'WiFi'],
      images: ['https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800']
    },
    {
      id: 'HTL005',
      name: 'Burj Al Arab',
      city: 'Dubai',
      country: 'UAE',
      rating: 5,
      pricePerNight: 1500,
      availableRooms: 5,
      amenities: ['Private Beach', 'Helipad', 'Multiple Restaurants', 'Spa', 'Butler Service'],
      images: ['https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800']
    }
  ]

  // Add to stores
  sampleFlights.forEach(flight => flights.set(flight.id, flight))
  sampleHotels.forEach(hotel => hotels.set(hotel.id, hotel))

  // Add a demo user
  const demoUser: User = {
    id: 'user_demo',
    email: 'demo@truedest.com',
    password: '$2a$10$K8ZpdrjwzUWSTmtyP5m9iehY.CS9KZMvzEd6lFpZYSvr.pgA.ma1C', // "demo123"
    name: 'Demo User',
    loyaltyPoints: 1500,
    bookings: [],
    createdAt: new Date()
  }
  users.set(demoUser.id, demoUser)
}

// Initialize on load
initializeMockData()

// Database operations
export const db = {
  // User operations
  users: {
    findByEmail: async (email: string): Promise<User | null> => {
      for (const user of users.values()) {
        if (user.email === email) return user
      }
      return null
    },
    
    findById: async (id: string): Promise<User | null> => {
      return users.get(id) || null
    },
    
    create: async (data: Omit<User, 'id' | 'createdAt' | 'bookings'>): Promise<User> => {
      const user: User = {
        ...data,
        id: `user_${Date.now()}`,
        bookings: [],
        createdAt: new Date()
      }
      users.set(user.id, user)
      return user
    },
    
    update: async (id: string, data: Partial<User>): Promise<User | null> => {
      const user = users.get(id)
      if (!user) return null
      const updated = { ...user, ...data }
      users.set(id, updated)
      return updated
    }
  },

  // Flight operations
  flights: {
    search: async (params: {
      from?: string
      to?: string
      date?: Date
      minPrice?: number
      maxPrice?: number
    }): Promise<Flight[]> => {
      let results = Array.from(flights.values())
      
      if (params.from) {
        results = results.filter(f => 
          f.from.toLowerCase().includes(params.from!.toLowerCase())
        )
      }
      
      if (params.to) {
        results = results.filter(f => 
          f.to.toLowerCase().includes(params.to!.toLowerCase())
        )
      }
      
      if (params.minPrice) {
        results = results.filter(f => f.price >= params.minPrice!)
      }
      
      if (params.maxPrice) {
        results = results.filter(f => f.price <= params.maxPrice!)
      }
      
      return results
    },
    
    findById: async (id: string): Promise<Flight | null> => {
      return flights.get(id) || null
    },
    
    getAll: async (): Promise<Flight[]> => {
      return Array.from(flights.values())
    }
  },

  // Hotel operations
  hotels: {
    search: async (params: {
      city?: string
      country?: string
      minRating?: number
      maxPrice?: number
    }): Promise<Hotel[]> => {
      let results = Array.from(hotels.values())
      
      if (params.city) {
        results = results.filter(h => 
          h.city.toLowerCase().includes(params.city!.toLowerCase())
        )
      }
      
      if (params.country) {
        results = results.filter(h => 
          h.country.toLowerCase().includes(params.country!.toLowerCase())
        )
      }
      
      if (params.minRating) {
        results = results.filter(h => h.rating >= params.minRating!)
      }
      
      if (params.maxPrice) {
        results = results.filter(h => h.pricePerNight <= params.maxPrice!)
      }
      
      return results
    },
    
    findById: async (id: string): Promise<Hotel | null> => {
      return hotels.get(id) || null
    },
    
    getAll: async (): Promise<Hotel[]> => {
      return Array.from(hotels.values())
    }
  },

  // Booking operations
  bookings: {
    create: async (data: Omit<Booking, 'id' | 'createdAt'>): Promise<Booking> => {
      const booking: Booking = {
        ...data,
        id: `BK${Date.now()}`,
        createdAt: new Date()
      }
      bookings.set(booking.id, booking)
      
      // Add to user's bookings
      const user = users.get(data.userId)
      if (user) {
        user.bookings.push(booking)
        users.set(user.id, user)
      }
      
      return booking
    },
    
    findById: async (id: string): Promise<Booking | null> => {
      return bookings.get(id) || null
    },
    
    findByUserId: async (userId: string): Promise<Booking[]> => {
      const userBookings: Booking[] = []
      for (const booking of bookings.values()) {
        if (booking.userId === userId) {
          userBookings.push(booking)
        }
      }
      return userBookings
    },
    
    update: async (id: string, data: Partial<Booking>): Promise<Booking | null> => {
      const booking = bookings.get(id)
      if (!booking) return null
      const updated = { ...booking, ...data }
      bookings.set(id, updated)
      return updated
    }
  }
}

export default db