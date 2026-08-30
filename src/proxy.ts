import { NextResponse } from "next/server";
import { auth } from "@/auth";

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

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));

  if (isProtected && !req.auth) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|manifest.json|icons).*)"],
};
