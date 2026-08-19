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
  const pathname = request.nextUrl.pathname;

  const isProtectedRoute = protectedRoutes.some(
    (route) =>
      pathname === route ||
      pathname.startsWith(`${route}/`)
  );

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  const authenticated = request.cookies.get(
    "marunthu_authenticated"
  )?.value;

  if (authenticated !== "true") {
    const loginUrl = new URL("/", request.url);

    loginUrl.searchParams.set(
      "error",
      "login_required"
    );

    return NextResponse.redirect(loginUrl);
  }

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
