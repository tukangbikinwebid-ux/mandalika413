"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  IconBrandInstagram,
  IconBrandTiktok,
  IconMail,
  IconBrandYoutube,
  IconHeadphones,
  IconChevronRight,
  IconX,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

type NavLink = { name: string; href: string };
type FooterModel = {
  about: {
    name: string;
    description: string;
    logoSrc: string;
    copyright: string;
  };
  socials: { name: string; url: string; icon: "ig" | "tt" | "mail" | "yt" }[];
  sitemap: { title: string; links: NavLink[] };
  support: { title: string; links: NavLink[] };
  legal: { title: string; links: NavLink[] };
  chat: {
    label: string;
    hint: string;
    channels: { name: string; url: string }[];
  };
};

const DEFAULT_DATA: FooterModel = {
  about: {
    name: "PSAK-413",
    description:
      "PSAK-413 adalah tempat top up games murah, cepat, dan terpercaya. Proses 1–3 detik, buka 24 jam, metode pembayaran lengkap. Jika ada kendala klik tombol Chat CS di kanan bawah.",
    logoSrc: "/images/kios-tetta.png",
    copyright: "© 2025 PSAK-413. All rights reserved.",
  },
  socials: [
    { name: "Instagram", url: "#", icon: "ig" },
    { name: "TikTok", url: "#", icon: "tt" },
    { name: "Email", url: "mailto:support@kiostetta.com", icon: "mail" },
    { name: "YouTube", url: "#", icon: "yt" },
  ],
  sitemap: {
    title: "Menu",
    links: [
      { name: "Beranda", href: "/" },
      { name: "Berita", href: "/news" },
      { name: "Cek Transaksi", href: "/riwayat" },
      { name: "Hubungi Kami", href: "/contact" },
      { name: "Ulasan", href: "/review" },
      { name: "FAQ", href: "/faq" },
    ],
  },
  support: {
    title: "Dukungan",
    links: [
      { name: "WhatsApp", href: "#" },
      { name: "Instagram", href: "#" },
      { name: "Email", href: "mailto:support@kiostetta.com" },
    ],
  },
  legal: {
    title: "Legalitas",
    links: [
      { name: "Kebijakan Pribadi", href: "/privacy" },
      { name: "Syarat & Ketentuan", href: "/terms" },
    ],
  },
  chat: {
    label: "CHAT CS",
    hint: "Butuh bantuan? Kami siap 24/7",
    channels: [
      { name: "WhatsApp", url: "#" },
      { name: "Instagram DM", url: "#" },
      { name: "Email", url: "mailto:support@kiostetta.com" },
    ],
  },
};

export default function Footer() {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<FooterModel>(DEFAULT_DATA);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/dummy/navigation-data.json");
        if (r.ok) {
          const j = await r.json();
          setData({ ...DEFAULT_DATA, ...j.footerMapped });
        }
      } catch {}
    })();
  }, []);

  return (
    <footer className="relative">
      {/* BG gelap + aksen merah */}
      <div className="w-full border-top border-white/5 bg-[#1c1c1f]">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-12">
            {/* Kiri: logo + deskripsi + sosmed */}
            <div className="lg:col-span-5">
              <div className="flex items-center gap-3">
                <Image
                  src={data.about.logoSrc}
                  alt="PSAK-413 logo"
                  width={64}
                  height={64}
                  className="h-16 w-16 object-contain"
                />
                <span className="text-2xl font-semibold text-rose-400">
                  {data.about.name}
                </span>
              </div>

              <p className="mt-6 max-w-xl text-base leading-relaxed text-white/80">
                {data.about.description}
              </p>

              <div className="mt-6 flex items-center gap-3">
                {data.socials.map((s) => (
                  <a
                    key={s.name}
                    href={s.url}
                    target="_blank"
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-white/90 ring-1 ring-white/10 transition hover:bg-white/10 hover:text-rose-300"
                  >
                    {s.icon === "ig" && <IconBrandInstagram size={18} />}
                    {s.icon === "tt" && <IconBrandTiktok size={18} />}
                    {s.icon === "mail" && <IconMail size={18} />}
                    {s.icon === "yt" && <IconBrandYoutube size={18} />}
                  </a>
                ))}
              </div>
            </div>

            {/* Kanan: 3 kolom link */}
            <div className="lg:col-span-7 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              <FooterCol
                title={data.sitemap.title}
                links={data.sitemap.links}
              />
              <FooterCol
                title={data.support.title}
                links={data.support.links}
              />
              <FooterCol title={data.legal.title} links={data.legal.links} />
            </div>
          </div>

          <div className="mt-10 h-px w-full bg-white/5" />

          <div className="flex flex-col items-start justify-between gap-4 py-6 text-sm text-white/60 sm:flex-row">
            <span>{data.about.copyright}</span>
            <span>Didesain untuk gamer — nuansa merah PSAK-413</span>
          </div>
        </div>
      </div>

      {/* === Chat CS Floating Button (NEW) === */}
      <motion.button
        onClick={() => setOpen(true)}
        aria-label="Chat CS"
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        whileTap={{ scale: 0.97 }}
        whileHover={{ y: -2 }}
        className="group fixed bottom-6 right-6 z-50 inline-flex items-center gap-3 rounded-2xl p-[2px] shadow-[0_20px_60px_-15px_rgba(239,68,68,.6)]
                   bg-[conic-gradient(from_180deg_at_50%_50%,#ef4444_0deg,#ef4444_120deg,#fb7185_200deg,#111215_320deg)]
                   transition"
      >
        {/* Inner pill */}
        <span className="relative inline-flex items-center gap-2 rounded-[14px] bg-[#121215] px-4 py-3 text-white ring-1 ring-white/10">
          {/* Glow halo */}
          <span className="pointer-events-none absolute -inset-1 rounded-[16px] bg-red-500/10 blur-md opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          {/* Icon bubble */}
          <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-rose-600 shadow-inner ring-1 ring-white/10">
            <IconHeadphones size={18} />
            {/* Online ping */}
            <span className="absolute -right-0 -top-0">
              <span className="absolute inline-flex h-2.5 w-2.5 animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-[#121215]" />
            </span>
          </span>

          {/* Label + small hint on hover */}
          <span className="flex flex-col leading-none">
            <span className="text-[13px] font-bold tracking-wide">
              {data.chat.label}
            </span>
            <span className="mt-0.5 text-[10px] font-medium text-white/70 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              24/7 online
            </span>
          </span>
        </span>
      </motion.button>

      {/* Modal chat */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 z-50 bg-black/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.div
              className="fixed bottom-24 right-6 z-50 w-80 overflow-hidden rounded-2xl bg-[#111114] text-white ring-1 ring-white/10 shadow-2xl"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              transition={{ duration: 0.25 }}
            >
              <div className="flex items-center gap-3 bg-[#1a1a1e] px-4 py-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-rose-500 text-white">
                  <IconHeadphones size={18} />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold">Customer Support</div>
                  <div className="text-xs text-white/70">{data.chat.hint}</div>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="ml-auto rounded p-1 text-white/70 hover:bg-white/10"
                  aria-label="Close"
                >
                  <IconX size={16} />
                </button>
              </div>

              <div className="p-3">
                {data.chat.channels.map((c) => (
                  <Link
                    key={c.name}
                    href={c.url}
                    target="_blank"
                    className="group flex items-center justify-between rounded-lg px-3 py-2 text-sm text-white/90 hover:bg-white/5"
                  >
                    <span>{c.name}</span>
                    <IconChevronRight
                      size={16}
                      className="text-white/40 transition group-hover:translate-x-0.5"
                    />
                  </Link>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: NavLink[] }) {
  return (
    <div>
      <h4 className="text-[15px] font-semibold text-rose-400">{title}</h4>
      <ul className="mt-4 space-y-3 text-white/85">
        {links.map((l) => (
          <li key={l.name}>
            <Link
              href={l.href}
              className="inline-flex items-center gap-2 rounded-md px-1 py-0.5 transition hover:text-white hover:underline underline-offset-4"
            >
              {l.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
