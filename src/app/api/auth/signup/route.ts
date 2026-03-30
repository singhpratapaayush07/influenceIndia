import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { isQaEmail } from "@/lib/otp";

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  userType: z.enum(["brand", "influencer"]),
  otpVerified: z.boolean().default(false), // Must be true for non-QA emails
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = signupSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
    }

    const { email, password, userType, otpVerified } = parsed.data;
    const normalizedEmail = email.toLowerCase();

    // Check if email is already registered
    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    // Verify OTP was completed (unless QA email)
    if (!isQaEmail(normalizedEmail) && !otpVerified) {
      return NextResponse.json(
        { error: "Email verification required. Please verify your email first." },
        { status: 400 }
      );
    }

    // Hash password and create user
    const hashed = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        password: hashed,
        userType,
        emailVerified: true, // Mark as verified since OTP was completed
        authProvider: null,
      },
    });

    return NextResponse.json({ success: true, userId: user.id });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
