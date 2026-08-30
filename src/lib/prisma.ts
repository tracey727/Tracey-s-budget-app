import { PrismaClient } from "@prisma/client";
import { PrismaNeonHTTP } from "@prisma/adapter-neon";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// Cloudflare Workers has no raw TCP/WebSocket sockets, so Prisma talks to
// Neon over plain HTTPS (one request per query) via Neon's serverless HTTP
// driver. Trade-off: no interactive `$transaction` — see
// onboarding/actions.ts, which is written as sequential writes instead.
const adapter = new PrismaNeonHTTP(process.env.DATABASE_URL!, {});

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
