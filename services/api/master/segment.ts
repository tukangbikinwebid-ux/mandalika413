import BaseApiService from "../base";
import type { ApiResponse } from "../base";

/** --- Interfaces --- */

// Interface Utama Segment
export interface Segment {
  id: number;
  name: string;
  product_id: number;
  pd: number; // Probability of Default
  lgd: number; // Loss Given Default
  description: string;
  status: boolean | number;
  created_at: string;
  updated_at: string;
  // Field tambahan dari relation (read-only)
  product_name: string;
  product_code: string;
  product_category_name: string;
  product_category_code: string;
}

// Interface untuk Parameter Query
export interface SegmentParams {
  page?: number;
  paginate?: number;
  search?: string;
  product_id?: number | string; // Filter berdasarkan Product ID
}

// Interface untuk Payload Create
// Omit field yang auto-generated atau read-only dari relasi
export type CreateSegmentRequest = Omit<
  Segment,
  | "id"
  | "created_at"
  | "updated_at"
  | "product_name"
  | "product_code"
  | "product_category_name"
  | "product_category_code"
>;

// Interface untuk Payload Update
export type UpdateSegmentRequest = Partial<CreateSegmentRequest>;

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

class SegmentService extends BaseApiService {
  // Resource path tanpa slash di depan untuk menghindari double slash
  private resource = "master/segments";

  /**
   * Get All Data dengan Pagination, Search, dan Filter
   * URL: /master/segments?paginate=10&search=&page=1&product_id=...
   */
  async getAll(
    params?: SegmentParams
  ): Promise<ApiResponse<PaginatedResult<Segment>>> {
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

    return this.get<ApiResponse<PaginatedResult<Segment>>>(endpoint);
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