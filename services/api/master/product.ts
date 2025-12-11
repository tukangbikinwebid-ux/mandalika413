import BaseApiService from "../base";
import type { ApiResponse } from "../base";

/** --- Interfaces --- */

// Interface Utama Product
export interface Product {
  id: number;
  product_category_id: number;
  name: string;
  code: string;
  description: string;
  status: boolean | number;
  created_at: string;
  updated_at: string;
  // Field tambahan dari relation (biasanya ada di response GET ALL)
  product_category_name?: string;
  product_category_code?: string;
}

// Interface untuk Parameter Query
export interface ProductParams {
  page?: number;
  paginate?: number;
  search?: string;
  product_category_id?: number | string; // Tambahan opsional jika ingin filter by category
}

// Interface untuk Payload Create
// Omit field yang auto-generated atau read-only
export type CreateProductRequest = Omit<
  Product,
  | "id"
  | "created_at"
  | "updated_at"
  | "product_category_name"
  | "product_category_code"
>;

// Interface untuk Payload Update
export type UpdateProductRequest = Partial<CreateProductRequest>;

// Interface untuk Response Pagination
export interface PaginatedResult<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from?: number;
  to?: number;
}

/** --- Service Class --- */

class ProductService extends BaseApiService {
  // Tidak pakai slash di depan agar aman saat digabung dengan baseURL
  private resource = "master/products";

  /**
   * Get All Data dengan Pagination dan Search
   * URL: /master/products?paginate=10&search=&page=1
   */
  async getAll(
    params?: ProductParams
  ): Promise<ApiResponse<PaginatedResult<Product>>> {
    const query = new URLSearchParams();

    if (params?.page) query.append("page", String(params.page));
    if (params?.paginate) query.append("paginate", String(params.paginate));
    if (params?.search) query.append("search", params.search);
    // Jika backend mendukung filter by category_id
    if (params?.product_category_id) {
      query.append("product_category_id", String(params.product_category_id));
    }

    const queryString = query.toString();
    const endpoint = queryString
      ? `${this.resource}?${queryString}`
      : this.resource;

    return this.get<ApiResponse<PaginatedResult<Product>>>(endpoint);
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