"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { use } from "react";
import {
  Calendar,
  Clock,
  Eye,
  TrendingUp,
  Share2,
  Home,
  ChevronRight,
} from "lucide-react";

interface NewsDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

interface NewsItem {
  id: number;
  title: string;
  slug: string;
  image: string;
  date: string;
  readTime: string;
  views: number;
  category: string;
  trending?: boolean;
  content?: string;
  tags?: string[];
}

const NewsDetailPage = ({ params }: NewsDetailPageProps) => {
  const { slug } = use(params);
  // Sample data - in real app, this would come from API based on slug
  const articleData = {
    id: 1,
    title:
      "Moonton Rilis Skin Juara M6 ONIC PH untuk Joy dan Skin FMVP Beatrix",
    slug: slug,
    image:
      "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&h=400&fit=crop&crop=center",
    date: "2025-01-15",
    readTime: "5 min",
    views: 12500,
    category: "Mobile Legends",
    trending: true,
    content: `
      Mobile Legends: Bang Bang (MLBB) secara resmi merilis Skin Juara M6 untuk Joy dan Skin FMVP untuk Beatrix dengan nama "Sky Force Maverick". Ini adalah kolaborasi khusus dengan ONIC Philippines sebagai penghormatan atas dominasi mereka di M6 World Championship Malaysia bulan Desember lalu. Skin ini akan tersedia mulai 20 September 2025.

      ## Joy M6 Champion Skin: Wujudkan Semangat ONIC PH

      Skin khusus Joy ini menghadirkan warna kuning ikonik ONIC yang dikombinasikan dengan armor emas, aksen merah, dan hitam. Desainnya memiliki nuansa sci-fi futuristik yang memukau. MOONTON Games dan ONIC PH terlibat langsung dalam proses desain skin ini.

      Skin dapat diakses melalui "Joy 'ONIC PH' Pass" yang tersedia dalam dua pilihan:
      - **Starter Pass (499 Diamonds)**: berisi Champion Skin, avatar border eksklusif, battle emote, dan coins.
      - **Honor Pass (799 Diamonds)**: dilengkapi efek tambahan serta Crystals of Aurora.

      ## Beatrix FMVP Skin: Sky Force Maverick dengan Sentuhan Personal Kelra

      Sebagai Finals MVP M6, Duane Grant "Kelra" Pillas memilih Beatrix untuk Skin FMVP. Performa luar biasa dengan hero tersebut di grand final menjadi kunci kemenangan ONIC meraih trofi.

      Skin Sky Force Maverick memiliki desain futuristik dengan kombinasi kuning-hitam khas ONIC dan senjata modern. Kelra menambahkan sentuhan personal berupa charm landak dan nama anaknya "Slake" pada outfit. Skin ini diperkirakan dijual seharga 899 Diamonds dengan diskon 30% di minggu pertama rilis.

      Kehadiran Skin Juara M6 Joy dan Skin FMVP Beatrix: Sky Force Maverick bukan sekadar kosmetik baru, melainkan simbol perjalanan luar biasa ONIC PH di kancah global. Dengan desain yang bermakna dan sentuhan personal, skin ini diharapkan dapat menginspirasi komunitas MLBB dan mengingatkan semangat juang tim.
    `,
    tags: [
      "Mobile Legends",
      "News & Updates",
      "Skin",
      "ONIC PH",
      "M6 Championship",
    ],
  };

  const latestNews = [
    {
      id: 2,
      title: "Event MLBB x Sanrio Kembali Hadir September 2025 Ini",
      slug: "event-mlbb-x-sanrio-kembali-hadir-september-2025-ini",
      image:
        "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=300&h=200&fit=crop&crop=center",
      date: "2025-01-14",
      readTime: "3 min",
      views: 8500,
      category: "Mobile Legends",
    },
    {
      id: 3,
      title: "PUBG Mobile Versi 4.0 Hadir dengan Tema Spooky Soiree",
      slug: "pubg-mobile-versi-4-0-hadir-dengan-tema-spooky-soiree",
      image:
        "https://images.unsplash.com/photo-1556438064-2d7646166914?w=300&h=200&fit=crop&crop=center",
      date: "2025-01-13",
      readTime: "4 min",
      views: 9200,
      category: "PUBG Mobile",
    },
    {
      id: 4,
      title: "PUBG Mobile Umumkan Game Mode Baru Asymmetric PVP UNFAIL",
      slug: "pubg-mobile-umumkan-game-mode-baru-asymmetric-pvp-unfail",
      image:
        "https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=300&h=200&fit=crop&crop=center",
      date: "2025-01-12",
      readTime: "5 min",
      views: 7800,
      category: "PUBG Mobile",
    },
  ];

  const trendingNews = [
    {
      id: 5,
      title: "Game MMORPG Legendaris Ragnarok Origin Resmi Dirilis",
      slug: "game-mmorpg-legendaris-ragnarok-origin-resmi-dirilis",
      image:
        "https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=300&h=200&fit=crop&crop=center",
      date: "2025-01-11",
      readTime: "6 min",
      views: 10500,
      category: "Ragnarok",
    },
    {
      id: 6,
      title: "Skin Atomic Pop Miya Telah Hadir, Dapatkan Diskon Hingga 30%",
      slug: "skin-atomic-pop-miya-telah-hadir-dapatkan-diskon-hingga-30",
      image:
        "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop&crop=center",
      date: "2025-01-10",
      readTime: "4 min",
      views: 12800,
      category: "Mobile Legends",
    },
    {
      id: 7,
      title: "Inilah 18 Tim Peserta DOTA 2 ESL One Berlin Major 2023",
      slug: "inilah-18-tim-peserta-dota-2-esl-one-berlin-major-2023",
      image:
        "https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=300&h=200&fit=crop&crop=center",
      date: "2025-01-09",
      readTime: "7 min",
      views: 15600,
      category: "DOTA 2",
    },
  ];

  const relatedPosts = [
    {
      id: 8,
      title: "Cara Dapatkan Skin Aldous Fathom Terror Gratis",
      slug: "cara-dapatkan-skin-aldous-fathom-terror-gratis",
      image:
        "https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=300&h=200&fit=crop&crop=center",
      date: "2025-01-08",
      readTime: "5 min",
      views: 9800,
      category: "Mobile Legends",
    },
    {
      id: 9,
      title: "Cara Mendapatkan Skin di Event MLBB x Saint Seiya Phase 2",
      slug: "cara-mendapatkan-skin-di-event-mlbb-x-saint-seiya-phase-2",
      image:
        "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=300&h=200&fit=crop&crop=center",
      date: "2025-01-07",
      readTime: "6 min",
      views: 11200,
      category: "Mobile Legends",
    },
    {
      id: 10,
      title:
        "Bocoran Skin Eksklusif Starlight Agustus 2025 MLBB: Kadita Maiden of the Tide",
      slug: "bocoran-skin-eksklusif-starlight-agustus-2025-mlbb-kadita-maiden-of-the-tide",
      image:
        "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop&crop=center",
      date: "2025-01-06",
      readTime: "4 min",
      views: 13500,
      category: "Mobile Legends",
    },
    {
      id: 11,
      title: "Bocoran Skin Seri Metro Zero MLBB Terbaru",
      slug: "bocoran-skin-seri-metro-zero-mlbb-terbaru",
      image:
        "https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=300&h=200&fit=crop&crop=center",
      date: "2025-01-05",
      readTime: "3 min",
      views: 8900,
      category: "Mobile Legends",
    },
    {
      id: 12,
      title: "Event MLBB x Sanrio Kembali Hadir September 2025 Ini",
      slug: "event-mlbb-x-sanrio-kembali-hadir-september-2025-ini-2",
      image:
        "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=300&h=200&fit=crop&crop=center",
      date: "2025-01-04",
      readTime: "5 min",
      views: 10200,
      category: "Mobile Legends",
    },
    {
      id: 13,
      title: "Cara Dapatkan Skin Khufra Cursed Scroll Mobile Legends Gratis",
      slug: "cara-dapatkan-skin-khufra-cursed-scroll-mobile-legends-gratis",
      image:
        "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=300&h=200&fit=crop&crop=center",
      date: "2025-01-03",
      readTime: "4 min",
      views: 11500,
      category: "Mobile Legends",
    },
    {
      id: 14,
      title:
        "Moonton Rilis Skin Juara M6 ONIC PH untuk Joy dan Skin FMVP Beatrix",
      slug: "moonton-rilis-skin-juara-m6-onic-ph-untuk-joy-dan-skin-fmvp-beatrix",
      image:
        "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=300&h=200&fit=crop&crop=center",
      date: "2025-01-02",
      readTime: "6 min",
      views: 14200,
      category: "Mobile Legends",
    },
    {
      id: 15,
      title: "PUBG Mobile Update Terbaru dengan Mode Baru",
      slug: "pubg-mobile-update-terbaru-dengan-mode-baru",
      image:
        "https://images.unsplash.com/photo-1556438064-2d7646166914?w=300&h=200&fit=crop&crop=center",
      date: "2025-01-01",
      readTime: "5 min",
      views: 9800,
      category: "PUBG Mobile",
    },
  ];

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

  const NewsCard = ({ item, index }: { item: NewsItem; index: number }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="group bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
    >
      <div className="relative overflow-hidden">
        <Image
          src={item.image}
          alt={item.title}
          width={300}
          height={200}
          className="w-full h-32 object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded-lg text-xs">
          {item.category}
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-bold text-gray-900 text-sm leading-tight mb-2 group-hover:text-[#C02628] transition-colors line-clamp-2">
          {item.title}
        </h3>
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Calendar size={12} />
          <span>{formatDate(item.date)}</span>
        </div>
      </div>
    </motion.div>
  );

  const SidebarCard = ({ item, index }: { item: NewsItem; index: number }) => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{ x: 5 }}
      className="group flex gap-3 p-3 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100"
    >
      <div className="relative w-16 h-16 flex-shrink-0 overflow-hidden rounded-lg">
        <Image
          src={item.image}
          alt={item.title}
          width={64}
          height={64}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-gray-900 text-sm leading-tight mb-1 group-hover:text-[#C02628] transition-colors line-clamp-2">
          {item.title}
        </h4>
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Calendar size={10} />
          <span>{formatDate(item.date)}</span>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-2 text-sm text-gray-600 mb-6"
        >
          <Link
            href="/"
            className="flex items-center gap-1 hover:text-[#C02628] transition-colors"
          >
            <Home size={14} />
            <span>Home</span>
          </Link>
          <ChevronRight size={14} />
          <Link href="/news" className="hover:text-[#C02628] transition-colors">
            Blog
          </Link>
          <ChevronRight size={14} />
          <span className="text-gray-900 font-medium">
            {articleData.category}
          </span>
          <ChevronRight size={14} />
          <span className="text-gray-900 font-medium line-clamp-1">
            {articleData.title}
          </span>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content - 3/4 width */}
          <div className="lg:col-span-3">
            <motion.article
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white rounded-2xl shadow-xl overflow-hidden"
            >
              {/* Article Header */}
              <div className="relative">
                <Image
                  src={articleData.image}
                  alt={articleData.title}
                  width={800}
                  height={400}
                  className="w-full h-64 md:h-80 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

                {/* Category Badge */}
                <div className="absolute top-4 left-4 bg-[#C02628] text-white px-3 py-1 rounded-full text-sm font-semibold">
                  {articleData.category}
                </div>

                {/* Trending Badge */}
                {articleData.trending && (
                  <div className="absolute top-4 right-4 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                    <TrendingUp size={14} />
                    <span>TRENDING</span>
                  </div>
                )}
              </div>

              {/* Article Content */}
              <div className="p-6 md:p-8">
                {/* Title */}
                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight mb-4"
                >
                  {articleData.title}
                </motion.h1>

                {/* Meta Information */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6"
                >
                  <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full">
                    <Calendar size={14} className="text-[#C02628]" />
                    <span className="font-medium">
                      {formatDate(articleData.date)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full">
                    <Clock size={14} className="text-blue-600" />
                    <span className="font-medium">{articleData.readTime}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full">
                    <Eye size={14} className="text-purple-600" />
                    <span className="font-medium">
                      {formatViews(articleData.views)} views
                    </span>
                  </div>
                  <button className="flex items-center gap-2 bg-[#C02628] text-white px-3 py-1.5 rounded-full hover:bg-red-600 transition-colors">
                    <Share2 size={14} />
                    <span>Share</span>
                  </button>
                </motion.div>

                {/* Article Body */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  className="prose prose-lg max-w-none"
                >
                  {articleData.content.split("\n").map((paragraph, index) => {
                    if (paragraph.startsWith("## ")) {
                      return (
                        <h2
                          key={index}
                          className="text-xl font-bold text-gray-900 mt-8 mb-4 text-[#C02628]"
                        >
                          {paragraph.replace("## ", "")}
                        </h2>
                      );
                    }
                    if (paragraph.trim() === "") return null;
                    return (
                      <p
                        key={index}
                        className="text-gray-700 leading-relaxed mb-4"
                      >
                        {paragraph}
                      </p>
                    );
                  })}
                </motion.div>

                {/* Call to Action */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="mt-8 p-6 bg-gradient-to-r from-red-50 to-blue-50 rounded-xl border border-red-200"
                >
                  <p className="text-gray-700 leading-relaxed">
                    Jangan lupa top-up diamond Mobile Legends: Bang Bang
                    termurah, tercepat, dan terpercaya di PSAK-413.com. Dapatkan
                    juga informasi terbaru seputar skin, event, dan promo
                    menarik Mobile Legends lainnya hanya di PSAK-413!
                  </p>
                </motion.div>

                {/* Tags */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                  className="mt-8 pt-6 border-t border-gray-200"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Tags:
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {articleData.tags.map((tag, index) => (
                      <motion.span
                        key={tag}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.7 + index * 0.1, duration: 0.3 }}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-red-100 hover:text-red-700 transition-colors cursor-pointer"
                      >
                        {tag}
                      </motion.span>
                    ))}
                  </div>
                </motion.div>
              </div>
            </motion.article>

            {/* Related Posts */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="mt-12"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-1 h-8 bg-gradient-to-b from-[#C02628] to-blue-500 rounded-full"></div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Related Posts
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedPosts.map((item, index) => (
                  <NewsCard key={item.id} item={item} index={index} />
                ))}
              </div>
            </motion.section>
          </div>

          {/* Sidebar - 1/4 width */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-8">
              {/* Latest News */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="bg-white rounded-xl shadow-lg p-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full"></div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Latest News
                  </h3>
                </div>
                <div className="space-y-4">
                  {latestNews.map((item, index) => (
                    <SidebarCard key={item.id} item={item} index={index} />
                  ))}
                </div>
              </motion.div>

              {/* Trending */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="bg-white rounded-xl shadow-lg p-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1 h-6 bg-gradient-to-b from-red-500 to-pink-500 rounded-full"></div>
                  <h3 className="text-lg font-bold text-gray-900">Trending</h3>
                </div>
                <div className="space-y-4">
                  {trendingNews.map((item, index) => (
                    <SidebarCard key={item.id} item={item} index={index} />
                  ))}
                </div>
              </motion.div>

              {/* Discount Ad */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7, duration: 0.6 }}
                className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl shadow-lg p-6 text-white"
              >
                <div className="text-center">
                  <div className="text-2xl font-bold mb-2">DISKON Rp10.000</div>
                  <p className="text-sm mb-4">
                    Nikmati Diskon Rp10.000 di PSAK-413 dengan Pembayaran QRIS
                    Neobank
                  </p>
                  <button className="bg-white text-orange-500 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                    Dapatkan Sekarang
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsDetailPage;
