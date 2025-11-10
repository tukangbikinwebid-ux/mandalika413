"use client";

import * as React from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

const SLIDE_INTERVAL = 3000; // 3 detik

const SLIDES = [
  {
    id: 1,
    title: "DISKON ROBLOX SETIAP HARI",
    subtitle: "Gunakan kode: PROMOROBLOX",
    text: "Diskon 5K tiap jam 12.00 WIB, reset setiap hari",
    badge: "Top Up di PSAK-413",
    image:
      "https://sbclbzad8s.ufs.sh/f/vI07edVR8nimhjesnNrfOHsdF5ArRwGp1kiJ8NbcmBPn90h6",
  },
  {
    id: 2,
    title: "TOP UP ML TERMURAH",
    subtitle: "Kode: MLHARIINI",
    text: "Diskon 3K untuk 500 diamonds ke atas",
    badge: "Instan • Otomatis",
    image: "/images/ml2.jpg",
  },
  {
    id: 3,
    title: "GAME PC & VOUCHER",
    subtitle: "Khusus member",
    text: "Bonus poin setiap transaksi",
    badge: "Gabung Sekarang",
    image: "/images/ml1.jpg",
  },
];

export function HeroCarousel() {
  const [active, setActive] = React.useState(0);
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    startAuto();
    return () => stopAuto();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function startAuto() {
    stopAuto();
    timerRef.current = setInterval(() => {
      setActive((prev) => (prev + 1) % SLIDES.length);
    }, SLIDE_INTERVAL);
  }

  function stopAuto() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  function goNext() {
    setActive((prev) => (prev + 1) % SLIDES.length);
    startAuto();
  }

  function goPrev() {
    setActive((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
    startAuto();
  }

  return (
    <section className="w-full h-[60vh] bg-[#37353E] py-4">
      <div
        className="relative mx-auto h-full w-[90%] overflow-hidden rounded-[28px]"
        onMouseEnter={stopAuto}
        onMouseLeave={startAuto}
      >
        {/* TRACK yang di-slide */}
        <div
          className="flex h-full transition-transform duration-700 ease-out"
          style={{ transform: `translateX(-${active * 100}%)` }}
        >
          {SLIDES.map((slide) => (
            <div
              key={slide.id}
              className="relative h-full w-full flex-shrink-0"
            >
              {/* background image */}
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                priority={slide.id === 1}
                className="object-cover"
              />

              {/* overlay gelap */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#111]/95 via-[#111]/50 to-transparent" />

              {/* content */}
              <div className="relative z-10 flex h-full flex-col justify-between gap-6 px-6 py-8 md:px-12 md:py-12">
                {/* top */}
                <div className="flex items-center gap-2 text-white/70">
                  <span className="inline-flex h-7 items-center rounded-full bg-white/10 px-3 text-xs font-medium backdrop-blur">
                    PSAK-413
                  </span>
                  <span className="text-xs text-white/50">
                    Promo gaming dan voucher
                  </span>
                </div>

                {/* middle */}
                <div className="max-w-3xl space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#f4416e] md:text-sm">
                    {slide.subtitle}
                  </p>
                  <h2 className="text-3xl font-bold leading-tight text-white drop-shadow md:text-5xl">
                    {slide.title}
                  </h2>
                  <p className="text-sm text-white/80 md:text-base">
                    {slide.text}
                  </p>
                </div>

                {/* bottom */}
                <div className="flex items-center justify-between gap-4">
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-medium text-white backdrop-blur md:text-sm">
                    <span className="h-2 w-2 rounded-full bg-emerald-300" />
                    {slide.badge}
                  </span>

                  {/* dots */}
                  <div className="flex gap-2">
                    {SLIDES.map((s, i) => (
                      <button
                        key={s.id}
                        onClick={() => {
                          setActive(i);
                          startAuto();
                        }}
                        className={`h-2.5 rounded-full transition-all ${
                          i === active ? "w-6 bg-white" : "w-2.5 bg-white/40"
                        }`}
                        aria-label={`Slide ${i + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* arrow kiri */}
        <button
          onClick={goPrev}
          className="absolute left-6 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/35 text-white shadow-lg backdrop-blur transition hover:bg-black/60"
          aria-label="Sebelumnya"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        {/* arrow kanan */}
        <button
          onClick={goNext}
          className="absolute right-6 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/35 text-white shadow-lg backdrop-blur transition hover:bg-black/60"
          aria-label="Berikutnya"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </section>
  );
}
