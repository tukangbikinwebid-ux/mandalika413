import BaseApiService from "../base";
import type { ApiResponse } from "../base";

/** --- Interfaces --- */

// Interface untuk Product relation dalam Segment
import type { Product } from "./product";

// Interface Utama Segment
export interface Segment {
  id: number;
  name: string;
  product_id: number;
  pd: number; // Probability of Default
  lgd: number; // Loss Given Default
  description: string;
  status: boolean | number | string;
  created_at: string;
  updated_at: string;
  // Field relation dari API
  Product?: Product | null;
}

// Interface untuk Parameter Query
export interface SegmentParams {
  page?: number;
  paginate?: number;
  search?: string;
  order_by?: string;
  order?: "asc" | "desc";
  product_id?: number | string;
}

// Interface untuk Payload Create
export interface CreateSegmentRequest {
  name: string;
  product_id: number;
  pd: string; // String format untuk API
  lgd: string; // String format untuk API
  description?: string;
  status: string; // "1" or "0"
}

// Interface untuk Payload Update
export type UpdateSegmentRequest = Partial<CreateSegmentRequest>;

// Interface untuk Pagination Meta
export interface PaginationMeta {
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
  next_page: number;
  prev_page: number;
  data: Segment[];
}

// Interface untuk Paginated Result
export interface PaginatedResult {
  pagination: PaginationMeta;
}

/** --- Service Class --- */

class SegmentService extends BaseApiService {
  // Resource path tanpa slash di depan untuk menghindari double slash
  private resource = "master/segments";

  /**
   * Get All Data dengan Pagination, Search, dan Filter
   * URL: /master/segments?paginate=10&search=&page=1&order_by=created_at&order=desc
   */
  async getAll(
    params?: SegmentParams
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
   * URL: /master/segments/:id
   */
  async getById(id: number | string): Promise<ApiResponse<Segment>> {
    return this.get<ApiResponse<Segment>>(`${this.resource}/${id}`);
  }

  /**
   * Create New Segment
   * URL: /master/segments (POST)
   */
  async create(payload: CreateSegmentRequest): Promise<ApiResponse<Segment>> {
    return this.post<ApiResponse<Segment>>(this.resource, payload);
  }

  /**
   * Update Segment
   * URL: /master/segments/:id (PUT)
   */
  async update(
    id: number | string,
    payload: UpdateSegmentRequest
  ): Promise<ApiResponse<Segment>> {
    return this.put<ApiResponse<Segment>>(`${this.resource}/${id}`, payload);
  }

  /**
   * Delete Segment
   * URL: /master/segments/:id (DELETE)
   */
  async remove(id: number | string): Promise<ApiResponse<null>> {
    return this.delete<ApiResponse<null>>(`${this.resource}/${id}`);
  }
}

export const segmentService = new SegmentService();