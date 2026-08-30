import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// Standard Prisma + Neon setup for Vercel's Node.js serverless runtime:
// DATABASE_URL is Neon's pooled (PgBouncer) connection string, which is
// Vercel's and Neon's own recommended integration pattern — no driver
// adapter needed outside edge/workers runtimes.
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
