"use client";

import { useMemo, useState, useEffect } from "react";
import {
  Filter,
  ChevronDown,
  ArrowRight,
  Banknote,
  Plus,
  FileText,
  Loader2,
} from "lucide-react";

// --- IMPORT SERVICE ---
import { api } from "@/services/api";
import type { PSAK413Detail } from "@/lib/types/psak413-details";

/* ===== Helpers ===== */
const rupiah = (n: number): string =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);

const ECL_DATE = "31-10-2025";

// Warna badge berdasarkan stage (bisa disesuaikan dengan logic backend)
const getBadgeColor = (stage: number | null) => {
  switch (stage) {
    case 1:
      return "bg-blue-50 border-blue-200";
    case 2:
      return "bg-amber-50 border-amber-200";
    case 3:
      return "bg-rose-50 border-rose-200";
    default:
      return "bg-gray-50 border-gray-200";
  }
};

const PAGE_SIZE = 10;

export default function PostGLPage() {
  const [activeTab, setActiveTab] = useState<"tambah" | "riwayat">("tambah");
  const [showFilter, setShowFilter] = useState(false);

  // --- States Data ---
  const [details, setDetails] = useState<PSAK413Detail[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalData, setTotalData] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // --- Fetch Data ---
  const fetchDetails = async () => {
    setLoading(true);
    try {
      // Kita gunakan psak413DetailService untuk mengambil data movement
      // Param psak413_import_id dihapus jika ingin mengambil semua movement global
      // atau tetap dipakai jika ingin filter import tertentu.
      // Di sini asumsi mengambil data global (semua history)
      const res = await api.psak413Detail.getAll({
        page,
        paginate: PAGE_SIZE,
        orderBy: "psak413_import_details.updated_at",
        order: "desc",
      });

      if (res.code === 200) {
        setDetails(res.data.data);
        setTotalData(res.data.total);
        setTotalPages(res.data.last_page);
      }
    } catch (error) {
      console.error("Failed to fetch movement details", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "tambah") {
      fetchDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, activeTab]);

  const goToPage = (p: number) => {
    if (p < 1 || p > totalPages) return;
    setPage(p);
  };

  // Hitung range data yang sedang ditampilkan untuk info pagination text
  const startIdx = (page - 1) * PAGE_SIZE + 1;
  const endIdx = Math.min(page * PAGE_SIZE, totalData);

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
                {loading ? (
                  <div className="py-12 flex justify-center items-center gap-2 text-gray-500">
                    <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
                    <span>Memuat data...</span>
                  </div>
                ) : details.length === 0 ? (
                  <div className="py-12 text-center text-gray-400">
                    Belum ada data movement.
                  </div>
                ) : (
                  details.map((row, idx) => (
                    <div
                      key={`${row.id}-${idx}`}
                      className={`grid grid-cols-12 gap-4 px-6 py-4 bg-white hover:bg-orange-50 transition-colors border-l-4 ${getBadgeColor(
                        row.stage
                      )}`}
                    >
                      <div className="col-span-2 flex items-center text-sm font-semibold text-gray-600">
                        {new Date(row.updated_at).toLocaleString("id-ID", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                      <div className="col-span-2 flex items-center gap-2 text-sm font-black text-gray-900">
                        <Banknote className="w-4 h-4 text-orange-600" />
                        {rupiah(row.psak413_amount)}
                      </div>
                      <div className="col-span-3 flex flex-col">
                        <span className="text-sm font-bold text-gray-900">
                          {row.cab}
                        </span>
                        <span
                          className="text-xs font-medium text-gray-500 truncate"
                          title={row.product_name}
                        >
                          {row.product_code} - {row.product_name}
                        </span>
                      </div>
                      <div className="col-span-2 flex items-center text-sm font-semibold text-gray-700">
                        {/* GL Account biasanya belum ada di interface detail, jadi placeholder atau mapping dari produk */}
                        GL ??? / Stage {row.stage}
                      </div>
                      <div className="col-span-3 flex items-center text-sm font-semibold text-gray-700">
                        {row.segment_name || "-"}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Pagination */}
          <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="text-sm text-gray-600">
              Showing{" "}
              <span className="font-semibold text-gray-800">
                {totalData > 0 ? startIdx : 0}–{endIdx}
              </span>{" "}
              of <span className="font-semibold">{totalData}</span> entries
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

              {/* Simple Page Indicator - Show max 5 pages around current */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                // Logic simpel agar page tetap di tengah jika banyak
                let p = i + 1;
                if (totalPages > 5 && page > 3) {
                  p = page - 2 + i;
                }
                if (p > totalPages) return null;

                return (
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
                );
              })}

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