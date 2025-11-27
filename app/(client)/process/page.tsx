"use client";

import { useEffect, useRef, useState } from "react";

// Definisikan tipe data sesuai kolom Excel
type BankingRow = {
  id: number;
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
  persenMargin: number; // Dalam desimal (e.g. 0.125)
  dayPastDue: number;
  pd: number; // Probability of Default (desimal)
  lgd: number; // Loss Given Default (desimal)
  ead: number; // Exposure at Default
  psak413: number; // Hasil hitung
  status: "Pending" | "Processing" | "Done";
};

const TOTAL_ROWS = 40;

// Generator data dummy
const BASE_ROWS: BankingRow[] = Array.from({ length: TOTAL_ROWS }, (_, i) => {
  // Randomizer sederhana untuk variasi data
  const plafond = 30000000 + Math.floor(Math.random() * 50000000);
  const pokokSisa = Math.floor(plafond * (Math.random() * 0.8));
  const marginSisa = Math.floor(pokokSisa * 0.1);
  const totalOutstanding = pokokSisa + marginSisa;
  const ead = pokokSisa; // Asumsi EAD = Pokok Sisa untuk contoh
  const pd = 0.025; // 2.50%
  const lgd = 0.8899; // 88.99%

  // RUMUS: PD * LGD * EAD
  const psak413 = pd * lgd * ead;

  return {
    id: i + 1,
    kodeCabang: "001",
    noRekening: `1608000${(71 + i * 10).toString().padStart(4, "0")}`,
    akad: "01",
    namaNasabah: [
      "MAHSUN",
      "HENDRO MARTONO",
      "PT. NUSA BAKTI",
      "SUJIMAN",
      "SAKDUL FATHI",
    ][i % 5],
    alamatNasabah: `Jalan Raya No ${i + 1}`,
    kodeProduk: "MUR01",
    startDate: "20/10/2020",
    maturityDate: "20/09/2030",
    plafond: plafond,
    pokokSisa: pokokSisa,
    marginSisa: marginSisa,
    totalOutstanding: totalOutstanding,
    noCif: `0000000${i + 1}`,
    namaProduk: "Kredit Modal Kerja - Umum",
    persenMargin: 0.125,
    dayPastDue: 3 + i * 5,
    pd: pd,
    lgd: lgd,
    ead: ead,
    psak413: psak413,
    status: "Pending",
  };
});

// Helper formatting currency IDR
const formatCurrency = (val: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 2,
  }).format(val);

// Helper formatting percent
const formatPercent = (val: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "percent",
    minimumFractionDigits: 2,
  }).format(val);

export default function ProcessPage() {
  const [hovered, setHovered] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [rows, setRows] = useState<BankingRow[]>([]);
  const [started, setStarted] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
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
    localStorage.removeItem("psak_data"); // Opsional: clear storage saat reset
  };

  const handleConfirm = () => {
    setConfirmOpen(false);
    if (running) return;
    setStarted(true);
    setRunning(true);
    setProgress(0);
    setRows([]);

    let i = 0;
    timerRef.current = setInterval(() => {
      const nextRow: BankingRow = { ...BASE_ROWS[i], status: "Processing" };
      setRows((prev) => [...prev, nextRow]);
      setProgress(Math.round(((i + 1) / TOTAL_ROWS) * 100));
      i += 1;

      if (i >= TOTAL_ROWS) {
        if (timerRef.current) clearInterval(timerRef.current);
        setRunning(false);
        setTimeout(() => {
          // Tandai semua jadi Done
          const finalRows = BASE_ROWS.map(
            (r): BankingRow => ({ ...r, status: "Done" })
          );
          setRows(finalRows);
          setProgress(100);

          // SIMPAN KE LOCAL STORAGE
          localStorage.setItem("psak_data", JSON.stringify(finalRows));

          // Tampilkan success animation
          setTimeout(() => setShowSuccess(true), 300);
        }, 600);
      }
    }, 1000); // 1 detik per row sesuai request
  };

  // Fungsi Export ke Excel (CSV) dari Local Storage
  const handleExportExcel = () => {
    const storedData = localStorage.getItem("psak_data");
    if (!storedData) {
      alert("Data tidak ditemukan di Local Storage. Silakan proses dahulu.");
      return;
    }

    try {
      const data: BankingRow[] = JSON.parse(storedData);

      // Header CSV
      const headers = [
        "KODE_CABANG",
        "NO_REKENING",
        "AKAD",
        "NAMA_NASABAH",
        "ALAMAT",
        "KODE_PRODUK",
        "PLAFOND",
        "POKOK_SISA",
        "TOTAL_OS",
        "PD",
        "LGD",
        "EAD",
        "PSAK_413",
      ];

      // Map rows ke string CSV
      const csvRows = data.map((row) => {
        return [
          row.kodeCabang,
          `'${row.noRekening}`, // Tambah kutip agar tidak jadi scientific number di excel
          `'${row.akad}`,
          `"${row.namaNasabah}"`,
          `"${row.alamatNasabah}"`,
          row.kodeProduk,
          row.plafond,
          row.pokokSisa,
          row.totalOutstanding,
          formatPercent(row.pd),
          formatPercent(row.lgd),
          row.ead,
          row.psak413,
        ].join(",");
      });

      const csvString = [headers.join(","), ...csvRows].join("\n");
      const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "data_psak_413.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Gagal export", error);
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const canStart = !running && rows.length === 0;

  return (
    <div className="min-h-[100dvh] bg-white p-6 md:p-10 font-sans text-slate-800">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-5">
          <div className="relative grid h-20 w-20 place-content-center rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-500/80 ring-1 ring-yellow-300/50 shadow-[0_8px_30px_rgba(253,224,71,0.45)]">
            <span className="pointer-events-none absolute inset-0 rounded-2xl animate-[spin_9s_linear_infinite] bg-[conic-gradient(from_0deg,rgba(255,255,255,0.15),rgba(255,255,255,0)_50%,rgba(255,255,255,0.15))]" />
            <div className="relative h-[64px] w-[64px] rounded-2xl bg-white ring-1 ring-yellow-100 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.6)] grid place-content-center">
              <video
                src="/3d-animation/icon-robot-3d.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 h-full w-full object-contain rounded-2xl"
              />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">
              Proses • PSAK 413
            </h1>
            <p className="text-sm text-gray-600">
              Perhitungan CKPN (ECL) metode PD x LGD x EAD.
            </p>
          </div>
        </div>

        {/* Tombol proses */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            disabled={!canStart}
            aria-label="Proses PSAK 413"
            className={[
              "group relative inline-flex items-center gap-3 rounded-2xl px-6 py-3.5 font-semibold text-gray-900",
              "bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-400 ring-1 ring-yellow-300/60",
              "shadow-[0_10px_30px_rgba(245,158,11,0.35)] hover:brightness-105 hover:-translate-y-0.5 active:translate-y-0 transition-all",
              !canStart && "opacity-60 cursor-not-allowed",
            ].join(" ")}
          >
            <span className="relative grid h-11 w-11 place-content-center rounded-xl bg-white ring-1 ring-yellow-200 overflow-hidden">
              <span className="absolute inset-0 rounded-xl animate-[spin_3.5s_linear_infinite] bg-[conic-gradient(from_180deg,rgba(250,204,21,0.0),rgba(250,204,21,0.6),rgba(250,204,21,0.0))]" />
              <span className="absolute inset-[2px] rounded-[10px] bg-white" />
              <div className="relative z-[1] h-8 w-8 rounded-lg bg-white ring-1 ring-yellow-100">
                <video
                  src="/3d-animation/icon-robot-3d.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="h-full w-full object-contain"
                />
              </div>
            </span>

            <span className="whitespace-nowrap">
              {hovered ? "Hitung CKPN" : "Mulai Proses"}
            </span>

            {/* Shine */}
            <span className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition">
              <span className="absolute -inset-1 rounded-2xl animate-[shine_1.8s_ease-in-out] bg-white/30" />
            </span>
          </button>
        </div>
      </div>

      {/* Modal konfirmasi */}
      {confirmOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 backdrop-blur-sm">
          <div className="w-[95%] max-w-md rounded-2xl border border-yellow-200 bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="grid h-12 w-12 place-content-center rounded-xl bg-yellow-400/20 ring-1 ring-yellow-300">
                <div className="relative h-9 w-9 rounded-lg bg-white ring-1 ring-yellow-100">
                  <video
                    src="/3d-animation/icon-robot-3d.mp4"
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 h-full w-full object-contain"
                  />
                </div>
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                Generate Data & Hitung?
              </h3>
            </div>
            <p className="mb-6 text-sm text-gray-600">
              Sistem akan memproses {TOTAL_ROWS} data nasabah, menghitung PSAK
              413 (PD*LGD*EAD), dan menyimpannya ke Local Storage.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmOpen(false)}
                className="flex-1 rounded-xl border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-500 px-4 py-2 font-semibold text-gray-900 ring-1 ring-yellow-300 hover:brightness-105"
              >
                Ya, Proses
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grid utama */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Card Content (Status Robot) */}
        <div className="relative overflow-hidden rounded-2xl border border-yellow-100 bg-white/90 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] h-fit sticky top-6">
          <div className="relative mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Status Proses</h2>
              <p className="text-sm text-gray-600">
                {running
                  ? "Sedang mengkalkulasi..."
                  : started
                  ? "Perhitungan Selesai"
                  : "Menunggu instruksi"}
              </p>
            </div>
            <div
              className={[
                "rounded-full px-3 py-1 text-xs font-semibold ring-1",
                running
                  ? "bg-amber-50 text-amber-700 ring-amber-200"
                  : started
                  ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                  : "bg-gray-50 text-gray-700 ring-gray-200",
              ].join(" ")}
            >
              {progress}%
            </div>
          </div>

          {!started ? (
            <div className="flex flex-col items-center text-center">
              <div className="relative h-56 w-56 rounded-2xl bg-white ring-1 ring-yellow-100">
                <video
                  src="/3d-animation/ai-loading-robot.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="absolute inset-0 h-full w-full object-contain"
                />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-800">
                Data Siap Diproses
              </h3>
              <p className="mt-1 max-w-md text-sm text-gray-600">
                Silahkan klik tombol di atas untuk memulai simulasi perhitungan
                massal.
              </p>
            </div>
          ) : running ? (
            <div className="flex flex-col items-center">
              <div className="relative h-56 w-56 rounded-2xl bg-white ring-1 ring-yellow-100">
                <video
                  src="/3d-animation/loading-white-robot.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="absolute inset-0 h-full w-full object-contain"
                />
              </div>
              <div className="mt-6 w-full">
                <div className="relative h-4 w-full overflow-hidden rounded-full bg-gray-100 ring-1 ring-yellow-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 transition-[width]"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="mt-2 text-center text-sm font-semibold text-gray-800">
                  Memproses data {rows.length} dari {TOTAL_ROWS}...
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center text-center">
              <div className="relative h-56 w-56 rounded-2xl bg-white ring-1 ring-emerald-200 shadow-[0_0_0_6px_rgba(16,185,129,0.06)]">
                <video
                  src="/3d-animation/loving-bot.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="absolute inset-0 h-full w-full object-contain"
                />
                <span className="pointer-events-none absolute -inset-2 rounded-3xl animate-[pulseRing_2.4s_ease-out_infinite] bg-emerald-400/20" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-emerald-700">
                Selesai! Data Tersimpan
              </h3>
              <p className="mt-1 max-w-md text-sm text-gray-600">
                Data telah disimpan di Local Storage. Anda dapat mengunduhnya
                sekarang.
              </p>
              <div className="mt-5 flex gap-3">
                <button
                  onClick={resetAll}
                  className="rounded-xl bg-white border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Reset
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Card Tabel Informasi */}
        <div
          id="tabel"
          className="relative overflow-hidden rounded-2xl border border-yellow-100 bg-white/90 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
        >
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xl font-bold text-gray-900">Tabel Informasi</h2>

            {/* Tombol Export Excel */}
            {rows.length > 0 && !running && (
              <button
                onClick={handleExportExcel}
                className="flex items-center gap-2 rounded-lg bg-[#1D6F42] px-3 py-2 text-sm font-medium text-white hover:bg-[#185c37] transition-colors shadow-sm"
              >
                {/* Icon Excel Simple */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5"
                >
                  <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2ZM15.8 17.24C15.8 17.24 14.58 15.32 14.15 14.61L15.93 11.66H18.25L15.39 16.09L18.36 20.75H15.98L13.62 16.92L11.23 20.75H8.91L11.96 16.03L9.16 11.66H11.53L13.19 14.39C13.19 14.39 13.35 14.69 13.35 14.69L14.7 11.66H17.23L15.8 17.24Z" />
                </svg>
                Export Excel
              </button>
            )}
          </div>

          <div className="max-h-[600px] overflow-auto rounded-xl ring-1 ring-yellow-100 bg-white">
            <table className="min-w-max divide-y divide-gray-200">
              <thead className="bg-gray-100 sticky top-0 z-10">
                <tr className="text-left text-xs uppercase tracking-wider font-bold text-gray-700">
                  <th className="px-4 py-3 bg-gray-100">Kode Cab</th>
                  <th className="px-4 py-3 bg-gray-100">No Rekening</th>
                  <th className="px-4 py-3 bg-gray-100">Akad</th>
                  <th className="px-4 py-3 bg-gray-100">Nama Nasabah</th>
                  <th className="px-4 py-3 bg-gray-100">Alamat</th>
                  <th className="px-4 py-3 bg-gray-100">Produk</th>
                  <th className="px-4 py-3 bg-gray-100 text-right">
                    Start Date
                  </th>
                  <th className="px-4 py-3 bg-gray-100 text-right">Maturity</th>
                  <th className="px-4 py-3 bg-gray-100 text-right">Plafond</th>
                  <th className="px-4 py-3 bg-gray-100 text-right">
                    Pokok Sisa
                  </th>
                  <th className="px-4 py-3 bg-gray-100 text-right">Total OS</th>
                  <th className="px-4 py-3 bg-gray-100 text-right">PD</th>
                  <th className="px-4 py-3 bg-gray-100 text-right">LGD</th>
                  <th className="px-4 py-3 bg-gray-100 text-right">EAD</th>
                  <th className="px-4 py-3 bg-blue-50 text-blue-900 text-right border-l border-blue-100">
                    PSAK 413
                  </th>
                  <th className="px-4 py-3 bg-gray-100 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {rows.map((r) => (
                  <tr
                    key={r.id}
                    className="animate-[fadeInUp_.35s_ease-out] bg-white hover:bg-yellow-50/60"
                  >
                    <td className="px-4 py-2 font-mono">{r.kodeCabang}</td>
                    <td className="px-4 py-2 font-mono">{r.noRekening}</td>
                    <td className="px-4 py-2 text-center">{r.akad}</td>
                    <td className="px-4 py-2 font-medium text-gray-900">
                      {r.namaNasabah}
                    </td>
                    <td className="px-4 py-2 truncate max-w-[150px]">
                      {r.alamatNasabah}
                    </td>
                    <td className="px-4 py-2">{r.kodeProduk}</td>
                    <td className="px-4 py-2 text-right">{r.startDate}</td>
                    <td className="px-4 py-2 text-right">{r.maturityDate}</td>
                    <td className="px-4 py-2 text-right">
                      {formatCurrency(r.plafond)}
                    </td>
                    <td className="px-4 py-2 text-right">
                      {formatCurrency(r.pokokSisa)}
                    </td>
                    <td className="px-4 py-2 text-right font-medium">
                      {formatCurrency(r.totalOutstanding)}
                    </td>
                    <td className="px-4 py-2 text-right">
                      {formatPercent(r.pd)}
                    </td>
                    <td className="px-4 py-2 text-right">
                      {formatPercent(r.lgd)}
                    </td>
                    <td className="px-4 py-2 text-right">
                      {formatCurrency(r.ead)}
                    </td>
                    <td className="px-4 py-2 text-right font-bold text-blue-700 bg-blue-50/30 border-l border-blue-50">
                      {formatCurrency(r.psak413)}
                    </td>
                    <td className="px-4 py-2 text-center">
                      <span
                        className={[
                          "inline-block h-2 w-2 rounded-full",
                          r.status === "Done"
                            ? "bg-emerald-500"
                            : r.status === "Processing"
                            ? "bg-amber-500 animate-pulse"
                            : "bg-gray-300",
                        ].join(" ")}
                      />
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td
                      colSpan={16}
                      className="px-4 py-20 text-center text-sm text-gray-500 bg-gray-50/50"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-3xl">📊</span>
                        <span>
                          Data belum dimuat. Klik <b>Mulai Proses</b>.
                        </span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* SUCCESS OVERLAY */}
      {showSuccess && (
        <div className="fixed inset-0 z-[60] grid place-items-center bg-black/40 backdrop-blur-sm">
          <div className="relative w-[95%] max-w-lg overflow-hidden rounded-3xl border border-emerald-200 bg-white p-8 shadow-2xl">
            {/* burst glow */}
            <div className="pointer-events-none absolute -inset-10 opacity-40 blur-2xl">
              <div className="h-full w-full rounded-[48px] bg-[radial-gradient(circle,rgba(16,185,129,0.35),transparent_60%)]" />
            </div>

            <div className="relative flex flex-col items-center">
              {/* check pulse */}
              <div className="relative mb-4 grid h-20 w-20 place-content-center rounded-full bg-emerald-500 text-white shadow-lg">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  className="mx-auto"
                >
                  <path
                    fill="currentColor"
                    d="M9 16.2l-3.5-3.5l1.4-1.4L9 13.4l7.1-7.1l1.4 1.4z"
                  />
                </svg>
                <span className="pointer-events-none absolute -inset-2 rounded-full animate-[ring_1.8s_ease-out_infinite] bg-emerald-400/35" />
              </div>

              <h3 className="text-xl font-extrabold text-emerald-700">
                Sukses Diproses!
              </h3>
              <p className="mt-1 text-center text-sm text-gray-600">
                Seluruh data telah selesai diproses. Anda bisa mengunduh file
                Excel sekarang.
              </p>

              {/* confetti ringan */}
              <div className="pointer-events-none absolute inset-x-0 -top-3">
                <div className="mx-auto h-6 w-80">
                  {Array.from({ length: 24 }).map((_, i) => (
                    <span
                      key={i}
                      className="absolute block h-1.5 w-1.5 animate-confetti rounded-[2px]"
                      style={{
                        left: `${(i / 24) * 100}%`,
                        animationDelay: `${(i % 6) * 0.12}s`,
                        background:
                          i % 3 === 0
                            ? "#34d399"
                            : i % 3 === 1
                            ? "#fbbf24"
                            : "#60a5fa",
                      }}
                    />
                  ))}
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setShowSuccess(false)}
                  className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Tutup
                </button>
                <button
                  onClick={() => {
                    handleExportExcel();
                    setShowSuccess(false);
                  }}
                  className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 shadow-lg shadow-emerald-200"
                >
                  Download Excel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Styles */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slide {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(200%);
          }
        }
        @keyframes shine {
          0% {
            opacity: 0;
            transform: translateX(-120%) skewX(-12deg);
          }
          50% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: translateX(120%) skewX(-12deg);
          }
        }
        @keyframes pulseRing {
          0% {
            transform: scale(0.9);
            opacity: 0.6;
          }
          70% {
            transform: scale(1.1);
            opacity: 0;
          }
          100% {
            opacity: 0;
          }
        }
        @keyframes ring {
          0% {
            transform: scale(0.9);
            opacity: 0.5;
          }
          80% {
            transform: scale(1.15);
            opacity: 0;
          }
          100% {
            opacity: 0;
          }
        }
        @keyframes confetti {
          0% {
            transform: translateY(0) rotate(0);
            opacity: 1;
          }
          100% {
            transform: translateY(24px) rotate(160deg);
            opacity: 0;
          }
        }
        .animate-confetti {
          animation: confetti 0.9s ease-out forwards;
        }
        /* Custom Scrollbar untuk Table */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb {
          background: #d4d4d4;
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #a3a3a3;
        }
      `}</style>
    </div>
  );
}