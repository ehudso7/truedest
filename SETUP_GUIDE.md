# 🚀 TrueDest Complete Setup Guide

## ✅ Already Configured
These values are already set in your `.env.local` file:
- ✅ **NextAuth Secret**: Generated secure key
- ✅ **Database URLs**: Configured for local PostgreSQL
- ✅ **Redis URL**: Configured for local Redis
- ✅ **Feature Flags**: Set to appropriate defaults

## 📋 Required Services Setup (Step-by-Step)

### 1️⃣ **Supabase** (Database + Auth) - FREE ⭐ PRIORITY
**Time: 5 minutes | Free Tier: Unlimited API requests, 500MB database**

1. Visit https://app.supabase.com
2. Click "Start your project"
3. Sign up with GitHub or Email
4. Create new project:
   - **Project name**: `truedest`
   - **Database Password**: Generate a strong one (save it!)
   - **Region**: Choose closest to you
5. Wait ~2 minutes for project setup
6. Go to **Settings** → **API**
7. Copy these values to `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL="https://YOUR_PROJECT_ID.supabase.co"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
   SUPABASE_SERVICE_KEY="your-service-role-key"
   ```

### 2️⃣ **Stripe** (Payments) - TEST MODE FREE ⭐ PRIORITY
**Time: 5 minutes | Test Mode: Unlimited test transactions**

1. Visit https://dashboard.stripe.com/register
2. Sign up (no credit card needed for test mode)
3. Skip onboarding questions
4. In Dashboard, toggle to **Test mode** (top right)
5. Go to **Developers** → **API keys**
6. Copy to `.env.local`:
   ```
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
   STRIPE_SECRET_KEY="sk_test_..."
   ```
7. For webhook secret:
   - Go to **Developers** → **Webhooks**
   - Click "Add endpoint"
   - Endpoint URL: `http://localhost:3000/api/webhooks/stripe`
   - Select events: `payment_intent.succeeded`, `checkout.session.completed`
   - Copy signing secret to:
   ```
   STRIPE_WEBHOOK_SECRET="whsec_..."
   ```

### 3️⃣ **Amadeus** (Flight/Hotel Data) - FREE SANDBOX ⭐ PRIORITY
**Time: 10 minutes | Free Tier: 2000 API calls/month**

1. Visit https://developers.amadeus.com
2. Click "Register"
3. Fill form (use any company name)
4. Verify email
5. Log in → Go to "My Self-Service Workspace"
6. Click "Create new app"
   - **App name**: `TrueDest Dev`
   - **Use case**: Select "Other"
7. Copy credentials to `.env.local`:
   ```
   AMADEUS_CLIENT_ID="your-client-id"
   AMADEUS_CLIENT_SECRET="your-client-secret"
   AMADEUS_HOSTNAME="test.api.amadeus.com"
   ```

### 4️⃣ **SendGrid** (Email) - FREE
**Time: 10 minutes | Free Tier: 100 emails/day**

1. Visit https://signup.sendgrid.com
2. Fill signup form
3. Verify email
4. Complete profile setup
5. Go to **Settings** → **API Keys**
6. Click "Create API Key"
   - **Name**: `TrueDest`
   - **Permissions**: Full Access
7. Copy to `.env.local`:
   ```
   SENDGRID_API_KEY="SG...."
   ```
8. Set up sender:
   - Go to **Settings** → **Sender Authentication**
   - Choose "Single Sender Verification" (for dev)
   - Add your email
   - Verify it

### 5️⃣ **Pusher** (Real-time) - FREE
**Time: 5 minutes | Free Tier: 200k messages/day**

1. Visit https://dashboard.pusher.com/accounts/sign_up
2. Sign up with GitHub or Email
3. Create new app:
   - **App name**: `truedest`
   - **Cluster**: `us2` (or closest)
   - **Tech stack**: Node.js
4. Go to "App Keys" tab
5. Copy to `.env.local`:
   ```
   NEXT_PUBLIC_PUSHER_APP_KEY="your-app-key"
   PUSHER_APP_ID="your-app-id"
   PUSHER_SECRET="your-secret"
   NEXT_PUBLIC_PUSHER_CLUSTER="us2"
   ```

### 6️⃣ **Google Maps** (Optional) - FREE CREDITS
**Time: 15 minutes | Free Tier: $200/month credit**

1. Visit https://console.cloud.google.com
2. Create new project: `TrueDest`
3. Enable billing (required but won't charge under $200/mo)
4. Go to **APIs & Services** → **Library**
5. Enable these APIs:
   - Maps JavaScript API
   - Places API
   - Geocoding API
6. Go to **APIs & Services** → **Credentials**
7. Click "Create Credentials" → "API Key"
8. Restrict key:
   - **Application restrictions**: HTTP referrers
   - Add: `http://localhost:3000/*` and `https://yourdomain.com/*`
   - **API restrictions**: Select enabled APIs only
9. Copy to `.env.local`:
   ```
   GOOGLE_MAPS_API_KEY="AIza..."
   ```

### 7️⃣ **Sentry** (Error Tracking) - FREE
**Time: 5 minutes | Free Tier: 5k errors/month**

1. Visit https://sentry.io/signup
2. Sign up with GitHub or Email
3. Create organization: `truedest`
4. Create project:
   - **Platform**: Next.js
   - **Name**: `truedest-web`
5. Copy DSN from setup page to `.env.local`:
   ```
   NEXT_PUBLIC_SENTRY_DSN="https://...@sentry.io/..."
   ```
6. For auth token:
   - Go to **Settings** → **Auth Tokens**
   - Create token with `project:releases` scope
   - Copy to:
   ```
   SENTRY_AUTH_TOKEN="..."
   ```

## 🔧 Local Services Setup

### PostgreSQL (Local Database)
```bash
# macOS
brew install postgresql@15
brew services start postgresql@15
createdb truedest_dev

# Ubuntu/Debian
sudo apt install postgresql
sudo systemctl start postgresql
sudo -u postgres createdb truedest_dev

# Windows (use WSL2 or Docker)
```

### Redis (Local Cache)
```bash
# macOS
brew install redis
brew services start redis

# Ubuntu/Debian
sudo apt install redis-server
sudo systemctl start redis

# Windows (use WSL2 or Docker)
```

### Alternative: Use Docker
```bash
# Start both PostgreSQL and Redis
docker-compose up -d
```

Create `docker-compose.yml`:
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: truedest_dev
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  postgres_data:
```

## 🎯 Quick Setup Commands

```bash
# 1. Copy environment template
cp .env.development .env.local

# 2. Install dependencies
npm install

# 3. Generate Prisma client
npx prisma generate

# 4. Push database schema
npx prisma db push

# 5. Start development server
npm run dev
```

## 📊 Service Priority Order

### Must Have (Core Functionality)
1. ✅ **Supabase** - Database & Auth
2. ✅ **Stripe** - Payments (test mode)
3. ✅ **Amadeus** - Real flight/hotel data

### Should Have (Enhanced Features)
4. ⭐ **SendGrid** - Email notifications
5. ⭐ **Pusher** - Real-time updates
6. ⭐ **Google Maps** - Location services

### Nice to Have (Production Ready)
7. 📊 **Sentry** - Error tracking
8. 📊 **Mixpanel/PostHog** - Analytics
9. 📊 **Twilio** - SMS notifications

## 🧪 Test Credentials

### Test Credit Cards (Stripe)
```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
3D Secure: 4000 0025 0000 3155
```

### Test Users
```
Email: demo@truedest.com
Password: demo123
```

## 🚨 Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL is running
pg_isready

# Check Redis is running
redis-cli ping

# Reset database
npx prisma db push --force-reset
```

### Port Already in Use
```bash
# Kill process on port 3000
npx kill-port 3000

# Or find and kill manually
lsof -i :3000
kill -9 <PID>
```

### Environment Variables Not Loading
```bash
# Ensure .env.local exists
ls -la .env*

# Restart dev server
npm run dev
```

## 📚 Documentation Links

- **Supabase Docs**: https://supabase.com/docs
- **Stripe Docs**: https://stripe.com/docs
- **Amadeus Docs**: https://developers.amadeus.com/self-service
- **SendGrid Docs**: https://docs.sendgrid.com
- **Pusher Docs**: https://pusher.com/docs
- **Prisma Docs**: https://www.prisma.io/docs

## 💡 Pro Tips

1. **Start with Supabase** - Gets you database + auth instantly
2. **Use Stripe Test Mode** - Full functionality without real charges
3. **Amadeus Sandbox** - Real flight data for testing
4. **Skip OAuth initially** - Use email/password auth first
5. **Use SQLite locally** - No setup required for quick testing

## 🎉 Success Checklist

- [ ] `.env.local` file created
- [ ] Supabase project created
- [ ] Stripe test keys obtained
- [ ] Amadeus sandbox access
- [ ] Database running (local or Supabase)
- [ ] `npm run dev` works
- [ ] Can access http://localhost:3000

---

**Need Help?** Check the `/scripts` folder for automated setup tools or open an issue on GitHub.