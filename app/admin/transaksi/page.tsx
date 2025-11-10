"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Eye,
  Download,
  User,
  Package,
  DollarSign,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  X,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  transactionService,
  Transaction,
  TransactionFilters,
} from "@/services/api";
import { useApiCall, useTokenSync } from "@/hooks";

// Status mapping based on API response
const getStatusInfo = (status: number, statusPayment: number) => {
  if (statusPayment === 2) {
    return {
      icon: CheckCircle,
      color: "text-[#C02628]",
      bgColor: "bg-red-100",
      label: "Lunas",
    };
  }

  if (statusPayment === 1) {
    return {
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
      label: "Menunggu Pembayaran",
    };
  }

  if (status === 1) {
    return {
      icon: AlertCircle,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      label: "Diproses",
    };
  }

  if (status === 2) {
    return {
      icon: CheckCircle,
      color: "text-[#C02628]",
      bgColor: "bg-red-100",
      label: "Selesai",
    };
  }

  return {
    icon: XCircle,
    color: "text-red-600",
    bgColor: "bg-red-100",
    label: "Gagal",
  };
};

export default function TransaksiPage() {
  const { isAuthenticated, hasToken } = useTokenSync();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusPaymentFilter, setStatusPaymentFilter] = useState("all");
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [showExportDropdown, setShowExportDropdown] = useState(false);

  // API call to fetch transactions
  const {
    data: transactionsData,
    loading: transactionsLoading,
    error: transactionsError,
    execute: fetchTransactions,
  } = useApiCall(() => {
    const filters: TransactionFilters = {
      page: currentPage,
      paginate: 10,
    };

    if (dateRange.startDate) filters.started_at = dateRange.startDate;
    if (dateRange.endDate) filters.ended_at = dateRange.endDate;
    if (statusPaymentFilter !== "all")
      filters.status_payment = parseInt(statusPaymentFilter);

    return transactionService.getTransactions(filters);
  });

  useEffect(() => {
    if (isAuthenticated && hasToken) {
      fetchTransactions();
    }
  }, [
    isAuthenticated,
    hasToken,
    currentPage,
    statusPaymentFilter,
    dateRange.startDate,
    dateRange.endDate,
    fetchTransactions,
  ]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (showExportDropdown) {
        setShowExportDropdown(false);
      }
    };

    if (showExportDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showExportDropdown]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getTotalRevenue = () => {
    if (!transactionsData?.data?.data) return 0;
    return transactionsData.data.data
      .filter((t) => t.status_payment === 2)
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const getTotalOrders = () => {
    return transactionsData?.data?.total || 0;
  };

  const getCompletedOrders = () => {
    if (!transactionsData?.data?.data) return 0;
    return transactionsData.data.data.filter((t) => t.status_payment === 2)
      .length;
  };

  const getPendingOrders = () => {
    if (!transactionsData?.data?.data) return 0;
    return transactionsData.data.data.filter((t) => t.status_payment === 0)
      .length;
  };

  const transactions = transactionsData?.data?.data || [];
  const pagination = transactionsData?.data;

  // Export functions
  const exportToCSV = async () => {
    if (!transactions.length) return;

    setIsExporting(true);
    try {
      const headers = [
        "No",
        "Reference",
        "Order ID",
        "Customer Name",
        "Customer Phone",
        "Customer Email",
        "Product Name",
        "Product SKU",
        "Amount",
        "Status Payment",
        "Provider",
        "Created At",
        "Paid At",
      ];

      const csvData = transactions.map((transaction, index) => [
        index + 1,
        transaction.reference,
        transaction.order_id,
        transaction.customer_name,
        transaction.customer_phone,
        transaction.customer_email || "-",
        transaction.product.name,
        transaction.product.sku,
        transaction.amount,
        getStatusInfo(transaction.status, transaction.status_payment).label,
        transaction.provider,
        new Date(transaction.created_at).toLocaleString("id-ID"),
        transaction.paid_at
          ? new Date(transaction.paid_at).toLocaleString("id-ID")
          : "-",
      ]);

      const csvContent = [headers, ...csvData]
        .map((row) => row.map((field) => `"${field}"`).join(","))
        .join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `transactions_${new Date().toISOString().split("T")[0]}.csv`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Export to CSV failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const exportToJSON = async () => {
    if (!transactions.length) return;

    setIsExporting(true);
    try {
      const exportData = transactions.map((transaction, index) => ({
        no: index + 1,
        reference: transaction.reference,
        orderId: transaction.order_id,
        customerName: transaction.customer_name,
        customerPhone: transaction.customer_phone,
        customerEmail: transaction.customer_email || "-",
        productName: transaction.product.name,
        productSku: transaction.product.sku,
        amount: transaction.amount,
        statusPayment: getStatusInfo(
          transaction.status,
          transaction.status_payment
        ).label,
        provider: transaction.provider,
        createdAt: new Date(transaction.created_at).toLocaleString("id-ID"),
        paidAt: transaction.paid_at
          ? new Date(transaction.paid_at).toLocaleString("id-ID")
          : "-",
      }));

      const jsonContent = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonContent], {
        type: "application/json;charset=utf-8;",
      });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `transactions_${new Date().toISOString().split("T")[0]}.json`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Export to JSON failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  // Show loading state while checking authentication
  if (!isAuthenticated || !hasToken) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#C02628] mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Loading...</h1>
          <p className="text-gray-600">
            Please wait while we verify your authentication.
          </p>
        </div>
      </div>
    );
  }

  // Show error state if API call fails due to authentication
  if (transactionsError && transactionsError.includes("401")) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Authentication Required
          </h1>
          <p className="text-gray-600 mb-6">
            You need to be logged in as an admin to access this page.
          </p>
          <button
            onClick={() => (window.location.href = "/auth/login")}
            className="bg-[#C02628] text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Transaksi</h1>
        <p className="text-gray-600">
          Kelola dan pantau semua transaksi pelanggan
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm ring-1 ring-gray-200 p-6"
        >
          <div className="flex items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-r from-[#C02628] to-red-500">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatPrice(getTotalRevenue())}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm ring-1 ring-gray-200 p-6"
        >
          <div className="flex items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500">
              <Package className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-semibold text-gray-900">
                {getTotalOrders()}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm ring-1 ring-gray-200 p-6"
        >
          <div className="flex items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-r from-red-500 to-[#C02628]">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-semibold text-gray-900">
                {getCompletedOrders()}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm ring-1 ring-gray-200 p-6"
        >
          <div className="flex items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-r from-orange-500 to-red-500">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-semibold text-gray-900">
                {getPendingOrders()}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-end">
          {/* Search */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cari Transaksi
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Masukkan reference, nama, atau telepon..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Payment Filter */}
          <div className="lg:w-48">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status Pembayaran
            </label>
            <select
              value={statusPaymentFilter}
              onChange={(e) => setStatusPaymentFilter(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              aria-label="Filter by payment status"
            >
              <option value="all">Semua Pembayaran</option>
              <option value="0">Belum Bayar</option>
              <option value="1">Menunggu Pembayaran</option>
              <option value="2">Lunas</option>
            </select>
          </div>

          {/* Date Range */}
          <div className="flex gap-2">
            <div className="w-40">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tanggal Mulai
              </label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) =>
                  setDateRange((prev) => ({
                    ...prev,
                    startDate: e.target.value,
                  }))
                }
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                aria-label="Tanggal mulai filter"
              />
            </div>

            <div className="w-40">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tanggal Akhir
              </label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) =>
                  setDateRange((prev) => ({ ...prev, endDate: e.target.value }))
                }
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                aria-label="Tanggal akhir filter"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <div className="relative hidden">
              <button
                onClick={() => setShowExportDropdown(!showExportDropdown)}
                disabled={isExporting || !transactions.length}
                className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-red-500 to-[#C02628] text-white rounded-lg hover:from-red-600 hover:to-red-600 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Exporting...</span>
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    <span>Export</span>
                  </>
                )}
              </button>

              {/* Export Options Dropdown */}
              {showExportDropdown && !isExporting && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                  <button
                    onClick={() => {
                      setShowExportDropdown(false);
                      exportToCSV();
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-200 first:rounded-t-lg"
                  >
                    <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                      <span className="text-[#C02628] font-bold text-sm">
                        C
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        Export to CSV
                      </div>
                      <div className="text-sm text-gray-500">
                        Download as .csv file
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setShowExportDropdown(false);
                      exportToJSON();
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-200 last:rounded-b-lg"
                  >
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-sm">J</span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        Export to JSON
                      </div>
                      <div className="text-sm text-gray-500">
                        Download as .json file
                      </div>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID Transaksi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pelanggan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Produk
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tanggal
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactionsLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-[#C02628]" />
                      <span className="ml-2 text-gray-600">
                        Memuat transaksi...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : transactionsError ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="text-red-600">
                      <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                      <p>Gagal memuat transaksi</p>
                    </div>
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="text-gray-500">
                      <Package className="h-8 w-8 mx-auto mb-2" />
                      <p>Tidak ada transaksi ditemukan</p>
                    </div>
                  </td>
                </tr>
              ) : (
                transactions.map((transaction, index) => {
                  const status = getStatusInfo(
                    transaction.status,
                    transaction.status_payment
                  );
                  const StatusIcon = status.icon;

                  return (
                    <motion.tr
                      key={transaction.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="hover:bg-gray-50 transition-colors duration-200"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {transaction.reference}
                        </div>
                        <div className="text-sm text-gray-500">
                          {transaction.order_id}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-red-500 to-[#C02628] flex items-center justify-center">
                              <User className="h-5 w-5 text-white" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {transaction.customer_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {transaction.customer_phone}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {transaction.product.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {transaction.product.sku} • {transaction.provider}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatPrice(transaction.amount)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${status.bgColor} ${status.color}`}
                        >
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(transaction.created_at).toLocaleDateString(
                            "id-ID"
                          )}
                        </div>
                        {transaction.paid_at && (
                          <div className="text-sm text-gray-500">
                            Lunas:{" "}
                            {new Date(transaction.paid_at).toLocaleDateString(
                              "id-ID"
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => setSelectedTransaction(transaction)}
                            className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                            aria-label="View transaction details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {transaction.payment_link && (
                            <button
                              onClick={() =>
                                window.open(transaction.payment_link, "_blank")
                              }
                              className="text-[#C02628] hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors duration-200"
                              aria-label="Open payment link"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pagination && pagination.last_page > 1 && (
        <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Menampilkan {pagination.from} sampai {pagination.to} dari{" "}
              {pagination.total} transaksi
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <div className="flex items-center space-x-1">
                {Array.from(
                  { length: Math.min(5, pagination.last_page) },
                  (_, i) => {
                    const page = i + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-2 text-sm rounded-lg ${
                          currentPage === page
                            ? "bg-[#C02628] text-white"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  }
                )}
              </div>

              <button
                onClick={() =>
                  setCurrentPage((prev) =>
                    Math.min(pagination.last_page, prev + 1)
                  )
                }
                disabled={currentPage === pagination.last_page}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Next page"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Detail Modal */}
      {selectedTransaction && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop-strong"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Detail Transaksi
              </h2>
              <button
                onClick={() => setSelectedTransaction(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Transaction Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Informasi Transaksi
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Reference:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {selectedTransaction.reference}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Order ID:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {selectedTransaction.order_id}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        Tanggal Order:
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {new Date(
                          selectedTransaction.created_at
                        ).toLocaleString("id-ID")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Provider:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {selectedTransaction.provider}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total:</span>
                      <span className="text-sm font-bold text-gray-900">
                        {formatPrice(selectedTransaction.amount)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Status:</span>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          getStatusInfo(
                            selectedTransaction.status,
                            selectedTransaction.status_payment
                          ).bgColor
                        } ${
                          getStatusInfo(
                            selectedTransaction.status,
                            selectedTransaction.status_payment
                          ).color
                        }`}
                      >
                        {
                          getStatusInfo(
                            selectedTransaction.status,
                            selectedTransaction.status_payment
                          ).label
                        }
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Informasi Pelanggan
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Nama:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {selectedTransaction.customer_name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Email:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {selectedTransaction.customer_email || "Tidak ada"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Telepon:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {selectedTransaction.customer_phone}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Game ID:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {selectedTransaction.customer_no}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Product Info */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Informasi Produk
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {selectedTransaction.product.name}
                      </h4>
                      <p className="text-sm text-gray-600">
                        SKU: {selectedTransaction.product.sku}
                      </p>
                      <p className="text-sm text-gray-600">
                        Provider: {selectedTransaction.provider}
                      </p>
                      {selectedTransaction.product.description && (
                        <p className="text-sm text-gray-600">
                          Deskripsi: {selectedTransaction.product.description}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        {formatPrice(selectedTransaction.amount)}
                      </p>
                      <p className="text-sm text-gray-500">
                        Harga Beli:{" "}
                        {formatPrice(
                          parseFloat(selectedTransaction.product.buy_price)
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              {selectedTransaction.payment_link && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Informasi Pembayaran
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">
                        <strong>Payment Link:</strong>
                        <a
                          href={selectedTransaction.payment_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 ml-2"
                        >
                          Buka Link Pembayaran
                        </a>
                      </p>
                      {selectedTransaction.paid_at && (
                        <p className="text-sm text-gray-600">
                          <strong>Tanggal Lunas:</strong>{" "}
                          {new Date(selectedTransaction.paid_at).toLocaleString(
                            "id-ID"
                          )}
                        </p>
                      )}
                      {selectedTransaction.sn && (
                        <p className="text-sm text-gray-600">
                          <strong>Serial Number:</strong>{" "}
                          {selectedTransaction.sn}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
