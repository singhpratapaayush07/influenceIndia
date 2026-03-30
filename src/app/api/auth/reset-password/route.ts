import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

const ResetPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  otpVerified: z.boolean(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = ResetPasswordSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email, newPassword, otpVerified } = validation.data;
    const normalizedEmail = email.toLowerCase();

    // Verify OTP was completed
    if (!otpVerified) {
      return NextResponse.json(
        { error: 'OTP verification required before resetting password.' },
        { status: 400 }
      );
    }

    // Find user
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

    // Hash new password and update
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully. You can now log in with your new password.',
    });
  } catch (error) {
    console.error('Error in password reset endpoint:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
