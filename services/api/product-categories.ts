import BaseApiService from './base';
import { ApiResponse } from '@/lib/types';
import { 
  ProductCategory, 
  CreateProductCategoryRequest, 
  UpdateProductCategoryRequest,
  ProductCategoryPaginationParams,
  ProductCategoryPaginatedResponse
} from '@/lib/types';

// Re-export types
export type { 
  ProductCategory, 
  CreateProductCategoryRequest, 
  UpdateProductCategoryRequest,
  ProductCategoryPaginationParams,
  ProductCategoryPaginatedResponse
};

class ProductCategoriesService extends BaseApiService {
  async getProductCategories(params?: ProductCategoryPaginationParams): Promise<ApiResponse<ProductCategoryPaginatedResponse>> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.paginate) queryParams.append('paginate', params.paginate.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.status !== undefined) queryParams.append('status', params.status.toString());
    if (params?.is_parent !== undefined) queryParams.append('is_parent', params.is_parent.toString());
    if (params?.parent_id !== undefined) queryParams.append('parent_id', params.parent_id.toString());
    
    const endpoint = `master/product-categories${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.get<ApiResponse<ProductCategoryPaginatedResponse>>(endpoint);
  }

  async getProductCategory(slug: string): Promise<ApiResponse<ProductCategory>> {
    return this.get<ApiResponse<ProductCategory>>(`master/product-categories/${slug}`);
  }

  async createProductCategory(data: CreateProductCategoryRequest): Promise<ApiResponse<ProductCategory>> {
    const formData = new FormData();
    
    console.log('Creating FormData with:', data);
    
    // Add text fields
    if (data.parent_id !== undefined) formData.append('parent_id', data.parent_id?.toString() || '');
    formData.append('title', data.title);
    if (data.sub_title) formData.append('sub_title', data.sub_title);
    if (data.description) formData.append('description', data.description);
    formData.append('status', data.status.toString());
    if (data.digiflazz_code) formData.append('digiflazz_code', data.digiflazz_code);
    if (data.must_fill_game_id !== undefined) formData.append('must_fill_game_id', data.must_fill_game_id ? '1' : '0');
    if (data.must_fill_zone_id !== undefined) formData.append('must_fill_zone_id', data.must_fill_zone_id ? '1' : '0');
    
    // Add image file if provided
    if (data.image) {
      formData.append('image', data.image);
    }

    // Log FormData contents
    console.log('FormData entries:');
    for (const [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }

    return this.request<ApiResponse<ProductCategory>>('master/product-categories', {
      method: 'POST',
      body: formData,
      headers: {
        // Don't set Content-Type for FormData, let browser set it with boundary
      },
    });
  }

  async updateProductCategory(data: UpdateProductCategoryRequest): Promise<ApiResponse<ProductCategory>> {
    const formData = new FormData();
    
    // Add _method=PUT for Laravel
    formData.append('_method', 'PUT');
    
    // Add text fields
    if (data.parent_id !== undefined) formData.append('parent_id', data.parent_id?.toString() || '');
    if (data.title) formData.append('title', data.title);
    if (data.sub_title !== undefined) formData.append('sub_title', data.sub_title || '');
    if (data.description !== undefined) formData.append('description', data.description || '');
    if (data.status !== undefined) formData.append('status', data.status.toString());
    if (data.digiflazz_code !== undefined) formData.append('digiflazz_code', data.digiflazz_code || '');
    if (data.must_fill_game_id !== undefined) formData.append('must_fill_game_id', data.must_fill_game_id ? '1' : '0');
    if (data.must_fill_zone_id !== undefined) formData.append('must_fill_zone_id', data.must_fill_zone_id ? '1' : '0');
    
    // Add image file if provided
    if (data.image) {
      formData.append('image', data.image);
    }

    return this.request<ApiResponse<ProductCategory>>(`master/product-categories/${data.slug}`, {
      method: 'POST',
      body: formData,
      headers: {
        // Don't set Content-Type for FormData, let browser set it with boundary
      },
    });
  }

  async deleteProductCategory(slug: string): Promise<ApiResponse<void>> {
    return this.delete<ApiResponse<void>>(`master/product-categories/${slug}`);
  }
}

export const productCategoriesService = new ProductCategoriesService();
