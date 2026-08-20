import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedRoutes = [
  "/dashboard",
  "/medicine-stock",
  "/stock",
  "/bill-ocr",
  "/ai-forecast",
  "/alerts",
  "/indent",
  "/dho-dashboard",
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ==========================================
  // CHECK WHETHER ROUTE IS PROTECTED
  // ==========================================

  const isProtectedRoute = protectedRoutes.some(
    (route) =>
      pathname === route ||
      pathname.startsWith(`${route}/`)
  );

  // Public route
  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  // ==========================================
  // READ AUTH COOKIE
  // ==========================================

  const authCookie = request.cookies.get(
    "marunthu_authenticated"
  );

  const authenticated =
    authCookie?.value === "true";

  // ==========================================
  // NOT AUTHENTICATED
  // ==========================================

  if (!authenticated) {
    const loginUrl = new URL(
      "/",
      request.url
    );

    loginUrl.searchParams.set(
      "error",
      "login_required"
    );

    return NextResponse.redirect(
      loginUrl
    );
  }

  // ==========================================
  // AUTHENTICATED
  // ==========================================

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/medicine-stock/:path*",
    "/stock/:path*",
    "/bill-ocr/:path*",
    "/ai-forecast/:path*",
    "/alerts/:path*",
    "/indent/:path*",
    "/dho-dashboard/:path*",
  ],
};