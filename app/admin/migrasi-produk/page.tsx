"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  Download,
  Search,
  Filter,
  CheckCircle,
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronRight,
  CheckSquare,
  Square,
  RefreshCw,
} from "lucide-react";
import { digiflazzService, DigiflazzProduct } from "@/services/api/digiflazz";
import { productsService } from "@/services/api/products";
import {
  productCategoriesService,
  CreateProductCategoryRequest,
} from "@/services/api/product-categories";
import { ProductCategory } from "@/lib/types";

interface MigrationProgress {
  total: number;
  completed: number;
  failed: number;
  current?: string;
  currentStep?: string;
}

interface MigrationStatus {
  [skuCode: string]: {
    isMigrated: boolean;
    productId?: number;
    productSlug?: string;
  };
}

export default function MigrasiProdukPage() {
  const [digiflazzProducts, setDigiflazzProducts] = useState<
    DigiflazzProduct[]
  >([]);
  const [productCategories, setProductCategories] = useState<ProductCategory[]>(
    []
  );
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(
    new Set()
  );
  const [expandedBrands, setExpandedBrands] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [migrating, setMigrating] = useState(false);
  const [migrationProgress, setMigrationProgress] =
    useState<MigrationProgress | null>(null);
  const [migrationStatus, setMigrationStatus] = useState<MigrationStatus>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Load Digiflazz products
      const digiflazzResponse = await digiflazzService.getProducts();
      const products = digiflazzResponse.data;
      setDigiflazzProducts(products);

      // Group products by brand (for auto-expand functionality)
      const grouped = digiflazzService.groupProductsByBrand(products);

      // Auto-expand first few brands
      const brands = Object.keys(grouped);
      setExpandedBrands(new Set(brands.slice(0, 3)));

      // Load existing products to check migration status
      const existingProductsResponse = await productsService.getProducts({
        paginate: 1000,
      });
      const existingProductsList = existingProductsResponse.data.data;

      // Load product categories
      const categoriesResponse =
        await productCategoriesService.getProductCategories({ paginate: 100 });
      setProductCategories(categoriesResponse.data.data);

      // Check migration status for each Digiflazz product
      const status: MigrationStatus = {};
      products.forEach((digiflazzProduct) => {
        const existingProduct = existingProductsList.find(
          (product) => product.sku === digiflazzProduct.buyer_sku_code
        );

        status[digiflazzProduct.buyer_sku_code] = {
          isMigrated: !!existingProduct,
          productId: existingProduct?.id,
          productSlug: existingProduct?.slug,
        };
      });
      setMigrationStatus(status);
    } catch (err) {
      setError("Gagal memuat data produk Digiflazz");
      console.error("Error loading data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Filter products based on search, category, and brand
  const getFilteredProducts = () => {
    let filtered = digiflazzProducts;

    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          product.product_name
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter((product) =>
        product.category.toLowerCase().includes(selectedCategory.toLowerCase())
      );
    }

    if (selectedBrand) {
      filtered = filtered.filter((product) =>
        product.brand.toLowerCase().includes(selectedBrand.toLowerCase())
      );
    }

    return digiflazzService.groupProductsByBrand(filtered);
  };

  const filteredGroupedProducts = getFilteredProducts();

  // Handle product selection
  const toggleProductSelection = (skuCode: string) => {
    // Don't allow selection of already migrated products
    if (migrationStatus[skuCode]?.isMigrated) {
      return;
    }

    const newSelected = new Set(selectedProducts);
    if (newSelected.has(skuCode)) {
      newSelected.delete(skuCode);
    } else {
      newSelected.add(skuCode);
    }
    setSelectedProducts(newSelected);
  };

  // Handle brand selection (select all products in a brand)
  const toggleBrandSelection = (brand: string) => {
    const brandProducts = filteredGroupedProducts[brand] || [];
    const brandSkus = brandProducts.map((p) => p.buyer_sku_code);
    const availableSkus = brandSkus.filter(
      (sku) => !migrationStatus[sku]?.isMigrated
    );
    const allSelected = availableSkus.every((sku) => selectedProducts.has(sku));

    const newSelected = new Set(selectedProducts);
    if (allSelected) {
      availableSkus.forEach((sku) => newSelected.delete(sku));
    } else {
      availableSkus.forEach((sku) => newSelected.add(sku));
    }
    setSelectedProducts(newSelected);
  };

  // Handle brand expansion
  const toggleBrandExpansion = (brand: string) => {
    const newExpanded = new Set(expandedBrands);
    if (newExpanded.has(brand)) {
      newExpanded.delete(brand);
    } else {
      newExpanded.add(brand);
    }
    setExpandedBrands(newExpanded);
  };

  // Create main category if it doesn't exist
  const createMainCategoryIfNotExists = async (
    categoryName: string,
    localCategories: ProductCategory[]
  ): Promise<{ id: number; updatedCategories: ProductCategory[] } | null> => {
    try {
      console.log(
        `\n[createMainCategoryIfNotExists] Looking for main category: ${categoryName}`
      );
      console.log(
        `[createMainCategoryIfNotExists] Local categories count: ${localCategories.length}`
      );
      console.log(
        `[createMainCategoryIfNotExists] Main categories in local array:`,
        localCategories
          .filter(
            (cat) => cat.parent_id === null || cat.parent_id === undefined
          )
          .map((cat) => `${cat.title} (ID: ${cat.id})`)
      );

      // Check if main category already exists
      const existingCategory = localCategories.find(
        (cat) =>
          (cat.parent_id === null || cat.parent_id === undefined) &&
          cat.title.toLowerCase() === categoryName.toLowerCase()
      );

      if (existingCategory) {
        console.log(
          `[createMainCategoryIfNotExists] Found existing main category: ${existingCategory.title} (ID: ${existingCategory.id})`
        );
        return { id: existingCategory.id, updatedCategories: localCategories };
      }

      // Create new main category
      const categoryData: CreateProductCategoryRequest = {
        title: categoryName,
        description: `Kategori utama untuk ${categoryName}`,
        status: 1,
        digiflazz_code: categoryName.toUpperCase(),
        must_fill_game_id: false,
        must_fill_zone_id: false,
      };

      const response = await productCategoriesService.createProductCategory(
        categoryData
      );

      console.log(
        `[createMainCategoryIfNotExists] Created main category: ${response.data.title} (ID: ${response.data.id})`
      );

      // Add to local state immediately
      setProductCategories((prev) => [...prev, response.data]);

      // Create a new array with the added category
      const updatedCategories = [...localCategories, response.data];

      console.log(
        `[createMainCategoryIfNotExists] Updated local categories array. New count: ${updatedCategories.length}`
      );

      return { id: response.data.id, updatedCategories };
    } catch (error) {
      console.error(`Failed to create main category ${categoryName}:`, error);
      return null;
    }
  };

  // Create sub category if it doesn't exist
  const createSubCategoryIfNotExists = async (
    brandName: string,
    mainCategoryId: number,
    localCategories: ProductCategory[]
  ): Promise<{ id: number; updatedCategories: ProductCategory[] } | null> => {
    try {
      console.log(
        `\n[createSubCategoryIfNotExists] Looking for sub category: ${brandName} under main category ID: ${mainCategoryId}`
      );
      console.log(
        `[createSubCategoryIfNotExists] Local categories count: ${localCategories.length}`
      );
      console.log(
        `[createSubCategoryIfNotExists] Sub categories under main category ${mainCategoryId}:`,
        localCategories
          .filter((cat) => Number(cat.parent_id) === mainCategoryId)
          .map((cat) => `${cat.title} (ID: ${cat.id})`)
      );

      // Check if sub category already exists
      const existingSubCategory = localCategories.find(
        (cat) =>
          Number(cat.parent_id) === mainCategoryId &&
          cat.title.toLowerCase() === brandName.toLowerCase()
      );

      if (existingSubCategory) {
        console.log(
          `[createSubCategoryIfNotExists] Found existing sub category: ${existingSubCategory.title} (ID: ${existingSubCategory.id})`
        );
        return {
          id: existingSubCategory.id,
          updatedCategories: localCategories,
        };
      }

      // Create new sub category
      const subCategoryData: CreateProductCategoryRequest = {
        parent_id: mainCategoryId,
        title: brandName,
        description: brandName,
        status: 1,
        digiflazz_code: brandName.toUpperCase(),
        must_fill_game_id: false,
        must_fill_zone_id: false,
      };

      const response = await productCategoriesService.createProductCategory(
        subCategoryData
      );

      console.log(
        `[createSubCategoryIfNotExists] Created sub category: ${response.data.title} (ID: ${response.data.id}) under main category ID: ${mainCategoryId}`
      );

      // Add to local state immediately
      setProductCategories((prev) => [...prev, response.data]);

      // Create a new array with the added category
      const updatedCategories = [...localCategories, response.data];

      console.log(
        `[createSubCategoryIfNotExists] Updated local categories array. New count: ${updatedCategories.length}`
      );
      console.log(
        `[createSubCategoryIfNotExists] All categories in local array:`,
        updatedCategories.map(
          (cat) => `${cat.title} (ID: ${cat.id}, Parent: ${cat.parent_id})`
        )
      );

      return { id: response.data.id, updatedCategories };
    } catch (error) {
      console.error(`Failed to create sub category ${brandName}:`, error);
      return null;
    }
  };

  // Rate limiting helper
  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  // Retry helper with exponential backoff
  const retryWithBackoff = async (
    fn: () => Promise<unknown>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<unknown> => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error: unknown) {
        if (attempt === maxRetries) {
          throw error;
        }

        // Check if it's a rate limiting error
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        if (
          errorMessage.includes("too many requests") ||
          errorMessage.includes("rate limit") ||
          errorMessage.includes("429")
        ) {
          const delayTime = baseDelay * Math.pow(2, attempt - 1);
          console.log(
            `Rate limited, retrying in ${delayTime}ms (attempt ${attempt}/${maxRetries})`
          );
          await delay(delayTime);
        } else {
          throw error;
        }
      }
    }
    throw new Error("Max retries exceeded");
  };

  // Migrate selected products
  const migrateProducts = async () => {
    if (selectedProducts.size === 0) {
      setError("Pilih minimal satu produk untuk di-migrasi");
      return;
    }

    setMigrating(true);
    setError(null);
    setSuccess(null);
    setMigrationProgress({
      total: selectedProducts.size,
      completed: 0,
      failed: 0,
      currentStep: "Memulai migrasi...",
    });

    const selectedProductsList = digiflazzProducts.filter((p) =>
      selectedProducts.has(p.buyer_sku_code)
    );
    let completed = 0;
    let failed = 0;

    // Create a local copy of categories that gets updated during migration
    let localProductCategories = [...productCategories];

    // STEP 1: Pre-process and create all missing categories first
    console.log("\n=== STEP 1: Creating missing categories ===");
    const uniqueCategoryBrands = new Set<string>();

    // Collect all unique category-brand combinations
    selectedProductsList.forEach((product) => {
      const key = `${product.category}|${product.brand}`;
      uniqueCategoryBrands.add(key);
    });

    console.log(
      `Found ${uniqueCategoryBrands.size} unique category-brand combinations:`,
      Array.from(uniqueCategoryBrands)
    );

    // Create missing main categories first
    const mainCategoriesToCreate = new Set<string>();
    selectedProductsList.forEach((product) => {
      const existingMainCategory = localProductCategories.find(
        (cat) =>
          (cat.parent_id === null || cat.parent_id === undefined) &&
          cat.title.toLowerCase() === product.category.toLowerCase()
      );
      if (!existingMainCategory) {
        mainCategoriesToCreate.add(product.category);
      }
    });

    console.log(
      `Main categories to create:`,
      Array.from(mainCategoriesToCreate)
    );

    // Create missing main categories
    for (const categoryName of mainCategoriesToCreate) {
      console.log(`Creating main category: ${categoryName}`);
      const result = await createMainCategoryIfNotExists(
        categoryName,
        localProductCategories
      );
      if (result) {
        localProductCategories = result.updatedCategories;
        console.log(
          `Created main category: ${categoryName} (ID: ${result.id})`
        );
        console.log(
          `Updated localProductCategories count after main category creation: ${localProductCategories.length}`
        );
      }
    }

    // Create missing sub categories
    const subCategoriesToCreate = new Set<string>();
    selectedProductsList.forEach((product) => {
      console.log(
        `Checking sub category for product: ${product.product_name} (Category: ${product.category}, Brand: ${product.brand})`
      );
      const mainCategory = localProductCategories.find(
        (cat) =>
          (cat.parent_id === null || cat.parent_id === undefined) &&
          cat.title.toLowerCase() === product.category.toLowerCase()
      );
      if (mainCategory) {
        console.log(
          `Found main category for ${product.category}: ${mainCategory.title} (ID: ${mainCategory.id})`
        );
        const existingSubCategory = localProductCategories.find(
          (cat) =>
            Number(cat.parent_id) === mainCategory.id &&
            cat.title.toLowerCase() === product.brand.toLowerCase()
        );
        if (!existingSubCategory) {
          console.log(
            `Sub category ${product.brand} not found, adding to create list`
          );
          subCategoriesToCreate.add(
            `${product.category}|${product.brand}|${mainCategory.id}`
          );
        } else {
          console.log(
            `Sub category ${product.brand} already exists: ${existingSubCategory.title} (ID: ${existingSubCategory.id})`
          );
        }
      } else {
        console.log(`Main category not found for ${product.category}`);
      }
    });

    console.log(`Sub categories to create:`, Array.from(subCategoriesToCreate));

    // Create missing sub categories
    for (const subCategoryKey of subCategoriesToCreate) {
      const [categoryName, brandName, mainCategoryId] =
        subCategoryKey.split("|");
      console.log(
        `Creating sub category: ${brandName} under main category ${categoryName} (ID: ${mainCategoryId})`
      );
      const result = await createSubCategoryIfNotExists(
        brandName,
        parseInt(mainCategoryId),
        localProductCategories
      );
      if (result) {
        localProductCategories = result.updatedCategories;
        console.log(`Created sub category: ${brandName} (ID: ${result.id})`);
        console.log(
          `Updated localProductCategories count: ${localProductCategories.length}`
        );

        // Verify the sub category was added
        const verification = localProductCategories.find(
          (cat) =>
            Number(cat.parent_id) === parseInt(mainCategoryId) &&
            cat.title.toLowerCase() === brandName.toLowerCase()
        );
        console.log(
          `Verification - Sub category in array: ${
            verification
              ? `${verification.title} (ID: ${verification.id})`
              : "NOT FOUND"
          }`
        );
        console.log(
          `Verification - Looking for parent_id: ${parseInt(
            mainCategoryId
          )} (type: ${typeof parseInt(mainCategoryId)})`
        );
        console.log(
          `Verification - Available parent_ids:`,
          localProductCategories.map(
            (cat) =>
              `${cat.title}: ${cat.parent_id} (type: ${typeof cat.parent_id})`
          )
        );
      }
    }

    console.log("\n=== STEP 2: Creating products ===");

    // STEP 2: Now create all products using existing categories
    for (const product of selectedProductsList) {
      try {
        console.log(`\n=== Processing product: ${product.product_name} ===`);
        console.log(
          `Category: ${product.category}, Brand: ${product.brand}, SKU: ${product.buyer_sku_code}`
        );
        console.log(
          `Current localProductCategories count: ${localProductCategories.length}`
        );

        setMigrationProgress((prev) =>
          prev
            ? {
                ...prev,
                current: product.product_name,
                currentStep: "Mencari kategori...",
              }
            : null
        );

        // Find main category (should already exist from pre-processing)
        console.log(`Looking for main category: ${product.category}`);
        console.log(
          `Available main categories:`,
          localProductCategories
            .filter(
              (cat) => cat.parent_id === null || cat.parent_id === undefined
            )
            .map((cat) => `${cat.title} (ID: ${cat.id})`)
        );

        const mainCategory = localProductCategories.find(
          (cat) =>
            (cat.parent_id === null || cat.parent_id === undefined) &&
            cat.title.toLowerCase() === product.category.toLowerCase()
        );

        if (!mainCategory) {
          console.error(`Main category not found: ${product.category}`);
          console.error(
            `All categories in array:`,
            localProductCategories.map(
              (cat) => `${cat.title} (ID: ${cat.id}, Parent: ${cat.parent_id})`
            )
          );
          failed++;
          continue;
        }

        console.log(
          `Found main category: ${mainCategory.title} (ID: ${mainCategory.id})`
        );

        // Find sub category (should already exist from pre-processing)
        console.log(
          `Looking for sub category: ${product.brand} under main category ID: ${mainCategory.id}`
        );
        console.log(`Main category ID type: ${typeof mainCategory.id}`);
        console.log(
          `Available sub categories under main category ${mainCategory.id}:`,
          localProductCategories
            .filter((cat) => Number(cat.parent_id) === mainCategory.id)
            .map((cat) => `${cat.title} (ID: ${cat.id})`)
        );
        console.log(
          `All categories with parent_id details:`,
          localProductCategories.map(
            (cat) =>
              `${cat.title} (ID: ${cat.id}, Parent: ${
                cat.parent_id
              }, Parent Type: ${typeof cat.parent_id})`
          )
        );

        const subCategory = localProductCategories.find(
          (cat) =>
            Number(cat.parent_id) === mainCategory.id &&
            cat.title.toLowerCase() === product.brand.toLowerCase()
        );

        if (!subCategory) {
          console.error(
            `Sub category not found: ${product.brand} under main category ${mainCategory.title}`
          );
          console.error(
            `All categories in array:`,
            localProductCategories.map(
              (cat) => `${cat.title} (ID: ${cat.id}, Parent: ${cat.parent_id})`
            )
          );
          failed++;
          continue;
        }

        console.log(
          `Found sub category: ${subCategory.title} (ID: ${subCategory.id}) under main category ${mainCategory.title}`
        );

        setMigrationProgress((prev) =>
          prev
            ? {
                ...prev,
                currentStep: "Membuat produk...",
              }
            : null
        );

        // Create product with sub category ID
        const createData = {
          product_category_id: subCategory.id,
          name: product.product_name,
          sku: product.buyer_sku_code,
          description: product.desc || "",
          buy_price: product.price,
          sell_price: product.price, // You might want to add markup here
          status: 1 as 0 | 1, // Active
        };

        const createdProduct = (await retryWithBackoff(() =>
          productsService.createProduct(createData)
        )) as { data: { id: number; slug: string } };

        // Update migration status
        setMigrationStatus((prev) => ({
          ...prev,
          [product.buyer_sku_code]: {
            isMigrated: true,
            productId: createdProduct.data.id,
            productSlug: createdProduct.data.slug,
          },
        }));

        completed++;

        // Add small delay between products to avoid rate limiting
        await delay(500);
      } catch (err) {
        console.error(
          `Failed to migrate product ${product.product_name}:`,
          err
        );
        failed++;
      }
    }

    setMigrationProgress({
      total: selectedProductsList.length,
      completed,
      failed,
      currentStep: "Migrasi selesai",
    });
    setMigrating(false);

    if (completed > 0) {
      setSuccess(
        `Berhasil migrasi ${completed} produk. ${
          failed > 0 ? `${failed} produk gagal.` : ""
        }`
      );
      setSelectedProducts(new Set());

      // Reload existing products to update the list
      await productsService.getProducts({ paginate: 1000 });
    } else {
      setError("Gagal migrasi semua produk yang dipilih");
    }
  };

  // Clear filters
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("");
    setSelectedBrand("");
  };

  // Get unique categories and brands for filter dropdowns
  const uniqueCategories = [
    ...new Set(digiflazzProducts.map((p) => p.category)),
  ];
  const uniqueBrands = [...new Set(digiflazzProducts.map((p) => p.brand))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Package className="h-7 w-7 text-[#C02628]" />
            Migrasi Produk Digiflazz
          </h1>
          <p className="text-gray-600 mt-1">
            Migrasikan produk dari Digiflazz ke sistem internal dengan kategori
            hierarki
          </p>
        </div>
        <button
          onClick={loadData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-[#C02628] text-white rounded-lg hover:bg-[#B02122] disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-600">
              Total Produk
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {digiflazzProducts.length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5 text-[#C02628]" />
            <span className="text-sm font-medium text-gray-600">Dipilih</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {selectedProducts.size}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-[#C02628]" />
            <span className="text-sm font-medium text-gray-600">
              Sudah Dimigrasi
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {
              Object.values(migrationStatus).filter(
                (status) => status.isMigrated
              ).length
            }
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-purple-600" />
            <span className="text-sm font-medium text-gray-600">Brand</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {Object.keys(filteredGroupedProducts).length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-64">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cari Produk
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari berdasarkan nama, brand, atau kategori..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C02628] focus:border-[#C02628]"
              />
            </div>
          </div>
          <div className="min-w-48">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kategori
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C02628] focus:border-[#C02628]"
              title="Pilih kategori produk"
            >
              <option value="">Semua Kategori</option>
              {uniqueCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          <div className="min-w-48">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Brand
            </label>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C02628] focus:border-[#C02628]"
              title="Pilih brand produk"
            >
              <option value="">Semua Brand</option>
              {uniqueBrands.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Migration Progress */}
      <AnimatePresence>
        {migrationProgress && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-blue-50 border border-blue-200 rounded-lg p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
              <span className="font-medium text-blue-900">Migrasi Produk</span>
            </div>
            <div className="text-sm text-blue-700 mb-2">
              {migrationProgress.current &&
                `Sedang memproses: ${migrationProgress.current}`}
              {migrationProgress.currentStep && (
                <div className="text-xs text-blue-600 mt-1">
                  {migrationProgress.currentStep}
                </div>
              )}
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${
                    (migrationProgress.completed / migrationProgress.total) *
                    100
                  }%`,
                }}
              />
            </div>
            <div className="text-xs text-blue-600 mt-1">
              {migrationProgress.completed} dari {migrationProgress.total}{" "}
              selesai
              {migrationProgress.failed > 0 &&
                ` (${migrationProgress.failed} gagal)`}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error/Success Messages */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2"
          >
            <AlertCircle className="h-5 w-5 text-red-600" />
            <span className="text-red-800">{error}</span>
          </motion.div>
        )}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-[#C02628]/10 border border-[#C02628]/30 rounded-lg p-4 flex items-center gap-2"
          >
            <CheckCircle className="h-5 w-5 text-[#C02628]" />
            <span className="text-[#C02628]">{success}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Products List */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Produk Digiflazz
            </h2>
            <button
              onClick={migrateProducts}
              disabled={selectedProducts.size === 0 || migrating}
              className="flex items-center gap-2 px-4 py-2 bg-[#C02628] text-white rounded-lg hover:bg-[#B02122] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {migrating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Migrasi ({selectedProducts.size})
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#C02628] mx-auto mb-4" />
            <p className="text-gray-600">Memuat produk Digiflazz...</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {Object.entries(filteredGroupedProducts).map(
              ([brand, products]) => {
                const isExpanded = expandedBrands.has(brand);
                const brandSkus = products.map((p) => p.buyer_sku_code);
                const availableSkus = brandSkus.filter(
                  (sku) => !migrationStatus[sku]?.isMigrated
                );
                const selectedInBrand = availableSkus.filter((sku) =>
                  selectedProducts.has(sku)
                ).length;
                const allSelected =
                  availableSkus.length > 0 &&
                  selectedInBrand === availableSkus.length;
                const someSelected =
                  selectedInBrand > 0 && selectedInBrand < availableSkus.length;
                const migratedInBrand = brandSkus.filter(
                  (sku) => migrationStatus[sku]?.isMigrated
                ).length;

                return (
                  <div key={brand} className="p-4">
                    {/* Brand Header */}
                    <div className="flex items-center gap-3 mb-3">
                      <button
                        onClick={() => toggleBrandExpansion(brand)}
                        className="flex items-center gap-2 text-left flex-1 hover:bg-gray-50 p-2 rounded-lg transition-colors"
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 text-gray-500" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-gray-500" />
                        )}
                        <div className="flex items-center gap-2">
                          {allSelected ? (
                            <CheckSquare className="h-5 w-5 text-[#C02628]" />
                          ) : someSelected ? (
                            <div className="h-5 w-5 border-2 border-[#C02628] rounded bg-[#C02628]/10 flex items-center justify-center">
                              <div className="h-2 w-2 bg-[#C02628] rounded-full" />
                            </div>
                          ) : (
                            <Square className="h-5 w-5 text-gray-400" />
                          )}
                          <span className="font-semibold text-gray-900">
                            {brand}
                          </span>
                          <span className="text-sm text-gray-500">
                            ({products.length} produk)
                          </span>
                          {migratedInBrand > 0 && (
                            <span className="text-sm text-[#C02628] font-medium">
                              ({migratedInBrand} sudah dimigrasi)
                            </span>
                          )}
                          {selectedInBrand > 0 && (
                            <span className="text-sm text-[#C02628] font-medium">
                              ({selectedInBrand} dipilih)
                            </span>
                          )}
                        </div>
                      </button>
                      {availableSkus.length > 0 && (
                        <button
                          onClick={() => toggleBrandSelection(brand)}
                          className="text-sm text-[#C02628] hover:text-[#B02122] font-medium"
                        >
                          {allSelected ? "Batal Pilih Semua" : "Pilih Semua"}
                        </button>
                      )}
                    </div>

                    {/* Products in Brand */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="ml-6 space-y-2"
                        >
                          {products.map((product) => {
                            const isSelected = selectedProducts.has(
                              product.buyer_sku_code
                            );
                            const isMigrated =
                              migrationStatus[product.buyer_sku_code]
                                ?.isMigrated;
                            const isDisabled = isMigrated;
                            return (
                              <motion.div
                                key={product.buyer_sku_code}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className={`p-3 rounded-lg border transition-all ${
                                  isMigrated
                                    ? "border-[#C02628]/30 bg-[#C02628]/5 opacity-75"
                                    : isSelected
                                    ? "border-[#C02628]/30 bg-[#C02628]/10"
                                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <button
                                    onClick={() =>
                                      toggleProductSelection(
                                        product.buyer_sku_code
                                      )
                                    }
                                    className="flex-shrink-0"
                                    disabled={isDisabled}
                                  >
                                    {isMigrated ? (
                                      <CheckCircle className="h-5 w-5 text-[#C02628]" />
                                    ) : isSelected ? (
                                      <CheckSquare className="h-5 w-5 text-[#C02628]" />
                                    ) : (
                                      <Square className="h-5 w-5 text-gray-400" />
                                    )}
                                  </button>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <h4 className="font-medium text-gray-900 truncate">
                                        {product.product_name}
                                      </h4>
                                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                        {product.buyer_sku_code}
                                      </span>
                                      {isMigrated && (
                                        <span className="text-xs bg-[#C02628]/10 text-[#C02628] px-2 py-1 rounded">
                                          Sudah Dimigrasi
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-gray-600">
                                      <span>Kategori: {product.category}</span>
                                      <span>Brand: {product.brand}</span>
                                      <span>Type: {product.type}</span>
                                      <span className="font-medium text-[#C02628]">
                                        Rp{" "}
                                        {product.price.toLocaleString("id-ID")}
                                      </span>
                                    </div>
                                    {product.desc && (
                                      <p className="text-xs text-gray-500 mt-1">
                                        {product.desc}
                                      </p>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 text-xs">
                                    <span
                                      className={`px-2 py-1 rounded ${
                                        product.buyer_product_status
                                          ? "bg-[#C02628]/10 text-[#C02628]"
                                          : "bg-red-100 text-red-800"
                                      }`}
                                    >
                                      {product.buyer_product_status
                                        ? "Aktif"
                                        : "Tidak Aktif"}
                                    </span>
                                    <span
                                      className={`px-2 py-1 rounded ${
                                        product.seller_product_status
                                          ? "bg-[#C02628]/10 text-[#C02628]"
                                          : "bg-red-100 text-red-800"
                                      }`}
                                    >
                                      {product.seller_product_status
                                        ? "Seller Aktif"
                                        : "Seller Tidak Aktif"}
                                    </span>
                                  </div>
                                </div>
                              </motion.div>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              }
            )}
          </div>
        )}

        {!loading && Object.keys(filteredGroupedProducts).length === 0 && (
          <div className="p-8 text-center text-gray-500">
            <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Tidak ada produk yang ditemukan</p>
            <p className="text-sm">Coba ubah filter pencarian</p>
          </div>
        )}
      </div>
    </div>
  );
}