import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

function redirectToLogin(req: NextRequest) {
  const url = req.nextUrl.clone();
  url.pathname = "/auth/login";
  url.searchParams.set(
    "callbackUrl",
    req.nextUrl.pathname + req.nextUrl.search
  );
  return NextResponse.redirect(url);
}

type AppToken = {
  role?: unknown;
  roles?: unknown;
  [k: string]: unknown;
};

function isSuperadminFromToken(tok: AppToken | null): boolean {
  if (!tok) return false;
  if (typeof tok.role === "string" && tok.role.toLowerCase() === "superadmin")
    return true;
  if (Array.isArray(tok.roles)) {
    return tok.roles.some(
      (r) => typeof r === "string" && r.toLowerCase() === "superadmin"
    );
  }
  return false;
}

export async function middleware(req: NextRequest) {
  try {
    const raw = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const token = (raw ?? null) as AppToken | null;
    const { pathname } = req.nextUrl;

    if (pathname.startsWith("/auth/login")) {
      if (token) {
        return NextResponse.redirect(new URL("/", req.url));
      }
      return NextResponse.next();
    }

    if (!token) {
      return redirectToLogin(req);
    }

    if (pathname.startsWith("/admin")) {
      if (!isSuperadminFromToken(token)) {
        return NextResponse.redirect(new URL("/", req.url));
      }
    }

    return NextResponse.next();
  } catch (err) {
    console.error("Middleware Error:", err);
    return redirectToLogin(req);
  }
}

export const config = {
  matcher: ["/:path", "/admin/:path*", "/auth/login"],
};