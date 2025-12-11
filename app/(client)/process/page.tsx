"use client";

import { useEffect, useRef, useState, useCallback } from "react"; // Added useCallback
import { api } from "@/services/api";
import type {
  PSAK413Import,
  CreateImportRequest,
} from "@/services/api";
import type { PSAK413Detail } from "@/services/api";
import {
  Loader2,
  FileSpreadsheet,
  FileType,
  UploadCloud,
  CheckCircle,
  X,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Swal from "sweetalert2";

// ... (Helper Functions stay the same) ...
const formatCurrency = (val: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 2,
  }).format(val);

const formatPercent = (val: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "percent",
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format(val / 100);

const formatDate = (dateString: string) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function ProcessPage() {
  // --- States UI ---
  const [hovered, setHovered] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [localFileName, setLocalFileName] = useState<string>("");

  // --- States Data ---
  const [currentImport, setCurrentImport] = useState<PSAK413Import | null>(
    null
  );
  const [details, setDetails] = useState<PSAK413Detail[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalDetails, setTotalDetails] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Refs
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- API Fetchers (Wrapped in useCallback) ---

  // 1. Fetch Details (List Data Table)
  const fetchDetails = useCallback(
    async (importId: string, pageNum: number) => {
      setLoadingDetails(true);
      try {
        const res = await api.psak413Detail.getAll({
          psak413_import_id: importId,
          page: pageNum,
          paginate: 10,
          orderBy: "psak413_import_details.id",
          order: "asc",
        });

        if (res.code === 200) {
          setDetails(res.data.data);
          setTotalDetails(res.data.total);
          setTotalPages(res.data.last_page);
          // Note: Don't setPage here if it causes loops, trust the arg
        }
      } catch (error) {
        console.error("Failed to fetch details", error);
      } finally {
        setLoadingDetails(false);
      }
    },
    []
  );

  // 2. Fetch Latest Import (Header Info)
  const fetchLatestImport = useCallback(async () => {
    try {
      const res = await api.psak413Import.getAll({
        page: 1,
        paginate: 1,
        orderBy: "created_at",
        order: "desc",
      });

      if (res.code === 200 && res.data.data.length > 0) {
        const latestData = res.data.data[0];
        setCurrentImport(latestData);
        setLocalFileName(latestData.filename);

        // Logic: Check status
        if (!latestData.finished_at) {
          // Masih processing -> Start Polling
          setRunning(true);
          startPolling(latestData.id);
        } else {
          // Selesai -> Load details
          fetchDetails(latestData.id, 1);
        }
      }
    } catch (error) {
      console.error("Failed to load history", error);
    }
  }, [fetchDetails]); // Dependency on fetchDetails

  // --- Polling Logic ---
  const startPolling = useCallback(
    (importId: string) => {
      // Clear existing interval first
      if (pollingRef.current) clearInterval(pollingRef.current);

      pollingRef.current = setInterval(async () => {
        try {
          const res = await api.psak413Import.getById(importId);
          if (res.code === 200 && res.data) {
            const updatedImport = res.data;
            setCurrentImport(updatedImport);
            setProgress(updatedImport.progress);

            // Stop condition
            if (updatedImport.finished_at || updatedImport.progress === 100) {
              if (pollingRef.current) clearInterval(pollingRef.current);
              setRunning(false);
              setShowSuccess(true);
              fetchDetails(importId, 1); // Refresh data final
            }
          }
        } catch (error) {
          console.error("Polling error", error);
        }
      }, 2000); // Poll every 2s
    },
    [fetchDetails]
  );

  // --- Effects ---

  // 1. Initial Load
  useEffect(() => {
    fetchLatestImport();

    // Cleanup on unmount
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [fetchLatestImport]);

  // 2. Pagination Effect (Optional: trigger fetch when page changes)
  // Ini cara yang lebih "React" daripada manggil fetch di handler onClick
  useEffect(() => {
    if (currentImport?.id && !running) {
      fetchDetails(currentImport.id, page);
    }
  }, [page, currentImport?.id, running, fetchDetails]);

  // --- Event Handlers ---

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLocalFileName(file.name);
  };

  const handleConfirmProcess = async () => {
    setConfirmOpen(false);
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;

    setRunning(true);
    setProgress(0);

    try {
      const payload: CreateImportRequest = { file };
      const res = await api.psak413Import.create(payload);

      if (res.code === 200 && res.data) {
        setCurrentImport(res.data);
        startPolling(res.data.id);
        // Reset pagination to 1 for new upload
        setPage(1);
      }
    } catch (error) {
      console.error("Upload failed", error);
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Gagal mengupload file.",
        confirmButtonColor: "#f97316",
      });
      setRunning(false);
      setProgress(0);
    }
  };

  const resetAll = () => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    setRunning(false);
    setProgress(0);
    setDetails([]);
    setShowSuccess(false);
    setLocalFileName("");
    setCurrentImport(null);
    setTotalDetails(0);
    setPage(1);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDownloadTemplate = (type: "excel" | "csv") => {
    api.psak413Import.downloadTemplate(type);
  };

  // Pagination UI Handlers (Hanya update state page, useEffect yang fetch data)
  const handleNextPage = () => {
    if (page < totalPages) setPage((p) => p + 1);
  };
  const handlePrevPage = () => {
    if (page > 1) setPage((p) => p - 1);
  };

  const hasData = !!currentImport;
  const canStart =
    !running && !!localFileName && fileInputRef.current?.files?.length === 1;

  // --- Render (Sama seperti sebelumnya) ---
  return (
    <div className="min-h-[100dvh] bg-white p-4 md:p-8 font-sans text-slate-800">
      {/* Header & Upload UI ... (Copy paste UI Anda yang sudah bagus) */}

      {/* Bagian UI di bawah ini SAMA PERSIS dengan kode sebelumnya, 
          hanya pastikan button pagination memanggil handleNextPage/handlePrevPage
          yang sekarang hanya mengubah state 'page' */}

      {/* ... (Header) ... */}

      <div className="mb-6 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          {/* ... Logo & Title ... */}
          <div className="grid h-16 w-16 place-content-center rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-500 text-3xl shadow-lg shadow-yellow-200">
            📊
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">
              Kalkulator PSAK 413
            </h1>
            <p className="text-sm text-gray-600">
              Upload Excel Lengkap &rarr; Hitung CKPN via Backend System
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          {/* ... Buttons Template & Upload ... */}
          <div className="flex gap-2 mr-2">
            <button
              onClick={() => handleDownloadTemplate("excel")}
              className="flex items-center gap-1 px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 text-xs font-bold transition-all"
            >
              <FileSpreadsheet className="w-4 h-4" /> Template .xlsx
            </button>
            <button
              onClick={() => handleDownloadTemplate("csv")}
              className="flex items-center gap-1 px-3 py-2 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 text-xs font-bold transition-all"
            >
              <FileType className="w-4 h-4" /> Template .csv
            </button>
          </div>

          <input
            type="file"
            accept=".xlsx, .xls, .csv"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            disabled={running}
          />

          {!localFileName ? (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-5 py-3 rounded-xl font-semibold bg-white border border-dashed border-gray-400 text-gray-600 hover:bg-gray-50 hover:border-gray-500 transition-all shadow-sm"
            >
              <UploadCloud className="w-5 h-5" /> <span>Pilih File</span>
            </button>
          ) : (
            <div className="flex items-center gap-3 bg-blue-50 px-4 py-2 rounded-xl border border-blue-200">
              <div className="flex flex-col">
                <span className="text-[10px] text-blue-500 font-bold uppercase tracking-wider">
                  File Terpilih
                </span>
                <span className="text-sm font-semibold text-blue-900 truncate max-w-[150px]">
                  {localFileName}
                </span>
              </div>
              {!running && (
                <button
                  onClick={resetAll}
                  className="p-1 rounded-full hover:bg-blue-100 text-blue-400 hover:text-red-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          <button
            onClick={() => setConfirmOpen(true)}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            disabled={!canStart}
            className={[
              "relative px-6 py-3 rounded-xl font-bold text-white shadow-lg transition-all flex items-center gap-2",
              !canStart
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-gradient-to-r from-amber-500 to-orange-500 hover:scale-105 hover:shadow-orange-200",
            ].join(" ")}
          >
            {running ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
            {hovered && !running ? "Jalankan Proses ⚡" : "Mulai Proses ▶"}
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* ... Sidebar Status ... */}
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-2">
              Status Proses
            </h3>
            <div className="flex items-end gap-2 mb-2">
              <span className="text-4xl font-black text-gray-900">
                {progress}%
              </span>
              <span className="text-sm font-medium text-gray-500 mb-1.5">
                Completed
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="mt-6 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Status</span>
                <span
                  className={`font-bold ${
                    running
                      ? "text-amber-500"
                      : hasData
                      ? "text-emerald-600"
                      : "text-gray-400"
                  }`}
                >
                  {running ? "Processing..." : hasData ? "Finished" : "Idle"}
                </span>
              </div>
              {hasData && (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Total Rows</span>
                    <span className="font-bold text-gray-900">
                      {currentImport?.rows || "-"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Success</span>
                    <span className="font-bold text-emerald-600">
                      {currentImport?.successful_rows || "-"}
                    </span>
                  </div>
                  <div className="pt-3 border-t border-gray-100 mt-2">
                    <p className="text-xs text-gray-400 mb-1">
                      Total Amount (PSAK 413)
                    </p>
                    <p className="text-lg font-black text-blue-700 truncate">
                      {formatCurrency(currentImport?.total_psak413_amount || 0)}
                    </p>
                  </div>
                </>
              )}
            </div>
            <div className="mt-4 text-xs text-gray-500 text-center bg-gray-50 p-3 rounded-lg border border-gray-100 italic">
              {running
                ? "Mengupload & Memproses data..."
                : hasData
                ? `Data dari ${formatDate(currentImport?.created_at || "")}`
                : "Silakan upload file Excel/CSV."}
            </div>
          </div>
        </div>

        {/* ... Table Section ... */}
        <div className="lg:col-span-3">
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm flex flex-col h-[75vh]">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-2xl">
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-gray-800">Preview Data Detail</h2>
                <span className="bg-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded-full font-bold">
                  {totalDetails} Rows
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevPage}
                  disabled={page === 1 || loadingDetails}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-medium text-gray-600 min-w-[80px] text-center">
                  Page {page} / {totalPages || 1}
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={page === totalPages || loadingDetails}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Table Content */}
            <div className="flex-1 overflow-auto w-full relative">
              <table className="min-w-max text-xs text-left text-gray-600">
                <thead className="text-xs text-gray-700 uppercase bg-gray-100 font-bold sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="px-4 py-3 whitespace-nowrap bg-gray-100">
                      Status
                    </th>
                    <th className="px-4 py-3 whitespace-nowrap bg-blue-50 text-blue-800 border-x border-blue-100 sticky left-0 z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                      PSAK 413
                    </th>
                    <th className="px-4 py-3 whitespace-nowrap bg-gray-100">
                      Kode Cab
                    </th>
                    <th className="px-4 py-3 whitespace-nowrap bg-gray-100">
                      No Rekening
                    </th>
                    <th className="px-4 py-3 whitespace-nowrap bg-gray-100">
                      Nama Nasabah
                    </th>
                    {/* ... th lainnya ... */}
                    <th className="px-4 py-3 whitespace-nowrap bg-gray-100">
                      Alamat
                    </th>
                    <th className="px-4 py-3 whitespace-nowrap bg-gray-100">
                      Produk
                    </th>
                    <th className="px-4 py-3 whitespace-nowrap bg-gray-100">
                      Akad
                    </th>
                    <th className="px-4 py-3 whitespace-nowrap text-right bg-gray-100">
                      Plafond
                    </th>
                    <th className="px-4 py-3 whitespace-nowrap text-right bg-gray-100">
                      Pokok Sisa
                    </th>
                    <th className="px-4 py-3 whitespace-nowrap text-right bg-gray-100">
                      Margin Sisa
                    </th>
                    <th className="px-4 py-3 whitespace-nowrap text-right bg-gray-100">
                      Total OS
                    </th>
                    <th className="px-4 py-3 whitespace-nowrap text-right bg-gray-100">
                      EAD
                    </th>
                    <th className="px-4 py-3 whitespace-nowrap text-right bg-gray-100">
                      PD
                    </th>
                    <th className="px-4 py-3 whitespace-nowrap text-right bg-gray-100">
                      LGD
                    </th>
                    <th className="px-4 py-3 whitespace-nowrap bg-gray-100">
                      Start Date
                    </th>
                    <th className="px-4 py-3 whitespace-nowrap bg-gray-100">
                      Maturity
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loadingDetails ? (
                    <tr>
                      <td
                        colSpan={17}
                        className="px-6 py-32 text-center text-gray-400"
                      >
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                          <span className="text-sm font-medium">
                            Mengambil data...
                          </span>
                        </div>
                      </td>
                    </tr>
                  ) : details.length === 0 ? (
                    <tr>
                      <td
                        colSpan={17}
                        className="px-6 py-32 text-center text-gray-400"
                      >
                        <div className="flex flex-col items-center gap-3 opacity-60">
                          <AlertCircle className="w-10 h-10 text-gray-300" />
                          <span>Belum ada data untuk ditampilkan</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    details.map((row) => (
                      <tr
                        key={row.id}
                        className="hover:bg-yellow-50 transition-colors group"
                      >
                        <td className="px-4 py-2 text-center">
                          <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-100"></span>
                        </td>
                        <td className="px-4 py-2 font-bold text-blue-700 bg-blue-50/50 group-hover:bg-blue-100/50 border-x border-blue-50 text-right sticky left-0 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                          {formatCurrency(row.psak413_amount)}
                        </td>
                        <td className="px-4 py-2">{row.cab}</td>
                        <td className="px-4 py-2 font-mono text-gray-500">
                          {row.no_rekening}
                        </td>
                        <td className="px-4 py-2 font-medium text-gray-900">
                          {row.nama_nasabah}
                        </td>
                        {/* ... td lainnya ... */}
                        <td
                          className="px-4 py-2 truncate max-w-[150px]"
                          title={row.alamat_nasabah}
                        >
                          {row.alamat_nasabah}
                        </td>
                        <td className="px-4 py-2">{row.product_code}</td>
                        <td className="px-4 py-2">{row.akad}</td>
                        <td className="px-4 py-2 text-right text-gray-500">
                          {formatCurrency(row.plafond)}
                        </td>
                        <td className="px-4 py-2 text-right">
                          {formatCurrency(row.os_pokok)}
                        </td>
                        <td className="px-4 py-2 text-right text-gray-500">
                          {formatCurrency(row.os_margin)}
                        </td>
                        <td className="px-4 py-2 text-right font-medium">
                          {formatCurrency(row.os_total)}
                        </td>
                        <td className="px-4 py-2 text-right font-bold text-gray-800">
                          {formatCurrency(row.ead)}
                        </td>
                        <td className="px-4 py-2 text-right">
                          <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">
                            {formatPercent(row.pd)}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-right">
                          <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">
                            {formatPercent(row.lgd)}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-gray-500">
                          {formatDate(row.start_date)}
                        </td>
                        <td className="px-4 py-2 text-gray-500">
                          {formatDate(row.maturity_date)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          {/* ... Modal Confirm ... */}
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 border border-gray-100 transform transition-all scale-100">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Konfirmasi Proses
            </h3>
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              Anda akan mengupload file <b>{localFileName}</b>. <br />
              Sistem akan menghitung ulang CKPN berdasarkan parameter terbaru.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmOpen(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 font-bold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmProcess}
                className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold hover:shadow-lg hover:shadow-orange-200 transition-all transform hover:-translate-y-0.5"
              >
                Ya, Proses
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          {/* ... Modal Success ... */}
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 text-center animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">
              Berhasil!
            </h2>
            <p className="text-gray-600 mb-8">
              File telah berhasil diupload dan diproses. Data hasil perhitungan
              dapat dilihat pada tabel.
            </p>
            <div className="flex justify-center">
              <button
                onClick={() => setShowSuccess(false)}
                className="px-8 py-3 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 shadow-xl shadow-emerald-200 transition-all transform hover:-translate-y-1"
              >
                Lihat Hasil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}