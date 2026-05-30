import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const path = request.nextUrl.pathname;

  // Nếu chưa đăng nhập mà đi vào các trang nội bộ (/staff, /profile hoặc /booking) thì chuyển hướng về /auth/login
  if ((path.startsWith('/staff') || path.startsWith('/profile') || path.startsWith('/booking')) && !token) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/staff/:path*', '/profile/:path*', '/booking/:path*'], // Chỉ áp dụng bảo vệ cho các route này
};
