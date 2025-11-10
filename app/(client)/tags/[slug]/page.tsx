"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  Eye,
  ArrowRight,
  TrendingUp,
  BookOpen,
  Trophy,
  Gift,
  Newspaper,
  Gamepad2,
} from "lucide-react";

interface ContentItem {
  id: number;
  title: string;
  image: string;
  date: string;
  readTime: string;
  views: number;
  trending?: boolean;
}

interface HeroContent {
  id: number;
  title: string;
  subtitle: string;
  image: string;
  date: string;
  category: string;
  trending?: boolean;
}

interface CategoryData {
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  heroContent: HeroContent[];
  content: ContentItem[];
}

const TagsPage = () => {
  const params = useParams();
  const [categoryData, setCategoryData] = useState<CategoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        setLoading(true);
        const slug = params?.slug as string;

        // Try to fetch from game categories first
        let response = await fetch(`/dummy/game-categories.json`);
        let data = await response.json();

        if (data[slug]) {
          setCategoryData(data[slug]);
        } else {
          // If not found in game categories, try content categories
          response = await fetch(`/dummy/content-categories.json`);
          data = await response.json();

          if (data[slug]) {
            setCategoryData(data[slug]);
          } else {
            // Handle 404 or show error
            console.error("Category not found");
          }
        }
      } catch (error) {
        console.error("Error fetching category data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (params?.slug) {
      fetchCategoryData();
    }
  }, [params?.slug]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatViews = (views: number) => {
    if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views.toString();
  };

  const getCategoryIcon = (categoryName: string) => {
    switch (categoryName.toLowerCase()) {
      case "tutorials & guides":
        return BookOpen;
      case "news & updates":
        return Newspaper;
      case "e-sports":
        return Trophy;
      case "promo & discount":
        return Gift;
      default:
        return Gamepad2;
    }
  };

  const getLatestNews = () => {
    // This would typically come from an API or be passed as props
    return [
      {
        id: 1,
        title: "Event MLBB x Sanrio Kembali Hadir September 2025 Ini",
        image:
          "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=150&h=100&fit=crop&crop=center",
        date: "2025-01-15",
      },
      {
        id: 2,
        title: "PUBG Mobile Versi 4.0 Hadir dengan Tema Spooky Soiree",
        image:
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=150&h=100&fit=crop&crop=center",
        date: "2025-01-14",
      },
      {
        id: 3,
        title: "Genshin Impact 4.5 Update: Character Baru Chiori",
        image:
          "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=150&h=100&fit=crop&crop=center",
        date: "2025-01-13",
      },
    ];
  };

  const getTrendingNews = () => {
    return [
      {
        id: 1,
        title: "Game MMORPG Legendaris Ragnarok Origin Resmi Dirilis",
        image:
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=150&h=100&fit=crop&crop=center",
        date: "2025-01-15",
      },
      {
        id: 2,
        title: "Skin Atomic Pop Miya Telah Hadir, Dapatkan Diskon Hingga 30%",
        image:
          "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=150&h=100&fit=crop&crop=center",
        date: "2025-01-14",
      },
      {
        id: 3,
        title: "Valorant Champions 2025: Paper Rex Juara Asia!",
        image:
          "https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=150&h=100&fit=crop&crop=center",
        date: "2025-01-13",
      },
    ];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 flex items-center justify-center">
        <div className="text-gray-700 text-xl">Loading...</div>
      </div>
    );
  }

  if (!categoryData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 flex items-center justify-center">
        <div className="text-gray-700 text-xl">Category not found</div>
      </div>
    );
  }

  const IconComponent = getCategoryIcon(categoryData.name);
  const totalPages = Math.ceil(categoryData.content.length / itemsPerPage);
  const paginatedContent = categoryData.content.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(192,38,40,0.05),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(192,38,40,0.03),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(192,38,40,0.03),transparent_50%)]" />

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(192,38,40,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(192,38,40,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />

      <div className="relative z-10">
        {/* Hero Section */}
        <div className="container mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            {/* Category Header */}
            <div className="flex items-center gap-4 mb-8">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className={`p-4 rounded-2xl bg-gradient-to-br ${categoryData.color} shadow-2xl border border-red-200`}
                style={{
                  boxShadow:
                    "0 20px 25px -5px rgba(192, 38, 40, 0.3), 0 10px 10px -5px rgba(192, 38, 40, 0.1)",
                }}
              >
                <IconComponent size={32} className="text-white" />
              </motion.div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
                  {categoryData.name}
                </h1>
                <p className="text-gray-600 text-lg">
                  {categoryData.description}
                </p>
              </div>
            </div>

            {/* Hero Content Grid - 1:2 Layout (Left: 2 columns, Right: 1 column) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
              {/* Main Hero Content (Left - 2 columns) */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="lg:col-span-2"
              >
                <Link
                  href={`/news/${categoryData.heroContent[0].title
                    .toLowerCase()
                    .replace(/\s+/g, "-")
                    .replace(/[^a-z0-9-]/g, "")}`}
                >
                  <div className="group relative h-[500px] rounded-3xl overflow-hidden shadow-2xl cursor-pointer bg-white border border-red-200">
                    <Image
                      src={categoryData.heroContent[0].image}
                      alt={categoryData.heroContent[0].title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700 transition-all"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                    {/* Game Logo */}
                    <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg">
                      <span className="text-lg font-bold text-gray-800">
                        PUBG MOBILE
                      </span>
                    </div>

                    {/* Trending Badge */}
                    {categoryData.heroContent[0].trending && (
                      <div className="absolute top-6 right-6 bg-gradient-to-r from-red-500 via-pink-500 to-red-600 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 shadow-lg">
                        <TrendingUp size={16} />
                        <span>TRENDING</span>
                      </div>
                    )}

                    {/* Weapon Overlay (like in the reference image) */}
                    <div className="absolute top-20 right-6 bg-black/80 backdrop-blur-sm rounded-lg p-4 border border-[#C02628]/30">
                      <div className="text-red-500 text-sm font-semibold mb-2">
                        ASM ABAKAN
                      </div>
                      <div className="text-white text-xs space-y-1">
                        <div>5.56mm 30/205</div>
                        <div className="text-gray-300">Red Dot</div>
                        <div className="text-gray-300">Cantilevered Sight</div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="absolute bottom-0 left-0 right-0 p-8">
                      <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
                        <h2 className="text-3xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-[#C02628] transition-colors duration-300">
                          {categoryData.heroContent[0].title}
                        </h2>
                        <p className="text-gray-600 mb-4 text-lg line-clamp-2">
                          {categoryData.heroContent[0].subtitle}
                        </p>
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                          <Calendar size={16} />
                          <span className="font-medium">
                            {formatDate(categoryData.heroContent[0].date)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>

              {/* Secondary Hero Content (Right - 1 column) */}
              <div className="lg:col-span-1 space-y-6">
                {categoryData.heroContent.slice(1, 3).map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                  >
                    <Link
                      href={`/news/${item.title
                        .toLowerCase()
                        .replace(/\s+/g, "-")
                        .replace(/[^a-z0-9-]/g, "")}`}
                    >
                      <div className="group relative h-[240px] rounded-2xl overflow-hidden shadow-xl cursor-pointer bg-white border border-red-200">
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />

                        {/* Game Logo */}
                        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-lg shadow-lg">
                          <span className="text-sm font-bold text-gray-800">
                            {index === 0 ? "FREE FIRE" : "PUBG MOBILE"}
                          </span>
                        </div>

                        {/* Trending Badge */}
                        {item.trending && (
                          <div className="absolute top-4 right-4 bg-gradient-to-r from-red-500 via-pink-500 to-red-600 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                            <TrendingUp size={10} />
                            <span>TRENDING</span>
                          </div>
                        )}

                        {/* Content */}
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <div className="bg-white/95 backdrop-blur-sm rounded-lg p-4 shadow-lg">
                            <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-[#C02628] transition-colors duration-300">
                              {item.title}
                            </h3>
                            <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                              {item.subtitle}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <Calendar size={12} />
                              <span className="font-medium">
                                {formatDate(item.date)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Main Content Area - 1:3 Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Main Content (Left - 3 columns) */}
              <div className="lg:col-span-3">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="mb-8"
                >
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">
                    {categoryData.name}
                  </h2>

                  {/* Content Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {paginatedContent.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                        whileHover={{ y: -8, scale: 1.03 }}
                        className="group relative bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden border border-red-200 backdrop-blur-sm cursor-pointer"
                      >
                        <Link
                          href={`/news/${item.title
                            .toLowerCase()
                            .replace(/\s+/g, "-")
                            .replace(/[^a-z0-9-]/g, "")}`}
                        >
                          {/* Image Container */}
                          <div className="relative overflow-hidden">
                            <Image
                              src={item.image}
                              alt={item.title}
                              width={400}
                              height={200}
                              className="w-full h-40 object-cover group-hover:scale-110 transition-transform duration-700"
                            />

                            {/* Image Overlay Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            {/* Trending Badge */}
                            {item.trending && (
                              <div className="absolute top-2 left-2 bg-gradient-to-r from-red-500 via-pink-500 to-red-600 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                <TrendingUp size={10} />
                                <span>TRENDING</span>
                              </div>
                            )}
                          </div>

                          {/* Content */}
                          <div className="p-4">
                            {/* Title */}
                            <h3 className="font-bold text-gray-900 text-base leading-tight mb-3 group-hover:text-[#C02628] transition-colors duration-300 line-clamp-2">
                              {item.title}
                            </h3>

                            {/* Meta Information */}
                            <div className="flex flex-col gap-2 text-xs text-gray-500 mb-4">
                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1 bg-red-100 px-2 py-1 rounded-full">
                                  <Calendar
                                    size={12}
                                    className="text-[#C02628]"
                                  />
                                  <span className="font-medium">
                                    {formatDate(item.date)}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1 bg-blue-100 px-2 py-1 rounded-full">
                                  <Clock size={12} className="text-blue-600" />
                                  <span className="font-medium">
                                    {item.readTime}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-1 bg-purple-100 px-2 py-1 rounded-full w-fit">
                                <Eye size={12} className="text-purple-600" />
                                <span className="font-medium">
                                  {formatViews(item.views)}
                                </span>
                              </div>
                            </div>

                            {/* Read More Button */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center text-[#C02628] font-semibold text-xs group-hover:text-red-600 transition-colors duration-300">
                                <span>Baca Selengkapnya</span>
                                <ArrowRight
                                  size={14}
                                  className="ml-1 group-hover:translate-x-1 transition-transform duration-300"
                                />
                              </div>
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>

                  {/* Pagination */}
                  <div className="flex justify-center mt-12">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(prev - 1, 1))
                        }
                        disabled={currentPage === 1}
                        className="px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-red-50 border border-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300"
                      >
                        Previous
                      </button>

                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (page) => (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`px-4 py-2 rounded-lg transition-colors duration-300 ${
                              page === currentPage
                                ? "bg-[#C02628] text-white"
                                : "bg-white text-gray-700 hover:bg-red-50 border border-red-200"
                            }`}
                          >
                            {page}
                          </button>
                        )
                      )}

                      <button
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(prev + 1, totalPages)
                          )
                        }
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-red-50 border border-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Sidebar (Right - 1 column) */}
              <div className="lg:col-span-1 space-y-8">
                {/* Latest News */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  className="bg-white rounded-2xl p-6 border border-red-200 shadow-lg"
                >
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Newspaper size={20} className="text-blue-600" />
                    LATEST NEWS
                  </h3>
                  <div className="space-y-4">
                    {getLatestNews().map((item) => (
                      <Link
                        key={item.id}
                        href={`/news/${item.title
                          .toLowerCase()
                          .replace(/\s+/g, "-")
                          .replace(/[^a-z0-9-]/g, "")}`}
                        className="group flex gap-3 hover:bg-red-50 p-2 rounded-lg transition-colors duration-300"
                      >
                        <div className="relative w-16 h-12 rounded-lg overflow-hidden flex-shrink-0">
                          <Image
                            src={item.image}
                            alt={item.title}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-gray-900 group-hover:text-[#C02628] transition-colors duration-300 line-clamp-2 mb-1">
                            {item.title}
                          </h4>
                          <p className="text-xs text-gray-500">
                            {formatDate(item.date)}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </motion.div>

                {/* Trending */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  className="bg-white rounded-2xl p-6 border border-red-200 shadow-lg"
                >
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <TrendingUp size={20} className="text-orange-500" />
                    TRENDING
                  </h3>
                  <div className="space-y-4">
                    {getTrendingNews().map((item) => (
                      <Link
                        key={item.id}
                        href={`/news/${item.title
                          .toLowerCase()
                          .replace(/\s+/g, "-")
                          .replace(/[^a-z0-9-]/g, "")}`}
                        className="group flex gap-3 hover:bg-red-50 p-2 rounded-lg transition-colors duration-300"
                      >
                        <div className="relative w-16 h-12 rounded-lg overflow-hidden flex-shrink-0">
                          <Image
                            src={item.image}
                            alt={item.title}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-gray-900 group-hover:text-[#C02628] transition-colors duration-300 line-clamp-2 mb-1">
                            {item.title}
                          </h4>
                          <p className="text-xs text-gray-500">
                            {formatDate(item.date)}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default TagsPage;