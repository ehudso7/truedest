import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

export interface CreatePaymentIntentParams {
  amount: number
  currency: string
  bookingId: string
  userId: string
  metadata?: Record<string, string>
}

export interface CreateCheckoutSessionParams {
  bookingId: string
  userId: string
  lineItems: {
    price_data: {
      currency: string
      product_data: {
        name: string
        description?: string
        images?: string[]
      }
      unit_amount: number
    }
    quantity: number
  }[]
  successUrl: string
  cancelUrl: string
}

export class StripeService {
  // Create Payment Intent for direct charges
  async createPaymentIntent(params: CreatePaymentIntentParams) {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(params.amount * 100), // Convert to cents
        currency: params.currency.toLowerCase(),
        metadata: {
          bookingId: params.bookingId,
          userId: params.userId,
          ...params.metadata,
        },
        automatic_payment_methods: {
          enabled: true,
        },
      })

      // Store payment intent in database
      await prisma.payment.create({
        data: {
          bookingId: params.bookingId,
          userId: params.userId,
          amount: params.amount,
          currency: params.currency,
          method: 'CREDIT_CARD',
          status: 'PENDING',
          gatewayProvider: 'stripe',
          transactionId: paymentIntent.id,
          metadata: params.metadata as any,
        },
      })

      return {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      }
    } catch (error) {
      console.error('Stripe payment intent error:', error)
      throw new Error('Failed to create payment intent')
    }
  }

  // Create Checkout Session for hosted payment page
  async createCheckoutSession(params: CreateCheckoutSessionParams) {
    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card', 'apple_pay', 'google_pay'],
        line_items: params.lineItems,
        mode: 'payment',
        success_url: params.successUrl,
        cancel_url: params.cancelUrl,
        metadata: {
          bookingId: params.bookingId,
          userId: params.userId,
        },
        customer_email: await this.getUserEmail(params.userId),
        allow_promotion_codes: true,
        billing_address_collection: 'required',
        shipping_address_collection: {
          allowed_countries: ['US', 'CA', 'GB', 'AU', 'NZ', 'SG', 'JP', 'IN'],
        },
      })

      return {
        sessionId: session.id,
        url: session.url,
      }
    } catch (error) {
      console.error('Stripe checkout session error:', error)
      throw new Error('Failed to create checkout session')
    }
  }

  // Handle Webhook Events
  async handleWebhookEvent(signature: string, payload: string) {
    try {
      const event = stripe.webhooks.constructEvent(
        payload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      )

      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent)
          break
        case 'payment_intent.payment_failed':
          await this.handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent)
          break
        case 'checkout.session.completed':
          await this.handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session)
          break
        case 'charge.refunded':
          await this.handleChargeRefunded(event.data.object as Stripe.Charge)
          break
        default:
          console.log(`Unhandled event type: ${event.type}`)
      }

      return { received: true }
    } catch (error) {
      console.error('Stripe webhook error:', error)
      throw new Error('Webhook processing failed')
    }
  }

  // Process Refund
  async processRefund(paymentIntentId: string, amount?: number, reason?: string) {
    try {
      const refund = await stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount: amount ? Math.round(amount * 100) : undefined, // Partial refund if amount specified
        reason: reason as Stripe.RefundCreateParams.Reason || 'requested_by_customer',
      })

      // Update payment record
      const payment = await prisma.payment.findFirst({
        where: { transactionId: paymentIntentId },
      })

      if (payment) {
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: amount && amount < payment.amount ? 'PARTIALLY_REFUNDED' : 'REFUNDED',
            refundAmount: amount || payment.amount,
            refundReason: reason,
            refundedAt: new Date(),
          },
        })
      }

      return refund
    } catch (error) {
      console.error('Stripe refund error:', error)
      throw new Error('Failed to process refund')
    }
  }

  // Create Customer
  async createCustomer(userId: string, email: string, name?: string) {
    try {
      const customer = await stripe.customers.create({
        email,
        name,
        metadata: {
          userId,
        },
      })

      return customer
    } catch (error) {
      console.error('Stripe create customer error:', error)
      throw new Error('Failed to create customer')
    }
  }

  // Save Payment Method
  async savePaymentMethod(customerId: string, paymentMethodId: string) {
    try {
      await stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId,
      })

      await stripe.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      })

      return true
    } catch (error) {
      console.error('Stripe save payment method error:', error)
      throw new Error('Failed to save payment method')
    }
  }

  // List Customer Payment Methods
  async listPaymentMethods(customerId: string) {
    try {
      const paymentMethods = await stripe.paymentMethods.list({
        customer: customerId,
        type: 'card',
      })

      return paymentMethods.data
    } catch (error) {
      console.error('Stripe list payment methods error:', error)
      throw new Error('Failed to list payment methods')
    }
  }

  // Helper Methods
  private async getUserEmail(userId: string): Promise<string | undefined> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    })
    return user?.email
  }

  private async handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
    const { bookingId, userId } = paymentIntent.metadata

    // Update payment status
    await prisma.payment.updateMany({
      where: { transactionId: paymentIntent.id },
      data: {
        status: 'COMPLETED',
        gatewayResponse: paymentIntent as any,
      },
    })

    // Update booking status
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        paymentStatus: 'COMPLETED',
        status: 'CONFIRMED',
      },
    })

    // Send confirmation email
    // await emailService.sendBookingConfirmation(bookingId)

    // Award loyalty points
    const pointsEarned = Math.floor(paymentIntent.amount / 100) // 1 point per dollar
    await prisma.user.update({
      where: { id: userId },
      data: {
        loyaltyPoints: {
          increment: pointsEarned,
        },
      },
    })
  }

  private async handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
    const { bookingId } = paymentIntent.metadata

    // Update payment status
    await prisma.payment.updateMany({
      where: { transactionId: paymentIntent.id },
      data: {
        status: 'FAILED',
        gatewayResponse: paymentIntent as any,
      },
    })

    // Update booking status
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        paymentStatus: 'FAILED',
        status: 'FAILED',
      },
    })

    // Send failure notification
    // await emailService.sendPaymentFailedNotification(bookingId)
  }

  private async handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
    const { bookingId, userId } = session.metadata!

    // Create payment record
    await prisma.payment.create({
      data: {
        bookingId,
        userId,
        amount: session.amount_total! / 100,
        currency: session.currency!,
        method: 'CREDIT_CARD',
        status: 'COMPLETED',
        gatewayProvider: 'stripe',
        transactionId: session.payment_intent as string,
        gatewayResponse: session as any,
      },
    })

    // Update booking
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        paymentStatus: 'COMPLETED',
        status: 'CONFIRMED',
      },
    })
  }

  private async handleChargeRefunded(charge: Stripe.Charge) {
    // Update payment record for refund
    await prisma.payment.updateMany({
      where: { transactionId: charge.payment_intent as string },
      data: {
        status: charge.amount_refunded === charge.amount ? 'REFUNDED' : 'PARTIALLY_REFUNDED',
        refundAmount: charge.amount_refunded / 100,
        refundedAt: new Date(),
      },
    })
  }
}

export const stripeService = new StripeService()