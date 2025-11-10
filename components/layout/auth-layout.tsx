"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

type AuthShellProps = {
  images: string[];
  title?: string;
  brand?: string;
  children: React.ReactNode;
  slideIntervalMs?: number; // default 3000
};

export default function AuthShell({
  images,
  title = "Kios Tetta",
  brand = "Kios Tetta",
  children,
  slideIntervalMs = 3000,
}: AuthShellProps) {
  const safeImages = useMemo(
    () => images.filter((u) => typeof u === "string" && u.length > 0),
    [images]
  );
  const [idx, setIdx] = useState(0);

  // auto slide
  useEffect(() => {
    if (safeImages.length <= 1) return;
    const id = setInterval(
      () => setIdx((i) => (i + 1) % safeImages.length),
      slideIntervalMs
    );
    return () => clearInterval(id);
  }, [safeImages.length, slideIntervalMs]);

  return (
    <main className="min-h-screen bg-[#141417] text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-[120rem]">
        {/* LEFT: form */}
        <section className="relative flex w-full items-center justify-center px-6 py-10 md:w-[48%] lg:w-[42%]">
          {/* dekorasi halus */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              background:
                "radial-gradient(800px 400px at 20% 0%, rgba(244,63,94,0.18), transparent 45%), radial-gradient(900px 500px at 120% 100%, rgba(59,130,246,0.18), transparent 55%)",
            }}
          />
          <div className="relative z-10 w-full max-w-md">
            <div className="mb-8">
              <p className="text-xs font-semibold tracking-widest text-rose-300">
                {brand.toUpperCase()}
              </p>
              <h1 className="mt-1 text-2xl font-extrabold tracking-tight">
                {title}
              </h1>
            </div>
            {children}
            <p className="mt-10 text-center text-xs text-white/60">
              © {new Date().getFullYear()} {brand}. All rights reserved.
            </p>
          </div>
        </section>

        {/* RIGHT: carousel */}
        <aside className="relative hidden md:block flex-1 overflow-hidden min-h-[560px]">
          {safeImages.map((src, i) => (
            <div
              key={src}
              className={cn(
                "absolute inset-0 transition-opacity duration-700",
                i === idx ? "opacity-100" : "opacity-0"
              )}
            >
              <Image
                src={src}
                alt={`auth-${i}`}
                fill
                priority={i === 0}
                className="object-cover"
                sizes="(max-width: 1024px) 50vw, 58vw"
                unoptimized
              />
              {/* overlay gradient agar teks kiri tetap kontras */}
              <div className="absolute inset-0 bg-gradient-to-l from-black/35 via-black/25 to-black/10" />
            </div>
          ))}

          {/* dots */}
          {safeImages.length > 1 && (
            <div className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2">
              <div className="flex items-center gap-2 rounded-full bg-black/35 px-3 py-1 ring-1 ring-white/10 backdrop-blur">
                {safeImages.map((_, i) => (
                  <button
                    key={i}
                    aria-label={`Slide ${i + 1}`}
                    onClick={() => setIdx(i)}
                    className={cn(
                      "h-2 w-2 rounded-full transition-all",
                      i === idx
                        ? "w-5 bg-white"
                        : "bg-white/50 hover:bg-white/70"
                    )}
                  />
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </main>
  );
}