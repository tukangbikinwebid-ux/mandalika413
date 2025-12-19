import BaseApiService from "../base";
import type { ApiResponse } from "../base";

/** --- Interfaces --- */

// Interface Utama Stage
export interface Stage {
  id: number;
  product_id?: number;
  description: string;
  stage: number;
  range_from: number;
  range_to: number;
  status: boolean | number; // Updated to accept number (0/1) from backend commonly
  created_at: string;
  updated_at: string;
  // Field tambahan dari relation (read-only)
  product_name: string;
  product_code: string;
  product_category_name: string;
  product_category_code: string;
}

// Interface untuk Parameter Query
export interface StageParams {
  page?: number;
  paginate?: number;
  search?: string;
  product_id?: number | string; // Filter berdasarkan Product ID
}

// Interface untuk Payload Create
// Omit field yang auto-generated atau read-only dari relasi
export type CreateStageRequest = Omit<
  Stage,
  | "id"
  | "created_at"
  | "updated_at"
  | "product_name"
  | "product_code"
  | "product_category_name"
  | "product_category_code"
>;

// Interface untuk Payload Update
export type UpdateStageRequest = Partial<CreateStageRequest>;

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

class StageService extends BaseApiService {
  // Resource path (tanpa slash di depan)
  private resource = "master/stages";

  /**
   * Get All Data dengan Pagination, Search, dan Filter
   * URL: /master/stages?paginate=10&search=&page=1&product_id=...
   */
  async getAll(
    params?: StageParams
  ): Promise<ApiResponse<PaginatedResult<Stage>>> {
    const query = new URLSearchParams();

    if (params?.page) query.append("page", String(params.page));
    if (params?.paginate) query.append("paginate", String(params.paginate));
    if (params?.search) query.append("search", params.search);

    // Filter by product_id jika ada
    if (params?.product_id) {
      query.append("product_id", String(params.product_id));
    }

    const queryString = query.toString();
    const endpoint = queryString
      ? `${this.resource}?${queryString}`
      : this.resource;

    return this.get<ApiResponse<PaginatedResult<Stage>>>(endpoint);
  }

  /**
   * Get Detail by ID
   * URL: /master/stages/:id
   */
  async getById(id: number | string): Promise<ApiResponse<Stage>> {
    return this.get<ApiResponse<Stage>>(`${this.resource}/${id}`);
  }

  /**
   * Create New Stage
   * URL: /master/stages (POST)
   */
  async create(payload: CreateStageRequest): Promise<ApiResponse<Stage>> {
    return this.post<ApiResponse<Stage>>(this.resource, payload);
  }

  /**
   * Update Stage
   * URL: /master/stages/:id (PUT)
   */
  async update(
    id: number | string,
    payload: UpdateStageRequest
  ): Promise<ApiResponse<Stage>> {
    return this.put<ApiResponse<Stage>>(`${this.resource}/${id}`, payload);
  }

  /**
   * Delete Stage
   * URL: /master/stages/:id (DELETE)
   */
  async remove(id: number | string): Promise<ApiResponse<null>> {
    return this.delete<ApiResponse<null>>(`${this.resource}/${id}`);
  }
}

export const stageService = new StageService();