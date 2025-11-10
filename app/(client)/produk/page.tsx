"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import PromotionBanner from "@/components/section/promotion-banner";
import {
  publicProductCategoriesService,
  PublicProductCategory,
} from "@/services/api/public-product-categories";
import { useApiCall, useDebounce } from "@/hooks";

interface Product {
  id: number;
  name: string;
  image: string;
}

type ProductData = Record<string, Product[]>;

const getAlphabet = (data: ProductData) => Object.keys(data).sort();

const ProdukPageContent = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLetter, setSelectedLetter] = useState("");
  const [filteredGames, setFilteredGames] = useState<ProductData>({});
  const [isAlphabetOpen, setIsAlphabetOpen] = useState(false);
  const [categories, setCategories] = useState<PublicProductCategory[]>([]);
  const [parentCategories, setParentCategories] = useState<
    PublicProductCategory[]
  >([]);
  const sectionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Debounce search term
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const selectedCategory = searchParams?.get("category") || "All";

  // API calls - only fetch subcategories (categories with parent_id)
  const {
    data: categoriesData,
    loading: categoriesLoading,
    error: categoriesError,
    execute: fetchCategories,
  } = useApiCall(() =>
    publicProductCategoriesService.getProductCategories({
      page: 1,
      paginate: 100,
      status: 1,
      // Only get subcategories by filtering out parent categories
    })
  );

  // Fetch parent categories
  const {
    data: parentCategoriesData,
    loading: parentCategoriesLoading,
    execute: fetchParentCategories,
  } = useApiCall(() =>
    publicProductCategoriesService.getProductCategories({
      page: 1,
      paginate: 100,
      is_parent: 1,
      status: 1,
    })
  );

  // Load data on component mount
  useEffect(() => {
    fetchCategories();
    fetchParentCategories();
  }, [fetchCategories, fetchParentCategories]);

  // Update categories when data changes
  useEffect(() => {
    if (categoriesData?.data?.data) {
      setCategories(categoriesData.data.data);
    }
  }, [categoriesData]);

  // Update parent categories when data changes
  useEffect(() => {
    if (parentCategoriesData?.data?.data) {
      setParentCategories(parentCategoriesData.data.data);
    }
  }, [parentCategoriesData]);

  const setSelectedCategory = (category: string) => {
    const params = new URLSearchParams(searchParams?.toString() || "");
    params.set("category", category);

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // Filter and Sort products
  useEffect(() => {
    let currentCategories = [...categories];

    // 1. Filter by parent category
    if (selectedCategory !== "All") {
      const parentCategory = parentCategories.find(
        (cat) => cat.title === selectedCategory
      );
      if (parentCategory) {
        currentCategories = currentCategories.filter(
          (cat) => cat.parent_id === parentCategory.id
        );
      }
    }

    // 2. Filter by search term
    if (debouncedSearchTerm.trim() !== "") {
      const lowerCaseSearchTerm = debouncedSearchTerm.toLowerCase();
      currentCategories = currentCategories.filter(
        (cat) =>
          cat.title.toLowerCase().includes(lowerCaseSearchTerm) ||
          (cat.sub_title &&
            cat.sub_title.toLowerCase().includes(lowerCaseSearchTerm))
      );
    }

    // 3. Sort the filtered categories alphabetically by title (ascending A-Z)
    currentCategories.sort((a, b) =>
      a.title.localeCompare(b.title, "id", { sensitivity: "base" })
    );

    // 4. Group by first letter
    const grouped: ProductData = {};
    currentCategories.forEach((category) => {
      const firstLetter = category.title.charAt(0).toUpperCase();
      if (!grouped[firstLetter]) {
        grouped[firstLetter] = [];
      }
      grouped[firstLetter].push({
        id: category.id,
        name: category.title,
        image: category.image || "/images/placeholder-game.png",
      });
    });

    setFilteredGames(grouped);
  }, [categories, parentCategories, selectedCategory, debouncedSearchTerm]);

  // Intersection Observer to update selected letter
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "-120px 0px -50% 0px", // Account for header height
      threshold: 0.1,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const letter = entry.target.id.replace("section-", "");
          setSelectedLetter(letter);
        }
      });
    }, observerOptions);

    // Store current refs to avoid stale closure
    const currentRefs = sectionRefs.current;

    // Observe all sections
    Object.keys(filteredGames).forEach((letter) => {
      const element = currentRefs[letter];
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      Object.keys(filteredGames).forEach((letter) => {
        const element = currentRefs[letter];
        if (element) {
          observer.unobserve(element);
        }
      });
    };
  }, [filteredGames, selectedCategory]);

  // Scroll to section when letter is selected
  const scrollToSection = (letter: string) => {
    setSelectedLetter(letter);
    const element = sectionRefs.current[letter];
    if (element) {
      // Get the header height to offset the scroll position
      const headerHeight = 120; // Approximate header height
      const elementPosition = element.offsetTop - headerHeight;

      window.scrollTo({
        top: elementPosition,
        behavior: "smooth",
      });

      // Close alphabet nav on mobile after scrolling
      if (window.innerWidth < 768) {
        setTimeout(() => {
          setIsAlphabetOpen(false);
        }, 500);
      }
    }
  };

  // Get all games for display
  const allGames = Object.values(filteredGames).flat();

  return (
    <div className="min-h-screen bg-white">
      {/* Search Bar */}
      <div className="py-4">
        <div className="container">
          <div className="relative max-w-2xl mx-auto">
            <input
              type="text"
              placeholder="Cari di PSAK-413"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 pl-12 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C02628] focus:border-transparent text-sm"
            />
            <svg
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="">
        <div className="container">
          <div className="flex justify-center">
            <div className="bg-white rounded-2xl p-2 shadow-lg border border-gray-100 inline-flex gap-1 max-w-full overflow-x-auto">
              {/* All Categories Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory("All")}
                className={`px-4 sm:px-6 py-3 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-300 relative overflow-hidden ${
                  selectedCategory === "All"
                    ? "bg-gradient-to-r from-[#C02628] to-red-600 text-white shadow-lg shadow-red-200"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                }`}
              >
                {selectedCategory === "All" && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-[#C02628] to-[#C02628]"
                    layoutId="activeCategory"
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 30,
                    }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <span className="text-lg">🔍</span>
                  <span className="hidden sm:inline">All</span>
                  <span className="sm:hidden text-xs">All</span>
                </span>
              </motion.button>

              {/* Dynamic Categories from API - These are parent categories used for filtering */}
              {parentCategories.map((category) => (
                <motion.button
                  key={category.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedCategory(category.title)}
                  className={`px-4 sm:px-6 py-3 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-300 relative overflow-hidden ${
                    selectedCategory === category.title
                      ? "bg-gradient-to-r from-[#C02628] to-red-600 text-white shadow-lg shadow-red-200"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                  }`}
                >
                  {selectedCategory === category.title && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-[#C02628] to-[#C02628]"
                      layoutId="activeCategory"
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                      }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    <span className="text-lg">
                      {category.title === "Games" && "🎮"}
                      {category.title === "Voucher" && "🎫"}
                      {category.title === "Phone" && "📱"}
                      {category.title === "E-Money" && "💳"}
                      {!["Games", "Voucher", "Phone", "E-Money"].includes(
                        category.title
                      ) && "🎯"}
                    </span>
                    <span className="hidden sm:inline">{category.title}</span>
                    <span className="sm:hidden text-xs">{category.title}</span>
                  </span>
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {(categoriesLoading || parentCategoriesLoading) && (
        <div className="container py-12">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-[#C02628] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading products...</p>
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {categoriesError && (
        <div className="container py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <p className="text-red-600 mb-2">Error loading products</p>
            <button
              onClick={() => {
                fetchCategories();
                fetchParentCategories();
              }}
              className="text-red-600 hover:text-red-800 underline text-sm"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      {!categoriesLoading && !parentCategoriesLoading && !categoriesError && (
        <div className="container py-8">
          <div className="max-w-7xl mx-auto">
            {/* Games Grid by Category */}
            {Object.entries(filteredGames).map(([letter, games]) => (
              <div
                key={letter}
                ref={(el) => {
                  sectionRefs.current[letter] = el;
                }}
                id={`section-${letter}`}
                className="mb-12"
              >
                {/* Category Header */}
                <div className="flex items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 mr-4">
                    {letter}
                  </h2>
                  <div className="flex-1 h-px bg-gray-300"></div>
                </div>

                {/* Games Grid */}
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-x-3 sm:gap-x-4 gap-y-5">
                  {games.map((game, index) => (
                    <Link
                      key={game.id}
                      href={`/produk/${game.name
                        .toLowerCase()
                        .replace(/\s+/g, "-")
                        .replace(/[^a-z0-9-]/g, "")}`}
                    >
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.02 }}
                        whileHover={{ scale: 1.05 }}
                        className="text-center cursor-pointer group"
                      >
                        {/* Game Image */}
                        <div className="w-full aspect-square mb-2 rounded-xl overflow-hidden bg-gray-100 group-hover:shadow-md transition-all duration-200">
                          <Image
                            src={game.image}
                            alt={game.name}
                            width={100}
                            height={100}
                            className="w-full h-full object-cover"
                            unoptimized
                          />
                        </div>

                        {/* Game Name */}
                        <p className="text-center font-mono text-sm sm:text-base group-hover:text-[#C02628] transition-colors">
                          {game.name}
                        </p>
                      </motion.div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}

            {/* Empty State */}
            {allGames.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {debouncedSearchTerm
                    ? "Produk tidak ditemukan"
                    : "Belum ada produk tersedia"}
                </h3>
                <p className="text-gray-600">
                  {debouncedSearchTerm
                    ? "Coba cari dengan kata kunci yang berbeda"
                    : "Produk akan segera ditambahkan"}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile Alphabet Toggle Button */}
      <div className="fixed bottom-20 right-6 z-40 md:hidden">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsAlphabetOpen(!isAlphabetOpen)}
          className="w-12 h-12 bg-[#C02628] text-white rounded-full shadow-lg flex items-center justify-center font-bold text-sm"
        >
          {isAlphabetOpen ? "✕" : "A-Z"}
        </motion.button>
      </div>

      {/* Mobile Alphabet Overlay */}
      <AnimatePresence>
        {isAlphabetOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 z-30 md:hidden"
            onClick={() => setIsAlphabetOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="absolute bottom-32 right-6 bg-white rounded-2xl shadow-2xl p-4 max-h-80 overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="grid grid-cols-6 gap-2">
                {getAlphabet(filteredGames).map((letter) => (
                  <motion.button
                    key={letter}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => scrollToSection(letter)}
                    className={`w-10 h-10 text-sm font-bold rounded-lg transition-all duration-200 ${
                      selectedLetter === letter
                        ? "bg-[#C02628] text-white shadow-lg"
                        : "bg-gray-100 text-gray-700 hover:bg-red-100 hover:text-[#C02628]"
                    }`}
                  >
                    {letter}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Alphabet Navigation */}
      <div className="hidden md:block fixed right-4 top-1/2 transform -translate-y-1/2 z-30">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-2">
          <div className="space-y-0.5">
            {getAlphabet(filteredGames).map((letter) => (
              <motion.button
                key={letter}
                whileHover={{ scale: 1.1, x: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => scrollToSection(letter)}
                className={`block w-7 h-7 text-xs font-bold rounded-md transition-all duration-200 ${
                  selectedLetter === letter
                    ? "bg-[#C02628] text-white shadow-lg"
                    : "text-gray-600 hover:bg-red-100 hover:text-[#C02628]"
                }`}
              >
                {letter}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      <PromotionBanner />
    </div>
  );
};

const ProdukPage = () => {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-[#C02628] to-red-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-[#C02628] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      }
    >
      <ProdukPageContent />
    </Suspense>
  );
};

export default ProdukPage;
