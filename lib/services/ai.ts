import OpenAI from 'openai'
import { prisma } from '@/lib/prisma'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface TripRecommendation {
  destination: string
  reason: string
  highlights: string[]
  estimatedBudget: number
  bestTimeToVisit: string
  duration: string
}

export interface ItineraryDay {
  day: number
  title: string
  activities: {
    time: string
    activity: string
    location: string
    duration: string
    tips?: string
  }[]
}

export class AIService {
  // Generate personalized trip recommendations
  async getPersonalizedRecommendations(userId: string, preferences?: any) {
    try {
      // Get user's booking history and preferences
      const userHistory = await this.getUserTravelHistory(userId)
      const userPrefs = preferences || await this.getUserPreferences(userId)

      const prompt = `Based on the following user travel history and preferences, suggest 5 personalized travel destinations:

Travel History: ${JSON.stringify(userHistory)}
Preferences: ${JSON.stringify(userPrefs)}

Provide recommendations in JSON format with destination, reason, highlights, estimatedBudget, bestTimeToVisit, and duration.`

      const completion = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are a professional travel advisor providing personalized recommendations.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
        max_tokens: 1000,
      })

      const recommendations = JSON.parse(completion.choices[0].message.content || '{}')
      return recommendations.destinations as TripRecommendation[]
    } catch (error) {
      console.error('AI recommendation error:', error)
      throw new Error('Failed to generate recommendations')
    }
  }

  // Generate detailed itinerary
  async generateItinerary(
    destination: string,
    duration: number,
    interests: string[],
    budget: string,
    travelStyle: string
  ) {
    try {
      const prompt = `Create a detailed ${duration}-day itinerary for ${destination} with the following preferences:
- Interests: ${interests.join(', ')}
- Budget: ${budget}
- Travel Style: ${travelStyle}

Provide a day-by-day itinerary in JSON format with activities, timings, locations, and tips.`

      const completion = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are an expert travel planner creating detailed, practical itineraries.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
        max_tokens: 2000,
      })

      const itinerary = JSON.parse(completion.choices[0].message.content || '{}')
      return itinerary.days as ItineraryDay[]
    } catch (error) {
      console.error('AI itinerary error:', error)
      throw new Error('Failed to generate itinerary')
    }
  }

  // Natural language search
  async naturalLanguageSearch(query: string) {
    try {
      const prompt = `Parse the following travel search query and extract structured information:
Query: "${query}"

Extract: origin, destination, departureDate, returnDate, travelers, travelClass, hotelNeeded, carNeeded, preferences.
If dates are relative (like "next weekend"), convert to approximate dates from today.`

      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a travel search parser that extracts structured data from natural language queries.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
        max_tokens: 500,
      })

      return JSON.parse(completion.choices[0].message.content || '{}')
    } catch (error) {
      console.error('AI search parsing error:', error)
      throw new Error('Failed to parse search query')
    }
  }

  // Smart chat assistant
  async chatAssistant(userId: string, message: string, context?: any) {
    try {
      // Get user context
      const userContext = await this.getUserContext(userId)

      const systemPrompt = `You are TrueDest AI, a helpful travel assistant. You have access to the user's booking history and can help with:
- Finding flights and hotels
- Planning trips
- Answering travel questions
- Providing destination information
- Helping with existing bookings

User Context: ${JSON.stringify(userContext)}
Additional Context: ${JSON.stringify(context)}`

      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: message,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      })

      return completion.choices[0].message.content
    } catch (error) {
      console.error('AI chat error:', error)
      throw new Error('Failed to process chat message')
    }
  }

  // Price prediction
  async predictPrices(route: string, dates: string[]) {
    try {
      const prompt = `Based on historical data and trends, predict flight prices for:
Route: ${route}
Dates: ${dates.join(', ')}

Provide predictions with confidence levels and best booking time recommendations.`

      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a travel price prediction expert using historical patterns and seasonal trends.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.5,
        max_tokens: 500,
      })

      return JSON.parse(completion.choices[0].message.content || '{}')
    } catch (error) {
      console.error('AI price prediction error:', error)
      throw new Error('Failed to predict prices')
    }
  }

  // Document scanning (passport, visa)
  async scanTravelDocument(imageBase64: string, documentType: 'passport' | 'visa' | 'id') {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4-vision-preview',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Extract information from this ${documentType}. Return JSON with relevant fields like name, number, expiry date, nationality, etc.`,
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`,
                },
              },
            ],
          },
        ],
        max_tokens: 500,
      })

      return JSON.parse(response.choices[0].message.content || '{}')
    } catch (error) {
      console.error('AI document scan error:', error)
      throw new Error('Failed to scan document')
    }
  }

  // Review summarization
  async summarizeReviews(reviews: string[]) {
    try {
      const prompt = `Summarize the following hotel/flight reviews into key pros, cons, and overall sentiment:

Reviews:
${reviews.join('\n---\n')}

Provide a concise summary with ratings breakdown.`

      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a review analysis expert providing balanced summaries.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.5,
        max_tokens: 500,
      })

      return JSON.parse(completion.choices[0].message.content || '{}')
    } catch (error) {
      console.error('AI review summary error:', error)
      throw new Error('Failed to summarize reviews')
    }
  }

  // Travel tips and advice
  async getTravelTips(destination: string, season: string, travelerType: string) {
    try {
      const prompt = `Provide essential travel tips for:
Destination: ${destination}
Season: ${season}
Traveler Type: ${travelerType}

Include: packing list, cultural etiquette, safety tips, money-saving advice, must-see attractions, local transportation.`

      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a seasoned travel expert providing practical, up-to-date travel advice.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
        max_tokens: 1000,
      })

      return JSON.parse(completion.choices[0].message.content || '{}')
    } catch (error) {
      console.error('AI travel tips error:', error)
      throw new Error('Failed to generate travel tips')
    }
  }

  // Helper methods
  private async getUserTravelHistory(userId: string) {
    const bookings = await prisma.booking.findMany({
      where: { 
        userId,
        status: 'COMPLETED',
      },
      include: {
        flights: true,
        hotels: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    })

    return bookings.map(booking => ({
      destination: booking.flights[0]?.arrivalCity || booking.hotels[0]?.hotelCity,
      date: booking.travelDate,
      type: booking.type,
      duration: booking.returnDate 
        ? Math.ceil((booking.returnDate.getTime() - booking.travelDate.getTime()) / (1000 * 60 * 60 * 24))
        : null,
    }))
  }

  private async getUserPreferences(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { preferences: true },
    })

    return user?.preferences || {
      budget: 'moderate',
      travelStyle: 'comfort',
      interests: ['culture', 'food', 'nature'],
    }
  }

  private async getUserContext(userId: string) {
    const [user, recentBookings, savedSearches] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          name: true,
          loyaltyTier: true,
          loyaltyPoints: true,
          preferredCurrency: true,
        },
      }),
      prisma.booking.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 3,
        select: {
          bookingReference: true,
          type: true,
          status: true,
          travelDate: true,
        },
      }),
      prisma.searchHistory.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          searchType: true,
          query: true,
        },
      }),
    ])

    return {
      user,
      recentBookings,
      savedSearches,
    }
  }
}

export const aiService = new AIService()