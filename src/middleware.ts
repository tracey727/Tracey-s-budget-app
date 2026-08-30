import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Reads the session JWT directly rather than instantiating NextAuth — the
// documented edge-safe pattern, since it never touches providers
// (bcryptjs/Prisma) and keeps this middleware Workers-compatible.
const PROTECTED_PREFIXES = [
  "/onboarding",
  "/home",
  "/accounts",
  "/bills",
  "/transactions",
  "/spending",
  "/subscriptions",
  "/forecast",
  "/goals",
  "/recovery",
  "/reports",
  "/settings",
];

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));

  if (isProtected) {
    const token = await getToken({ req, secret: process.env.AUTH_SECRET });
    if (!token) {
      const loginUrl = new URL("/login", req.nextUrl.origin);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|manifest.json|icons).*)"],
};
