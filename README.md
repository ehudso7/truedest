# TrueDest - AI-Powered Travel Booking Platform

![TrueDest Logo](https://truedest.com/logo.png)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://img.shields.io/github/workflow/status/ehudso7/truedest/CI)](https://github.com/ehudso7/truedest/actions)
[![Version](https://img.shields.io/github/v/release/ehudso7/truedest)](https://github.com/ehudso7/truedest/releases)

## Overview

TrueDest is a next-generation travel booking platform that leverages AI to provide personalized travel recommendations and seamless booking experiences. Built with modern web technologies and integrated with leading GDS systems, TrueDest offers comprehensive travel solutions for flights, hotels, car rentals, and vacation packages.

## Features

- **AI-Powered Recommendations**: Personalized travel suggestions based on user preferences
- **Real-Time Search**: Live availability and pricing from multiple providers
- **Secure Payments**: PCI-compliant payment processing with Stripe
- **Multi-Language Support**: Available in 15+ languages
- **Mobile Responsive**: Fully optimized for mobile devices
- **Price Alerts**: Get notified when prices drop for your desired trips
- **24/7 Support**: Live chat and dedicated customer support

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Node.js, Prisma ORM, PostgreSQL
- **Authentication**: NextAuth.js with JWT
- **Payments**: Stripe API
- **GDS Integration**: Amadeus API
- **Real-time**: Pusher, Socket.io
- **Cloud**: AWS S3, Vercel
- **Monitoring**: Sentry, PostHog

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- Redis (optional)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/ehudso7/truedest.git
cd truedest
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Configure your environment variables in `.env.local`

5. Set up the database:
```bash
npm run db:push
npm run db:seed
```

6. Start the development server:
```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## Environment Setup

See [SETUP_GUIDE.md](SETUP_GUIDE.md) for detailed instructions on configuring all services.

### Required Services

- **Supabase**: Database and authentication
- **Stripe**: Payment processing
- **Amadeus**: Flight and hotel data
- **SendGrid**: Email notifications

### Optional Services

- **Google Maps**: Location services
- **Pusher**: Real-time updates
- **Sentry**: Error tracking
- **PostHog**: Analytics

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run tests
- `npm run typecheck` - Type checking
- `npm run db:push` - Push database schema
- `npm run db:studio` - Open Prisma Studio

## Project Structure

```
truedest/
├── app/                # Next.js app directory
│   ├── api/           # API routes
│   ├── (auth)/        # Authentication pages
│   └── ...            # Other pages
├── components/        # React components
├── lib/              # Utility functions
│   ├── services/     # Service integrations
│   └── db.ts         # Database client
├── prisma/           # Database schema
├── public/           # Static assets
└── scripts/          # Setup scripts
```

## API Documentation

### Authentication

All API endpoints require authentication via JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

### Endpoints

- `GET /api/flights` - Search flights
- `GET /api/hotels` - Search hotels
- `POST /api/bookings` - Create booking
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update profile

See [API_DOCS.md](docs/API_DOCS.md) for complete documentation.

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Testing

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Deployment

### Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/ehudso7/truedest)

1. Click the deploy button above
2. Connect your GitHub account
3. Configure environment variables
4. Deploy

### Manual Deployment

```bash
# Build the application
npm run build

# Start production server
npm run start
```

## Security

- All data is encrypted in transit and at rest
- PCI DSS compliant payment processing
- Regular security audits and penetration testing
- GDPR and CCPA compliant

Report security vulnerabilities to security@truedest.com

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- Documentation: [https://docs.truedest.com](https://docs.truedest.com)
- Email: support@truedest.com
- Discord: [Join our community](https://discord.gg/truedest)
- Twitter: [@truedest](https://twitter.com/truedest)

## Acknowledgments

- Thanks to all contributors
- Built with amazing open source projects
- Special thanks to the Amadeus team for GDS access

---

Made with ❤️ by the TrueDest Team