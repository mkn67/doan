import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const path = request.nextUrl.pathname;

  // Nếu chưa đăng nhập mà mò vào /staff thì đá về /auth/login
  if (path.startsWith('/staff') && !token) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/staff/:path*', '/profile/:path*'], // Chỉ áp dụng bảo vệ cho các route này
};