"use client";

import { useState, useEffect, use } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronRight,
  Play,
  Shield,
  Clock,
  AlertCircle,
  Youtube,
  Loader2,
} from "lucide-react";
import {
  publicProductCategoriesService,
  PublicProductCategory,
} from "@/services/api/public-product-categories";
import {
  publicProductsService,
  PublicProduct,
} from "@/services/api/public-products";
import { checkoutService, CheckoutRequest } from "@/services/api/checkout";
import { useApiCall, useAuth } from "@/hooks";

const testimonials = [
  {
    id: 1,
    title: "WAJIB PICK...",
    thumbnail:
      "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=300&h=200&fit=crop&crop=center",
    youtubeId: "dQw4w9WgXcQ",
  },
  {
    id: 2,
    title: "HITMAN? PA...",
    thumbnail:
      "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=300&h=200&fit=crop&crop=center",
    youtubeId: "dQw4w9WgXcQ",
  },
  {
    id: 3,
    title: "28 TOKEN RO...",
    thumbnail:
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=300&h=200&fit=crop&crop=center",
    youtubeId: "dQw4w9WgXcQ",
  },
];

const paymentMethods = [
  { name: "BCA", logo: "🏦" },
  { name: "BNI", logo: "🏦" },
  { name: "Mandiri", logo: "🏦" },
  { name: "BRI", logo: "🏦" },
  { name: "GoPay", logo: "💚" },
  { name: "OVO", logo: "💙" },
  { name: "DANA", logo: "💜" },
  { name: "ShopeePay", logo: "🛍️" },
  { name: "LinkAja", logo: "🔗" },
  { name: "QRIS", logo: "📱" },
  { name: "Indomaret", logo: "🏪" },
  { name: "Alfamart", logo: "🏪" },
  { name: "Telkomsel", logo: "📱" },
  { name: "Tri", logo: "📱" },
  { name: "XL", logo: "📱" },
  { name: "VISA", logo: "💳" },
  { name: "Mastercard", logo: "💳" },
];

const ProductDetailPage = ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const { user, isAuthenticated } = useAuth();
  const [category, setCategory] = useState<PublicProductCategory | null>(null);
  const [products, setProducts] = useState<PublicProduct[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<PublicProduct | null>(
    null
  );
  const [customerNo, setCustomerNo] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [discountCode, setDiscountCode] = useState("");
  const [selectedPayment, setSelectedPayment] = useState("");
  const [isFormValid, setIsFormValid] = useState(false);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Unwrap params using React.use()
  const resolvedParams = use(params);

  // API call to fetch category details
  const {
    data: categoryData,
    loading: categoryLoading,
    error: categoryError,
    execute: fetchCategory,
  } = useApiCall(() =>
    publicProductCategoriesService.getProductCategory(resolvedParams.slug)
  );

  // API call to fetch products for this category
  const {
    data: productsData,
    loading: productsLoading,
    error: productsError,
    execute: fetchProducts,
  } = useApiCall(() => {
    if (categoryData?.data?.id) {
      return publicProductsService.getProducts({
        page: 1,
        paginate: 100,
        status: 1,
        product_category_id: categoryData.data.id,
      });
    }
    return Promise.resolve(null);
  });

  useEffect(() => {
    fetchCategory();
  }, [resolvedParams.slug, fetchCategory]);

  useEffect(() => {
    if (categoryData?.data) {
      setCategory(categoryData.data);
      // Fetch products for this category
      fetchProducts();
    }
  }, [categoryData, fetchProducts]);

  useEffect(() => {
    if (productsData?.data?.data) {
      setProducts(productsData.data.data);
    }
  }, [productsData]);

  useEffect(() => {
    const valid =
      customerNo.trim() !== "" &&
      selectedPackage !== null &&
      customerPhone.trim() !== "";
    setIsFormValid(valid);
  }, [customerNo, selectedPackage, customerPhone]);

  const handleYouTubeRedirect = (youtubeId: string) => {
    window.open(`https://www.youtube.com/watch?v=${youtubeId}`, "_blank");
  };

  const handleCheckout = async () => {
    if (!selectedPackage || !isFormValid) return;

    setIsCheckoutLoading(true);
    setCheckoutError(null);
    setCheckoutSuccess(false);

    try {
      const checkoutData: CheckoutRequest = {
        user_id: isAuthenticated && user?.id ? parseInt(user.id) : undefined,
        product_id: selectedPackage.id,
        customer_no: customerNo,
        customer_name: customerName.trim() || undefined,
        customer_email: customerEmail.trim() || undefined,
        customer_phone: customerPhone,
        midtrans_payment_type: "qris", // or set based on your payment selection logic
        midtrans_channel: "qris", // or set based on your payment selection logic
      };

      const response = await checkoutService.checkout(checkoutData);

      if (response.data) {
        // Reset form first
        setCustomerNo("");
        setCustomerName("");
        setCustomerEmail("");
        setCustomerPhone("");
        setDiscountCode("");
        setSelectedPayment("");
        setSelectedPackage(null);

        // Show success message briefly
        setCheckoutSuccess(true);

        // Redirect to payment link after a short delay for better UX
        if (response.data.payment_link) {
          setTimeout(() => {
            setIsRedirecting(true);
            try {
              if (typeof response.data.payment_link === "string") {
                window.location.href = response.data.payment_link;
              }
            } catch (error) {
              console.error("Redirect failed:", error);
              // Fallback: open in new tab if redirect fails
              if (
                typeof response.data.payment_link === "string" &&
                response.data.payment_link
              ) {
                window.open(response.data.payment_link, "_blank");
              }
            }
          }, 1500); // 1.5 second delay to show success message
        }
      }
    } catch (error: unknown) {
      console.error("Checkout error:", error);
      setCheckoutError(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat memproses checkout"
      );
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  // Loading state
  if (categoryLoading || productsLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#C02628] mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Loading Product...
          </h1>
          <p className="text-gray-600">
            Please wait while we fetch the product details.
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (categoryError || productsError) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Error Loading Product
          </h1>
          <p className="text-gray-600 mb-6">
            There was an error loading the product details.
          </p>
          <div className="space-x-4">
            <button
              onClick={() => {
                fetchCategory();
                fetchProducts();
              }}
              className="bg-[#C02628] text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors"
            >
              Try Again
            </button>
            <Link
              href="/produk"
              className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Back to Catalog
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Category not found
  if (!category) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😵</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Kategori Tidak Ditemukan
          </h1>
          <p className="text-gray-600 mb-6">
            Maaf, kategori yang Anda cari tidak tersedia.
          </p>
          <Link
            href="/produk"
            className="bg-[#C02628] text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors"
          >
            Kembali ke Katalog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b border-gray-200 py-3">
        <div className="container">
          <nav className="flex items-center space-x-2 text-sm">
            <Link
              href="/"
              className="text-gray-500 hover:text-[#C02628] transition-colors"
            >
              Home
            </Link>
            <ChevronRight size={16} className="text-gray-400" />
            <Link
              href="/produk"
              className="text-gray-500 hover:text-[#C02628] transition-colors"
            >
              Search
            </Link>
            <ChevronRight size={16} className="text-gray-400" />
            <span className="text-gray-800 font-medium">{category.title}</span>
          </nav>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Product Header */}
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-4">
                {category.title}
              </h1>
              {category.sub_title && (
                <p className="text-xl text-gray-600 mb-4">
                  {category.sub_title}
                </p>
              )}

              {/* Product Info */}
              <div className="flex items-center gap-6 mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold">🎮</span>
                  </div>
                  <span>{category.parent_title || "Game"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-[#C02628]">
                  <Clock size={16} />
                  <span>Proses Instan</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-blue-600">
                  <Shield size={16} />
                  <span>Buka 24 Jam Setiap Hari</span>
                </div>
              </div>

              {/* Main Description */}
              <div className="prose prose-gray max-w-none">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  Top Up {category.title} Paling Murah, Aman, Cepat, dan
                  Terpercaya
                </h2>
                {category.description && (
                  <div
                    className="text-gray-700 leading-relaxed mb-6"
                    dangerouslySetInnerHTML={{ __html: category.description }}
                  />
                )}
                <p className="text-gray-700 leading-relaxed mb-6">
                  Nikmati kemudahan top up dengan berbagai metode pembayaran
                  yang aman dan terpercaya. Proses instan dan customer service
                  24/7 siap membantu Anda kapan saja.
                </p>
              </div>

              {/* Payment Methods */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Metode Pembayaran
                </h3>
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
                  {paymentMethods.map((method, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-lg p-3 text-center hover:shadow-md transition-shadow"
                    >
                      <div className="text-2xl mb-1">{method.logo}</div>
                      <div className="text-xs text-gray-600">{method.name}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* How to Top Up */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  Cara Melakukan Top Up {category.title} di PSAK-413.com
                </h3>
                <ol className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-3">
                    <span className="bg-[#C02628] text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                      1
                    </span>
                    <span>Masukkan Game ID atau Username Anda</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="bg-[#C02628] text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                      2
                    </span>
                    <span>Sistem akan otomatis mendeteksi akun Anda</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="bg-[#C02628] text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                      3
                    </span>
                    <span>Pilih paket {category.title} yang diinginkan</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="bg-[#C02628] text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                      4
                    </span>
                    <span>Masukkan kode diskon (jika ada)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="bg-[#C02628] text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                      5
                    </span>
                    <span>Pilih metode pembayaran</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="bg-[#C02628] text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                      6
                    </span>
                    <span>Masukkan nomor WhatsApp dan email</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="bg-[#C02628] text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                      7
                    </span>
                    <span>Klik &quot;Lanjut ke Pembayaran&quot;</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="bg-[#C02628] text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                      8
                    </span>
                    <span>
                      {category.title} akan dikirim ke akun setelah pembelian
                    </span>
                  </li>
                </ol>
              </div>

              {/* Game Description */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">
                    {category.title} (Deskripsi Game)
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {category.title} adalah game online yang dikembangkan oleh{" "}
                    {category.parent_title || "Developer"}. Game ini tersedia di
                    berbagai platform dan dapat dimainkan secara gratis. Nikmati
                    pengalaman bermain yang seru dengan grafik yang memukau dan
                    gameplay yang menantang.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">
                    {category.title} (Mata Uang Dalam Game)
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {category.title} adalah mata uang dalam game yang digunakan
                    untuk berbagai keperluan seperti bermain match,
                    menyelesaikan misi, membeli aksesori, dan item premium
                    lainnya. Dapatkan {category.title} dengan harga termurah di
                    PSAK-413.com.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar - Order Form */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <div className="bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden">
                {/* Form Header */}
                <div className="bg-gradient-to-r from-[#C02628] to-red-600 p-6 text-white">
                  <h2 className="text-xl font-bold mb-2">Pesan Sekarang</h2>
                  <p className="text-red-100 text-sm">Proses cepat & aman</p>
                </div>

                <div className="p-6 space-y-6">
                  {/* 1. Game Account Info */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">
                      1. Informasi Akun Game
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Game ID / Customer Number *
                        </label>
                        <input
                          type="text"
                          value={customerNo}
                          onChange={(e) => setCustomerNo(e.target.value)}
                          placeholder="Masukkan Game ID atau Customer Number"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C02628] focus:border-transparent"
                        />
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>Petunjuk</span>
                        <div className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors">
                          <span className="text-xs">?</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 2. Contact Info */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">
                      2. Informasi Kontak
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nama (Opsional)
                        </label>
                        <input
                          type="text"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          placeholder="Masukkan nama Anda"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C02628] focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email (Opsional)
                        </label>
                        <input
                          type="email"
                          value={customerEmail}
                          onChange={(e) => setCustomerEmail(e.target.value)}
                          placeholder="Masukkan email Anda"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C02628] focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nomor WhatsApp *
                        </label>
                        <input
                          type="tel"
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          placeholder="+62 812 3456 7890"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C02628] focus:border-transparent"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Pastikan nomor WhatsApp Anda sudah benar untuk
                          notifikasi.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 3. Select Package */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">
                      3. Pilih Paket
                    </h3>
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-600">
                        Top Up
                      </h4>
                      {products.length > 0 ? (
                        <div className="grid grid-cols-1 gap-2">
                          {products.map((product) => (
                            <motion.button
                              key={product.id}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => setSelectedPackage(product)}
                              className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                                selectedPackage?.id === product.id
                                  ? "border-[#C02628] bg-red-50"
                                  : "border-gray-200 hover:border-red-300 hover:bg-gray-50"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="font-medium text-gray-800">
                                    {product.name}
                                  </div>
                                  {product.description && (
                                    <div className="text-sm text-gray-600">
                                      {product.description}
                                    </div>
                                  )}
                                </div>
                                <div className="text-right">
                                  <div className="font-bold text-[#C02628]">
                                    {new Intl.NumberFormat("id-ID", {
                                      style: "currency",
                                      currency: "IDR",
                                      minimumFractionDigits: 0,
                                    }).format(parseFloat(product.sell_price))}
                                  </div>
                                  {product.buy_price !== product.sell_price && (
                                    <div className="text-sm text-gray-500">
                                      Harga:{" "}
                                      {new Intl.NumberFormat("id-ID", {
                                        style: "currency",
                                        currency: "IDR",
                                        minimumFractionDigits: 0,
                                      }).format(parseFloat(product.buy_price))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </motion.button>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 bg-gray-50 rounded-lg">
                          <AlertCircle
                            size={48}
                            className="mx-auto text-gray-400 mb-3"
                          />
                          <p className="text-gray-600 font-medium mb-1">
                            Paket tidak tersedia sekarang.
                          </p>
                          <p className="text-gray-500 text-sm">
                            Mohon di cek lagi nanti ya ka 😅🙏
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 4. Discount Code - Hidden for now */}
                  <div className="hidden">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">
                      4. Masukkan Kode Diskon
                    </h3>
                    <input
                      type="text"
                      value={discountCode}
                      onChange={(e) => setDiscountCode(e.target.value)}
                      placeholder="Kode Diskon (Kosongkan bila tidak ada)"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C02628] focus:border-transparent"
                    />
                  </div>

                  {/* 5. Payment Method - Hidden for now */}
                  <div className="hidden">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">
                      5. Pilih Cara Pembayaran
                    </h3>
                    <div className="grid grid-cols-3 gap-2">
                      {paymentMethods.slice(0, 9).map((method, index) => (
                        <motion.button
                          key={index}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setSelectedPayment(method.name)}
                          className={`p-3 rounded-lg border-2 transition-all duration-200 text-center ${
                            selectedPayment === method.name
                              ? "border-[#C02628] bg-red-50"
                              : "border-gray-200 hover:border-red-300"
                          }`}
                        >
                          <div className="text-2xl mb-1">{method.logo}</div>
                          <div className="text-xs text-gray-600">
                            {method.name}
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Success Message */}
                  {checkoutSuccess && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                      <div className="flex items-center gap-2 text-red-800">
                        <div className="w-5 h-5 bg-[#C02628] rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                        <span className="font-medium">Checkout berhasil!</span>
                      </div>
                      <p className="text-red-700 text-sm mt-1">
                        {isRedirecting
                          ? "Mengarahkan ke halaman pembayaran..."
                          : "Pesanan berhasil dibuat! Anda akan diarahkan ke halaman pembayaran dalam beberapa detik..."}
                      </p>
                      {isRedirecting && (
                        <div className="flex items-center gap-2 mt-2">
                          <Loader2
                            size={16}
                            className="animate-spin text-red-600"
                          />
                          <span className="text-red-600 text-sm">
                            Sedang mengalihkan...
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Error Message */}
                  {checkoutError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                      <div className="flex items-center gap-2 text-red-800">
                        <AlertCircle size={16} />
                        <span className="font-medium">Error</span>
                      </div>
                      <p className="text-red-700 text-sm mt-1">
                        {checkoutError}
                      </p>
                    </div>
                  )}

                  {/* Order Button */}
                  <motion.button
                    whileHover={{
                      scale: isFormValid && !isCheckoutLoading ? 1.02 : 1,
                    }}
                    whileTap={{
                      scale: isFormValid && !isCheckoutLoading ? 0.98 : 1,
                    }}
                    onClick={handleCheckout}
                    disabled={!isFormValid || isCheckoutLoading}
                    className={`w-full py-4 rounded-lg font-semibold text-lg transition-all duration-200 ${
                      isFormValid && !isCheckoutLoading
                        ? "bg-[#C02628] text-white hover:bg-red-600 shadow-lg"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    {isCheckoutLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 size={20} className="animate-spin" />
                        <span>Memproses...</span>
                      </div>
                    ) : isFormValid ? (
                      "Buat Pesanan"
                    ) : (
                      "Mohon Lengkapi Form"
                    )}
                  </motion.button>

                  <p className="text-xs text-gray-500 text-center">
                    Dengan menekan tombol diatas anda telah setuju dengan{" "}
                    <Link
                      href="/syarat-ketentuan"
                      className="text-[#C02628] hover:underline"
                    >
                      Syarat &amp; Ketentuan
                    </Link>{" "}
                    yang berlaku
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Testimonials Section */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
            Testimoni / Review
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial) => (
              <motion.div
                key={testimonial.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleYouTubeRedirect(testimonial.youtubeId)}
                className="bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 group"
              >
                <div className="relative">
                  <Image
                    src={testimonial.thumbnail}
                    alt={testimonial.title}
                    width={400}
                    height={225}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center group-hover:bg-opacity-50 transition-all duration-300">
                    <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Play size={24} className="text-white ml-1" />
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 group-hover:text-[#C02628] transition-colors">
                    {testimonial.title}
                  </h3>
                  <div className="flex items-center gap-1 mt-2">
                    <Youtube size={16} className="text-red-600" />
                    <span className="text-sm text-gray-600">
                      Tonton di YouTube
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
