import { NextRequest, NextResponse } from 'next/server';
import {
  sendPaymentConfirmation,
  type PaymentEmailData,
} from '@/lib/emailService';

export async function POST(request: NextRequest) {
  try {
    const body: PaymentEmailData = await request.json();

    // Validate required fields
    if (
      !body.teamName ||
      !body.leaderName ||
      !body.registrationId ||
      !body.paymentId ||
      !body.orderId ||
      !body.amount ||
      !body.events ||
      body.events.length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields for payment email',
        },
        { status: 400 }
      );
    }

    // Send payment confirmation email
    const result = await sendPaymentConfirmation(body);

    if (!result.success) {
      console.error('Failed to send payment email:', result.error);
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Failed to send payment confirmation email',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Payment confirmation email sent successfully',
    });
  } catch (error) {
    console.error('Error in send-payment-email route:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send email',
      },
      { status: 500 }
    );
  }
}
