import { NextRequestWithAuth, withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(request: NextRequestWithAuth) {
    const { pathname } = request.nextUrl;
    const token = request.nextauth.token;

    if (pathname === "/auth/signin" && token) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
  },
  {
    secret: process.env.NEXTAUTH_SECRET, 
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;
        if (
          pathname.startsWith("/auth/signin") ||
          pathname.startsWith("/api/auth")
        ) {
          return true;
        }
        return !!token;
      },
    },
  },
);

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};