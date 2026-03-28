import type { NextAuthConfig } from "next-auth";

// Edge-safe auth config (no Prisma, no Node.js-only modules)
export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
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
