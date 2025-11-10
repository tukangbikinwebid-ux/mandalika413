"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDebounce } from "@/hooks/use-debounce";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Coins,
  User,
  CreditCard,
  CheckCircle,
  Clock,
  XCircle,
  X,
  Save,
  Download,
  Eye,
  DollarSign,
  RefreshCw,
} from "lucide-react";
import { api } from "@/services/api";
import {
  Deposit,
  CreateDepositRequest,
  UpdateDepositRequest,
} from "@/lib/types/deposits";
import { useToast } from "@/components/providers/toast-provider";
import { useApiCall } from "@/hooks";

export default function DepositPage() {
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [showForm, setShowForm] = useState(false);
  const [editingDeposit, setEditingDeposit] = useState<Deposit | null>(null);
  const [selectedDeposit, setSelectedDeposit] = useState<Deposit | null>(null);
  const [formData, setFormData] = useState({
    bank: "BCA" as "BCA" | "MANDIRI" | "BRI" | "BNI",
    owner_name: "",
    amount: "",
    notes: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageLimit] = useState(10);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const { success, error } = useToast();

  // API call for Digiflazz saldo
  const {
    data: saldoData,
    loading: saldoLoading,
    execute: fetchSaldo,
  } = useApiCall(async () => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}digiflazz/saldo`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch saldo");
    }

    return response.json();
  });

  const fetchDeposits = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.deposits.getDeposits({
        page: currentPage,
        limit: pageLimit,
        search: debouncedSearchTerm || undefined,
        status:
          statusFilter !== "all"
            ? (statusFilter as "PENDING" | "APPROVED" | "REJECTED")
            : undefined,
      });

      console.log("API Response:", response); // Debug log

      // Handle different response structures
      if (response.data && Array.isArray(response.data)) {
        // If response.data is directly an array
        setDeposits(response.data);
        setPagination({
          page: currentPage,
          limit: pageLimit,
          total: response.data.length,
          totalPages: Math.ceil(response.data.length / pageLimit),
        });
      } else if (response.data && response.data.data) {
        // If response.data has nested data and pagination
        setDeposits(response.data.data);
        setPagination(
          response.data.pagination || {
            page: currentPage,
            limit: pageLimit,
            total: response.data.data.length,
            totalPages: Math.ceil(response.data.data.length / pageLimit),
          }
        );
      } else {
        // Fallback
        setDeposits([]);
        setPagination({
          page: currentPage,
          limit: pageLimit,
          total: 0,
          totalPages: 0,
        });
      }
    } catch (err) {
      console.error("Error fetching deposits:", err);
      error("Error", "Gagal memuat data deposit");
      setDeposits([]);
      setPagination({
        page: currentPage,
        limit: pageLimit,
        total: 0,
        totalPages: 0,
      });
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageLimit, statusFilter, debouncedSearchTerm, error]);

  // Fetch deposits and saldo on component mount
  useEffect(() => {
    fetchDeposits();
    fetchSaldo();
  }, [fetchDeposits, fetchSaldo]);

  // Remove client-side filtering since we're using server-side search
  const filteredDeposits = deposits;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getTotalDeposits = () => {
    // Use real saldo data from Digiflazz API
    if (saldoData?.data !== undefined) {
      return saldoData.data;
    }

    // Fallback to calculated deposits if API fails
    return (deposits || [])
      .filter((d) => d.status === "APPROVED")
      .reduce((sum, d) => sum + d.amount, 0);
  };

  const getPendingDeposits = () => {
    return (deposits || [])
      .filter((d) => d.status === "PENDING")
      .reduce((sum, d) => sum + d.amount, 0);
  };

  const getTotalCount = () => {
    return pagination?.total || 0;
  };

  const getCompletedCount = () => {
    return (deposits || []).filter((d) => d.status === "APPROVED").length;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Form validation
    if (!formData.owner_name.trim()) {
      error("Error", "Nama pemilik rekening harus diisi");
      return;
    }

    if (!formData.amount || Number(formData.amount) < 200000) {
      error("Error", "Jumlah deposit minimal Rp 200.000");
      return;
    }

    setSubmitting(true);
    try {
      if (editingDeposit) {
        // Update existing deposit
        const updateData: UpdateDepositRequest = {
          bank: formData.bank,
          owner_name: formData.owner_name.trim(),
          amount: Number(formData.amount),
          notes: formData.notes.trim(),
        };
        console.log("Updating deposit:", updateData); // Debug log
        await api.deposits.updateDeposit(editingDeposit.id, updateData);
        success("Success", "Deposit berhasil diperbarui");
      } else {
        // Create new deposit
        const createData: CreateDepositRequest = {
          bank: formData.bank,
          owner_name: formData.owner_name.trim(),
          amount: Number(formData.amount),
          notes: formData.notes.trim(),
        };
        console.log("Creating deposit:", createData); // Debug log
        await api.deposits.createDeposit(createData);
        success("Success", "Deposit berhasil dibuat");
      }

      await fetchDeposits();
      resetForm();
    } catch (err) {
      console.error("Error submitting form:", err);
      error("Error", "Gagal menyimpan deposit");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (deposit: Deposit) => {
    setEditingDeposit(deposit);
    setFormData({
      bank: deposit.bank,
      owner_name: deposit.owner_name,
      amount: deposit.amount.toString(),
      notes: deposit.notes,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus deposit ini?")) {
      try {
        await api.deposits.deleteDeposit(id);
        success("Success", "Deposit berhasil dihapus");
        await fetchDeposits();
      } catch (err) {
        console.error("Error deleting deposit:", err);
        error("Error", "Gagal menghapus deposit");
      }
    }
  };

  const handleStatusUpdate = async (
    id: string,
    status: "PENDING" | "APPROVED" | "REJECTED"
  ) => {
    try {
      await api.deposits.updateDeposit(id, { status });
      success(
        "Success",
        `Status deposit berhasil diubah menjadi ${
          status === "APPROVED"
            ? "Disetujui"
            : status === "PENDING"
            ? "Menunggu"
            : "Ditolak"
        }`
      );
      await fetchDeposits();
    } catch (err) {
      console.error("Error updating status:", err);
      error("Error", "Gagal mengubah status deposit");
    }
  };

  const resetForm = () => {
    setFormData({
      bank: "BCA",
      owner_name: "",
      amount: "",
      notes: "",
    });
    setEditingDeposit(null);
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Deposit</h1>
          <p className="text-gray-600">Kelola deposit dan saldo pelanggan</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 bg-gradient-to-r from-[#C02628] to-[#C02628] text-white px-4 py-2 rounded-lg hover:from-[#B02122] hover:to-[#8F1719] transition-all duration-200"
        >
          <Plus className="h-5 w-5" />
          <span>Tambah Deposit</span>
        </motion.button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm ring-1 ring-gray-200 p-6"
        >
          <div className="flex items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-r from-[#C02628] to-[#C02628]">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Deposit</p>
              {saldoLoading ? (
                <div className="flex items-center space-x-2">
                  <RefreshCw className="h-4 w-4 animate-spin text-gray-400" />
                  <span className="text-sm text-gray-500">Loading...</span>
                </div>
              ) : (
                <p className="text-2xl font-semibold text-gray-900">
                  {formatPrice(getTotalDeposits())}
                </p>
              )}
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
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Pending Deposit
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatPrice(getPendingDeposits())}
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
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500">
              <Coins className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Total Transaksi
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {getTotalCount()}
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
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-r from-[#C02628] to-[#C02628]">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Berhasil</p>
              <p className="text-2xl font-semibold text-gray-900">
                {getCompletedCount()}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Cari deposit..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C02628] focus:border-transparent"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C02628] focus:border-transparent"
          title="Filter berdasarkan status"
        >
          <option value="all">Semua Status</option>
          <option value="PENDING">Menunggu</option>
          <option value="APPROVED">Disetujui</option>
          <option value="REJECTED">Ditolak</option>
        </select>
        <button
          onClick={() => fetchDeposits()}
          className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
        >
          <RefreshCw className="h-5 w-5" />
          <span>Refresh</span>
        </button>
        <button className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-[#C02628] to-[#C02628] text-white rounded-lg hover:from-[#B02122] hover:to-[#8F1719] transition-all duration-200">
          <Download className="h-5 w-5" />
          <span>Export</span>
        </button>
      </div>

      {/* Deposits Table */}
      <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID Deposit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pelanggan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Jumlah
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Metode
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
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center">
                      <RefreshCw className="h-6 w-6 animate-spin text-gray-400 mr-2" />
                      <span className="text-gray-500">Memuat data...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredDeposits.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="text-gray-500">Tidak ada data deposit</div>
                  </td>
                </tr>
              ) : (
                filteredDeposits.map((deposit, index) => {
                  return (
                    <motion.tr
                      key={deposit.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="hover:bg-gray-50 transition-colors duration-200"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {deposit.id}
                        </div>
                        <div className="text-sm text-gray-500">
                          {deposit.account_number}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-[#C02628] to-[#C02628] flex items-center justify-center">
                              <User className="h-5 w-5 text-white" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {deposit.owner_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {deposit.bank}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatPrice(deposit.amount)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <CreditCard className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">
                            {deposit.payment_method}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(deposit.created_at).toLocaleDateString(
                            "id-ID"
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(deposit.updated_at).toLocaleDateString(
                            "id-ID"
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => setSelectedDeposit(deposit)}
                            className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                            title="Lihat detail"
                          >
                            <Eye className="h-4 w-4" />
                          </button>

                          {/* Status Update Buttons */}
                          {deposit.status === "PENDING" && (
                            <>
                              <button
                                onClick={() =>
                                  handleStatusUpdate(deposit.id, "APPROVED")
                                }
                                className="text-[#C02628] hover:text-[#8F1719] p-2 hover:bg-[#C02628]/10 rounded-lg transition-colors duration-200"
                                title="Setujui deposit"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() =>
                                  handleStatusUpdate(deposit.id, "REJECTED")
                                }
                                className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-lg transition-colors duration-200"
                                title="Tolak deposit"
                              >
                                <XCircle className="h-4 w-4" />
                              </button>
                            </>
                          )}

                          <button
                            onClick={() => handleEdit(deposit)}
                            className="text-indigo-600 hover:text-indigo-900 p-2 hover:bg-indigo-50 rounded-lg transition-colors duration-200"
                            title="Edit deposit"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(deposit.id)}
                            className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-lg transition-colors duration-200"
                            title="Hapus deposit"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {pagination && pagination.totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() =>
                  setCurrentPage(
                    Math.min(pagination.totalPages, currentPage + 1)
                  )
                }
                disabled={currentPage === pagination.totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing{" "}
                  <span className="font-medium">
                    {Math.min(
                      (currentPage - 1) * pageLimit + 1,
                      pagination.total
                    )}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium">
                    {Math.min(currentPage * pageLimit, pagination.total)}
                  </span>{" "}
                  of <span className="font-medium">{pagination.total}</span>{" "}
                  results
                </p>
              </div>
              <div>
                <nav
                  className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                  aria-label="Pagination"
                >
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Previous</span>
                    <svg
                      className="h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>

                  {/* Page numbers */}
                  {Array.from(
                    { length: Math.min(5, pagination.totalPages) },
                    (_, i) => {
                      const pageNum = Math.max(
                        1,
                        Math.min(pagination.totalPages, currentPage - 2 + i)
                      );
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            pageNum === currentPage
                              ? "z-10 bg-[#C02628]/10 border-[#C02628] text-[#C02628]"
                              : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    }
                  )}

                  <button
                    onClick={() =>
                      setCurrentPage(
                        Math.min(pagination.totalPages, currentPage + 1)
                      )
                    }
                    disabled={currentPage === pagination.totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Next</span>
                    <svg
                      className="h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop-strong"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingDeposit ? "Edit Deposit" : "Tambah Deposit"}
                </h2>
                <button
                  onClick={resetForm}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  title="Tutup form"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Pemilik Rekening
                  </label>
                  <input
                    type="text"
                    value={formData.owner_name}
                    onChange={(e) =>
                      setFormData({ ...formData, owner_name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C02628] focus:border-transparent"
                    placeholder="Masukkan nama pemilik rekening"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bank
                  </label>
                  <select
                    value={formData.bank}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        bank: e.target.value as
                          | "BCA"
                          | "MANDIRI"
                          | "BRI"
                          | "BNI",
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C02628] focus:border-transparent"
                    title="Pilih bank"
                    required
                  >
                    <option value="BCA">BCA</option>
                    <option value="MANDIRI">MANDIRI</option>
                    <option value="BRI">BRI</option>
                    <option value="BNI">BNI</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jumlah Deposit
                  </label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C02628] focus:border-transparent"
                    placeholder="Masukkan jumlah deposit (min. 200,000)"
                    min="200000"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Catatan
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C02628] focus:border-transparent"
                    placeholder="Masukkan catatan (opsional)"
                    rows={3}
                  />
                </div>

                <div className="flex items-center justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                  >
                    Batal
                  </button>
                  <motion.button
                    whileHover={{ scale: submitting ? 1 : 1.05 }}
                    whileTap={{ scale: submitting ? 1 : 0.95 }}
                    type="submit"
                    disabled={submitting}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                      submitting
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-[#C02628] to-[#C02628] hover:from-[#B02122] hover:to-[#8F1719]"
                    }`}
                  >
                    {submitting ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    <span>
                      {submitting
                        ? "Menyimpan..."
                        : editingDeposit
                        ? "Update"
                        : "Simpan"}
                    </span>
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Deposit Detail Modal */}
      <AnimatePresence>
        {selectedDeposit && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop-strong"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Detail Deposit
                </h2>
                <button
                  onClick={() => setSelectedDeposit(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  title="Tutup detail"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Deposit Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Informasi Deposit
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">
                          ID Deposit:
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {selectedDeposit.id}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Jumlah:</span>
                        <span className="text-sm font-bold text-gray-900">
                          {formatPrice(selectedDeposit.amount)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Bank:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {selectedDeposit.bank}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Metode:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {selectedDeposit.payment_method}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Status:</span>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            selectedDeposit.status === "APPROVED"
                              ? "bg-[#C02628]/10 text-[#C02628]"
                              : selectedDeposit.status === "PENDING"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {selectedDeposit.status === "APPROVED"
                            ? "Disetujui"
                            : selectedDeposit.status === "PENDING"
                            ? "Menunggu"
                            : "Ditolak"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">
                          Tanggal Dibuat:
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {new Date(
                            selectedDeposit.created_at
                          ).toLocaleDateString("id-ID")}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">
                          Tanggal Diperbarui:
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {new Date(
                            selectedDeposit.updated_at
                          ).toLocaleDateString("id-ID")}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Informasi Pemilik
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Nama:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {selectedDeposit.owner_name}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">
                          Nomor Rekening:
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {selectedDeposit.account_number}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {selectedDeposit.notes && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Catatan
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-900">
                        {selectedDeposit.notes}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}