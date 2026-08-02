import { NextResponse } from 'next/server';

// Route yang tidak perlu login
const PUBLIC_ROUTES = ['/login'];

// Route yang hanya boleh diakses role ADMIN
const ADMIN_ONLY_ROUTES = ['/dashboard', '/students', '/predictions', '/reports', '/settings'];

// Route yang hanya boleh diakses role DOSEN
const DOSEN_ONLY_ROUTES = ['/dosen'];

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Ambil token & role dari cookie
  const token = request.cookies.get('token')?.value;
  const userRole = request.cookies.get('userRole')?.value;

  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));

  // 1. Jika user belum login dan mengakses route yang butuh auth → redirect ke /login
  if (!token && !isPublicRoute) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Jika user sudah login dan mencoba buka /login → redirect ke halaman yang sesuai rolenya
  if (token && isPublicRoute) {
    if (userRole === 'DOSEN') {
      return NextResponse.redirect(new URL('/dosen/dashboard', request.url));
    }
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // 3. Proteksi role: jika DOSEN mencoba akses route ADMIN
  if (token && userRole === 'DOSEN') {
    const isAdminRoute = ADMIN_ONLY_ROUTES.some((route) => pathname.startsWith(route));
    if (isAdminRoute) {
      return NextResponse.redirect(new URL('/dosen/dashboard', request.url));
    }
  }

  // 4. Proteksi role: jika ADMIN mencoba akses route DOSEN
  if (token && userRole === 'ADMIN') {
    const isDosenRoute = DOSEN_ONLY_ROUTES.some((route) => pathname.startsWith(route));
    if (isDosenRoute) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

// Terapkan middleware ke semua route kecuali file statis dan API Next.js internal
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
