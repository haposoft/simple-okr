import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// List of supported languages
const supportedLocales = ['en', 'vi', 'ja', 'de'];
const defaultLocale = 'en';

export function middleware(request: NextRequest) {
  // Get pathname from request
  const pathname = request.nextUrl.pathname;

  // Only redirect at root path to the default language (English)
  if (pathname === '/') {
    return NextResponse.redirect(new URL(`/${defaultLocale}`, request.url));
  }

  // Allow all other requests to pass through
  return NextResponse.next();
}

export const config = {
  // Define matcher for middleware
  matcher: [
    // Skip API routes
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 