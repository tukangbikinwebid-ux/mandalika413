"use client";

import { useEffect, useState } from "react";
import {
  X,
  Plus,
  Search,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Save,
  RotateCcw,
  ChevronDown,
  Check,
} from "lucide-react";
import { api } from "@/services/api";
import type {
  Product,
  CreateProductRequest,
} from "@/services/api/master/product";
import type { ProductCategory } from "@/services/api/master/product-categories";

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdateTotal: (total: number) => void;
}

export default function ProductModal({
  isOpen,
  onClose,
  onUpdateTotal,
}: ProductModalProps) {
  // --- State Data ---
  const [data, setData] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [paginate] = useState(5);

  // --- State Form ---
  const [view, setView] = useState<"list" | "form">("list");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // --- State Custom Dropdown Searchable ---
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");

  // Form Data Default
  const defaultForm: CreateProductRequest = {
    product_category_id: 0,
    name: "",
    code: "",
    description: "",
    status: 1,
  };
  const [formData, setFormData] = useState<CreateProductRequest>(defaultForm);

  // --- Fetch Data Products ---
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.product.getAll({
        page,
        paginate,
        search,
      });
      if (res.code === 200) {
        setData(res.data.data);
        setTotal(res.data.total);
        onUpdateTotal(res.data.total);
      }
    } catch (error) {
      console.error("Failed to fetch products", error);
    } finally {
      setLoading(false);
    }
  };

  // --- Fetch Categories ---
  const fetchCategories = async () => {
    try {
      // Ambil cukup banyak untuk dropdown
      const res = await api.productCategory.getAll({ paginate: 100 });
      if (res.code === 200) {
        setCategories(res.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch categories", error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchData();
      fetchCategories();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, page, search]);

  // --- Derived State untuk Searchable Dropdown ---
  const filteredCategories = categories.filter(
    (cat) =>
      cat.name.toLowerCase().includes(categorySearch.toLowerCase()) ||
      cat.code.toLowerCase().includes(categorySearch.toLowerCase())
  );

  const selectedCategory = categories.find(
    (c) => c.id === formData.product_category_id
  );

  // --- Handlers ---

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      await api.product.remove(id);
      fetchData();
    } catch (error) {
      alert("Failed to delete data");
    }
  };

  const prepareEdit = (item: Product) => {
    setEditingId(item.id);
    setFormData({
      product_category_id: item.product_category_id,
      name: item.name,
      code: item.code,
      description: item.description,
      status: Number(item.status),
    });
    // Reset dropdown state
    setCategorySearch("");
    setView("form");
  };

  const prepareCreate = () => {
    setEditingId(null);
    setFormData(defaultForm);
    // Reset dropdown state
    setCategorySearch("");
    setView("form");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.product_category_id) {
      alert("Please select a category");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingId) {
        await api.product.update(editingId, formData);
      } else {
        await api.product.create(formData);
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-5xl shadow-2xl border-2 border-orange-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-orange-50 to-white">
          <div>
            <h2 className="text-2xl font-black text-gray-900">
              Master Products
            </h2>
            <p className="text-sm text-gray-500 font-medium mt-1">
              Manage your product items
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-orange-100 transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto flex-1 bg-white">
          {view === "list" ? (
            <>
              {/* Toolbar */}
              <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search product..."
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
                  className="px-6 py-3 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-xl shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 text-white font-bold flex items-center gap-2 transform hover:scale-105 transition-all"
                >
                  <Plus className="w-5 h-5" />
                  Add New
                </button>
              </div>

              {/* Table */}
              <div className="bg-white rounded-2xl border-2 border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="px-6 py-4 font-bold text-gray-700 text-sm uppercase tracking-wider">
                          Product Info
                        </th>
                        <th className="px-6 py-4 font-bold text-gray-700 text-sm uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-6 py-4 font-bold text-gray-700 text-sm uppercase tracking-wider">
                          Description
                        </th>
                        <th className="px-6 py-4 font-bold text-gray-700 text-sm uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-4 font-bold text-gray-700 text-sm text-right uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {loading ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center">
                            <Loader2 className="w-8 h-8 text-orange-500 animate-spin mx-auto" />
                            <p className="mt-2 text-gray-500 font-medium">
                              Loading products...
                            </p>
                          </td>
                        </tr>
                      ) : data.length === 0 ? (
                        <tr>
                          <td
                            colSpan={5}
                            className="px-6 py-8 text-center text-gray-500 font-medium"
                          >
                            No products found.
                          </td>
                        </tr>
                      ) : (
                        data.map((item) => (
                          <tr
                            key={item.id}
                            className="hover:bg-orange-50/50 transition-colors group"
                          >
                            <td className="px-6 py-4">
                              <div className="font-bold text-gray-900">
                                {item.name}
                              </div>
                              <div className="text-xs font-semibold text-orange-600 bg-orange-100 inline-block px-2 py-0.5 rounded mt-1">
                                {item.code}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm font-semibold text-gray-700 bg-gray-100 px-2 py-1 rounded-lg">
                                {item.product_category_name || "-"}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600 font-medium max-w-xs truncate">
                              {item.description}
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-bold ${
                                  Number(item.status) === 1
                                    ? "bg-green-100 text-green-700"
                                    : "bg-gray-100 text-gray-600"
                                }`}
                              >
                                {Number(item.status) === 1
                                  ? "Active"
                                  : "Inactive"}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => prepareEdit(item)}
                                  className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(item.id)}
                                  className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
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
                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50">
                  <span className="text-sm font-medium text-gray-600">
                    Total:{" "}
                    <span className="font-bold text-gray-900">{total}</span>{" "}
                    items
                  </span>
                  <div className="flex gap-2">
                    <button
                      disabled={page === 1}
                      onClick={() => setPage((p) => p - 1)}
                      className="p-2 rounded-lg border border-gray-300 hover:bg-white disabled:opacity-50 transition-all"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      disabled={data.length < paginate}
                      onClick={() => setPage((p) => p + 1)}
                      className="p-2 rounded-lg border border-gray-300 hover:bg-white disabled:opacity-50 transition-all"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* --- Form View --- */
            <div className="w-full h-full flex flex-col">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-black text-gray-900">
                  {editingId ? "Edit Product" : "New Product"}
                </h3>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6 flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* --- CUSTOM SEARCHABLE DROPDOWN CATEGORY --- */}
                  <div className="space-y-2 md:col-span-2 relative">
                    <label className="text-sm font-bold text-gray-700">
                      Product Category
                    </label>
                    <div className="relative">
                      {/* Trigger Button */}
                      <button
                        type="button"
                        onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                        className="w-full px-4 py-3.5 rounded-xl bg-gray-100 border-none focus:ring-2 focus:ring-orange-500/20 focus:bg-white transition-all font-medium text-gray-900 text-left flex items-center justify-between"
                      >
                        <span
                          className={
                            selectedCategory ? "text-gray-900" : "text-gray-400"
                          }
                        >
                          {selectedCategory
                            ? `${selectedCategory.name} (${selectedCategory.code})`
                            : "Select Category"}
                        </span>
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                      </button>

                      {/* Dropdown Content */}
                      {isCategoryOpen && (
                        <div className="absolute z-50 mt-2 w-full bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                          {/* Search Input inside Dropdown */}
                          <div className="p-2 border-b border-gray-100 bg-gray-50">
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                              <input
                                autoFocus
                                type="text"
                                placeholder="Search category..."
                                value={categorySearch}
                                onChange={(e) =>
                                  setCategorySearch(e.target.value)
                                }
                                className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 focus:border-orange-400 focus:outline-none text-sm font-medium"
                              />
                            </div>
                          </div>

                          {/* List Options */}
                          <div className="max-h-60 overflow-y-auto">
                            {filteredCategories.length === 0 ? (
                              <div className="px-4 py-3 text-sm text-gray-500 text-center">
                                No categories found.
                              </div>
                            ) : (
                              filteredCategories.map((cat) => (
                                <button
                                  key={cat.id}
                                  type="button"
                                  onClick={() => {
                                    setFormData({
                                      ...formData,
                                      product_category_id: cat.id,
                                    });
                                    setIsCategoryOpen(false);
                                    setCategorySearch(""); // Optional: reset search
                                  }}
                                  className={`w-full px-4 py-3 text-left text-sm font-medium hover:bg-orange-50 transition-colors flex items-center justify-between ${
                                    formData.product_category_id === cat.id
                                      ? "bg-orange-50 text-orange-700"
                                      : "text-gray-700"
                                  }`}
                                >
                                  <span>
                                    {cat.name}{" "}
                                    <span className="text-gray-400 text-xs ml-1">
                                      ({cat.code})
                                    </span>
                                  </span>
                                  {formData.product_category_id === cat.id && (
                                    <Check className="w-4 h-4 text-orange-600" />
                                  )}
                                </button>
                              ))
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Backdrop/Overlay transparent untuk menutup dropdown saat klik luar */}
                    {isCategoryOpen && (
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsCategoryOpen(false)}
                      />
                    )}
                  </div>
                  {/* ------------------------------------------- */}

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">
                      Product Name
                    </label>
                    <input
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="e.g. Nike Air Jordan"
                      className="w-full px-4 py-3.5 rounded-xl bg-gray-100 border-none focus:ring-2 focus:ring-orange-500/20 focus:bg-white transition-all font-medium text-gray-900 placeholder:text-gray-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">
                      Product Code
                    </label>
                    <input
                      required
                      value={formData.code}
                      onChange={(e) =>
                        setFormData({ ...formData, code: e.target.value })
                      }
                      placeholder="e.g. PRD-001"
                      className="w-full px-4 py-3.5 rounded-xl bg-gray-100 border-none focus:ring-2 focus:ring-orange-500/20 focus:bg-white transition-all font-medium text-gray-900 placeholder:text-gray-400"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">
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
                    placeholder="Describe this product..."
                    className="w-full px-4 py-3.5 rounded-xl bg-gray-100 border-none focus:ring-2 focus:ring-orange-500/20 focus:bg-white transition-all font-medium text-gray-900 placeholder:text-gray-400 resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">
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

                <div className="flex gap-4 pt-6 mt-auto">
                  <button
                    type="button"
                    onClick={() => setView("list")}
                    className="px-8 py-3.5 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition-all flex items-center gap-2"
                  >
                    <RotateCcw className="w-5 h-5" />
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-8 py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-bold hover:shadow-lg hover:shadow-orange-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Save className="w-5 h-5" />
                    )}
                    Save Changes
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