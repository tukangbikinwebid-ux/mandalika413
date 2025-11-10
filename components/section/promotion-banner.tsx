"use client";

import Image from "next/image";
import React from "react";

const PromotionBanner = () => {
  return (
    <section
      className="
        relative overflow-hidden
        py-14 md:py-20
        text-white
      "
      style={{
        // Layer base: deep dark + radial red glow (gaming vibe)
        background:
          "radial-gradient(1200px 600px at 80% -10%, rgba(192, 38, 40, 0.55), transparent 55%), radial-gradient(900px 500px at 10% 110%, rgba(244, 63, 94, 0.35), transparent 60%), #17181d",
      }}
    >
      {/* --- Decorative grid (scanline) --- */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-25"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "28px 28px, 28px 28px",
          maskImage:
            "radial-gradient(1500px 700px at 50% 0%, black 35%, transparent 70%)",
        }}
      />

      {/* --- Soft noise texture --- */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.08] mix-blend-overlay"
        style={{
          backgroundImage:
            "url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2240%22 height=%2240%22><filter id=%22n%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%222%22/></filter><rect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22 opacity=%220.6%22/></svg>')",
        }}
      />

      {/* --- Neon red border glow --- */}
      <div className="pointer-events-none absolute inset-0 p-px">
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, rgba(244,63,94,.45), rgba(244,63,94,.12))",
            mask: "linear-gradient(#000, #000) content-box, linear-gradient(#000, #000)",
            WebkitMask:
              "linear-gradient(#000, #000) content-box, linear-gradient(#000, #000)",
          }}
        />
      </div>

      {/* --- diagonals light sweep top/bottom --- */}
      <div className="absolute -top-20 left-0 h-40 w-full rotate-6 bg-gradient-to-r from-transparent via-white/15 to-transparent blur-lg opacity-30" />
      <div className="absolute -bottom-20 left-0 h-40 w-full -rotate-6 bg-gradient-to-r from-transparent via-white/10 to-transparent blur-lg opacity-20" />

      {/* --- Floating shapes (pads/triangles) --- */}
      <div className="absolute -left-10 top-6 h-24 w-24 rounded-full bg-rose-500/20 blur-2xl" />
      <div className="absolute right-10 bottom-6 h-28 w-28 rounded-full bg-red-400/20 blur-2xl" />

      <div className="relative z-10 mx-auto max-w-7xl px-4">
        {/* Brand */}
        <div className="mb-8 flex items-center justify-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/95 shadow">
            <Image src="/images/LOGO.png" alt="logo" width={100} height={100}  className="rounded-xl"/>
          </div>
          <span className="text-3xl font-extrabold tracking-tight md:text-4xl">
            kiostetta<span className="text-rose-400">.</span>COM
          </span>
        </div>

        {/* Headline */}
        <h1 className="mx-auto max-w-4xl text-center text-2xl font-bold leading-tight md:text-4xl">
          Top Up Game & Voucher{" "}
          <span className="text-rose-400">20% Lebih Murah</span>,{" "}
          <span className="text-white/90">Cepat</span> dan{" "}
          <span className="text-white/90">Aman</span>
        </h1>

        {/* Subcopy */}
        <p className="mx-auto mt-4 max-w-4xl text-center text-base leading-relaxed text-white/80 md:text-lg">
          Beli Diamond ML, Free Fire, PUBG UC, Steam Wallet, HOK, Genshin dan
          lainnya. Transaksi instan, harga promo tiap hari, bonus menarik,
          dukungan 24/7.
        </p>

        {/* CTAs */}
        <div className="mt-7 flex items-center justify-center gap-3">
          <a
            href="#topup"
            className="
              inline-flex items-center justify-center rounded-xl
              bg-gradient-to-br from-rose-500 to-red-500
              px-5 py-3 text-sm font-semibold text-white shadow-lg
              transition-all duration-300 hover:scale-[1.03] hover:shadow-rose-500/30
            "
          >
            Mulai Top Up
          </a>
          <a
            href="#promo"
            className="
              inline-flex items-center justify-center rounded-xl
              bg-white/5 px-5 py-3 text-sm font-semibold text-white
              ring-1 ring-white/15 backdrop-blur
              transition-all duration-300 hover:bg-white/10
            "
          >
            Lihat Promo
          </a>
        </div>

        {/* Trust badges / marquee mini */}
        <div className="mx-auto mt-8 grid max-w-4xl grid-cols-2 gap-3 text-center text-xs text-white/70 sm:grid-cols-4">
          <div className="rounded-lg bg-white/5 px-3 py-2 ring-1 ring-white/10">
            ⚡ Instan
          </div>
          <div className="rounded-lg bg-white/5 px-3 py-2 ring-1 ring-white/10">
            🔒 Aman & Terpercaya
          </div>
          <div className="rounded-lg bg-white/5 px-3 py-2 ring-1 ring-white/10">
            🎁 Promo Harian
          </div>
          <div className="rounded-lg bg-white/5 px-3 py-2 ring-1 ring-white/10">
            🕐 24/7 Support
          </div>
        </div>
      </div>

      {/* Spotlight mask for hero center */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          maskImage:
            "radial-gradient(600px 300px at 50% 30%, black 40%, transparent 70%)",
          WebkitMaskImage:
            "radial-gradient(600px 300px at 50% 30%, black 40%, transparent 70%)",
          background:
            "radial-gradient(500px 250px at 50% 30%, rgba(255,255,255,.08), transparent 70%)",
        }}
      />
    </section>
  );
};

export default PromotionBanner;
