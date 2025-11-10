"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { Star, MessageSquare, Minus, Plus, Check } from "lucide-react";
import type { Game } from "@/lib/games";

type OrderState = {
  playerId: string;
  nominal?: { name: string; price: number };
  qty: number;
  payment?: string;
  phone: string;
  promo?: string;
};

const NOMINALS: Array<{ name: string; price: number }> = [
  { name: "80 Token", price: 15663 },
  { name: "240 Token", price: 47355 },
  { name: "400 Token", price: 78863 },
  { name: "560 Token", price: 110556 },
  { name: "830 + 80 Token", price: 157910 },
  { name: "1265 (1200 + 65)", price: 236956 },
  { name: "2500 (2400 + 100)", price: 474096 },
  { name: "4180 (4000 + 180)", price: 790282 },
];

const PAYMENTS = [
  "QRIS / E-Wallet / ShopeePay / dll",
  "Virtual Account (BCA/BRI/BNI/Mandiri)",
  "Convenience Store (Indomaret/Alfamart)",
  "Transfer Bank",
];

function formatIDR(n?: number) {
  if (!n && n !== 0) return "-";
  return n.toLocaleString("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  });
}

function useLocalOrder(slug: string) {
  const storageKey = `order:${slug}`;
  const [state, setState] = useState<OrderState>({
    playerId: "",
    qty: 1,
    phone: "",
  });

  // load
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as OrderState;
        setState((s) => ({ ...s, ...parsed }));
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  // save
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(state));
    } catch {}
  }, [state, storageKey]);

  return [state, setState] as const;
}

export default function GameTopupDetail({ game }: { game: Game }) {
  const [order, setOrder] = useLocalOrder(game.slug);

  const discount = useMemo(() => {
    if (!order.promo) return 0;
    // contoh: HEMAT10 = 10% (dummy)
    if (order.promo.trim().toUpperCase() === "HEMAT10") return 0.1;
    return 0;
  }, [order.promo]);

  const subtotal = useMemo(() => {
    if (!order.nominal) return 0;
    return order.nominal.price * Math.max(1, order.qty || 1);
  }, [order.nominal, order.qty]);

  const total = useMemo(() => {
    return Math.max(0, Math.round(subtotal * (1 - discount)));
  }, [subtotal, discount]);

  const canOrder =
    Boolean(order.playerId?.trim()) &&
    Boolean(order.nominal) &&
    (order.qty ?? 0) > 0 &&
    Boolean(order.payment) &&
    Boolean(order.phone?.trim());

  const handleOrder = () => {
    if (!canOrder) return;
    alert(
      [
        `Pesanan ${game.title}`,
        `ID: ${order.playerId}`,
        `Item: ${order.nominal?.name} × ${order.qty}`,
        `Metode: ${order.payment}`,
        `Promo: ${order.promo || "-"}`,
        `Total: ${formatIDR(total)}`,
      ].join("\n")
    );
  };

  const waText = encodeURIComponent(
    [
      `Halo, saya ingin order ${game.title}.`,
      `ID: ${order.playerId || "-"}`,
      `Item: ${order.nominal?.name || "-"} × ${order.qty || 0}`,
      `Metode: ${order.payment || "-"}`,
      `Promo: ${order.promo || "-"}`,
      `Total: ${formatIDR(total)}`,
    ].join("\n")
  );

  return (
    <section className="w-full bg-[#26262b] text-white pb-3">
      {/* Hero */}
      <div className="relative h-44 w-full overflow-hidden md:h-60">
        <Image
          src={game.banner}
          alt={`${game.title} banner`}
          fill
          className="object-cover opacity-80"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />
      </div>

      {/* Header strip */}
      <div className="mx-auto -mt-12 max-w-7xl px-4">
        <div className="relative flex items-end gap-4 rounded-2xl bg-[#2f2f35] p-4 ring-1 ring-white/10 md:p-6">
          <div className="relative -mt-16 h-24 w-24 overflow-hidden rounded-xl ring-2 ring-white/10 md:h-28 md:w-28">
            <Image
              src={game.cover}
              alt={game.title}
              fill
              className="object-cover"
            />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-bold md:text-2xl">{game.title}</h1>
            <p className="text-sm text-white/70">{game.publisher}</p>
            <div className="mt-2 flex items-center gap-4 text-sm text-white/75">
              <span>⚡ Proses Cepat</span>
              <span>💬 Layanan Chat 24/7</span>
              <span>💳 Pembayaran Aman</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="mx-auto mt-6 grid max-w-7xl grid-cols-1 gap-6 px-4 md:grid-cols-3">
        {/* LEFT — form steps */}
        <div className="md:col-span-2 space-y-4">
          <Card title="1 Masukkan Data Akun">
            <label className="text-sm text-white/80">ID</label>
            <input
              placeholder="Masukkan ID"
              value={order.playerId}
              onChange={(e) =>
                setOrder((s) => ({ ...s, playerId: e.target.value }))
              }
              className="mt-2 w-full rounded-lg bg-[#3a3a41] px-3 py-3 text-sm outline-none ring-1 ring-white/10 placeholder:text-white/40 focus:ring-rose-500/50"
            />
          </Card>

          <Card title="2 Pilih Nominal">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {NOMINALS.map((it) => {
                const active = order.nominal?.name === it.name;
                return (
                  <button
                    type="button"
                    key={it.name}
                    onClick={() => setOrder((s) => ({ ...s, nominal: it }))}
                    className={[
                      "group rounded-xl p-4 text-left ring-1 transition",
                      active
                        ? "bg-rose-600/20 ring-rose-500"
                        : "bg-[#35343c] ring-white/10 hover:bg-white/5",
                    ].join(" ")}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-sm font-semibold">{it.name}</div>
                        <div className="mt-1 text-xs text-white/70">
                          {formatIDR(it.price)}
                        </div>
                      </div>
                      {active && <Check className="h-4 w-4 text-rose-400" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>

          <Card title="3 Masukkan Jumlah Pembelian">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setOrder((s) => ({
                    ...s,
                    qty: Math.max(1, (s.qty || 1) - 1),
                  }))
                }
                className="inline-flex items-center justify-center rounded-lg bg-[#3a3a41] p-2 ring-1 ring-white/10 hover:bg-white/5"
              >
                <Minus className="h-4 w-4" />
              </button>
              <input
                type="number"
                min={1}
                value={order.qty || 1}
                onChange={(e) =>
                  setOrder((s) => ({
                    ...s,
                    qty: Math.max(1, Number(e.target.value) || 1),
                  }))
                }
                className="w-24 rounded-lg bg-[#3a3a41] px-3 py-3 text-sm text-center outline-none ring-1 ring-white/10 focus:ring-rose-500/50"
              />
              <button
                type="button"
                onClick={() =>
                  setOrder((s) => ({ ...s, qty: (s.qty || 1) + 1 }))
                }
                className="inline-flex items-center justify-center rounded-lg bg-[#3a3a41] p-2 ring-1 ring-white/10 hover:bg-white/5"
              >
                <Plus className="h-4 w-4" />
              </button>
              <span className="text-white/60 text-sm">× paket</span>
            </div>
          </Card>

          <Card title="4 Pilih Pembayaran">
            <div className="space-y-3">
              {PAYMENTS.map((label) => {
                const active = order.payment === label;
                return (
                  <button
                    type="button"
                    key={label}
                    onClick={() => setOrder((s) => ({ ...s, payment: label }))}
                    className={[
                      "flex w-full items-center justify-between rounded-lg px-3 py-3 text-left text-sm ring-1 transition",
                      active
                        ? "bg-rose-600/20 ring-rose-500"
                        : "bg-[#3a3a41] ring-white/10 hover:bg-white/5",
                    ].join(" ")}
                  >
                    <span>{label}</span>
                    {active ? (
                      <Check className="h-4 w-4 text-rose-400" />
                    ) : (
                      <span className="text-white/50">▼</span>
                    )}
                  </button>
                );
              })}
            </div>
          </Card>

          <Card title="5 Detail Kontak">
            <label className="text-sm text-white/80">No. WhatsApp</label>
            <div className="mt-2 flex gap-2">
              <span className="inline-flex items-center rounded-lg bg-[#3a3a41] px-3 py-3 text-sm ring-1 ring-white/10">
                +62
              </span>
              <input
                placeholder="8xxxxxxxxxx"
                value={order.phone}
                onChange={(e) =>
                  setOrder((s) => ({ ...s, phone: e.target.value }))
                }
                className="flex-1 rounded-lg bg-[#3a3a41] px-3 py-3 text-sm outline-none ring-1 ring-white/10 focus:ring-rose-500/50"
              />
            </div>
            <p className="mt-2 text-xs text-white/50">
              Nomor ini akan dipakai admin jika terjadi masalah.
            </p>
          </Card>

          <Card title="6 Kode Promo">
            <div className="flex gap-2">
              <input
                placeholder="Ketik Kode Promo Kamu (contoh: HEMAT10)"
                value={order.promo || ""}
                onChange={(e) =>
                  setOrder((s) => ({ ...s, promo: e.target.value }))
                }
                className="flex-1 rounded-lg bg-[#3a3a41] px-3 py-3 text-sm outline-none ring-1 ring-white/10 focus:ring-rose-500/50"
              />
              <span
                className={[
                  "inline-flex items-center rounded-lg px-3 text-sm font-semibold",
                  discount > 0
                    ? "bg-emerald-600/30 text-emerald-200"
                    : "bg-white/10 text-white/70",
                ].join(" ")}
              >
                {discount > 0
                  ? `Diskon ${Math.round(discount * 100)}%`
                  : "Tidak ada diskon"}
              </span>
            </div>
          </Card>
        </div>

        {/* RIGHT — rating + bantuan + ringkasan */}
        <aside className="md:col-span-1 space-y-4">
          <div className="rounded-2xl bg-[#2f2f35] p-4 ring-1 ring-white/10">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold">
                  {game.rating.toFixed(2)}
                </div>
                <div className="text-xs text-white/70">
                  Berdasarkan ribuan rating
                </div>
              </div>
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-5 w-5 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-[#2f2f35] p-4 ring-1 ring-white/10">
            <div className="mb-2 flex items-center gap-2 text-sm">
              <MessageSquare className="h-4 w-4" />
              <span className="font-medium">Butuh Bantuan?</span>
            </div>
            <p className="text-sm text-white/70">
              Kamu bisa hubungi admin di sini.
            </p>
            <a
              href={`https://wa.me/6280000000000?text=${waText}`}
              target="_blank"
              rel="noreferrer"
              className="mt-3 block w-full rounded-lg bg-rose-600 py-2 text-center text-sm font-semibold hover:bg-rose-500"
            >
              Chat CS
            </a>
          </div>

          <div className="rounded-2xl bg-[#2f2f35] p-4 ring-1 ring-white/10">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-white/80">
                <span>ID</span>
                <span className="font-medium text-white/90">
                  {order.playerId || "-"}
                </span>
              </div>
              <div className="flex justify-between text-white/80">
                <span>Item</span>
                <span className="text-right">
                  {order.nominal
                    ? `${order.nominal.name} × ${order.qty || 1}`
                    : "-"}
                </span>
              </div>
              <div className="flex justify-between text-white/80">
                <span>Metode</span>
                <span className="text-right">{order.payment || "-"}</span>
              </div>
              <div className="flex justify-between text-white/80">
                <span>Subtotal</span>
                <span>{formatIDR(subtotal)}</span>
              </div>
              <div className="flex justify-between text-white/80">
                <span>Diskon</span>
                <span>
                  {discount > 0 ? `- ${Math.round(discount * 100)}%` : "-"}
                </span>
              </div>
              <div className="flex justify-between pt-2 text-base font-semibold">
                <span>Total</span>
                <span>{formatIDR(total)}</span>
              </div>
            </div>

            <button
              onClick={handleOrder}
              disabled={!canOrder}
              className={[
                "mt-3 w-full rounded-lg py-2 text-sm font-semibold",
                canOrder
                  ? "bg-[#bca27e] text-black hover:brightness-105"
                  : "bg-white/10 text-white/40 cursor-not-allowed",
              ].join(" ")}
            >
              Pesan Sekarang!
            </button>

            {!canOrder && (
              <p className="mt-2 text-xs text-white/50">
                Lengkapi: ID, nominal, jumlah, metode pembayaran, dan nomor
                WhatsApp.
              </p>
            )}
          </div>
        </aside>
      </div>
    </section>
  );
}

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-[#2f2f35] p-4 ring-1 ring-white/10 md:p-5">
      <div className="mb-3 text-sm font-semibold text-white/90">{title}</div>
      {children}
    </div>
  );
}