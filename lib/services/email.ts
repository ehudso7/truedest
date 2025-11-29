/**
 * Email Service
 *
 * Provides email sending functionality using SendGrid.
 * Includes templates for common transactional emails.
 */

import sgMail from '@sendgrid/mail'
import { isServiceConfigured } from '@/lib/config'

// Initialize SendGrid if configured
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)
}

const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'noreply@truedest.com'
const FROM_NAME = 'TrueDest'

export interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
  replyTo?: string
}

export interface BookingEmailData {
  userName: string
  userEmail: string
  bookingReference: string
  bookingType: 'FLIGHT' | 'HOTEL' | 'PACKAGE'
  totalAmount: number
  currency: string
  travelDate: Date
  returnDate?: Date
  details: {
    // Flight details
    flightNumber?: string
    airline?: string
    departureCity?: string
    arrivalCity?: string
    departureTime?: Date
    arrivalTime?: Date
    // Hotel details
    hotelName?: string
    checkInDate?: Date
    checkOutDate?: Date
    roomType?: string
  }
}

export interface PriceAlertEmailData {
  userName: string
  userEmail: string
  alertType: 'FLIGHT' | 'HOTEL'
  origin?: string
  destination?: string
  previousPrice: number
  currentPrice: number
  currency: string
  dropPercentage: number
  searchUrl: string
}

export class EmailService {
  private isConfigured: boolean

  constructor() {
    this.isConfigured = isServiceConfigured('sendgrid')
  }

  /**
   * Escape HTML entities to prevent XSS in email templates
   */
  private escapeHtml(text: string): string {
    const htmlEntities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    }
    return text.replace(/[&<>"']/g, (char) => htmlEntities[char])
  }

  /**
   * Send a generic email
   */
  async send(options: EmailOptions): Promise<boolean> {
    if (!this.isConfigured) {
      console.log(`[EMAIL] Would send to ${options.to}: ${options.subject}`)
      console.log(`[EMAIL] Content preview: ${options.html.substring(0, 200)}...`)
      return true // Return true for development
    }

    try {
      await sgMail.send({
        to: options.to,
        from: {
          email: FROM_EMAIL,
          name: FROM_NAME,
        },
        subject: options.subject,
        html: options.html,
        text: options.text || this.htmlToText(options.html),
        replyTo: options.replyTo,
      })

      console.log(`[EMAIL] Sent to ${options.to}: ${options.subject}`)
      return true
    } catch (error) {
      console.error('[EMAIL] Send error:', error)
      return false
    }
  }

  /**
   * Send welcome email to new users
   */
  async sendWelcomeEmail(email: string, name: string): Promise<boolean> {
    const safeName = this.escapeHtml(name)
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          .points { background: #fef3c7; padding: 15px; border-radius: 6px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to TrueDest! ✈️</h1>
          </div>
          <div class="content">
            <p>Hi ${safeName},</p>
            <p>Thank you for joining TrueDest – your AI-powered travel companion! We're excited to help you discover amazing destinations and plan unforgettable trips.</p>

            <div class="points">
              <strong>🎁 Welcome Bonus!</strong><br>
              You've earned <strong>100 loyalty points</strong> just for signing up! Use them on your first booking.
            </div>

            <p>Here's what you can do with TrueDest:</p>
            <ul>
              <li>🔍 Search flights, hotels, and packages with AI-powered suggestions</li>
              <li>🔔 Set price alerts to get notified when prices drop</li>
              <li>📅 Get personalized itineraries for any destination</li>
              <li>⭐ Earn loyalty points on every booking</li>
            </ul>

            <center>
              <a href="${process.env.NEXTAUTH_URL || 'https://truedest.com'}/explore" class="button">
                Start Exploring
              </a>
            </center>

            <p>Happy travels!</p>
            <p>– The TrueDest Team</p>
          </div>
          <div class="footer">
            <p>Questions? Contact us at support@truedest.com</p>
            <p>© ${new Date().getFullYear()} TrueDest. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `

    return this.send({
      to: email,
      subject: 'Welcome to TrueDest! 🎉',
      html,
    })
  }

  /**
   * Send booking confirmation email
   */
  async sendBookingConfirmation(data: BookingEmailData): Promise<boolean> {
    // Escape user-provided data
    const safeUserName = this.escapeHtml(data.userName)
    const safeBookingRef = this.escapeHtml(data.bookingReference)
    const safeAirline = data.details.airline ? this.escapeHtml(data.details.airline) : ''
    const safeFlightNumber = data.details.flightNumber ? this.escapeHtml(data.details.flightNumber) : ''
    const safeDepartureCity = data.details.departureCity ? this.escapeHtml(data.details.departureCity) : ''
    const safeArrivalCity = data.details.arrivalCity ? this.escapeHtml(data.details.arrivalCity) : ''
    const safeHotelName = data.details.hotelName ? this.escapeHtml(data.details.hotelName) : ''
    const safeRoomType = data.details.roomType ? this.escapeHtml(data.details.roomType) : 'Standard Room'

    const formatDate = (date: Date) => date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

    const formatTime = (date: Date) => date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })

    let detailsHtml = ''

    if (data.bookingType === 'FLIGHT' && data.details.flightNumber) {
      detailsHtml = `
        <div class="booking-details">
          <h3>Flight Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">
                <strong>Flight</strong><br>
                ${safeAirline} ${safeFlightNumber}
              </td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">
                <strong>Route</strong><br>
                ${safeDepartureCity} → ${safeArrivalCity}
              </td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">
                <strong>Departure</strong><br>
                ${data.details.departureTime ? formatDate(data.details.departureTime) : formatDate(data.travelDate)} at ${data.details.departureTime ? formatTime(data.details.departureTime) : 'TBD'}
              </td>
            </tr>
            ${data.details.arrivalTime ? `
            <tr>
              <td style="padding: 8px;">
                <strong>Arrival</strong><br>
                ${formatDate(data.details.arrivalTime)} at ${formatTime(data.details.arrivalTime)}
              </td>
            </tr>
            ` : ''}
          </table>
        </div>
      `
    } else if (data.bookingType === 'HOTEL' && data.details.hotelName) {
      detailsHtml = `
        <div class="booking-details">
          <h3>Hotel Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">
                <strong>Hotel</strong><br>
                ${safeHotelName}
              </td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">
                <strong>Room</strong><br>
                ${safeRoomType}
              </td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">
                <strong>Check-in</strong><br>
                ${data.details.checkInDate ? formatDate(data.details.checkInDate) : formatDate(data.travelDate)}
              </td>
            </tr>
            <tr>
              <td style="padding: 8px;">
                <strong>Check-out</strong><br>
                ${data.details.checkOutDate ? formatDate(data.details.checkOutDate) : (data.returnDate ? formatDate(data.returnDate) : 'TBD')}
              </td>
            </tr>
          </table>
        </div>
      `
    }

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #059669 0%, #047857 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .booking-ref { background: white; padding: 20px; border-radius: 6px; text-align: center; margin: 20px 0; border: 2px dashed #059669; }
          .booking-details { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; }
          .total { background: #ecfdf5; padding: 15px; border-radius: 6px; text-align: right; font-size: 18px; }
          .button { display: inline-block; background: #059669; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Booking Confirmed! ✓</h1>
          </div>
          <div class="content">
            <p>Hi ${safeUserName},</p>
            <p>Great news! Your ${data.bookingType.toLowerCase()} booking has been confirmed.</p>

            <div class="booking-ref">
              <p style="margin: 0; color: #6b7280;">Booking Reference</p>
              <h2 style="margin: 10px 0; color: #059669; font-size: 28px;">${safeBookingRef}</h2>
            </div>

            ${detailsHtml}

            <div class="total">
              <strong>Total Paid: ${data.currency} ${data.totalAmount.toFixed(2)}</strong>
            </div>

            <center>
              <a href="${process.env.NEXTAUTH_URL || 'https://truedest.com'}/trips/${data.bookingReference}" class="button">
                View Booking Details
              </a>
            </center>

            <p><strong>What's next?</strong></p>
            <ul>
              <li>Check your spam folder if you don't see this email</li>
              <li>Download your e-ticket or voucher from your dashboard</li>
              <li>Set up flight alerts for status updates</li>
            </ul>

            <p>Have a wonderful trip!</p>
            <p>– The TrueDest Team</p>
          </div>
          <div class="footer">
            <p>Need to modify your booking? <a href="${process.env.NEXTAUTH_URL || 'https://truedest.com'}/support">Contact Support</a></p>
            <p>© ${new Date().getFullYear()} TrueDest. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `

    return this.send({
      to: data.userEmail,
      subject: `Booking Confirmed: ${data.bookingReference}`,
      html,
    })
  }

  /**
   * Send price drop alert email
   */
  async sendPriceAlertEmail(data: PriceAlertEmailData): Promise<boolean> {
    const safeUserName = this.escapeHtml(data.userName)
    const safeOrigin = data.origin ? this.escapeHtml(data.origin) : ''
    const safeDestination = data.destination ? this.escapeHtml(data.destination) : ''

    const route = data.alertType === 'FLIGHT'
      ? `${safeOrigin} → ${safeDestination}`
      : safeDestination || 'your saved search'

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .price-box { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; text-align: center; }
          .old-price { color: #6b7280; text-decoration: line-through; font-size: 18px; }
          .new-price { color: #059669; font-size: 32px; font-weight: bold; }
          .savings { background: #fef3c7; color: #92400e; padding: 10px 20px; border-radius: 20px; display: inline-block; margin: 10px 0; }
          .button { display: inline-block; background: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔔 Price Drop Alert!</h1>
          </div>
          <div class="content">
            <p>Hi ${safeUserName},</p>
            <p>Great news! The price for <strong>${route}</strong> just dropped!</p>

            <div class="price-box">
              <p class="old-price">${data.currency} ${data.previousPrice.toFixed(2)}</p>
              <p class="new-price">${data.currency} ${data.currentPrice.toFixed(2)}</p>
              <span class="savings">Save ${data.dropPercentage.toFixed(0)}%!</span>
            </div>

            <center>
              <a href="${data.searchUrl}" class="button">
                Book Now Before It's Gone!
              </a>
            </center>

            <p style="color: #6b7280; font-size: 14px;">
              <em>Note: Prices are subject to change and availability. Book soon for the best rates!</em>
            </p>

            <p>Happy travels!</p>
            <p>– The TrueDest Team</p>
          </div>
          <div class="footer">
            <p><a href="${process.env.NEXTAUTH_URL || 'https://truedest.com'}/dashboard/alerts">Manage Price Alerts</a></p>
            <p>© ${new Date().getFullYear()} TrueDest. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `

    return this.send({
      to: data.userEmail,
      subject: `🔔 Price Drop: ${route} - Save ${data.dropPercentage.toFixed(0)}%!`,
      html,
    })
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email: string, name: string, resetUrl: string): Promise<boolean> {
    const safeName = this.escapeHtml(name)
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1f2937; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .warning { background: #fef3c7; padding: 15px; border-radius: 6px; margin: 20px 0; color: #92400e; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          <div class="content">
            <p>Hi ${safeName},</p>
            <p>We received a request to reset your TrueDest account password. Click the button below to create a new password:</p>

            <center>
              <a href="${resetUrl}" class="button">
                Reset Password
              </a>
            </center>

            <div class="warning">
              <strong>⚠️ Important:</strong> This link expires in 1 hour. If you didn't request this reset, please ignore this email or contact support.
            </div>

            <p>For security, this link can only be used once.</p>

            <p>– The TrueDest Team</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} TrueDest. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `

    return this.send({
      to: email,
      subject: 'Reset Your TrueDest Password',
      html,
    })
  }

  /**
   * Convert HTML to plain text
   */
  private htmlToText(html: string): string {
    return html
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<[^>]+>/g, '')
      .replace(/\s+/g, ' ')
      .trim()
  }
}

// Export singleton instance
export const emailService = new EmailService()
