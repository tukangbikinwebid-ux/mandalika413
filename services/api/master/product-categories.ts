import BaseApiService from "../base";
import type { ApiResponse } from "../base";

/** --- Interfaces --- */

export interface ProductCategory {
  id: number;
  name: string;
  code: string;
  description: string;
  status: boolean | number;
  created_at: string;
  updated_at: string;
}

export interface ProductCategoryParams {
  page?: number;
  paginate?: number;
  search?: string;
}

export type CreateProductCategoryRequest = Omit<
  ProductCategory,
  "id" | "created_at" | "updated_at"
>;

export type UpdateProductCategoryRequest =
  Partial<CreateProductCategoryRequest>;

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

class ProductCategoryService extends BaseApiService {
  // FIXED: Hapus slash di depan agar tidak double slash dengan baseURL
  private resource = "master/product-categories";

  async getAll(
    params?: ProductCategoryParams
  ): Promise<ApiResponse<PaginatedResult<ProductCategory>>> {
    const query = new URLSearchParams();

    if (params?.page) query.append("page", String(params.page));
    if (params?.paginate) query.append("paginate", String(params.paginate));
    if (params?.search) query.append("search", params.search);

    const queryString = query.toString();
    const endpoint = queryString
      ? `${this.resource}?${queryString}`
      : this.resource;

    return this.get<ApiResponse<PaginatedResult<ProductCategory>>>(endpoint);
  }

  async getById(id: number | string): Promise<ApiResponse<ProductCategory>> {
    return this.get<ApiResponse<ProductCategory>>(`${this.resource}/${id}`);
  }

  async create(
    payload: CreateProductCategoryRequest
  ): Promise<ApiResponse<ProductCategory>> {
    return this.post<ApiResponse<ProductCategory>>(this.resource, payload);
  }

  async update(
    id: number | string,
    payload: UpdateProductCategoryRequest
  ): Promise<ApiResponse<ProductCategory>> {
    return this.put<ApiResponse<ProductCategory>>(
      `${this.resource}/${id}`,
      payload
    );
  }

  async remove(id: number | string): Promise<ApiResponse<null>> {
    return this.delete<ApiResponse<null>>(`${this.resource}/${id}`);
  }
}

export const productCategoryService = new ProductCategoryService();