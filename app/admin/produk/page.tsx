"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Package,
  Eye,
  X,
  Save,
  DollarSign,
  Tag,
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
  Product,
  ProductCategory,
  CreateProductRequest,
  UpdateProductRequest,
} from "@/lib/types";
import { getImageUrl } from "@/lib/image-url";
import { useToast } from "@/components/providers/toast-provider";
import Image from "next/image";
// import { ErrorHandler } from "@/lib/utils/error-handler";

export default function ProdukPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  // const [currentPage, setCurrentPage] = useState(1);
  // const [perPage] = useState(10);

  // Hierarchy states
  const [expandedSubCategories, setExpandedSubCategories] = useState<
    Set<number>
  >(new Set());
  const [selectedSubCategory, setSelectedSubCategory] = useState<number | null>(
    null
  );
  const [subCategories, setSubCategories] = useState<ProductCategory[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  // Toast hook
  const { success, error, warning } = useToast();
  const [formData, setFormData] = useState({
    product_category_id: 0,
    name: "",
    sku: "",
    description: "",
    buy_price: "",
    sell_price: "",
    status: 1 as 0 | 1,
    image: null as File | null,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Debounce search term untuk UX yang lebih baik
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Token sync untuk authentication
  const { isAuthenticated, hasToken } = useTokenSync();

  // API calls
  // Fetch subcategories (children categories)
  const {
    data: subCategoriesData,
    loading: subCategoriesLoading,
    error: subCategoriesError,
    execute: fetchSubCategories,
  } = useApiCall(() =>
    api.productCategories.getProductCategories({
      page: 1,
      paginate: 100,
      // Get all categories first, then filter on client side
      status: 1,
    })
  );

  // Fetch all products
  const {
    data: productsData,
    loading: productsLoading,
    error: productsError,
    execute: fetchProducts,
  } = useApiCall(() =>
    api.products.getProducts({
      page: 1,
      paginate: 1000, // Get all products
      search: debouncedSearchTerm || undefined,
    })
  );

  const { loading: submitLoading, execute: submitProduct } = useApiCall(
    async (data: CreateProductRequest | UpdateProductRequest) => {
      if (editingProduct) {
        return api.products.updateProduct(data as UpdateProductRequest);
      } else {
        return api.products.createProduct(data as CreateProductRequest);
      }
    }
  );

  const { execute: deleteProduct } = useApiCall((slug: string) =>
    api.products.deleteProduct(slug)
  );

  // Fetch all categories for dropdown
  const { data: categoriesData, execute: fetchCategories } = useApiCall(() =>
    api.productCategories.getProductCategories({
      page: 1,
      paginate: 100,
    })
  );

  // Fetch data on mount and when dependencies change
  useEffect(() => {
    if (isAuthenticated && hasToken) {
      fetchSubCategories();
      fetchCategories();
    }
  }, [isAuthenticated, hasToken]);

  // Fetch products on mount and when search changes
  useEffect(() => {
    if (isAuthenticated && hasToken) {
      fetchProducts();
    }
  }, [debouncedSearchTerm, isAuthenticated, hasToken]);

  // Update state when data changes - filter only subcategories (children)
  useEffect(() => {
    if (subCategoriesData?.data?.data) {
      console.log("Raw categories data:", subCategoriesData.data.data);
      // Filter only subcategories (those with parent_id not null)
      const subCategoriesOnly = subCategoriesData.data.data.filter(
        (category: ProductCategory) => category.parent_id !== null
      );
      console.log("Filtered subcategories:", subCategoriesOnly);
      setSubCategories(subCategoriesOnly);
    }
  }, [subCategoriesData]);

  useEffect(() => {
    if (productsData?.data?.data) {
      console.log("Products data received:", productsData.data.data);
      setProducts(productsData.data.data);
    }
  }, [productsData]);

  const categories = categoriesData?.data?.data || [];

  // Helper function to get products for a subcategory
  const getProductsForSubCategory = (subCategoryId: number) => {
    console.log(
      "getProductsForSubCategory called with subCategoryId:",
      subCategoryId
    );
    console.log("All products:", products);
    console.log(
      "Products with matching category_id:",
      products.filter(
        (product) => product.product_category_id === subCategoryId
      )
    );
    return products.filter(
      (product) => product.product_category_id === subCategoryId
    );
  };

  // Toggle subcategory expansion
  const toggleSubCategoryExpansion = (subCategoryId: number) => {
    setExpandedSubCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(subCategoryId)) {
        newSet.delete(subCategoryId);
      } else {
        newSet.add(subCategoryId);
      }
      return newSet;
    });
  };

  // Handle subcategory selection for adding products
  const handleSubCategorySelection = (subCategoryId: number) => {
    setSelectedSubCategory(subCategoryId);
    setFormData((prev) => ({ ...prev, product_category_id: subCategoryId }));
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

    // Client-side validation
    if (!formData.name.trim()) {
      warning("Validasi Gagal", "Nama produk harus diisi");
      return;
    }
    if (!formData.sku.trim()) {
      warning("Validasi Gagal", "SKU produk harus diisi");
      return;
    }
    if (!formData.buy_price || parseFloat(formData.buy_price) <= 0) {
      warning("Validasi Gagal", "Harga beli harus diisi dan lebih dari 0");
      return;
    }
    if (!formData.sell_price || parseFloat(formData.sell_price) <= 0) {
      warning("Validasi Gagal", "Harga jual harus diisi dan lebih dari 0");
      return;
    }
    if (formData.product_category_id === 0) {
      warning("Validasi Gagal", "Kategori produk harus dipilih");
      return;
    }

    try {
      const submitData = {
        ...formData,
        buy_price: parseFloat(formData.buy_price),
        sell_price: parseFloat(formData.sell_price),
        ...(editingProduct && { slug: editingProduct.slug }),
      };

      console.log("Submitting product data:", submitData);

      await submitProduct(submitData);

      // Reset form
      resetForm();

      // Refresh data
      await fetchProducts();

      // Show success toast
      success(
        editingProduct
          ? "Produk Berhasil Diupdate"
          : "Produk Berhasil Ditambahkan",
        editingProduct
          ? `Produk "${formData.name}" berhasil diperbarui`
          : `Produk "${formData.name}" berhasil ditambahkan ke katalog`,
        4000
      );
    } catch (err) {
      console.error("Error submitting product:", err);
      error(
        "Gagal Menyimpan Produk",
        "Terjadi kesalahan saat menyimpan produk. Silakan coba lagi."
      );
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      product_category_id: product.product_category_id,
      name: product.name,
      sku: product.sku,
      description: product.description || "",
      buy_price: product.buy_price,
      sell_price: product.sell_price,
      status: product.status,
      image: null,
    });

    // Set image preview if product has an image
    if (product.image) {
      setImagePreview(getImageUrl(product.image));
    } else {
      setImagePreview(null);
    }

    setShowForm(true);
  };

  const handleDelete = async (product: Product) => {
    if (confirm("Apakah Anda yakin ingin menghapus produk ini?")) {
      try {
        await deleteProduct(product.slug);
        await fetchProducts();

        // Show success toast
        success(
          "Produk Berhasil Dihapus",
          `Produk "${product.name}" berhasil dihapus dari katalog`,
          4000
        );
      } catch (err) {
        console.error("Error deleting product:", err);
        error(
          "Gagal Menghapus Produk",
          "Terjadi kesalahan saat menghapus produk. Silakan coba lagi."
        );
      }
    }
  };

  const resetForm = () => {
    setFormData({
      product_category_id: 0,
      name: "",
      sku: "",
      description: "",
      buy_price: "",
      sell_price: "",
      status: 1,
      image: null,
    });
    setImagePreview(null);
    setEditingProduct(null);
    setSelectedSubCategory(null);
    setShowForm(false);
  };

  const handleView = (product: Product) => {
    setSelectedProduct(product);
  };

  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === "string" ? parseFloat(price) : price;
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(numPrice);
  };

  const getStatusColor = (status: number) => {
    switch (status) {
      case 1:
        return "bg-red-100 text-red-800";
      case 0:
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: number) => {
    return status === 1 ? "Aktif" : "Tidak Aktif";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Produk</h1>
          <p className="text-gray-600">
            Kelola produk gaming store Anda berdasarkan subkategori
            {subCategories.length > 0 && (
              <span className="ml-2 text-sm text-gray-500">
                ({subCategories.length} subkategori)
              </span>
            )}
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 bg-gradient-to-r from-[#C02628] to-red-500 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-red-600 transition-all duration-200"
        >
          <Plus className="h-5 w-5" />
          <span>Tambah Produk</span>
        </motion.button>
      </div>

      {/* Authentication Check */}
      {!isAuthenticated && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">
            Silakan login untuk mengakses halaman ini.
          </p>
        </div>
      )}

      {isAuthenticated && !hasToken && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">
            Token tidak ditemukan. Silakan login ulang.
          </p>
        </div>
      )}

      {isAuthenticated && hasToken && (
        <>
          {/* Search */}
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Cari produk..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C02628] focus:border-transparent"
              />
            </div>
            <button
              onClick={() => {
                fetchSubCategories();
                fetchProducts();
              }}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
              title="Refresh data"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </button>
            {subCategoriesLoading && (
              <div className="flex items-center text-sm text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Loading...
              </div>
            )}
          </div>

          {/* Loading State */}
          {productsLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-[#C02628]" />
              <span className="ml-2 text-gray-600">Memuat produk...</span>
            </div>
          )}

          {/* Error State */}
          {productsError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">
                Gagal memuat produk: {productsError}
              </p>
              <button
                onClick={() => fetchProducts()}
                className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
              >
                Coba lagi
              </button>
            </div>
          )}

          {/* Hierarchy View - Subcategories and Products */}
          {!subCategoriesLoading && !subCategoriesError && (
            <div className="space-y-4">
              {subCategories.length === 0 ? (
                <div className="text-center py-12">
                  <Folder className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Belum ada subkategori
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Mulai dengan membuat subkategori terlebih dahulu
                  </p>
                </div>
              ) : (
                subCategories.map((subCategory, index) => {
                  const isExpanded = expandedSubCategories.has(subCategory.id);
                  const subCategoryProducts = getProductsForSubCategory(
                    subCategory.id
                  );

                  return (
                    <div
                      key={subCategory.id}
                      className="bg-white rounded-xl shadow-sm ring-1 ring-gray-200 overflow-hidden"
                    >
                      {/* Subcategory Header */}
                      <div className="p-6 border-b border-gray-100">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <button
                              onClick={() =>
                                toggleSubCategoryExpansion(subCategory.id)
                              }
                              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
                            >
                              {isExpanded ? (
                                <ChevronDown className="h-5 w-5" />
                              ) : (
                                <ChevronRight className="h-5 w-5" />
                              )}
                              <div className="relative">
                                {subCategory.image ? (
                                  <Image
                                    src={getImageUrl(subCategory.image)}
                                    alt={subCategory.title}
                                    className="h-12 w-12 rounded-lg object-cover"
                                  />
                                ) : (
                                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500">
                                    <Tag className="h-6 w-6 text-white" />
                                  </div>
                                )}
                              </div>
                              <div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                  {subCategory.title}
                                </h3>
                              </div>
                            </button>
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
                              onClick={() =>
                                handleSubCategorySelection(subCategory.id)
                              }
                              className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                              title="Tambah produk"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Products */}
                      {isExpanded && (
                        <div className="bg-gray-50">
                          {subCategoryProducts.length > 0 ? (
                            <div className="p-4 space-y-2">
                              {subCategoryProducts.map((product) => (
                                <div
                                  key={product.id}
                                  className="flex items-center justify-between bg-white rounded-lg p-3 border border-gray-200"
                                >
                                  <div className="flex items-center space-x-3">
                                    <div className="relative">
                                      {product.image ? (
                                        <Image
                                          src={getImageUrl(product.image)}
                                          alt={product.name}
                                          className="h-8 w-8 rounded-lg object-cover"
                                        />
                                      ) : (
                                        <div className="h-8 w-8 bg-gray-100 rounded-lg flex items-center justify-center">
                                          <Package className="h-4 w-4 text-gray-600" />
                                        </div>
                                      )}
                                    </div>
                                    <div>
                                      <h4 className="text-sm font-medium text-gray-900">
                                        {product.name}
                                      </h4>
                                      <p className="text-xs text-gray-600">
                                        SKU: {product.sku}
                                      </p>
                                      {product.description && (
                                        <p className="text-xs text-gray-500 mt-1">
                                          {product.description}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <div className="text-right">
                                      <p className="text-sm font-medium text-gray-900">
                                        Rp{" "}
                                        {parseFloat(
                                          product.sell_price
                                        ).toLocaleString()}
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        Beli: Rp{" "}
                                        {parseFloat(
                                          product.buy_price
                                        ).toLocaleString()}
                                      </p>
                                    </div>
                                    <span
                                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        product.status === 1
                                          ? "bg-red-100 text-red-800"
                                          : "bg-red-100 text-red-800"
                                      }`}
                                    >
                                      {product.status === 1
                                        ? "Aktif"
                                        : "Tidak Aktif"}
                                    </span>
                                    <button
                                      onClick={() => handleEdit(product)}
                                      className="text-indigo-600 hover:text-indigo-900 p-1 hover:bg-indigo-50 rounded transition-colors duration-200"
                                      title="Edit produk"
                                    >
                                      <Edit className="h-3 w-3" />
                                    </button>
                                    <button
                                      onClick={() => handleDelete(product)}
                                      className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded transition-colors duration-200"
                                      title="Hapus produk"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="p-4 text-center text-gray-500">
                              <Package className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                              <p className="text-sm">Belum ada produk</p>
                              <button
                                onClick={() =>
                                  handleSubCategorySelection(subCategory.id)
                                }
                                className="text-blue-600 hover:text-blue-900 text-sm mt-1 underline"
                              >
                                Tambah produk pertama
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

          {/* Loading State */}
          {subCategoriesLoading && (
            <div className="hidden lg:block bg-white rounded-xl shadow-sm ring-1 ring-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 table-fixed">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3">
                        Produk
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                        Kategori
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                        Harga Jual
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                        Harga Beli
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">
                        Status
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {products.map((product, index) => (
                      <motion.tr
                        key={product.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="hover:bg-gray-50 transition-colors duration-200"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-[#C02628] to-red-500 flex items-center justify-center">
                                <Package className="h-5 w-5 text-white" />
                              </div>
                            </div>
                            <div className="ml-3 min-w-0">
                              <div className="text-sm font-medium text-gray-900 truncate">
                                {product.name}
                              </div>
                              <div className="text-xs text-gray-500 truncate max-w-48">
                                {product.description || "-"}
                              </div>
                              <div className="text-xs text-gray-400">
                                SKU: {product.sku}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center">
                            <Tag className="h-3 w-3 text-gray-400 mr-1" />
                            <span className="text-xs text-gray-900 truncate">
                              {product.category_title}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center">
                            <DollarSign className="h-3 w-3 text-gray-400 mr-1" />
                            <span className="text-xs font-medium text-gray-900">
                              {formatPrice(product.sell_price)}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center">
                            <DollarSign className="h-3 w-3 text-gray-400 mr-1" />
                            <span className="text-xs font-medium text-gray-900">
                              {formatPrice(product.buy_price)}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              product.status
                            )}`}
                          >
                            {getStatusText(product.status)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end space-x-1">
                            <button
                              onClick={() => handleView(product)}
                              className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded transition-colors duration-200"
                              title="Lihat Detail"
                            >
                              <Eye className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => handleEdit(product)}
                              className="text-indigo-600 hover:text-indigo-900 p-1 hover:bg-indigo-50 rounded transition-colors duration-200"
                              title="Edit"
                            >
                              <Edit className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => handleDelete(product)}
                              className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded transition-colors duration-200"
                              title="Hapus"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Mobile Card View */}
          {!productsLoading && !productsError && (
            <div className="lg:hidden space-y-4">
              {products.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl shadow-sm ring-1 ring-gray-200 p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-12">
                        <div className="h-12 w-12 rounded-lg bg-gradient-to-r from-[#C02628] to-red-500 flex items-center justify-center">
                          <Package className="h-6 w-6 text-white" />
                        </div>
                      </div>
                      <div className="ml-3 min-w-0 flex-1">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {product.name}
                        </h3>
                        <p className="text-xs text-gray-500 truncate">
                          {product.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleView(product)}
                        className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded transition-colors duration-200"
                        title="Lihat Detail"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(product)}
                        className="text-indigo-600 hover:text-indigo-900 p-2 hover:bg-indigo-50 rounded transition-colors duration-200"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(product)}
                        className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded transition-colors duration-200"
                        title="Hapus"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-gray-500">Kategori:</span>
                      <div className="flex items-center mt-1">
                        <Tag className="h-3 w-3 text-gray-400 mr-1" />
                        <span className="text-gray-900">
                          {product.category_title}
                        </span>
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">Harga Jual:</span>
                      <div className="flex items-center mt-1">
                        <DollarSign className="h-3 w-3 text-gray-400 mr-1" />
                        <span className="text-gray-900 font-medium">
                          {formatPrice(product.sell_price)}
                        </span>
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">Harga Beli:</span>
                      <div className="flex items-center mt-1">
                        <DollarSign className="h-3 w-3 text-gray-400 mr-1" />
                        <span className="text-gray-900 font-medium">
                          {formatPrice(product.buy_price)}
                        </span>
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">SKU:</span>
                      <span className="ml-2 text-gray-900">{product.sku}</span>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        product.status
                      )}`}
                    >
                      {getStatusText(product.status)}
                    </span>
                  </div>
                </motion.div>
              ))}
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
                  className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">
                      {editingProduct ? "Edit Produk" : "Tambah Produk"}
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nama Produk *
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C02628] focus:border-transparent"
                          placeholder="Masukkan nama produk"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          SKU *
                        </label>
                        <input
                          type="text"
                          value={formData.sku}
                          onChange={(e) =>
                            setFormData({ ...formData, sku: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C02628] focus:border-transparent"
                          placeholder="Masukkan SKU"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Subkategori Produk *
                        </label>
                        <select
                          value={formData.product_category_id}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              product_category_id: parseInt(e.target.value),
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C02628] focus:border-transparent"
                          title="Pilih kategori produk"
                          required
                        >
                          <option value={0}>Pilih subkategori</option>
                          {subCategories.map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.title}
                            </option>
                          ))}
                        </select>
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
                              status: parseInt(e.target.value) as 0 | 1,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C02628] focus:border-transparent"
                          title="Pilih status produk"
                          required
                        >
                          <option value={1}>Aktif</option>
                          <option value={0}>Tidak Aktif</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Harga Beli *
                        </label>
                        <input
                          type="number"
                          value={formData.buy_price}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              buy_price: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C02628] focus:border-transparent"
                          placeholder="Masukkan harga beli"
                          min="0"
                          step="0.01"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Harga Jual *
                        </label>
                        <input
                          type="number"
                          value={formData.sell_price}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              sell_price: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C02628] focus:border-transparent"
                          placeholder="Masukkan harga jual"
                          min="0"
                          step="0.01"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Deskripsi
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            description: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C02628] focus:border-transparent"
                        placeholder="Masukkan deskripsi produk"
                        rows={3}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Gambar Produk
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
                            aria-label="Upload product image"
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
                        className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-[#C02628] to-red-500 text-white rounded-lg hover:from-red-600 hover:to-red-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {submitLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                        <span>
                          {submitLoading
                            ? "Menyimpan..."
                            : editingProduct
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

          {/* Product Detail Modal */}
          <AnimatePresence>
            {selectedProduct && (
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
                      Detail Produk
                    </h2>
                    <button
                      onClick={() => setSelectedProduct(null)}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                      title="Tutup detail"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="space-y-6">
                    {/* Product Image */}
                    <div className="flex justify-center">
                      <div className="w-48 h-48 bg-gradient-to-r from-[#C02628] to-red-500 rounded-lg flex items-center justify-center">
                        <Package className="h-24 w-24 text-white" />
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                          Informasi Produk
                        </h3>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">
                              Nama Produk:
                            </span>
                            <span className="text-sm font-medium text-gray-900">
                              {selectedProduct.name}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">
                              Kategori:
                            </span>
                            <span className="text-sm font-medium text-gray-900">
                              {selectedProduct.category_title}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">SKU:</span>
                            <span className="text-sm font-medium text-gray-900">
                              {selectedProduct.sku}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">
                              Harga Beli:
                            </span>
                            <span className="text-sm font-medium text-gray-900">
                              {formatPrice(selectedProduct.buy_price)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">
                              Harga Jual:
                            </span>
                            <span className="text-sm font-medium text-gray-900">
                              {formatPrice(selectedProduct.sell_price)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">
                              Status:
                            </span>
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                selectedProduct.status
                              )}`}
                            >
                              {getStatusText(selectedProduct.status)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                          Deskripsi
                        </h3>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {selectedProduct.description || "Tidak ada deskripsi"}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}
