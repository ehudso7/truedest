'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'

interface User {
  id: string
  name: string
  email: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check for stored token on mount
    const token = localStorage.getItem('token')
    if (token) {
      // Validate token and get user info
      validateToken(token)
    } else {
      setLoading(false)
    }
  }, [])

  const validateToken = async (token: string) => {
    try {
      // In a real app, validate with backend
      const userData = JSON.parse(localStorage.getItem('user') || '{}')
      if (userData.id) {
        setUser(userData)
      }
    } catch (error) {
      console.error('Token validation failed:', error)
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      if (!response.ok) {
        throw new Error('Login failed')
      }

      const data = await response.json()
      
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      setUser(data.user)
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  const register = async (name: string, email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      })

      if (!response.ok) {
        throw new Error('Registration failed')
      }

      const data = await response.json()
      
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      setUser(data.user)
    } catch (error) {
      console.error('Registration error:', error)
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    router.push('/')
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}