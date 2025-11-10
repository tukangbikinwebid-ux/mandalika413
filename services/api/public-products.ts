import BaseApiService from './base';
import { ApiResponse } from '@/lib/types';

// Public API types for products
export interface PublicProduct {
  id: number;
  product_category_id: number;
  name: string;
  slug: string;
  sku: string;
  description: string;
  buy_price: string;
  sell_price: string;
  status: number;
  created_at: string;
  updated_at: string;
  category_title: string;
  category_sub_title: string | null;
  parent_category_title: string;
  parent_category_sub_title: string | null;
  image: string;
}

export interface PublicProductPaginatedResponse {
  current_page: number;
  data: PublicProduct[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: Array<{
    url: string | null;
    label: string;
    page: number | null;
    active: boolean;
  }>;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

export interface PublicProductParams {
  page?: number;
  paginate?: number;
  search?: string;
  status?: number;
  product_category_id?: number;
}

class PublicProductsService extends BaseApiService {
  constructor() {
    super();
    // Override base URL for public API
    this.baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api-topup.naditechno.id/api/v1';
  }

  async getProducts(params?: PublicProductParams): Promise<ApiResponse<PublicProductPaginatedResponse>> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.paginate) queryParams.append('paginate', params.paginate.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.status !== undefined) queryParams.append('status', params.status.toString());
    if (params?.product_category_id !== undefined) queryParams.append('product_category_id', params.product_category_id.toString());
    
    const endpoint = `public/products${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.get<ApiResponse<PublicProductPaginatedResponse>>(endpoint);
  }

  async getProduct(slug: string): Promise<ApiResponse<PublicProduct>> {
    return this.get<ApiResponse<PublicProduct>>(`public/products/${slug}`);
  }
}

export const publicProductsService = new PublicProductsService();
