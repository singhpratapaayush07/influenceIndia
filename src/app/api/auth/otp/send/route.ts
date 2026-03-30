import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { generateOtp, storeOtp, canRequestOtp, isQaEmail } from '@/lib/otp';
import { sendOtpEmail } from '@/lib/email';

const SendOtpSchema = z.object({
  email: z.string().email('Invalid email address'),
  purpose: z.enum(['signup', 'reset-password']),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = SendOtpSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email, purpose } = validation.data;
    const normalizedEmail = email.toLowerCase();

    // Check if QA email - bypass OTP
    if (isQaEmail(normalizedEmail)) {
      return NextResponse.json({
        success: true,
        skipOtp: true,
        message: 'QA email detected. OTP verification bypassed.',
      });
    }

    // Check rate limiting (3 OTPs per hour)
    const rateLimitCheck = await canRequestOtp(normalizedEmail);
    if (!rateLimitCheck.allowed) {
      return NextResponse.json(
        { error: rateLimitCheck.error },
        { status: 429 }
      );
    }

    // For signup: Check if user already exists
    if (purpose === 'signup') {
      const existingUser = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: 'An account with this email already exists. Please log in.' },
          { status: 400 }
        );
      }
    }

    // For reset-password: Check if user exists
    if (purpose === 'reset-password') {
      const user = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });

      if (!user) {
        return NextResponse.json(
          { error: 'No account found with this email address.' },
          { status: 404 }
        );
      }

      // Don't allow password reset for OAuth users
      if (user.authProvider) {
        return NextResponse.json(
          {
            error: `This account uses ${user.authProvider} sign-in. Password reset is not available.`,
          },
          { status: 400 }
        );
      }
    }

    // Generate and store OTP
    const otp = generateOtp();
    await storeOtp(normalizedEmail, otp, purpose);

    // Send OTP email
    const emailResult = await sendOtpEmail({
      email: normalizedEmail,
      otp,
      purpose,
    });

    if (!emailResult.success) {
      return NextResponse.json(
        { error: 'Failed to send OTP email. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully. Please check your email.',
      expiresIn: 600, // 10 minutes in seconds
    });
  } catch (error) {
    console.error('Error in OTP send endpoint:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
