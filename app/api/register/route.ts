// app/api/register/route.ts
import { NextResponse } from "next/server";
import { env } from "@/lib/env"; // pastikan env.API_BASE_URL sudah ada, contoh: "https://api.example.com/"

export async function POST(req: Request) {
  try {
    const payload = await req.json();

    const upstream = await fetch(`${env.API_BASE_URL}register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
      // cache: "no-store" // optional
    });

    // coba parse JSON dari backend; kalau gagal, teruskan apa adanya sebagai text
    const contentType = upstream.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const data = await upstream.json();
      return NextResponse.json(data, { status: upstream.status });
    } else {
      const text = await upstream.text();
      return new NextResponse(text, {
        status: upstream.status,
        headers: { "content-type": contentType || "text/plain" },
      });
    }
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Gagal memproses permintaan.";
    return NextResponse.json({ message }, { status: 500 });
  }
}