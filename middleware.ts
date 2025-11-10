// middleware.ts
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

  // role: string
  if (typeof tok.role === "string" && tok.role.toLowerCase() === "superadmin") {
    return true;
  }

  // roles: string[]
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

    // proteksi hanya untuk /admin/*
    if (req.nextUrl.pathname.startsWith("/admin")) {
      if (!token) return redirectToLogin(req);
      if (!isSuperadminFromToken(token)) {
        // login ada, tapi bukan superadmin → lempar ke beranda
        return NextResponse.redirect(new URL("/", req.url));
      }
    }

    return NextResponse.next();
  } catch (err) {
    // token gagal di-parse → paksa login
    console.error(err);
    return redirectToLogin(req);
  }
}

export const config = {
  matcher: ["/admin/:path*"],
};