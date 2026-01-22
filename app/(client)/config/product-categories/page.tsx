"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Save,
  X,
  Box,
  ArrowLeft,
} from "lucide-react";
import { api } from "@/services/api";
import type {
  ProductCategory,
  CreateProductCategoryRequest,
} from "@/services/api/master/product-categories";

export default function ProductCategoriesPage() {
  // --- State Data ---
  const [data, setData] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [paginate] = useState(10);
  const [error, setError] = useState<string | null>(null);

  // --- State Form ---
  const [view, setView] = useState<"list" | "form">("list");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<CreateProductCategoryRequest>({
    name: "",
    code: "",
    description: "",
    status: "1",
  });

  // --- Fetch Data ---
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.productCategory.getAll({
        page,
        paginate,
        search,
        order_by: "created_at",
        order: "desc",
      });
      if (res.code === 200) {
        // Handle nested pagination structure
        const paginationData = res.data.pagination;
        setData(paginationData.data);
        setTotal(paginationData.total);
      } else {
        setError(res.message || "Failed to fetch data");
      }
    } catch (error) {
      console.error("Failed to fetch", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to fetch product categories. Please check your connection or try again later.";
      setError(errorMessage);
      // Reset data on error
      setData([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search]);

  // --- Handlers ---
  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    try {
      await api.productCategory.remove(id);
      fetchData();
    } catch (error) {
      alert("Failed to delete data");
    }
  };

  const prepareEdit = (item: ProductCategory) => {
    setEditingId(item.id);
    // Convert boolean/number status to string format ("1" or "0")
    const statusValue =
      item.status === true ||
      item.status === 1 ||
      item.status === "1" ||
      item.status === "true"
        ? "1"
        : "0";
    setFormData({
      name: item.name,
      code: item.code,
      description: item.description || "",
      status: statusValue,
    });
    setView("form");
  };

  const prepareCreate = () => {
    setEditingId(null);
    setFormData({ name: "", code: "", description: "", status: "1" });
    setView("form");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Prepare payload - make description nullable if empty
      const payload: CreateProductCategoryRequest = {
        code: formData.code,
        name: formData.name,
        status: formData.status,
        ...(formData.description?.trim() ? { description: formData.description.trim() } : {}),
      };

      if (editingId) {
        await api.productCategory.update(editingId, payload);
      } else {
        await api.productCategory.create(payload);
      }
      setView("list");
      fetchData();
    } catch (error) {
      alert("Failed to save data");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalPages = Math.ceil(total / paginate);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-amber-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl shadow-lg">
              <Box className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-gray-900">
                Product Categories
              </h1>
              <p className="text-gray-600 font-medium mt-1">
                Manage your product category master data
              </p>
            </div>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-3xl shadow-xl border-2 border-orange-100 overflow-hidden">
          {view === "list" ? (
            <>
              {/* Toolbar */}
              <div className="px-6 md:px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-orange-50 to-white">
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search categories..."
                      value={search}
                      onChange={(e) => {
                        setSearch(e.target.value);
                        setPage(1);
                      }}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:outline-none font-medium transition-all"
                    />
                  </div>
                  <button
                    onClick={prepareCreate}
                    className="px-6 py-3 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-xl shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 text-white font-bold flex items-center justify-center gap-2 transform hover:scale-105 transition-all"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Add New Category</span>
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mx-6 md:mx-8 mt-4 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                  <p className="text-red-700 font-semibold text-sm">
                    ⚠️ Error: {error}
                  </p>
                  <button
                    onClick={fetchData}
                    className="mt-2 text-xs text-red-600 hover:text-red-800 underline"
                  >
                    Try again
                  </button>
                </div>
              )}

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b-2 border-gray-100">
                    <tr>
                      <th className="px-6 py-4 font-bold text-gray-700 text-sm uppercase tracking-wider">
                        #
                      </th>
                      <th className="px-6 py-4 font-bold text-gray-700 text-sm uppercase tracking-wider">
                        Name & Code
                      </th>
                      <th className="px-6 py-4 font-bold text-gray-700 text-sm uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-4 font-bold text-gray-700 text-sm uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 font-bold text-gray-700 text-sm text-center uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {loading ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-16 text-center">
                          <Loader2 className="w-10 h-10 text-orange-500 animate-spin mx-auto" />
                          <p className="mt-3 text-gray-500 font-semibold">
                            Loading data...
                          </p>
                        </td>
                      </tr>
                    ) : data.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-6 py-12 text-center text-gray-500 font-medium"
                        >
                          No data found. Try adjusting your search or create a
                          new category.
                        </td>
                      </tr>
                    ) : (
                      data.map((item, idx) => (
                        <tr
                          key={item.id}
                          className="hover:bg-orange-50/50 transition-colors group"
                        >
                          <td className="px-6 py-4 text-sm font-bold text-gray-500">
                            {(page - 1) * paginate + idx + 1}
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-bold text-gray-900">
                              {item.name}
                            </div>
                            <div className="text-xs font-semibold text-blue-600 bg-blue-100 inline-block px-2 py-0.5 rounded mt-1">
                              {item.code}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 font-medium max-w-md">
                            {item.description || (
                              <span className="text-gray-400 italic">
                                No description
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 ${
                                item.status === true ||
                                item.status === 1 ||
                                item.status === "1" ||
                                item.status === "true"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  item.status === true ||
                                  item.status === 1 ||
                                  item.status === "1" ||
                                  item.status === "true"
                                    ? "bg-green-500"
                                    : "bg-gray-400"
                                }`}
                              />
                              {item.status === true ||
                              item.status === 1 ||
                              item.status === "1" ||
                              item.status === "true"
                                ? "Active"
                                : "Inactive"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => prepareEdit(item)}
                                className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all transform hover:scale-110"
                                title="Edit"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(item.id)}
                                className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all transform hover:scale-110"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="px-6 md:px-8 py-5 border-t-2 border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50">
                <div className="text-sm font-semibold text-gray-600">
                  Showing{" "}
                  <span className="text-orange-600">
                    {data.length === 0 ? 0 : (page - 1) * paginate + 1}
                  </span>{" "}
                  to{" "}
                  <span className="text-orange-600">
                    {Math.min(page * paginate, total)}
                  </span>{" "}
                  of <span className="text-gray-900">{total}</span> entries
                </div>
                <div className="flex items-center gap-2">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="px-4 py-2 rounded-lg border-2 border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold text-gray-700 flex items-center gap-2"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </button>
                  <div className="px-4 py-2 bg-orange-500 text-white rounded-lg font-bold">
                    {page}
                  </div>
                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="px-4 py-2 rounded-lg border-2 border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold text-gray-700 flex items-center gap-2"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* Form View */
            <div className="p-6 md:p-8">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-black text-gray-900">
                  {editingId ? "Edit Category" : "Create New Category"}
                </h3>
                <button
                  onClick={() => setView("list")}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="w-6 h-6 text-gray-600" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 block">
                      Category Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="e.g. Kredit Modal Kerja"
                      className="w-full px-4 py-3.5 rounded-xl bg-gray-100 border-none focus:ring-2 focus:ring-orange-500/20 focus:bg-white transition-all font-medium text-gray-900 placeholder:text-gray-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 block">
                      Category Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      value={formData.code}
                      onChange={(e) =>
                        setFormData({ ...formData, code: e.target.value })
                      }
                      placeholder="e.g. KMK-001"
                      className="w-full px-4 py-3.5 rounded-xl bg-gray-100 border-none focus:ring-2 focus:ring-orange-500/20 focus:bg-white transition-all font-medium text-gray-900 placeholder:text-gray-400"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 block">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        description: e.target.value,
                      })
                    }
                    rows={4}
                    placeholder="Describe this category..."
                    className="w-full px-4 py-3.5 rounded-xl bg-gray-100 border-none focus:ring-2 focus:ring-orange-500/20 focus:bg-white transition-all font-medium text-gray-900 placeholder:text-gray-400 resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 block">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3.5 rounded-xl bg-gray-100 border-none focus:ring-2 focus:ring-orange-500/20 focus:bg-white transition-all font-medium text-gray-900 cursor-pointer"
                  >
                    <option value="1">Active</option>
                    <option value="0">Inactive</option>
                  </select>
                </div>

                <div className="flex gap-4 pt-6">
                  <button
                    type="button"
                    onClick={() => setView("list")}
                    className="px-8 py-3.5 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition-all flex items-center gap-2"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    Back to List
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-8 py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-bold hover:shadow-lg hover:shadow-orange-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
