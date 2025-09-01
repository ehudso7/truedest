import Pusher from 'pusher'
import PusherClient from 'pusher-js'

// Server-side Pusher instance
export const pusherServer = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true,
})

// Client-side Pusher instance
export const getPusherClient = () => {
  if (typeof window === 'undefined') return null
  
  return new PusherClient(process.env.NEXT_PUBLIC_PUSHER_APP_KEY!, {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    authEndpoint: '/api/pusher/auth',
  })
}

export interface NotificationPayload {
  userId: string
  type: 'booking' | 'payment' | 'flight_status' | 'price_alert' | 'general'
  title: string
  message: string
  data?: any
  actionUrl?: string
}

export interface FlightUpdatePayload {
  flightId: string
  status: 'on_time' | 'delayed' | 'cancelled' | 'gate_change'
  message: string
  details: {
    newTime?: string
    newGate?: string
    reason?: string
  }
}

export interface ChatMessage {
  id: string
  userId: string
  message: string
  timestamp: Date
  attachments?: string[]
  isSupport: boolean
}

export class PusherService {
  // Send real-time notification to user
  async sendNotification(notification: NotificationPayload) {
    try {
      const channel = `private-user-${notification.userId}`
      
      await pusherServer.trigger(channel, 'notification', {
        id: Date.now().toString(),
        ...notification,
        timestamp: new Date().toISOString(),
      })

      // Also store in database for persistence
      await this.storeNotification(notification)
      
      return true
    } catch (error) {
      console.error('Pusher notification error:', error)
      throw new Error('Failed to send notification')
    }
  }

  // Send flight status update
  async sendFlightUpdate(bookingId: string, update: FlightUpdatePayload) {
    try {
      const channel = `private-booking-${bookingId}`
      
      await pusherServer.trigger(channel, 'flight-update', {
        ...update,
        timestamp: new Date().toISOString(),
      })

      // Send notification to affected users
      const booking = await this.getBookingUsers(bookingId)
      if (booking) {
        await this.sendNotification({
          userId: booking.userId,
          type: 'flight_status',
          title: 'Flight Status Update',
          message: update.message,
          data: update.details,
          actionUrl: `/trips/${bookingId}`,
        })
      }

      return true
    } catch (error) {
      console.error('Pusher flight update error:', error)
      throw new Error('Failed to send flight update')
    }
  }

  // Send price drop alert
  async sendPriceAlert(userId: string, alert: any) {
    try {
      const channel = `private-user-${userId}`
      
      await pusherServer.trigger(channel, 'price-alert', {
        id: Date.now().toString(),
        ...alert,
        timestamp: new Date().toISOString(),
      })

      await this.sendNotification({
        userId,
        type: 'price_alert',
        title: 'Price Drop Alert!',
        message: `The price for your saved search has dropped by ${alert.percentage}%`,
        data: alert,
        actionUrl: alert.searchUrl,
      })

      return true
    } catch (error) {
      console.error('Pusher price alert error:', error)
      throw new Error('Failed to send price alert')
    }
  }

  // Handle live chat messages
  async sendChatMessage(ticketId: string, message: ChatMessage) {
    try {
      const channel = `private-chat-${ticketId}`
      
      await pusherServer.trigger(channel, 'message', message)

      // Store message in database
      await this.storeChatMessage(ticketId, message)

      return true
    } catch (error) {
      console.error('Pusher chat message error:', error)
      throw new Error('Failed to send chat message')
    }
  }

  // Broadcast system-wide announcements
  async broadcastAnnouncement(announcement: any) {
    try {
      await pusherServer.trigger('public-announcements', 'announcement', {
        id: Date.now().toString(),
        ...announcement,
        timestamp: new Date().toISOString(),
      })

      return true
    } catch (error) {
      console.error('Pusher broadcast error:', error)
      throw new Error('Failed to broadcast announcement')
    }
  }

  // Track user presence
  async updateUserPresence(userId: string, status: 'online' | 'away' | 'offline') {
    try {
      const channel = `presence-user-${userId}`
      
      await pusherServer.trigger(channel, 'presence-update', {
        userId,
        status,
        timestamp: new Date().toISOString(),
      })

      return true
    } catch (error) {
      console.error('Pusher presence error:', error)
      throw new Error('Failed to update presence')
    }
  }

  // Authenticate private channels
  async authenticateChannel(socketId: string, channelName: string, userId: string) {
    try {
      const auth = pusherServer.authenticate(socketId, channelName, {
        user_id: userId,
        user_info: {
          id: userId,
        },
      })

      return auth
    } catch (error) {
      console.error('Pusher auth error:', error)
      throw new Error('Failed to authenticate channel')
    }
  }

  // Helper methods
  private async storeNotification(notification: NotificationPayload) {
    const { prisma } = await import('@/lib/prisma')
    
    await prisma.notification.create({
      data: {
        userId: notification.userId,
        type: notification.type.toUpperCase() as any,
        title: notification.title,
        message: notification.message,
        actionUrl: notification.actionUrl,
        metadata: notification.data,
      },
    })
  }

  private async getBookingUsers(bookingId: string) {
    const { prisma } = await import('@/lib/prisma')
    
    return await prisma.booking.findUnique({
      where: { id: bookingId },
      select: { userId: true },
    })
  }

  private async storeChatMessage(ticketId: string, message: ChatMessage) {
    const { prisma } = await import('@/lib/prisma')
    
    await prisma.ticketMessage.create({
      data: {
        ticketId,
        senderId: message.userId,
        senderType: message.isSupport ? 'SUPPORT' : 'USER',
        message: message.message,
        attachments: message.attachments || [],
      },
    })
  }
}

export const pusherService = new PusherService()