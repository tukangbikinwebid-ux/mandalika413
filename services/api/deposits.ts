import BaseApiService, { ApiResponse } from './base';
import {
  Deposit,
  CreateDepositRequest,
  UpdateDepositRequest,
  DepositPaginationParams,
  DepositPaginatedResponse,
} from '@/lib/types/deposits';

class DepositsService extends BaseApiService {
  private endpoint = 'digiflazz/deposit';

  // Get all deposits with pagination
  async getDeposits(params?: DepositPaginationParams): Promise<ApiResponse<DepositPaginatedResponse>> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.sort) queryParams.append('sort', params.sort);
    if (params?.order) queryParams.append('order', params.order);

    const queryString = queryParams.toString();
    const url = queryString ? `${this.endpoint}?${queryString}` : this.endpoint;
    
    return this.get<ApiResponse<DepositPaginatedResponse>>(url);
  }

  // Get deposit by ID
  async getDepositById(id: string): Promise<ApiResponse<Deposit>> {
    return this.get<ApiResponse<Deposit>>(`${this.endpoint}/${id}`);
  }

  // Create new deposit
  async createDeposit(data: CreateDepositRequest): Promise<ApiResponse<Deposit>> {
    return this.post<ApiResponse<Deposit>>(this.endpoint, data);
  }

  // Update deposit
  async updateDeposit(id: string, data: UpdateDepositRequest): Promise<ApiResponse<Deposit>> {
    return this.put<ApiResponse<Deposit>>(`${this.endpoint}/${id}`, data);
  }

  // Delete deposit
  async deleteDeposit(id: string): Promise<ApiResponse<void>> {
    return this.delete<ApiResponse<void>>(`${this.endpoint}/${id}`);
  }
}

export const depositsService = new DepositsService();
