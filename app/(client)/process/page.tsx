"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import * as XLSX from "xlsx";
import { api } from "@/services/api";
import type { PSAK413Import, CreateImportRequest, ImportError, ImportErrorsResponse } from "@/services/api";
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
  RotateCcw,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  Clock,
  TrendingUp,
  FileCheck,
  Zap,
  FileWarning,
  Eye,
  ChevronDown,
  ChevronUp,
  Hash,
  Database,
  FileX2,
  Info,
} from "lucide-react";

// --- Constants for Local Storage ---
const LS_KEY_IMPORT_ID = "psak413_active_import_id";
const LS_KEY_FILENAME = "psak413_active_filename";

// --- Helper Functions ---
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
    maximumFractionDigits: 2,
  }).format(val);

const formatDate = (dateInput: string | number | undefined) => {
  if (!dateInput) return "-";
  if (typeof dateInput === "number") {
    const date = new Date(Math.round((dateInput - 25569) * 86400 * 1000));
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

interface TableRow {
  id: number | string;
  cab: string;
  no_rekening: string;
  nama_nasabah: string;
  alamat_nasabah: string;
  product_code: string;
  akad: string;
  segment: string | null;
  stage: number | string;
  past_due_total: number;
  past_due_day: number;
  plafond: number;
  os_pokok: number;
  os_margin: number;
  os_total: number;
  ead: number;
  pd: number;
  lgd: number;
  start_date: string | number;
  maturity_date: string | number;
  psak413_amount: number;
  status: "Pending" | "Processing" | "Done" | "Error";
}

export default function ProcessPage() {
  // --- States UI ---
  const [hovered, setHovered] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);

  const [localFileName, setLocalFileName] = useState<string>("");
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);

  // --- States Data ---
  const [currentImport, setCurrentImport] = useState<PSAK413Import | null>(
    null
  );
  const [tableData, setTableData] = useState<TableRow[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [dataMode, setDataMode] = useState<"preview" | "server">("server");

  // Error Report State
  const [importErrors, setImportErrors] = useState<string | null>(null);
  
  // Detailed Import Errors
  const [detailedErrors, setDetailedErrors] = useState<ImportError[]>([]);
  const [detailedErrorsTotal, setDetailedErrorsTotal] = useState(0);
  const [detailedErrorsPage, setDetailedErrorsPage] = useState(1);
  const [detailedErrorsTotalPages, setDetailedErrorsTotalPages] = useState(1);
  const [loadingDetailedErrors, setLoadingDetailedErrors] = useState(false);
  const [showErrorsModal, setShowErrorsModal] = useState(false);
  const [expandedErrorRow, setExpandedErrorRow] = useState<number | null>(null);

  // Polling state
  const [isPolling, setIsPolling] = useState(false);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  const [page, setPage] = useState(1);
  const [totalDetails, setTotalDetails] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pageRef = useRef(1);

  // Sync state page ke ref
  useEffect(() => {
    pageRef.current = page;
  }, [page]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, []);

  // --- 1. Fetch Details from Backend (Server Mode) ---
  const fetchDetailsFromServer = useCallback(
    async (importId: number, pageNum: number) => {
      setLoadingDetails(true);

      try {
        const res = await api.psak413Detail.getAll({
          psak413_import_id: String(importId),
          page: pageNum,
          paginate: 10,
          orderBy: "psak413_import_details.updated_at",
          order: "desc",
        });

        if (res.code === 200) {
          const paginationData = res.data.pagination;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const mapped: TableRow[] = paginationData.data.map((d: any) => ({
            id: d.id,
            cab: d.cab,
            no_rekening: d.no_rekening,
            nama_nasabah: d.nama_nasabah,
            alamat_nasabah: d.alamat_nasabah,
            product_code: d.product_code || d.product_name || "-",
            akad: d.akad,
            segment: d.segment_name || "-",
            stage: d.stage,
            past_due_total: Number(d.past_due_total),
            past_due_day: Number(d.past_due_day),
            plafond: Number(d.plafond),
            os_pokok: Number(d.os_pokok),
            os_margin: Number(d.os_margin),
            os_total: Number(d.os_total),
            ead: Number(d.ead),
            pd: Number(d.pd),
            lgd: Number(d.lgd),
            start_date: d.start_date,
            maturity_date: d.maturity_date,
            psak413_amount: Number(d.psak413_amount),
            status: "Done",
          }));

          setTableData(mapped);
          setTotalDetails(paginationData.total);
          setTotalPages(paginationData.last_page);
          setPage(paginationData.current_page);
          setDataMode("server");
        }
      } catch (error) {
        console.error("Failed to fetch details", error);
      } finally {
        setLoadingDetails(false);
      }
    },
    []
  );

  // --- 1.5 Fetch Detailed Errors from Backend ---
  const fetchDetailedErrors = useCallback(
    async (importId: number, pageNum: number = 1) => {
      setLoadingDetailedErrors(true);

      try {
        const res = await api.psak413Import.getErrors(importId, {
          page: pageNum,
          paginate: 50,
        });

        if (res.code === 200 && res.data) {
          setDetailedErrors(res.data.data || []);
          setDetailedErrorsTotal(res.data.pagination?.total || 0);
          setDetailedErrorsPage(res.data.pagination?.current_page || 1);
          setDetailedErrorsTotalPages(res.data.pagination?.total_pages || 1);
        }
      } catch (error) {
        console.error("Failed to fetch detailed errors", error);
      } finally {
        setLoadingDetailedErrors(false);
      }
    },
    []
  );

  // --- 2. Poll Import Status every 5 seconds ---
  const startPolling = useCallback(
    (importId: number) => {
      setIsPolling(true);

      pollingRef.current = setInterval(async () => {
        try {
          const res = await api.psak413Import.getById(String(importId));

          if (res.code === 200 && res.data) {
            const data = res.data;
            setCurrentImport(data);
            setProgress(data.progress || 0);

            if (data.errors) {
              setImportErrors(data.errors);
            }

            // Check if processing is complete (progress = 100)
            if (data.progress >= 100) {
              // Stop polling
              if (pollingRef.current) {
                clearInterval(pollingRef.current);
                pollingRef.current = null;
              }
              setIsPolling(false);
              setRunning(false);
              setShowSuccess(true);

              // Fetch details table
              await fetchDetailsFromServer(importId, 1);

              // Fetch detailed errors if there are failed rows
              if (data.failed_rows > 0) {
                await fetchDetailedErrors(importId, 1);
              }
            }
          }
        } catch (error) {
          console.error("Polling error:", error);
        }
      }, 5000); // Poll every 5 seconds
    },
    [fetchDetailsFromServer]
  );

  // --- 3. INIT: Restore State from LocalStorage on Mount ---
  useEffect(() => {
    const initPage = async () => {
      const savedId = localStorage.getItem(LS_KEY_IMPORT_ID);
      const savedName = localStorage.getItem(LS_KEY_FILENAME);

      if (savedId) {
        setLoadingDetails(true);
        if (savedName) setLocalFileName(savedName);
        setDataMode("server");

        try {
          const importRes = await api.psak413Import.getById(savedId);
          if (importRes.code === 200 && importRes.data) {
            const data = importRes.data;
            setCurrentImport(data);
            setProgress(data.progress || 100);
            if (data.errors) setImportErrors(data.errors);

            // If still processing, start polling
            if (data.progress < 100) {
              setRunning(true);
              startPolling(data.id);
            } else {
              await fetchDetailsFromServer(data.id, 1);
              // Fetch detailed errors if there are failed rows
              if (data.failed_rows > 0) {
                await fetchDetailedErrors(data.id, 1);
              }
            }
          } else {
            localStorage.removeItem(LS_KEY_IMPORT_ID);
            localStorage.removeItem(LS_KEY_FILENAME);
          }
        } catch (error) {
          console.error("Failed to restore session", error);
        } finally {
          setLoadingDetails(false);
        }
      }
    };

    initPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- 4. Handle Manual Refresh ---
  const handleRefresh = () => {
    if (dataMode === "server" && currentImport?.id) {
      fetchDetailsFromServer(currentImport.id, page);
    }
  };

  // --- 5. Handle Local File Preview ---
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLocalFileName(file.name);
    setFileToUpload(file);
    setDataMode("preview");
    setTableData([]);
    setCurrentImport(null);
    setImportErrors(null);
    setLoadingDetails(true);

    localStorage.removeItem(LS_KEY_IMPORT_ID);
    localStorage.removeItem(LS_KEY_FILENAME);

    setTimeout(() => {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const rawData = XLSX.utils.sheet_to_json<any>(ws);

        const mappedData: TableRow[] = rawData.slice(0, 50).map((row, idx) => ({
          id: idx,
          cab: String(row["KODE_CABANG"] || ""),
          no_rekening: String(row["NO_REKENING"] || ""),
          nama_nasabah: String(row["NAMA_NASABAH"] || ""),
          alamat_nasabah: String(row["ALAMAT_NASABAH"] || ""),
          product_code: String(row["KODE_PRODUK"] || ""),
          akad: String(row["AKAD"] || ""),
          segment: String(row["SEGMENT"] || row["SEGMEN"] || "-"),
          stage: row["STAGE"] || row["KOLEKTIBILITAS"] || 1,
          past_due_total:
            Number(row["TOTAL_PAST_DUE"] || row["PAST_DUE_TOTAL"]) || 0,
          past_due_day: Number(row["DAY_PAST_DUE"] || row["DPD"]) || 0,
          plafond: Number(row["PLAFOND"]) || 0,
          os_pokok: Number(row["POKOK_SISA"]) || 0,
          os_margin: Number(row["MARGIN_SISA"]) || 0,
          os_total: Number(row["TOTAL_OUTSTANDING"]) || 0,
          ead: Number(row["EAD"]) || 0,
          pd:
            typeof row["PD"] === "string"
              ? Number(row["PD"].replace("%", "")) / 100
              : Number(row["PD"]),
          lgd:
            typeof row["LGD"] === "string"
              ? Number(row["LGD"].replace("%", "")) / 100
              : Number(row["LGD"]),
          start_date: row["START_DATE"] as string | number,
          maturity_date: row["MATURITY_DATE"] as string | number,
          psak413_amount: 0,
          status: "Pending",
        }));

        setTableData(mappedData);
        setTotalDetails(rawData.length);
        setTotalPages(Math.ceil(rawData.length / 10));
        setLoadingDetails(false);
      };
      reader.readAsBinaryString(file);
    }, 500);
  };

  // --- 6. Upload & Trigger Backend Process ---
  const handleConfirmProcess = async () => {
    setConfirmOpen(false);
    const file = fileToUpload;

    if (!file) {
      if (!fileInputRef.current?.files?.[0]) return;
    }

    setRunning(true);
    setProgress(0);
    setTableData([]);
    setDataMode("server");
    setImportErrors(null);

    try {
      const actualFile = file || fileInputRef.current!.files![0];
      const payload: CreateImportRequest = {
        file: actualFile,
      };

      const res = await api.psak413Import.create(payload);

      if ((res.code === 200 || res.code === 201) && res.data) {
        // Save to LocalStorage after successful upload
        localStorage.setItem(LS_KEY_IMPORT_ID, String(res.data.id));
        localStorage.setItem(LS_KEY_FILENAME, actualFile.name);

        setCurrentImport(res.data);
        setProgress(res.data.progress || 0);

        // Start polling to check progress
        startPolling(res.data.id);
      }
    } catch (error) {
      console.error("Upload failed", error);
      setRunning(false);
      setProgress(0);
    }
  };

  // --- Reset All Logic ---
  const resetAll = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    // Stop polling if running
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }

    localStorage.removeItem(LS_KEY_IMPORT_ID);
    localStorage.removeItem(LS_KEY_FILENAME);

    setRunning(false);
    setIsPolling(false);
    setProgress(0);
    setHovered(false);
    setShowSuccess(false);
    setImportErrors(null);

    // Clear detailed errors
    setDetailedErrors([]);
    setDetailedErrorsTotal(0);
    setDetailedErrorsPage(1);
    setDetailedErrorsTotalPages(1);
    setShowErrorsModal(false);
    setExpandedErrorRow(null);

    setTableData([]);
    setLocalFileName("");
    setFileToUpload(null);
    setCurrentImport(null);
    setTotalDetails(0);
    setPage(1);
    pageRef.current = 1;

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDownloadTemplate = (type: "excel" | "csv") => {
    api.psak413Import.downloadTemplate(type);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);

    if (dataMode === "server" && currentImport?.id) {
      fetchDetailsFromServer(currentImport.id, newPage);
    }
  };

  const canStart = !running && !!fileToUpload;
  const hasData = !!currentImport && currentImport.progress >= 100;

  const errorLogs = importErrors
    ? importErrors.split("\n").filter((line) => line.trim() !== "")
    : [];

  // Handle error pagination
  const handleErrorPageChange = (newPage: number) => {
    if (newPage < 1 || newPage > detailedErrorsTotalPages) return;
    if (currentImport?.id) {
      fetchDetailedErrors(currentImport.id, newPage);
    }
  };

  // Toggle expanded error row
  const toggleExpandedError = (id: number) => {
    setExpandedErrorRow(expandedErrorRow === id ? null : id);
  };

  // Parse row_data JSON safely
  const parseRowData = (rowData: string): string[] => {
    try {
      return JSON.parse(rowData);
    } catch {
      return [rowData];
    }
  };

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-slate-50 via-orange-50/30 to-amber-50/50 p-4 md:p-8 font-sans text-slate-800">
      {/* Header with Animation */}
      <div className="mb-6 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between animate-in fade-in slide-in-from-top-4 duration-500">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-2xl blur-lg opacity-50 animate-pulse" />
            <div className="relative grid h-16 w-16 place-content-center rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-500 text-3xl shadow-lg">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 flex items-center gap-2">
              Penurunan Nilai PSAK 413
              {running && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded-full font-bold animate-pulse">
                  <Zap className="w-3 h-3" /> Processing
                </span>
              )}
            </h1>
            <p className="text-sm text-gray-600">
              Upload Excel/CSV &rarr; Kalkulasi CKPN Otomatis
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center w-full lg:w-auto animate-in fade-in slide-in-from-right-4 duration-500 delay-100">
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={() => handleDownloadTemplate("excel")}
              className="flex-1 sm:flex-none flex justify-center items-center gap-1 px-3 py-2 rounded-xl bg-emerald-50 border-2 border-emerald-200 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-300 text-xs font-bold transition-all duration-200 hover:scale-105 hover:shadow-md whitespace-nowrap"
            >
              <FileSpreadsheet className="w-4 h-4" /> Template .xlsx
            </button>
            <button
              onClick={() => handleDownloadTemplate("csv")}
              className="flex-1 sm:flex-none flex justify-center items-center gap-1 px-3 py-2 rounded-xl bg-blue-50 border-2 border-blue-200 text-blue-700 hover:bg-blue-100 hover:border-blue-300 text-xs font-bold transition-all duration-200 hover:scale-105 hover:shadow-md whitespace-nowrap"
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
              className="flex justify-center items-center gap-2 px-5 py-3 rounded-xl font-semibold bg-white border-2 border-dashed border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-orange-400 hover:text-orange-600 transition-all duration-300 shadow-sm w-full sm:w-auto group"
            >
              <UploadCloud className="w-5 h-5 group-hover:animate-bounce" />{" "}
              <span>Pilih File</span>
            </button>
          ) : (
            <div className="flex items-center justify-between sm:justify-start gap-3 bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-2 rounded-xl border-2 border-blue-200 w-full sm:w-auto animate-in zoom-in duration-300">
              <div className="flex flex-col overflow-hidden">
                <span className="text-[10px] text-blue-500 font-bold uppercase tracking-wider flex items-center gap-1">
                  <FileCheck className="w-3 h-3" /> File Terpilih
                </span>
                <span className="text-sm font-semibold text-blue-900 truncate max-w-[150px] sm:max-w-[200px]">
                  {localFileName}
                </span>
              </div>
              {!running && !hasData && (
                <button
                  onClick={(e) => resetAll(e)}
                  className="p-1.5 flex-shrink-0 rounded-full hover:bg-red-100 text-blue-400 hover:text-red-500 transition-all duration-200"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          {hasData && (
            <button
              onClick={(e) => resetAll(e)}
              className="relative justify-center px-6 py-3 rounded-xl font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 shadow-md transition-all duration-200 flex items-center gap-2 w-full sm:w-auto hover:scale-105"
            >
              <RotateCcw className="w-5 h-5" /> Reset
            </button>
          )}

          {!hasData && (
            <button
              onClick={() => setConfirmOpen(true)}
              onMouseEnter={() => setHovered(true)}
              onMouseLeave={() => setHovered(false)}
              disabled={!canStart}
              className={[
                "relative justify-center px-6 py-3 rounded-xl font-bold text-white shadow-lg transition-all duration-300 flex items-center gap-2 w-full sm:w-auto overflow-hidden",
                !canStart
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-gradient-to-r from-amber-500 to-orange-500 hover:scale-105 hover:shadow-xl hover:shadow-orange-300/50",
              ].join(" ")}
            >
              {running ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  {hovered ? (
                    <>
                      <Zap className="w-5 h-5 animate-pulse" /> Jalankan Proses
                    </>
                  ) : (
                    <>
                      <TrendingUp className="w-5 h-5" /> Mulai Proses
                    </>
                  )}
                </>
              )}
              {!canStart ? null : (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-700" />
              )}
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-4">
        {/* Sidebar Status */}
        <div className="col-span-1 space-y-4 md:space-y-6 animate-in fade-in slide-in-from-left-4 duration-500 delay-200">
          <div className="rounded-2xl border-2 border-orange-100 bg-white p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4" /> Status Proses
            </h3>
            <div className="flex items-end gap-2 mb-3">
              <span
                className={`text-5xl font-black transition-colors duration-300 ${
                  running
                    ? "text-amber-500"
                    : progress >= 100
                    ? "text-emerald-500"
                    : "text-gray-900"
                }`}
              >
                {progress}%
              </span>
              <span className="text-sm font-medium text-gray-500 mb-2">
                {running ? "Processing" : progress >= 100 ? "Complete" : "Ready"}
              </span>
            </div>

            <div className="h-3 w-full rounded-full bg-gray-100 overflow-hidden shadow-inner">
              <div
                className={`h-full transition-all duration-500 ease-out rounded-full ${
                  progress >= 100
                    ? "bg-gradient-to-r from-emerald-400 to-green-500"
                    : "bg-gradient-to-r from-yellow-400 to-orange-500"
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>

            {isPolling && (
              <div className="mt-3 flex items-center gap-2 text-xs text-amber-600 font-medium animate-pulse">
                <RefreshCw className="w-3 h-3 animate-spin" />
                Mengecek progress setiap 5 detik...
              </div>
            )}

            <div className="mt-6 space-y-3">
              <div className="flex justify-between text-sm p-2 rounded-lg bg-gray-50">
                <span className="text-gray-500">Mode</span>
                <span
                  className={`font-bold uppercase ${
                    dataMode === "preview"
                      ? "text-amber-500"
                      : "text-emerald-600"
                  }`}
                >
                  {dataMode === "preview" ? "📄 Preview" : "☁️ Server"}
                </span>
              </div>

              {dataMode === "server" && currentImport && (
                <>
                  <div className="flex justify-between text-sm p-2 rounded-lg bg-gray-50">
                    <span className="text-gray-500">Total Rows</span>
                    <span className="font-bold text-gray-900">
                      {currentImport.rows}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm p-2 rounded-lg bg-emerald-50">
                    <span className="text-emerald-600">✓ Sukses</span>
                    <span className="font-bold text-emerald-700">
                      {currentImport.successful_rows}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm p-2 rounded-lg bg-red-50">
                    <span className="text-red-500">✕ Gagal</span>
                    <span
                      className={`font-bold ${
                        currentImport.failed_rows > 0
                          ? "text-red-600"
                          : "text-gray-400"
                      }`}
                    >
                      {currentImport.failed_rows}
                    </span>
                  </div>

                  <div className="pt-4 border-t-2 border-gray-100 mt-4">
                    <p className="text-xs text-gray-400 mb-2 uppercase tracking-wider font-bold">
                      Total Amount (PSAK 413)
                    </p>
                    <p className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 truncate">
                      {formatCurrency(currentImport.total_psak413_amount || 0)}
                    </p>
                  </div>
                </>
              )}

              {dataMode === "preview" && (
                <div className="flex justify-between text-sm p-2 rounded-lg bg-amber-50">
                  <span className="text-amber-600">Est. Rows</span>
                  <span className="font-bold text-amber-700">
                    {totalDetails}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Error Summary Container */}
          {currentImport && currentImport.failed_rows > 0 && (
            <div className="rounded-2xl border-2 border-red-200 bg-gradient-to-br from-red-50 to-rose-50 p-4 shadow-lg animate-in slide-in-from-bottom-4 duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-red-700">
                  <FileWarning className="w-5 h-5" />
                  <h3 className="font-bold text-sm">
                    Error Import ({currentImport.failed_rows})
                  </h3>
                </div>
              </div>

              {/* Quick Summary */}
              <div className="space-y-3 mb-4">
                <div className="bg-white rounded-xl p-3 border border-red-100">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Total Error</span>
                    <span className="text-lg font-black text-red-600">
                      {detailedErrorsTotal || currentImport.failed_rows}
                    </span>
                  </div>
                </div>
                
                {/* Preview first 3 errors */}
                {detailedErrors.slice(0, 3).map((err) => (
                  <div
                    key={err.id}
                    className="text-xs bg-white p-3 rounded-lg border border-red-100 shadow-sm"
                  >
                    <div className="flex items-center gap-2 text-red-600 font-bold mb-1">
                      <Hash className="w-3 h-3" />
                      Baris {err.row_number}
                    </div>
                    <p className="text-gray-600 truncate">{err.error_message}</p>
                  </div>
                ))}

                {/* Legacy error logs display */}
                {errorLogs.length > 0 && detailedErrors.length === 0 && (
                  <div className="space-y-2 max-h-[200px] overflow-y-auto">
                    {errorLogs.slice(0, 3).map((log, idx) => (
                      <div
                        key={idx}
                        className="text-xs bg-white p-3 rounded-lg border border-red-100 text-red-600 font-mono break-words shadow-sm"
                      >
                        {log}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* View All Errors Button */}
              <button
                onClick={() => setShowErrorsModal(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm transition-all duration-200 hover:scale-[1.02] shadow-lg"
              >
                <Eye className="w-4 h-4" />
                Lihat Semua Error
              </button>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="col-span-1 lg:col-span-3 animate-in fade-in slide-in-from-right-4 duration-500 delay-300">
          <div className="rounded-2xl border-2 border-gray-200 bg-white shadow-lg flex flex-col h-[500px] lg:h-[75vh] overflow-hidden">
            <div className="p-4 border-b-2 border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 bg-gradient-to-r from-gray-50 to-white rounded-t-2xl">
              <div className="flex items-center gap-3">
                <h2 className="font-bold text-gray-800 text-sm sm:text-base">
                  {dataMode === "preview"
                    ? "📋 Preview Data Upload"
                    : "📊 Hasil Perhitungan PSAK 413"}
                </h2>
                <span className="bg-gradient-to-r from-orange-100 to-amber-100 text-orange-700 text-[10px] sm:text-xs px-3 py-1 rounded-full font-bold border border-orange-200">
                  {totalDetails} Rows
                </span>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-auto">
                {dataMode === "server" && (
                  <button
                    onClick={handleRefresh}
                    disabled={loadingDetails}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-50 border-2 border-blue-200 text-blue-600 hover:bg-blue-100 hover:border-blue-300 disabled:opacity-50 flex items-center gap-1 transition-all duration-200 hover:scale-105"
                    title="Muat Ulang Data"
                  >
                    <RefreshCw
                      className={`w-3.5 h-3.5 ${
                        loadingDetails ? "animate-spin" : ""
                      }`}
                    />
                    Refresh
                  </button>
                )}

                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1 || loadingDetails}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white border-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 transition-all duration-200"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-medium text-gray-600 min-w-[80px] text-center bg-gray-50 px-2 py-1 rounded-lg">
                  Page {page} / {totalPages || 1}
                </span>
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages || loadingDetails}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white border-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 transition-all duration-200"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto w-full relative">
              <table className="min-w-max text-xs text-left text-gray-600">
                <thead className="text-xs text-gray-700 uppercase bg-gradient-to-r from-gray-100 to-gray-50 font-bold sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="px-4 py-3 whitespace-nowrap">Status</th>
                    <th className="px-4 py-3 whitespace-nowrap bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-x border-blue-200 sticky left-0 z-20">
                      💰 PSAK 413
                    </th>
                    <th className="px-4 py-3 whitespace-nowrap">Kode Cab</th>
                    <th className="px-4 py-3 whitespace-nowrap">No Rekening</th>
                    <th className="px-4 py-3 whitespace-nowrap">Nama Nasabah</th>
                    <th className="px-4 py-3 whitespace-nowrap">Produk</th>
                    <th className="px-4 py-3 whitespace-nowrap">Akad</th>
                    <th className="px-4 py-3 whitespace-nowrap">Segment</th>
                    <th className="px-4 py-3 whitespace-nowrap">Stage</th>
                    <th className="px-4 py-3 whitespace-nowrap text-right">
                      Plafond
                    </th>
                    <th className="px-4 py-3 whitespace-nowrap text-right">
                      Pokok Sisa
                    </th>
                    <th className="px-4 py-3 whitespace-nowrap text-right">
                      Total OS
                    </th>
                    <th className="px-4 py-3 whitespace-nowrap text-right">
                      Total Past Due
                    </th>
                    <th className="px-4 py-3 whitespace-nowrap text-right">
                      Day Past Due
                    </th>
                    <th className="px-4 py-3 whitespace-nowrap text-right">
                      EAD
                    </th>
                    <th className="px-4 py-3 whitespace-nowrap text-right">
                      PD
                    </th>
                    <th className="px-4 py-3 whitespace-nowrap text-right">
                      LGD
                    </th>
                    <th className="px-4 py-3 whitespace-nowrap">Maturity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loadingDetails ? (
                    <tr>
                      <td
                        colSpan={18}
                        className="px-6 py-32 text-center text-gray-400"
                      >
                        <div className="flex flex-col items-center gap-3">
                          <div className="relative">
                            <div className="w-16 h-16 border-4 border-orange-200 rounded-full animate-spin border-t-orange-500" />
                            <Loader2 className="w-8 h-8 text-orange-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                          </div>
                          <p className="text-sm font-medium">
                            Mengambil data...
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : tableData.length === 0 ? (
                    <tr>
                      <td
                        colSpan={18}
                        className="px-6 py-32 text-center text-gray-400"
                      >
                        <div className="flex flex-col items-center gap-3">
                          {running ? (
                            <div className="flex flex-col items-center">
                              <div className="relative mb-4">
                                <div className="w-20 h-20 border-4 border-amber-200 rounded-full animate-spin border-t-amber-500" />
                                <Zap className="w-10 h-10 text-amber-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                              </div>
                              <span className="text-lg font-bold text-gray-700">
                                Sedang memproses...
                              </span>
                              <span className="text-xs text-gray-400 mt-1">
                                Progress: {progress}% | Mengecek setiap 5 detik
                              </span>
                            </div>
                          ) : (
                            <>
                              <AlertCircle className="w-16 h-16 text-gray-300" />
                              <span className="text-lg font-medium">
                                Belum ada data
                              </span>
                              <span className="text-xs text-gray-400">
                                Upload file untuk memulai
                              </span>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    tableData.map((row, idx) => (
                      <tr
                        key={row.id || idx}
                        className="hover:bg-gradient-to-r hover:from-orange-50 hover:to-amber-50 transition-all duration-200 group"
                        style={{
                          animationDelay: `${idx * 30}ms`,
                        }}
                      >
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`inline-flex items-center justify-center w-7 h-7 rounded-full transition-all duration-300 ${
                              row.status === "Done"
                                ? "bg-emerald-100 text-emerald-600"
                                : row.status === "Processing"
                                ? "bg-amber-100 text-amber-600 animate-pulse"
                                : row.status === "Error"
                                ? "bg-red-100 text-red-600"
                                : "bg-gray-100 text-gray-400"
                            }`}
                          >
                            {row.status === "Done" ? (
                              <CheckCircle className="w-4 h-4" />
                            ) : row.status === "Processing" ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : row.status === "Error" ? (
                              <X className="w-4 h-4" />
                            ) : (
                              <Clock className="w-4 h-4" />
                            )}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-bold text-blue-700 bg-gradient-to-r from-blue-50 to-indigo-50 border-x border-blue-100 text-right sticky left-0 z-10">
                          {dataMode === "server"
                            ? formatCurrency(row.psak413_amount)
                            : "-"}
                        </td>
                        <td className="px-4 py-3 text-center font-mono">
                          {row.cab}
                        </td>
                        <td className="px-4 py-3 font-mono text-gray-500">
                          {row.no_rekening}
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-900 truncate max-w-[200px]">
                          {row.nama_nasabah}
                        </td>
                        <td className="px-4 py-3 truncate max-w-[150px]">
                          {row.product_code}
                        </td>
                        <td className="px-4 py-3">{row.akad}</td>
                        <td className="px-4 py-3">
                          <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded-lg text-xs font-medium">
                            {row.segment || "-"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                              row.stage === 1
                                ? "bg-green-100 text-green-700"
                                : row.stage === 2
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {row.stage}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-gray-500">
                          {formatCurrency(row.plafond)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {formatCurrency(row.os_pokok)}
                        </td>
                        <td className="px-4 py-3 text-right font-medium">
                          {formatCurrency(row.os_total)}
                        </td>
                        <td className="px-4 py-3 text-right text-red-600">
                          {formatCurrency(row.past_due_total)}
                        </td>
                        <td className="px-4 py-3 text-right font-mono">
                          {row.past_due_day}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-gray-800">
                          {formatCurrency(row.ead)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="bg-gray-100 px-2 py-1 rounded-lg text-gray-600 font-mono text-xs">
                            {formatPercent(row.pd)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="bg-gray-100 px-2 py-1 rounded-lg text-gray-600 font-mono text-xs">
                            {formatPercent(row.lgd)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-8 border-2 border-orange-100 animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <UploadCloud className="w-8 h-8 text-orange-600" />
            </div>
            <h3 className="text-xl font-black text-center text-gray-900 mb-2">
              Konfirmasi Upload
            </h3>
            <p className="text-sm text-gray-600 text-center mb-6">
              Upload dan proses file{" "}
              <span className="font-bold text-orange-600">{localFileName}</span>
              ?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmOpen(false)}
                className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 font-bold text-gray-600 hover:bg-gray-50 transition-all duration-200"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmProcess}
                className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold hover:shadow-lg hover:shadow-orange-300/50 transition-all duration-200 hover:scale-105"
              >
                Ya, Proses
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 text-center border-2 border-gray-100 animate-in zoom-in-95 duration-300">
            {currentImport && currentImport.failed_rows > 0 ? (
              <>
                <div className="relative w-24 h-24 mx-auto mb-6">
                  <div className="absolute inset-0 bg-orange-200 rounded-full animate-ping opacity-30" />
                  <div className="relative w-24 h-24 bg-gradient-to-br from-orange-100 to-amber-100 text-orange-600 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-12 h-12" />
                  </div>
                </div>
                <h2 className="text-2xl font-black mb-2 text-gray-800">
                  Selesai dengan Catatan
                </h2>
                <p className="text-gray-600 mb-2">
                  Proses selesai, namun terdapat{" "}
                  <span className="font-bold text-red-600">
                    {currentImport.failed_rows} baris
                  </span>{" "}
                  gagal diproses.
                </p>
                <p className="text-xs text-gray-400 mb-8">
                  Silakan cek log error di sidebar sebelah kiri.
                </p>
              </>
            ) : (
              <>
                <div className="relative w-24 h-24 mx-auto mb-6">
                  <div className="absolute inset-0 bg-emerald-200 rounded-full animate-ping opacity-30" />
                  <div className="relative w-24 h-24 bg-gradient-to-br from-emerald-100 to-green-100 text-emerald-600 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-12 h-12" />
                  </div>
                </div>
                <h2 className="text-2xl font-black mb-2 text-gray-800">
                  🎉 Selesai!
                </h2>
                <p className="text-gray-600 mb-4">
                  Semua data berhasil diproses dan dihitung.
                </p>
                {currentImport && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 mb-6 border-2 border-blue-100">
                    <p className="text-xs text-blue-500 font-bold uppercase tracking-wider mb-1">
                      Total PSAK 413
                    </p>
                    <p className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                      {formatCurrency(currentImport.total_psak413_amount || 0)}
                    </p>
                  </div>
                )}
              </>
            )}

            <button
              onClick={() => setShowSuccess(false)}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-gray-800 to-gray-900 text-white font-bold hover:shadow-xl transition-all duration-200 hover:scale-105"
            >
              Tutup & Lihat Data
            </button>
          </div>
        </div>
      )}

      {/* Detailed Errors Modal */}
      {showErrorsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl shadow-2xl border-2 border-gray-100 animate-in zoom-in-95 duration-300 flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b-2 border-gray-100 bg-gradient-to-r from-red-50 to-rose-50 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-rose-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <FileX2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-gray-900">
                      Detail Error Import
                    </h2>
                    <p className="text-sm text-gray-500">
                      {detailedErrorsTotal} error ditemukan saat proses import
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowErrorsModal(false)}
                  className="p-2 rounded-xl hover:bg-red-100 text-gray-400 hover:text-red-600 transition-all duration-200"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6">
              {loadingDetailedErrors ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-red-200 rounded-full animate-spin border-t-red-500" />
                    <Loader2 className="w-8 h-8 text-red-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                  </div>
                  <p className="mt-4 text-gray-500">Memuat data error...</p>
                </div>
              ) : detailedErrors.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                  <Info className="w-16 h-16 mb-4" />
                  <p className="text-lg font-medium">Tidak ada data error detail</p>
                  <p className="text-sm">Coba refresh atau lihat log di sidebar</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {detailedErrors.map((error) => (
                    <div
                      key={error.id}
                      className="border-2 border-gray-100 rounded-2xl overflow-hidden hover:border-red-200 transition-all duration-200"
                    >
                      {/* Error Header */}
                      <button
                        onClick={() => toggleExpandedError(error.id)}
                        className="w-full px-5 py-4 bg-gradient-to-r from-gray-50 to-white flex items-center justify-between hover:from-red-50 hover:to-rose-50 transition-all duration-200"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center text-red-600 font-bold">
                              <Hash className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                              <span className="text-xs text-gray-400 uppercase tracking-wider font-bold">
                                Baris
                              </span>
                              <p className="text-lg font-black text-gray-800">
                                {error.row_number}
                              </p>
                            </div>
                          </div>
                          
                          <div className="h-10 w-px bg-gray-200" />
                          
                          <div className="text-left">
                            <span className="text-xs text-gray-400 uppercase tracking-wider font-bold">
                              Field
                            </span>
                            <p className="text-sm font-bold text-red-600">
                              {error.field_name}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <span className="hidden sm:block text-sm text-gray-600 max-w-[300px] truncate text-right">
                            {error.error_message}
                          </span>
                          {expandedErrorRow === error.id ? (
                            <ChevronUp className="w-5 h-5 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                      </button>

                      {/* Expanded Content */}
                      {expandedErrorRow === error.id && (
                        <div className="px-5 py-4 bg-white border-t border-gray-100 animate-in slide-in-from-top-2 duration-200">
                          {/* Error Message */}
                          <div className="mb-4 p-4 bg-red-50 rounded-xl border border-red-100">
                            <div className="flex items-start gap-2">
                              <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                              <div>
                                <p className="text-xs text-red-400 uppercase tracking-wider font-bold mb-1">
                                  Pesan Error
                                </p>
                                <p className="text-sm text-red-700 font-medium">
                                  {error.error_message}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Error Details Grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                            <div className="p-3 bg-gray-50 rounded-xl">
                              <p className="text-xs text-gray-400 uppercase tracking-wider font-bold mb-1">
                                Sumber
                              </p>
                              <p className="text-sm font-semibold text-gray-800">
                                {error.source}
                              </p>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-xl">
                              <p className="text-xs text-gray-400 uppercase tracking-wider font-bold mb-1">
                                Field Name
                              </p>
                              <p className="text-sm font-semibold text-gray-800">
                                {error.field_name}
                              </p>
                            </div>
                            <div className="p-3 bg-amber-50 rounded-xl">
                              <p className="text-xs text-amber-500 uppercase tracking-wider font-bold mb-1">
                                Nilai Yang Dikirim
                              </p>
                              <p className="text-sm font-mono font-bold text-amber-700 break-all">
                                {error.field_value || "-"}
                              </p>
                            </div>
                          </div>

                          {/* Row Data */}
                          {error.row_data && (
                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                              <div className="flex items-center gap-2 mb-3 text-slate-600">
                                <Database className="w-4 h-4" />
                                <p className="text-xs uppercase tracking-wider font-bold">
                                  Data Baris Lengkap
                                </p>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {parseRowData(error.row_data).map((value, idx) => (
                                  <span
                                    key={idx}
                                    className="px-2 py-1 bg-white rounded-lg border border-slate-200 text-xs font-mono text-slate-600 truncate max-w-[150px]"
                                    title={String(value)}
                                  >
                                    {String(value) || "-"}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer with Pagination */}
            <div className="p-4 border-t-2 border-gray-100 bg-gray-50 flex-shrink-0">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  Menampilkan {detailedErrors.length} dari {detailedErrorsTotal} error
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleErrorPageChange(detailedErrorsPage - 1)}
                    disabled={detailedErrorsPage === 1 || loadingDetailedErrors}
                    className="px-3 py-2 rounded-lg text-sm font-bold bg-white border-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm font-medium text-gray-600 min-w-[100px] text-center bg-white px-3 py-2 rounded-lg border border-gray-200">
                    Page {detailedErrorsPage} / {detailedErrorsTotalPages || 1}
                  </span>
                  <button
                    onClick={() => handleErrorPageChange(detailedErrorsPage + 1)}
                    disabled={detailedErrorsPage >= detailedErrorsTotalPages || loadingDetailedErrors}
                    className="px-3 py-2 rounded-lg text-sm font-bold bg-white border-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
