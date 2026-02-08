import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import APIs from './lib/api';
import { AUTH_TOKEN_KEY } from './lib/constants/auth';

export async function proxy(request: NextRequest) {
    const token = request.cookies.get(AUTH_TOKEN_KEY)?.value;
    const pathname = request.nextUrl.pathname;

    console.log('[Proxy] Request:', { pathname, hasToken: !!token });

    // Handle root path (login page) separately to check for valid tokens
    if (request.nextUrl.pathname === '/') {
        console.log('[Proxy] On login page');
        if (!token) {
            console.log('[Proxy] No token - allowing access to login');
            return NextResponse.next();
        }

        try {
            console.log('[Proxy] Token found on login page - validating');
            const baseURL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
            console.log(`[Proxy] Calling: ${baseURL}${APIs.auth.me}`);
            console.log(`[Proxy] Token: ${token?.substring(0, 20)}...`);

            const response = await fetch(`${baseURL}${APIs.auth.me}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                cache: 'no-store',
            });

            console.log(`[Proxy] Response status: ${response.status}`);
            const responseText = await response.text();
            console.log(`[Proxy] Response body:`, responseText);

            if (response.status === 200) {
                const responseData = JSON.parse(responseText);
                const user = responseData.data;

                // Check if user needs to reset password (if field exists)
                if (user?.resetPassword) {
                    console.log('[Proxy] User needs to reset password - redirecting to change-password');
                    return NextResponse.redirect(new URL('/change-password', request.url));
                }

                console.log('[Proxy] Valid token - redirecting to dashboard');
                return NextResponse.redirect(new URL('/dashboard', request.url));
            } else {
                console.log('[Proxy] Invalid token on login page - clearing cookie');
                const res = NextResponse.next();
                res.cookies.delete(AUTH_TOKEN_KEY);
                return res;
            }
        } catch (error) {
            console.error('Auth validation error:', error);
            return NextResponse.next();
        }
    }

    // Public routes that do not require auth
    const publicRoutes: string[] = [
        '/',
        '/login',
        '/signup'
    ];

    const isPublicRoute = publicRoutes.some((r) => pathname === r || pathname.startsWith(r + '/'));

    // If on a public route, allow access without any token checks
    if (isPublicRoute) {
        console.log('[Proxy] Public route - allowing access');
        return NextResponse.next();
    }

    // Special handling for /change-password route
    if (pathname === '/change-password') {
        console.log('[Proxy] On change-password page');
        if (!token) {
            console.log('[Proxy] No token - redirecting to login');
            return NextResponse.redirect(new URL('/', request.url));
        }

        try {
            console.log('[Proxy] Validating token for change-password');
            const baseURL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
            const response = await fetch(`${baseURL}${APIs.auth.me}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                cache: 'no-store',
            });

            const responseText = await response.text();

            if (response.status !== 200) {
                console.log('[Proxy] Invalid token - redirecting to login');
                const res = NextResponse.redirect(new URL('/', request.url));
                res.cookies.delete(AUTH_TOKEN_KEY);
                return res;
            }

            const responseData = JSON.parse(responseText);
            const user = responseData.data;

            // Only allow access if resetPassword is true
            if (!user?.resetPassword) {
                console.log('[Proxy] resetPassword is false - redirecting to dashboard');
                return NextResponse.redirect(new URL('/dashboard', request.url));
            }

            console.log('[Proxy] resetPassword is true - allowing access to change-password');
            return NextResponse.next();
        } catch (error) {
            console.error('[Proxy] Error validating token for change-password:', error);
            return NextResponse.redirect(new URL('/', request.url));
        }
    }

    console.log('[Proxy] Protected route');
    if (!token) {
        console.log('[Proxy] No token - redirecting to login');
        return NextResponse.redirect(new URL('/', request.url));
    }

    try {
        console.log('[Proxy] Validating token for protected route');
        const baseURL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        console.log(`[Proxy] Calling: ${baseURL}${APIs.auth.me}`);
        console.log(`[Proxy] Token: ${token?.substring(0, 20)}...`);

        const response = await fetch(`${baseURL}${APIs.auth.me}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            cache: 'no-store',
        });

        console.log(`[Proxy] Response status: ${response.status}`);

        // Try to get response body for debugging
        const responseText = await response.text();
        console.log(`[Proxy] Response body:`, responseText);

        if (response.status !== 200) {
            console.log('[Proxy] Invalid token - clearing and redirecting to login');
            const res = NextResponse.redirect(new URL('/', request.url));
            res.cookies.delete(AUTH_TOKEN_KEY);
            return res;
        }

        // Check if user needs to reset password
        const responseData = JSON.parse(responseText);
        const user = responseData.data;
        if (user?.resetPassword && pathname !== '/change-password') {
            console.log('[Proxy] User needs to reset password - redirecting to change-password');
            return NextResponse.redirect(new URL('/change-password', request.url));
        }

        console.log('[Proxy] Valid token - allowing access to protected route');
        return NextResponse.next();

    } catch (error) {
        console.error('Auth validation error:', error);
        return NextResponse.redirect(new URL('/', request.url));
    }
}

export const config = {
    matcher: [
        '/((?!api|_next|static|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|bmp|tiff|tif)$).*)',
    ],
};
