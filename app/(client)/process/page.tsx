"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import * as XLSX from "xlsx";
import { api } from "@/services/api";
import type { PSAK413Import, CreateImportRequest } from "@/services/api";
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
} from "lucide-react";
import Swal from "sweetalert2";

// --- Constants for Local Storage ---
const LS_KEY_IMPORT_ID = "psak413_current_import_id";
const LS_KEY_FILENAME = "psak413_current_filename";

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

  // Handle Excel Serial Date
  if (typeof dateInput === "number") {
    const date = new Date(Math.round((dateInput - 25569) * 86400 * 1000));
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  // Handle ISO String from Backend
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
  // New Fields
  segment: string | null;
  stage: number | string;
  past_due_total: number;
  past_due_day: number;
  // Existing Fields
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

  const [page, setPage] = useState(1);
  const [totalDetails, setTotalDetails] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Refs for logic
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pageRef = useRef(1);

  // Sync state page ke ref
  useEffect(() => {
    pageRef.current = page;
  }, [page]);

  // --- 1. Fetch Details from Backend (Server Mode) ---
  // UPDATED: Mapping disesuaikan dengan struktur JSON response (Flat Fields)
  const fetchDetailsFromServer = useCallback(
    async (importId: string, pageNum: number) => {
      setLoadingDetails(true);

      try {
        const res = await api.psak413Detail.getAll({
          psak413_import_id: importId, // Filter by Import ID agar sesuai file upload
          page: pageNum,
          paginate: 10,
          orderBy: "psak413_import_details.id",
          order: "asc",
        });

        if (res.code === 200) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const mapped: TableRow[] = res.data.data.map((d: any) => ({
            id: d.id,
            cab: d.cab,
            no_rekening: d.no_rekening,
            nama_nasabah: d.nama_nasabah,
            alamat_nasabah: d.alamat_nasabah,

            // UPDATED MAPPING: Menggunakan flat field dari response JSON "Get All"
            product_code: d.product_code || d.product_name || "-",
            akad: d.akad,

            // UPDATED MAPPING: Menggunakan flat field
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
          setTotalDetails(res.data.total);
          setTotalPages(res.data.last_page);
          setPage(res.data.current_page);
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

  // --- 2. INIT: Restore State from LocalStorage on Mount ---
  useEffect(() => {
    const restoreState = async () => {
      const savedId = localStorage.getItem(LS_KEY_IMPORT_ID);
      const savedName = localStorage.getItem(LS_KEY_FILENAME);

      if (savedId) {
        setLoadingDetails(true);
        if (savedName) setLocalFileName(savedName);
        setDataMode("server");

        try {
          // 1. Cek Status Import Terakhir
          const res = await api.psak413Import.getById(savedId);
          if (res.code === 200 && res.data) {
            const data = res.data;
            setCurrentImport(data);
            setProgress(data.progress || 100);
            if (data.errors) setImportErrors(data.errors);

            // Langsung ambil data tabel via Service Details
            fetchDetailsFromServer(savedId, 1);
          } else {
            resetAll();
          }
        } catch (error) {
          console.error("Failed to restore state", error);
          setLoadingDetails(false);
        }
      }
    };

    restoreState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- 3. Handle Local File Preview ---
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLocalFileName(file.name);
    setFileToUpload(file);
    setDataMode("preview");
    setLoadingDetails(true);
    setImportErrors(null);
    setCurrentImport(null);

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
  };

  // --- 4. Upload & Trigger Backend Process ---
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

      if (res.code === 200 && res.data) {
        // SIMPAN KE LOCAL STORAGE
        localStorage.setItem(LS_KEY_IMPORT_ID, String(res.data.id));
        localStorage.setItem(LS_KEY_FILENAME, actualFile.name);

        setCurrentImport(res.data);
        setRunning(false);
        setProgress(100);
        setShowSuccess(true);

        // Fetch Data Table menggunakan API Details
        fetchDetailsFromServer(res.data.id, 1);
      }
    } catch (error) {
      console.error("Upload failed", error);
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Gagal mengupload file ke server.",
        confirmButtonColor: "#f97316",
      });
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

    localStorage.removeItem(LS_KEY_IMPORT_ID);
    localStorage.removeItem(LS_KEY_FILENAME);

    setRunning(false);
    setProgress(0);
    setHovered(false);
    setShowSuccess(false);
    setImportErrors(null);

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
  const hasData = !!currentImport;

  const errorLogs = importErrors
    ? importErrors.split("\n").filter((line) => line.trim() !== "")
    : [];

  return (
    <div className="min-h-[100dvh] bg-white p-4 md:p-8 font-sans text-slate-800">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <div className="grid h-16 w-16 place-content-center rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-500 text-3xl shadow-lg shadow-yellow-200">
            📊
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">
              Penurunan Nilai PSAK 413
            </h1>
            <p className="text-sm text-gray-600">
              Upload Excel Lengkap &rarr; Hitung CKPN
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center w-full lg:w-auto">
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={() => handleDownloadTemplate("excel")}
              className="flex-1 sm:flex-none flex justify-center items-center gap-1 px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 text-xs font-bold transition-all whitespace-nowrap"
            >
              <FileSpreadsheet className="w-4 h-4" /> Template .xlsx
            </button>
            <button
              onClick={() => handleDownloadTemplate("csv")}
              className="flex-1 sm:flex-none flex justify-center items-center gap-1 px-3 py-2 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 text-xs font-bold transition-all whitespace-nowrap"
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
              className="flex justify-center items-center gap-2 px-5 py-3 rounded-xl font-semibold bg-white border border-dashed border-gray-400 text-gray-600 hover:bg-gray-50 hover:border-gray-500 transition-all shadow-sm w-full sm:w-auto"
            >
              <UploadCloud className="w-5 h-5" /> <span>Pilih File</span>
            </button>
          ) : (
            <div className="flex items-center justify-between sm:justify-start gap-3 bg-blue-50 px-4 py-2 rounded-xl border border-blue-200 w-full sm:w-auto">
              <div className="flex flex-col overflow-hidden">
                <span className="text-[10px] text-blue-500 font-bold uppercase tracking-wider">
                  File Terpilih
                </span>
                <span className="text-sm font-semibold text-blue-900 truncate max-w-[150px] sm:max-w-[200px]">
                  {localFileName}
                </span>
              </div>
              {!running && !hasData && (
                <button
                  onClick={(e) => resetAll(e)}
                  className="p-1 flex-shrink-0 rounded-full hover:bg-blue-100 text-blue-400 hover:text-red-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          {hasData && (
            <button
              onClick={(e) => resetAll(e)}
              className="relative justify-center px-6 py-3 rounded-xl font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 shadow-md transition-all flex items-center gap-2 w-full sm:w-auto"
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
                "relative justify-center px-6 py-3 rounded-xl font-bold text-white shadow-lg transition-all flex items-center gap-2 w-full sm:w-auto",
                !canStart
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-gradient-to-r from-amber-500 to-orange-500 hover:scale-105 hover:shadow-orange-200",
              ].join(" ")}
            >
              {running ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
              {hovered && !running ? "Jalankan Proses ⚡" : "Mulai Proses ▶"}
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-4">
        {/* Sidebar Status */}
        <div className="col-span-1 space-y-4 md:space-y-6">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-2">
              Status Proses
            </h3>
            <div className="flex items-end gap-2 mb-2">
              <span
                className={`text-4xl font-black ${
                  running ? "text-amber-500" : "text-gray-900"
                }`}
              >
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
                <span className="text-gray-500">Mode</span>
                <span
                  className={`font-bold uppercase ${
                    dataMode === "preview"
                      ? "text-amber-500"
                      : "text-emerald-600"
                  }`}
                >
                  {dataMode}
                </span>
              </div>

              {dataMode === "server" && currentImport && (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Total Rows</span>
                    <span className="font-bold text-gray-900">
                      {currentImport.rows}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Sukses</span>
                    <span className="font-bold text-emerald-600">
                      {currentImport.successful_rows}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Gagal</span>
                    <span
                      className={`font-bold ${
                        currentImport.failed_rows > 0
                          ? "text-red-600"
                          : "text-gray-900"
                      }`}
                    >
                      {currentImport.failed_rows}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-gray-100 mt-2">
                    <p className="text-xs text-gray-400 mb-1">
                      Total Amount (PSAK 413)
                    </p>
                    <p className="text-lg font-black text-blue-700 truncate">
                      {formatCurrency(currentImport.total_psak413_amount || 0)}
                    </p>
                  </div>
                </>
              )}

              {dataMode === "preview" && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Est. Rows</span>
                  <span className="font-bold text-gray-900">
                    {totalDetails}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Error Log Container */}
          {errorLogs.length > 0 && (
            <div className="rounded-2xl border border-red-100 bg-red-50 p-4 shadow-sm max-h-[400px] overflow-y-auto">
              <div className="flex items-center gap-2 mb-3 text-red-700">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="font-bold text-sm">
                  Log Error ({currentImport?.failed_rows})
                </h3>
              </div>
              <div className="space-y-2">
                {errorLogs.map((log, idx) => (
                  <div
                    key={idx}
                    className="text-xs bg-white p-2 rounded border border-red-100 text-red-600 font-mono break-words"
                  >
                    {log}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="col-span-1 lg:col-span-3">
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm flex flex-col h-[500px] lg:h-[75vh]">
            <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 bg-gray-50/50 rounded-t-2xl">
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-gray-800 text-sm sm:text-base">
                  {dataMode === "preview"
                    ? "Preview Data Upload"
                    : "Hasil Perhitungan PSAK 413"}
                </h2>
                <span className="bg-gray-200 text-gray-600 text-[10px] sm:text-xs px-2 py-0.5 rounded-full font-bold">
                  {totalDetails} Rows
                </span>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1 || loadingDetails}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white border hover:bg-gray-50 disabled:opacity-50"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-medium text-gray-600 min-w-[80px] text-center">
                  Page {page} / {totalPages || 1}
                </span>
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages || loadingDetails}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white border hover:bg-gray-50 disabled:opacity-50"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto w-full relative">
              <table className="min-w-max text-xs text-left text-gray-600">
                <thead className="text-xs text-gray-700 uppercase bg-gray-100 font-bold sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="px-4 py-3 whitespace-nowrap bg-gray-100">
                      Status
                    </th>
                    <th className="px-4 py-3 whitespace-nowrap bg-blue-50 text-blue-800 border-x border-blue-100 sticky left-0 z-20">
                      PSAK 413 (Hasil)
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
                    <th className="px-4 py-3 whitespace-nowrap bg-gray-100">
                      Produk
                    </th>
                    <th className="px-4 py-3 whitespace-nowrap bg-gray-100">
                      Akad
                    </th>
                    <th className="px-4 py-3 whitespace-nowrap bg-gray-100">
                      Segment
                    </th>
                    <th className="px-4 py-3 whitespace-nowrap bg-gray-100">
                      Stage
                    </th>
                    <th className="px-4 py-3 whitespace-nowrap text-right bg-gray-100">
                      Plafond
                    </th>
                    <th className="px-4 py-3 whitespace-nowrap text-right bg-gray-100">
                      Pokok Sisa
                    </th>
                    <th className="px-4 py-3 whitespace-nowrap text-right bg-gray-100">
                      Total OS
                    </th>
                    <th className="px-4 py-3 whitespace-nowrap text-right bg-gray-100">
                      Total Past Due
                    </th>
                    <th className="px-4 py-3 whitespace-nowrap text-right bg-gray-100">
                      Day Past Due
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
                      Maturity
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loadingDetails ? (
                    <tr>
                      <td
                        colSpan={18}
                        className="px-6 py-32 text-center text-gray-400"
                      >
                        <Loader2 className="w-8 h-8 animate-spin text-orange-500 mx-auto" />
                        <p className="mt-2 text-xs">Mengambil data...</p>
                      </td>
                    </tr>
                  ) : tableData.length === 0 ? (
                    <tr>
                      <td
                        colSpan={18}
                        className="px-6 py-32 text-center text-gray-400"
                      >
                        <div className="flex flex-col items-center gap-2">
                          {running ? (
                            <div className="flex flex-col items-center">
                              <Loader2 className="w-10 h-10 animate-spin text-amber-500 mb-2" />
                              <span>Sedang memproses...</span>
                              <span className="text-xs text-gray-400">
                                Data akan muncul otomatis setelah selesai 100%
                              </span>
                            </div>
                          ) : (
                            <>
                              <AlertCircle className="w-10 h-10 text-gray-300" />
                              <span>Belum ada data untuk ditampilkan</span>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    tableData.map((row, idx) => (
                      <tr
                        key={row.id || idx}
                        className="hover:bg-yellow-50 transition-colors animate-in fade-in"
                      >
                        <td className="px-4 py-2 text-center">
                          <span
                            className={`inline-block w-2.5 h-2.5 rounded-full ${
                              row.status === "Done"
                                ? "bg-emerald-500"
                                : row.status === "Processing"
                                ? "bg-amber-400 animate-pulse"
                                : row.status === "Error"
                                ? "bg-red-500"
                                : "bg-gray-300"
                            }`}
                          ></span>
                        </td>
                        <td className="px-4 py-2 font-bold text-blue-700 bg-blue-50/50 border-x border-blue-50 text-right sticky left-0 z-10">
                          {dataMode === "server"
                            ? formatCurrency(row.psak413_amount)
                            : "-"}
                        </td>
                        <td className="px-4 py-2 text-center">{row.cab}</td>
                        <td className="px-4 py-2 font-mono text-gray-500">
                          {row.no_rekening}
                        </td>
                        <td className="px-4 py-2 font-medium text-gray-900 truncate max-w-[200px]">
                          {row.nama_nasabah}
                        </td>
                        <td className="px-4 py-2 truncate max-w-[150px]">
                          {row.product_code}
                        </td>
                        <td className="px-4 py-2">{row.akad}</td>
                        <td className="px-4 py-2">
                          <span className="bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded">
                            {row.segment || "-"}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-center font-bold">
                          {row.stage}
                        </td>
                        <td className="px-4 py-2 text-right text-gray-500">
                          {formatCurrency(row.plafond)}
                        </td>
                        <td className="px-4 py-2 text-right">
                          {formatCurrency(row.os_pokok)}
                        </td>
                        <td className="px-4 py-2 text-right font-medium">
                          {formatCurrency(row.os_total)}
                        </td>
                        <td className="px-4 py-2 text-right text-red-600">
                          {formatCurrency(row.past_due_total)}
                        </td>
                        <td className="px-4 py-2 text-right font-mono">
                          {row.past_due_day}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 border border-gray-100">
            <h3 className="text-lg font-bold">Konfirmasi</h3>
            <p className="text-sm text-gray-600 my-4">
              Upload dan proses file <b>{localFileName}</b>?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmOpen(false)}
                className="flex-1 px-4 py-2 rounded-xl border font-bold text-gray-600"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmProcess}
                className="flex-1 px-4 py-2 rounded-xl bg-amber-500 text-white font-bold hover:bg-amber-600"
              >
                Ya, Proses
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 text-center animate-in zoom-in-95">
            {currentImport && currentImport.failed_rows > 0 ? (
              <>
                <div className="w-20 h-20 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <AlertTriangle className="w-10 h-10" />
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
                <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-black mb-2 text-gray-800">
                  Selesai!
                </h2>
                <p className="text-gray-600 mb-8">
                  Semua data berhasil diproses dan dihitung.
                </p>
              </>
            )}

            <button
              onClick={() => setShowSuccess(false)}
              className="px-8 py-3 rounded-xl bg-gray-900 text-white font-bold hover:bg-black transition-all"
            >
              Tutup & Lihat Data
            </button>
          </div>
        </div>
      )}
    </div>
  );
}