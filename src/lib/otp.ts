import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

/**
 * Generate a 6-digit OTP
 */
export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Hash an OTP for secure storage
 */
export async function hashOtp(otp: string): Promise<string> {
  return bcrypt.hash(otp, 10);
}

/**
 * Verify an OTP against its hash
 */
export async function verifyOtp(otp: string, hashedOtp: string): Promise<boolean> {
  return bcrypt.compare(otp, hashedOtp);
}

/**
 * Check if email is a QA email (@qa.com)
 */
export function isQaEmail(email: string): boolean {
  return email.toLowerCase().endsWith('@qa.com');
}

/**
 * Store OTP in database
 */
export async function storeOtp(
  email: string,
  otp: string,
  purpose: 'signup' | 'reset-password'
): Promise<void> {
  const hashedOtp = await hashOtp(otp);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Delete any existing OTPs for this email and purpose
  await prisma.otpVerification.deleteMany({
    where: {
      email: email.toLowerCase(),
      purpose,
    },
  });

  // Store new OTP
  await prisma.otpVerification.create({
    data: {
      email: email.toLowerCase(),
      otp: hashedOtp,
      purpose,
      expiresAt,
    },
  });
}

/**
 * Verify OTP from database
 */
export async function verifyOtpFromDb(
  email: string,
  otp: string,
  purpose: 'signup' | 'reset-password'
): Promise<{ valid: boolean; error?: string }> {
  const otpRecord = await prisma.otpVerification.findFirst({
    where: {
      email: email.toLowerCase(),
      purpose,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  if (!otpRecord) {
    return { valid: false, error: 'No OTP found. Please request a new one.' };
  }

  // Check expiration
  if (new Date() > otpRecord.expiresAt) {
    await prisma.otpVerification.delete({ where: { id: otpRecord.id } });
    return { valid: false, error: 'OTP has expired. Please request a new one.' };
  }

  // Check attempts (max 5)
  if (otpRecord.attempts >= 5) {
    await prisma.otpVerification.delete({ where: { id: otpRecord.id } });
    return { valid: false, error: 'Too many attempts. Please request a new OTP.' };
  }

  // Verify OTP
  const isValid = await verifyOtp(otp, otpRecord.otp);

  if (!isValid) {
    // Increment attempts
    await prisma.otpVerification.update({
      where: { id: otpRecord.id },
      data: { attempts: otpRecord.attempts + 1 },
    });
    return { valid: false, error: 'Invalid OTP. Please try again.' };
  }

  // Valid OTP - delete it (single use)
  await prisma.otpVerification.delete({ where: { id: otpRecord.id } });

  return { valid: true };
}

/**
 * Rate limiting: Check if user can request OTP (max 3 per hour)
 */
export async function canRequestOtp(email: string): Promise<{ allowed: boolean; error?: string }> {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

  const recentOtps = await prisma.otpVerification.findMany({
    where: {
      email: email.toLowerCase(),
      createdAt: {
        gte: oneHourAgo,
      },
    },
  });

  if (recentOtps.length >= 3) {
    return {
      allowed: false,
      error: 'Too many OTP requests. Please try again in an hour.',
    };
  }

  return { allowed: true };
}

/**
 * Clean up expired OTPs (can be run as a cron job)
 */
export async function cleanupExpiredOtps(): Promise<number> {
  const result = await prisma.otpVerification.deleteMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
  });

  return result.count;
}
