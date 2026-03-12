import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const LOCALE_HEADER = "x-next-locale";

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const locale = pathname.startsWith("/hi") ? "hi" : "en";

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(LOCALE_HEADER, locale);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });
  response.cookies.set("NEXT_LOCALE", locale, { path: "/" });
  return response;
}
