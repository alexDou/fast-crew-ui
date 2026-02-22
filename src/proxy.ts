import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import createMiddleware from "next-intl/middleware";

import { DEFAULT_LOCALE } from "@/constants/i18n";

import { routing } from "@/i18n/routing";
import { routesPrivate, routesPublic } from "@/lib/routes-book";

const handleI18nRouting = createMiddleware(routing);

const protectedRoutes: string[] = Object.values(routesPrivate);
const publicRoutes: string[] = Object.values(routesPublic);

export default async function proxy(request: NextRequest) {
  const response = handleI18nRouting(request);
  const cookieStore = await cookies();

  const rewriteUrl = request.url;
  const [, , ...rest] = new URL(rewriteUrl).pathname.split("/");
  const localeCookie = cookieStore.get("NEXT_LOCALE")?.value;
  const locale = localeCookie || DEFAULT_LOCALE;

  const pathWithoutLocale = `/${rest.join("/")}`;

  const isProtectedRoute = protectedRoutes.includes(pathWithoutLocale);
  const isPublicRoute = publicRoutes.includes(pathWithoutLocale);

  const accessToken = cookieStore.get("access_token")?.value;
  const isAuthenticated = !!accessToken;

  if (isProtectedRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL(`/${locale}/signin`, request.url));
  }

  if (isPublicRoute && isAuthenticated) {
    return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
  }

  return response;
}

export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)"
};
