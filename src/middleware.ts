import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // Public routes that don't require authentication
    const publicRoutes = [
      '/auth/signin',
      '/auth/register',
      '/auth/forgot-password',
      '/auth/error'
    ];

    // Check if current path is public
    const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

    // If user is authenticated and trying to access auth pages, redirect to dashboard
    if (token && isPublicRoute) {
      return NextResponse.redirect(new URL('/', req.url));
    }

    // If user is not authenticated and trying to access protected routes
    if (!token && !isPublicRoute && pathname !== '/') {
      const signInUrl = new URL('/auth/signin', req.url);
      signInUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(signInUrl);
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        
        // Allow public routes
        const publicRoutes = [
          '/auth/signin',
          '/auth/register', 
          '/auth/forgot-password',
          '/auth/error'
        ];
        
        if (publicRoutes.some(route => pathname.startsWith(route))) {
          return true;
        }

        // Allow home page (it will handle auth internally)
        if (pathname === '/') {
          return true;
        }

        // Require authentication for all other routes
        return !!token;
      }
    }
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth.js routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, icons, etc.)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.).*)'
  ]
};
