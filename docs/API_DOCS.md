# TrueDest API Documentation

This document provides comprehensive documentation for all TrueDest API endpoints.

## Base URL

```
Production: https://api.truedest.com
Development: http://localhost:3000
```

## Authentication

TrueDest uses NextAuth.js for authentication. Most endpoints require authentication via session cookies.

### Session Authentication

Include the session cookie with your requests:

```http
Cookie: next-auth.session-token=...
```

### Error Responses

All endpoints return consistent error responses:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": [] // Optional validation details
}
```

Common error codes:
- `UNAUTHORIZED` - Missing or invalid authentication
- `FORBIDDEN` - Insufficient permissions
- `VALIDATION_ERROR` - Request validation failed
- `NOT_FOUND` - Resource not found
- `RATE_LIMITED` - Too many requests

---

## Authentication Endpoints

### Register New User

Creates a new user account.

```http
POST /api/auth/register
Content-Type: application/json
```

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "phone": "+1234567890",          // optional
  "preferredCurrency": "USD",      // optional, default: USD
  "preferredLanguage": "en"        // optional, default: en
}
```

**Password Requirements:**
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

**Success Response (201):**

```json
{
  "success": true,
  "message": "Account created successfully",
  "user": {
    "id": "clx...",
    "email": "john@example.com",
    "name": "John Doe",
    "role": "USER",
    "loyaltyTier": "BRONZE",
    "loyaltyPoints": 100,
    "preferredCurrency": "USD",
    "preferredLanguage": "en",
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
```

**Error Responses:**
- `400` - Validation error
- `409` - User already exists

---

## Flight Endpoints

### Search Flights

Search for available flights.

```http
GET /api/flights/search
```

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| originLocationCode | string | Yes | 3-letter IATA origin code (e.g., JFK) |
| destinationLocationCode | string | Yes | 3-letter IATA destination code |
| departureDate | string | Yes | YYYY-MM-DD format |
| returnDate | string | No | YYYY-MM-DD format (for round trips) |
| adults | number | No | Number of adult passengers (1-9, default: 1) |
| children | number | No | Number of children (0-9, default: 0) |
| infants | number | No | Number of infants (0-9, default: 0) |
| travelClass | string | No | ECONOMY, PREMIUM_ECONOMY, BUSINESS, FIRST |
| nonStop | boolean | No | Direct flights only (default: false) |
| maxPrice | number | No | Maximum price filter |
| max | number | No | Maximum results (1-250, default: 50) |

**Example Request:**

```http
GET /api/flights/search?originLocationCode=JFK&destinationLocationCode=LAX&departureDate=2025-06-15&adults=2&travelClass=BUSINESS
```

**Success Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "offer-123",
      "source": "GDS",
      "price": {
        "total": "450.00",
        "currency": "USD"
      },
      "itineraries": [...],
      "validatingAirlineCodes": ["AA"],
      "travelerPricings": [...]
    }
  ],
  "meta": {
    "count": 25,
    "cached": false
  }
}
```

---

## Hotel Endpoints

### Search Hotels

Search for available hotels.

```http
GET /api/hotels/search
```

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| cityCode | string | Yes | City code (e.g., NYC) |
| checkInDate | string | Yes | YYYY-MM-DD format |
| checkOutDate | string | Yes | YYYY-MM-DD format |
| adults | number | No | Number of adults (1-9, default: 1) |
| roomQuantity | number | No | Number of rooms (1-9, default: 1) |
| radius | number | No | Search radius (default: 5) |
| radiusUnit | string | No | KM or MILE (default: KM) |
| amenities | string[] | No | Filter by amenities |
| ratings | number[] | No | Filter by star ratings (1-5) |

**Example Request:**

```http
GET /api/hotels/search?cityCode=NYC&checkInDate=2025-06-15&checkOutDate=2025-06-20&adults=2&ratings=4,5
```

---

## Booking Endpoints

### Create Booking

Create a new booking for flights or hotels.

```http
POST /api/bookings/create
Content-Type: application/json
Authorization: Required
```

**Flight Booking Request:**

```json
{
  "type": "FLIGHT",
  "flightOffer": { /* Amadeus flight offer object */ },
  "travelers": [
    {
      "id": "1",
      "dateOfBirth": "1990-01-15",
      "name": {
        "firstName": "JOHN",
        "lastName": "DOE"
      },
      "gender": "MALE",
      "contact": {
        "emailAddress": "john@example.com",
        "phones": [
          {
            "deviceType": "MOBILE",
            "countryCallingCode": "1",
            "number": "5551234567"
          }
        ]
      },
      "documents": [
        {
          "documentType": "PASSPORT",
          "number": "AB1234567",
          "expiryDate": "2028-01-15",
          "issuanceCountry": "US",
          "nationality": "US",
          "holder": true
        }
      ]
    }
  ],
  "contact": {
    "emailAddress": "john@example.com",
    "phone": "+15551234567"
  },
  "useLoyaltyPoints": false
}
```

**Success Response (201):**

```json
{
  "success": true,
  "booking": {
    "id": "clx...",
    "bookingReference": "TRD-ABC123",
    "status": "PENDING_PAYMENT",
    "totalPrice": 450.00,
    "currency": "USD"
  },
  "payment": {
    "clientSecret": "pi_xxx_secret_xxx"
  }
}
```

### Get User Bookings

```http
GET /api/bookings
Authorization: Required
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| status | string | Filter by status |
| type | string | FLIGHT, HOTEL, CAR, PACKAGE |
| page | number | Page number (default: 1) |
| limit | number | Items per page (default: 20) |

---

## Price Alert Endpoints

### List Price Alerts

```http
GET /api/price-alerts
Authorization: Required
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| type | string | FLIGHT, HOTEL, PACKAGE |
| active | boolean | Filter active/inactive |
| page | number | Page number |
| limit | number | Items per page |

**Success Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "clx...",
      "alertType": "FLIGHT",
      "searchCriteria": {
        "origin": "JFK",
        "destination": "LAX"
      },
      "targetPrice": 500,
      "currentPrice": 550,
      "isActive": true,
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "totalPages": 1
  }
}
```

### Create Price Alert

```http
POST /api/price-alerts
Content-Type: application/json
Authorization: Required
```

**Request Body:**

```json
{
  "alertType": "FLIGHT",
  "searchCriteria": {
    "origin": "JFK",
    "destination": "LAX",
    "departureDate": "2025-06-15"
  },
  "originCode": "JFK",
  "destinationCode": "LAX",
  "departureDate": "2025-06-15T00:00:00.000Z",
  "targetPrice": 500,
  "currency": "USD",
  "notifyOnAnyDrop": true,
  "dropPercentage": 10
}
```

**Limits:** Maximum 20 active alerts per user.

### Update Price Alert

```http
PATCH /api/price-alerts/[id]
Content-Type: application/json
Authorization: Required
```

**Request Body:**

```json
{
  "targetPrice": 450,
  "isActive": true,
  "notifyOnAnyDrop": false
}
```

### Delete Price Alert

```http
DELETE /api/price-alerts/[id]
Authorization: Required
```

---

## Recommendations Endpoints

### Get AI Recommendations

```http
GET /api/recommendations
Authorization: Required
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| type | string | personalized, trending, similar, itinerary |
| destination | string | Destination for itinerary type |
| limit | number | Number of results (default: 5) |

**Success Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "rec-123",
      "type": "DESTINATION",
      "title": "Paris, France",
      "description": "The City of Light awaits...",
      "imageUrl": "https://...",
      "score": 0.95,
      "reason": "Based on your interest in European culture",
      "price": {
        "from": 899,
        "currency": "USD"
      }
    }
  ]
}
```

---

## User Privacy Endpoints

### Export User Data (GDPR)

Download all user data in JSON format.

```http
GET /api/user/privacy
Authorization: Required
```

**Response:** JSON file download containing:
- User profile
- Booking history
- Payment records (anonymized)
- Reviews
- Wishlist
- Search history
- Notifications
- Price alerts
- Support tickets

### Request Async Export

Request data export to be emailed.

```http
POST /api/user/privacy
Authorization: Required
```

### Delete Account (GDPR)

Permanently delete account and anonymize data.

```http
DELETE /api/user/privacy
Content-Type: application/json
Authorization: Required
```

**Request Body:**

```json
{
  "confirmEmail": "user@example.com",
  "reason": "No longer using the service"
}
```

**Restrictions:**
- Cannot delete account with upcoming bookings
- Requires email confirmation

---

## Webhook Endpoints

### Stripe Webhooks

```http
POST /api/webhooks/stripe
```

Handles Stripe events:
- `payment_intent.succeeded` - Mark payment complete
- `payment_intent.payment_failed` - Mark payment failed
- `charge.refunded` - Process refunds
- `charge.dispute.created` - Handle disputes

Requires valid Stripe signature in `stripe-signature` header.

---

## Rate Limits

| Endpoint Type | Limit | Window |
|--------------|-------|--------|
| Authentication | 5 requests | 15 minutes |
| Search (flights/hotels) | 30 requests | 1 minute |
| API (general) | 60 requests | 1 minute |
| Bookings | 10 requests | 1 hour |
| Webhooks | 100 requests | 1 minute |

When rate limited, response includes:

```json
{
  "error": "Too many requests",
  "code": "RATE_LIMITED",
  "retryAfter": 45
}
```

---

## Pagination

Paginated endpoints support these parameters:

| Parameter | Type | Default | Max |
|-----------|------|---------|-----|
| page | number | 1 | - |
| limit | number | 20 | 100 |
| sortBy | string | createdAt | - |
| sortOrder | string | desc | asc, desc |

Response includes pagination metadata:

```json
{
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

## Error Codes Reference

| Code | Description |
|------|-------------|
| `UNAUTHORIZED` | Authentication required |
| `FORBIDDEN` | Insufficient permissions |
| `VALIDATION_ERROR` | Request validation failed |
| `NOT_FOUND` | Resource not found |
| `USER_EXISTS` | Email already registered |
| `RATE_LIMITED` | Too many requests |
| `ALERT_LIMIT_REACHED` | Maximum alerts exceeded |
| `BOOKING_EXISTS` | Duplicate booking |
| `PAYMENT_FAILED` | Payment processing failed |
| `GDS_ERROR` | External GDS API error |
| `INTERNAL_ERROR` | Server error |

---

## SDKs and Client Libraries

### JavaScript/TypeScript

```typescript
import { TrueDestClient } from '@truedest/sdk';

const client = new TrueDestClient({
  baseUrl: 'https://api.truedest.com',
});

// Search flights
const flights = await client.flights.search({
  origin: 'JFK',
  destination: 'LAX',
  departureDate: '2025-06-15',
});
```

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 2.0.0 | 2025-11-29 | Production-ready release with full validation |
| 1.0.0 | 2025-11-28 | Initial release |
