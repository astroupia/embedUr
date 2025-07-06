import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define public routes that don't require authentication
const publicRoutes = ['/login', '/register', '/', '/about', '/pricing', '/contact'];

// Define auth routes that should redirect to dashboard if user is authenticated
const authRoutes = ['/login', '/register'];

// Define protected routes that require authentication
const protectedRoutes = ['/dashboard', '/settings', '/profile'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get tokens from cookies (we'll store them in cookies for middleware access)
  const accessToken = request.cookies.get('accessToken')?.value;
  const refreshToken = request.cookies.get('refreshToken')?.value;
  
  // Check if user is authenticated
  const isAuthenticated = !!(accessToken && refreshToken);
  
  // Handle auth routes (login, register)
  if (authRoutes.includes(pathname)) {
    if (isAuthenticated) {
      // User is authenticated, redirect to dashboard
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    // User is not authenticated, allow access to auth pages
    return NextResponse.next();
  }
  
  // Handle protected routes
  if (pathname.startsWith('/dashboard') || protectedRoutes.some(route => pathname.startsWith(route))) {
    if (!isAuthenticated) {
      // User is not authenticated, redirect to login
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    // User is authenticated, allow access to protected pages
    return NextResponse.next();
  }
  
  // For all other routes, allow access
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}; 