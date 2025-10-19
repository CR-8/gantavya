# Email Service Setup Guide

This guide will help you configure the email notification system for Gantavya using Nodemailer.

## 📧 Email Service Overview

The email service sends automated notifications for:
1. **Registration Confirmation** - Sent immediately after registration form submission
2. **Payment Success** - Sent after successful payment verification

## 🔧 Setup Instructions

### 1. Choose an SMTP Provider

You can use any SMTP service. Here are some popular options:

#### Option A: Gmail (Recommended for Testing)

1. Enable 2-Factor Authentication on your Google Account
2. Generate an App Password:
   - Go to [Google Account Settings](https://myaccount.google.com/)
   - Security → 2-Step Verification → App passwords
   - Select "Mail" and your device
   - Copy the generated 16-character password

**Environment Variables:**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_16_char_app_password
SMTP_FROM_EMAIL=your_email@gmail.com
SMTP_FROM_NAME=Gantavya Team
```

**Limitations:**
- Daily sending limit: ~500 emails/day
- Not recommended for production

#### Option B: SendGrid (Recommended for Production)

1. Sign up at [SendGrid](https://sendgrid.com/)
2. Verify your sender identity (email or domain)
3. Create an API Key (Settings → API Keys)

**Environment Variables:**
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your_sendgrid_api_key
SMTP_FROM_EMAIL=noreply@yourdomain.com
SMTP_FROM_NAME=Gantavya Team
```

**Benefits:**
- Free tier: 100 emails/day
- Paid plans: Up to 100k emails/month
- Excellent deliverability
- Email analytics

#### Option C: Mailgun

1. Sign up at [Mailgun](https://www.mailgun.com/)
2. Add and verify your domain
3. Get SMTP credentials from Domain Settings

**Environment Variables:**
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@yourdomain.com
SMTP_PASS=your_mailgun_password
SMTP_FROM_EMAIL=noreply@yourdomain.com
SMTP_FROM_NAME=Gantavya Team
```

#### Option D: AWS SES (Best for High Volume)

1. Set up AWS SES in your region
2. Verify your domain or email
3. Create SMTP credentials (IAM user)

**Environment Variables:**
```env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=your_aws_smtp_username
SMTP_PASS=your_aws_smtp_password
SMTP_FROM_EMAIL=noreply@yourdomain.com
SMTP_FROM_NAME=Gantavya Team
```

### 2. Configure Environment Variables

1. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Add your SMTP credentials:
   ```env
   SMTP_HOST=your_smtp_host
   SMTP_PORT=587
   SMTP_USER=your_smtp_user
   SMTP_PASS=your_smtp_password
   SMTP_FROM_EMAIL=your_from_email
   SMTP_FROM_NAME=Gantavya Team
   ```

3. Restart your development server:
   ```bash
   npm run dev
   ```

### 3. Test the Email Service

Create a test API route or use the existing email functions:

```typescript
// Example: Test in API route
import { sendEmail } from '@/lib/emailService';

export async function GET() {
  const result = await sendEmail({
    to: 'test@example.com',
    subject: 'Test Email',
    html: '<h1>Hello from Gantavya!</h1>',
    text: 'Hello from Gantavya!',
  });

  return Response.json(result);
}
```

## 📝 Email Templates

### Registration Confirmation Email

**Trigger:** Sent immediately after form submission (before payment)

**Contents:**
- Team details (name, college, members)
- Leader information
- Selected events with prices
- Cost breakdown (subtotal, platform fee, GST, total)
- Next steps (payment pending notice)
- Support contact information

**Usage:**
```typescript
import { sendRegistrationConfirmation } from '@/lib/emailService';

const result = await sendRegistrationConfirmation({
  teamName: 'Team Awesome',
  leaderName: 'John Doe',
  leaderEmail: 'john@example.com',
  leaderPhone: '+91 9876543210',
  college: 'ABC University',
  members: [
    { name: 'Jane Doe', email: 'jane@example.com', phone: '+91 9876543211' }
  ],
  events: [
    { name: 'Coding Competition', price: 500 },
    { name: 'Hackathon', price: 1000 }
  ],
  totalAmount: 1500,
  platformFee: 30,
  gst: 275.4,
  finalAmount: 1805.40,
  registrationId: 'REG123456',
});
```

### Payment Success Email

**Trigger:** Sent after successful payment verification

**Contents:**
- Payment receipt (Payment ID, Order ID, Registration ID, Date)
- Amount paid
- Registered events
- What's next (instructions, ID requirements, schedules)
- Support contact information

**Usage:**
```typescript
import { sendPaymentConfirmation } from '@/lib/emailService';

const result = await sendPaymentConfirmation({
  teamName: 'Team Awesome',
  leaderName: 'John Doe',
  registrationId: 'REG123456',
  paymentId: 'pay_XXXXXXXXX',
  orderId: 'order_XXXXXXXXX',
  amount: 1805.40,
  paymentDate: '2024-01-15 10:30 AM',
  events: [
    { name: 'Coding Competition', price: 500 },
    { name: 'Hackathon', price: 1000 }
  ],
});
```

## 🔄 Integration with Registration Flow

### Step 1: Send Registration Confirmation

Add to your form submission handler after successful registration:

```typescript
// In form.tsx - After submitRegistration() succeeds
const emailResult = await fetch('/api/send-registration-email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    teamName: formData.teamName,
    leaderName: formData.leaderName,
    leaderEmail: formData.leaderEmail,
    leaderPhone: formData.leaderPhone,
    college: formData.college,
    members: formData.members,
    events: selectedEvents,
    totalAmount,
    platformFee,
    gst,
    finalAmount,
    registrationId: result.registrationId,
  }),
});
```

### Step 2: Send Payment Success Email

Add to your payment verification route:

```typescript
// In /api/razorpay/verify-payment/route.ts
import { sendPaymentConfirmation } from '@/lib/emailService';

// After payment is verified and registration status is updated
const emailResult = await sendPaymentConfirmation({
  teamName: registration.team_name,
  leaderName: leader.name,
  registrationId: registration.id,
  paymentId: razorpay_payment_id,
  orderId: razorpay_order_id,
  amount: registration.total_amount,
  paymentDate: new Date().toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }),
  events: registration.events,
});
```

## 🛠️ Troubleshooting

### Emails Not Sending

1. **Check environment variables:**
   ```bash
   # In terminal
   echo $SMTP_HOST
   echo $SMTP_USER
   ```

2. **Verify SMTP credentials:**
   - Try logging into your email provider
   - Regenerate app password if using Gmail
   - Check API key validity for SendGrid/Mailgun

3. **Check server logs:**
   ```bash
   # Look for error messages in terminal
   npm run dev
   ```

4. **Test SMTP connection:**
   - Use online SMTP testing tools
   - Verify port (587 for TLS, 465 for SSL)

### Emails Going to Spam

1. **Add SPF records to your domain:**
   ```
   v=spf1 include:_spf.google.com ~all
   ```

2. **Add DKIM records** (provided by your email service)

3. **Set up DMARC policy:**
   ```
   v=DMARC1; p=none; rua=mailto:dmarc@yourdomain.com
   ```

4. **Use a verified domain** instead of generic email addresses

5. **Avoid spam trigger words** in subject lines

### Gmail App Password Issues

1. **Ensure 2FA is enabled** on your Google Account
2. **Use the full 16-character password** without spaces
3. **Check for "Less secure app access"** (should be disabled when using app passwords)
4. **Try generating a new app password**

### Rate Limiting

**Gmail:**
- Limit: ~500 emails/day
- Solution: Switch to SendGrid/Mailgun for production

**SendGrid Free Tier:**
- Limit: 100 emails/day
- Solution: Upgrade to paid plan

**Solution for high volume:**
- Implement email queue (Bull, BullMQ)
- Use batch sending
- Implement retry logic with exponential backoff

## 📊 Email Analytics

### Track Email Delivery

Most providers offer analytics:

**SendGrid:**
- Dashboard → Activity → Email Activity
- See opens, clicks, bounces, spam reports

**Mailgun:**
- Logs → Events
- Real-time delivery tracking

**Custom Tracking:**
Add tracking pixels or UTM parameters to links:
```html
<img src="https://yourdomain.com/track/open?id=registration_123" width="1" height="1" />
<a href="https://yourdomain.com/event?utm_source=email&utm_campaign=registration">View Events</a>
```

## 🔒 Security Best Practices

1. **Never commit `.env.local`** to version control
2. **Use app passwords**, not account passwords
3. **Rotate SMTP credentials** regularly
4. **Implement rate limiting** to prevent abuse
5. **Validate email addresses** before sending
6. **Use environment variables** for all sensitive data
7. **Log email sending errors** but not sensitive data

## 🚀 Production Recommendations

1. **Use a professional email service** (SendGrid, Mailgun, AWS SES)
2. **Set up domain authentication** (SPF, DKIM, DMARC)
3. **Implement email queue** for better performance
4. **Add retry logic** for failed sends
5. **Monitor email delivery rates**
6. **Set up bounce and complaint handling**
7. **Use transactional email templates** from your provider

## 📚 Additional Resources

- [Nodemailer Documentation](https://nodemailer.com/)
- [SendGrid Node.js Guide](https://docs.sendgrid.com/for-developers/sending-email/nodejs)
- [Gmail App Passwords](https://support.google.com/accounts/answer/185833)
- [Email Deliverability Best Practices](https://sendgrid.com/blog/email-deliverability-best-practices/)

## ✅ Quick Checklist

- [ ] Choose SMTP provider (Gmail for testing, SendGrid for production)
- [ ] Set up account and get SMTP credentials
- [ ] Add credentials to `.env.local`
- [ ] Test email sending with a simple test
- [ ] Integrate registration confirmation email
- [ ] Integrate payment success email
- [ ] Set up domain authentication (for production)
- [ ] Monitor email delivery and handle bounces
- [ ] Implement retry logic for failed sends
