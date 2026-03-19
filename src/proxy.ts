import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  // Middleware csak route matching-et végez
  // Az auth ellenőrzés a layout-okban történik
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/cards/:path*",
    "/referrals/:path*",
    "/add-money/:path*",
    "/payments/:path*",
    "/transactions/:path*",
    "/settings/:path*",
    "/admin/:path*",
  ],
};
