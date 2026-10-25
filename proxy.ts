import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function destinationForRole(role: string | undefined) {
  if (role === "ADMIN") return "/admin";
  if (role === "VENDOR") return "/vendor-dashboard";
  if (role === "USER") return "/user-dashboard";
  return "/";
}

export function proxy(request: NextRequest) {
  const session = request.cookies.get("session-token")?.value;
  const role = request.cookies.get("user-role")?.value;
  const { pathname } = request.nextUrl;
  const isAuthPage = pathname === "/login" || pathname === "/register";

  if (isAuthPage && session && role) {
    return NextResponse.redirect(new URL(destinationForRole(role), request.url));
  }

  if (pathname.startsWith("/admin")) {
    if (session && role === "ADMIN") return NextResponse.next();
    return NextResponse.redirect(new URL(session ? destinationForRole(role) : "/login", request.url));
  }

  if (pathname.startsWith("/vendor-dashboard")) {
    if (session && role === "VENDOR") return NextResponse.next();
    return NextResponse.redirect(new URL(session ? destinationForRole(role) : "/login", request.url));
  }

  if (pathname.startsWith("/user-dashboard")) {
    if (session && role === "USER") return NextResponse.next();
    return NextResponse.redirect(new URL(session ? destinationForRole(role) : "/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/register", "/admin/:path*", "/vendor-dashboard/:path*", "/user-dashboard/:path*"],
};
