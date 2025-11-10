"use client";

import { useEffect, useRef, useState } from "react";

type Row = {
  no: number;
  title: string;
  description: string;
  status: "Pending" | "Processing" | "Done";
};

const TOTAL_ROWS = 40;

const BASE_ROWS: Row[] = Array.from({ length: TOTAL_ROWS }, (_, i) => ({
  no: i + 1,
  title: `Title ${i + 1}`,
  description: `Description for item ${i + 1}`,
  status: "Pending",
}));

export default function ProcessPage() {
  const [hovered, setHovered] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [rows, setRows] = useState<Row[]>([]);
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
      const nextRow: Row = { ...BASE_ROWS[i], status: "Processing" };
      setRows((prev) => [...prev, nextRow]);
      setProgress(Math.round(((i + 1) / TOTAL_ROWS) * 100));
      i += 1;

      if (i >= TOTAL_ROWS) {
        if (timerRef.current) clearInterval(timerRef.current);
        setRunning(false);
        setTimeout(() => {
          // tandai semua jadi Done
          setRows((prev) => prev.map((r): Row => ({ ...r, status: "Done" })));
          setProgress(100);
          // tampilkan success animation sedikit jeda biar terasa
          setTimeout(() => setShowSuccess(true), 300);
        }, 600);
      }
    }, 1000);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const canStart = !running && rows.length === 0;

  return (
    <div className="min-h-[100dvh] bg-white p-6 md:p-10">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
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
              Modul keuangan – rekognisi pendapatan & kewajiban (banking).
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
              {hovered ? "Proses PSAK 413" : "PSAK 413"}
            </span>

            {/* Shine */}
            <span className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition">
              <span className="absolute -inset-1 rounded-2xl animate-[shine_1.8s_ease-in-out] bg-white/30" />
            </span>

            {/* Tooltip */}
            <span className="pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 scale-0 rounded-md bg-black/80 px-2 py-1 text-xs text-white opacity-0 shadow-lg transition-all group-hover:opacity-100 group-hover:scale-100">
              Proses PSAK 413
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
                Mulai Proses PSAK 413?
              </h3>
            </div>
            <p className="mb-6 text-sm text-gray-600">
              Proses akan berjalan ~40 detik. Tabel informasi akan terisi
              otomatis satu per baris tiap detik.
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
                Ya, Mulai
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grid utama */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Card Content */}
        <div className="relative overflow-hidden rounded-2xl border border-yellow-100 bg-white/90 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
          {/* Border anim tipis */}
          <span className="pointer-events-none absolute inset-0 rounded-2xl [mask-image:linear-gradient(to_bottom,white,transparent)]">
            <span className="absolute -inset-[1px] rounded-2xl bg-[conic-gradient(from_90deg,rgba(253,230,138,0.5),rgba(251,191,36,0.35),rgba(253,230,138,0.5))] opacity-30" />
          </span>

          <div className="relative mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Status Proses</h2>
              <p className="text-sm text-gray-600">
                {running
                  ? "Sedang bekerja..."
                  : started
                  ? "Selesai"
                  : "Belum dimulai"}
              </p>
            </div>

            {/* Badge progress */}
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

          {/* Robot + teks */}
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
                Belum ada proses
              </h3>
              <p className="mt-1 max-w-md text-sm text-gray-600">
                Silahkan proses terlebih dahulu dengan mengklik tombol{" "}
                <span className="font-semibold text-gray-900">
                  Proses PSAK 413
                </span>{" "}
                yang ada iconnya.
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

              {/* Progress bar */}
              <div className="mt-6 w-full">
                <div className="relative h-4 w-full overflow-hidden rounded-full bg-gray-100 ring-1 ring-yellow-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 transition-[width]"
                    style={{ width: `${progress}%` }}
                  />
                  <div
                    className="pointer-events-none absolute inset-y-0 w-24 -translate-x-24 animate-[slide_1.8s_linear_infinite] bg-white/40 blur-sm"
                    style={{
                      maskImage:
                        "linear-gradient(to right, transparent, black, transparent)",
                      WebkitMaskImage:
                        "linear-gradient(to right, transparent, black, transparent)",
                    }}
                  />
                </div>
                <div className="mt-2 text-center text-sm font-semibold text-gray-800">
                  {progress}% selesai
                </div>
              </div>
            </div>
          ) : (
            // Selesai: robot loving-bot
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
                {/* ring sukses berdenyut */}
                <span className="pointer-events-none absolute -inset-2 rounded-3xl animate-[pulseRing_2.4s_ease-out_infinite] bg-emerald-400/20" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-emerald-700">
                Proses selesai dengan sukses!
              </h3>
              <p className="mt-1 max-w-md text-sm text-gray-600">
                Semua data telah diproses dan tabel terisi lengkap.
              </p>

              <div className="mt-5 flex gap-3">
                <button
                  onClick={resetAll}
                  className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2 text-sm font-semibold text-white ring-1 ring-emerald-300 hover:brightness-105"
                >
                  Clear all
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
          <h2 className="mb-4 text-xl font-bold text-gray-900">
            Tabel Informasi
          </h2>

          <div className="max-h-[520px] overflow-auto rounded-xl ring-1 ring-yellow-100">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-yellow-50 to-amber-50/60">
                <tr className="text-left text-sm font-semibold text-gray-700">
                  <th className="w-16 px-4 py-3">No</th>
                  <th className="px-4 py-3">Judul</th>
                  <th className="px-4 py-3">Deskripsi</th>
                  <th className="w-32 px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((r) => (
                  <tr
                    key={r.no}
                    className="animate-[fadeInUp_.35s_ease-out] bg-white/80 hover:bg-yellow-50/60"
                    style={{ animationDelay: `${(r.no % 4) * 0.03}s` }}
                  >
                    <td className="px-4 py-3 text-sm text-gray-700">{r.no}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {r.title}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {r.description}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={[
                          "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1",
                          r.status === "Done" &&
                            "bg-emerald-50 text-emerald-700 ring-emerald-200",
                          r.status === "Processing" &&
                            "bg-amber-50 text-amber-700 ring-amber-200",
                          r.status === "Pending" &&
                            "bg-gray-50 text-gray-700 ring-gray-200",
                        ].join(" ")}
                      >
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-10 text-center text-sm text-gray-500"
                    >
                      Data belum dimuat. Klik tombol <b>PSAK 413</b> untuk
                      memulai proses.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* (Opsional) tombol manual */}
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              disabled={running || rows.length > 0}
              onClick={() => {
                let i = 0;
                const manual = setInterval(() => {
                  const nextRow: Row = {
                    ...BASE_ROWS[i],
                    status: "Processing",
                  };
                  setRows((prev) => [...prev, nextRow]);
                  i += 1;
                  if (i >= TOTAL_ROWS) clearInterval(manual);
                }, 1000);
              }}
              className={[
                "rounded-xl px-4 py-2 text-sm font-semibold transition",
                "bg-gray-100 text-gray-700 hover:bg-gray-200",
                (running || rows.length > 0) && "opacity-50 cursor-not-allowed",
              ].join(" ")}
            >
              Muat Tabel (Manual)
            </button>
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
                Seluruh data telah selesai diproses. Robot beralih ke mode happy
                ❤️
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
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Keyframes */}
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
      `}</style>
    </div>
  );
}