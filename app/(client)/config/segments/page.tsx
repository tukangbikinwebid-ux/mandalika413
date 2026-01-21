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
  Layers,
  ArrowLeft,
  ChevronDown,
  Check,
} from "lucide-react";
import { api } from "@/services/api";
import type {
  Segment,
  CreateSegmentRequest,
} from "@/services/api/master/segment";
import type { Product } from "@/services/api/master/product";

export default function SegmentsPage() {
  // --- State Data ---
  const [data, setData] = useState<Segment[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [paginate] = useState(10);

  // --- State Form ---
  const [view, setView] = useState<"list" | "form">("list");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // --- State Custom Dropdown ---
  const [isProductOpen, setIsProductOpen] = useState(false);
  const [productSearch, setProductSearch] = useState("");

  const defaultForm: CreateSegmentRequest = {
    name: "",
    product_id: 0,
    pd: 0,
    lgd: 0,
    description: "",
    status: 1,
  };
  const [formData, setFormData] = useState<CreateSegmentRequest>(defaultForm);

  // --- Fetch Data ---
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.segment.getAll({
        page,
        paginate,
        search,
      });
      if (res.code === 200) {
        setData(res.data.data);
        setTotal(res.data.total);
      }
    } catch (error) {
      console.error("Failed to fetch segments", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await api.product.getAll({ paginate: 100 });
      if (res.code === 200) {
        setProducts(res.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch products", error);
    }
  };

  useEffect(() => {
    fetchData();
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search]);

  // --- Handlers ---
  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this segment?")) return;
    try {
      await api.segment.remove(id);
      fetchData();
    } catch (error) {
      alert("Failed to delete data");
    }
  };

  const prepareEdit = (item: Segment) => {
    setEditingId(item.id);
    setFormData({
      name: item.name,
      product_id: item.product_id,
      pd: item.pd,
      lgd: item.lgd,
      description: item.description,
      status: Number(item.status),
    });
    setView("form");
  };

  const prepareCreate = () => {
    setEditingId(null);
    setFormData(defaultForm);
    setView("form");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.product_id) {
      alert("Please select a product");
      return;
    }
    setIsSubmitting(true);
    try {
      if (editingId) {
        await api.segment.update(editingId, formData);
      } else {
        await api.segment.create(formData);
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

  const filteredProducts = products.filter((prod) =>
    prod.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  const selectedProduct = products.find(
    (prod) => prod.id === formData.product_id
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-amber-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-purple-400 to-fuchsia-500 rounded-2xl shadow-lg">
              <Layers className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-gray-900">
                Segments
              </h1>
              <p className="text-gray-600 font-medium mt-1">
                Manage your segment master data with PD & LGD parameters
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
                      placeholder="Search segments..."
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
                    <span>Add New Segment</span>
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b-2 border-gray-100">
                    <tr>
                      <th className="px-6 py-4 font-bold text-gray-700 text-sm uppercase tracking-wider">
                        #
                      </th>
                      <th className="px-6 py-4 font-bold text-gray-700 text-sm uppercase tracking-wider">
                        Segment Name
                      </th>
                      <th className="px-6 py-4 font-bold text-gray-700 text-sm uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-4 font-bold text-gray-700 text-sm uppercase tracking-wider text-center">
                        PD (%)
                      </th>
                      <th className="px-6 py-4 font-bold text-gray-700 text-sm uppercase tracking-wider text-center">
                        LGD (%)
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
                        <td colSpan={7} className="px-6 py-16 text-center">
                          <Loader2 className="w-10 h-10 text-orange-500 animate-spin mx-auto" />
                          <p className="mt-3 text-gray-500 font-semibold">
                            Loading data...
                          </p>
                        </td>
                      </tr>
                    ) : data.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-6 py-12 text-center text-gray-500 font-medium"
                        >
                          No data found. Try adjusting your search or create a
                          new segment.
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
                            {item.description && (
                              <div className="text-xs text-gray-500 mt-1">
                                {item.description}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm font-semibold text-gray-700 bg-indigo-100 px-3 py-1 rounded-full">
                              {item.product_name || "N/A"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="font-bold text-purple-600">
                              {item.pd}%
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="font-bold text-fuchsia-600">
                              {item.lgd}%
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 ${
                                Number(item.status) === 1
                                  ? "bg-green-100 text-green-700"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  Number(item.status) === 1
                                    ? "bg-green-500"
                                    : "bg-gray-400"
                                }`}
                              />
                              {Number(item.status) === 1 ? "Active" : "Inactive"}
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
                  {editingId ? "Edit Segment" : "Create New Segment"}
                </h3>
                <button
                  onClick={() => setView("list")}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="w-6 h-6 text-gray-600" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
                {/* Product Dropdown */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 block">
                    Product <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsProductOpen(!isProductOpen)}
                      className="w-full px-4 py-3.5 rounded-xl bg-gray-100 border-none focus:ring-2 focus:ring-orange-500/20 focus:bg-white transition-all font-medium text-gray-900 text-left flex items-center justify-between"
                    >
                      <span className={selectedProduct ? "" : "text-gray-400"}>
                        {selectedProduct?.name || "Select a product..."}
                      </span>
                      <ChevronDown
                        className={`w-5 h-5 text-gray-400 transition-transform ${
                          isProductOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {isProductOpen && (
                      <div className="absolute z-10 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-xl max-h-64 overflow-hidden">
                        <div className="p-2 border-b border-gray-100 sticky top-0 bg-white">
                          <input
                            type="text"
                            placeholder="Search product..."
                            value={productSearch}
                            onChange={(e) => setProductSearch(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-400 font-medium"
                          />
                        </div>
                        <div className="overflow-y-auto max-h-48">
                          {filteredProducts.length === 0 ? (
                            <div className="px-4 py-6 text-center text-gray-500 text-sm">
                              No products found
                            </div>
                          ) : (
                            filteredProducts.map((prod) => (
                              <button
                                key={prod.id}
                                type="button"
                                onClick={() => {
                                  setFormData({
                                    ...formData,
                                    product_id: prod.id,
                                  });
                                  setIsProductOpen(false);
                                  setProductSearch("");
                                }}
                                className="w-full px-4 py-3 text-left hover:bg-orange-50 transition-colors flex items-center justify-between group"
                              >
                                <span className="font-medium text-gray-800">
                                  {prod.name}
                                </span>
                                {formData.product_id === prod.id && (
                                  <Check className="w-5 h-5 text-orange-500" />
                                )}
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 block">
                    Segment Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g. Retail Premium"
                    className="w-full px-4 py-3.5 rounded-xl bg-gray-100 border-none focus:ring-2 focus:ring-orange-500/20 focus:bg-white transition-all font-medium text-gray-900 placeholder:text-gray-400"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 block">
                      PD (Probability of Default) %{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={formData.pd}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          pd: parseFloat(e.target.value) || 0,
                        })
                      }
                      placeholder="e.g. 2.5"
                      className="w-full px-4 py-3.5 rounded-xl bg-gray-100 border-none focus:ring-2 focus:ring-orange-500/20 focus:bg-white transition-all font-medium text-gray-900 placeholder:text-gray-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 block">
                      LGD (Loss Given Default) %{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      required
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={formData.lgd}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          lgd: parseFloat(e.target.value) || 0,
                        })
                      }
                      placeholder="e.g. 45.0"
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
                    placeholder="Describe this segment..."
                    className="w-full px-4 py-3.5 rounded-xl bg-gray-100 border-none focus:ring-2 focus:ring-orange-500/20 focus:bg-white transition-all font-medium text-gray-900 placeholder:text-gray-400 resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 block">
                    Status
                  </label>
                  <select
                    value={Number(formData.status)}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: Number(e.target.value),
                      })
                    }
                    className="w-full px-4 py-3.5 rounded-xl bg-gray-100 border-none focus:ring-2 focus:ring-orange-500/20 focus:bg-white transition-all font-medium text-gray-900 cursor-pointer"
                  >
                    <option value={1}>Active</option>
                    <option value={0}>Inactive</option>
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
