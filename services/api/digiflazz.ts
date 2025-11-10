import BaseApiService from './base';
import { ApiResponse } from '@/lib/types';

// Digiflazz API types based on the migration.md response
export interface DigiflazzProduct {
  product_name: string;
  category: string;
  brand: string;
  type: string;
  seller_name: string;
  price: number;
  buyer_sku_code: string;
  buyer_product_status: boolean;
  seller_product_status: boolean;
  unlimited_stock: boolean;
  stock: number;
  multi: boolean;
  start_cut_off: string;
  end_cut_off: string;
  desc: string;
}

// The API response is already in ApiResponse format, so we don't need a separate interface

// Grouped products by brand for UI display
export interface GroupedDigiflazzProducts {
  [brand: string]: DigiflazzProduct[];
}

class DigiflazzService extends BaseApiService {
  constructor() {
    super();
    // Use the same base URL as other services since Digiflazz API is part of the main API
  }

  async getProducts(): Promise<ApiResponse<DigiflazzProduct[]>> {
    try {
      // Use the BaseApiService request method which handles authentication automatically
      // The API returns the data in ApiResponse<DigiflazzProduct[]> format
      return this.get<ApiResponse<DigiflazzProduct[]>>('digiflazz/prepaid/products?code=*');
    } catch (error) {
      console.error('Error fetching Digiflazz products:', error);
      throw new Error('Failed to fetch Digiflazz products');
    }
  }

  // Helper method to group products by brand
  groupProductsByBrand(products: DigiflazzProduct[]): GroupedDigiflazzProducts {
    return products.reduce((grouped, product) => {
      const brand = product.brand;
      if (!grouped[brand]) {
        grouped[brand] = [];
      }
      grouped[brand].push(product);
      return grouped;
    }, {} as GroupedDigiflazzProducts);
  }

  // Helper method to filter products by category
  filterProductsByCategory(products: DigiflazzProduct[], category: string): DigiflazzProduct[] {
    return products.filter(product => 
      product.category.toLowerCase().includes(category.toLowerCase())
    );
  }

  // Helper method to filter products by brand
  filterProductsByBrand(products: DigiflazzProduct[], brand: string): DigiflazzProduct[] {
    return products.filter(product => 
      product.brand.toLowerCase().includes(brand.toLowerCase())
    );
  }

  // Helper method to get unique categories from products
  getUniqueCategories(products: DigiflazzProduct[]): string[] {
    return [...new Set(products.map(product => product.category))];
  }

  // Helper method to get unique brands from products
  getUniqueBrands(products: DigiflazzProduct[]): string[] {
    return [...new Set(products.map(product => product.brand))];
  }
}

export const digiflazzService = new DigiflazzService();
