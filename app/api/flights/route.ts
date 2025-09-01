import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const from = searchParams.get('from')
    const to = searchParams.get('to')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')

    const flights = await db.flights.search({
      from: from || undefined,
      to: to || undefined,
      minPrice: minPrice ? parseInt(minPrice) : undefined,
      maxPrice: maxPrice ? parseInt(maxPrice) : undefined
    })

    return NextResponse.json({
      success: true,
      data: flights,
      count: flights.length
    })
  } catch (error) {
    console.error('Flight search error:', error)
    return NextResponse.json(
      { error: 'Failed to search flights' },
      { status: 500 }
    )
  }
}