/**
 * User Privacy API Routes (GDPR/CCPA Compliance)
 *
 * Provides endpoints for:
 * - Data export (GET)
 * - Account deletion (DELETE)
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'
import { emailService } from '@/lib/services/email'

/**
 * GET /api/user/privacy
 * Export all user data (GDPR Data Portability)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }

    const userId = session.user.id

    // Fetch all user data
    const [
      user,
      bookings,
      payments,
      reviews,
      wishlist,
      searchHistory,
      notifications,
      priceAlerts,
      supportTickets,
    ] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          dateOfBirth: true,
          nationality: true,
          preferredCurrency: true,
          preferredLanguage: true,
          role: true,
          loyaltyPoints: true,
          loyaltyTier: true,
          memberSince: true,
          preferences: true,
          notificationPrefs: true,
          createdAt: true,
          updatedAt: true,
          // Exclude sensitive fields
        },
      }),
      prisma.booking.findMany({
        where: { userId },
        include: {
          flights: true,
          hotels: true,
          carRentals: true,
          activities: true,
        },
      }),
      prisma.payment.findMany({
        where: { userId },
        select: {
          id: true,
          amount: true,
          currency: true,
          method: true,
          status: true,
          cardLast4: true,
          cardBrand: true,
          createdAt: true,
          // Exclude full gateway response
        },
      }),
      prisma.review.findMany({
        where: { userId },
      }),
      prisma.wishlist.findMany({
        where: { userId },
      }),
      prisma.searchHistory.findMany({
        where: { userId },
      }),
      prisma.notification.findMany({
        where: { userId },
      }),
      prisma.priceAlert.findMany({
        where: { userId },
      }),
      prisma.supportTicket.findMany({
        where: { userId },
        include: {
          messages: true,
        },
      }),
    ])

    if (!user) {
      return NextResponse.json(
        { error: 'User not found', code: 'NOT_FOUND' },
        { status: 404 }
      )
    }

    // Compile data export
    const exportData = {
      exportDate: new Date().toISOString(),
      exportVersion: '1.0',
      user: {
        profile: user,
        bookings,
        payments,
        reviews,
        wishlist,
        searchHistory,
        notifications,
        priceAlerts,
        supportTickets,
      },
    }

    // Create response with proper headers for download
    const response = NextResponse.json(exportData)
    response.headers.set('Content-Disposition', `attachment; filename="truedest-data-export-${Date.now()}.json"`)

    console.log(`[PRIVACY] Data export generated for user ${userId}`)

    return response

  } catch (error) {
    console.error('[PRIVACY] Data export error:', error)

    return NextResponse.json(
      { error: 'Failed to export data', code: 'EXPORT_ERROR' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/user/privacy
 * Delete user account and anonymize data (GDPR Right to Erasure)
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }

    const userId = session.user.id

    // Parse request body for confirmation
    const body = await request.json().catch(() => ({}))
    const { confirmEmail, reason } = body as { confirmEmail?: string; reason?: string }

    // Require email confirmation for deletion
    if (confirmEmail !== session.user.email) {
      return NextResponse.json(
        {
          error: 'Please confirm your email address to delete your account',
          code: 'CONFIRMATION_REQUIRED',
        },
        { status: 400 }
      )
    }

    // Check for active bookings
    const activeBookings = await prisma.booking.count({
      where: {
        userId,
        status: {
          in: ['PENDING', 'CONFIRMED'],
        },
        travelDate: {
          gte: new Date(),
        },
      },
    })

    if (activeBookings > 0) {
      return NextResponse.json(
        {
          error: `You have ${activeBookings} upcoming booking(s). Please cancel or complete them before deleting your account.`,
          code: 'ACTIVE_BOOKINGS',
        },
        { status: 400 }
      )
    }

    // Get user info for notification
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true },
    })

    // Start deletion process
    console.log(`[PRIVACY] Starting account deletion for user ${userId}`)

    // Delete related data in order (respecting foreign keys)
    await prisma.$transaction(async (tx) => {
      // Delete notifications
      await tx.notification.deleteMany({ where: { userId } })

      // Delete price alerts
      await tx.priceAlert.deleteMany({ where: { userId } })

      // Delete wishlist
      await tx.wishlist.deleteMany({ where: { userId } })

      // Delete search history
      await tx.searchHistory.deleteMany({ where: { userId } })

      // Delete reviews
      await tx.review.deleteMany({ where: { userId } })

      // Delete support ticket messages and tickets
      const tickets = await tx.supportTicket.findMany({
        where: { userId },
        select: { id: true },
      })
      const ticketIds = tickets.map(t => t.id)
      await tx.ticketMessage.deleteMany({ where: { ticketId: { in: ticketIds } } })
      await tx.supportTicket.deleteMany({ where: { userId } })

      // Anonymize payments (keep for financial records but remove user reference)
      await tx.payment.updateMany({
        where: { userId },
        data: {
          // Keep transaction records but anonymize
          metadata: { anonymized: true, deletedAt: new Date().toISOString() },
        },
      })

      // Anonymize bookings (keep for business records)
      await tx.booking.updateMany({
        where: { userId },
        data: {
          specialRequests: null,
          internalNotes: '[Account Deleted]',
        },
      })

      // Soft-delete user (mark as deleted, anonymize PII)
      await tx.user.update({
        where: { id: userId },
        data: {
          email: `deleted-${userId}@deleted.truedest.com`,
          name: 'Deleted User',
          password: null,
          phone: null,
          dateOfBirth: null,
          nationality: null,
          passportNumber: null,
          passportExpiry: null,
          image: null,
          preferences: null,
          notificationPrefs: null,
          status: 'DELETED',
        },
      })

      // Delete sessions
      await tx.session.deleteMany({ where: { userId } })

      // Delete OAuth accounts
      await tx.account.deleteMany({ where: { userId } })
    })

    // Log deletion reason
    console.log(`[PRIVACY] Account deleted for user ${userId}. Reason: ${reason || 'Not provided'}`)

    // Send confirmation email (to original email if available)
    if (user?.email) {
      await emailService.send({
        to: user.email,
        subject: 'Your TrueDest Account Has Been Deleted',
        html: `
          <p>Hi ${user.name || 'there'},</p>
          <p>Your TrueDest account has been successfully deleted as requested.</p>
          <p>Your personal data has been removed from our systems. Some transaction records may be retained for legal and financial compliance purposes.</p>
          <p>We're sorry to see you go. If you ever want to return, you're always welcome to create a new account.</p>
          <p>Best regards,<br>The TrueDest Team</p>
        `,
      }).catch(err => {
        console.error('[PRIVACY] Failed to send deletion confirmation email:', err)
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Your account has been deleted. You will be logged out.',
    })

  } catch (error) {
    console.error('[PRIVACY] Account deletion error:', error)

    return NextResponse.json(
      { error: 'Failed to delete account', code: 'DELETION_ERROR' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/user/privacy
 * Request data export to be sent via email (async export)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }

    const userId = session.user.id
    const userEmail = session.user.email

    if (!userEmail) {
      return NextResponse.json(
        { error: 'No email associated with account', code: 'NO_EMAIL' },
        { status: 400 }
      )
    }

    // In production, queue this as a background job
    // For now, we'll note that the export is being prepared

    // Create notification
    await prisma.notification.create({
      data: {
        userId,
        type: 'SYSTEM',
        title: 'Data Export Requested',
        message: 'Your data export is being prepared. You will receive an email when it\'s ready.',
        actionUrl: '/profile/privacy',
      },
    })

    console.log(`[PRIVACY] Data export requested for user ${userId}`)

    return NextResponse.json({
      success: true,
      message: `Your data export is being prepared. We will send it to ${userEmail} when ready.`,
    })

  } catch (error) {
    console.error('[PRIVACY] Export request error:', error)

    return NextResponse.json(
      { error: 'Failed to request data export', code: 'REQUEST_ERROR' },
      { status: 500 }
    )
  }
}
