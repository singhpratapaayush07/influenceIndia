import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const SignupOAuthSchema = z.object({
  email: z.string().email('Invalid email address'),
  userType: z.enum(['brand', 'influencer']),
  provider: z.enum(['google']),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = SignupOAuthSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email, userType, provider } = validation.data;
    const normalizedEmail = email.toLowerCase();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists.' },
        { status: 400 }
      );
    }

    // Create user with OAuth provider
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        password: null, // No password for OAuth users
        userType,
        emailVerified: true, // OAuth emails are pre-verified
        authProvider: provider,
      },
    });

    return NextResponse.json({
      success: true,
      userId: user.id,
      message: 'Account created successfully. Please complete your profile.',
    });
  } catch (error) {
    console.error('Error in OAuth signup endpoint:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
