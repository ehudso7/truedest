import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { AuthProvider } from '@/lib/auth-context'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'TrueDest - Your AI-Powered Travel Companion',
  description: 'Book flights, hotels, and plan your perfect trip with AI assistance',
  keywords: 'travel, flights, hotels, booking, vacation, AI travel planner',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
          </div>
          <Toaster position="top-right" />
        </AuthProvider>
      </body>
    </html>
  )
}