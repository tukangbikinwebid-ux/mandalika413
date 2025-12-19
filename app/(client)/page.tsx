"use client";

import { useMemo, useState, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  Calendar,
  Grid3x3,
  Plus,
  X,
  DollarSign,
  Box,
  Package,
  Layers,
  ListOrdered,
  Loader2,
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

// --- IMPORT SERVICE & MODAL ---
import { api } from "@/services/api";
import ProductCategoryModal from "@/components/modals/product-category-modal";
import ProductModal from "@/components/modals/product-modal";
import SegmentModal from "@/components/modals/segment-modal";
import StageModal from "@/components/modals/stages-modal";
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
  /* Header & widget states */
  const [showWidgetModal, setShowWidgetModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // --- DATE FILTER STATE (DYNAMIC) ---
  const today = new Date();
  const pastDate = new Date();
  pastDate.setFullYear(today.getFullYear() - 2);

  const [dateRange, setDateRange] = useState({
    from: formatDateInput(pastDate),
    to: formatDateInput(today),
  });

  // --- MODAL STATES ---
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showSegmentModal, setShowSegmentModal] = useState(false);
  const [showStageModal, setShowStageModal] = useState(false);

  // --- DASHBOARD DATA STATES ---
  const [isLoading, setIsLoading] = useState(true);

  // Count Stats
  const [counts, setCounts] = useState({
    categories: 0,
    products: 0,
    segments: 0,
    stages: 0,
  });

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
        // 1. Fetch Counts
        const [resCat, resProd, resSeg, resStage] = await Promise.all([
          api.productCategory.getAll({ paginate: 1 }),
          api.product.getAll({ paginate: 1 }),
          api.segment.getAll({ paginate: 1 }),
          api.stage.getAll({ paginate: 1 }),
        ]);

        setCounts({
          categories: resCat.code === 200 ? resCat.data.total : 0,
          products: resProd.code === 200 ? resProd.data.total : 0,
          segments: resSeg.code === 200 ? resSeg.data.total : 0,
          stages: resStage.code === 200 ? resStage.data.total : 0,
        });

        // 2. Fetch Dashboard Charts
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

        // Simpan data Branch apa adanya dari API
        if (resEclBranch.code === 200) {
          setEclByBranch(resEclBranch.data);
        }

        if (resEclAkad.code === 200) {
          setEclByAkad(resEclAkad.data);
        }
      } catch (error) {
        console.error("Dashboard data fetch failed:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [dateRange]);

  /* ======= Stats List Configuration ======= */
  const stats = [
    {
      title: "Total ECL (Provision)",
      amount: isLoading ? "Loading..." : rupiah(totalEcl),
      cents: "",
      change: "+1.9%",
      isPositive: true,
      icon: DollarSign,
      gradient: "from-yellow-400 to-orange-500",
      onClick: undefined,
    },
    {
      title: "Product Categories",
      amount: isLoading ? "..." : counts.categories.toLocaleString("id-ID"),
      cents: " Items",
      change: "Manage",
      isPositive: true,
      icon: Box,
      gradient: "from-blue-400 to-indigo-500",
      onClick: () => setShowCategoryModal(true),
    },
    {
      title: "Products",
      amount: isLoading ? "..." : counts.products.toLocaleString("id-ID"),
      cents: " Items",
      change: "Manage",
      isPositive: true,
      icon: Package,
      gradient: "from-emerald-400 to-teal-500",
      onClick: () => setShowProductModal(true),
    },
    {
      title: "Segments",
      amount: isLoading ? "..." : counts.segments.toLocaleString("id-ID"),
      cents: " Items",
      change: "Manage",
      isPositive: true,
      icon: Layers,
      gradient: "from-purple-400 to-fuchsia-500",
      onClick: () => setShowSegmentModal(true),
    },
    {
      title: "Stages",
      amount: isLoading ? "..." : counts.stages.toLocaleString("id-ID"),
      cents: " Items",
      change: "Manage",
      isPositive: true,
      icon: ListOrdered,
      gradient: "from-rose-400 to-red-500",
      onClick: () => setShowStageModal(true),
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-amber-50 p-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-8 gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto">
          <button className="p-3 bg-white rounded-2xl shadow-md border-2 border-orange-200 hover:shadow-xl hover:border-orange-300 transition-all transform hover:scale-105 hidden sm:block">
            <Calendar className="w-5 h-5 text-orange-600" />
          </button>

          {/* --- DATE PICKER INPUTS --- */}
          <div className="flex flex-col sm:flex-row items-center gap-2 bg-white p-2 rounded-2xl shadow-md border-2 border-orange-200 w-full sm:w-auto">
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

        <div className="flex items-center gap-3 w-full lg:w-auto">
          <button
            onClick={() => setShowWidgetModal(true)}
            className="flex-1 lg:flex-none px-5 py-3 bg-white rounded-2xl shadow-md border-2 border-gray-200 hover:shadow-xl hover:border-orange-300 transition-all font-semibold text-gray-700 flex items-center justify-center gap-2 transform hover:scale-105"
          >
            <Grid3x3 className="w-5 h-5 text-orange-500" />
            <span className="hidden sm:inline">Manage widgets</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex-1 lg:flex-none px-6 py-3 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-2xl shadow-xl shadow-orange-500/40 hover:shadow-2xl hover:shadow-orange-500/50 transition-all font-bold text-white flex items-center justify-center gap-2 transform hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Add new widget</span>
          </button>
        </div>
      </div>

      {/* Stats atas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-8">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              onClick={stat.onClick}
              className={`group relative bg-white rounded-3xl p-6 shadow-lg border-2 border-orange-100 hover:shadow-2xl hover:border-orange-300 transition-all duration-300 overflow-hidden transform hover:scale-105 ${
                stat.onClick ? "cursor-pointer active:scale-95" : ""
              }`}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
              />
              <div className="relative flex flex-col h-full">
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`p-3 rounded-2xl bg-gradient-to-br ${stat.gradient} shadow-lg`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <button className="p-2 rounded-full bg-orange-50 opacity-0 group-hover:opacity-100 transition-all hover:bg-orange-100 transform hover:rotate-45">
                    <ArrowUpRight className="w-4 h-4 text-orange-600" />
                  </button>
                </div>
                <h3 className="text-sm font-semibold text-gray-500 mb-2">
                  {stat.title}
                </h3>
                <div className="flex items-baseline mb-3">
                  <span
                    className={`font-black text-gray-900 ${
                      stat.title.includes("ECL") ? "text-xl" : "text-3xl"
                    }`}
                  >
                    {stat.amount}
                  </span>
                  {stat.cents && (
                    <span className="text-lg font-bold text-gray-400 ml-1">
                      {stat.cents}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-auto">
                  {stat.isPositive ? (
                    <div className="flex items-center gap-1 px-3 py-1.5 bg-green-100 rounded-xl border border-green-200">
                      <TrendingUp className="w-3 h-3 text-green-700" />
                      <span className="text-xs font-bold text-green-700">
                        {stat.change}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 px-3 py-1.5 bg-red-100 rounded-xl border border-red-200">
                      <TrendingDown className="w-3 h-3 text-red-700" />
                      <span className="text-xs font-bold text-red-700">
                        {stat.change}
                      </span>
                    </div>
                  )}
                  <span className="text-xs font-medium text-gray-400">
                    {stat.change === "Manage"
                      ? "Click to edit"
                      : "vs last month"}
                  </span>
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

      {/* --- MODALS (CRUD) --- */}
      {/* 1. Modal Manage Widgets */}
      {showWidgetModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl border-2 border-orange-200 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-black text-gray-900">
                Manage Widgets
              </h2>
              <button
                onClick={() => setShowWidgetModal(false)}
                className="p-2 rounded-full hover:bg-orange-100 transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>
            <div className="space-y-4">
              {[
                "ECL Charts",
                "ECL Composition",
                "Recent ECL Movements",
                "Saving Goals",
              ].map((widget) => (
                <div
                  key={widget}
                  className="flex items-center justify-between p-4 rounded-2xl border-2 border-gray-200 hover:border-orange-300 transition-all"
                >
                  <span className="font-bold text-gray-700">{widget}</span>
                  <label className="relative inline-block w-12 h-6">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      defaultChecked
                    />
                    <div className="w-full h-full bg-gray-300 rounded-full peer-checked:bg-gradient-to-r peer-checked:from-orange-500 peer-checked:to-yellow-500 transition-all" />
                    <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-all peer-checked:translate-x-6 shadow-md" />
                  </label>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-6 border-t-2 border-gray-100">
              <button
                onClick={() => setShowWidgetModal(false)}
                className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-yellow-500 font-bold text-white hover:shadow-xl transition-all"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Modal Add Widget */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl border-2 border-orange-200 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-black text-gray-900">
                Add New Widget
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 rounded-full hover:bg-orange-100 transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-6 py-3 rounded-xl border-2 border-gray-200 font-bold text-gray-700 hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  alert("Widget added successfully!");
                }}
                className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-yellow-500 font-bold text-white hover:shadow-xl transition-all"
              >
                Add Widget
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. CRUD Modals */}
      <ProductCategoryModal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        onUpdateTotal={(total) =>
          setCounts((prev) => ({ ...prev, categories: total }))
        }
      />

      <ProductModal
        isOpen={showProductModal}
        onClose={() => setShowProductModal(false)}
        onUpdateTotal={(total) =>
          setCounts((prev) => ({ ...prev, products: total }))
        }
      />

      <SegmentModal
        isOpen={showSegmentModal}
        onClose={() => setShowSegmentModal(false)}
        onUpdateTotal={(total) =>
          setCounts((prev) => ({ ...prev, segments: total }))
        }
      />

      <StageModal
        isOpen={showStageModal}
        onClose={() => setShowStageModal(false)}
        onUpdateTotal={(total) =>
          setCounts((prev) => ({ ...prev, stages: total }))
        }
      />
    </div>
  );
}