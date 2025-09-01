import Amadeus from 'amadeus'

// Initialize Amadeus SDK
const amadeus = new Amadeus({
  clientId: process.env.AMADEUS_CLIENT_ID!,
  clientSecret: process.env.AMADEUS_CLIENT_SECRET!,
  hostname: process.env.AMADEUS_HOSTNAME || 'test.api.amadeus.com',
})

export interface FlightSearchParams {
  originLocationCode: string
  destinationLocationCode: string
  departureDate: string
  returnDate?: string
  adults: number
  children?: number
  infants?: number
  travelClass?: 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST'
  nonStop?: boolean
  maxPrice?: number
  max?: number
}

export interface HotelSearchParams {
  cityCode: string
  checkInDate: string
  checkOutDate: string
  adults: number
  roomQuantity?: number
  radius?: number
  radiusUnit?: 'KM' | 'MILE'
  hotelName?: string
  amenities?: string[]
  ratings?: number[]
  priceRange?: string
}

export class AmadeusService {
  // Flight Search
  async searchFlights(params: FlightSearchParams) {
    try {
      const response = await amadeus.shopping.flightOffersSearch.get({
        originLocationCode: params.originLocationCode,
        destinationLocationCode: params.destinationLocationCode,
        departureDate: params.departureDate,
        returnDate: params.returnDate,
        adults: params.adults,
        children: params.children || 0,
        infants: params.infants || 0,
        travelClass: params.travelClass || 'ECONOMY',
        nonStop: params.nonStop || false,
        maxPrice: params.maxPrice,
        max: params.max || 50,
      })

      return this.formatFlightResults(response.data)
    } catch (error) {
      console.error('Amadeus flight search error:', error)
      throw new Error('Failed to search flights')
    }
  }

  // Flight Price Confirmation
  async confirmFlightPrice(flightOffer: any) {
    try {
      const response = await amadeus.shopping.flightOffers.pricing.post(
        JSON.stringify({
          data: {
            type: 'flight-offers-pricing',
            flightOffers: [flightOffer],
          },
        })
      )

      return response.data
    } catch (error) {
      console.error('Amadeus price confirmation error:', error)
      throw new Error('Failed to confirm flight price')
    }
  }

  // Create Flight Booking
  async createFlightBooking(flightOffer: any, travelers: any[]) {
    try {
      const response = await amadeus.booking.flightOrders.post(
        JSON.stringify({
          data: {
            type: 'flight-order',
            flightOffers: [flightOffer],
            travelers: travelers,
          },
        })
      )

      return response.data
    } catch (error) {
      console.error('Amadeus booking error:', error)
      throw new Error('Failed to create flight booking')
    }
  }

  // Hotel Search
  async searchHotels(params: HotelSearchParams) {
    try {
      const response = await amadeus.shopping.hotelOffers.get({
        cityCode: params.cityCode,
        checkInDate: params.checkInDate,
        checkOutDate: params.checkOutDate,
        adults: params.adults,
        roomQuantity: params.roomQuantity || 1,
        radius: params.radius || 5,
        radiusUnit: params.radiusUnit || 'KM',
        hotelName: params.hotelName,
        amenities: params.amenities,
        ratings: params.ratings,
        priceRange: params.priceRange,
      })

      return this.formatHotelResults(response.data)
    } catch (error) {
      console.error('Amadeus hotel search error:', error)
      throw new Error('Failed to search hotels')
    }
  }

  // Get Hotel Details
  async getHotelDetails(hotelId: string, checkInDate: string, checkOutDate: string, adults: number) {
    try {
      const response = await amadeus.shopping.hotelOffersByHotel.get({
        hotelId,
        checkInDate,
        checkOutDate,
        adults,
      })

      return response.data
    } catch (error) {
      console.error('Amadeus hotel details error:', error)
      throw new Error('Failed to get hotel details')
    }
  }

  // Airport & City Search
  async searchLocations(keyword: string) {
    try {
      const response = await amadeus.referenceData.locations.get({
        keyword,
        subType: 'CITY,AIRPORT',
      })

      return response.data
    } catch (error) {
      console.error('Amadeus location search error:', error)
      throw new Error('Failed to search locations')
    }
  }

  // Flight Status
  async getFlightStatus(carrierCode: string, flightNumber: string, scheduledDepartureDate: string) {
    try {
      const response = await amadeus.schedule.flights.get({
        carrierCode,
        flightNumber,
        scheduledDepartureDate,
      })

      return response.data
    } catch (error) {
      console.error('Amadeus flight status error:', error)
      throw new Error('Failed to get flight status')
    }
  }

  // Seat Maps
  async getSeatMap(flightOffer: any) {
    try {
      const response = await amadeus.shopping.seatmaps.post(
        JSON.stringify({
          data: [flightOffer],
        })
      )

      return response.data
    } catch (error) {
      console.error('Amadeus seat map error:', error)
      throw new Error('Failed to get seat map')
    }
  }

  // Helper Methods
  private formatFlightResults(data: any[]) {
    return data.map(offer => ({
      id: offer.id,
      source: offer.source,
      instantTicketingRequired: offer.instantTicketingRequired,
      nonHomogeneous: offer.nonHomogeneous,
      oneWay: offer.oneWay,
      lastTicketingDate: offer.lastTicketingDate,
      numberOfBookableSeats: offer.numberOfBookableSeats,
      itineraries: offer.itineraries.map((itinerary: any) => ({
        duration: itinerary.duration,
        segments: itinerary.segments.map((segment: any) => ({
          departure: {
            iataCode: segment.departure.iataCode,
            terminal: segment.departure.terminal,
            at: segment.departure.at,
          },
          arrival: {
            iataCode: segment.arrival.iataCode,
            terminal: segment.arrival.terminal,
            at: segment.arrival.at,
          },
          carrierCode: segment.carrierCode,
          number: segment.number,
          aircraft: segment.aircraft,
          operating: segment.operating,
          duration: segment.duration,
          id: segment.id,
          numberOfStops: segment.numberOfStops,
        })),
      })),
      price: {
        currency: offer.price.currency,
        total: offer.price.total,
        base: offer.price.base,
        fees: offer.price.fees,
        grandTotal: offer.price.grandTotal,
      },
      pricingOptions: offer.pricingOptions,
      validatingAirlineCodes: offer.validatingAirlineCodes,
      travelerPricings: offer.travelerPricings,
    }))
  }

  private formatHotelResults(data: any[]) {
    return data.map(hotel => ({
      type: hotel.type,
      hotel: {
        hotelId: hotel.hotel.hotelId,
        chainCode: hotel.hotel.chainCode,
        name: hotel.hotel.name,
        rating: hotel.hotel.rating,
        cityCode: hotel.hotel.cityCode,
        latitude: hotel.hotel.latitude,
        longitude: hotel.hotel.longitude,
        address: hotel.hotel.address,
        contact: hotel.hotel.contact,
        amenities: hotel.hotel.amenities,
        media: hotel.hotel.media,
      },
      available: hotel.available,
      offers: hotel.offers.map((offer: any) => ({
        id: offer.id,
        checkInDate: offer.checkInDate,
        checkOutDate: offer.checkOutDate,
        rateCode: offer.rateCode,
        room: offer.room,
        guests: offer.guests,
        price: offer.price,
        policies: offer.policies,
      })),
    }))
  }
}

export const amadeusService = new AmadeusService()