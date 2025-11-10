"use client";

import { useState } from "react";
import PromotionBanner from "@/components/section/promotion-banner";
import {
  Search,
  Phone,
  Receipt,
  Clock,
  CheckCircle2,
  XCircle,
  CreditCard,
} from "lucide-react";
import Link from "next/link";

const STATUS_FILTERS = [
  { key: "all", label: "Semua" },
  { key: "processing", label: "Diproses" },
  { key: "success", label: "Berhasil" },
  { key: "failed", label: "Gagal" },
];

export default function RiwayatPage() {
  const [tab, setTab] = useState<"phone" | "code">("phone");
  const [query, setQuery] = useState("");
  const [status, setStatus] =
    useState<(typeof STATUS_FILTERS)[number]["key"]>("all");

  return (
    <div className="min-h-screen bg-[#0f0f11] text-white">
      {/* HERO / TITLE BAR */}
      <section className="relative border-b border-white/10">
        <div className="absolute inset-0 bg-gradient-to-r from-rose-700 via-rose-600 to-red-600 opacity-10" />
        <div className="container mx-auto px-4 py-10">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
              Cek Transaksi
            </h1>
            <p className="mt-2 text-white/70">
              Lacak histori pesanan dan status pembayarannya di satu tempat.
            </p>

            {/* SEARCH CARD */}
            <div className="mt-6 rounded-2xl border border-white/10 bg-[#16161a]/90 shadow-2xl ring-1 ring-white/10 backdrop-blur">
              {/* Tabs kecil */}
              <div className="flex gap-2 border-b border-white/10 p-2">
                <button
                  type="button"
                  onClick={() => setTab("phone")}
                  className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
                    tab === "phone"
                      ? "bg-rose-600 text-white"
                      : "text-white/80 hover:bg-white/5"
                  }`}
                >
                  <Phone className="h-4 w-4" />
                  Nomor HP
                </button>
                <button
                  type="button"
                  onClick={() => setTab("code")}
                  className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
                    tab === "code"
                      ? "bg-rose-600 text-white"
                      : "text-white/80 hover:bg-white/5"
                  }`}
                >
                  <Receipt className="h-4 w-4" />
                  Kode Order
                </button>
              </div>

              {/* Input + action */}
              <div className="flex flex-col gap-3 p-4 md:flex-row md:items-center">
                <div className="relative flex-1">
                  <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/50">
                    <Search className="h-4 w-4" />
                  </div>
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    type={tab === "phone" ? "tel" : "text"}
                    placeholder={
                      tab === "phone"
                        ? "Nomor HP contoh: +628123123123"
                        : "Kode Order contoh: KT-2025-000123"
                    }
                    className="w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-4 py-3 text-sm outline-none placeholder:text-white/40 focus:ring-2 focus:ring-rose-500/70"
                  />
                </div>

                <button
                  type="button"
                  className="rounded-xl bg-gradient-to-r from-rose-600 to-red-600 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:brightness-110"
                >
                  Cari
                </button>
              </div>

              {/* Quick info */}
              <div className="flex flex-wrap items-center gap-3 border-t border-white/10 p-4 text-xs text-white/60">
                <span className="inline-flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-amber-300" />
                  Update realtime 1–3 detik
                </span>
                <span className="inline-flex items-center gap-2">
                  <CreditCard className="h-3.5 w-3.5 text-emerald-300" />
                  Metode pembayaran lengkap
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FILTERS + TABLE */}
      <div className="container mx-auto px-4 py-10">
        <div className="max-w-6xl mx-auto space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {STATUS_FILTERS.map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setStatus(f.key)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                    status === f.key
                      ? "border-rose-500 bg-rose-500/20 text-white shadow"
                      : "border-white/10 bg-white/[0.03] text-white/80 hover:bg-white/10"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 text-xs text-white/60">
              <span className="inline-flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-amber-400" />
                Diproses
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Berhasil
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-rose-500" />
                Gagal
              </span>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#141417] ring-1 ring-white/10">
            {/* Header */}
            <div className="hidden grid-cols-6 gap-4 border-b border-white/10 bg-[#1c1c20] px-5 py-3 text-[13px] font-semibold text-white/85 md:grid">
              <div>CODE</div>
              <div>PRODUCT</div>
              <div>USER ID</div>
              <div>TOTAL</div>
              <div>PAYMENT</div>
              <div>STATUS</div>
            </div>

            {/* Empty state */}
            <div className="flex flex-col items-center justify-center gap-4 px-6 py-14 text-center">
              <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.03] px-6 py-8">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-600/20 ring-1 ring-rose-600/40">
                  <Receipt className="h-6 w-6 text-rose-400" />
                </div>
                <h3 className="mt-4 text-base font-semibold">
                  Belum ada orderan
                </h3>
                <p className="mt-1 text-sm text-white/65">
                  Yuk top up dulu—harga bersahabat, proses cepat!
                </p>

                <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                  <Link
                    href="/"
                    className="rounded-xl bg-gradient-to-r from-rose-600 to-red-600 px-4 py-2 text-xs font-semibold text-white shadow hover:brightness-110"
                  >
                    Mulai Top Up
                  </Link>
                  <a
                    href="/promo"
                    className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-white/90 hover:bg-white/10"
                  >
                    Lihat Promo
                  </a>
                </div>
              </div>

              {/* Legend mini */}
              <div className="flex items-center gap-3 text-[11px] text-white/50">
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" /> Diproses
                </span>
                <span className="inline-flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Berhasil
                </span>
                <span className="inline-flex items-center gap-1">
                  <XCircle className="h-3.5 w-3.5" /> Gagal
                </span>
              </div>
            </div>

            {/* Contoh 1 row (non-empty) — tinggal map data asli
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4 px-5 py-4 border-t border-white/10 text-sm">
              <div className="font-mono">KT-2025-000123</div>
              <div className="truncate">Mobile Legends — 172 Diamonds</div>
              <div className="font-mono text-white/80">123456789(1234)</div>
              <div>Rp 50.000</div>
              <div className="flex items-center gap-1.5 text-white/80">
                <CreditCard className="h-4 w-4" /> QRIS
              </div>
              <div className="inline-flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-400" />
                <span className="text-white/85">Diproses</span>
              </div>
            </div>
            */}
          </div>
        </div>
      </div>

      <PromotionBanner />
    </div>
  );
}