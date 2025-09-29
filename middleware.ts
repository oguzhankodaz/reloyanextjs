/** @format */
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Tokenlar
  const userToken = req.cookies.get("usr_sess_x92h1")?.value;
  const companyToken = req.cookies.get("cmp_sess_z71f8")?.value;
  const staffToken = req.cookies.get("stf_sess_91kd2")?.value;

  // ✅ Public sayfalar
  const publicPaths = [
    "/",
    "/login",
    "/register",
    "/company/login",
    "/company/register",
    "/company/staff/login",
  ];

  // Public path kontrolü
  if (publicPaths.includes(pathname)) {
    // User login/register engeli
    if (pathname.startsWith("/login") || pathname.startsWith("/register")) {
      if (userToken) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    // Company login/register engeli
    if (
      pathname.startsWith("/company/login") ||
      pathname.startsWith("/company/register")
    ) {
      if (companyToken) {
        return NextResponse.redirect(new URL("/company/dashboard", req.url));
      }
    }

    // Staff login engeli
    if (pathname.startsWith("/company/staff/login")) {
      if (staffToken) {
        return NextResponse.redirect(
          new URL("/company/staff/dashboard", req.url)
        );
      }
    }

    return NextResponse.next();
  }

  // ✅ QR Result sayfası (hem staff hem company erişebilir)
  if (pathname.startsWith("/qr-result")) {
    if (!companyToken && !staffToken) {
      return NextResponse.redirect(new URL("/company/staff/login", req.url));
    }
    return NextResponse.next();
  }

  // ✅ Staff dashboard kontrolü (sadece personel paneli)
  // Şirket tarafındaki personel yönetimi sayfası (/company/staff) şirket token'ı ile korunur.
  if (pathname.startsWith("/company/staff/dashboard")) {
    if (!staffToken) {
      return NextResponse.redirect(new URL("/company/staff/login", req.url));
    }
    return NextResponse.next();
  }

  // ✅ Company path kontrolü
  if (pathname.startsWith("/company")) {
    if (!companyToken) {
      return NextResponse.redirect(new URL("/company/login", req.url));
    }
    return NextResponse.next();
  }

  // ✅ User dashboard kontrolü
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
    "/qr-result/:path*",
  ],
};
