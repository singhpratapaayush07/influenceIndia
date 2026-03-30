import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { authConfig } from "@/lib/auth.config";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account }) {
      // Handle OAuth sign-in (Google)
      if (account?.provider === "google") {
        if (!user.email) return false;

        const existingUser = await prisma.user.findUnique({
          where: { email: user.email.toLowerCase() },
        });

        // If user doesn't exist, they need to sign up first (redirect to signup to choose user type)
        if (!existingUser) {
          // Store email in session for signup flow
          return `/signup?email=${encodeURIComponent(user.email)}&provider=google`;
        }

        // User exists - allow sign in
        return true;
      }

      return true;
    },
    async jwt({ token, user, trigger, session, account }) {
      if (user) {
        token.id = user.id;
        token.userType = (user as any).userType;
        token.onboardingComplete = (user as any).onboardingComplete;
      }

      // Handle Google OAuth - fetch user data
      if (account?.provider === "google" && user.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email.toLowerCase() },
          select: { id: true, userType: true, onboardingComplete: true },
        });
        if (dbUser) {
          token.id = dbUser.id;
          token.userType = dbUser.userType;
          token.onboardingComplete = dbUser.onboardingComplete;
        }
      }

      if (trigger === "update") {
        // If caller passed data directly, use it (fast path — no DB round trip)
        if (session?.onboardingComplete !== undefined) {
          token.onboardingComplete = session.onboardingComplete;
        } else if (token.id) {
          // Fallback: re-fetch from DB
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: { onboardingComplete: true, userType: true },
          });
          if (dbUser) {
            token.onboardingComplete = dbUser.onboardingComplete;
            token.userType = dbUser.userType;
          }
        }
      }
      return token;
    },
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;
        const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
        if (!user) return null;

        // Check if user has password (not OAuth only)
        if (!user.password) {
          return null;
        }

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          userType: user.userType,
          onboardingComplete: user.onboardingComplete,
        };
      },
    }),
  ],
});
