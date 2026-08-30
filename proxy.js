import { NextResponse } from 'next/server';

export function proxy(request) {
  // If the user is trying to access /admin
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const authCookie = request.cookies.get('outreach_auth');
    
    // Check if the secure cookie is missing or invalid
    if (!authCookie || authCookie.value !== 'authenticated') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
