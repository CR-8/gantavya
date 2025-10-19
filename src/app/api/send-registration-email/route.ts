import { NextRequest, NextResponse } from 'next/server';
import {
  sendRegistrationConfirmation,
  type RegistrationEmailData,
} from '@/lib/emailService';

export async function POST(request: NextRequest) {
  try {
    const body: RegistrationEmailData = await request.json();

    // Validate required fields
    if (
      !body.teamName ||
      !body.leaderName ||
      !body.leaderEmail ||
      !body.leaderPhone ||
      !body.college ||
      !body.events ||
      body.events.length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields for registration email',
        },
        { status: 400 }
      );
    }

    // Send registration confirmation email
    const result = await sendRegistrationConfirmation(body);

    if (!result.success) {
      console.error('Failed to send registration email:', result.error);
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Failed to send registration confirmation email',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Registration confirmation email sent successfully',
    });
  } catch (error) {
    console.error('Error in send-registration-email route:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send email',
      },
      { status: 500 }
    );
  }
}
