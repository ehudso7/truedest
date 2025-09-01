#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

console.log('🚀 Supabase Setup for TrueDest\n');

async function setupSupabase() {
  try {
    // Check if Supabase CLI is installed
    try {
      execSync('supabase --version', { stdio: 'ignore' });
      console.log('✓ Supabase CLI detected');
    } catch {
      console.log('📦 Installing Supabase CLI...');
      execSync('npm install -g supabase', { stdio: 'inherit' });
    }

    console.log('\n📋 Supabase Setup Options:\n');
    console.log('1. Create NEW Supabase project (recommended)');
    console.log('2. Use EXISTING Supabase project');
    console.log('3. Skip Supabase setup\n');

    const choice = await question('Enter your choice (1-3): ');

    if (choice === '1') {
      console.log('\n🆕 Creating new Supabase project...\n');
      console.log('Please follow these steps:');
      console.log('1. Visit: https://app.supabase.com');
      console.log('2. Click "New Project"');
      console.log('3. Enter project details:');
      console.log('   - Name: truedest');
      console.log('   - Database Password: (generate a strong one)');
      console.log('   - Region: (choose closest to you)');
      console.log('4. Wait for project to be created (~2 minutes)');
      console.log('5. Go to Settings > API\n');

      await question('Press ENTER when ready to continue...');

      const projectUrl = await question('\nEnter your Project URL: ');
      const anonKey = await question('Enter your Anon/Public Key: ');
      const serviceKey = await question('Enter your Service Role Key: ');

      // Update .env.local
      updateEnvFile({
        NEXT_PUBLIC_SUPABASE_URL: projectUrl,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: anonKey,
        SUPABASE_SERVICE_KEY: serviceKey
      });

      console.log('\n✅ Supabase configuration saved!');

      // Initialize local Supabase
      console.log('\n🔧 Initializing local Supabase project...');
      execSync('supabase init', { stdio: 'inherit' });

      // Link to remote project
      console.log('\n🔗 Linking to remote project...');
      const projectRef = projectUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
      if (projectRef) {
        execSync(`supabase link --project-ref ${projectRef}`, { stdio: 'inherit' });
        console.log('✅ Project linked successfully!');
      }

    } else if (choice === '2') {
      console.log('\n📝 Enter your existing Supabase credentials:\n');
      
      const projectUrl = await question('Project URL: ');
      const anonKey = await question('Anon/Public Key: ');
      const serviceKey = await question('Service Role Key: ');

      updateEnvFile({
        NEXT_PUBLIC_SUPABASE_URL: projectUrl,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: anonKey,
        SUPABASE_SERVICE_KEY: serviceKey
      });

      console.log('\n✅ Supabase configuration saved!');
    }

    // Create Supabase tables
    if (choice === '1' || choice === '2') {
      console.log('\n📊 Would you like to create TrueDest database tables? (y/n)');
      const createTables = await question('> ');
      
      if (createTables.toLowerCase() === 'y') {
        console.log('\n🏗️ Creating database schema...');
        
        // Create migration file
        const migrationSQL = `
-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  loyalty_points INTEGER DEFAULT 0,
  loyalty_tier TEXT DEFAULT 'BRONZE',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Bookings table
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  booking_reference TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('flight', 'hotel', 'package')),
  status TEXT DEFAULT 'pending',
  total_amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  travel_date DATE NOT NULL,
  return_date DATE,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Flights table
CREATE TABLE IF NOT EXISTS public.flights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  airline TEXT NOT NULL,
  flight_number TEXT NOT NULL,
  from_airport TEXT NOT NULL,
  to_airport TEXT NOT NULL,
  departure_time TIMESTAMPTZ NOT NULL,
  arrival_time TIMESTAMPTZ NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  available_seats INTEGER DEFAULT 100,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Hotels table
CREATE TABLE IF NOT EXISTS public.hotels (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  country TEXT NOT NULL,
  rating DECIMAL(2,1),
  price_per_night DECIMAL(10,2) NOT NULL,
  available_rooms INTEGER DEFAULT 50,
  amenities TEXT[],
  images TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own bookings" ON public.bookings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own bookings" ON public.bookings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can view flights" ON public.flights
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view hotels" ON public.hotels
  FOR SELECT USING (true);

CREATE POLICY "Users can create reviews" ON public.reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can view reviews" ON public.reviews
  FOR SELECT USING (true);

-- Functions
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
`;

        // Save migration file
        const migrationDir = path.join(process.cwd(), 'supabase', 'migrations');
        if (!fs.existsSync(migrationDir)) {
          fs.mkdirSync(migrationDir, { recursive: true });
        }
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '').slice(0, -5);
        const migrationFile = path.join(migrationDir, `${timestamp}_initial_schema.sql`);
        fs.writeFileSync(migrationFile, migrationSQL);
        
        console.log('✅ Migration file created');
        console.log('\n📤 Pushing schema to Supabase...');
        
        try {
          execSync('supabase db push', { stdio: 'inherit' });
          console.log('✅ Database schema created successfully!');
        } catch (error) {
          console.log('⚠️ Could not push schema automatically. Please run: supabase db push');
        }
      }
    }

    console.log('\n🎉 Supabase setup complete!');
    console.log('\n📚 Next steps:');
    console.log('1. Install Supabase client: npm install @supabase/supabase-js');
    console.log('2. Run the app: npm run dev');
    console.log('3. Visit Supabase dashboard: https://app.supabase.com\n');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  } finally {
    rl.close();
  }
}

function updateEnvFile(vars) {
  const envPath = path.join(process.cwd(), '.env.local');
  let envContent = '';

  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }

  Object.entries(vars).forEach(([key, value]) => {
    const regex = new RegExp(`^${key}=.*$`, 'gm');
    if (envContent.match(regex)) {
      envContent = envContent.replace(regex, `${key}="${value}"`);
    } else {
      envContent += `\n${key}="${value}"`;
    }
  });

  fs.writeFileSync(envPath, envContent.trim() + '\n');
}

// Run setup
setupSupabase();