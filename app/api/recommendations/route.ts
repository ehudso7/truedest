/**
 * AI Recommendations API Route
 *
 * Provides personalized travel recommendations based on user history,
 * preferences, and AI-powered suggestions.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'
import { aiService } from '@/lib/services/ai'
import { z } from 'zod'

// Request validation schema
const recommendationRequestSchema = z.object({
  type: z.enum(['personalized', 'trending', 'similar', 'itinerary']).default('personalized'),
  destination: z.string().optional(),
  duration: z.number().int().min(1).max(30).optional(),
  interests: z.array(z.string()).optional(),
  budget: z.enum(['budget', 'moderate', 'luxury']).optional(),
  travelStyle: z.enum(['adventure', 'relaxation', 'culture', 'business']).optional(),
  limit: z.number().int().min(1).max(20).default(5),
})

/**
 * GET /api/recommendations
 * Get personalized travel recommendations
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(request.url)

    const params = recommendationRequestSchema.parse({
      type: searchParams.get('type') || 'personalized',
      destination: searchParams.get('destination'),
      duration: searchParams.get('duration') ? parseInt(searchParams.get('duration')!) : undefined,
      interests: searchParams.get('interests')?.split(',').filter(Boolean),
      budget: searchParams.get('budget'),
      travelStyle: searchParams.get('travelStyle'),
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 5,
    })

    let recommendations

    switch (params.type) {
      case 'personalized':
        recommendations = await getPersonalizedRecommendations(session?.user?.id, params)
        break
      case 'trending':
        recommendations = await getTrendingDestinations(params.limit)
        break
      case 'similar':
        if (!params.destination) {
          return NextResponse.json(
            { error: 'Destination required for similar recommendations', code: 'MISSING_DESTINATION' },
            { status: 400 }
          )
        }
        recommendations = await getSimilarDestinations(params.destination, params.limit)
        break
      case 'itinerary':
        if (!params.destination || !params.duration) {
          return NextResponse.json(
            { error: 'Destination and duration required for itinerary', code: 'MISSING_PARAMS' },
            { status: 400 }
          )
        }
        recommendations = await generateItinerary(
          params.destination,
          params.duration,
          params.interests || [],
          params.budget || 'moderate',
          params.travelStyle || 'culture'
        )
        break
      default:
        recommendations = await getPersonalizedRecommendations(session?.user?.id, params)
    }

    return NextResponse.json({
      success: true,
      data: recommendations,
      type: params.type,
    })

  } catch (error) {
    console.error('[RECOMMENDATIONS] Error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Invalid parameters',
          code: 'VALIDATION_ERROR',
          details: error.errors,
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to get recommendations', code: 'RECOMMENDATION_ERROR' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/recommendations
 * Generate AI-powered recommendations with specific criteria
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()
    const params = recommendationRequestSchema.parse(body)

    let recommendations

    if (params.type === 'itinerary' && params.destination && params.duration) {
      recommendations = await generateItinerary(
        params.destination,
        params.duration,
        params.interests || [],
        params.budget || 'moderate',
        params.travelStyle || 'culture'
      )
    } else if (session?.user?.id) {
      recommendations = await aiService.getPersonalizedRecommendations(
        session.user.id,
        {
          budget: params.budget,
          travelStyle: params.travelStyle,
          interests: params.interests,
        }
      )

      // Store recommendations for tracking
      if (Array.isArray(recommendations)) {
        await Promise.all(
          recommendations.slice(0, 5).map((rec: { destination: string; reason: string; highlights?: string[]; estimatedBudget?: number; bestTimeToVisit?: string; duration?: string }) =>
            prisma.aIRecommendation.create({
              data: {
                userId: session.user.id,
                destination: rec.destination,
                reason: rec.reason,
                highlights: rec.highlights || [],
                estimatedBudget: rec.estimatedBudget,
                bestTimeToVisit: rec.bestTimeToVisit,
                duration: rec.duration,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
              },
            }).catch(() => null) // Ignore errors
          )
        )
      }
    } else {
      recommendations = await getPersonalizedRecommendations(undefined, params)
    }

    return NextResponse.json({
      success: true,
      data: recommendations,
    })

  } catch (error) {
    console.error('[RECOMMENDATIONS] POST Error:', error)

    return NextResponse.json(
      { error: 'Failed to generate recommendations', code: 'RECOMMENDATION_ERROR' },
      { status: 500 }
    )
  }
}

/**
 * Get personalized recommendations based on user history
 */
async function getPersonalizedRecommendations(
  userId: string | undefined,
  params: z.infer<typeof recommendationRequestSchema>
) {
  // If user is authenticated, use AI service
  if (userId) {
    try {
      const recommendations = await aiService.getPersonalizedRecommendations(userId, {
        budget: params.budget,
        travelStyle: params.travelStyle,
        interests: params.interests,
      })
      return recommendations
    } catch (error) {
      console.error('[RECOMMENDATIONS] AI service error:', error)
      // Fall back to default recommendations
    }
  }

  // Default recommendations for anonymous users or fallback
  return getDefaultRecommendations(params.limit)
}

/**
 * Get trending destinations based on search and booking data
 */
async function getTrendingDestinations(limit: number) {
  // In production, this would aggregate from search/booking data
  return [
    {
      destination: 'Tokyo, Japan',
      reason: 'Most searched destination this month',
      highlights: ['Cherry blossoms', 'Traditional temples', 'Modern technology'],
      estimatedBudget: 2500,
      bestTimeToVisit: 'March-April or October-November',
      duration: '7-10 days',
      trendScore: 98,
    },
    {
      destination: 'Paris, France',
      reason: 'Top romantic getaway',
      highlights: ['Eiffel Tower', 'Louvre Museum', 'French cuisine'],
      estimatedBudget: 2200,
      bestTimeToVisit: 'April-June or September-October',
      duration: '5-7 days',
      trendScore: 95,
    },
    {
      destination: 'Bali, Indonesia',
      reason: 'Best value destination',
      highlights: ['Beautiful beaches', 'Hindu temples', 'Yoga retreats'],
      estimatedBudget: 1200,
      bestTimeToVisit: 'April-October',
      duration: '7-14 days',
      trendScore: 92,
    },
    {
      destination: 'New York City, USA',
      reason: 'Urban exploration favorite',
      highlights: ['Broadway shows', 'Central Park', 'World-class museums'],
      estimatedBudget: 2800,
      bestTimeToVisit: 'September-November or April-June',
      duration: '4-7 days',
      trendScore: 90,
    },
    {
      destination: 'Santorini, Greece',
      reason: 'Most Instagrammed destination',
      highlights: ['Stunning sunsets', 'White-washed buildings', 'Volcanic beaches'],
      estimatedBudget: 1800,
      bestTimeToVisit: 'April-October',
      duration: '4-5 days',
      trendScore: 88,
    },
  ].slice(0, limit)
}

/**
 * Get similar destinations based on a given destination
 */
async function getSimilarDestinations(destination: string, limit: number) {
  // In production, this would use embeddings or AI
  const similarityMap: Record<string, string[]> = {
    'paris': ['Rome', 'Barcelona', 'Vienna', 'Amsterdam', 'Prague'],
    'tokyo': ['Seoul', 'Osaka', 'Taipei', 'Hong Kong', 'Singapore'],
    'bali': ['Phuket', 'Maldives', 'Sri Lanka', 'Fiji', 'Mauritius'],
    'new york': ['Los Angeles', 'Chicago', 'London', 'Toronto', 'Sydney'],
    'rome': ['Florence', 'Venice', 'Athens', 'Barcelona', 'Lisbon'],
  }

  const key = destination.toLowerCase()
  const similar = Object.entries(similarityMap).find(([k]) => key.includes(k))?.[1] ||
    ['London', 'Dubai', 'Singapore', 'Sydney', 'Barcelona']

  return similar.slice(0, limit).map((dest, index) => ({
    destination: dest,
    reason: `Similar to ${destination}`,
    similarityScore: 90 - (index * 5),
    highlights: ['Popular destination', 'Great for travelers', 'Rich culture'],
    estimatedBudget: 1500 + (index * 200),
    bestTimeToVisit: 'Year-round',
    duration: '5-7 days',
  }))
}

/**
 * Generate AI itinerary
 */
async function generateItinerary(
  destination: string,
  duration: number,
  interests: string[],
  budget: string,
  travelStyle: string
) {
  try {
    const itinerary = await aiService.generateItinerary(
      destination,
      duration,
      interests,
      budget,
      travelStyle
    )
    return itinerary
  } catch (error) {
    console.error('[RECOMMENDATIONS] Itinerary generation error:', error)
    // Return basic itinerary structure
    return generateBasicItinerary(destination, duration)
  }
}

/**
 * Generate basic itinerary (fallback)
 */
function generateBasicItinerary(destination: string, duration: number) {
  const days = []
  for (let i = 1; i <= duration; i++) {
    days.push({
      day: i,
      title: i === 1 ? 'Arrival & Orientation' : i === duration ? 'Departure Day' : `Exploring ${destination}`,
      activities: [
        {
          time: '09:00',
          activity: i === 1 ? 'Check into accommodation' : 'Breakfast at local cafe',
          location: destination,
          duration: '1 hour',
          tips: 'Start your day early for the best experience',
        },
        {
          time: '10:30',
          activity: 'Visit main attractions',
          location: `Popular sites in ${destination}`,
          duration: '3 hours',
          tips: 'Book tickets in advance when possible',
        },
        {
          time: '14:00',
          activity: 'Lunch break',
          location: 'Local restaurant',
          duration: '1.5 hours',
          tips: 'Try the local cuisine',
        },
        {
          time: '16:00',
          activity: 'Explore neighborhoods',
          location: destination,
          duration: '3 hours',
          tips: 'Great for photography',
        },
        {
          time: '19:30',
          activity: 'Dinner',
          location: 'Recommended restaurant',
          duration: '2 hours',
          tips: 'Make reservations for popular spots',
        },
      ],
    })
  }
  return days
}

/**
 * Get default recommendations for anonymous users
 */
function getDefaultRecommendations(limit: number) {
  return [
    {
      destination: 'Barcelona, Spain',
      reason: 'Perfect blend of beach and culture',
      highlights: ['Sagrada Familia', 'Las Ramblas', 'Mediterranean beaches'],
      estimatedBudget: 1800,
      bestTimeToVisit: 'May-June or September-October',
      duration: '5-7 days',
    },
    {
      destination: 'Kyoto, Japan',
      reason: 'Traditional Japanese experience',
      highlights: ['Historic temples', 'Bamboo groves', 'Traditional tea houses'],
      estimatedBudget: 2200,
      bestTimeToVisit: 'March-May or October-November',
      duration: '4-6 days',
    },
    {
      destination: 'Iceland',
      reason: 'Unique natural wonders',
      highlights: ['Northern Lights', 'Blue Lagoon', 'Glacier hikes'],
      estimatedBudget: 3000,
      bestTimeToVisit: 'September-March for Northern Lights',
      duration: '7-10 days',
    },
    {
      destination: 'Marrakech, Morocco',
      reason: 'Exotic cultural immersion',
      highlights: ['Medina markets', 'Desert tours', 'Traditional riads'],
      estimatedBudget: 1200,
      bestTimeToVisit: 'March-May or September-November',
      duration: '4-5 days',
    },
    {
      destination: 'Cape Town, South Africa',
      reason: 'Adventure and natural beauty',
      highlights: ['Table Mountain', 'Cape of Good Hope', 'Wine country'],
      estimatedBudget: 1600,
      bestTimeToVisit: 'October-April',
      duration: '7-10 days',
    },
  ].slice(0, limit)
}
