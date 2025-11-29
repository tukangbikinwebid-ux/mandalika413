"use client";

import { useEffect, useRef, useState } from "react";
import * as XLSX from "xlsx";

// Definisi Tipe Data Lengkap Sesuai Kolom Excel
type BankingRow = {
  id: number;
  // Data Mentah dari Excel
  kodeCabang: string;
  noRekening: string;
  akad: string;
  namaNasabah: string;
  alamatNasabah: string;
  kodeProduk: string;
  startDate: string;
  maturityDate: string;
  plafond: number;
  pokokSisa: number;
  marginSisa: number;
  totalOutstanding: number;
  noCif: string;
  namaProduk: string;
  persenMargin: number;
  dayPastDue: number;
  
  pd: number;   // Q (Probability of Default)
  lgd: number;  // R (Loss Given Default)
  ead: number;  // S (Exposure at Default)
  
  psak413: number; 
  
  status: "Pending" | "Processing" | "Done";
};

// --- Helper Functions ---

// 1. Parser Angka Indonesia (cth: "50.000.000,00" -> 50000000)
const parseIndonesianNumber = (val: string | number | undefined): number => {
  if (typeof val === "number") return val;
  if (!val) return 0;
  // Hapus titik ribuan, ganti koma desimal jadi titik
  const cleanStr = val.toString().replace(/\./g, "").replace(",", ".");
  return parseFloat(cleanStr) || 0;
};

// 2. Parser Persen Indonesia (cth: "2,50%" -> 0.025)
const parseIndonesianPercent = (val: string | number | undefined): number => {
  if (typeof val === "number") return val < 1 ? val : val / 100; 
  if (!val) return 0;
  const cleanStr = val.toString().replace("%", "").replace(",", ".");
  const num = parseFloat(cleanStr);
  return num ? num / 100 : 0; 
};

// 3. Format Currency (Rp)
const formatCurrency = (val: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 2,
  }).format(val);

// 4. Format Persen (%)
const formatPercent = (val: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "percent",
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format(val);

// 5. Format Tanggal (Serial Excel ke String atau String ke String)
const formatDate = (val: string | number | undefined) => {
  if (!val) return "-";
  // Jika Excel memberikan serial number date (misal 44123)
  if (typeof val === 'number') {
    const date = new Date(Math.round((val - 25569)*86400*1000));
    return date.toLocaleDateString("id-ID");
  }
  return val.toString();
};

export default function ProcessPage() {
  const [hovered, setHovered] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [rows, setRows] = useState<BankingRow[]>([]);
  const [started, setStarted] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [fileName, setFileName] = useState<string>("");
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const resetAll = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setHovered(false);
    setConfirmOpen(false);
    setRunning(false);
    setProgress(0);
    setRows([]);
    setStarted(false);
    setShowSuccess(false);
    setFileName("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // --- FUNGSI 1: UPLOAD & BACA SEMUA KOLOM ---
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: "binary" });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      
      const dataRaw: Record<string, unknown>[] = XLSX.utils.sheet_to_json(ws);

      const mappedData: BankingRow[] = dataRaw.map((row, index) => {
        // Mapping detil semua kolom
        return {
          id: index + 1,
          kodeCabang: String(row["KODE_CABANG"] ?? ""),
          noRekening: String(row["NO_REKENING"] ?? ""),
          akad: String(row["AKAD"] ?? ""),
          namaNasabah: String(row["NAMA_NASABAH"] ?? ""),
          alamatNasabah: String(row["ALAMAT_NASABAH"] ?? ""),
          kodeProduk: String(row["KODE_PRODUK"] ?? ""),
          startDate: formatDate(row["START_DATE"] as string | number | undefined),
          maturityDate: formatDate(row["MATURITY_DATE"] as string | number | undefined),
          plafond: parseIndonesianNumber(row["PLAFOND"] as string | number | undefined),
          pokokSisa: parseIndonesianNumber(Number(row["POKOK_SISA"])),
          marginSisa: parseIndonesianNumber(Number(row["MARGIN_SISA"])),
          totalOutstanding: parseIndonesianNumber(Number(row["TOTAL_OUTSTANDING"])),
          noCif: String(row["NO_CIF"] ?? ""),
          namaProduk: String(row["NAMA_PRODUK"] ?? ""),
          persenMargin: parseIndonesianPercent(row["PERSEN_MARGIN_PINJAMAN"] as string | number | undefined),
          dayPastDue: parseInt(String(row["DAY_PAST_DUE"])) || 0,
          
          // Kolom Kunci Rumus
          pd: parseIndonesianPercent(row["PD"] as string | number | undefined),
          lgd: parseIndonesianPercent(row["LGD"] as string | number | undefined),
          ead: parseIndonesianNumber(row["EAD"] as string | number | undefined),
          
          psak413: 0, // Inisialisasi 0
          status: "Pending",
        };
      });

      setRows(mappedData);
    };
    reader.readAsBinaryString(file);
  };

  // --- FUNGSI 2: PROSES HITUNG ---
  const handleConfirm = () => {
    setConfirmOpen(false);
    if (running || rows.length === 0) return;
    
    setStarted(true);
    setRunning(true);
    setProgress(0);

    let currentIndex = 0;
    const total = rows.length;

    timerRef.current = setInterval(() => {
      const batchSize = Math.max(1, Math.floor(total / 40)); // Batch processing agar UI smooth
      
      setRows((prevRows) => {
        const newRows = [...prevRows];
        for (let i = -1; i < batchSize; i++) {
          const idx = currentIndex + i;
          if (idx < total) {
            const row = newRows[idx];
            // RUMUS: PD * LGD * EAD
            const result = row.pd * row.lgd * row.ead;
            
            newRows[idx] = {
              ...row,
              psak413: result,
              status: "Done",
            };
          }
        }
        return newRows;
      });

      currentIndex += batchSize;
      const currentProgress = Math.min(100, Math.round((currentIndex / total) * 100));
      setProgress(currentProgress);

      if (currentIndex >= total) {
        if (timerRef.current) clearInterval(timerRef.current);
        setRunning(false);
        setTimeout(() => setShowSuccess(true), 500);
      }
    }, 50); // Speed update
  };

  // --- FUNGSI 3: EXPORT SEMUA DATA ---
  const handleExportExcel = () => {
    // Map ulang agar urutan kolom rapih dan format angka benar
    const dataToExport = rows.map((row) => ({
      "KODE_CABANG": row.kodeCabang,
      "NO_REKENING": row.noRekening,
      "AKAD": row.akad,
      "NAMA_NASABAH": row.namaNasabah,
      "ALAMAT_NASABAH": row.alamatNasabah,
      "KODE_PRODUK": row.kodeProduk,
      "START_DATE": row.startDate,
      "MATURITY_DATE": row.maturityDate,
      "PLAFOND": row.plafond,
      "POKOK_SISA": row.pokokSisa,
      "MARGIN_SISA": row.marginSisa,
      "TOTAL_OUTSTANDING": row.totalOutstanding,
      "NO_CIF": row.noCif,
      "NAMA_PRODUK": row.namaProduk,
      "PERSEN_MARGIN": row.persenMargin, // Dalam desimal (biar user bisa format % di excel sendiri)
      "DAY_PAST_DUE": row.dayPastDue,
      "PD": row.pd,
      "LGD": row.lgd,
      "EAD": row.ead,
      "PSAK_413 (HASIL)": row.psak413 // Kolom Hasil
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    
    // Auto width columns (opsional, biar rapi)
    const wscols = Object.keys(dataToExport[0]).map(() => ({ wch: 15 }));
    worksheet['!cols'] = wscols;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Hasil PSAK 413");
    XLSX.writeFile(workbook, `Hasil_PSAK413_${new Date().getTime()}.xlsx`);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const canStart = !running && rows.length > 0 && !started;

  return (
    <div className="min-h-[100dvh] bg-white p-4 md:p-8 font-sans text-slate-800">
      {/* Header Section */}
      <div className="mb-6 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <div className="grid h-16 w-16 place-content-center rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-500 text-3xl shadow-lg shadow-yellow-200">
            📊
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">
              Kalkulator PSAK 413
            </h1>
            <p className="text-sm text-gray-600">
              Upload Excel Lengkap &rarr; Hitung CKPN (PD × LGD × EAD)
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="file"
            accept=".xlsx, .xls, .csv"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            disabled={running || started}
          />

          {!fileName ? (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-5 py-3 rounded-xl font-semibold bg-white border border-dashed border-gray-400 text-gray-600 hover:bg-gray-50 hover:border-gray-500 transition-all"
            >
              <span>📂 Upload Excel</span>
            </button>
          ) : (
            <div className="flex items-center gap-3 bg-blue-50 px-4 py-2 rounded-xl border border-blue-200">
              <div className="flex flex-col">
                <span className="text-xs text-blue-500 font-bold uppercase tracking-wider">File Terpilih</span>
                <span className="text-sm font-semibold text-blue-900 truncate max-w-[150px]">{fileName}</span>
              </div>
              {!started && !running && (
                <button onClick={resetAll} className="p-1 rounded-full hover:bg-blue-100 text-blue-400 hover:text-red-500 transition-colors">
                  ✕
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
              "relative px-6 py-3 rounded-xl font-bold text-white shadow-lg transition-all",
              !canStart 
                ? "bg-gray-300 cursor-not-allowed" 
                : "bg-gradient-to-r from-amber-500 to-orange-500 hover:scale-105 hover:shadow-orange-200"
            ].join(" ")}
          >
             {hovered ? "Jalankan Skrip ⚡" : "Mulai Proses ▶"}
          </button>
        </div>
      </div>

      {/* Main Layout */}
      <div className="grid gap-6 lg:grid-cols-4">
        
        {/* Sidebar Status */}
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-2">Progress</h3>
            <div className="flex items-end gap-2 mb-2">
              <span className="text-4xl font-black text-gray-900">{progress}%</span>
              <span className="text-sm font-medium text-gray-500 mb-1.5">Selesai</span>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="mt-4 text-xs text-gray-500 text-center bg-gray-50 p-3 rounded-lg border border-gray-100">
              {running ? "Sedang menghitung baris per baris..." : 
               started ? "Proses selesai. Siap unduh." : 
               rows.length > 0 ? `${rows.length} Data siap diproses` : "Menunggu file..."}
            </div>
          </div>
        </div>

        {/* Data Table Section - Full Width & Scrollable */}
        <div className="lg:col-span-3">
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm flex flex-col h-[70vh]">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-2xl">
              <h2 className="font-bold text-gray-800">Preview Data ({rows.length} Rows)</h2>
              {rows.length > 0 && !running && (
                <button 
                  onClick={handleExportExcel}
                  className="flex items-center gap-2 bg-emerald-600 text-white text-xs font-bold px-3 py-2 rounded-lg hover:bg-emerald-700 shadow-md shadow-emerald-100 transition-all"
                >
                  📥 Download Excel Lengkap
                </button>
              )}
            </div>
            
            <div className="flex-1 overflow-auto w-full relative">
              <table className="min-w-max text-xs text-left text-gray-600">
                <thead className="text-xs text-gray-700 uppercase bg-gray-100 font-bold sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="px-4 py-3 whitespace-nowrap">Status</th>
                    <th className="px-4 py-3 whitespace-nowrap bg-blue-50 text-blue-800 border-x border-blue-100 sticky left-0 z-20">PSAK 413 (Hasil)</th>
                    <th className="px-4 py-3 whitespace-nowrap">Kode Cab</th>
                    <th className="px-4 py-3 whitespace-nowrap">No Rekening</th>
                    <th className="px-4 py-3 whitespace-nowrap">Nama Nasabah</th>
                    <th className="px-4 py-3 whitespace-nowrap">Alamat</th>
                    <th className="px-4 py-3 whitespace-nowrap">Produk</th>
                    <th className="px-4 py-3 whitespace-nowrap">Akad</th>
                    <th className="px-4 py-3 whitespace-nowrap text-right">Plafond</th>
                    <th className="px-4 py-3 whitespace-nowrap text-right">Pokok Sisa</th>
                    <th className="px-4 py-3 whitespace-nowrap text-right">Margin Sisa</th>
                    <th className="px-4 py-3 whitespace-nowrap text-right">Total OS</th>
                    <th className="px-4 py-3 whitespace-nowrap text-right">EAD</th>
                    <th className="px-4 py-3 whitespace-nowrap text-right">PD</th>
                    <th className="px-4 py-3 whitespace-nowrap text-right">LGD</th>
                    <th className="px-4 py-3 whitespace-nowrap">Start Date</th>
                    <th className="px-4 py-3 whitespace-nowrap">Maturity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={17} className="px-6 py-24 text-center text-gray-400">
                        <div className="flex flex-col items-center gap-2">
                          <span className="text-4xl opacity-50">📂</span>
                          <span>Belum ada data yang diupload</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    rows.map((row) => (
                      <tr key={row.id} className="hover:bg-yellow-50 transition-colors">
                        <td className="px-4 py-2 text-center">
                          <span className={`inline-block w-2 h-2 rounded-full ${row.status === 'Done' ? 'bg-emerald-500' : row.status === 'Processing' ? 'bg-amber-400 animate-pulse' : 'bg-gray-300'}`}></span>
                        </td>
                        <td className="px-4 py-2 font-bold text-blue-700 bg-blue-50/30 border-x border-blue-50 text-right sticky left-0 z-10">
                          {row.status === 'Pending' ? '-' : formatCurrency(row.psak413)}
                        </td>
                        <td className="px-4 py-2">{row.kodeCabang}</td>
                        <td className="px-4 py-2 font-mono">{row.noRekening}</td>
                        <td className="px-4 py-2 font-medium text-gray-900">{row.namaNasabah}</td>
                        <td className="px-4 py-2 truncate max-w-[150px]" title={row.alamatNasabah}>{row.alamatNasabah}</td>
                        <td className="px-4 py-2">{row.kodeProduk}</td>
                        <td className="px-4 py-2">{row.akad}</td>
                        <td className="px-4 py-2 text-right">{formatCurrency(row.plafond)}</td>
                        <td className="px-4 py-2 text-right">{formatCurrency(row.pokokSisa)}</td>
                        <td className="px-4 py-2 text-right">{formatCurrency(row.marginSisa)}</td>
                        <td className="px-4 py-2 text-right">{formatCurrency(row.totalOutstanding)}</td>
                        <td className="px-4 py-2 text-right font-medium">{formatCurrency(row.ead)}</td>
                        <td className="px-4 py-2 text-right">{formatPercent(row.pd)}</td>
                        <td className="px-4 py-2 text-right">{formatPercent(row.lgd)}</td>
                        <td className="px-4 py-2 text-right">{row.startDate}</td>
                        <td className="px-4 py-2 text-right">{row.maturityDate}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900">Konfirmasi</h3>
            <p className="text-sm text-gray-600 mt-2 mb-6">
              Mulai kalkulasi untuk <b>{rows.length} baris data</b>? <br/>
              Pastikan kolom PD, LGD, dan EAD sudah terisi di Excel.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmOpen(false)} className="flex-1 px-4 py-2 rounded-xl border border-gray-200 font-medium text-gray-600 hover:bg-gray-50">Batal</button>
              <button onClick={handleConfirm} className="flex-1 px-4 py-2 rounded-xl bg-amber-500 text-white font-bold hover:bg-amber-600 shadow-lg shadow-amber-200">Ya, Hitung</button>
            </div>
          </div>
        </div>
      )}

      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 text-center animate-[fadeInUp_0.4s_ease-out]">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">🎉</div>
            <h2 className="text-2xl font-black text-gray-900">Selesai!</h2>
            <p className="text-gray-600 mt-2 mb-8">
              Perhitungan PSAK 413 berhasil diselesaikan. Silakan unduh hasilnya.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowSuccess(false)} className="flex-1 px-4 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100">Tutup</button>
              <button onClick={() => { handleExportExcel(); setShowSuccess(false); }} className="flex-1 px-4 py-3 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 shadow-xl shadow-emerald-200">
                Download Excel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}