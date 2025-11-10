"use client";

import * as Accordion from "@radix-ui/react-accordion";
import { ChevronRight } from "lucide-react";

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
    <div className="container py-10">
      <Accordion.Root
        type="single"
        collapsible
        className="w-full max-w-3xl mx-auto rounded-lg border border-[#C02628] overflow-hidden font-mono"
      >
        {faqs.map((faq, i) => (
          <Accordion.Item
            key={i}
            value={`item-${i}`}
            className="border-b border-[#C02628]/40 last:border-b-0 tracking-wider"
          >
            <Accordion.Header>
              <Accordion.Trigger className="group flex w-full items-center justify-between px-5 py-4 text-left text-gray-800 hover:bg-[#C02628]/5 transition italic duration-500">
                <span>{faq.question}</span>
                <ChevronRight className="h-5 w-5 text-[#C02628] transition-transform duration-300 group-data-[state=open]:rotate-90" />
              </Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content className="px-5 py-4 text-sm text-gray-600 leading-relaxed">
              {faq.answer}
            </Accordion.Content>
          </Accordion.Item>
        ))}
      </Accordion.Root>
    </div>
  );
};

export default FAQ;
