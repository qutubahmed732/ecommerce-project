import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const session = request.cookies.get('session-token'); // Aapka auth cookie name
  const userRole = request.cookies.get('user-role')?.value; // Role cookie se uthayein

  const { pathname } = request.nextUrl;

  // Protect Admin Routes
  if (pathname.startsWith('/admin') && userRole !== 'ADMIN') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Protect Vendor Routes
  if (pathname.startsWith('/vendor-dashboard') && userRole !== 'VENDOR') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/vendor-dashboard/:path*', '/user-dashboard/:path*'],
};