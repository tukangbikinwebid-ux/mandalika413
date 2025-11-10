"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Tag,
  X,
  Save,
  Loader2,
} from "lucide-react";
import { useApiCall, useDebounce } from "@/hooks";
import { useTokenSync } from "@/hooks/use-token-sync";
import { api } from "@/services/api";
import {
  NewsTag,
  CreateNewsTagRequest,
  UpdateNewsTagRequest,
} from "@/lib/types";

export default function NewsTagsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingTag, setEditingTag] = useState<NewsTag | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(10);
  const [retryTrigger, setRetryTrigger] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: 1 as 0 | 1,
  });

  // Debounce search term untuk UX yang lebih baik
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Token sync untuk authentication
  const { isAuthenticated, hasToken } = useTokenSync();

  // API calls
  const {
    data: tagsData,
    loading: tagsLoading,
    error: tagsError,
    execute: fetchTags,
  } = useApiCall(api.newsTags.getNewsTags);

  const { loading: submitLoading, execute: submitTag } = useApiCall(
    api.newsTags.createNewsTag
  );

  const { loading: updateLoading, execute: updateTag } = useApiCall(
    api.newsTags.updateNewsTag
  );

  const { execute: deleteTag } = useApiCall(api.newsTags.deleteNewsTag);

  // Load tags on component mount and when search/page changes
  useEffect(() => {
    if (isAuthenticated && hasToken) {
      fetchTags({
        page: currentPage,
        paginate: perPage,
        search: debouncedSearchTerm || undefined,
      }).catch((error) => {
        console.error("Error in fetchTags:", error);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    currentPage,
    debouncedSearchTerm,
    isAuthenticated,
    hasToken,
    retryTrigger,
  ]);

  // Get tags from API response
  const tags = tagsData?.data?.data || [];
  const pagination = tagsData?.data;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side validation
    if (!formData.name.trim()) {
      console.error("Nama tag harus diisi");
      return;
    }

    if (!formData.description.trim()) {
      console.error("Deskripsi tag harus diisi");
      return;
    }

    try {
      const submitData: CreateNewsTagRequest | UpdateNewsTagRequest = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        status: formData.status,
        ...(editingTag && { slug: editingTag.slug }),
      };

      if (editingTag) {
        await updateTag(editingTag.slug, submitData as UpdateNewsTagRequest);
      } else {
        await submitTag(submitData as CreateNewsTagRequest);
      }

      // Refresh data
      setRetryTrigger((prev) => prev + 1);

      resetForm();
    } catch (error) {
      console.error("Error submitting news tag:", error);
    }
  };

  const handleEdit = (tag: NewsTag) => {
    setEditingTag(tag);
    setFormData({
      name: tag.name,
      description: tag.description,
      status: tag.status,
    });
    setShowForm(true);
  };

  const handleDelete = async (tag: NewsTag) => {
    if (confirm(`Are you sure you want to delete "${tag.name}"?`)) {
      try {
        await deleteTag(tag.slug);

        // Refresh data
        setRetryTrigger((prev) => prev + 1);
      } catch (error) {
        console.error("Error deleting news tag:", error);
      }
    }
  };

  const resetForm = () => {
    setFormData({ name: "", description: "", status: 1 });
    setEditingTag(null);
    setShowForm(false);
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
    switch (status) {
      case 1:
        return "Aktif";
      case 0:
        return "Tidak Aktif";
      default:
        return "Tidak Aktif";
    }
  };

  // Show loading state
  if (tagsLoading && !tagsData && !tagsError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-red-500" />
          <p className="text-gray-600">Loading tags...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (tagsError && !tagsData && !tagsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 mb-4">
            Error loading tags:{" "}
            {typeof tagsError === "string" ? tagsError : "Unknown error"}
          </p>
          <button
            onClick={() => {
              setRetryTrigger((prev) => prev + 1);
            }}
            className="px-4 py-2 bg-[#C02628] text-white rounded-lg hover:bg-red-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Show authentication required
  if (!isAuthenticated || !hasToken) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-gray-600 mb-4">
            Authentication required to access this page.
          </p>
        </div>
      </div>
    );
  }

  // Show empty state if no data and no loading/error
  if (!tagsLoading && !tagsError && tags.length === 0) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tags News</h1>
            <p className="text-gray-600">
              Kelola tags untuk artikel dan berita
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowForm(true)}
            className="flex items-center space-x-2 bg-gradient-to-r from-red-500 to-[#C02628] text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-red-600 transition-all duration-200"
          >
            <Plus className="h-5 w-5" />
            <span>Tambah Tag</span>
          </motion.button>
        </div>

        {/* Search */}
        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari tag..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
          {tagsLoading && (
            <div className="flex items-center text-sm text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Searching...
            </div>
          )}
        </div>

        {/* Empty State */}
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Tag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? "Tidak ada tag yang sesuai" : "Belum ada tags"}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm
                ? "Coba ubah kata kunci pencarian Anda."
                : "Mulai dengan menambahkan tag pertama Anda."}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowForm(true)}
                className="px-4 py-2 bg-[#C02628] text-white rounded-lg hover:bg-red-600"
              >
                Tambah Tag Pertama
              </button>
            )}
          </div>
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
                    {editingTag ? "Edit Tag" : "Tambah Tag"}
                  </h2>
                  <button
                    onClick={resetForm}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                    title="Close form"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nama Tag
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="Masukkan nama tag"
                      required
                    />
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="Masukkan deskripsi tag"
                      rows={3}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          status: parseInt(e.target.value) as 0 | 1,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      aria-label="Select status"
                    >
                      <option value={1}>Aktif</option>
                      <option value={0}>Tidak Aktif</option>
                    </select>
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
                      disabled={submitLoading || updateLoading}
                      className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-500 to-[#C02628] text-white rounded-lg hover:from-red-600 hover:to-red-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitLoading || updateLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      <span>
                        {submitLoading || updateLoading
                          ? editingTag
                            ? "Updating..."
                            : "Saving..."
                          : editingTag
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
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tags News</h1>
          <p className="text-gray-600">
            Kelola tags untuk artikel dan berita
            {pagination && (
              <span className="ml-2 text-sm text-gray-500">
                ({pagination.total} total)
              </span>
            )}
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 bg-gradient-to-r from-red-500 to-[#C02628] text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-red-600 transition-all duration-200"
        >
          <Plus className="h-5 w-5" />
          <span>Tambah Tag</span>
        </motion.button>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Cari tag..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>
        {tagsLoading && (
          <div className="flex items-center text-sm text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Searching...
          </div>
        )}
      </div>

      {/* Tags Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {tags.map((tag, index) => (
          <motion.div
            key={tag.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-sm ring-1 ring-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-red-500 to-[#C02628]">
                  <Tag className="h-5 w-5 text-white" />
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {tag.name}
                  </h3>
                  <p className="text-sm text-gray-500">#{tag.slug}</p>
                </div>
              </div>
              <span
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                  tag.status
                )}`}
              >
                {getStatusText(tag.status)}
              </span>
            </div>

            <p className="text-gray-600 text-sm mb-4">{tag.description}</p>

            <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
              <span>
                Dibuat: {new Date(tag.created_at).toLocaleDateString("id-ID")}
              </span>
              <span>
                Diupdate: {new Date(tag.updated_at).toLocaleDateString("id-ID")}
              </span>
            </div>

            <div className="flex items-center justify-end space-x-2">
              <button
                onClick={() => handleEdit(tag)}
                className="text-indigo-600 hover:text-indigo-900 p-2 hover:bg-indigo-50 rounded-lg transition-colors duration-200"
                title="Edit"
              >
                <Edit className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleDelete(tag)}
                className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-lg transition-colors duration-200"
                title="Hapus"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        ))}
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
                  {editingTag ? "Edit Tag" : "Tambah Tag"}
                </h2>
                <button
                  onClick={resetForm}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  title="Close form"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Tag
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Masukkan nama tag"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deskripsi
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Masukkan deskripsi tag"
                    rows={3}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: parseInt(e.target.value) as 0 | 1,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    aria-label="Select status"
                  >
                    <option value={1}>Aktif</option>
                    <option value={0}>Tidak Aktif</option>
                  </select>
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
                    disabled={submitLoading || updateLoading}
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-500 to-[#C02628] text-white rounded-lg hover:from-red-600 hover:to-red-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitLoading || updateLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    <span>
                      {submitLoading || updateLoading
                        ? editingTag
                          ? "Updating..."
                          : "Saving..."
                        : editingTag
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

      {/* Pagination */}
      {pagination && pagination.last_page > 1 && (
        <div className="flex items-center justify-between mt-8">
          <div className="text-sm text-gray-700">
            Menampilkan {pagination.from} sampai {pagination.to} dari{" "}
            {pagination.total} tags
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="px-3 py-2 text-sm">
              Halaman {currentPage} dari {pagination.last_page}
            </span>
            <button
              onClick={() =>
                setCurrentPage((prev) =>
                  Math.min(prev + 1, pagination.last_page)
                )
              }
              disabled={currentPage === pagination.last_page}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
