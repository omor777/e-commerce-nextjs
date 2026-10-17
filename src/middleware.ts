// middleware.ts
import { NextRequest, NextResponse } from "next/server";

const PROTECTED = ["/account"];

export function middleware(request: NextRequest) {
  const hasSession = request.cookies.has("better-auth.session_token");
  if (
    PROTECTED.some((p) => request.nextUrl.pathname.startsWith(p)) &&
    !hasSession
  ) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/account/:path*"],
};

// ? Don't put database calls in middleware — that's the one thing to avoid .