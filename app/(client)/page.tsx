"use client";

import { useMemo, useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  Calendar,
  Grid3x3,
  Plus,
  ChevronDown,
  ArrowRight,
  X,
  Clock,
  DollarSign,
  PieChart as PieIcon,
  BarChart3,
  Filter,
  Banknote,
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Title
);

const rupiah = (n: number): string =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);

const ECL_DATE = "31-10-2025";

/* =================== DUMMY DATA HASIL PROSES (ganti dari API) =================== */
type BranchItem = { label: string; value: number; color: string };
type StageItem = { label: string; value: number; color: string };
type SegmentItem = { label: string; lifetime: number; m12: number };
type GenericItem = { label: string; value: number };

const TOP5_BRANCH: BranchItem[] = [
  {
    label: "010 – CABANG UTAMA 010",
    value: 47_804_130_613,
    color: "#7CB5FF",
  },
];

const STAGES: StageItem[] = [
  { label: "Stage 1", value: 55_627_373_809, color: "#7CB5FF" },
  { label: "Stage 2", value: 19_298_091_845, color: "#374151" },
  // { label: "Stage 3", value: 186_241_125_031, color: "#86EFAC" },
];

const BY_SEGMENT: SegmentItem[] = [
  { label: "MODAL KERJA", lifetime: 62_697_402_418, m12: 18_190_055_309 },
  { label: "KONSUMER", lifetime: 35_600_000_000, m12: 23_500_000_000 },
  { label: "LAINNYA", lifetime: 26_500_000_000, m12: 24_500_000_000 },
  { label: "INVESTASI", lifetime: 18_500_000_000, m12: 12_000_000_000 },
  { label: "KUR BARU", lifetime: 8_000_000_000, m12: 7_500_000_000 },
];

const TOP5_PRODUCT: GenericItem[] = [
  { label: "K01 – KREDIT MODAL KERJA BIASA", value: 50_243_634_349 },
  { label: "K02 – KREDIT MODAL KERJA KONSTRUKSI", value: 41_600_000_000 },
  { label: "K03 – KPR SUBSIDI", value: 30_000_000_000 },
  { label: "K04 – KREDIT MODAL KERJA BIASA", value: 22_000_000_000 },
  { label: "K05 – KUR BARU", value: 12_000_000_000 },
];

const TOP10_TRA: GenericItem[] = [
  { label: "10205147BGU01", value: 500_000_000 },
  { label: "10205147BGP01", value: 230_000_000 },
  { label: "05001514", value: 200_000_000 },
  { label: "05001725", value: 140_000_000 },
  { label: "05001701", value: 150_000_000 },
  { label: "05001747", value: 130_000_000 },
  { label: "05000651BGP06", value: 120_000_000 },
  { label: "05000651BGU06", value: 110_000_000 },
  { label: "05000651BGP07", value: 95_000_000 },
  { label: "05000651BGP09", value: 85_000_000 },
];

/* ===== Komponen Kartu ===== */
function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-lg border-2 border-orange-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-2xl font-black text-gray-900">{title}</h3>
        <button className="p-2 rounded-full hover:bg-orange-50 transition-colors transform hover:rotate-45">
          <ArrowUpRight className="w-5 h-5 text-orange-600" />
        </button>
      </div>
      {children}
      <div className="mt-4 text-center text-sm font-semibold text-gray-600">
        ECL Date : {ECL_DATE}
      </div>
    </div>
  );
}

/* =================== DASHBOARD =================== */
export default function Dashboard() {
  /* Header & widget (dipertahankan) */
  const [selectedPeriod, setSelectedPeriod] = useState("This month");
  const [selectedAccount, setSelectedAccount] = useState("All accounts");
  const [selectedYear, setSelectedYear] = useState("This year");
  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false);
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [showYearDropdown, setShowYearDropdown] = useState(false);
  const [showWidgetModal, setShowWidgetModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const periods = ["Today", "This week", "This month", "This year", "All time"];
  const accounts = [
    "All accounts",
    "Consolidated",
    "Head Office",
    "All Branches",
  ];
  const years = ["This year", "2024", "2023", "2022"];

  /* ======= Stats atas (placeholder) ======= */
  const stats = [
    {
      title: "Total ECL (Provision)",
      amount: rupiah(261_166_590_685),
      cents: "",
      change: "+1.9%",
      isPositive: true,
      icon: DollarSign,
      gradient: "from-yellow-400 to-orange-500",
    },
    // {
    //   title: "Movement (Month)",
    //   amount: rupiah(8_500_000_000),
    //   cents: "",
    //   change: "+6.3%",
    //   isPositive: true,
    //   icon: TrendingUp,
    //   gradient: "from-green-400 to-emerald-500",
    // },
    // {
    //   title: "Write-off Impact",
    //   amount: rupiah(6_222_000_000),
    //   cents: "",
    //   change: "-2.4%",
    //   isPositive: false,
    //   icon: TrendingDown,
    //   gradient: "from-orange-400 to-red-500",
    // },
    // {
    //   title: "Coverage Ratio",
    //   amount: "112.4%",
    //   cents: "",
    //   change: "+0.4%",
    //   isPositive: true,
    //   icon: PieIcon,
    //   gradient: "from-amber-400 to-yellow-500",
    // },
  ] as const;

  /* ====== Chart.js data & options ====== */
  const dataTop5Branch: ChartData<"bar"> = useMemo(
    () => ({
      labels: TOP5_BRANCH.map((d) => d.label),
      datasets: [
        {
          label: "ECL Amount",
          data: TOP5_BRANCH.map((d) => d.value),
          backgroundColor: TOP5_BRANCH.map((d) => d.color),
          borderRadius: 10,
          borderSkipped: false,
        },
      ],
    }),
    []
  );

  const optionsTop5Branch: ChartOptions<"bar"> = {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) =>
            `${ctx.dataset.label ?? ""}: ${rupiah(Number(ctx.parsed.x))}`,
        },
      },
    },
    scales: {
      x: {
        ticks: {
          callback: (v) => rupiah(Number(v)),
          color: "#374151",
          font: { weight: "bold" },
        },
        grid: { color: "rgba(0,0,0,0.06)" },
      },
      y: {
        ticks: { color: "#111827", font: { weight: "bold" } },
        grid: { display: false },
      },
    },
  };

  const dataStage: ChartData<"doughnut"> = useMemo(
    () => ({
      labels: STAGES.map((d) => d.label),
      datasets: [
        {
          data: STAGES.map((d) => d.value),
          backgroundColor: STAGES.map((d) => d.color),
          borderWidth: 0,
          hoverOffset: 6,
        },
      ],
    }),
    []
  );

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
          label: (ctx) => `${ctx.label}: ${rupiah(Number(ctx.parsed))}`,
        },
      },
    },
    cutout: "58%",
  };

  const dataSegment: ChartData<"bar"> = useMemo(
    () => ({
      labels: BY_SEGMENT.map((d) => d.label),
      datasets: [
        {
          label: "Lifetime",
          data: BY_SEGMENT.map((d) => d.lifetime),
          backgroundColor: "#7CB5FF",
          borderRadius: 8,
          borderSkipped: false,
        },
        {
          label: "12 Months",
          data: BY_SEGMENT.map((d) => d.m12),
          backgroundColor: "#374151",
          borderRadius: 8,
          borderSkipped: false,
        },
      ],
    }),
    []
  );

  const optionsSegment: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: { usePointStyle: true, pointStyle: "circle" },
      },
      tooltip: {
        callbacks: {
          label: (c) =>
            `${c.dataset.label ?? ""}: ${rupiah(
              Number(c.parsed.y ?? c.parsed)
            )}`,
        },
      },
    },
    scales: {
      x: {
        ticks: { color: "#111827", font: { weight: "bold" } },
        grid: { color: "rgba(0,0,0,0.05)" },
      },
      y: {
        ticks: {
          callback: (v) => rupiah(Number(v)),
          color: "#374151",
          font: { weight: "bold" },
        },
        grid: { color: "rgba(0,0,0,0.06)" },
      },
    },
  };

  const dataTop5Product: ChartData<"bar"> = useMemo(
    () => ({
      labels: TOP5_PRODUCT.map((d) => d.label),
      datasets: [
        {
          label: "Top 5 ECL by Produk",
          data: TOP5_PRODUCT.map((d) => d.value),
          backgroundColor: "#93C5FD",
          borderRadius: 10,
          borderSkipped: false,
        },
      ],
    }),
    []
  );

  const optionsTop5Product: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: "bottom" },
      tooltip: {
        callbacks: {
          label: (c) =>
            `${c.dataset.label ?? ""}: ${rupiah(Number(c.parsed.y))}`,
        },
      },
    },
    scales: {
      x: {
        ticks: { color: "#111827", font: { weight: "bold" } },
        grid: { color: "rgba(0,0,0,0.05)" },
      },
      y: {
        ticks: {
          callback: (v) => rupiah(Number(v)),
          color: "#374151",
          font: { weight: "bold" },
        },
        grid: { color: "rgba(0,0,0,0.06)" },
      },
    },
  };

  const dataTop10TRA: ChartData<"bar"> = useMemo(
    () => ({
      labels: TOP10_TRA.map((d) => d.label),
      datasets: [
        {
          label: "Top 10 ECL TRA – Longgar Tarik & Bank Garansi",
          data: TOP10_TRA.map((d) => d.value),
          backgroundColor: [
            "#93C5FD",
            "#374151",
            "#86EFAC",
            "#FDBA74",
            "#A78BFA",
            "#FCA5A5",
            "#FDE047",
            "#34D399",
            "#F9A8D4",
            "#67E8F9",
          ],
          borderRadius: 10,
          borderSkipped: false,
        },
      ],
    }),
    []
  );

  const optionsTop10TRA: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (c) =>
            `${c.dataset.label ?? ""}: ${rupiah(Number(c.parsed.y))}`,
        },
      },
    },
    scales: {
      x: {
        ticks: { color: "#111827", font: { weight: "bold" } },
        grid: { color: "rgba(0,0,0,0.05)" },
      },
      y: {
        ticks: {
          callback: (v) => rupiah(Number(v)),
          color: "#374151",
          font: { weight: "bold" },
        },
        grid: { color: "rgba(0,0,0,0.06)" },
      },
    },
  };

  /* =================== UI =================== */
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-amber-50 p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button className="p-3 bg-white rounded-2xl shadow-md border-2 border-orange-200 hover:shadow-xl hover:border-orange-300 transition-all transform hover:scale-105">
            <Calendar className="w-5 h-5 text-orange-600" />
          </button>
          <div className="relative">
            <button
              onClick={() => setShowPeriodDropdown(!showPeriodDropdown)}
              className="px-6 py-3 bg-white rounded-2xl shadow-md border-2 border-orange-200 hover:shadow-xl hover:border-orange-300 transition-all font-semibold text-gray-700 flex items-center gap-2 transform hover:scale-105"
            >
              <Clock className="w-5 h-5 text-orange-500" />
              {selectedPeriod}
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  showPeriodDropdown ? "rotate-180" : ""
                }`}
              />
            </button>
            {showPeriodDropdown && (
              <div className="absolute top-full mt-2 left-0 w-48 bg-white rounded-2xl shadow-2xl border-2 border-orange-200 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                {periods.map((period) => (
                  <button
                    key={period}
                    onClick={() => {
                      setSelectedPeriod(period);
                      setShowPeriodDropdown(false);
                    }}
                    className={`w-full px-4 py-3 text-left hover:bg-orange-50 transition-colors ${
                      selectedPeriod === period
                        ? "bg-orange-100 text-orange-700 font-semibold"
                        : "text-gray-700"
                    }`}
                  >
                    {period}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowWidgetModal(true)}
            className="px-5 py-3 bg-white rounded-2xl shadow-md border-2 border-gray-200 hover:shadow-xl hover:border-orange-300 transition-all font-semibold text-gray-700 flex items-center gap-2 transform hover:scale-105"
          >
            <Grid3x3 className="w-5 h-5 text-orange-500" />
            Manage widgets
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-2xl shadow-xl shadow-orange-500/40 hover:shadow-2xl hover:shadow-orange-500/50 transition-all font-bold text-white flex items-center gap-2 transform hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            Add new widget
          </button>
        </div>
      </div>

      {/* Stats atas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="group relative bg-white rounded-3xl p-6 shadow-lg border-2 border-orange-100 hover:shadow-2xl hover:border-orange-300 transition-all duration-300 overflow-hidden transform hover:scale-105 cursor-pointer"
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
                  <span className="text-2xl font-black text-gray-900">
                    {stat.amount}
                  </span>
                  {stat.cents && (
                    <span className="text-2xl font-bold text-gray-300">
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
                    vs last month
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ===== Hasil Proses (Chart ECL) ===== */}
      <div className="grid grid-cols-1 gap-6 mb-8">
        <Card title="Top 5 Expected Credit Loss by Branch">
          <div className="h-96 w-full overflow-x-auto">
            <div className="min-w-[720px] h-full">
              <Bar data={dataTop5Branch} options={optionsTop5Branch} />
            </div>
          </div>
        </Card>

        <Card title="Expected Credit Loss by Stage">
          <div className="h-96 w-full">
            <Doughnut data={dataStage} options={optionsStage} />
          </div>
        </Card>
      </div>

      <Card title="Expected Credit Loss by Segment">
        <div className="h-96 w-full overflow-x-auto">
          <div className="min-w-[820px] h-full">
            <Bar data={dataSegment} options={optionsSegment} />
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 my-8">
        <Card title="Top 5 Expected Credit Loss by Product">
          <div className="h-96 w-full overflow-x-auto">
            <div className="min-w-[820px] h-full">
              <Bar data={dataTop5Product} options={optionsTop5Product} />
            </div>
          </div>
        </Card>
      </div>

      {/* Manage & Add Widget Modals (dipertahankan) */}
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
                className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-yellow-500 font-bold text-white hover:shadow-xl hover:shadow-orange-500/40 transition-all"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

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

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Widget Type
                </label>
                <select className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:outline-none font-semibold text-gray-700">
                  <option>Chart Widget</option>
                  <option>Stats Widget</option>
                  <option>List Widget</option>
                  <option>Goal Widget</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Widget Name
                </label>
                <input
                  type="text"
                  placeholder="Enter widget name..."
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:outline-none font-semibold text-gray-700"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Position
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button className="px-4 py-3 rounded-xl border-2 border-orange-300 bg-orange-50 font-bold text-orange-700 hover:bg-orange-100 transition-all">
                    Top
                  </button>
                  <button className="px-4 py-3 rounded-xl border-2 border-gray-200 font-bold text-gray-700 hover:border-orange-300 hover:bg-orange-50 transition-all">
                    Bottom
                  </button>
                </div>
              </div>
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
                className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-yellow-500 font-bold text-white hover:shadow-xl hover:shadow-orange-500/40 transition-all"
              >
                Add Widget
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}