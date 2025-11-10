"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Tag,
  Gamepad2,
  Monitor,
  Headphones,
  Smartphone,
  X,
  Save,
  Loader2,
  Folder,
  ChevronRight,
  ChevronDown,
  RefreshCw,
  Upload,
} from "lucide-react";
import { useApiCall, useDebounce } from "@/hooks";
import { useTokenSync } from "@/hooks/use-token-sync";
import { api } from "@/services/api";
import {
  ProductCategory,
  CreateProductCategoryRequest,
  UpdateProductCategoryRequest,
} from "@/lib/types";
import { getImageUrl } from "@/lib/image-url";
import { useToast } from "@/components/providers/toast-provider";
import Image from "next/image";
// import { ErrorHandler } from "@/lib/utils/error-handler";

// Dynamic import for MDEditor to avoid SSR issues
const MDEditor = dynamic(() => import("@uiw/react-md-editor"), {
  ssr: false,
  loading: () => (
    <div className="h-32 bg-gray-100 rounded-lg animate-pulse flex items-center justify-center text-gray-500">
      Loading editor...
    </div>
  ),
});

// MDEditor configuration
const editorConfig = {
  height: 200,
  preview: "edit" as const,
  hideToolbar: false,
};

// Icon mapping for categories
const getCategoryIcon = (title: string) => {
  const lowerTitle = title.toLowerCase();
  if (lowerTitle.includes("game") || lowerTitle.includes("topup"))
    return Gamepad2;
  if (lowerTitle.includes("voucher")) return Tag;
  if (lowerTitle.includes("accessory")) return Headphones;
  if (lowerTitle.includes("mobile")) return Smartphone;
  return Monitor;
};

const getCategoryColor = (index: number) => {
  const colors = [
    "from-blue-500 to-cyan-500",
    "from-[#C02628] to-[#C02628]",
    "from-[#C02628] to-[#C02628]",
    "from-orange-500 to-red-500",
    "from-purple-500 to-pink-500",
    "from-indigo-500 to-blue-500",
  ];
  return colors[index % colors.length];
};

export default function KategoriProdukPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] =
    useState<ProductCategory | null>(null);
  const [expandedParent, setExpandedParent] = useState<number | null>(null);
  const [selectedParent, setSelectedParent] = useState<number | null>(null);
  const [parentCategories, setParentCategories] = useState<ProductCategory[]>(
    []
  );
  const [subCategories, setSubCategories] = useState<ProductCategory[]>([]);
  const [loadingSubCategories, setLoadingSubCategories] = useState<Set<number>>(
    new Set()
  );

  // Toast hook
  const { success, error, warning } = useToast();

  // Debounce search term untuk UX yang lebih baik
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [formData, setFormData] = useState<CreateProductCategoryRequest>({
    title: "",
    description: "",
    status: 1,
    sub_title: "",
    parent_id: null,
    image: null,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(5);

  // Token synchronization
  const { isAuthenticated, hasToken } = useTokenSync();

  // Fetch parent categories with search and pagination
  const {
    data: parentCategoriesData,
    loading: parentCategoriesLoading,
    error: parentCategoriesError,
    execute: fetchParentCategories,
  } = useApiCall(() =>
    api.productCategories.getProductCategories({
      page: currentPage,
      paginate: perPage,
      is_parent: 1,
      status: 1,
      search: debouncedSearchTerm || undefined,
    })
  );

  // Fetch subcategories for selected parent
  const { data: subCategoriesData, execute: fetchSubCategories } = useApiCall(
    (parentId: number) =>
      api.productCategories.getProductCategories({
        page: 1,
        paginate: 100,
        parent_id: parentId,
        status: 1,
      })
  );

  const { loading: submitLoading, execute: submitCategory } = useApiCall(
    async (
      data: CreateProductCategoryRequest | UpdateProductCategoryRequest
    ) => {
      if (editingCategory) {
        return api.productCategories.updateProductCategory({
          ...data,
          slug: editingCategory.slug,
        } as UpdateProductCategoryRequest);
      } else {
        return api.productCategories.createProductCategory(
          data as CreateProductCategoryRequest
        );
      }
    }
  );

  const { execute: deleteCategory } = useApiCall((slug: string) =>
    api.productCategories.deleteProductCategory(slug)
  );

  // Load parent categories on component mount and when search/page changes
  useEffect(() => {
    if (isAuthenticated && hasToken) {
      fetchParentCategories();
    }
  }, [
    currentPage,
    debouncedSearchTerm,
    isAuthenticated,
    hasToken,
    fetchParentCategories,
  ]);

  // Update parent categories when data changes
  useEffect(() => {
    if (parentCategoriesData?.data?.data) {
      setParentCategories(parentCategoriesData.data.data);
    }
  }, [parentCategoriesData]);

  // Update subcategories when data changes
  useEffect(() => {
    if (subCategoriesData?.data?.data) {
      setSubCategories(subCategoriesData.data.data);
    }
  }, [subCategoriesData]);

  // Toggle parent category expansion
  const toggleParentExpansion = async (parentId: number) => {
    if (expandedParent === parentId) {
      // If already expanded, collapse it
      setExpandedParent(null);
    } else {
      // If different parent, expand it and fetch subcategories
      setExpandedParent(parentId);
      setLoadingSubCategories((prev) => new Set(prev).add(parentId));

      try {
        await fetchSubCategories(parentId);
      } catch (err) {
        console.error("Error fetching subcategories:", err);
        error(
          "Gagal Memuat Subkategori",
          "Terjadi kesalahan saat memuat subkategori"
        );
      } finally {
        setLoadingSubCategories((prev) => {
          const newSet = new Set(prev);
          newSet.delete(parentId);
          return newSet;
        });
      }
    }
  };

  // Handle parent selection for creating subcategory
  const handleParentSelection = (parentId: number) => {
    setSelectedParent(parentId);
    setFormData((prev) => ({ ...prev, parent_id: parentId }));
    setShowForm(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, image: file });

      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form data being submitted:", formData);

    // Validate required fields
    if (!formData.title || !formData.title.trim()) {
      warning("Validasi Gagal", "Title kategori harus diisi");
      return;
    }

    if (formData.status === undefined || formData.status === null) {
      warning("Validasi Gagal", "Status kategori harus dipilih");
      return;
    }

    try {
      await submitCategory(formData);
      setShowForm(false);
      setEditingCategory(null);
      resetForm();
      fetchParentCategories(); // Refresh the list

      // Show success toast
      success(
        editingCategory
          ? "Kategori Berhasil Diupdate"
          : "Kategori Berhasil Ditambahkan",
        editingCategory
          ? `Kategori "${formData.title}" berhasil diperbarui`
          : `Kategori "${formData.title}" berhasil ditambahkan ke sistem`
      );
    } catch (err) {
      console.error("Form submission error:", err);
      error(
        "Gagal Menyimpan Kategori",
        "Terjadi kesalahan saat menyimpan kategori. Silakan coba lagi."
      );
    }
  };

  const handleEdit = (category: ProductCategory) => {
    setEditingCategory(category);
    setFormData({
      title: category.title,
      description: category.description || "",
      status: category.status,
      sub_title: category.sub_title || "",
      parent_id: category.parent_id,
      image: null,
    });

    // Set image preview if category has an image
    if (category.image) {
      setImagePreview(getImageUrl(category.image));
    } else {
      setImagePreview(null);
    }

    setShowForm(true);
  };

  const handleDelete = async (category: ProductCategory) => {
    if (confirm(`Are you sure you want to delete "${category.title}"?`)) {
      try {
        await deleteCategory(category.slug);
        fetchParentCategories(); // Refresh the list

        // Show success toast
        success(
          "Kategori Berhasil Dihapus",
          `Kategori "${category.title}" berhasil dihapus dari sistem`
        );
      } catch (err) {
        console.error("Delete error:", err);
        error(
          "Gagal Menghapus Kategori",
          "Terjadi kesalahan saat menghapus kategori. Silakan coba lagi."
        );
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      status: 1,
      sub_title: "",
      parent_id: null,
      image: null,
    });
    setImagePreview(null);
    setEditingCategory(null);
    setSelectedParent(null);
    setShowForm(false);
  };

  // Helper function to get subcategories for a parent
  const getSubCategoriesForParent = (parentId: number) => {
    return subCategories.filter((cat) => cat.parent_id === parentId);
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Kategori Produk</h1>
          <p className="text-gray-600">
            Kelola kategori produk dan subkategori
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setSelectedParent(null);
            setFormData((prev) => ({ ...prev, parent_id: null }));
            setShowForm(true);
          }}
          className="flex items-center space-x-2 bg-gradient-to-r from-[#C02628] to-[#C02628] text-white px-4 py-2 rounded-lg hover:from-[#B02122] hover:to-[#8F1719] transition-all duration-200"
        >
          <Plus className="h-5 w-5" />
          <span>Kategori Baru</span>
        </motion.button>
      </div>

      {/* Authentication Check */}
      {!isAuthenticated && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">
            <strong>Authentication Required:</strong> Please login to access
            this page.
          </p>
        </div>
      )}

      {isAuthenticated && !hasToken && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">
            <strong>Token Missing:</strong> Authentication token not found.
            Please refresh the page or login again.
          </p>
        </div>
      )}

      {/* Search and Filter */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Cari kategori..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C02628] focus:border-transparent"
          />
        </div>
        <button
          onClick={() => {
            fetchParentCategories();
          }}
          className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
        >
          <RefreshCw className="h-5 w-5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Loading State */}
      {parentCategoriesLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#C02628]" />
          <span className="ml-2 text-gray-600">Loading categories...</span>
        </div>
      )}

      {/* Error State */}
      {parentCategoriesError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">
            Error loading categories: {parentCategoriesError}
          </p>
          <button
            onClick={() => {
              fetchParentCategories();
            }}
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Categories Display */}
      {!parentCategoriesLoading && !parentCategoriesError && (
        <div className="space-y-4">
          {parentCategories.length === 0 ? (
            <div className="text-center py-12">
              <Folder className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Belum ada kategori utama
              </h3>
              <p className="text-gray-600 mb-4">
                Mulai dengan membuat kategori utama terlebih dahulu
              </p>
              <button
                onClick={() => {
                  setSelectedParent(null);
                  setFormData((prev) => ({ ...prev, parent_id: null }));
                  setShowForm(true);
                }}
                className="inline-flex items-center px-4 py-2 bg-[#C02628] text-white rounded-lg hover:bg-[#B02122] transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Buat Kategori Utama
              </button>
            </div>
          ) : (
            parentCategories.map((parent, index) => {
              const IconComponent = getCategoryIcon(parent.title);
              const colorClass = getCategoryColor(index);
              const isExpanded = expandedParent === parent.id;
              const isLoadingSubCategories = loadingSubCategories.has(
                parent.id
              );
              const parentSubCategories = getSubCategoriesForParent(parent.id);

              return (
                <div
                  key={parent.id}
                  className="bg-white rounded-xl shadow-sm ring-1 ring-gray-200 overflow-hidden"
                >
                  {/* Parent Category */}
                  <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => toggleParentExpansion(parent.id)}
                          disabled={isLoadingSubCategories}
                          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isLoadingSubCategories ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : isExpanded ? (
                            <ChevronDown className="h-5 w-5" />
                          ) : (
                            <ChevronRight className="h-5 w-5" />
                          )}
                          <div className="relative">
                            {parent.image ? (
                              <Image
                                src={getImageUrl(parent.image)}
                                alt={parent.title}
                                className="h-12 w-12 rounded-lg object-cover"
                              />
                            ) : (
                              <div
                                className={`flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-r ${colorClass}`}
                              >
                                <IconComponent className="h-6 w-6 text-white" />
                              </div>
                            )}
                          </div>
                        </button>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {parent.title}
                          </h3>
                          {parent.sub_title && (
                            <p className="text-sm text-gray-600">
                              {parent.sub_title}
                            </p>
                          )}
                          {parent.description && (
                            <p className="text-sm text-gray-500 mt-1">
                              {parent.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            parent.status === 1
                              ? "bg-red-100 text-red-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {parent.status === 1 ? "Aktif" : "Tidak Aktif"}
                        </span>
                        <button
                          onClick={() => handleParentSelection(parent.id)}
                          className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                          title="Tambah subkategori"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(parent)}
                          className="text-indigo-600 hover:text-indigo-900 p-2 hover:bg-indigo-50 rounded-lg transition-colors duration-200"
                          title="Edit kategori"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(parent)}
                          className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-lg transition-colors duration-200"
                          title="Hapus kategori"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Subcategories */}
                  {isExpanded && (
                    <div className="bg-gray-50">
                      {isLoadingSubCategories ? (
                        <div className="p-4 flex items-center justify-center">
                          <Loader2 className="h-6 w-6 animate-spin text-[#C02628]" />
                          <span className="ml-2 text-gray-600">
                            Loading subcategories...
                          </span>
                        </div>
                      ) : parentSubCategories.length > 0 ? (
                        <div className="p-4 space-y-2">
                          {parentSubCategories.map((subCategory) => (
                            <div
                              key={subCategory.id}
                              className="flex items-center justify-between bg-white rounded-lg p-3 border border-gray-200"
                            >
                              <div className="flex items-center space-x-3">
                                <div className="relative">
                                  {subCategory.image ? (
                                    <Image
                                      src={getImageUrl(subCategory.image)}
                                      alt={subCategory.title}
                                      className="h-8 w-8 rounded-lg object-cover"
                                    />
                                  ) : (
                                    <div className="h-8 w-8 bg-gray-100 rounded-lg flex items-center justify-center">
                                      <Tag className="h-4 w-4 text-gray-600" />
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <h4 className="text-sm font-medium text-gray-900">
                                    {subCategory.title}
                                  </h4>
                                  {subCategory.sub_title && (
                                    <p className="text-xs text-gray-600">
                                      {subCategory.sub_title}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    subCategory.status === 1
                                      ? "bg-red-100 text-red-800"
                                      : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {subCategory.status === 1
                                    ? "Aktif"
                                    : "Tidak Aktif"}
                                </span>
                                <button
                                  onClick={() => handleEdit(subCategory)}
                                  className="text-indigo-600 hover:text-indigo-900 p-1 hover:bg-indigo-50 rounded transition-colors duration-200"
                                  title="Edit subkategori"
                                >
                                  <Edit className="h-3 w-3" />
                                </button>
                                <button
                                  onClick={() => handleDelete(subCategory)}
                                  className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded transition-colors duration-200"
                                  title="Hapus subkategori"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-4 text-center text-gray-500">
                          <Folder className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                          <p className="text-sm">Belum ada subkategori</p>
                          <button
                            onClick={() => handleParentSelection(parent.id)}
                            className="text-blue-600 hover:text-blue-900 text-sm mt-1 underline"
                          >
                            Tambah subkategori pertama
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Empty State */}
      {!parentCategoriesLoading &&
        !parentCategoriesError &&
        parentCategories.length === 0 && (
          <div className="text-center py-12">
            <Tag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm
                ? "Kategori tidak ditemukan"
                : "Belum ada kategori utama"}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm
                ? "Coba ubah kata kunci pencarian Anda."
                : "Mulai dengan membuat kategori utama terlebih dahulu."}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center px-4 py-2 bg-[#C02628] text-white rounded-lg hover:bg-[#B02122] transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Buat Kategori
              </button>
            )}
          </div>
        )}

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
                  {editingCategory
                    ? `Edit ${
                        editingCategory.parent_id
                          ? "Subkategori"
                          : "Kategori Utama"
                      }`
                    : selectedParent
                    ? "Tambah Subkategori"
                    : "Tambah Kategori Utama"}
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
                {/* Parent Selection for Subcategory - Only show if creating subcategory */}
                {!editingCategory && selectedParent && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kategori Induk
                    </label>
                    <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-700">
                      {parentCategories.find((p) => p.id === selectedParent)
                        ?.title || "Kategori Induk"}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C02628] focus:border-transparent"
                    placeholder="Masukkan title kategori"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sub Title
                  </label>
                  <input
                    type="text"
                    value={formData.sub_title || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, sub_title: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C02628] focus:border-transparent"
                    placeholder="Masukkan sub title (opsional)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  {/* Show rich text editor only for subcategories */}
                  {editingCategory?.parent_id || selectedParent ? (
                    <div className="border border-gray-300 rounded-lg overflow-hidden">
                      <textarea
                        value={formData.description || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            description: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C02628] focus:border-transparent"
                        placeholder="Masukkan deskripsi kategori"
                        rows={3}
                      />
                    </div>
                  ) : (
                    <textarea
                      value={formData.description || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C02628] focus:border-transparent"
                      placeholder="Masukkan deskripsi kategori"
                      rows={3}
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status *
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C02628] focus:border-transparent"
                    title="Pilih status kategori"
                    required
                  >
                    <option value={1}>Active</option>
                    <option value={0}>Inactive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gambar Kategori
                  </label>
                  <div className="space-y-4">
                    {/* Image Preview */}
                    {imagePreview && (
                      <div className="relative">
                        <Image
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-48 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setImagePreview(null);
                            setFormData({ ...formData, image: null });
                          }}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          title="Remove image"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    )}

                    {/* File Input */}
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#C02628] transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        id="image-upload"
                        aria-label="Upload category image"
                      />
                      <label
                        htmlFor="image-upload"
                        className="cursor-pointer flex flex-col items-center"
                      >
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-600">
                          Klik untuk upload atau drag and drop
                        </p>
                        <p className="text-xs text-gray-500">
                          PNG, JPG, GIF up to 5MB
                        </p>
                      </label>
                    </div>
                  </div>
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
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    disabled={submitLoading}
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-[#C02628] to-[#C02628] text-white rounded-lg hover:from-[#B02122] hover:to-[#8F1719] transition-all duration-200 disabled:opacity-50"
                  >
                    {submitLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    <span>{editingCategory ? "Update" : "Simpan"}</span>
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pagination */}
      {!parentCategoriesLoading &&
        !parentCategoriesError &&
        parentCategoriesData?.data.data &&
        parentCategoriesData.data.data.length > 0 && (
          <div className="flex items-center justify-between mt-8">
            <div className="text-sm text-gray-700">
              Menampilkan {parentCategoriesData.data.from} -{" "}
              {parentCategoriesData.data.to} dari{" "}
              {parentCategoriesData.data.total} kategori utama
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={!parentCategoriesData.data.prev_page_url}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sebelumnya
              </button>
              <span className="px-3 py-2 text-sm bg-[#C02628] text-white rounded-lg">
                {parentCategoriesData.data.current_page}
              </span>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={!parentCategoriesData.data.next_page_url}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Selanjutnya
              </button>
            </div>
          </div>
        )}
    </div>
  );
}