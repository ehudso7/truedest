/**
 * Stripe Webhook Handler
 *
 * Handles Stripe webhook events for payment processing.
 * Verifies webhook signatures and processes payment events.
 */

import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'
import { headers } from 'next/headers'

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

// Disable body parsing for raw body access
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // Get raw body for signature verification
    const body = await request.text()
    const headersList = headers()
    const signature = headersList.get('stripe-signature')

    if (!signature) {
      console.error('[STRIPE_WEBHOOK] Missing signature')
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      )
    }

    // Verify webhook signature
    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('[STRIPE_WEBHOOK] Signature verification failed:', err)
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    console.log(`[STRIPE_WEBHOOK] Received event: ${event.type}`)

    // Handle specific event types
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent)
        break

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent)
        break

      case 'payment_intent.canceled':
        await handlePaymentIntentCanceled(event.data.object as Stripe.PaymentIntent)
        break

      case 'charge.refunded':
        await handleChargeRefunded(event.data.object as Stripe.Charge)
        break

      case 'charge.dispute.created':
        await handleDisputeCreated(event.data.object as Stripe.Dispute)
        break

      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session)
        break

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        // Handle subscription events if needed
        console.log(`[STRIPE_WEBHOOK] Subscription event: ${event.type}`)
        break

      default:
        console.log(`[STRIPE_WEBHOOK] Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('[STRIPE_WEBHOOK] Error processing webhook:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

/**
 * Handle successful payment
 */
async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  const { bookingId, userId } = paymentIntent.metadata

  if (!bookingId) {
    console.error('[STRIPE_WEBHOOK] No bookingId in payment metadata')
    return
  }

  console.log(`[STRIPE_WEBHOOK] Payment succeeded for booking ${bookingId}`)

  // Update payment record
  await prisma.payment.updateMany({
    where: { transactionId: paymentIntent.id },
    data: {
      status: 'COMPLETED',
      cardLast4: paymentIntent.payment_method_types.includes('card')
        ? (paymentIntent as any).charges?.data?.[0]?.payment_method_details?.card?.last4
        : null,
      cardBrand: paymentIntent.payment_method_types.includes('card')
        ? (paymentIntent as any).charges?.data?.[0]?.payment_method_details?.card?.brand
        : null,
      gatewayResponse: paymentIntent as unknown as Record<string, unknown>,
      updatedAt: new Date(),
    },
  })

  // Update booking status
  await prisma.booking.update({
    where: { id: bookingId },
    data: {
      paymentStatus: 'COMPLETED',
      status: 'CONFIRMED',
      updatedAt: new Date(),
    },
  })

  // Award loyalty points
  if (userId) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      select: { loyaltyPointsEarned: true },
    })

    if (booking?.loyaltyPointsEarned) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          loyaltyPoints: {
            increment: booking.loyaltyPointsEarned,
          },
        },
      })
    }

    // Create confirmation notification
    await prisma.notification.create({
      data: {
        userId,
        type: 'PAYMENT_SUCCESS',
        title: 'Payment Successful!',
        message: 'Your payment has been processed successfully. Your booking is now confirmed.',
        actionUrl: `/trips/${bookingId}`,
        metadata: { bookingId, paymentIntentId: paymentIntent.id },
      },
    })
  }

  console.log(`[STRIPE_WEBHOOK] Booking ${bookingId} confirmed`)
}

/**
 * Handle failed payment
 */
async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  const { bookingId, userId } = paymentIntent.metadata

  if (!bookingId) {
    console.error('[STRIPE_WEBHOOK] No bookingId in payment metadata')
    return
  }

  console.log(`[STRIPE_WEBHOOK] Payment failed for booking ${bookingId}`)

  const failureMessage = paymentIntent.last_payment_error?.message || 'Payment failed'

  // Update payment record
  await prisma.payment.updateMany({
    where: { transactionId: paymentIntent.id },
    data: {
      status: 'FAILED',
      gatewayResponse: {
        error: failureMessage,
        code: paymentIntent.last_payment_error?.code,
      },
      updatedAt: new Date(),
    },
  })

  // Update booking status
  await prisma.booking.update({
    where: { id: bookingId },
    data: {
      paymentStatus: 'FAILED',
      status: 'FAILED',
      updatedAt: new Date(),
    },
  })

  // Create failure notification
  if (userId) {
    await prisma.notification.create({
      data: {
        userId,
        type: 'PAYMENT_FAILED',
        title: 'Payment Failed',
        message: `Your payment could not be processed: ${failureMessage}. Please try again.`,
        actionUrl: `/booking/${bookingId}/payment`,
        metadata: { bookingId, error: failureMessage },
      },
    })
  }
}

/**
 * Handle canceled payment
 */
async function handlePaymentIntentCanceled(paymentIntent: Stripe.PaymentIntent) {
  const { bookingId } = paymentIntent.metadata

  if (!bookingId) return

  console.log(`[STRIPE_WEBHOOK] Payment canceled for booking ${bookingId}`)

  await prisma.payment.updateMany({
    where: { transactionId: paymentIntent.id },
    data: {
      status: 'FAILED',
      gatewayResponse: { canceledAt: new Date().toISOString() },
      updatedAt: new Date(),
    },
  })
}

/**
 * Handle refund
 */
async function handleChargeRefunded(charge: Stripe.Charge) {
  const paymentIntentId = charge.payment_intent as string

  console.log(`[STRIPE_WEBHOOK] Refund processed for payment ${paymentIntentId}`)

  const isFullRefund = charge.amount_refunded === charge.amount

  await prisma.payment.updateMany({
    where: { transactionId: paymentIntentId },
    data: {
      status: isFullRefund ? 'REFUNDED' : 'PARTIALLY_REFUNDED',
      refundAmount: charge.amount_refunded / 100, // Convert from cents
      refundedAt: new Date(),
      updatedAt: new Date(),
    },
  })

  // Get booking from payment
  const payment = await prisma.payment.findFirst({
    where: { transactionId: paymentIntentId },
    select: { bookingId: true, userId: true },
  })

  if (payment) {
    // Update booking status if full refund
    if (isFullRefund) {
      await prisma.booking.update({
        where: { id: payment.bookingId },
        data: {
          status: 'REFUNDED',
          paymentStatus: 'REFUNDED',
          updatedAt: new Date(),
        },
      })
    }

    // Notify user
    await prisma.notification.create({
      data: {
        userId: payment.userId,
        type: 'SYSTEM',
        title: isFullRefund ? 'Refund Processed' : 'Partial Refund Processed',
        message: `A ${isFullRefund ? 'full' : 'partial'} refund of $${(charge.amount_refunded / 100).toFixed(2)} has been processed.`,
        actionUrl: `/trips/${payment.bookingId}`,
      },
    })
  }
}

/**
 * Handle dispute
 */
async function handleDisputeCreated(dispute: Stripe.Dispute) {
  console.log(`[STRIPE_WEBHOOK] Dispute created: ${dispute.id}`)

  const paymentIntentId = dispute.payment_intent as string

  const payment = await prisma.payment.findFirst({
    where: { transactionId: paymentIntentId },
    select: { bookingId: true, userId: true },
  })

  if (payment) {
    // Create admin notification for dispute handling
    await prisma.notification.create({
      data: {
        userId: payment.userId,
        type: 'SYSTEM',
        title: 'Payment Dispute Received',
        message: 'We\'ve received a dispute for your payment. Our team is reviewing it.',
        actionUrl: `/support`,
        metadata: { disputeId: dispute.id, bookingId: payment.bookingId },
      },
    })

    // Create support ticket for dispute
    await prisma.supportTicket.create({
      data: {
        ticketNumber: `DSP-${Date.now()}`,
        userId: payment.userId,
        category: 'PAYMENT',
        priority: 'URGENT',
        subject: 'Payment Dispute',
        description: `Stripe dispute ID: ${dispute.id}. Reason: ${dispute.reason}`,
        bookingReference: payment.bookingId,
      },
    })
  }
}

/**
 * Handle checkout session completion
 */
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const { bookingId, userId } = session.metadata || {}

  if (!bookingId || !userId) {
    console.error('[STRIPE_WEBHOOK] Missing metadata in checkout session')
    return
  }

  console.log(`[STRIPE_WEBHOOK] Checkout completed for booking ${bookingId}`)

  // Create payment record
  await prisma.payment.create({
    data: {
      bookingId,
      userId,
      amount: (session.amount_total || 0) / 100,
      currency: session.currency || 'usd',
      method: 'CREDIT_CARD',
      status: 'COMPLETED',
      gatewayProvider: 'stripe',
      transactionId: session.payment_intent as string,
      gatewayResponse: session as unknown as Record<string, unknown>,
    },
  })

  // Update booking
  await prisma.booking.update({
    where: { id: bookingId },
    data: {
      paymentStatus: 'COMPLETED',
      status: 'CONFIRMED',
      updatedAt: new Date(),
    },
  })
}
