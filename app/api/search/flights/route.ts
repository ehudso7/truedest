import { NextRequest, NextResponse } from 'next/server'

// Mock flight data
const generateFlights = (from: string, to: string, date: string) => {
  const airlines = ['United Airlines', 'Delta Airlines', 'American Airlines', 'Southwest', 'JetBlue']
  const flights = []

  for (let i = 0; i < 5; i++) {
    flights.push({
      id: `FL${Date.now()}${i}`,
      airline: airlines[i],
      from,
      to,
      departureTime: `${8 + i * 2}:00`,
      arrivalTime: `${12 + i * 2}:30`,
      date,
      price: 199 + (i * 50),
      duration: '4h 30m',
      stops: i === 0 ? 0 : 1,
      availableSeats: Math.floor(Math.random() * 20) + 5
    })
  }

  return flights
}

export async function POST(request: NextRequest) {
  try {
    const { from, to, departDate, returnDate, passengers } = await request.json()

    if (!from || !to || !departDate) {
      return NextResponse.json(
        { error: 'Missing required search parameters' },
        { status: 400 }
      )
    }

    // Generate mock flight results
    const outboundFlights = generateFlights(from, to, departDate)
    const returnFlights = returnDate ? generateFlights(to, from, returnDate) : []

    return NextResponse.json({
      outbound: outboundFlights,
      return: returnFlights,
      searchParams: {
        from,
        to,
        departDate,
        returnDate,
        passengers: passengers || 1
      }
    })
  } catch (error) {
    console.error('Flight search error:', error)
    return NextResponse.json(
      { error: 'Failed to search flights' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const from = searchParams.get('from')
  const to = searchParams.get('to')
  const date = searchParams.get('date')

  if (!from || !to || !date) {
    return NextResponse.json(
      { error: 'Missing required parameters' },
      { status: 400 }
    )
  }

  const flights = generateFlights(from, to, date)
  return NextResponse.json({ flights })
}