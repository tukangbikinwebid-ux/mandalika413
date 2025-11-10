"use client";

import * as Accordion from "@radix-ui/react-accordion";
import { ChevronRight, Flame } from "lucide-react";

const faqs = [
  {
    question: "Apakah Diamond/Chip/Paket dari PSAK-413.com Legal?",
    answer:
      "Semua Diamonds, in-game items, voucher yang dijual di PSAK-413.com 100% legal dan berbadan hukum. Jangan khawatir karena belanja di PSAK-413.com dijamin aman.",
  },
  {
    question: "Bagaimana Cara Top-Up Diamonds atau Beli Voucher?",
    answer:
      "Cukup pilih game, masukkan ID, pilih nominal top up, lakukan pembayaran, dan item akan otomatis masuk ke akun kamu.",
  },
  {
    question: "Apakah Bisa Bayar Lewat Pulsa?",
    answer:
      "Ya, kamu bisa membayar menggunakan pulsa sesuai operator yang tersedia di sistem kami.",
  },
  {
    question: "Pembayaran Berhasil Tapi Item Belum Masuk?",
    answer:
      "Jika pembayaran berhasil tapi item belum masuk, tunggu maksimal 15 menit. Jika masih belum, segera hubungi CS kami.",
  },
  {
    question: "Kenapa Harus Beli di PSAK-413.com?",
    answer:
      "Harga murah, proses cepat, metode pembayaran lengkap, dan 100% legal.",
  },
];

const FAQ = () => {
  return (
    <section className="relative">
      {/* Backdrop */}
      <div className="pointer-events-none absolute inset-0 -z-20 bg-black" />
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-56 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(239,68,68,0.35),rgba(239,68,68,0)_60%)]" />
      <div className="pointer-events-none absolute left-1/2 top-28 -z-10 h-64 w-64 -translate-x-1/2 rounded-full bg-red-600/25 blur-[90px]" />

      <div className="container pt-14 pb-32">
        {/* Hero */}
        <header className="mb-8 flex items-center gap-3">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-red-500/40 bg-red-600/10 text-red-300">
            <Flame className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-2xl font-semibold tracking-wide text-white">
              Pusat Bantuan & FAQ
            </h1>
            <p className="text-sm text-red-200/80">
              Jawaban cepat untuk pertanyaan yang sering diajukan
            </p>
          </div>
        </header>

        {/* Accordion */}
        <Accordion.Root
          type="single"
          collapsible
          className="mx-auto w-full max-w-3xl rounded-2xl border border-red-500/30 bg-zinc-950/80 p-2 shadow-[0_15px_40px_-20px_rgba(0,0,0,.85)] backdrop-blur"
        >
          {faqs.map((faq, i) => (
            <Accordion.Item
              key={i}
              value={`item-${i}`}
              className="group rounded-xl border border-zinc-800/80 bg-black/40 p-2 + mb-3 last:mb-0"
            >
              <Accordion.Header>
                <Accordion.Trigger
                  className="
                    group/btn flex w-full items-center justify-between gap-3 rounded-lg
                    px-4 py-3 text-left outline-none transition
                    hover:bg-red-600/10
                    focus-visible:ring-2 focus-visible:ring-red-500
                    data-[state=open]:bg-red-600/15
                  "
                >
                  <span className="text-[15px] font-semibold leading-snug text-white">
                    {faq.question}
                  </span>

                  {/* Chevron */}
                  <span
                    className="
                      inline-flex h-8 w-8 items-center justify-center rounded-full
                      border border-red-600/40 bg-red-600/10 text-red-200
                      transition-transform duration-300
                      group-data-[state=open]:rotate-90
                    "
                  >
                    <ChevronRight className="h-4 w-4" />
                  </span>
                </Accordion.Trigger>
              </Accordion.Header>

              {/* Content with smooth height animation (CSS grid trick) */}
              <Accordion.Content
                className="
                  grid grid-rows-[0fr] overflow-hidden px-4 transition-[grid-template-rows] duration-300 ease-out
                  data-[state=open]:grid-rows-[1fr]
                "
              >
                <div className="min-h-0">
                  <div className="mt-3 rounded-lg border border-zinc-800 bg-black/50 p-4 text-sm leading-relaxed text-zinc-300">
                    {faq.answer}
                  </div>
                </div>
              </Accordion.Content>
            </Accordion.Item>
          ))}
        </Accordion.Root>

        {/* CTA strip */}
        <div className="mx-auto mt-8 w-full max-w-3xl rounded-xl border border-red-600/30 bg-red-600/10 p-4 text-center text-sm text-red-100">
          Masih butuh bantuan?{" "}
          <a
            href="/contact"
            className="font-semibold text-white underline underline-offset-4 hover:text-red-200"
          >
            Hubungi tim support kami
          </a>
          .
        </div>
      </div>
    </section>
  );
};

export default FAQ;
