# TrueDest - AI-Powered Travel Booking Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![CI/CD](https://github.com/ehudso7/truedest/actions/workflows/ci.yml/badge.svg)](https://github.com/ehudso7/truedest/actions)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)

## Overview

TrueDest is a production-ready, AI-powered travel booking platform that delivers personalized travel recommendations and seamless booking experiences. Built with modern web technologies and integrated with leading GDS systems, TrueDest offers comprehensive travel solutions for flights, hotels, car rentals, and vacation packages.

## Key Features

### Core Functionality
- **AI-Powered Recommendations**: OpenAI-powered personalized travel suggestions
- **Real-Time Search**: Live availability and pricing from Amadeus GDS
- **Secure Payments**: PCI-compliant payment processing with Stripe
- **Price Alerts**: Automated notifications when prices drop
- **Loyalty Program**: Points-based rewards with tiered benefits

### Technical Highlights
- **Type-Safe**: Full TypeScript with strict mode
- **Validated**: Zod schemas for API request/response validation
- **Rate Limited**: Protection against abuse with configurable limits
- **GDPR/CCPA Compliant**: Built-in privacy controls and data export
- **Real-Time**: Pusher integration for live updates
- **Observable**: Sentry error tracking and PostHog analytics

## Tech Stack

| Category | Technology |
|----------|------------|
| **Frontend** | Next.js 14, React 18, TypeScript, Tailwind CSS |
| **Backend** | Node.js, Next.js API Routes |
| **Database** | PostgreSQL, Prisma ORM |
| **Authentication** | NextAuth.js v5 (JWT strategy) |
| **Payments** | Stripe API with webhooks |
| **GDS** | Amadeus API |
| **Real-time** | Pusher |
| **Email** | SendGrid |
| **Monitoring** | Sentry, PostHog |
| **Cloud** | Vercel, AWS S3 |

## Getting Started

### Prerequisites

- Node.js 20+ (LTS recommended)
- pnpm 8+ (recommended) or npm
- PostgreSQL 15+
- Redis (optional, for caching)

### Quick Start

```bash
# Clone the repository
git clone https://github.com/ehudso7/truedest.git
cd truedest

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Generate Prisma client
pnpm db:generate

# Push database schema (development)
pnpm db:push

# Seed demo data (optional)
pnpm db:seed

# Start development server
pnpm dev
```

Visit `http://localhost:3000` to see the application.

### Environment Variables

See [.env.example](.env.example) for all required and optional environment variables.

#### Required
```env
DATABASE_URL=postgresql://...
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
STRIPE_SECRET_KEY=sk_...
STRIPE_PUBLISHABLE_KEY=pk_...
AMADEUS_CLIENT_ID=...
AMADEUS_CLIENT_SECRET=...
```

#### Optional
```env
OPENAI_API_KEY=sk-...
SENDGRID_API_KEY=SG...
SENTRY_DSN=https://...
POSTHOG_KEY=phc_...
PUSHER_APP_ID=...
```

## Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
| `pnpm lint:fix` | Fix ESLint issues |
| `pnpm format` | Format with Prettier |
| `pnpm test` | Run unit tests |
| `pnpm test:coverage` | Run tests with coverage |
| `pnpm test:e2e` | Run E2E tests |
| `pnpm typecheck` | TypeScript type checking |
| `pnpm db:generate` | Generate Prisma client |
| `pnpm db:push` | Push schema to database |
| `pnpm db:migrate` | Run database migrations |
| `pnpm db:studio` | Open Prisma Studio |
| `pnpm db:seed` | Seed demo data |

## Project Structure

```
truedest/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── bookings/      # Booking management
│   │   ├── flights/       # Flight search
│   │   ├── hotels/        # Hotel search
│   │   ├── price-alerts/  # Price alert CRUD
│   │   ├── recommendations/ # AI recommendations
│   │   ├── user/          # User profile & privacy
│   │   └── webhooks/      # Stripe webhooks
│   ├── (auth)/            # Auth pages (login, register)
│   ├── dashboard/         # User dashboard
│   └── ...                # Other pages
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   └── ...               # Feature components
├── lib/                   # Core libraries
│   ├── auth/             # NextAuth configuration
│   ├── config.ts         # Environment validation
│   ├── middleware/       # Rate limiting, etc.
│   ├── prisma.ts         # Database client
│   ├── services/         # External service clients
│   │   ├── amadeus.ts    # Amadeus GDS
│   │   ├── stripe.ts     # Stripe payments
│   │   ├── email.ts      # SendGrid emails
│   │   └── ai.ts         # OpenAI integration
│   └── validations/      # Zod schemas
├── prisma/               # Database
│   ├── schema.prisma     # Data model
│   └── seed.ts           # Seed script
├── __tests__/            # Test files
│   ├── unit/             # Unit tests
│   ├── integration/      # API tests
│   └── components/       # Component tests
├── .github/workflows/    # CI/CD pipelines
└── docs/                 # Documentation
```

## API Documentation

### Authentication

All authenticated endpoints require a valid session cookie or JWT token:

```http
Cookie: next-auth.session-token=...
```

### Core Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create new account |
| GET | `/api/flights/search` | Search flights |
| GET | `/api/hotels/search` | Search hotels |
| POST | `/api/bookings/create` | Create booking |
| GET | `/api/price-alerts` | List price alerts |
| POST | `/api/price-alerts` | Create price alert |
| GET | `/api/recommendations` | Get AI recommendations |
| GET | `/api/user/privacy` | Export user data (GDPR) |
| DELETE | `/api/user/privacy` | Delete account (GDPR) |

See [docs/API_DOCS.md](docs/API_DOCS.md) for complete API documentation.

## Testing

```bash
# Run all unit tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run with coverage report
pnpm test:coverage

# Run E2E tests (requires built app)
pnpm build && pnpm test:e2e
```

### Test Coverage Requirements

| Metric | Threshold |
|--------|-----------|
| Branches | 50% |
| Functions | 50% |
| Lines | 50% |
| Statements | 50% |

## CI/CD Pipeline

The GitHub Actions workflow runs on every push and PR:

1. **Lint** - ESLint and Prettier checks
2. **Type Check** - TypeScript compilation
3. **Test** - Jest unit and integration tests
4. **Build** - Next.js production build
5. **Security** - Dependency audit
6. **Database** - Schema validation
7. **E2E** - Playwright tests (main branch only)
8. **Deploy** - Vercel deployment

PRs are blocked if lint, typecheck, test, or build fail.

## Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy

### Docker

```bash
# Build image
docker build -t truedest .

# Run container
docker run -p 3000:3000 --env-file .env.local truedest
```

### Manual

```bash
# Build
pnpm build

# Start
pnpm start
```

## Security

- All traffic encrypted with TLS 1.3
- Passwords hashed with bcrypt (12 rounds)
- PCI DSS compliant payment processing (via Stripe)
- Rate limiting on all endpoints
- Input validation with Zod
- CSRF protection via NextAuth
- Security headers configured

### Reporting Vulnerabilities

Report security issues to: security@truedest.com

## Privacy & Compliance

- GDPR compliant (EU)
- CCPA compliant (California)
- Data export functionality
- Account deletion with anonymization
- Cookie consent management

See [docs/PRIVACY_FEATURES.md](docs/PRIVACY_FEATURES.md) for details.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`pnpm test && pnpm lint && pnpm typecheck`)
5. Commit (`git commit -m 'Add amazing feature'`)
6. Push (`git push origin feature/amazing-feature`)
7. Open a Pull Request

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

## License

This project is licensed under the MIT License - see [LICENSE](LICENSE) for details.

## Support

- Documentation: [docs.truedest.com](https://docs.truedest.com)
- Email: support@truedest.com
- Issues: [GitHub Issues](https://github.com/ehudso7/truedest/issues)

---

Built with modern web technologies by the TrueDest Team
