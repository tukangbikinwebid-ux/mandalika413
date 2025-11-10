"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import {
  Calendar,
  Clock,
  Eye,
  ArrowRight,
  TrendingUp,
  BookOpen,
  Trophy,
  Gift,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface NewsItem {
  id: number;
  title: string;
  image: string;
  date: string;
  category: string;
  readTime: string;
  views: number;
  trending?: boolean;
}

const NewsPage = () => {
  const newsData: NewsItem[] = [
    {
      id: 1,
      title: "Cara Dapatkan Skin Khufra Cursed Scroll Mobile Legends Gratis",
      image:
        "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=250&fit=crop&crop=center",
      date: "2025-01-15",
      category: "Mobile Legends",
      readTime: "5 min",
      views: 12500,
      trending: true,
    },
    {
      id: 2,
      title:
        "Moonton Rilis Skin Juara M6 ONIC PH untuk Joy dan Skin FMVP Beatrix",
      image:
        "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400&h=250&fit=crop&crop=center",
      date: "2025-01-14",
      category: "Mobile Legends",
      readTime: "3 min",
      views: 8900,
    },
    {
      id: 3,
      title: "Cara Mendapatkan Galactic Bunny Bundle Free Fire",
      image:
        "https://images.unsplash.com/photo-1556438064-2d7646166914?w=400&h=250&fit=crop&crop=center",
      date: "2025-01-13",
      category: "Free Fire",
      readTime: "4 min",
      views: 15600,
      trending: true,
    },
    {
      id: 4,
      title: "Event MLBB x Sanrio Kembali Hadir September 2025 Ini",
      image:
        "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=250&fit=crop&crop=center",
      date: "2025-01-12",
      category: "Mobile Legends",
      readTime: "6 min",
      views: 11200,
    },
    {
      id: 5,
      title: "PUBG Mobile Versi 4.0 Hadir dengan Tema Spooky Soiree",
      image:
        "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=250&fit=crop&crop=center",
      date: "2025-01-11",
      category: "PUBG Mobile",
      readTime: "7 min",
      views: 18900,
      trending: true,
    },
    {
      id: 6,
      title: "PUBG Mobile Umumkan Game Mode Baru Asymmetric PVP UNFAIL",
      image:
        "https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=400&h=250&fit=crop&crop=center",
      date: "2025-01-10",
      category: "PUBG Mobile",
      readTime: "5 min",
      views: 13400,
    },
  ];

  const tutorialsData: NewsItem[] = [
    {
      id: 7,
      title: "ASM Abakan: Senjata Baru PUBG Mobile Siap Mendominasi Battle",
      image:
        "https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=400&h=250&fit=crop&crop=center",
      date: "2025-01-09",
      category: "PUBG Mobile",
      readTime: "8 min",
      views: 16700,
    },
    {
      id: 8,
      title: "Kembali Dibuka, Inilah Cara Daftar Advance Server Free Fire",
      image:
        "https://images.unsplash.com/photo-1556438064-2d7646166914?w=400&h=250&fit=crop&crop=center",
      date: "2025-01-08",
      category: "Free Fire",
      readTime: "4 min",
      views: 9800,
    },
    {
      id: 9,
      title: "3 Senjata Paling Sering Digunakan Pro Player PUBG Mobile",
      image:
        "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=250&fit=crop&crop=center",
      date: "2025-01-07",
      category: "PUBG Mobile",
      readTime: "6 min",
      views: 14500,
    },
    {
      id: 10,
      title: "MLBB Lite Link Download Game MLBB Dengan Kapasitas Ringan",
      image:
        "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=250&fit=crop&crop=center",
      date: "2025-01-06",
      category: "Mobile Legends",
      readTime: "3 min",
      views: 12300,
    },
    {
      id: 11,
      title: "Cara Mendapatkan Diamond FF Gratis di Tahun 2025",
      image:
        "https://images.unsplash.com/photo-1556438064-2d7646166914?w=400&h=250&fit=crop&crop=center",
      date: "2025-01-05",
      category: "Free Fire",
      readTime: "5 min",
      views: 20100,
      trending: true,
    },
    {
      id: 12,
      title: "Pengertian dan Cara Mendapatkan Magic Cube FF",
      image:
        "https://images.unsplash.com/photo-1556438064-2d7646166914?w=400&h=250&fit=crop&crop=center",
      date: "2025-01-04",
      category: "Free Fire",
      readTime: "4 min",
      views: 8700,
    },
  ];

  const esportsData: NewsItem[] = [
    {
      id: 13,
      title: "Team Falcons Juarai DOTA 2 The International 2025",
      image:
        "https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=400&h=250&fit=crop&crop=center",
      date: "2025-01-15",
      category: "DOTA 2",
      readTime: "6 min",
      views: 25600,
      trending: true,
    },
    {
      id: 14,
      title: "PMSL SEA Fall 2025, Tim Peserta, Jadwal, dan Format Turnamen",
      image:
        "https://images.unsplash.com/photo-1556438064-2d7646166914?w=400&h=250&fit=crop&crop=center",
      date: "2025-01-14",
      category: "PUBG Mobile",
      readTime: "8 min",
      views: 18900,
    },
    {
      id: 15,
      title: "Tim Peserta, Jadwal, dan Format Turnamen FFWS SEA Fall 2025",
      image:
        "https://images.unsplash.com/photo-1556438064-2d7646166914?w=400&h=250&fit=crop&crop=center",
      date: "2025-01-13",
      category: "Free Fire",
      readTime: "7 min",
      views: 14200,
    },
    {
      id: 16,
      title:
        "Inilah Tim Peserta, Jadwal, dan Total Hadiah DOTA 2 The International 2025",
      image:
        "https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=400&h=250&fit=crop&crop=center",
      date: "2025-01-12",
      category: "DOTA 2",
      readTime: "9 min",
      views: 31200,
      trending: true,
    },
    {
      id: 17,
      title: "Kalahkan RRQ, Paper Rex Juarai VCT Pacific Stage 2",
      image:
        "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=250&fit=crop&crop=center",
      date: "2025-01-11",
      category: "Valorant",
      readTime: "5 min",
      views: 17800,
    },
    {
      id: 18,
      title: "EVOS Divine Sabet Gelar Juara Free Fire Esports World Cup 2025",
      image:
        "https://images.unsplash.com/photo-1556438064-2d7646166914?w=400&h=250&fit=crop&crop=center",
      date: "2025-01-10",
      category: "Free Fire",
      readTime: "6 min",
      views: 22300,
    },
  ];

  const promoData: NewsItem[] = [
    {
      id: 19,
      title:
        "PSAK-413.com Gelar Event Spesial HUT RI ke-80: Belanja Rp170.000 Dapat Voucher Rp17.000!",
      image:
        "https://images.unsplash.com/photo-1607082349566-187342175e2f?w=400&h=250&fit=crop&crop=center",
      date: "2025-01-15",
      category: "Promo",
      readTime: "3 min",
      views: 34500,
      trending: true,
    },
    {
      id: 20,
      title:
        "Nikmati Diskon Rp10.000 di PSAK-413 dengan Pembayaran QRIS Neobank",
      image:
        "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=250&fit=crop&crop=center",
      date: "2025-01-14",
      category: "Promo",
      readTime: "2 min",
      views: 18900,
    },
    {
      id: 21,
      title:
        "Liburan Seru Bareng PSAK-413! Ikuti Giveaway dan Menangkan Voucher 30K!",
      image:
        "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=400&h=250&fit=crop&crop=center",
      date: "2025-01-13",
      category: "Giveaway",
      readTime: "4 min",
      views: 26700,
      trending: true,
    },
    {
      id: 22,
      title: "Daftar Kode Redeem Genshin Impact Mei 2025",
      image:
        "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=250&fit=crop&crop=center",
      date: "2025-01-12",
      category: "Genshin Impact",
      readTime: "3 min",
      views: 15600,
    },
    {
      id: 23,
      title: "Ikuti Giveaway PSAK-413 Spesial Hari Konsumen Nasional 2025",
      image:
        "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=400&h=250&fit=crop&crop=center",
      date: "2025-01-11",
      category: "Giveaway",
      readTime: "2 min",
      views: 19800,
    },
    {
      id: 24,
      title: "Ikuti Event PSAK-413 Bagi-Bagi THR Hingga 900.000",
      image:
        "https://images.unsplash.com/photo-1607082349566-187342175e2f?w=400&h=250&fit=crop&crop=center",
      date: "2025-01-10",
      category: "Event",
      readTime: "3 min",
      views: 28900,
      trending: true,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(192,38,40,0.1),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.1),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(168,85,247,0.1),transparent_50%)]" />

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />

      <CarouselSection />

      <ContentSections
        newsData={newsData}
        tutorialsData={tutorialsData}
        esportsData={esportsData}
        promoData={promoData}
      />
    </div>
  );
};

// Separate Carousel Component
const CarouselSection = () => {
  const [slideCount, setSlideCount] = useState(0);

  const carouselData = [
    {
      id: 1,
      title: "Mobile Legends M6 World Championship",
      subtitle: "ONIC PH Juara Dunia!",
      image:
        "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1200&h=600&fit=crop&crop=center",
      category: "E-Sports",
      trending: true,
    },
    {
      id: 2,
      title: "PUBG Mobile Update Terbaru",
      subtitle: "Mode Baru: Asymmetric PVP",
      image:
        "https://images.unsplash.com/photo-1556438064-2d7646166914?w=1200&h=600&fit=crop&crop=center",
      category: "Game Update",
      trending: true,
    },
    {
      id: 3,
      title: "Free Fire Advance Server",
      subtitle: "Daftar Sekarang!",
      image:
        "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=600&fit=crop&crop=center",
      category: "Beta Test",
      trending: false,
    },
    {
      id: 4,
      title: "Genshin Impact 4.5 Update",
      subtitle: "Character Baru: Chiori",
      image:
        "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&h=600&fit=crop&crop=center",
      category: "Game Update",
      trending: true,
    },
    {
      id: 5,
      title: "Valorant Champions 2025",
      subtitle: "Paper Rex Juara Asia!",
      image:
        "https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=1200&h=600&fit=crop&crop=center",
      category: "E-Sports",
      trending: true,
    },
  ];

  const activeSlideIndex = slideCount % carouselData.length;

  const sliderVariants = {
    incoming: {
      opacity: 0,
    },
    active: {
      opacity: 1,
    },
    exit: {
      opacity: 0,
    },
  };

  const sliderTransition = {
    duration: 0.4,
    ease: [0.4, 0, 0.2, 1] as const,
  };

  const swipeToSlide = useCallback(
    (swipeDirection: number) => {
      setSlideCount(slideCount + swipeDirection);
    },
    [slideCount]
  );

  const nextSlide = useCallback(() => {
    swipeToSlide(1);
  }, [swipeToSlide]);

  const prevSlide = () => {
    swipeToSlide(-1);
  };

  const skipToSlide = (slideId: number) => {
    setSlideCount(slideId);
  };

  // Auto-slide functionality
  useEffect(() => {
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [nextSlide]);

  return (
    <div className="relative h-[600px] overflow-hidden">
      <AnimatePresence initial={false}>
        <motion.div
          key={slideCount}
          variants={sliderVariants}
          initial="incoming"
          animate="active"
          exit="exit"
          transition={sliderTransition}
          className="absolute inset-0"
        >
          <div className="relative h-full">
            <Image
              src={carouselData[activeSlideIndex].image}
              alt={carouselData[activeSlideIndex].title}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent"></div>

            {/* Content Overlay */}
            <div className="absolute inset-0 flex items-center">
              <div className="container mx-auto px-4">
                <div className="max-w-2xl">
                  <div>
                    {carouselData[activeSlideIndex].trending && (
                      <div className="inline-flex items-center gap-2 bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-bold mb-4">
                        <TrendingUp size={16} />
                        <span>TRENDING</span>
                      </div>
                    )}

                    <div className="bg-black/30 backdrop-blur-sm px-4 py-2 rounded-lg text-[#C02628] text-sm font-semibold mb-4 inline-block">
                      {carouselData[activeSlideIndex].category}
                    </div>

                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">
                      {carouselData[activeSlideIndex].title}
                    </h1>

                    <p className="text-xl md:text-2xl text-gray-200 mb-8 leading-relaxed">
                      {carouselData[activeSlideIndex].subtitle}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4">
                      <button className="bg-[#C02628] hover:bg-[#B02122] text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl">
                        Baca Selengkapnya
                      </button>
                      <button className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 border border-white/30">
                        Lihat Semua Berita
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      <motion.button
        whileHover={{ scale: 1.1, x: -5 }}
        whileTap={{ scale: 0.9 }}
        onClick={prevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-3 rounded-full transition-all duration-300 z-10"
      >
        <ChevronLeft size={24} />
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.1, x: 5 }}
        whileTap={{ scale: 0.9 }}
        onClick={nextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-3 rounded-full transition-all duration-300 z-10"
      >
        <ChevronRight size={24} />
      </motion.button>

      {/* Dots Indicator */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
        {carouselData.map((_, index) => (
          <motion.button
            key={index}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.8 }}
            onClick={() => skipToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === activeSlideIndex
                ? "bg-white scale-125"
                : "bg-white/50 hover:bg-white/70"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

// Separate Content Sections Component
const ContentSections = ({
  newsData,
  tutorialsData,
  esportsData,
  promoData,
}: {
  newsData: NewsItem[];
  tutorialsData: NewsItem[];
  esportsData: NewsItem[];
  promoData: NewsItem[];
}) => {
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

  const NewsCard = ({
    item,
    index,
    sectionType,
  }: {
    item: NewsItem;
    index: number;
    sectionType: string;
  }) => {
    const slug = item.title
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
    // Define color schemes for different sections
    const getSectionColors = (type: string) => {
      switch (type) {
        case "news":
          return {
            cardBg: "bg-gradient-to-br from-blue-50 via-white to-indigo-50",
            borderColor: "border-blue-200/50",
            accentColor: "from-blue-500 to-indigo-600",
            hoverAccent: "hover:from-blue-600 hover:to-indigo-700",
            textAccent: "text-blue-600",
            badgeBg: "bg-gradient-to-r from-blue-500 to-indigo-500",
            shadowColor: "shadow-blue-100/50",
            hoverShadow: "hover:shadow-blue-200/50",
          };
        case "tutorials":
          return {
            cardBg: "bg-gradient-to-br from-purple-50 via-white to-violet-50",
            borderColor: "border-purple-200/50",
            accentColor: "from-purple-500 to-violet-600",
            hoverAccent: "hover:from-purple-600 hover:to-violet-700",
            textAccent: "text-purple-600",
            badgeBg: "bg-gradient-to-r from-purple-500 to-violet-500",
            shadowColor: "shadow-purple-100/50",
            hoverShadow: "hover:shadow-purple-200/50",
          };
        case "esports":
          return {
            cardBg: "bg-gradient-to-br from-orange-50 via-white to-amber-50",
            borderColor: "border-orange-200/50",
            accentColor: "from-orange-500 to-amber-600",
            hoverAccent: "hover:from-orange-600 hover:to-amber-700",
            textAccent: "text-orange-600",
            badgeBg: "bg-gradient-to-r from-orange-500 to-amber-500",
            shadowColor: "shadow-orange-100/50",
            hoverShadow: "hover:shadow-orange-200/50",
          };
        case "promo":
          return {
            cardBg: "bg-gradient-to-br from-red-50 via-white to-rose-50",
            borderColor: "border-red-200/50",
            accentColor: "from-[#C02628] to-rose-600",
            hoverAccent: "hover:from-rose-600 hover:to-rose-700",
            textAccent: "text-[#C02628]",
            badgeBg: "bg-gradient-to-r from-[#C02628] to-rose-500",
            shadowColor: "shadow-red-100/50",
            hoverShadow: "hover:shadow-red-200/50",
          };
        default:
          return {
            cardBg: "bg-gradient-to-br from-gray-50 via-white to-slate-50",
            borderColor: "border-gray-200/50",
            accentColor: "from-gray-500 to-slate-600",
            hoverAccent: "hover:from-gray-600 hover:to-slate-700",
            textAccent: "text-gray-600",
            badgeBg: "bg-gradient-to-r from-gray-500 to-slate-500",
            shadowColor: "shadow-gray-100/50",
            hoverShadow: "hover:shadow-gray-200/50",
          };
      }
    };

    const colors = getSectionColors(sectionType);

    return (
      <Link href={`/news/${slug}`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1, duration: 0.5 }}
          whileHover={{ y: -8, scale: 1.03 }}
          className={`group relative ${colors.cardBg} rounded-3xl shadow-xl ${colors.shadowColor} ${colors.hoverShadow} hover:shadow-2xl transition-all duration-500 overflow-hidden border ${colors.borderColor} backdrop-blur-sm cursor-pointer`}
          style={{
            boxShadow:
              "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.6)",
          }}
        >
          {/* Gradient Overlay */}
          <div
            className={`absolute inset-0 bg-gradient-to-br ${colors.accentColor} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
          />

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
              <motion.div
                initial={{ scale: 0, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  delay: index * 0.1 + 0.3,
                  type: "spring",
                  stiffness: 200,
                }}
                className="absolute top-2 left-2 bg-gradient-to-r from-red-500 via-pink-500 to-red-600 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg"
                style={{
                  background:
                    "linear-gradient(135deg, #ef4444 0%, #ec4899 50%, #dc2626 100%)",
                  boxShadow: "0 4px 8px rgba(239, 68, 68, 0.4)",
                }}
              >
                <TrendingUp size={10} className="animate-pulse" />
                <span>TRENDING</span>
              </motion.div>
            )}

            {/* Category Badge */}
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 + 0.2 }}
              className={`absolute top-2 right-2 ${colors.badgeBg} text-white px-2 py-1 rounded-lg text-xs font-semibold border border-white/20 shadow-lg`}
            >
              {item.category}
            </motion.div>

            {/* Hover Overlay */}
            <div
              className={`absolute inset-0 bg-gradient-to-t ${colors.accentColor} opacity-0 group-hover:opacity-20 transition-opacity duration-500`}
            />
          </div>

          {/* Content */}
          <div className="relative p-4">
            {/* Title */}
            <motion.h3
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 + 0.4 }}
              className={`font-bold text-gray-900 text-base leading-tight mb-3 group-hover:${colors.textAccent} transition-colors duration-300 line-clamp-2`}
            >
              {item.title}
            </motion.h3>

            {/* Meta Information */}
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 + 0.5 }}
              className="flex flex-col gap-2 text-xs text-gray-600 mb-4"
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full">
                  <Calendar size={12} className="text-[#C02628]" />
                  <span className="font-medium">{formatDate(item.date)}</span>
                </div>
                <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full">
                  <Clock size={12} className="text-blue-600" />
                  <span className="font-medium">{item.readTime}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full w-fit">
                <Eye size={12} className="text-purple-600" />
                <span className="font-medium">{formatViews(item.views)}</span>
              </div>
            </motion.div>

            {/* Read More Button */}
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 + 0.6 }}
              className="flex items-center justify-between"
            >
              <div
                className={`flex items-center ${colors.textAccent} font-semibold text-xs group-hover:${colors.hoverAccent} transition-colors duration-300`}
              >
                <span>Baca Selengkapnya</span>
                <ArrowRight
                  size={14}
                  className="ml-1 group-hover:translate-x-1 transition-transform duration-300"
                />
              </div>

              {/* Decorative Element */}
              <div
                className={`w-6 h-6 bg-gradient-to-br ${colors.accentColor} rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center`}
              >
                <ArrowRight size={10} className="text-white" />
              </div>
            </motion.div>
          </div>

          {/* Bottom Accent Line */}
          <div
            className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${colors.accentColor} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
          />
        </motion.div>
      </Link>
    );
  };

  const SectionHeader = ({
    title,
    icon: Icon,
    color,
  }: {
    title: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    color: string;
  }) => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6 }}
      className="relative mb-12"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-black to-gray-900 rounded-2xl opacity-90" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#C02628]/10 via-transparent to-blue-500/10 rounded-2xl" />

      {/* Content */}
      <div className="relative flex items-center gap-6 p-6">
        {/* Accent Line */}
        <div
          className={`w-2 h-16 bg-gradient-to-b ${color} rounded-full shadow-lg`}
        ></div>

        {/* Icon Container */}
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          className={`p-4 rounded-2xl bg-gradient-to-br ${color} shadow-2xl border border-white/20`}
          style={{
            boxShadow:
              "0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.1)",
          }}
        >
          <Icon size={28} className="text-white" />
        </motion.div>

        {/* Title */}
        <div className="flex-1">
          <h2 className="text-4xl font-bold text-white mb-2 tracking-wide">
            {title}
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-[#C02628] to-blue-400 rounded-full" />
        </div>

        {/* Decorative Elements */}
        <div className="flex gap-2">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0 }}
            className="w-3 h-3 bg-[#C02628] rounded-full opacity-60"
          />
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
            className="w-3 h-3 bg-blue-400 rounded-full opacity-60"
          />
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity, delay: 1 }}
            className="w-3 h-3 bg-purple-400 rounded-full opacity-60"
          />
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="container mx-auto px-4 py-16">
      {/* News & Updates Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="mb-20"
      >
        <SectionHeader
          title="NEWS & UPDATES"
          icon={TrendingUp}
          color="from-blue-500 to-blue-600"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {newsData.map((item, index) => (
            <NewsCard
              key={item.id}
              item={item}
              index={index}
              sectionType="news"
            />
          ))}
        </div>
      </motion.section>

      {/* Tutorials & Guides Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="mb-20"
      >
        <SectionHeader
          title="TUTORIALS & GUIDES"
          icon={BookOpen}
          color="from-purple-500 to-purple-600"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {tutorialsData.map((item, index) => (
            <NewsCard
              key={item.id}
              item={item}
              index={index}
              sectionType="tutorials"
            />
          ))}
        </div>
      </motion.section>

      {/* E-Sports Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="mb-20"
      >
        <SectionHeader
          title="E-SPORTS"
          icon={Trophy}
          color="from-yellow-500 to-orange-500"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {esportsData.map((item, index) => (
            <NewsCard
              key={item.id}
              item={item}
              index={index}
              sectionType="esports"
            />
          ))}
        </div>
      </motion.section>

      {/* Promo & Discount Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.8 }}
        className="mb-20"
      >
        <SectionHeader
          title="PROMO & DISCOUNT"
          icon={Gift}
          color="from-red-500 to-pink-500"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {promoData.map((item, index) => (
            <NewsCard
              key={item.id}
              item={item}
              index={index}
              sectionType="promo"
            />
          ))}
        </div>
      </motion.section>
    </div>
  );
};

export default NewsPage;
