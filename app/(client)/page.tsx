"use client";

import { useMemo, useState, useEffect } from "react";
import {
  ArrowUpRight,
  Calendar,
  DollarSign,
  Loader2,
  TrendingUp,
} from "lucide-react";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions,
  ChartData,
  Title,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";

// --- IMPORT SERVICE ---
import { api } from "@/services/api";
import type {
  EclPerStageData,
  EclPerSegmentData,
  EclPerProductData,
  TotalEclPerBranch,
  TotalEclPerAkad,
} from "@/services/api";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Title
);

// Formatter standar untuk tampilan ringkas di Axis/Card
const rupiah = (n: number): string =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);

// Formatter presisi untuk Tooltip (Menampilkan desimal sesuai API)
const rupiahPrecise = (n: number): string =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format(n);

// Helper untuk format tanggal default (YYYY-MM-DD)
const formatDateInput = (date: Date) => {
  return date.toISOString().split("T")[0];
};

/* ===== Komponen Kartu ===== */
function Card({
  title,
  children,
  currentDate,
}: {
  title: string;
  children: React.ReactNode;
  currentDate: string;
}) {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-lg border-2 border-orange-100 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-2xl font-black text-gray-900">{title}</h3>
        <button className="p-2 rounded-full hover:bg-orange-50 transition-colors transform hover:rotate-45">
          <ArrowUpRight className="w-5 h-5 text-orange-600" />
        </button>
      </div>
      <div className="flex-1 min-h-[300px] relative">{children}</div>
      <div className="mt-4 text-center text-sm font-semibold text-gray-600">
        Filter Date : {currentDate}
      </div>
    </div>
  );
}

/* =================== DASHBOARD =================== */
export default function Dashboard() {
  // --- DATE FILTER STATE (DYNAMIC) ---
  const today = new Date();
  const pastDate = new Date();
  pastDate.setFullYear(today.getFullYear() - 2);

  const [dateRange, setDateRange] = useState({
    from: formatDateInput(pastDate),
    to: formatDateInput(today),
  });

  // --- DASHBOARD DATA STATES ---
  const [isLoading, setIsLoading] = useState(true);

  // ECL Data
  const [totalEcl, setTotalEcl] = useState(0);
  const [eclByStage, setEclByStage] = useState<EclPerStageData[]>([]);
  const [eclBySegment, setEclBySegment] = useState<EclPerSegmentData[]>([]);
  const [eclByProduct, setEclByProduct] = useState<EclPerProductData[]>([]);
  const [eclByBranch, setEclByBranch] = useState<TotalEclPerBranch[]>([]);
  const [eclByAkad, setEclByAkad] = useState<TotalEclPerAkad[]>([]);

  // --- FETCH DATA ---
  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true);
      try {
        const dateParams = {
          from_date: dateRange.from,
          to_date: dateRange.to,
        };

        const [
          resTotalEcl,
          resEclStage,
          resEclSegment,
          resEclProduct,
          resEclBranch,
          resEclAkad,
        ] = await Promise.all([
          api.dashboard.getTotalEcl(dateParams),
          api.dashboard.getEclPerStage(dateParams),
          api.dashboard.getEclPerSegment(dateParams),
          api.dashboard.getEclPerProduct(dateParams),
          api.dashboard.getEclPerBranch(dateParams),
          api.dashboard.getEclPerAkad(dateParams),
        ]);

        if (resTotalEcl.code === 200) setTotalEcl(resTotalEcl.data);
        if (resEclStage.code === 200) setEclByStage(resEclStage.data);
        if (resEclSegment.code === 200) setEclBySegment(resEclSegment.data);
        if (resEclProduct.code === 200) setEclByProduct(resEclProduct.data);
        if (resEclBranch.code === 200) setEclByBranch(resEclBranch.data);
        if (resEclAkad.code === 200) setEclByAkad(resEclAkad.data);
      } catch (error) {
        console.error("Dashboard data fetch failed:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [dateRange]);

  /* ======= Summary Stats ======= */
  const summaryStats = [
    {
      title: "Total ECL (Expected Credit Loss)",
      subtitle: "Total Provision Amount",
      amount: isLoading ? "Loading..." : rupiah(totalEcl),
      change: "+1.9%",
      trend: "vs last period",
      isPositive: true,
      icon: DollarSign,
      gradient: "from-yellow-400 to-orange-500",
    },
  ];

  /* ====== Chart Data Preparation ====== */

  // 1. Chart Branch (Real Data - Apa Adanya)
  const dataBranch: ChartData<"bar"> = useMemo(
    () => ({
      // Menggunakan key "cab" langsung dari API
      labels: eclByBranch.map((d) => `Cab ${d.cab}`),
      datasets: [
        {
          label: "ECL Amount",
          // Parsing string float "6570738801353.5800" menjadi number
          data: eclByBranch.map((d) => parseFloat(d.total_ecl)),
          backgroundColor: "#7CB5FF",
          borderRadius: 8,
          borderSkipped: false,
        },
      ],
    }),
    [eclByBranch]
  );

  // 2. Chart Stage
  const dataStage: ChartData<"doughnut"> = useMemo(
    () => ({
      labels: eclByStage.map((d) => `Stage ${d.stage}`),
      datasets: [
        {
          data: eclByStage.map((d) => d.total_ecl),
          backgroundColor: ["#7CB5FF", "#374151", "#86EFAC"],
          borderWidth: 0,
          hoverOffset: 6,
        },
      ],
    }),
    [eclByStage]
  );

  // 3. Chart Segment
  const dataSegment: ChartData<"bar"> = useMemo(
    () => ({
      labels: eclBySegment.map((d) => d.segment),
      datasets: [
        {
          label: "Total ECL",
          data: eclBySegment.map((d) => d.total_ecl),
          backgroundColor: "#7CB5FF",
          borderRadius: 8,
          borderSkipped: false,
        },
      ],
    }),
    [eclBySegment]
  );

  // 4. Chart Product
  const dataProduct: ChartData<"bar"> = useMemo(
    () => ({
      labels: eclByProduct.map((d) => d.product),
      datasets: [
        {
          label: "Total ECL",
          data: eclByProduct.map((d) => d.total_ecl),
          backgroundColor: "#93C5FD",
          borderRadius: 10,
          borderSkipped: false,
        },
      ],
    }),
    [eclByProduct]
  );

  // 5. Chart Akad
const dataAkad: ChartData<"bar"> = useMemo(
  () => ({
    labels: eclByAkad.map((d) => d.akad),
    datasets: [
      {
        label: "Total ECL",
        data: eclByAkad.map((d) => parseFloat(d.total_ecl.toString())),
        backgroundColor: "#FBBF24", // Warna Amber/Kuning agar variatif
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  }),
  [eclByAkad]
);

  /* ====== Chart Options ====== */
  const commonBarOptions: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          // Menggunakan rupiahPrecise untuk tooltip agar angka desimal terlihat
          label: (c) => `Total: ${rupiahPrecise(Number(c.raw))}`,
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: "#111827",
          font: { weight: "bold", size: 10 },
          autoSkip: false,
          maxRotation: 45,
          minRotation: 45,
        },
        grid: { color: "rgba(0,0,0,0.05)" },
      },
      y: {
        ticks: {
          callback: (v) => {
            const val = Number(v);
            return new Intl.NumberFormat("id-ID", {
              notation: "compact",
              compactDisplay: "short",
            }).format(val);
          },
          color: "#374151",
          font: { weight: "bold" },
        },
        grid: { color: "rgba(0,0,0,0.06)" },
      },
    },
  };

  // Options khusus untuk Branch agar label Y-axis tidak terpotong
  const optionsBranch: ChartOptions<"bar"> = {
    ...commonBarOptions,
    indexAxis: "y",
    scales: {
      x: {
        ...commonBarOptions.scales?.y,
        ticks: {
          ...commonBarOptions.scales?.y?.ticks,
          maxRotation: 0,
          minRotation: 0,
        },
      },
      y: {
        ...commonBarOptions.scales?.x,
        ticks: {
          ...commonBarOptions.scales?.x?.ticks,
          maxRotation: 0,
          minRotation: 0,
        },
      },
    },
    plugins: {
      ...commonBarOptions.plugins,
      tooltip: {
        callbacks: {
          // Tampilkan RAW value jika hover, agar sesuai 100% dengan API
          label: (c) =>
            `Rp ${new Intl.NumberFormat("id-ID").format(Number(c.raw))}`,
        },
      },
    },
  };

  const optionsStage: ChartOptions<"doughnut"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right",
        labels: { usePointStyle: true, pointStyle: "circle", boxWidth: 8 },
      },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.label}: ${rupiahPrecise(Number(ctx.parsed))}`,
        },
      },
    },
    cutout: "58%",
  };

  /* =================== UI =================== */
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-amber-50 p-4 md:p-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">
          Dashboard Overview
        </h1>
        <p className="text-gray-600 font-medium">
          Monitor and analyze your Expected Credit Loss data
        </p>
      </div>

      {/* Date Filter Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white rounded-2xl shadow-md border-2 border-orange-200">
            <Calendar className="w-5 h-5 text-orange-600" />
          </div>
          <span className="text-sm font-bold text-gray-700">Date Range Filter</span>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2 bg-white p-3 rounded-2xl shadow-md border-2 border-orange-200 w-full sm:w-auto">
          <div className="flex items-center gap-2 px-2">
            <span className="text-xs font-bold text-gray-500 uppercase">
              From
            </span>
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) =>
                setDateRange({ ...dateRange, from: e.target.value })
              }
              className="font-semibold text-gray-700 outline-none text-sm cursor-pointer"
            />
          </div>
          <div className="hidden sm:block w-px h-6 bg-gray-200"></div>
          <div className="flex items-center gap-2 px-2">
            <span className="text-xs font-bold text-gray-500 uppercase">
              To
            </span>
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) =>
                setDateRange({ ...dateRange, to: e.target.value })
              }
              className="font-semibold text-gray-700 outline-none text-sm cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Summary Stats Card */}
      <div className="mb-8">
        {summaryStats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="group relative bg-white rounded-3xl p-8 shadow-xl border-2 border-orange-100 hover:shadow-2xl hover:border-orange-300 transition-all duration-300 overflow-hidden"
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-5`}
              />
              <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div
                    className={`p-4 rounded-2xl bg-gradient-to-br ${stat.gradient} shadow-lg`}
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      {stat.title}
                    </h3>
                    <p className="text-sm text-gray-600 font-medium">
                      {stat.subtitle}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-start md:items-end gap-3">
                  <span className="text-4xl font-black text-gray-900">
                    {stat.amount}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 px-3 py-1.5 bg-green-100 rounded-xl border border-green-200">
                      <TrendingUp className="w-4 h-4 text-green-700" />
                      <span className="text-sm font-bold text-green-700">
                        {stat.change}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-gray-500">
                      {stat.trend}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ===== Charts Section ===== */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Chart Branch - Tampilkan Data Raw dari API */}
            <Card
              title="Expected Credit Loss by Branch"
              currentDate={`${dateRange.from} - ${dateRange.to}`}
            >
              <div className="h-full w-full">
                <Bar data={dataBranch} options={optionsBranch} />
              </div>
            </Card>

            <Card
              title="Expected Credit Loss by Stage"
              currentDate={`${dateRange.from} - ${dateRange.to}`}
            >
              <div className="h-full w-full flex justify-center">
                <Doughnut data={dataStage} options={optionsStage} />
              </div>
            </Card>
          </div>

          <Card
            title="Expected Credit Loss by Segment"
            currentDate={`${dateRange.from} - ${dateRange.to}`}
          >
            <div className="h-full w-full overflow-x-auto">
              <div className="min-w-[600px] h-full">
                <Bar data={dataSegment} options={commonBarOptions} />
              </div>
            </div>
          </Card>

          {/* TAMBAHKAN INI: Chart Akad */}
          <Card
            title="Expected Credit Loss by Akad"
            currentDate={`${dateRange.from} - ${dateRange.to}`}
          >
            <div className="h-full w-full overflow-x-auto">
              <div className="min-w-[400px] h-full">
                <Bar data={dataAkad} options={commonBarOptions} />
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 gap-6 my-8">
            <Card
              title="Expected Credit Loss by Product"
              currentDate={`${dateRange.from} - ${dateRange.to}`}
            >
              <div className="h-full w-full overflow-x-auto">
                <div className="min-w-[1200px] h-full">
                  <Bar data={dataProduct} options={commonBarOptions} />
                </div>
              </div>
            </Card>
          </div>
        </>
      )}

    </div>
  );
}