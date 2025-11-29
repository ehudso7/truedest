/**
 * Centralized Configuration with Zod Validation
 *
 * This module provides type-safe configuration for the entire application.
 * It validates environment variables at startup and provides clear error messages.
 */

import { z } from 'zod'

// Server-only configuration schema
const serverConfigSchema = z.object({
  // Database
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL'),
  DIRECT_URL: z.string().url().optional(),

  // Authentication
  NEXTAUTH_URL: z.string().url('NEXTAUTH_URL must be a valid URL'),
  NEXTAUTH_SECRET: z.string().min(32, 'NEXTAUTH_SECRET must be at least 32 characters'),

  // OAuth Providers
  GOOGLE_CLIENT_ID: z.string().min(1).optional(),
  GOOGLE_CLIENT_SECRET: z.string().min(1).optional(),
  FACEBOOK_CLIENT_ID: z.string().min(1).optional(),
  FACEBOOK_CLIENT_SECRET: z.string().min(1).optional(),
  APPLE_ID: z.string().min(1).optional(),
  APPLE_CLIENT_SECRET: z.string().min(1).optional(),

  // Stripe
  STRIPE_SECRET_KEY: z.string().startsWith('sk_', 'STRIPE_SECRET_KEY must start with sk_'),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith('whsec_', 'STRIPE_WEBHOOK_SECRET must start with whsec_').optional(),

  // Amadeus GDS
  AMADEUS_CLIENT_ID: z.string().min(1, 'AMADEUS_CLIENT_ID is required'),
  AMADEUS_CLIENT_SECRET: z.string().min(1, 'AMADEUS_CLIENT_SECRET is required'),
  AMADEUS_HOSTNAME: z.enum(['test.api.amadeus.com', 'api.amadeus.com']).default('test.api.amadeus.com'),

  // SendGrid
  SENDGRID_API_KEY: z.string().startsWith('SG.').optional(),
  SENDGRID_FROM_EMAIL: z.string().email().optional(),

  // Pusher
  PUSHER_APP_ID: z.string().min(1).optional(),
  PUSHER_SECRET: z.string().min(1).optional(),

  // Redis
  REDIS_URL: z.string().url().optional(),

  // OpenAI
  OPENAI_API_KEY: z.string().startsWith('sk-').optional(),

  // AWS
  AWS_REGION: z.string().min(1).optional(),
  AWS_ACCESS_KEY_ID: z.string().min(1).optional(),
  AWS_SECRET_ACCESS_KEY: z.string().min(1).optional(),
  AWS_S3_BUCKET: z.string().min(1).optional(),

  // Sentry
  SENTRY_AUTH_TOKEN: z.string().min(1).optional(),

  // Twilio
  TWILIO_ACCOUNT_SID: z.string().startsWith('AC').optional(),
  TWILIO_AUTH_TOKEN: z.string().min(1).optional(),
  TWILIO_PHONE_NUMBER: z.string().min(1).optional(),

  // Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
})

// Client-safe configuration schema (exposed via NEXT_PUBLIC_)
const clientConfigSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().startsWith('pk_').optional(),
  NEXT_PUBLIC_PUSHER_APP_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_PUSHER_CLUSTER: z.string().min(1).optional(),
  NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
  NEXT_PUBLIC_POSTHOG_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_POSTHOG_HOST: z.string().url().optional(),
  NEXT_PUBLIC_MIXPANEL_TOKEN: z.string().min(1).optional(),
  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
})

// Feature flags schema
const featureFlagsSchema = z.object({
  ENABLE_PWA: z.string().transform(v => v === 'true').default('false'),
  ENABLE_ANALYTICS: z.string().transform(v => v === 'true').default('true'),
  ENABLE_ERROR_TRACKING: z.string().transform(v => v === 'true').default('true'),
  ENABLE_CHAT_SUPPORT: z.string().transform(v => v === 'true').default('false'),
  ENABLE_AI_RECOMMENDATIONS: z.string().transform(v => v === 'true').default('true'),
  ENABLE_PRICE_ALERTS: z.string().transform(v => v === 'true').default('true'),
})

// Type exports
export type ServerConfig = z.infer<typeof serverConfigSchema>
export type ClientConfig = z.infer<typeof clientConfigSchema>
export type FeatureFlags = z.infer<typeof featureFlagsSchema>

// Configuration cache
let cachedServerConfig: ServerConfig | null = null
let cachedClientConfig: ClientConfig | null = null
let cachedFeatureFlags: FeatureFlags | null = null

/**
 * Get server-side configuration (only available on server)
 * Validates and caches configuration on first access
 */
export function getServerConfig(): ServerConfig {
  if (typeof window !== 'undefined') {
    throw new Error('getServerConfig cannot be called on the client side')
  }

  if (cachedServerConfig) {
    return cachedServerConfig
  }

  const result = serverConfigSchema.safeParse(process.env)

  if (!result.success) {
    const errors = result.error.errors.map(e => `  - ${e.path.join('.')}: ${e.message}`).join('\n')
    console.error('\n❌ Server Configuration Error:\n' + errors + '\n')

    // In development, provide helpful guidance
    if (process.env.NODE_ENV === 'development') {
      console.error('💡 Tip: Copy .env.example to .env.local and fill in the required values\n')
    }

    throw new Error(`Invalid server configuration:\n${errors}`)
  }

  cachedServerConfig = result.data
  return cachedServerConfig
}

/**
 * Get client-side configuration (safe to use in browser)
 */
export function getClientConfig(): ClientConfig {
  if (cachedClientConfig) {
    return cachedClientConfig
  }

  // Only include NEXT_PUBLIC_ prefixed variables
  const clientEnv = Object.fromEntries(
    Object.entries(process.env).filter(([key]) => key.startsWith('NEXT_PUBLIC_'))
  )

  const result = clientConfigSchema.safeParse(clientEnv)

  if (!result.success) {
    console.warn('Client configuration warning:', result.error.message)
    return {} as ClientConfig
  }

  cachedClientConfig = result.data
  return cachedClientConfig
}

/**
 * Get feature flags
 */
export function getFeatureFlags(): FeatureFlags {
  if (cachedFeatureFlags) {
    return cachedFeatureFlags
  }

  const result = featureFlagsSchema.safeParse(process.env)
  cachedFeatureFlags = result.success ? result.data : ({
    ENABLE_PWA: false,
    ENABLE_ANALYTICS: true,
    ENABLE_ERROR_TRACKING: true,
    ENABLE_CHAT_SUPPORT: false,
    ENABLE_AI_RECOMMENDATIONS: true,
    ENABLE_PRICE_ALERTS: true,
  } as FeatureFlags)

  return cachedFeatureFlags
}

/**
 * Check if a specific service is configured
 */
export function isServiceConfigured(service: 'stripe' | 'amadeus' | 'sendgrid' | 'pusher' | 'redis' | 'openai' | 'sentry' | 'aws'): boolean {
  try {
    const config = getServerConfig()
    switch (service) {
      case 'stripe':
        return !!config.STRIPE_SECRET_KEY
      case 'amadeus':
        return !!config.AMADEUS_CLIENT_ID && !!config.AMADEUS_CLIENT_SECRET
      case 'sendgrid':
        return !!config.SENDGRID_API_KEY && !!config.SENDGRID_FROM_EMAIL
      case 'pusher':
        return !!config.PUSHER_APP_ID && !!config.PUSHER_SECRET
      case 'redis':
        return !!config.REDIS_URL
      case 'openai':
        return !!config.OPENAI_API_KEY
      case 'sentry':
        return !!config.SENTRY_AUTH_TOKEN
      case 'aws':
        return !!config.AWS_ACCESS_KEY_ID && !!config.AWS_SECRET_ACCESS_KEY
      default:
        return false
    }
  } catch {
    return false
  }
}

/**
 * Validate configuration on startup (call this in app initialization)
 */
export function validateConfigOnStartup(): void {
  if (typeof window !== 'undefined') {
    return // Only validate on server
  }

  console.log('🔧 Validating configuration...')

  try {
    getServerConfig()
    console.log('✅ Server configuration validated')
  } catch (error) {
    if (process.env.NODE_ENV === 'production') {
      throw error // Fail fast in production
    }
    console.warn('⚠️ Server configuration incomplete (some features may be disabled)')
  }

  // Log service status
  const services = ['stripe', 'amadeus', 'sendgrid', 'pusher', 'redis', 'openai', 'sentry', 'aws'] as const
  const serviceStatus = services.map(s => ({
    service: s,
    configured: isServiceConfigured(s)
  }))

  console.log('\n📊 Service Configuration Status:')
  serviceStatus.forEach(({ service, configured }) => {
    console.log(`  ${configured ? '✅' : '⚠️'} ${service}: ${configured ? 'Configured' : 'Not configured'}`)
  })
  console.log('')
}

// Default export for convenience
export default {
  getServerConfig,
  getClientConfig,
  getFeatureFlags,
  isServiceConfigured,
  validateConfigOnStartup,
}
