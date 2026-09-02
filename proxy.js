import { NextResponse } from 'next/server';
import { COOKIE_NAME, verifySession } from '@/lib/auth';

export async function proxy(request) {
  const { pathname } = request.nextUrl;
  const cookie = request.cookies.get(COOKIE_NAME);
  const authed = await verifySession(cookie?.value);

  if (!authed) {
    // The email API sends real mail through real SMTP credentials, so it needs
    // the same gate as the dashboard. Matching only /admin left it open to
    // anyone who found the URL.
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/:path*'],
};
