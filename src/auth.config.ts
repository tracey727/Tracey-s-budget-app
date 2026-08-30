import type { NextAuthConfig } from "next-auth";

// Provider-free subset of the NextAuth config, so this file never pulls in
// bcryptjs or Prisma. auth.ts spreads this in and adds the Credentials
// provider for Server Components, Server Actions and the NextAuth route.
export const authConfig = {
  // Auth.js only auto-trusts the incoming Host header on Vercel or
  // Cloudflare Pages (it checks for VERCEL/CF_PAGES env vars). This app
  // runs on Cloudflare Workers, which sets neither, so without this the
  // config fails validation on every request with a generic
  // "server configuration" error before ever reaching our callbacks.
  trustHost: true,
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
