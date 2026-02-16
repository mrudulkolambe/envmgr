import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { APIRoutes } from '@/lib/route';
import { TOKEN_KEY } from '@/lib/token';

export async function proxy(request: NextRequest) {
    const token = request.cookies.get(TOKEN_KEY)?.value;
    const pathname = request.nextUrl.pathname;

    console.log('[Proxy] Request:', { pathname, hasToken: !!token });

    // Handle root path (login page) or /login separately to check for valid tokens
    if (pathname === '/' || pathname === '/login') {
        console.log('[Proxy] On login page');
        if (!token) {
            console.log('[Proxy] No token - allowing access to login');
            return NextResponse.next();
        }

        try {
            console.log('[Proxy] Token found on login page - validating');
            const baseURL = process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin;
            const url = `${baseURL}/api${APIRoutes.AUTH_ME}`;
            console.log(`[Proxy] Calling: ${url}`);

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                cache: 'no-store',
            });

            console.log(`[Proxy] Response status: ${response.status}`);

            if (response.status === 200) {
                console.log('[Proxy] Valid token - redirecting to dashboard');
                return NextResponse.redirect(new URL('/dashboard', request.url));
            } else {
                console.log('[Proxy] Invalid token on login page - clearing cookie');
                const res = NextResponse.next();
                res.cookies.delete(TOKEN_KEY);
                return res;
            }
        } catch (error) {
            console.error('Auth validation error:', error);
            return NextResponse.next();
        }
    }

    // Public routes that do not require auth
    const publicRoutes: string[] = [
        '/login',
        '/signup',
        '/forgot-password',
        '/reset-password',
    ];

    const isPublicRoute = publicRoutes.some((r) => pathname === r || pathname.startsWith(r + '/'));

    // If on a public route, allow access without any token checks
    if (isPublicRoute) {
        console.log('[Proxy] Public route - allowing access');
        return NextResponse.next();
    }

    console.log('[Proxy] Protected route');
    if (!token) {
        console.log('[Proxy] No token - redirecting to login');
        return NextResponse.redirect(new URL('/', request.url));
    }

    try {
        console.log('[Proxy] Validating token for protected route');
        const baseURL = process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin;
        const url = `${baseURL}/api${APIRoutes.AUTH_ME}`;

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            cache: 'no-store',
        });

        if (response.status !== 200) {
            console.log('[Proxy] Invalid token - clearing and redirecting to login');
            const res = NextResponse.redirect(new URL('/', request.url));
            res.cookies.delete(TOKEN_KEY);
            return res;
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
