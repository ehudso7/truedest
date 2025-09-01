import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const city = searchParams.get('city')
    const country = searchParams.get('country')
    const minRating = searchParams.get('minRating')
    const maxPrice = searchParams.get('maxPrice')

    const hotels = await db.hotels.search({
      city: city || undefined,
      country: country || undefined,
      minRating: minRating ? parseInt(minRating) : undefined,
      maxPrice: maxPrice ? parseInt(maxPrice) : undefined
    })

    return NextResponse.json({
      success: true,
      data: hotels,
      count: hotels.length
    })
  } catch (error) {
    console.error('Hotel search error:', error)
    return NextResponse.json(
      { error: 'Failed to search hotels' },
      { status: 500 }
    )
  }
}