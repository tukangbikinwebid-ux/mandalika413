"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import {
  Package,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Gamepad2,
  Loader2,
  AlertCircle,
  FileText,
  Calendar,
} from "lucide-react";
import { useApiCall, useTokenSync } from "@/hooks";
import { api } from "@/services/api";

// Status mapping for transactions
const getStatusInfo = (status: number, statusPayment: number) => {
  if (statusPayment === 2) {
    return {
      label: "Lunas",
      color: "bg-red-100 text-red-800",
    };
  }

  if (statusPayment === 1) {
    return {
      label: "Menunggu Pembayaran",
      color: "bg-yellow-100 text-yellow-800",
    };
  }

  if (status === 1) {
    return {
      label: "Diproses",
      color: "bg-blue-100 text-blue-800",
    };
  }

  if (status === 2) {
    return {
      label: "Selesai",
      color: "bg-red-100 text-red-800",
    };
  }

  return {
    label: "Gagal",
    color: "bg-red-100 text-red-800",
  };
};

export default function AdminDashboard() {
  const { isAuthenticated, hasToken } = useTokenSync();

  // API calls for dashboard data
  const {
    data: transactionsData,
    loading: transactionsLoading,
    execute: fetchTransactions,
  } = useApiCall(() =>
    api.transactions.getTransactions({ page: 1, paginate: 10 })
  );

  const {
    data: productsData,
    loading: productsLoading,
    execute: fetchProducts,
  } = useApiCall(() => api.products.getProducts({ page: 1, paginate: 10 }));

  const {
    data: newsData,
    loading: newsLoading,
    execute: fetchNews,
  } = useApiCall(() =>
    api.newsArticles.getNewsArticles({ page: 1, paginate: 5 })
  );

  // Fetch data on component mount
  useEffect(() => {
    if (isAuthenticated && hasToken) {
      fetchTransactions();
      fetchProducts();
      fetchNews();
    }
  }, [isAuthenticated, hasToken, fetchTransactions, fetchProducts, fetchNews]);

  // Helper functions
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

  const getTotalProducts = () => {
    return productsData?.data?.total || 0;
  };

  const getPendingOrders = () => {
    if (!transactionsData?.data?.data) return 0;
    return transactionsData.data.data.filter((t) => t.status_payment === 0)
      .length;
  };

  // Stats data
  const stats = [
    {
      name: "Total Revenue",
      value: formatPrice(getTotalRevenue()),
      change: "+12.5%",
      changeType: "positive",
      icon: DollarSign,
      color: "from-[#C02628] to-red-500",
    },
    {
      name: "Total Orders",
      value: getTotalOrders().toLocaleString(),
      change: "+8.2%",
      changeType: "positive",
      icon: ShoppingCart,
      color: "from-blue-500 to-cyan-500",
    },
    {
      name: "Total Products",
      value: getTotalProducts().toLocaleString(),
      change: "+3.1%",
      changeType: "positive",
      icon: Package,
      color: "from-red-500 to-[#C02628]",
    },
    {
      name: "Pending Orders",
      value: getPendingOrders().toLocaleString(),
      change: "-2.4%",
      changeType: "negative",
      icon: AlertCircle,
      color: "from-orange-500 to-red-500",
    },
  ];

  const recentTransactions = transactionsData?.data?.data?.slice(0, 5) || [];
  const topProducts = productsData?.data?.data?.slice(0, 4) || [];
  const recentNews = newsData?.data?.data?.slice(0, 3) || [];

  // Show loading state while checking authentication
  if (!isAuthenticated || !hasToken) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Loading...</h1>
          <p className="text-gray-600">
            Please wait while we verify your authentication.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">
          Welcome back! Here&apos;s what&apos;s happening with your gaming
          store.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative overflow-hidden rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200"
          >
            <div className="flex items-center">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-r ${stat.color}`}
              >
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stat.value}
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-center">
              {stat.changeType === "positive" ? (
                <TrendingUp className="h-4 w-4 text-[#C02628]" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
              <span
                className={`ml-2 text-sm font-medium ${
                  stat.changeType === "positive"
                    ? "text-[#C02628]"
                    : "text-red-600"
                }`}
              >
                {stat.change}
              </span>
              <span className="ml-1 text-sm text-gray-500">
                from last month
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Transactions */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Transactions
            </h2>
            <a
              href="/admin/transaksi"
              className="text-sm font-medium text-red-600 hover:text-red-500"
            >
              View all
            </a>
          </div>
          <div className="space-y-4">
            {transactionsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-red-500" />
                <span className="ml-2 text-gray-600">
                  Loading transactions...
                </span>
              </div>
            ) : recentTransactions.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No transactions found</p>
              </div>
            ) : (
              recentTransactions.map((transaction, index) => {
                const status = getStatusInfo(
                  transaction.status,
                  transaction.status_payment
                );
                return (
                  <motion.div
                    key={transaction.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-[#C02628]">
                        <Gamepad2 className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {transaction.customer_name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {transaction.product.name}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {formatPrice(transaction.amount)}
                      </p>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${status.color}`}
                        >
                          {status.label}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(transaction.created_at).toLocaleDateString(
                            "id-ID"
                          )}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </motion.div>

        {/* Top Products */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Top Products
            </h2>
            <a
              href="/admin/produk"
              className="text-sm font-medium text-red-600 hover:text-red-500"
            >
              View all
            </a>
          </div>
          <div className="space-y-4">
            {productsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-red-500" />
                <span className="ml-2 text-gray-600">Loading products...</span>
              </div>
            ) : topProducts.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No products found</p>
              </div>
            ) : (
              topProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500">
                      <Package className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {product.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        SKU: {product.sku}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {formatPrice(parseFloat(product.sell_price))}
                    </p>
                    <div className="flex items-center space-x-1">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                          product.status === 1
                            ? "bg-red-100 text-red-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {product.status === 1 ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </div>

      {/* Recent News */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Recent News</h2>
          <a
            href="/admin/news"
            className="text-sm font-medium text-red-600 hover:text-red-500"
          >
            View all
          </a>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {newsLoading ? (
            <div className="col-span-3 flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-red-500" />
              <span className="ml-2 text-gray-600">Loading news...</span>
            </div>
          ) : recentNews.length === 0 ? (
            <div className="col-span-3 text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No news articles found</p>
            </div>
          ) : (
            recentNews.map((article, index) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                className="rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-start space-x-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-purple-500 to-pink-500">
                    <FileText className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {article.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {article.content?.substring(0, 100)}...
                    </p>
                    <div className="flex items-center space-x-2 mt-2">
                      <Calendar className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-500">
                        {new Date(article.created_at).toLocaleDateString(
                          "id-ID"
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="rounded-xl bg-gradient-to-r from-red-500 to-[#C02628] p-6 text-white"
      >
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <a
            href="/admin/produk"
            className="flex items-center space-x-3 rounded-lg bg-white/20 p-4 hover:bg白/30 transition-colors duration-200"
          >
            <Package className="h-5 w-5" />
            <span className="text-sm font-medium">Manage Products</span>
          </a>
          <a
            href="/admin/transaksi"
            className="flex items-center space-x-3 rounded-lg bg-white/20 p-4 hover:bg-white/30 transition-colors duration-200"
          >
            <ShoppingCart className="h-5 w-5" />
            <span className="text-sm font-medium">View Transactions</span>
          </a>
          <a
            href="/admin/news"
            className="flex items-center space-x-3 rounded-lg bg-white/20 p-4 hover:bg-white/30 transition-colors duration-200"
          >
            <FileText className="h-5 w-5" />
            <span className="text-sm font-medium">Manage News</span>
          </a>
          <a
            href="/admin/deposit"
            className="flex items-center space-x-3 rounded-lg bg-white/20 p-4 hover:bg-white/30 transition-colors duration-200"
          >
            <DollarSign className="h-5 w-5" />
            <span className="text-sm font-medium">View Deposits</span>
          </a>
        </div>
      </motion.div>
    </div>
  );
}
