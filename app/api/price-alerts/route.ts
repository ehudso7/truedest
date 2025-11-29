/**
 * Price Alerts API Route
 *
 * CRUD operations for price alerts.
 * Users can create alerts to be notified when prices drop.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'
import { createPriceAlertSchema, updatePriceAlertSchema, paginationSchema } from '@/lib/validations'
import { ZodError } from 'zod'

/**
 * GET /api/price-alerts
 * List all price alerts for the authenticated user
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

    const { searchParams } = new URL(request.url)
    const pagination = paginationSchema.parse({
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '20',
      sortBy: searchParams.get('sortBy') || 'createdAt',
      sortOrder: searchParams.get('sortOrder') || 'desc',
    })

    const activeOnly = searchParams.get('active') === 'true'
    const alertType = searchParams.get('type')

    // Build where clause
    const where: Record<string, unknown> = {
      userId: session.user.id,
    }

    if (activeOnly) {
      where.isActive = true
    }

    if (alertType && ['FLIGHT', 'HOTEL', 'PACKAGE'].includes(alertType)) {
      where.alertType = alertType
    }

    // Get total count
    const total = await prisma.priceAlert.count({ where })

    // Get alerts with pagination
    const alerts = await prisma.priceAlert.findMany({
      where,
      orderBy: { [pagination.sortBy || 'createdAt']: pagination.sortOrder },
      skip: (pagination.page - 1) * pagination.limit,
      take: pagination.limit,
    })

    return NextResponse.json({
      success: true,
      data: alerts,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.ceil(total / pagination.limit),
      },
    })

  } catch (error) {
    console.error('[PRICE_ALERTS] GET Error:', error)

    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Invalid parameters', code: 'VALIDATION_ERROR' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to fetch price alerts', code: 'FETCH_ERROR' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/price-alerts
 * Create a new price alert
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

    const body = await request.json()
    const validatedData = createPriceAlertSchema.parse(body)

    // Check alert limit (max 20 active alerts per user)
    const activeAlertCount = await prisma.priceAlert.count({
      where: {
        userId: session.user.id,
        isActive: true,
      },
    })

    if (activeAlertCount >= 20) {
      return NextResponse.json(
        {
          error: 'Maximum number of active alerts reached (20)',
          code: 'ALERT_LIMIT_EXCEEDED',
        },
        { status: 400 }
      )
    }

    // Create alert
    const alert = await prisma.priceAlert.create({
      data: {
        userId: session.user.id,
        alertType: validatedData.alertType,
        searchCriteria: validatedData.searchCriteria,
        originCode: validatedData.originCode,
        destinationCode: validatedData.destinationCode,
        departureDate: validatedData.departureDate ? new Date(validatedData.departureDate) : null,
        returnDate: validatedData.returnDate ? new Date(validatedData.returnDate) : null,
        cabinClass: validatedData.cabinClass,
        cityCode: validatedData.cityCode,
        checkInDate: validatedData.checkInDate ? new Date(validatedData.checkInDate) : null,
        checkOutDate: validatedData.checkOutDate ? new Date(validatedData.checkOutDate) : null,
        starRating: validatedData.starRating,
        targetPrice: validatedData.targetPrice,
        currency: validatedData.currency,
        notifyOnAnyDrop: validatedData.notifyOnAnyDrop,
        dropPercentage: validatedData.dropPercentage,
        expiresAt: validatedData.expiresAt ? new Date(validatedData.expiresAt) : null,
        isActive: true,
      },
    })

    // Create notification for alert creation
    await prisma.notification.create({
      data: {
        userId: session.user.id,
        type: 'PRICE_ALERT',
        title: 'Price Alert Created',
        message: `We'll notify you when prices ${validatedData.targetPrice ? `drop below ${validatedData.currency} ${validatedData.targetPrice}` : 'change'}.`,
        actionUrl: '/dashboard/alerts',
        metadata: { alertId: alert.id },
      },
    })

    console.log(`[PRICE_ALERTS] Alert created for user ${session.user.id}`)

    return NextResponse.json({
      success: true,
      data: alert,
    }, { status: 201 })

  } catch (error) {
    console.error('[PRICE_ALERTS] POST Error:', error)

    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: 'Invalid alert data',
          code: 'VALIDATION_ERROR',
          details: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create price alert', code: 'CREATE_ERROR' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/price-alerts
 * Delete multiple price alerts (bulk delete)
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

    const body = await request.json()
    const { ids } = body as { ids: string[] }

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'Alert IDs required', code: 'MISSING_IDS' },
        { status: 400 }
      )
    }

    // Delete alerts (only user's own alerts)
    const result = await prisma.priceAlert.deleteMany({
      where: {
        id: { in: ids },
        userId: session.user.id,
      },
    })

    return NextResponse.json({
      success: true,
      deleted: result.count,
    })

  } catch (error) {
    console.error('[PRICE_ALERTS] DELETE Error:', error)

    return NextResponse.json(
      { error: 'Failed to delete alerts', code: 'DELETE_ERROR' },
      { status: 500 }
    )
  }
}
