import BaseApiService from "../base";
import type { ApiResponse } from "../base";

/** --- Interfaces --- */

// Interface untuk ProductCategory dalam response Product
export interface ProductCategoryRelation {
  id: number;
  name: string;
  code: string;
  description: string;
  status: boolean | number | string;
  created_at: string;
  updated_at: string;
  Products?: unknown;
}

// Interface Utama Product
export interface Product {
  id: number;
  product_category_id: number;
  name: string;
  code: string;
  description: string;
  status: boolean | number | string;
  created_at: string;
  updated_at: string;
  // Field relation dari API
  ProductCategory?: ProductCategoryRelation | null;
  Segments?: unknown;
}

// Interface untuk Parameter Query
export interface ProductParams {
  page?: number;
  paginate?: number;
  search?: string;
  order_by?: string;
  order?: "asc" | "desc";
  product_category_id?: number | string;
}

// Interface untuk Payload Create
export interface CreateProductRequest {
  product_category_id?: number;
  code: string;
  name: string;
  description?: string;
  status: string; // "1" or "0"
}

// Interface untuk Payload Update
export type UpdateProductRequest = Partial<CreateProductRequest>;

// Interface untuk Pagination Meta
export interface PaginationMeta {
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
  next_page: number;
  prev_page: number;
  data: Product[];
}

// Interface untuk Paginated Result
export interface PaginatedResult {
  pagination: PaginationMeta;
}

/** --- Service Class --- */

class ProductService extends BaseApiService {
  // Tidak pakai slash di depan agar aman saat digabung dengan baseURL
  private resource = "master/products";

  /**
   * Get All Data dengan Pagination dan Search
   * URL: /master/products?paginate=10&search=&page=1&order_by=created_at&order=desc
   */
  async getAll(
    params?: ProductParams
  ): Promise<ApiResponse<PaginatedResult>> {
    const query = new URLSearchParams();

    if (params?.page) query.append("page", String(params.page));
    if (params?.paginate) query.append("paginate", String(params.paginate));
    if (params?.search) query.append("search", params.search);
    if (params?.order_by) query.append("order_by", params.order_by);
    if (params?.order) query.append("order", params.order);
    if (params?.product_category_id) {
      query.append("product_category_id", String(params.product_category_id));
    }

    const queryString = query.toString();
    const endpoint = queryString
      ? `${this.resource}?${queryString}`
      : this.resource;

    return this.get<ApiResponse<PaginatedResult>>(endpoint);
  }

  /**
   * Get Detail by ID
   * URL: /master/products/:id
   */
  async getById(id: number | string): Promise<ApiResponse<Product>> {
    return this.get<ApiResponse<Product>>(`${this.resource}/${id}`);
  }

  /**
   * Create New Product
   * URL: /master/products (POST)
   */
  async create(payload: CreateProductRequest): Promise<ApiResponse<Product>> {
    return this.post<ApiResponse<Product>>(this.resource, payload);
  }

  /**
   * Update Product
   * URL: /master/products/:id (PUT)
   */
  async update(
    id: number | string,
    payload: UpdateProductRequest
  ): Promise<ApiResponse<Product>> {
    return this.put<ApiResponse<Product>>(`${this.resource}/${id}`, payload);
  }

  /**
   * Delete Product
   * URL: /master/products/:id (DELETE)
   */
  async remove(id: number | string): Promise<ApiResponse<null>> {
    return this.delete<ApiResponse<null>>(`${this.resource}/${id}`);
  }
}

export const productService = new ProductService();