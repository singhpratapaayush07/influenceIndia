import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyOtpFromDb, isQaEmail } from '@/lib/otp';

const VerifyOtpSchema = z.object({
  email: z.string().email('Invalid email address'),
  otp: z.string().length(6, 'OTP must be 6 digits'),
  purpose: z.enum(['signup', 'reset-password']),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = VerifyOtpSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email, otp, purpose } = validation.data;
    const normalizedEmail = email.toLowerCase();

    // Check if QA email - auto-verify
    if (isQaEmail(normalizedEmail)) {
      return NextResponse.json({
        success: true,
        verified: true,
        message: 'QA email auto-verified.',
      });
    }

    // Verify OTP
    const verificationResult = await verifyOtpFromDb(normalizedEmail, otp, purpose);

    if (!verificationResult.valid) {
      return NextResponse.json(
        { error: verificationResult.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      verified: true,
      message: 'OTP verified successfully.',
    });
  } catch (error) {
    console.error('Error in OTP verify endpoint:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
