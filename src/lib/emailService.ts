import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

// Email configuration from environment variables
const SMTP_HOST = process.env.SMTP_HOST || '';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587');
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';
const SMTP_FROM_EMAIL = process.env.SMTP_FROM_EMAIL || '';
const SMTP_FROM_NAME = process.env.SMTP_FROM_NAME || 'Gantavya Team';

// Create reusable transporter
let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465, // true for 465, false for other ports
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });
  }
  return transporter;
}

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send an email using nodemailer
 * @param options Email options (to, subject, html, text)
 * @returns Promise with success status and error message if failed
 */
export async function sendEmail(options: EmailOptions): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // Validate required environment variables
    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !SMTP_FROM_EMAIL) {
      console.error('Missing SMTP configuration in environment variables');
      return {
        success: false,
        error: 'Email service not configured. Please contact support.',
      };
    }

    const transport = getTransporter();

    // Send email
    const info = await transport.sendMail({
      from: `"${SMTP_FROM_NAME}" <${SMTP_FROM_EMAIL}>`,
      to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || '', // Fallback to empty string if not provided
    });

    console.log('Email sent successfully:', info.messageId);
    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send email',
    };
  }
}

// Email template types
export interface RegistrationEmailData {
  teamName: string;
  leaderName: string;
  leaderEmail: string;
  leaderPhone: string;
  college: string;
  members: Array<{
    name: string;
    email: string;
    phone: string;
  }>;
  events: Array<{
    name: string;
    price: number;
  }>;
  totalAmount: number;
  platformFee: number;
  gst: number;
  finalAmount: number;
  registrationId?: string;
}

export interface PaymentEmailData {
  teamName: string;
  leaderName: string;
  leaderEmail: string;
  registrationId: string;
  paymentId: string;
  orderId: string;
  amount: number;
  paymentDate: string;
  events: Array<{
    name: string;
    price: number;
  }>;
}

/**
 * Send registration confirmation email
 */
export async function sendRegistrationConfirmation(
  data: RegistrationEmailData
): Promise<{ success: boolean; error?: string }> {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Registration Confirmation</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">Registration Confirmed! 🎉</h1>
  </div>
  
  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
    <p style="font-size: 16px; margin-bottom: 20px;">Hi <strong>${data.leaderName}</strong>,</p>
    
    <p style="font-size: 16px; margin-bottom: 20px;">
      Thank you for registering for Gantavya! Your registration has been successfully received.
    </p>

    <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #667eea;">
      <h2 style="color: #667eea; margin-top: 0; font-size: 20px;">Team Details</h2>
      <p style="margin: 5px 0;"><strong>Team Name:</strong> ${data.teamName}</p>
      <p style="margin: 5px 0;"><strong>College:</strong> ${data.college}</p>
      <p style="margin: 5px 0;"><strong>Total Members:</strong> ${data.members.length + 1}</p>
      ${data.registrationId ? `<p style="margin: 5px 0;"><strong>Registration ID:</strong> ${data.registrationId}</p>` : ''}
    </div>

    <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #764ba2;">
      <h2 style="color: #764ba2; margin-top: 0; font-size: 20px;">Leader Details</h2>
      <p style="margin: 5px 0;"><strong>Name:</strong> ${data.leaderName}</p>
      <p style="margin: 5px 0;"><strong>Email:</strong> ${data.leaderEmail}</p>
      <p style="margin: 5px 0;"><strong>Phone:</strong> ${data.leaderPhone}</p>
    </div>

    ${data.members.length > 0 ? `
    <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #48bb78;">
      <h2 style="color: #48bb78; margin-top: 0; font-size: 20px;">Team Members</h2>
      ${data.members.map((member, index) => `
        <div style="margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #e2e8f0;">
          <p style="margin: 5px 0; font-weight: bold;">Member ${index + 1}</p>
          <p style="margin: 5px 0;"><strong>Name:</strong> ${member.name}</p>
          <p style="margin: 5px 0;"><strong>Email:</strong> ${member.email}</p>
          <p style="margin: 5px 0;"><strong>Phone:</strong> ${member.phone}</p>
        </div>
      `).join('')}
    </div>
    ` : ''}

    <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #f6ad55;">
      <h2 style="color: #f6ad55; margin-top: 0; font-size: 20px;">Selected Events</h2>
      ${data.events.map(event => `
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px; padding: 10px; background: #fafafa; border-radius: 4px;">
          <span>${event.name}</span>
          <span style="font-weight: bold;">₹${event.price}</span>
        </div>
      `).join('')}
      
      <div style="margin-top: 20px; padding-top: 20px; border-top: 2px solid #e2e8f0;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <span>Subtotal:</span>
          <span>₹${data.totalAmount.toFixed(2)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <span>Platform Fee (2%):</span>
          <span>₹${data.platformFee.toFixed(2)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <span>GST (18%):</span>
          <span>₹${data.gst.toFixed(2)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 18px; font-weight: bold; margin-top: 15px; padding-top: 15px; border-top: 2px solid #667eea; color: #667eea;">
          <span>Total Amount:</span>
          <span>₹${data.finalAmount.toFixed(2)}</span>
        </div>
      </div>
    </div>

    <div style="background: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
      <h3 style="margin-top: 0; color: #856404; font-size: 16px;">⏳ Next Steps</h3>
      <p style="margin: 5px 0; color: #856404;">
        Your registration is currently <strong>pending payment</strong>. Please complete the payment to confirm your spot in the events.
      </p>
    </div>

    <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0;">
      <h3 style="margin-top: 0; color: #333; font-size: 16px;">Need Help?</h3>
      <p style="margin: 5px 0;">
        If you have any questions or need assistance, feel free to contact us at 
        <a href="mailto:support@gantavya.com" style="color: #667eea; text-decoration: none;">support@gantavya.com</a>
      </p>
    </div>

    <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
      <p style="color: #666; font-size: 14px; margin: 0;">
        © ${new Date().getFullYear()} Gantavya. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
  `;

  const text = `
Registration Confirmation - Gantavya

Hi ${data.leaderName},

Thank you for registering for Gantavya! Your registration has been successfully received.

Team Details:
- Team Name: ${data.teamName}
- College: ${data.college}
- Total Members: ${data.members.length + 1}
${data.registrationId ? `- Registration ID: ${data.registrationId}` : ''}

Leader Details:
- Name: ${data.leaderName}
- Email: ${data.leaderEmail}
- Phone: ${data.leaderPhone}

Selected Events:
${data.events.map(event => `- ${event.name}: ₹${event.price}`).join('\n')}

Cost Breakdown:
- Subtotal: ₹${data.totalAmount.toFixed(2)}
- Platform Fee (2%): ₹${data.platformFee.toFixed(2)}
- GST (18%): ₹${data.gst.toFixed(2)}
- Total Amount: ₹${data.finalAmount.toFixed(2)}

Next Steps:
Your registration is currently pending payment. Please complete the payment to confirm your spot in the events.

Need help? Contact us at support@gantavya.com

© ${new Date().getFullYear()} Gantavya. All rights reserved.
  `;

  return sendEmail({
    to: data.leaderEmail,
    subject: `Registration Confirmed - ${data.teamName} | Gantavya`,
    html,
    text,
  });
}

/**
 * Send payment success email
 */
export async function sendPaymentConfirmation(
  data: PaymentEmailData
): Promise<{ success: boolean; error?: string }> {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Successful</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #48bb78 0%, #38a169 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">Payment Successful! ✅</h1>
  </div>
  
  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
    <p style="font-size: 16px; margin-bottom: 20px;">Hi <strong>${data.leaderName}</strong>,</p>
    
    <p style="font-size: 16px; margin-bottom: 20px;">
      Your payment has been successfully processed! Your team <strong>${data.teamName}</strong> is now registered for Gantavya.
    </p>

    <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #48bb78;">
      <h2 style="color: #48bb78; margin-top: 0; font-size: 20px;">Payment Receipt</h2>
      <p style="margin: 5px 0;"><strong>Payment ID:</strong> ${data.paymentId}</p>
      <p style="margin: 5px 0;"><strong>Order ID:</strong> ${data.orderId}</p>
      <p style="margin: 5px 0;"><strong>Registration ID:</strong> ${data.registrationId}</p>
      <p style="margin: 5px 0;"><strong>Date:</strong> ${data.paymentDate}</p>
      <p style="margin: 5px 0; font-size: 20px; color: #48bb78;"><strong>Amount Paid:</strong> ₹${data.amount.toFixed(2)}</p>
    </div>

    <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #667eea;">
      <h2 style="color: #667eea; margin-top: 0; font-size: 20px;">Registered Events</h2>
      ${data.events.map(event => `
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px; padding: 10px; background: #fafafa; border-radius: 4px;">
          <span>${event.name}</span>
          <span style="font-weight: bold;">₹${event.price}</span>
        </div>
      `).join('')}
    </div>

    <div style="background: #d4edda; border: 1px solid #28a745; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
      <h3 style="margin-top: 0; color: #155724; font-size: 16px;">✅ What's Next?</h3>
      <ul style="margin: 10px 0; padding-left: 20px; color: #155724;">
        <li>You will receive further updates via email</li>
        <li>Keep this email for your records</li>
        <li>Bring a valid ID card on the event day</li>
        <li>Check our website for event schedules and rules</li>
      </ul>
    </div>

    <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0;">
      <h3 style="margin-top: 0; color: #333; font-size: 16px;">Need Help?</h3>
      <p style="margin: 5px 0;">
        If you have any questions or need assistance, feel free to contact us at 
        <a href="mailto:support@gantavya.com" style="color: #667eea; text-decoration: none;">support@gantavya.com</a>
      </p>
    </div>

    <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
      <p style="color: #666; font-size: 14px; margin: 0;">
        © ${new Date().getFullYear()} Gantavya. All rights reserved.
      </p>
      <p style="color: #999; font-size: 12px; margin-top: 10px;">
        This is an automated email. Please do not reply to this message.
      </p>
    </div>
  </div>
</body>
</html>
  `;

  const text = `
Payment Successful - Gantavya

Hi ${data.leaderName},

Your payment has been successfully processed! Your team ${data.teamName} is now registered for Gantavya.

Payment Receipt:
- Payment ID: ${data.paymentId}
- Order ID: ${data.orderId}
- Registration ID: ${data.registrationId}
- Date: ${data.paymentDate}
- Amount Paid: ₹${data.amount.toFixed(2)}

Registered Events:
${data.events.map(event => `- ${event.name}: ₹${event.price}`).join('\n')}

What's Next?
- You will receive further updates via email
- Keep this email for your records
- Bring a valid ID card on the event day
- Check our website for event schedules and rules

Need help? Contact us at support@gantavya.com

© ${new Date().getFullYear()} Gantavya. All rights reserved.
  `;

  return sendEmail({
    to: data.leaderEmail,
    subject: `Payment Successful - ${data.teamName} | Gantavya`,
    html,
    text,
  });
}
