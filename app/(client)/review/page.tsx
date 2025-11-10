// app/ulasan/page.tsx
"use client";

import { useMemo, useState, ChangeEvent } from "react";
import {
  Star,
  Filter,
  ChevronDown,
  X,
  Search as SearchIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

/* ========= Types & utils ========= */
type Review = {
  id: string;
  game: string;
  product: string;
  userAlias: string;
  rating: 1 | 2 | 3 | 4 | 5;
  comment: string;
  createdAt: string; // ISO
};

type SortKey = "latest" | "rating";
type RatingGate = "all" | "gte4" | "eq5";

const fmt = new Intl.DateTimeFormat("id-ID", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

function StarRow({ rating }: { rating: number }) {
  return (
    <div
      className="flex items-center gap-1"
      aria-label={`Rating ${rating} bintang`}
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i < rating ? "text-yellow-400 fill-yellow-400" : "text-white/25"
          }`}
        />
      ))}
    </div>
  );
}

/* ========= Dummy data (ganti ke API bila ada) ========= */
const REVIEWS: Review[] = [
  {
    id: "r1",
    game: "Mobile Legends",
    product: "30 (28+2) Diamonds",
    userAlias: "ran********",
    rating: 5,
    comment: `"Harganya murah"`,
    createdAt: "2025-11-03T20:38:48+07:00",
  },
  {
    id: "r2",
    game: "Mobile Legends",
    product: "500 (250+250) Diamonds Khusus Top Up Pertama",
    userAlias: "Boy*******",
    rating: 5,
    comment: `"Prosesnya cepat banget"`,
    createdAt: "2025-11-03T19:44:21+07:00",
  },
  {
    id: "r3",
    game: "Mobile Legends",
    product: "100 (50+50) Diamonds Khusus Top Up Pertama",
    userAlias: "ran********",
    rating: 5,
    comment: `"Prosesnya cepat banget"`,
    createdAt: "2025-11-03T19:31:18+07:00",
  },
  {
    id: "r4",
    game: "Mobile Legends",
    product: "90 Diamonds (PROMO)",
    userAlias: "ran********",
    rating: 5,
    comment: `"Prosesnya cepat banget"`,
    createdAt: "2025-11-03T20:29:29+07:00",
  },
  {
    id: "r5",
    game: "Mobile Legends",
    product: "Weekly Diamond Pass",
    userAlias: "ran********",
    rating: 5,
    comment: `"Prosesnya cepat banget"`,
    createdAt: "2025-11-03T19:23:54+07:00",
  },
  {
    id: "r6",
    game: "Mobile Legends",
    product: "Weekly Diamond Pass (PROMO)",
    userAlias: "ran********",
    rating: 5,
    comment: `"Prosesnya cepat banget"`,
    createdAt: "2025-11-03T19:26:17+07:00",
  },
  {
    id: "r7",
    game: "Mobile Legends Paket Irit",
    product: "5 Diamonds (+0 Bonus)",
    userAlias: "ran********",
    rating: 5,
    comment: "Prosesnya cepat banget",
    createdAt: "2025-11-03T20:53:17+07:00",
  },
  {
    id: "r8",
    game: "Mobile Legends",
    product: "Weekly Diamond Pass (PROMO)",
    userAlias: "ran********",
    rating: 5,
    comment: `"Prosesnya cepat banget"`,
    createdAt: "2025-11-03T19:15:31+07:00",
  },
  {
    id: "r9",
    game: "Mobile Legends",
    product: "384 (346+38) Diamonds",
    userAlias: "ran********",
    rating: 5,
    comment: `"Prosesnya cepat banget"`,
    createdAt: "2025-11-03T19:24:15+07:00",
  },
  {
    id: "r10",
    game: "Mobile Legends",
    product: "19 (17+2) Diamonds",
    userAlias: "ran********",
    rating: 5,
    comment: `"Prosesnya cepat banget"`,
    createdAt: "2025-11-03T20:02:20+07:00",
  },
  {
    id: "r11",
    game: "PUBG Mobile",
    product: "60 UC",
    userAlias: "ice********",
    rating: 5,
    comment: "Mantap, langsung masuk!",
    createdAt: "2025-11-03T18:55:00+07:00",
  },
  {
    id: "r12",
    game: "Free Fire",
    product: "100 Diamond",
    userAlias: "abd********",
    rating: 4,
    comment: "Cukup cepat, recommended.",
    createdAt: "2025-11-03T18:40:00+07:00",
  },
];

/* ========= Small UI atoms ========= */
function Chip({
  active,
  children,
  onClick,
  ariaLabel,
}: {
  active: boolean;
  children: string;
  onClick: () => void;
  ariaLabel?: string;
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel ?? children}
      onClick={onClick}
      className={[
        "whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition",
        "ring-1",
        active
          ? "bg-rose-600 text-white ring-rose-500"
          : "bg-[#2b2a30] text-white/80 ring-white/10 hover:bg-[#34333a]",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function Segmented({
  value,
  onChange,
}: {
  value: RatingGate;
  onChange: (v: RatingGate) => void;
}) {
  const opts: { key: RatingGate; label: string }[] = [
    { key: "all", label: "Semua" },
    { key: "gte4", label: "≥ 4★" },
    { key: "eq5", label: "5★" },
  ];
  return (
    <div
      role="tablist"
      aria-label="Filter rating"
      className="inline-flex overflow-hidden rounded-xl bg-[#2b2a30] ring-1 ring-white/10"
    >
      {opts.map((o) => {
        const active = value === o.key;
        return (
          <button
            key={o.key}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o.key)}
            className={[
              "px-3 py-1.5 text-xs font-semibold transition",
              active
                ? "bg-rose-600 text-white"
                : "text-white/80 hover:bg-[#34333a]",
            ].join(" ")}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/* ========= Page ========= */
export default function ReviewsPage() {
  const [visible, setVisible] = useState<number>(9);
  const [query, setQuery] = useState<string>("");
  const [gameFilter, setGameFilter] = useState<string>("all");
  const [sort, setSort] = useState<SortKey>("latest");
  const [ratingGate, setRatingGate] = useState<RatingGate>("all");

  // Unique games
  const games = useMemo<string[]>(
    () => ["all", ...Array.from(new Set(REVIEWS.map((r) => r.game)))],
    []
  );

  // Horizontal scroller controls
  const [scrollEl, setScrollEl] = useState<HTMLDivElement | null>(null);
  const scrollBy = (dx: number) =>
    scrollEl?.scrollBy({ left: dx, behavior: "smooth" });

  // Filtering
  const filtered = useMemo<Review[]>(() => {
    let list = [...REVIEWS];

    if (gameFilter !== "all") {
      list = list.filter((r) => r.game === gameFilter);
    }

    if (query.trim()) {
      const t = query.trim().toLowerCase();
      list = list.filter(
        (r) =>
          r.product.toLowerCase().includes(t) ||
          r.comment.toLowerCase().includes(t)
      );
    }

    if (ratingGate === "gte4") {
      list = list.filter((r) => r.rating >= 4);
    } else if (ratingGate === "eq5") {
      list = list.filter((r) => r.rating === 5);
    }

    if (sort === "latest") {
      list.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } else {
      list.sort((a, b) => b.rating - a.rating);
    }

    return list;
  }, [gameFilter, query, ratingGate, sort]);

  const data = filtered.slice(0, visible);
  const canMore = visible < filtered.length;

  const clearAll = () => {
    setQuery("");
    setGameFilter("all");
    setSort("latest");
    setRatingGate("all");
    setVisible(9);
  };

  const onSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setVisible(9);
  };

  return (
    <main className="min-h-screen bg-[#1f1f24] text-white">
      {/* Header mini */}
      <section className="border-b border-white/10 bg-[#26262b]">
        <div className="mx-auto max-w-7xl px-4 py-10">
          <p className="text-center text-xs font-semibold tracking-widest text-rose-300">
            ULASAN
          </p>
          <h1 className="mx-auto mt-2 max-w-3xl text-center text-2xl font-extrabold md:text-3xl">
            Terima kasih kepada semua pelanggan{" "}
            <span className="text-rose-300">PSAK-413</span>.
          </h1>

          {/* Filter bar */}
          <div className="mx-auto mt-6 flex max-w-5xl flex-col gap-4">
            {/* Search + Sort + Rating */}
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              {/* Search */}
              <div className="relative flex-1">
                <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
                <input
                  value={query}
                  onChange={onSearchChange}
                  placeholder="Cari di komentar atau produk…"
                  className="w-full rounded-xl border-0 bg-[#2b2a30] pl-9 pr-9 py-2 text-sm text-white/90 outline-none ring-1 ring-white/10 placeholder:text-white/45 focus:ring-rose-500/50"
                />
                {query && (
                  <button
                    aria-label="Bersihkan pencarian"
                    onClick={() => setQuery("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-white/60 hover:bg-white/10"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Rating segmented */}
              <div className="flex justify-between gap-3 md:justify-start">
                <Segmented
                  value={ratingGate}
                  onChange={(v) => {
                    setRatingGate(v);
                    setVisible(9);
                  }}
                />

                {/* Sort */}
                <div className="inline-flex items-center gap-2 rounded-xl bg-[#2b2a30] px-2 py-1.5 text-xs ring-1 ring-white/10">
                  <span className="hidden text-white/60 sm:inline">
                    Urutkan
                  </span>
                  <Filter className="h-4 w-4 text-white/60 sm:hidden" />
                  <select
                    aria-label="Urutkan"
                    value={sort}
                    onChange={(e) => {
                      setSort(e.target.value as SortKey);
                      setVisible(9);
                    }}
                    className="bg-transparent text-white/90 outline-none"
                  >
                    <option value="latest">Terbaru</option>
                    <option value="rating">Rating Tertinggi</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Game chips (scrollable) */}
            <div className="relative">
              <div className="pointer-events-none absolute left-0 top-0 h-full w-8 bg-gradient-to-r from-[#26262b] to-transparent" />
              <div className="pointer-events-none absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-[#26262b] to-transparent" />
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  aria-label="Scroll kiri"
                  onClick={() => scrollBy(-160)}
                  className="hidden rounded-md bg-[#2b2a30] p-1 text-white/70 ring-1 ring-white/10 hover:bg-[#34333a] md:inline-flex"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                <div
                  ref={setScrollEl}
                  className="no-scrollbar flex-1 overflow-x-auto"
                >
                  <div className="flex w-max items-center gap-2">
                    {games.map((g) => (
                      <Chip
                        key={g}
                        active={gameFilter === g}
                        onClick={() => {
                          setGameFilter(g);
                          setVisible(9);
                        }}
                        ariaLabel={g === "all" ? "Semua Game" : g}
                      >
                        {g === "all" ? "Semua Game" : g}
                      </Chip>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  aria-label="Scroll kanan"
                  onClick={() => scrollBy(160)}
                  className="hidden rounded-md bg-[#2b2a30] p-1 text-white/70 ring-1 ring-white/10 hover:bg-[#34333a] md:inline-flex"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Active badges + Reset */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {gameFilter !== "all" && (
                <span className="rounded-full bg-white/10 px-3 py-1 ring-1 ring-white/10">
                  Game: <strong className="ml-1">{gameFilter}</strong>
                </span>
              )}
              {ratingGate !== "all" && (
                <span className="rounded-full bg-white/10 px-3 py-1 ring-1 ring-white/10">
                  Rating:{" "}
                  <strong className="ml-1">
                    {ratingGate === "gte4" ? "≥ 4★" : "5★"}
                  </strong>
                </span>
              )}
              {query && (
                <span className="rounded-full bg-white/10 px-3 py-1 ring-1 ring-white/10">
                  Cari: <strong className="ml-1">{query}</strong>
                </span>
              )}
              {(gameFilter !== "all" || ratingGate !== "all" || query) && (
                <button
                  onClick={clearAll}
                  className="ml-auto inline-flex items-center gap-1 rounded-full bg-rose-600 px-3 py-1 font-medium ring-1 ring-rose-500/60 hover:brightness-110"
                >
                  Reset
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Grid reviews */}
      <section className="mx-auto max-w-7xl px-4 py-10">
        {data.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-center text-sm text-white/70">
            Belum ada ulasan untuk filter ini.
          </div>
        ) : (
          <>
            <p className="mb-4 text-xs text-white/50">
              Menampilkan{" "}
              <span className="font-semibold text-white/80">{data.length}</span>{" "}
              dari{" "}
              <span className="font-semibold text-white/80">
                {filtered.length}
              </span>{" "}
              ulasan
            </p>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {data.map((r) => (
                <article
                  key={r.id}
                  className="rounded-2xl bg-[#26252b] p-4 ring-1 ring-white/10 transition hover:ring-rose-500/40"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-[13px] font-semibold text-white/95">
                        {r.game}
                      </h3>
                      <p className="mt-1 text-[12px] italic text-white/70">
                        {r.comment}
                      </p>
                    </div>
                    <StarRow rating={r.rating} />
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-[12px] text-white/70">
                        {r.userAlias}
                      </p>
                      <p className="mt-1 line-clamp-2 text-[11px] text-white/50">
                        {r.product}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-md bg-white/5 px-2 py-1 text-[11px] text-white/60 ring-1 ring-white/10">
                      {fmt.format(new Date(r.createdAt))}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}

        {/* Load more */}
        {canMore && (
          <div className="mt-8 flex justify-center">
            <button
              onClick={() => setVisible((v) => v + 6)}
              className="inline-flex items-center gap-1 rounded-full bg-[#2b2a30] px-4 py-2 text-sm font-medium text-white/90 ring-1 ring-white/10 transition hover:bg-[#34333a]"
            >
              Muat Lebih Banyak
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
