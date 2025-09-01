#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 TrueDest Service Status Checker\n');
console.log('=====================================\n');

// Read .env.local
const envPath = path.join(process.cwd(), '.env.local');
let envVars = {};

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    if (line && !line.startsWith('#')) {
      const [key, value] = line.split('=');
      if (key && value) {
        envVars[key.trim()] = value.trim().replace(/"/g, '');
      }
    }
  });
}

// Service checks
const services = [
  {
    name: 'PostgreSQL',
    check: () => {
      try {
        execSync('pg_isready', { stdio: 'ignore' });
        return { status: '✅', message: 'Running locally' };
      } catch {
        return { status: '❌', message: 'Not running - Run: brew services start postgresql' };
      }
    }
  },
  {
    name: 'Redis',
    check: () => {
      try {
        const result = execSync('redis-cli ping', { encoding: 'utf8' }).trim();
        return result === 'PONG' 
          ? { status: '✅', message: 'Running locally' }
          : { status: '❌', message: 'Not running - Run: brew services start redis' };
      } catch {
        return { status: '❌', message: 'Not installed - Run: brew install redis' };
      }
    }
  },
  {
    name: 'Supabase',
    check: () => {
      const url = envVars.NEXT_PUBLIC_SUPABASE_URL;
      const key = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (url && url.includes('supabase.co') && key && key.length > 50) {
        return { status: '✅', message: 'Configured' };
      }
      return { status: '⚠️', message: 'Not configured - Visit: https://app.supabase.com' };
    }
  },
  {
    name: 'Stripe',
    check: () => {
      const pk = envVars.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
      const sk = envVars.STRIPE_SECRET_KEY;
      if (pk && pk.startsWith('pk_test_') && sk && sk.startsWith('sk_test_')) {
        return { status: '✅', message: 'Test keys configured' };
      }
      return { status: '⚠️', message: 'Not configured - Visit: https://dashboard.stripe.com' };
    }
  },
  {
    name: 'Amadeus',
    check: () => {
      const id = envVars.AMADEUS_CLIENT_ID;
      const secret = envVars.AMADEUS_CLIENT_SECRET;
      if (id && id !== 'your-amadeus-client-id' && secret && secret !== 'your-amadeus-client-secret') {
        return { status: '✅', message: 'Configured' };
      }
      return { status: '⚠️', message: 'Not configured - Visit: https://developers.amadeus.com' };
    }
  },
  {
    name: 'SendGrid',
    check: () => {
      const key = envVars.SENDGRID_API_KEY;
      if (key && key.startsWith('SG.')) {
        return { status: '✅', message: 'Configured' };
      }
      return { status: '⚠️', message: 'Not configured - Visit: https://signup.sendgrid.com' };
    }
  },
  {
    name: 'Pusher',
    check: () => {
      const key = envVars.NEXT_PUBLIC_PUSHER_APP_KEY;
      const id = envVars.PUSHER_APP_ID;
      if (key && key.length > 10 && id && id.length > 5) {
        return { status: '✅', message: 'Configured' };
      }
      return { status: '⚠️', message: 'Not configured - Visit: https://dashboard.pusher.com' };
    }
  },
  {
    name: 'Google Maps',
    check: () => {
      const key = envVars.GOOGLE_MAPS_API_KEY;
      if (key && key.startsWith('AIza')) {
        return { status: '✅', message: 'Configured' };
      }
      return { status: '⚠️', message: 'Optional - Visit: https://console.cloud.google.com' };
    }
  },
  {
    name: 'NextAuth',
    check: () => {
      const secret = envVars.NEXTAUTH_SECRET;
      if (secret && secret.length >= 32) {
        return { status: '✅', message: 'Secret configured' };
      }
      return { status: '❌', message: 'Secret missing - Run: openssl rand -hex 32' };
    }
  }
];

// Run checks
console.log('📊 Service Status:\n');
services.forEach(service => {
  const result = service.check();
  console.log(`${result.status} ${service.name.padEnd(15)} ${result.message}`);
});

// Summary
const configured = services.filter(s => s.check().status === '✅').length;
const total = services.length;

console.log('\n=====================================');
console.log(`\n📈 Configuration Status: ${configured}/${total} services ready\n`);

if (configured < total) {
  console.log('📝 Next Steps:\n');
  console.log('1. Check SETUP_GUIDE.md for detailed instructions');
  console.log('2. Priority services to configure:');
  console.log('   - Supabase (Database + Auth)');
  console.log('   - Stripe (Payments)');
  console.log('   - Amadeus (Flight/Hotel Data)\n');
}

// Check if we can start the app
if (configured >= 3) { // At least NextAuth + 2 services
  console.log('✅ Ready to start development!\n');
  console.log('Run: npm run dev\n');
} else {
  console.log('⚠️  Configure at least 3 services before starting.\n');
}

// Generate quick links
console.log('🔗 Quick Links:\n');
const quickLinks = {
  'Supabase': 'https://app.supabase.com',
  'Stripe Dashboard': 'https://dashboard.stripe.com',
  'Amadeus Portal': 'https://developers.amadeus.com',
  'SendGrid': 'https://app.sendgrid.com',
  'Pusher Dashboard': 'https://dashboard.pusher.com',
  'Google Cloud': 'https://console.cloud.google.com'
};

Object.entries(quickLinks).forEach(([name, url]) => {
  console.log(`   ${name}: ${url}`);
});

console.log('\n=====================================\n');