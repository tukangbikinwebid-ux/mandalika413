import BaseApiService from './base';
import { ApiResponse } from '@/lib/types';
import { 
  Product, 
  CreateProductRequest, 
  UpdateProductRequest,
  ProductPaginationParams,
  ProductPaginatedResponse
} from '@/lib/types';

// Re-export types
export type { 
  Product, 
  CreateProductRequest, 
  UpdateProductRequest,
  ProductPaginationParams,
  ProductPaginatedResponse
};

class ProductsService extends BaseApiService {
  async getProducts(params?: ProductPaginationParams): Promise<ApiResponse<ProductPaginatedResponse>> {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.paginate) query.append('paginate', params.paginate.toString());
    if (params?.search) query.append('search', params.search);
    if (params?.product_category_id) query.append('product_category_id', params.product_category_id.toString());
    return this.get<ApiResponse<ProductPaginatedResponse>>(`master/products?${query.toString()}`);
  }

  async getProduct(slug: string): Promise<ApiResponse<Product>> {
    return this.get<ApiResponse<Product>>(`master/products/${slug}`);
  }

  async createProduct(data: CreateProductRequest): Promise<ApiResponse<Product>> {
    const formData = new FormData();
    
    console.log('Creating FormData with:', data); // Debug log
    
    formData.append('product_category_id', data.product_category_id.toString());
    formData.append('name', data.name);
    formData.append('sku', data.sku);
    if (data.description) formData.append('description', data.description);
    formData.append('buy_price', data.buy_price.toString());
    formData.append('sell_price', data.sell_price.toString());
    formData.append('status', data.status.toString());
    
    if (data.image) {
      formData.append('image', data.image);
    }

    console.log('FormData entries:'); // Debug log
    for (const [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }

    return this.request<ApiResponse<Product>>('master/products', {
      method: 'POST',
      body: formData,
      headers: {
        // Don't set Content-Type for FormData, let browser set it with boundary
      },
    });
  }

  async updateProduct(data: UpdateProductRequest): Promise<ApiResponse<Product>> {
    const formData = new FormData();
    
    // Add _method=PUT for Laravel
    formData.append('_method', 'PUT');

    if (data.product_category_id !== undefined) formData.append('product_category_id', data.product_category_id.toString());
    if (data.name) formData.append('name', data.name);
    if (data.sku) formData.append('sku', data.sku);
    if (data.description !== undefined) formData.append('description', data.description || '');
    if (data.buy_price !== undefined) formData.append('buy_price', data.buy_price.toString());
    if (data.sell_price !== undefined) formData.append('sell_price', data.sell_price.toString());
    if (data.status !== undefined) formData.append('status', data.status.toString());
    
    if (data.image) {
      formData.append('image', data.image);
    }

    return this.request<ApiResponse<Product>>(`master/products/${data.slug}`, {
      method: 'POST', // Use POST with _method=PUT for Laravel
      body: formData,
      headers: {
        // Don't set Content-Type for FormData
      },
    });
  }

  async deleteProduct(slug: string): Promise<ApiResponse<null>> {
    return this.request<ApiResponse<null>>(`master/products/${slug}`, {
      method: 'DELETE',
    });
  }
}

export const productsService = new ProductsService();
