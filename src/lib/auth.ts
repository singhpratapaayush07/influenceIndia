import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
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
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.userType = (user as any).userType;
        token.onboardingComplete = (user as any).onboardingComplete;
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
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;

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
