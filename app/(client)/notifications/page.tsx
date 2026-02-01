"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  ChevronLeft,
  ChevronRight,
  CheckCheck,
  Download,
  RefreshCw,
} from "lucide-react";
import { api } from "@/services/api";
import type { Notification } from "@/services/api/notification";

export default function NotificationPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalData, setTotalData] = useState(0);
  const [hasLoaded, setHasLoaded] = useState(false);
  const perPage = 10;

  // --- Fetch Notifications (Manual) ---
  const fetchNotifications = async (pageNum?: number) => {
    setLoading(true);
    try {
      const res = await api.notification.getAll({
        page: pageNum || page,
        paginate: perPage,
        orderBy: "updated_at",
        order: "desc",
      });

      if (res.code === 200) {
        setNotifications(res.data.data);
        setTotalData(res.data.total);
        setTotalPages(res.data.last_page);
        setHasLoaded(true);
      }
    } catch (error) {
      console.error("Gagal mengambil notifikasi:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch on page change only if already loaded
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    if (hasLoaded) {
      fetchNotifications(newPage);
    }
  };

  // --- Actions ---

  const handleMarkAsRead = async (id: string) => {
    try {
      await api.notification.markAsRead(id);
      // Update local state untuk responsivitas instan
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, read_at: new Date().toISOString() } : n
        )
      );
      // Optional: Refetch untuk memastikan sinkronisasi
      // fetchNotifications();
    } catch (err) {
      console.error("Gagal menandai sebagai dibaca:", err);
    }
  };

  const handleDownload = async (id: string, url: string) => {
    try {
      // Tandai dibaca dulu
      await api.notification.markAsRead(id);
      // Update UI
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, read_at: new Date().toISOString() } : n
        )
      );
      // Buka url
      window.open(url, "_blank");
    } catch (err) {
      console.error("Gagal mengunduh:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    setLoadingAction(true);
    try {
      await api.notification.markAllAsRead();
      fetchNotifications(); // Refresh full data
    } catch (err) {
      console.error("Gagal menandai semua sebagai dibaca:", err);
    } finally {
      setLoadingAction(false);
    }
  };

  // Helper truncate text
  const limitWords = (text?: string | null, maxWords = 7) => {
    if (!text) return "";
    const words = text.split(" ");
    return words.length > maxWords
      ? words.slice(0, maxWords).join(" ") + "..."
      : text;
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-2xl font-black text-gray-900">Notifikasi</h1>
            <p className="text-sm text-gray-500 mt-1">
              Pusat informasi dan unduhan laporan Anda
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => fetchNotifications()}
              disabled={loading}
              className="gap-2 border-blue-200 hover:bg-blue-50 hover:text-blue-700"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              Muat Data
            </Button>
            <Button
              size="sm"
              onClick={handleMarkAllAsRead}
              disabled={loadingAction || !hasLoaded || notifications.every((n) => n.read_at)}
              className="bg-orange-500 hover:bg-orange-600 text-white gap-2"
            >
              {loadingAction ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCheck className="w-4 h-4" />
              )}
              Tandai Semua Dibaca
            </Button>
          </div>
        </div>

        {/* Content Card */}
        <Card className="border-2 border-gray-100 shadow-lg rounded-2xl overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50/80 border-b border-gray-100 text-left">
                  <tr>
                    <th className="px-6 py-4 font-bold text-gray-700">No</th>
                    <th className="px-6 py-4 font-bold text-gray-700">Tipe</th>
                    <th className="px-6 py-4 font-bold text-gray-700">Pesan</th>
                    <th className="px-6 py-4 font-bold text-gray-700">
                      Tanggal
                    </th>
                    <th className="px-6 py-4 font-bold text-gray-700">
                      Unduhan
                    </th>
                    <th className="px-6 py-4 font-bold text-gray-700">
                      Status
                    </th>
                    <th className="px-6 py-4 font-bold text-gray-700">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                          <p className="text-gray-500 font-medium">
                            Memuat notifikasi...
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : !hasLoaded ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-6 py-12 text-center"
                      >
                        <div className="flex flex-col items-center justify-center gap-3">
                          <RefreshCw className="w-10 h-10 text-gray-300" />
                          <p className="text-gray-500 font-medium">
                            Klik tombol &quot;Muat Data&quot; untuk memuat notifikasi
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : notifications.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-6 py-12 text-center text-gray-500 font-medium"
                      >
                        Tidak ada notifikasi saat ini.
                      </td>
                    </tr>
                  ) : (
                    notifications.map((n, index) => (
                      <tr
                        key={n.id}
                        className={`hover:bg-gray-50 transition-colors ${
                          !n.read_at ? "bg-orange-50/30" : ""
                        }`}
                      >
                        <td className="px-6 py-4 font-medium text-gray-600">
                          {(page - 1) * perPage + index + 1}
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-bold">
                            {n.data.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-800">
                          {limitWords(n.data.message)}
                        </td>
                        <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                          {new Date(n.data.date).toLocaleString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="px-6 py-4">
                          {typeof n.data?.url === "string" &&
                          n.data.url.trim() !== "" &&
                          n.data.url.trim() !== "#" ? (
                            <a
                              href={n.data.url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 gap-2 text-xs border-orange-200 hover:bg-orange-50 hover:text-orange-700"
                              >
                                <Download className="w-3 h-3" />
                                File
                              </Button>
                            </a>
                          ) : (
                            <span className="text-gray-400 text-xs italic">
                              -
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <Badge
                            className={`pointer-events-none ${
                              n.read_at
                                ? "bg-gray-100 text-gray-600 hover:bg-gray-100"
                                : "bg-green-100 text-green-700 hover:bg-green-100"
                            }`}
                          >
                            {n.read_at ? "Dibaca" : "Baru"}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {!n.read_at && (
                              <>
                                {n.data.url ? (
                                  <Button
                                    size="sm"
                                    className="h-8 bg-orange-500 hover:bg-orange-600 text-white text-xs gap-2"
                                    onClick={() =>
                                      handleDownload(n.id, n.data.url!)
                                    }
                                  >
                                    <Download className="w-3 h-3" />
                                    Unduh
                                  </Button>
                                ) : (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8 text-xs gap-2"
                                    onClick={() => handleMarkAsRead(n.id)}
                                  >
                                    <CheckCheck className="w-3 h-3" />
                                    Baca
                                  </Button>
                                )}
                              </>
                            )}
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
                <span className="font-bold text-gray-900">{totalData}</span>{" "}
                data
              </span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page <= 1 || loading || !hasLoaded}
                  onClick={() => handlePageChange(page - 1)}
                  className="gap-1 pl-2.5"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Sebelumnya
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page >= totalPages || loading || !hasLoaded}
                  onClick={() => handlePageChange(page + 1)}
                  className="gap-1 pr-2.5"
                >
                  Berikutnya
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}