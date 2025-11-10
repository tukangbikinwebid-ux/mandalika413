"use client";

import { useMemo, useState } from "react";
import {
  Filter,
  ChevronDown,
  ArrowRight,
  Banknote,
  Plus,
  FileText,
} from "lucide-react";

/* ===== Helpers ===== */
const rupiah = (n: number): string =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);

const ECL_DATE = "31-10-2025";

/* ===== Types ===== */
type MovementRow = {
  date: string;
  amount: number;
  branch: string;
  product: string;
  gl: string;
  segment: string;
  badge: string; // Tailwind class
};

const PAGE_SIZE = 10;

export default function PostGLPage() {
  const [activeTab, setActiveTab] = useState<"tambah" | "riwayat">("tambah");
  const [showFilter, setShowFilter] = useState(false);
  const [page, setPage] = useState(1);

  // ===== 20 dummy rows (bisa diganti dari API) =====
  const rows: MovementRow[] = useMemo(() => {
    const badges = [
      "bg-blue-50 border-blue-200",
      "bg-amber-50 border-amber-200",
      "bg-emerald-50 border-emerald-200",
      "bg-violet-50 border-violet-200",
      "bg-rose-50 border-rose-200",
    ];
    const segments = ["Modal Kerja", "Konsumer", "KUR", "Investasi", "Lainnya"];
    const products = [
      "K001 – KMK Biasa",
      "K002 – KPR Subsidi",
      "K003 – KUR Baru",
      "K004 – Investasi",
      "K005 – Multiguna",
    ];
    const branches = [
      "010 – CABANG UTAMA 010",
      "060 – CABANG 060",
      "085 – CABANG 085",
      "500 – CABANG 500",
      "011 – CABANG 011",
    ];

    // generate 20 baris dengan variasi
    return Array.from({ length: 20 }, (_, idx) => {
      const i = idx % 5;
      const stage = (idx % 3) + 1; // 1..3
      const hour = 9 + ((19 - idx) % 10); // 9..18
      const minute = (10 + idx * 3) % 60;
      const date = `${31 - Math.floor(idx / 7)} Okt ${hour
        .toString()
        .padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
      const amount = 4_250_000_000 - idx * 120_000_000;

      return {
        date,
        amount,
        branch: branches[i],
        product: products[i],
        gl: `GL ${8500 + idx} / Stage ${stage}`,
        segment: segments[i],
        badge: badges[i],
      } as MovementRow;
    });
  }, []);

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const startIdx = (page - 1) * PAGE_SIZE;
  const endIdx = Math.min(page * PAGE_SIZE, rows.length);
  const pageRows = rows.slice(startIdx, endIdx);

  const goToPage = (p: number) => {
    if (p < 1 || p > totalPages) return;
    setPage(p);
  };

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-orange-50 via-yellow-50 to-amber-50 p-6 md:p-8">
      {/* Tabs */}
      <div className="mb-6">
        <div className="inline-flex rounded-2xl border-2 border-orange-200 bg-white p-1 shadow">
          <button
            onClick={() => setActiveTab("tambah")}
            className={[
              "px-5 py-2.5 rounded-xl text-sm font-bold transition",
              activeTab === "tambah"
                ? "bg-gradient-to-r from-orange-500 to-yellow-500 text-white shadow"
                : "text-orange-700 hover:bg-orange-50",
            ].join(" ")}
            aria-current={activeTab === "tambah"}
          >
            <div className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Tambah Posting GL
            </div>
          </button>
          <button
            onClick={() => setActiveTab("riwayat")}
            className={[
              "px-5 py-2.5 rounded-xl text-sm font-bold transition",
              activeTab === "riwayat"
                ? "bg-gradient-to-r from-orange-500 to-yellow-500 text-white shadow"
                : "text-orange-700 hover:bg-orange-50",
            ].join(" ")}
          >
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Riwayat Posting
            </div>
          </button>
        </div>
      </div>

      {/* Panel: Tambah Posting GL */}
      {activeTab === "tambah" && (
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-lg border-2 border-orange-100">
          {/* Header tabel + actions */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-gray-900">
              Recent ECL Movements
            </h2>
            <div className="flex items-center gap-3">
              <div className="relative">
                <button
                  onClick={() => setShowFilter((p) => !p)}
                  className="px-4 py-2 bg-orange-50 rounded-xl text-sm font-semibold text-orange-700 hover:bg-orange-100 transition-colors flex items-center gap-2 border border-orange-200"
                >
                  <Filter className="w-4 h-4" />
                  All branches
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      showFilter ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {showFilter && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl border-2 border-orange-200 shadow-2xl overflow-hidden z-10">
                    {["All branches", "HO Only", "Top 5 Branch"].map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setShowFilter(false)}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-orange-50"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button className="px-4 py-2 text-sm font-bold text-orange-600 hover:text-orange-700 transition-colors flex items-center gap-1 hover:bg-orange-50 rounded-xl">
                Lihat Semua
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Tabel (full width, support label panjang) */}
          <div className="w-full overflow-x-auto rounded-2xl ring-1 ring-orange-100">
            <div className="min-w-[960px]">
              {/* Header grid */}
              <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-gradient-to-r from-yellow-50 to-amber-50/60">
                <div className="col-span-2 text-xs font-black text-orange-600 uppercase tracking-wider">
                  Date
                </div>
                <div className="col-span-2 text-xs font-black text-orange-600 uppercase tracking-wider">
                  Amount (Rp)
                </div>
                <div className="col-span-3 text-xs font-black text-orange-600 uppercase tracking-wider">
                  Branch / Product
                </div>
                <div className="col-span-2 text-xs font-black text-orange-600 uppercase tracking-wider">
                  GL / Stage
                </div>
                <div className="col-span-3 text-xs font-black text-orange-600 uppercase tracking-wider">
                  Segment
                </div>
              </div>

              {/* Rows */}
              <div className="divide-y divide-gray-100">
                {pageRows.map((row, idx) => (
                  <div
                    key={`${row.date}-${startIdx + idx}`}
                    className={`grid grid-cols-12 gap-4 px-6 py-4 bg-white hover:bg-orange-50 transition-colors border-l-4 ${row.badge}`}
                  >
                    <div className="col-span-2 flex items-center text-sm font-semibold text-gray-600">
                      {row.date}
                    </div>
                    <div className="col-span-2 flex items-center gap-2 text-sm font-black text-gray-900">
                      <Banknote className="w-4 h-4 text-orange-600" />
                      {rupiah(row.amount)}
                    </div>
                    <div className="col-span-3 flex flex-col">
                      <span className="text-sm font-bold text-gray-900">
                        {row.branch}
                      </span>
                      <span className="text-xs font-medium text-gray-500">
                        {row.product}
                      </span>
                    </div>
                    <div className="col-span-2 flex items-center text-sm font-semibold text-gray-700">
                      {row.gl}
                    </div>
                    <div className="col-span-3 flex items-center text-sm font-semibold text-gray-700">
                      {row.segment}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Pagination */}
          <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="text-sm text-gray-600">
              Showing{" "}
              <span className="font-semibold text-gray-800">
                {startIdx + 1}–{endIdx}
              </span>{" "}
              of <span className="font-semibold">{rows.length}</span> entries
            </div>

            <div className="inline-flex items-center gap-1 bg-white rounded-xl border-2 border-orange-200 p-1 shadow-sm">
              <button
                onClick={() => goToPage(page - 1)}
                disabled={page === 1}
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition ${
                  page === 1
                    ? "text-gray-300 cursor-not-allowed"
                    : "text-orange-700 hover:bg-orange-50"
                }`}
              >
                Prev
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => goToPage(p)}
                  className={`px-3 py-2 rounded-lg text-sm font-bold transition ${
                    p === page
                      ? "bg-gradient-to-r from-orange-500 to-yellow-500 text-white shadow"
                      : "text-orange-700 hover:bg-orange-50"
                  }`}
                >
                  {p}
                </button>
              ))}

              <button
                onClick={() => goToPage(page + 1)}
                disabled={page === totalPages}
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition ${
                  page === totalPages
                    ? "text-gray-300 cursor-not-allowed"
                    : "text-orange-700 hover:bg-orange-50"
                }`}
              >
                Next
              </button>
            </div>
          </div>

          {/* Footer date */}
          <div className="mt-6 text-center text-sm font-semibold text-gray-600">
            ECL Date : {ECL_DATE}
          </div>
        </div>
      )}

      {/* Panel: Riwayat Posting (placeholder) */}
      {activeTab === "riwayat" && (
        <div className="bg-white rounded-3xl p-8 shadow-lg border-2 border-orange-100">
          <h2 className="text-xl font-black text-gray-900 mb-2">
            Riwayat Posting GL
          </h2>
          <p className="text-sm text-gray-600">
            Belum ada riwayat. Silakan gunakan tab{" "}
            <span className="font-semibold">Tambah Posting GL</span> untuk
            membuat posting terlebih dahulu.
          </p>
        </div>
      )}
    </div>
  );
}