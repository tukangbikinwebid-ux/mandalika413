// services/api/psak413/import-service.ts

import BaseApiService from "./base"; 
import type { ApiResponse } from "./base";
import type {
  PSAK413Import,
  PSAK413ImportParams,
  PaginatedResult,
  CreateImportRequest,
  ImportErrorsResponse,
  ImportErrorsParams,
} from "@/lib/types/psak413-imports";

class PSAK413ImportService extends BaseApiService {
  private resource = "psak413/imports";

  async getAll(
    params?: PSAK413ImportParams
  ): Promise<ApiResponse<PaginatedResult<PSAK413Import>>> {
    const query = new URLSearchParams();

    // Default values
    query.append("page", String(params?.page || 1));
    query.append("paginate", String(params?.paginate || 10));
    query.append("orderBy", params?.orderBy || "updated_at");
    query.append("order", params?.order || "desc");

    // Optional filters
    if (params?.search) query.append("search", params.search);
    if (params?.is_processing !== undefined)
      query.append("is_processing", String(params.is_processing));
    if (params?.is_finished !== undefined)
      query.append("is_finished", String(params.is_finished));

    // Date filters
    if (params?.imported_at_from)
      query.append("imported_at_from", params.imported_at_from);
    if (params?.imported_at_to)
      query.append("imported_at_to", params.imported_at_to);
    if (params?.processed_at_from)
      query.append("processed_at_from", params.processed_at_from);
    if (params?.processed_at_to)
      query.append("processed_at_to", params.processed_at_to);
    if (params?.finished_at_from)
      query.append("finished_at_from", params.finished_at_from);
    if (params?.finished_at_to)
      query.append("finished_at_to", params.finished_at_to);

    return this.get<ApiResponse<PaginatedResult<PSAK413Import>>>(
      `${this.resource}?${query.toString()}`
    );
  }

  async getById(id: string): Promise<ApiResponse<PSAK413Import>> {
    return this.get<ApiResponse<PSAK413Import>>(`${this.resource}/${id}`);
  }

  async create(data: CreateImportRequest): Promise<ApiResponse<PSAK413Import>> {
    const formData = new FormData();
    formData.append("file", data.file);

    return this.request<ApiResponse<PSAK413Import>>(
      this.resource,
      {
        method: "POST",
        body: formData,
      }
    );
  }

  async deleteImport(id: string): Promise<ApiResponse<null>> {
    return this.delete<ApiResponse<null>>(`${this.resource}/${id}`);
  }

  async getErrors(
    id: string | number,
    params?: ImportErrorsParams
  ): Promise<ApiResponse<ImportErrorsResponse>> {
    const query = new URLSearchParams();
    query.append("page", String(params?.page || 1));
    query.append("paginate", String(params?.paginate || 50));

    return this.get<ApiResponse<ImportErrorsResponse>>(
      `${this.resource}/${id}/errors?${query.toString()}`
    );
  }

  getTemplateExcelUrl(): string {
    return "https://api-psak.naditechno.id/template-psak413.xlsx";
    // return "http://127.0.0.1:8000/template-psak413.xlsx";
  }

  getTemplateCsvUrl(): string {
    return "https://api-psak.naditechno.id/template-psak413.csv";
    // return "http://127.0.0.1:8000/template-psak413.csv";
  }

  downloadTemplate(type: "excel" | "csv"): void {
    const url =
      type === "excel" ? this.getTemplateExcelUrl() : this.getTemplateCsvUrl();
    window.open(url, "_blank");
  }
}

export const psak413ImportService = new PSAK413ImportService();