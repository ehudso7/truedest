# Privacy Features Documentation

TrueDest implements privacy features in compliance with GDPR (EU), CCPA (California), and other privacy regulations.

## Data Subject Rights

### 1. Right to Access (Data Export)

Users can export all their personal data in JSON format.

**API Endpoint:** `GET /api/user/privacy`

**Authentication:** Required

**Response:** JSON file download containing:
- User profile information
- Booking history
- Payment records (anonymized card details)
- Reviews
- Wishlist items
- Search history
- Notifications
- Price alerts
- Support tickets

**Example Usage:**
```javascript
const response = await fetch('/api/user/privacy', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const data = await response.json();
```

### 2. Right to Erasure (Account Deletion)

Users can permanently delete their account and anonymize their data.

**API Endpoint:** `DELETE /api/user/privacy`

**Authentication:** Required

**Request Body:**
```json
{
  "confirmEmail": "user@example.com",
  "reason": "Optional reason for deletion"
}
```

**What Gets Deleted:**
- ✅ User profile (anonymized to "Deleted User")
- ✅ Personal identifiable information (name, email, phone, etc.)
- ✅ OAuth account links
- ✅ Sessions
- ✅ Notifications
- ✅ Price alerts
- ✅ Wishlist
- ✅ Search history
- ✅ Reviews
- ✅ Support tickets and messages

**What Gets Retained (Anonymized):**
- 📋 Booking records (for business/legal requirements)
- 💳 Payment records (for financial compliance)

**Restrictions:**
- Cannot delete account with upcoming bookings
- Requires email confirmation

### 3. Async Data Export Request

For large data exports, users can request their data to be emailed.

**API Endpoint:** `POST /api/user/privacy`

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "message": "Your data export is being prepared..."
}
```

## Data Retention Policies

| Data Type | Retention Period | Notes |
|-----------|------------------|-------|
| User Profile | Until deletion | Anonymized on deletion |
| Booking Records | 7 years | Legal/financial requirement |
| Payment Records | 7 years | Financial compliance |
| Search History | 90 days | Auto-purged |
| Notifications | 30 days | After read |
| Session Data | 30 days | Auto-expiry |
| Price Alerts | Until expired/deleted | User controlled |

## Cookie Policy

TrueDest uses the following cookies:

| Cookie | Type | Purpose | Duration |
|--------|------|---------|----------|
| `next-auth.session-token` | Essential | Authentication | 30 days |
| `next-auth.csrf-token` | Essential | CSRF protection | Session |
| `_ph_*` | Analytics | PostHog analytics | 1 year |
| `_mx_*` | Analytics | Mixpanel analytics | 1 year |

Analytics cookies are only set with user consent (see feature flags).

## Data Processing

### Third-Party Services

| Service | Purpose | Data Shared | Privacy Policy |
|---------|---------|-------------|----------------|
| Stripe | Payments | Payment info | [Stripe Privacy](https://stripe.com/privacy) |
| Amadeus | Travel booking | Travel preferences | [Amadeus Privacy](https://amadeus.com/privacy) |
| SendGrid | Emails | Email address | [SendGrid Privacy](https://sendgrid.com/policies/privacy/) |
| Sentry | Error tracking | Error context | [Sentry Privacy](https://sentry.io/privacy/) |
| PostHog | Analytics | Usage data | [PostHog Privacy](https://posthog.com/privacy) |

### Data Encryption

- All data in transit: TLS 1.3
- Passwords: bcrypt with salt (12 rounds)
- Payment data: Handled by Stripe (PCI DSS compliant)
- Sensitive fields: Encrypted at rest in PostgreSQL

## User Controls

Users can manage their privacy settings at `/profile/privacy`:

1. **Email Preferences** - Control marketing and notification emails
2. **Analytics** - Opt out of analytics tracking
3. **Data Export** - Download personal data
4. **Account Deletion** - Permanently delete account

## Implementation Notes

### Environment Variables

```env
# Analytics (can be disabled)
ENABLE_ANALYTICS=true

# Error tracking (can be disabled)
ENABLE_ERROR_TRACKING=true
```

### Feature Flags

Privacy-related features can be controlled via feature flags:
- `ENABLE_ANALYTICS` - Enable/disable all analytics
- `ENABLE_ERROR_TRACKING` - Enable/disable error reporting

## Contact

For privacy-related inquiries:
- Email: privacy@truedest.com
- Data Protection Officer: dpo@truedest.com

## Changelog

| Date | Change |
|------|--------|
| 2025-11-28 | Initial privacy implementation |
