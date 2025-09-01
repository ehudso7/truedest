import * as Sentry from '@sentry/nextjs'
import mixpanel from 'mixpanel'
import { PostHog } from 'posthog-node'
import winston from 'winston'

// Initialize Sentry for error tracking
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
  ],
})

// Initialize Mixpanel for analytics
const mixpanelClient = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN
  ? mixpanel.init(process.env.NEXT_PUBLIC_MIXPANEL_TOKEN)
  : null

// Initialize PostHog for product analytics
const posthog = process.env.NEXT_PUBLIC_POSTHOG_KEY
  ? new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
      host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    })
  : null

// Configure Winston logger
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'truedest' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
  ],
})

// Add file transport in production
if (process.env.NODE_ENV === 'production') {
  logger.add(new winston.transports.File({ filename: 'error.log', level: 'error' }))
  logger.add(new winston.transports.File({ filename: 'combined.log' }))
}

export interface TrackingEvent {
  userId?: string
  event: string
  properties?: Record<string, any>
  timestamp?: Date
}

export interface ErrorContext {
  userId?: string
  action?: string
  metadata?: Record<string, any>
}

export class MonitoringService {
  // Track user events
  async trackEvent(event: TrackingEvent): Promise<void> {
    try {
      // Mixpanel tracking
      if (mixpanelClient) {
        mixpanelClient.track(event.event, {
          distinct_id: event.userId || 'anonymous',
          ...event.properties,
          timestamp: event.timestamp || new Date(),
        })
      }

      // PostHog tracking
      if (posthog) {
        posthog.capture({
          distinctId: event.userId || 'anonymous',
          event: event.event,
          properties: event.properties,
          timestamp: event.timestamp,
        })
      }

      // Log event
      logger.info('Event tracked', {
        event: event.event,
        userId: event.userId,
        properties: event.properties,
      })
    } catch (error) {
      logger.error('Failed to track event', error)
    }
  }

  // Track user identification
  async identifyUser(userId: string, traits?: Record<string, any>): Promise<void> {
    try {
      // Mixpanel identification
      if (mixpanelClient) {
        mixpanelClient.people.set(userId, traits || {})
      }

      // PostHog identification
      if (posthog) {
        posthog.identify({
          distinctId: userId,
          properties: traits,
        })
      }

      // Sentry user context
      Sentry.setUser({
        id: userId,
        ...traits,
      })

      logger.info('User identified', { userId, traits })
    } catch (error) {
      logger.error('Failed to identify user', error)
    }
  }

  // Track page views
  async trackPageView(
    path: string,
    userId?: string,
    properties?: Record<string, any>
  ): Promise<void> {
    await this.trackEvent({
      userId,
      event: 'Page Viewed',
      properties: {
        path,
        ...properties,
      },
    })
  }

  // Track conversions
  async trackConversion(
    type: 'booking' | 'signup' | 'payment',
    value: number,
    userId: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.trackEvent({
      userId,
      event: `${type}_completed`,
      properties: {
        value,
        currency: 'USD',
        ...metadata,
      },
    })

    // Track revenue in Mixpanel
    if (mixpanelClient && type === 'payment') {
      mixpanelClient.people.track_charge(userId, value, {
        time: new Date(),
        ...metadata,
      })
    }
  }

  // Track search events
  async trackSearch(
    searchType: string,
    query: any,
    resultsCount: number,
    userId?: string
  ): Promise<void> {
    await this.trackEvent({
      userId,
      event: 'Search Performed',
      properties: {
        search_type: searchType,
        query,
        results_count: resultsCount,
      },
    })
  }

  // Track errors
  async trackError(error: Error, context?: ErrorContext): Promise<void> {
    // Send to Sentry
    Sentry.captureException(error, {
      user: context?.userId ? { id: context.userId } : undefined,
      tags: {
        action: context?.action,
      },
      extra: context?.metadata,
    })

    // Log error
    logger.error('Application error', {
      error: error.message,
      stack: error.stack,
      ...context,
    })

    // Track in analytics
    await this.trackEvent({
      userId: context?.userId,
      event: 'Error Occurred',
      properties: {
        error_message: error.message,
        error_name: error.name,
        action: context?.action,
        ...context?.metadata,
      },
    })
  }

  // Performance monitoring
  async trackPerformance(
    metric: string,
    value: number,
    tags?: Record<string, string>
  ): Promise<void> {
    // Send to Sentry
    const transaction = Sentry.getCurrentHub().getScope()?.getTransaction()
    if (transaction) {
      transaction.setMeasurement(metric, value, 'millisecond')
      transaction.setTag('metric_type', 'performance')
      Object.entries(tags || {}).forEach(([key, value]) => {
        transaction.setTag(key, value)
      })
    }

    // Log performance metric
    logger.info('Performance metric', {
      metric,
      value,
      tags,
    })

    // Track in analytics
    await this.trackEvent({
      event: 'Performance Metric',
      properties: {
        metric,
        value,
        ...tags,
      },
    })
  }

  // API monitoring
  async trackAPICall(
    endpoint: string,
    method: string,
    statusCode: number,
    responseTime: number,
    userId?: string
  ): Promise<void> {
    await this.trackEvent({
      userId,
      event: 'API Call',
      properties: {
        endpoint,
        method,
        status_code: statusCode,
        response_time: responseTime,
        success: statusCode < 400,
      },
    })

    // Track performance
    await this.trackPerformance(`api.${method.toLowerCase()}.${endpoint}`, responseTime, {
      status: statusCode.toString(),
    })
  }

  // Business metrics
  async trackBusinessMetric(
    metric: string,
    value: number,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.trackEvent({
      event: 'Business Metric',
      properties: {
        metric,
        value,
        ...metadata,
      },
    })

    logger.info('Business metric tracked', {
      metric,
      value,
      metadata,
    })
  }

  // A/B testing
  async trackExperiment(
    experimentName: string,
    variant: string,
    userId: string,
    properties?: Record<string, any>
  ): Promise<void> {
    await this.trackEvent({
      userId,
      event: 'Experiment Viewed',
      properties: {
        experiment_name: experimentName,
        variant,
        ...properties,
      },
    })

    // Set user property for the experiment
    if (mixpanelClient) {
      mixpanelClient.people.set(userId, {
        [`experiment_${experimentName}`]: variant,
      })
    }
  }

  // Session recording (PostHog specific)
  async startSessionRecording(userId: string): Promise<void> {
    if (posthog) {
      posthog.capture({
        distinctId: userId,
        event: '$session_recording_enabled',
      })
    }
  }

  // Custom metrics dashboard
  async getDashboardMetrics(): Promise<any> {
    // This would typically query from a metrics database
    return {
      totalBookings: 0,
      revenue: 0,
      activeUsers: 0,
      conversionRate: 0,
      averageBookingValue: 0,
      // Add more metrics as needed
    }
  }

  // Health check
  async checkHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy'
    services: Record<string, boolean>
  }> {
    const services: Record<string, boolean> = {
      database: true, // Would check actual database connection
      redis: true, // Would check Redis connection
      payment: true, // Would check Stripe API
      gds: true, // Would check Amadeus API
    }

    const allHealthy = Object.values(services).every(status => status)
    const someHealthy = Object.values(services).some(status => status)

    return {
      status: allHealthy ? 'healthy' : someHealthy ? 'degraded' : 'unhealthy',
      services,
    }
  }

  // Cleanup
  async shutdown(): Promise<void> {
    if (posthog) {
      await posthog.shutdown()
    }
    logger.end()
  }
}

export const monitoringService = new MonitoringService()
export { logger, Sentry }