#!/bin/bash

# TrueDest Service Setup Script
# This script helps set up free/local services for development

set -e

echo "🚀 TrueDest Service Setup"
echo "=========================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to generate random string
generate_secret() {
    openssl rand -hex 32
}

# Check for required tools
echo "📋 Checking prerequisites..."

if ! command_exists docker; then
    echo -e "${YELLOW}Docker is not installed. Would you like to install it? (y/n)${NC}"
    read -r response
    if [[ "$response" == "y" ]]; then
        echo "Please visit https://www.docker.com/products/docker-desktop to install Docker"
        exit 1
    fi
fi

if ! command_exists npm; then
    echo -e "${RED}npm is not installed. Please install Node.js first.${NC}"
    exit 1
fi

# Create .env.local if it doesn't exist
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local file..."
    cp .env.development .env.local
    echo -e "${GREEN}✓ Created .env.local${NC}"
fi

# 1. Set up PostgreSQL with Docker
echo ""
echo "🐘 Setting up PostgreSQL..."
if docker ps -a | grep -q truedest-postgres; then
    echo "PostgreSQL container already exists"
    docker start truedest-postgres 2>/dev/null || true
else
    docker run --name truedest-postgres \
        -e POSTGRES_PASSWORD=postgres \
        -e POSTGRES_DB=truedest_dev \
        -p 5432:5432 \
        -d postgres:15-alpine
    echo -e "${GREEN}✓ PostgreSQL started on port 5432${NC}"
    echo "  Database: truedest_dev"
    echo "  Username: postgres"
    echo "  Password: postgres"
fi

# 2. Set up Redis with Docker
echo ""
echo "🔴 Setting up Redis..."
if docker ps -a | grep -q truedest-redis; then
    echo "Redis container already exists"
    docker start truedest-redis 2>/dev/null || true
else
    docker run --name truedest-redis \
        -p 6379:6379 \
        -d redis:7-alpine
    echo -e "${GREEN}✓ Redis started on port 6379${NC}"
fi

# 3. Initialize Prisma
echo ""
echo "🔷 Setting up Prisma..."
if [ -f prisma/schema.prisma ]; then
    npx prisma generate
    echo -e "${GREEN}✓ Prisma client generated${NC}"
    
    echo "Running database migrations..."
    npx prisma db push --skip-generate
    echo -e "${GREEN}✓ Database schema synchronized${NC}"
fi

# 4. Set up Supabase (optional)
echo ""
echo "🚀 Supabase Setup"
echo -e "${YELLOW}To use Supabase (recommended for production):${NC}"
echo "1. Visit https://app.supabase.com and create a free project"
echo "2. Copy your project URL and anon key"
echo "3. Update .env.local with your Supabase credentials"
echo ""

# 5. Generate secure NextAuth secret
echo "🔐 Generating NextAuth secret..."
NEXTAUTH_SECRET=$(generate_secret)
sed -i.bak "s/NEXTAUTH_SECRET=.*/NEXTAUTH_SECRET=\"$NEXTAUTH_SECRET\"/" .env.local
echo -e "${GREEN}✓ NextAuth secret generated${NC}"

# 6. Create setup instructions file
cat > SETUP_INSTRUCTIONS.md << 'EOF'
# TrueDest Service Setup Instructions

## ✅ Automatically Configured Services

1. **PostgreSQL** - Running on localhost:5432
2. **Redis** - Running on localhost:6379
3. **NextAuth Secret** - Generated automatically

## 📋 Manual Setup Required (All have FREE tiers)

### Priority 1 - Core Services (FREE)

#### 1. Supabase (Database & Auth)
- Visit: https://app.supabase.com
- Create a free project
- Copy your project URL and anon key to .env.local

#### 2. Stripe (Payments - Test Mode)
- Visit: https://dashboard.stripe.com/register
- Get your test API keys from the dashboard
- No credit card required for test mode

#### 3. Amadeus (Flight/Hotel Data)
- Visit: https://developers.amadeus.com
- Register for free sandbox access
- Get your API credentials

### Priority 2 - Enhanced Features (FREE tiers)

#### 4. Pusher (Real-time)
- Visit: https://dashboard.pusher.com/accounts/sign_up
- Create a free app (200k messages/day)
- Copy credentials to .env.local

#### 5. SendGrid (Email)
- Visit: https://signup.sendgrid.com
- Free tier: 100 emails/day
- Get your API key

#### 6. Sentry (Error Tracking)
- Visit: https://sentry.io/signup
- Free tier: 5k errors/month
- Create a project and get DSN

### Priority 3 - Optional Services

#### 7. Google Services
- Maps API: https://console.cloud.google.com
- OAuth: Configure in Google Cloud Console
- Free tier with limits

#### 8. Analytics
- Mixpanel: https://mixpanel.com (free tier)
- PostHog: https://posthog.com (free tier)

## 🚀 Quick Start Commands

```bash
# Start all services
docker start truedest-postgres truedest-redis

# Run database migrations
npx prisma db push

# Start development server
npm run dev
```

## 🔗 Useful Links

- Supabase Dashboard: https://app.supabase.com
- Stripe Dashboard: https://dashboard.stripe.com
- Amadeus Portal: https://developers.amadeus.com
- Pusher Dashboard: https://dashboard.pusher.com

EOF

echo -e "${GREEN}✓ Created SETUP_INSTRUCTIONS.md${NC}"

# 7. Show summary
echo ""
echo "=================================="
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo "=================================="
echo ""
echo "🏃 Quick Start:"
echo "  1. Review SETUP_INSTRUCTIONS.md for service setup"
echo "  2. Add your API keys to .env.local"
echo "  3. Run: npm run dev"
echo ""
echo "📦 Running Services:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep truedest || true
echo ""
echo -e "${YELLOW}💡 Tip: Start with Supabase for instant database + auth${NC}"