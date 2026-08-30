import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validation";
import { authConfig } from "@/auth.config";

// Passing a config *function* (rather than a plain object) makes NextAuth
// resolve the config — including reading `process.env.AUTH_SECRET` — on
// each request instead of once at module load. That matters on Cloudflare
// Workers: top-level module code runs once at isolate startup, before any
// request's env bindings exist, so a plain-object config would permanently
// cache `secret: undefined`. See src/lib/prisma.ts for the same pattern.
export const { handlers, signIn, signOut, auth } = NextAuth(async () => ({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email.toLowerCase() },
        });
        if (!user) return null;

        const passwordValid = await bcrypt.compare(parsed.data.password, user.passwordHash);
        if (!passwordValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          tier: user.tier,
        };
      },
    }),
  ],
}));
