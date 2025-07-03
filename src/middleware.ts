import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { withAuth } from 'next-auth/middleware';

export default withAuth(
  function middleware(req: NextRequest) {
    const isProduction = process.env.NODE_ENV === 'production' && 
                        !req.headers.get('x-vercel-deployment-url')?.includes('preview');
    
    // If in production and not the landing page, redirect to maintenance
    if (isProduction && req.nextUrl.pathname !== '/' && 
        !req.nextUrl.pathname.startsWith('/_next') && 
        !req.nextUrl.pathname.startsWith('/api') &&
        !req.nextUrl.pathname.startsWith('/static') &&
        req.nextUrl.pathname !== '/maintenance' &&
        req.nextUrl.pathname !== '/favicon.ico') {
      
      return NextResponse.rewrite(new URL('/maintenance', req.url));
    }

    return NextResponse.next();
  },
  {
    pages: {
      signIn: '/login',
    },
  }
);

export const config = {
  matcher: [
    '/((?!_next|static|favicon.ico).*)',
  ],
};
