import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Public sayfalar
  const publicPaths = [
    "/",
    "/login",
    "/register",
    "/company/login",
    "/company/register",
  ];

  const userToken = req.cookies.get("session")?.value;
  const companyToken = req.cookies.get("company_session")?.value;

  // ✅ Eğer public path'teyiz
  if (publicPaths.includes(pathname)) {
    // User token varsa login'e girmesin → dashboard'a yönlendir
    if (pathname.startsWith("/login") || pathname.startsWith("/register")) {
      if (userToken) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
      if (companyToken) {
        return NextResponse.redirect(new URL("/company/dashboard", req.url));
      }
    }
    return NextResponse.next();
  }

  // ✅ Private path kontrolleri
  if (pathname.startsWith("/company")) {
    if (!companyToken) {
      return NextResponse.redirect(new URL("/company/login", req.url));
    }
  }

  if (pathname.startsWith("/dashboard")) {
    if (!userToken) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/register",
    "/dashboard/:path*",
    "/company/:path*",
  ],
};
