import { PrismaClient } from "@prisma/client";
import { PrismaNeonHTTP } from "@prisma/adapter-neon";
import { getCloudflareContext } from "@opennextjs/cloudflare";

// Cloudflare Workers has no raw TCP/WebSocket sockets, so Prisma talks to
// Neon over plain HTTPS (one request per query) via Neon's serverless HTTP
// driver. Trade-off: no interactive `$transaction` — see
// onboarding/actions.ts, which is written as sequential writes instead.
//
// The Worker's env bindings (DATABASE_URL included) only exist inside a
// request's execution context — they are NOT on `process.env` at module
// top-level, because Cloudflare evaluates top-level module code once at
// isolate startup, before any request (and its env) exists. So the client
// must be built lazily, on first real use inside a request, not as a
// top-level `const`.
let prismaSingleton: PrismaClient | undefined;

function getDatabaseUrl(): string {
  // Local `next dev` / `next build` populate process.env from .env directly;
  // only the deployed Worker needs the Cloudflare context lookup.
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;

  try {
    const env = getCloudflareContext().env as unknown as { DATABASE_URL?: string };
    if (env.DATABASE_URL) return env.DATABASE_URL;
  } catch {
    // getCloudflareContext throws outside of a Workers request context
    // (e.g. during `next build`'s static analysis) — fall through.
  }

  throw new Error("DATABASE_URL is not set. Configure it as a Cloudflare Worker variable/secret.");
}

function createPrismaClient(): PrismaClient {
  const adapter = new PrismaNeonHTTP(getDatabaseUrl(), {});
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

function getPrisma(): PrismaClient {
  if (!prismaSingleton) prismaSingleton = createPrismaClient();
  return prismaSingleton;
}

// A Proxy so every existing `import { prisma } from "@/lib/prisma"` call
// site keeps working unchanged, while the real client is only constructed
// the first time a property (e.g. `prisma.user`) is actually accessed
// during request handling.
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    return Reflect.get(getPrisma() as object, prop, receiver);
  },
});
