import type { NextAuthConfig } from "next-auth";

// Provider-free subset of the NextAuth config, so this file never pulls in
// bcryptjs or Prisma. auth.ts spreads this in and adds the Credentials
// provider for Server Components, Server Actions and the NextAuth route.
export const authConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id as string;
        token.tier = (user as { tier?: string }).tier ?? "PERSONAL";
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.tier = token.tier as string;
      }
      return session;
    },
  },
} satisfies Omit<NextAuthConfig, "providers">;
