import BaseApiService from "../base";
import type { ApiResponse } from "../base";

/** --- Interfaces --- */

// Interface untuk Product relation dalam Stage
import type { Product } from "./product";

// Interface Utama Stage
export interface Stage {
  id: number;
  product_id?: number;
  description: string;
  stage: number;
  range_from: number;
  range_to: number;
  status: boolean | number | string;
  created_at: string;
  updated_at: string;
  // Field relation dari API
  Product?: Product | null;
}

// Interface untuk Parameter Query
export interface StageParams {
  page?: number;
  paginate?: number;
  search?: string;
  order_by?: string;
  order?: "asc" | "desc";
  product_id?: number | string;
}

// Interface untuk Payload Create
export interface CreateStageRequest {
  product_id?: number;
  stage: string; // String format untuk API
  range_from: string; // String format untuk API
  range_to: string; // String format untuk API
  description?: string;
  status: string; // "1" or "0"
}

// Interface untuk Payload Update
export type UpdateStageRequest = Partial<CreateStageRequest>;

// Interface untuk Pagination Meta
export interface PaginationMeta {
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
  next_page: number;
  prev_page: number;
  data: Stage[];
}

// Interface untuk Paginated Result
export interface PaginatedResult {
  pagination: PaginationMeta;
}

/** --- Service Class --- */

class StageService extends BaseApiService {
  // Resource path (tanpa slash di depan)
  private resource = "master/stages";

  /**
   * Get All Data dengan Pagination, Search, dan Filter
   * URL: /master/stages?paginate=10&search=&page=1&order_by=created_at&order=desc
   */
  async getAll(
    params?: StageParams
  ): Promise<ApiResponse<PaginatedResult>> {
    const query = new URLSearchParams();

    if (params?.page) query.append("page", String(params.page));
    if (params?.paginate) query.append("paginate", String(params.paginate));
    if (params?.search) query.append("search", params.search);
    if (params?.order_by) query.append("order_by", params.order_by);
    if (params?.order) query.append("order", params.order);
    if (params?.product_id) {
      query.append("product_id", String(params.product_id));
    }

    const queryString = query.toString();
    const endpoint = queryString
      ? `${this.resource}?${queryString}`
      : this.resource;

    return this.get<ApiResponse<PaginatedResult>>(endpoint);
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