import type { NextAuthConfig } from "next-auth";
import { SignJWT, jwtVerify } from "jose";

function getKey(secret: string) {
  return new TextEncoder().encode(secret);
}

// Edge-safe auth config (no Prisma, no Node.js-only modules)
export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  // Use signed HS256 JWT (not encrypted) so middleware can decode it without jose decrypt
  jwt: {
    async encode({ secret, token, maxAge }) {
      return new SignJWT(token as Record<string, unknown>)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime(maxAge ? `${maxAge}s` : "30d")
        .sign(getKey(secret as string));
    },
    async decode({ secret, token }) {
      if (!token) return null;
      try {
        const { payload } = await jwtVerify(token, getKey(secret as string));
        return payload;
      } catch {
        return null;
      }
    },
  },
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.userType = (user as any).userType;
        token.onboardingComplete = (user as any).onboardingComplete;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        (session.user as any).userType = token.userType;
        (session.user as any).onboardingComplete = token.onboardingComplete;
      }
      return session;
    },
  },
};
