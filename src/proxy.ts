import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default function proxy(request: NextRequest) {
  // Only check cookie or headers in middleware if we have strict SSR auth setup.
  // Since we rely strictly on Firebase client auth for MVP, we let AuthContext handle client-side kicks.
  // This proxy is mainly a placeholder to ensure the route /dashboard doesn't get statically crawled 
  // or that we can inject future server-side auth token checks before rendering the page.
  
  return NextResponse.next();
}

export const config = {
  matcher: "/dashboard/:path*",
};
