import BaseApiService from './base';
import { ApiResponse } from '@/lib/types';

// Public API types (without authentication)
export interface PublicProductCategory {
  id: number;
  parent_id: number | null;
  title: string;
  sub_title: string | null;
  slug: string;
  digiflazz_code: string | null;
  must_fill_game_id: boolean;
  must_fill_zone_id: boolean;
  description: string | null;
  status: number;
  created_at: string;
  updated_at: string;
  parent_title: string | null;
  parent_sub_title: string | null;
  image: string | null;
  media: Array<{
    id: number;
    model_type: string;
    model_id: number;
    uuid: string;
    collection_name: string;
    name: string;
    file_name: string;
    mime_type: string;
    disk: string;
    conversions_disk: string;
    size: number;
    order_column: number;
    created_at: string;
    updated_at: string;
    original_url: string;
    preview_url: string;
  }>;
}

export interface PublicProductCategoryPaginatedResponse {
  current_page: number;
  data: PublicProductCategory[];
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

export interface PublicProductCategoryParams {
  page?: number;
  paginate?: number;
  search?: string;
  status?: number;
  is_parent?: number;
  parent_id?: number;
}

class PublicProductCategoriesService extends BaseApiService {
  constructor() {
    super();
    // Override base URL for public API
    this.baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api-topup.naditechno.id/api/v1';
  }

  async getProductCategories(params?: PublicProductCategoryParams): Promise<ApiResponse<PublicProductCategoryPaginatedResponse>> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.paginate) queryParams.append('paginate', params.paginate.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.status !== undefined) queryParams.append('status', params.status.toString());
    if (params?.is_parent !== undefined) queryParams.append('is_parent', params.is_parent.toString());
    if (params?.parent_id !== undefined) queryParams.append('parent_id', params.parent_id.toString());
    
    const endpoint = `public/product-categories${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.get<ApiResponse<PublicProductCategoryPaginatedResponse>>(endpoint);
  }

  async getProductCategory(slug: string): Promise<ApiResponse<PublicProductCategory>> {
    return this.get<ApiResponse<PublicProductCategory>>(`public/product-categories/${slug}`);
  }
}

export const publicProductCategoriesService = new PublicProductCategoriesService();
