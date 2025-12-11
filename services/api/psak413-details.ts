import BaseApiService from "./base";
import type { ApiResponse } from "./base";
import type { PSAK413Detail, PSAK413DetailParams } from "@/lib/types/psak413-details";
import type { PaginatedResult } from "@/lib/types/psak413-imports";

class PSAK413DetailService extends BaseApiService {
  private resource = "psak413/details";

  /**
   * Get All Details with Pagination, Search, and Filters
   * URL: psak413/details?orderBy=...&psak413_import_id=...
   */
  async getAll(
    params?: PSAK413DetailParams
  ): Promise<ApiResponse<PaginatedResult<PSAK413Detail>>> {
    const query = new URLSearchParams();

    // Default values
    query.append("page", String(params?.page || 1));
    query.append("paginate", String(params?.paginate || 10));
    // Note: Default orderBy includes table name as requested
    query.append(
      "orderBy",
      params?.orderBy || "psak413_import_details.updated_at"
    );
    query.append("order", params?.order || "desc");

    // Optional filters
    if (params?.search) query.append("search", params.search);

    // Required filter for specific import details
    if (params?.psak413_import_id) {
      query.append("psak413_import_id", params.psak413_import_id);
    }

    return this.get<ApiResponse<PaginatedResult<PSAK413Detail>>>(
      `${this.resource}?${query.toString()}`
    );
  }

  /**
   * Get Detail by ID
   * URL: psak413/details/:id
   */
  async getById(id: number | string): Promise<ApiResponse<PSAK413Detail>> {
    return this.get<ApiResponse<PSAK413Detail>>(`${this.resource}/${id}`);
  }
}

export const psak413DetailService = new PSAK413DetailService();