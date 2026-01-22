"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import {
  Filter,
  ChevronDown,
  ArrowRight,
  Banknote,
  Plus,
  FileText,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Eye,
  ArrowLeft,
  Calendar,
  Package,
  Users,
  TrendingUp,
  Hash,
  RefreshCw,
  Search,
  Building2,
  CreditCard,
  Clock,
  CheckCircle,
  DollarSign,
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

const formatPercent = (val: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "percent",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val);

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Warna badge berdasarkan stage
const getStageBadge = (stage: number) => {
  switch (stage) {
    case 1:
      return {
        bg: "bg-emerald-100",
        text: "text-emerald-700",
        border: "border-emerald-200",
        label: "Stage 1",
      };
    case 2:
      return {
        bg: "bg-amber-100",
        text: "text-amber-700",
        border: "border-amber-200",
        label: "Stage 2",
      };
    case 3:
      return {
        bg: "bg-rose-100",
        text: "text-rose-700",
        border: "border-rose-200",
        label: "Stage 3",
      };
    default:
      return {
        bg: "bg-gray-100",
        text: "text-gray-700",
        border: "border-gray-200",
        label: `Stage ${stage}`,
      };
  }
};

// Interface untuk grouped data
interface GroupedData {
  key: string;
  psak413_import_id: number;
  product_id: number;
  akad: string;
  total_psak413_amount: number;
  count: number;
  latest_date: string;
  details: PSAK413Detail[];
}

const PAGE_SIZE = 10;

export default function PostGLPage() {
  const [activeTab, setActiveTab] = useState<"tambah" | "riwayat">("tambah");
  const [showFilter, setShowFilter] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // --- States Data ---
  const [allDetails, setAllDetails] = useState<PSAK413Detail[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalData, setTotalData] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // --- Selected Group for Detail View ---
  const [selectedGroup, setSelectedGroup] = useState<GroupedData | null>(null);
  const [detailPage, setDetailPage] = useState(1);

  // --- Fetch All Data for Grouping ---
  const fetchAllDetails = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch dengan pagination besar untuk grouping
      const res = await api.psak413Detail.getAll({
        page: 1,
        paginate: 1000, // Ambil banyak untuk grouping
        orderBy: "psak413_import_details.updated_at",
        order: "desc",
      });

      if (res.code === 200) {
        const paginationData = res.data.pagination;
        setAllDetails(paginationData.data);
        setTotalData(paginationData.total);
      }
    } catch (error) {
      console.error("Failed to fetch details", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllDetails();
  }, [fetchAllDetails]);

  // --- Group Data by psak413_import_id and product_id ---
  const groupedData = useMemo(() => {
    const groups: Map<string, GroupedData> = new Map();

    allDetails.forEach((detail) => {
      const key = `${detail.psak413_import_id}-${detail.product_id}`;

      if (groups.has(key)) {
        const existing = groups.get(key)!;
        existing.total_psak413_amount += detail.psak413_amount;
        existing.count += 1;
        existing.details.push(detail);
        // Update latest date if newer
        if (new Date(detail.updated_at) > new Date(existing.latest_date)) {
          existing.latest_date = detail.updated_at;
        }
      } else {
        groups.set(key, {
          key,
          psak413_import_id: detail.psak413_import_id,
          product_id: detail.product_id,
          akad: detail.akad,
          total_psak413_amount: detail.psak413_amount,
          count: 1,
          latest_date: detail.updated_at,
          details: [detail],
        });
      }
    });

    return Array.from(groups.values()).sort(
      (a, b) =>
        new Date(b.latest_date).getTime() - new Date(a.latest_date).getTime()
    );
  }, [allDetails]);

  // Filter grouped data based on search
  const filteredGroupedData = useMemo(() => {
    if (!searchTerm.trim()) return groupedData;

    return groupedData.filter(
      (group) =>
        group.akad.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(group.product_id).includes(searchTerm)
    );
  }, [groupedData, searchTerm]);

  // Paginated grouped data
  const paginatedGroups = useMemo(() => {
    const startIdx = (page - 1) * PAGE_SIZE;
    return filteredGroupedData.slice(startIdx, startIdx + PAGE_SIZE);
  }, [filteredGroupedData, page]);

  const groupTotalPages = Math.ceil(filteredGroupedData.length / PAGE_SIZE);

  // Detail pagination
  const paginatedDetails = useMemo(() => {
    if (!selectedGroup) return [];
    const startIdx = (detailPage - 1) * PAGE_SIZE;
    return selectedGroup.details.slice(startIdx, startIdx + PAGE_SIZE);
  }, [selectedGroup, detailPage]);

  const detailTotalPages = selectedGroup
    ? Math.ceil(selectedGroup.details.length / PAGE_SIZE)
    : 1;

  // Handlers
  const handleViewDetail = (group: GroupedData) => {
    setSelectedGroup(group);
    setDetailPage(1);
    setActiveTab("riwayat");
  };

  const handleBackToList = () => {
    setSelectedGroup(null);
    setActiveTab("tambah");
  };

  const goToPage = (p: number) => {
    if (p < 1 || p > groupTotalPages) return;
    setPage(p);
  };

  const goToDetailPage = (p: number) => {
    if (p < 1 || p > detailTotalPages) return;
    setDetailPage(p);
  };

  // Summary stats
  const totalAmount = useMemo(() => {
    return filteredGroupedData.reduce(
      (sum, g) => sum + g.total_psak413_amount,
      0
    );
  }, [filteredGroupedData]);

  const totalRecords = useMemo(() => {
    return filteredGroupedData.reduce((sum, g) => sum + g.count, 0);
  }, [filteredGroupedData]);

  const startIdx = (page - 1) * PAGE_SIZE + 1;
  const endIdx = Math.min(page * PAGE_SIZE, filteredGroupedData.length);

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-slate-50 via-orange-50/30 to-amber-50/50 p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 animate-in fade-in slide-in-from-top-4 duration-500">
        <div className="flex items-center gap-4 mb-4">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-amber-500 rounded-2xl blur-lg opacity-50" />
            <div className="relative p-4 bg-gradient-to-br from-orange-400 to-amber-500 rounded-2xl shadow-lg">
              <Banknote className="w-8 h-8 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-gray-900">
              Posting GL - ECL Movement
            </h1>
            <p className="text-sm text-gray-600">
              Kelola dan pantau pergerakan Expected Credit Loss
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          <div className="bg-white rounded-2xl p-5 shadow-lg border-2 border-blue-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                  Total Grup
                </p>
                <p className="text-2xl font-black text-gray-900">
                  {filteredGroupedData.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-lg border-2 border-emerald-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-100 rounded-xl">
                <Users className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                  Total Rekening
                </p>
                <p className="text-2xl font-black text-gray-900">
                  {totalRecords.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-lg border-2 border-amber-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-100 rounded-xl">
                <TrendingUp className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                  Total PSAK 413
                </p>
                <p className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600">
                  {rupiah(totalAmount)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 animate-in fade-in slide-in-from-left-4 duration-500 delay-100">
        <div className="flex flex-col sm:flex-row sm:inline-flex rounded-2xl border-2 border-orange-200 bg-white p-1.5 shadow-lg gap-2 sm:gap-1 w-full sm:w-auto">
          <button
            onClick={() => {
              setActiveTab("tambah");
              setSelectedGroup(null);
            }}
            className={[
              "px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 w-full sm:w-auto flex justify-center items-center gap-2",
              activeTab === "tambah"
                ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-200"
                : "text-orange-700 hover:bg-orange-50",
            ].join(" ")}
          >
              <Plus className="w-4 h-4" />
            Daftar Grup ECL
          </button>
          <button
            onClick={() => setActiveTab("riwayat")}
            className={[
              "px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 w-full sm:w-auto flex justify-center items-center gap-2",
              activeTab === "riwayat"
                ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-200"
                : "text-orange-700 hover:bg-orange-50",
            ].join(" ")}
          >
              <FileText className="w-4 h-4" />
            Detail Riwayat
          </button>
        </div>
      </div>

      {/* Panel: Daftar Grup ECL */}
      {activeTab === "tambah" && (
        <div className="bg-white rounded-3xl p-4 md:p-6 lg:p-8 shadow-xl border-2 border-orange-100 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
          {/* Header + Search */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
            <h2 className="text-xl md:text-2xl font-black text-gray-900 flex items-center gap-2">
              <Package className="w-6 h-6 text-orange-500" />
              Grup ECL by Product
            </h2>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
              {/* Search */}
              <div className="relative flex-1 sm:flex-none">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari akad atau product ID..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(1);
                  }}
                  className="w-full sm:w-64 pl-10 pr-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:outline-none text-sm font-medium transition-all"
                />
              </div>

              {/* Refresh Button */}
              <button
                onClick={fetchAllDetails}
                disabled={loading}
                className="px-4 py-2.5 bg-blue-50 rounded-xl text-sm font-bold text-blue-600 hover:bg-blue-100 transition-all duration-200 flex items-center justify-center gap-2 border-2 border-blue-200 hover:border-blue-300"
              >
                <RefreshCw
                  className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="w-full overflow-x-auto rounded-2xl border-2 border-orange-100">
            <table className="w-full text-left">
              <thead className="bg-gradient-to-r from-orange-50 to-amber-50 border-b-2 border-orange-100">
                <tr>
                  <th className="px-6 py-4 text-xs font-black text-orange-700 uppercase tracking-wider">
                    Import ID
                  </th>
                  <th className="px-6 py-4 text-xs font-black text-orange-700 uppercase tracking-wider">
                    Product ID
                  </th>
                  <th className="px-6 py-4 text-xs font-black text-orange-700 uppercase tracking-wider">
                    Akad
                  </th>
                  <th className="px-6 py-4 text-xs font-black text-orange-700 uppercase tracking-wider text-right">
                    Jumlah Rekening
                  </th>
                  <th className="px-6 py-4 text-xs font-black text-orange-700 uppercase tracking-wider text-right">
                    Total PSAK 413
                  </th>
                  <th className="px-6 py-4 text-xs font-black text-orange-700 uppercase tracking-wider">
                    Tanggal Proses
                  </th>
                  <th className="px-6 py-4 text-xs font-black text-orange-700 uppercase tracking-wider text-center">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="relative">
                          <div className="w-14 h-14 border-4 border-orange-200 rounded-full animate-spin border-t-orange-500" />
                          <Loader2 className="w-6 h-6 text-orange-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  </div>
                        <span className="text-gray-500 font-medium">
                          Memuat data...
                        </span>
                  </div>
                    </td>
                  </tr>
                ) : paginatedGroups.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-16 text-center text-gray-400"
                    >
                      <Package className="w-16 h-16 mx-auto mb-3 text-gray-300" />
                      <p className="text-lg font-medium">
                        Belum ada data movement
                      </p>
                      <p className="text-sm">
                        Upload file PSAK 413 terlebih dahulu
                      </p>
                    </td>
                  </tr>
                ) : (
                  paginatedGroups.map((group, idx) => (
                    <tr
                      key={group.key}
                      className="hover:bg-orange-50/50 transition-all duration-200 group"
                      style={{ animationDelay: `${idx * 50}ms` }}
                    >
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-bold border border-blue-200">
                          <Hash className="w-3.5 h-3.5" />
                          {group.psak413_import_id}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg text-sm font-bold border border-purple-200">
                          <Package className="w-3.5 h-3.5" />
                          {group.product_id}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-gray-900">
                          {group.akad}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-bold border border-emerald-200">
                          <Users className="w-3.5 h-3.5" />
                          {group.count.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-600">
                          {rupiah(group.total_psak413_amount)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 text-sm text-gray-600 font-medium">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {formatDate(group.latest_date)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleViewDetail(group)}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-orange-200 transition-all duration-200 hover:scale-105"
                        >
                          <Eye className="w-4 h-4" />
                          Lihat Detail
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredGroupedData.length > 0 && (
            <div className="mt-6 flex flex-col lg:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-600">
                Menampilkan{" "}
                <span className="font-bold text-gray-900">{startIdx}</span> -{" "}
                <span className="font-bold text-gray-900">{endIdx}</span> dari{" "}
                <span className="font-bold text-gray-900">
                  {filteredGroupedData.length}
              </span>{" "}
                grup
            </div>

              <div className="flex items-center gap-2">
              <button
                onClick={() => goToPage(page - 1)}
                disabled={page === 1}
                  className="px-4 py-2 rounded-xl border-2 border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold text-gray-700 flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                Prev
              </button>
                <div className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-bold">
                  {page} / {groupTotalPages || 1}
                </div>
              <button
                onClick={() => goToPage(page + 1)}
                  disabled={page >= groupTotalPages}
                  className="px-4 py-2 rounded-xl border-2 border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold text-gray-700 flex items-center gap-1"
              >
                Next
                  <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          )}
        </div>
      )}

      {/* Panel: Detail Riwayat */}
      {activeTab === "riwayat" && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {selectedGroup ? (
            <>
              {/* Back Button & Header Info */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-6 shadow-xl text-white">
                <button
                  onClick={handleBackToList}
                  className="mb-4 inline-flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-bold transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Kembali ke Daftar
                </button>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-white/20 rounded-xl">
                      <Hash className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs text-blue-200 uppercase font-medium">
                        Import ID
                      </p>
                      <p className="text-2xl font-black">
                        #{selectedGroup.psak413_import_id}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-white/20 rounded-xl">
                      <Package className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs text-blue-200 uppercase font-medium">
                        Product ID
                      </p>
                      <p className="text-2xl font-black">
                        {selectedGroup.product_id}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-white/20 rounded-xl">
                      <CreditCard className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs text-blue-200 uppercase font-medium">
                        Akad
                      </p>
                      <p className="text-xl font-black">{selectedGroup.akad}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-white/20 rounded-xl">
                      <Calendar className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs text-blue-200 uppercase font-medium">
                        Tanggal Proses
                      </p>
                      <p className="text-lg font-bold">
                        {formatDate(selectedGroup.latest_date)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-white/20 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-emerald-500/30 rounded-xl">
                      <Users className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs text-blue-200 uppercase font-medium">
                        Total Rekening
                      </p>
                      <p className="text-3xl font-black">
                        {selectedGroup.count.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-amber-500/30 rounded-xl">
                      <DollarSign className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs text-blue-200 uppercase font-medium">
                        Total PSAK 413
                      </p>
                      <p className="text-3xl font-black">
                        {rupiah(selectedGroup.total_psak413_amount)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detail Table */}
              <div className="bg-white rounded-3xl p-4 md:p-6 shadow-xl border-2 border-gray-100">
                <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-orange-500" />
                  Detail Rekening ({selectedGroup.count} data)
                </h3>

                <div className="w-full overflow-x-auto rounded-2xl border-2 border-gray-100">
                  <table className="w-full text-left min-w-[1200px]">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-100">
                      <tr>
                        <th className="px-4 py-3 text-xs font-black text-gray-600 uppercase">
                          Status
                        </th>
                        <th className="px-4 py-3 text-xs font-black text-blue-600 uppercase bg-blue-50">
                          PSAK 413
                        </th>
                        <th className="px-4 py-3 text-xs font-black text-gray-600 uppercase">
                          No. Rekening
                        </th>
                        <th className="px-4 py-3 text-xs font-black text-gray-600 uppercase">
                          Nama Nasabah
                        </th>
                        <th className="px-4 py-3 text-xs font-black text-gray-600 uppercase">
                          Cabang
                        </th>
                        <th className="px-4 py-3 text-xs font-black text-gray-600 uppercase">
                          Stage
                        </th>
                        <th className="px-4 py-3 text-xs font-black text-gray-600 uppercase text-right">
                          Plafond
                        </th>
                        <th className="px-4 py-3 text-xs font-black text-gray-600 uppercase text-right">
                          EAD
                        </th>
                        <th className="px-4 py-3 text-xs font-black text-gray-600 uppercase text-right">
                          PD
                        </th>
                        <th className="px-4 py-3 text-xs font-black text-gray-600 uppercase text-right">
                          LGD
                        </th>
                        <th className="px-4 py-3 text-xs font-black text-gray-600 uppercase">
                          Maturity
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {paginatedDetails.map((detail, idx) => {
                        const stageBadge = getStageBadge(detail.stage);
                        return (
                          <tr
                            key={detail.id}
                            className="hover:bg-orange-50/50 transition-all"
                          >
                            <td className="px-4 py-3">
                              <span className="inline-flex items-center justify-center w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full">
                                <CheckCircle className="w-4 h-4" />
                              </span>
                            </td>
                            <td className="px-4 py-3 bg-blue-50/50">
                              <span className="text-sm font-black text-blue-700">
                                {rupiah(detail.psak413_amount)}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-sm font-mono text-gray-600">
                                {detail.no_rekening}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-sm font-semibold text-gray-900">
                                {detail.nama_nasabah}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="inline-flex items-center gap-1 text-sm text-gray-600">
                                <Building2 className="w-3.5 h-3.5" />
                                {detail.cab}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex items-center px-2.5 py-1 ${stageBadge.bg} ${stageBadge.text} rounded-lg text-xs font-bold border ${stageBadge.border}`}
                              >
                                {stageBadge.label}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <span className="text-sm text-gray-600">
                                {rupiah(detail.plafond)}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <span className="text-sm font-semibold text-gray-900">
                                {rupiah(detail.ead)}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                                {formatPercent(detail.pd)}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                                {formatPercent(detail.lgd)}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-sm text-gray-500">
                                {formatDate(detail.maturity_date)}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Detail Pagination */}
                <div className="mt-6 flex flex-col lg:flex-row items-center justify-between gap-4">
                  <div className="text-sm text-gray-600">
                    Menampilkan{" "}
                    <span className="font-bold text-gray-900">
                      {(detailPage - 1) * PAGE_SIZE + 1}
                    </span>{" "}
                    -{" "}
                    <span className="font-bold text-gray-900">
                      {Math.min(
                        detailPage * PAGE_SIZE,
                        selectedGroup.details.length
                      )}
                    </span>{" "}
                    dari{" "}
                    <span className="font-bold text-gray-900">
                      {selectedGroup.details.length}
                    </span>{" "}
                    rekening
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => goToDetailPage(detailPage - 1)}
                      disabled={detailPage === 1}
                      className="px-4 py-2 rounded-xl border-2 border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold text-gray-700 flex items-center gap-1"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Prev
                    </button>
                    <div className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold">
                      {detailPage} / {detailTotalPages || 1}
                    </div>
                    <button
                      onClick={() => goToDetailPage(detailPage + 1)}
                      disabled={detailPage >= detailTotalPages}
                      className="px-4 py-2 rounded-xl border-2 border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold text-gray-700 flex items-center gap-1"
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-3xl p-8 shadow-xl border-2 border-gray-100 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-10 h-10 text-gray-400" />
              </div>
          <h2 className="text-xl font-black text-gray-900 mb-2">
                Tidak Ada Data Dipilih
          </h2>
              <p className="text-sm text-gray-600 mb-6">
                Silakan pilih grup dari tab{" "}
                <span className="font-semibold">Daftar Grup ECL</span> untuk
                melihat detail riwayat.
              </p>
              <button
                onClick={() => setActiveTab("tambah")}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-orange-200 transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                Lihat Daftar Grup
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
