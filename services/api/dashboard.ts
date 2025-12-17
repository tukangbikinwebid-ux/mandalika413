import BaseApiService from "./base";
import type { ApiResponse } from "./base";
import type {
  DashboardParams,
  TotalEclData,
  EclPerStageData,
  EclPerSegmentData,
  EclPerProductData,
  TotalEclPerBranch, // Pastikan interface ini sudah ada di file types
} from "@/lib/types/dashboard";

class DashboardService extends BaseApiService {
  private resource = "dashboard";

  /**
   * Helper to construct query params
   */
  private buildQuery(params?: DashboardParams): string {
    const query = new URLSearchParams();
    if (params?.from_date) query.append("from_date", params.from_date);
    if (params?.to_date) query.append("to_date", params.to_date);
    return query.toString();
  }

  /**
   * Get Total ECL
   * URL: dashboard/total-ecl?from_date=...&to_date=...
   */
  async getTotalEcl(
    params?: DashboardParams
  ): Promise<ApiResponse<TotalEclData>> {
    const queryString = this.buildQuery(params);
    return this.get<ApiResponse<TotalEclData>>(
      `${this.resource}/total-ecl${queryString ? `?${queryString}` : ""}`
    );
  }

  /**
   * Get Total ECL per Stage
   * URL: dashboard/ecl-per-stage?from_date=...&to_date=...
   */
  async getEclPerStage(
    params?: DashboardParams
  ): Promise<ApiResponse<EclPerStageData[]>> {
    const queryString = this.buildQuery(params);
    return this.get<ApiResponse<EclPerStageData[]>>(
      `${this.resource}/ecl-per-stage${queryString ? `?${queryString}` : ""}`
    );
  }

  /**
   * Get Total ECL per Segment
   * URL: dashboard/ecl-per-segment?from_date=...&to_date=...
   */
  async getEclPerSegment(
    params?: DashboardParams
  ): Promise<ApiResponse<EclPerSegmentData[]>> {
    const queryString = this.buildQuery(params);
    return this.get<ApiResponse<EclPerSegmentData[]>>(
      `${this.resource}/ecl-per-segment${queryString ? `?${queryString}` : ""}`
    );
  }

  /**
   * Get Total ECL per Product
   * URL: dashboard/ecl-per-product?from_date=...&to_date=...
   */
  async getEclPerProduct(
    params?: DashboardParams
  ): Promise<ApiResponse<EclPerProductData[]>> {
    const queryString = this.buildQuery(params);
    return this.get<ApiResponse<EclPerProductData[]>>(
      `${this.resource}/ecl-per-product${queryString ? `?${queryString}` : ""}`
    );
  }

  /**
   * Get Total ECL per Branch
   * URL: dashboard/ecl-per-branch?from_date=...&to_date=...
   */
  async getEclPerBranch(
    params?: DashboardParams
  ): Promise<ApiResponse<TotalEclPerBranch[]>> {
    const queryString = this.buildQuery(params);
    return this.get<ApiResponse<TotalEclPerBranch[]>>(
      `${this.resource}/ecl-per-branch${queryString ? `?${queryString}` : ""}`
    );
  }
}

export const dashboardService = new DashboardService();