"use client";

import { useToast } from "@/components/providers/toast-provider";
import { motion } from "framer-motion";

export const ToastDemo: React.FC = () => {
  const { success, error, warning, info } = useToast();

  const showSuccessToast = () => {
    success(
      "Operasi Berhasil!",
      "Data berhasil disimpan ke database dengan aman",
      4000
    );
  };

  const showErrorToast = () => {
    error(
      "Terjadi Kesalahan!",
      "Gagal menyimpan data. Silakan periksa koneksi internet Anda.",
      6000
    );
  };

  const showWarningToast = () => {
    warning(
      "Perhatian!",
      "Data yang Anda masukkan mungkin tidak valid. Mohon periksa kembali.",
      5000
    );
  };

  const showInfoToast = () => {
    info(
      "Informasi Penting",
      "Sistem akan melakukan maintenance pada pukul 02:00 WIB. Harap simpan pekerjaan Anda. Klik X untuk close manual.",
      10000
    );
  };

  const showMultipleToasts = () => {
    success("Toast 1", "Ini adalah toast pertama", 3000);
    setTimeout(() => {
      error("Toast 2", "Ini adalah toast kedua", 3000);
    }, 500);
    setTimeout(() => {
      warning("Toast 3", "Ini adalah toast ketiga", 3000);
    }, 1000);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Toast Notification Demo
      </h3>
      <p className="text-gray-600 mb-6">
        Klik tombol di bawah untuk melihat berbagai jenis toast notification
        yang muncul di kanan atas.
        <br />
        <span className="text-sm text-gray-500">
          💡 <strong>Tips:</strong> Hover pada toast untuk pause progress bar,
          klik tombol X untuk close manual, dan nikmati animasi yang super
          smooth dengan 60fps!
        </span>
      </p>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={showSuccessToast}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          Success Toast
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={showErrorToast}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          Error Toast
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={showWarningToast}
          className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
        >
          Warning Toast
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={showInfoToast}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Info Toast
        </motion.button>
      </div>

      <div className="border-t pt-4">
        <h4 className="text-md font-medium text-gray-800 mb-3">
          Fitur Lanjutan
        </h4>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={showMultipleToasts}
          className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
        >
          Show Multiple Toasts
        </motion.button>
        <p className="text-xs text-gray-500 mt-2">
          Menampilkan beberapa toast sekaligus untuk melihat animasi layout
        </p>
      </div>
    </div>
  );
};
