/**
 * Individual Price Alert API Route
 *
 * Operations for a single price alert by ID.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { prisma } from '@/lib/prisma'
import { updatePriceAlertSchema } from '@/lib/validations'
import { ZodError } from 'zod'

interface RouteParams {
  params: { id: string }
}

/**
 * GET /api/price-alerts/[id]
 * Get a single price alert by ID
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }

    const alert = await prisma.priceAlert.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!alert) {
      return NextResponse.json(
        { error: 'Price alert not found', code: 'NOT_FOUND' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: alert,
    })

  } catch (error) {
    console.error('[PRICE_ALERTS] GET by ID Error:', error)

    return NextResponse.json(
      { error: 'Failed to fetch price alert', code: 'FETCH_ERROR' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/price-alerts/[id]
 * Update a price alert
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }

    // Check if alert exists and belongs to user
    const existingAlert = await prisma.priceAlert.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!existingAlert) {
      return NextResponse.json(
        { error: 'Price alert not found', code: 'NOT_FOUND' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const validatedData = updatePriceAlertSchema.parse(body)

    // Update alert
    const alert = await prisma.priceAlert.update({
      where: { id: params.id },
      data: {
        targetPrice: validatedData.targetPrice,
        isActive: validatedData.isActive,
        notifyOnAnyDrop: validatedData.notifyOnAnyDrop,
        dropPercentage: validatedData.dropPercentage,
        expiresAt: validatedData.expiresAt ? new Date(validatedData.expiresAt) : undefined,
      },
    })

    console.log(`[PRICE_ALERTS] Alert ${params.id} updated by user ${session.user.id}`)

    return NextResponse.json({
      success: true,
      data: alert,
    })

  } catch (error) {
    console.error('[PRICE_ALERTS] PATCH Error:', error)

    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: 'Invalid update data',
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
      { error: 'Failed to update price alert', code: 'UPDATE_ERROR' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/price-alerts/[id]
 * Delete a price alert
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }

    // Check if alert exists and belongs to user
    const existingAlert = await prisma.priceAlert.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!existingAlert) {
      return NextResponse.json(
        { error: 'Price alert not found', code: 'NOT_FOUND' },
        { status: 404 }
      )
    }

    // Delete alert
    await prisma.priceAlert.delete({
      where: { id: params.id },
    })

    console.log(`[PRICE_ALERTS] Alert ${params.id} deleted by user ${session.user.id}`)

    return NextResponse.json({
      success: true,
      message: 'Price alert deleted',
    })

  } catch (error) {
    console.error('[PRICE_ALERTS] DELETE Error:', error)

    return NextResponse.json(
      { error: 'Failed to delete price alert', code: 'DELETE_ERROR' },
      { status: 500 }
    )
  }
}
