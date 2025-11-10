import BaseApiService from './base';
import { ApiResponse } from '@/lib/types';
import { Transaction, TransactionListResponse, TransactionFilters } from '@/lib/types/transactions';

class TransactionService extends BaseApiService {
  constructor() {
    super();
  }

  async getTransactions(filters: TransactionFilters = {}): Promise<ApiResponse<TransactionListResponse>> {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.paginate) params.append('paginate', filters.paginate.toString());
    if (filters.started_at) params.append('started_at', filters.started_at);
    if (filters.ended_at) params.append('ended_at', filters.ended_at);
    if (filters.status !== undefined) params.append('status', filters.status.toString());
    if (filters.status_payment !== undefined) params.append('status_payment', filters.status_payment.toString());

    const queryString = params.toString();
    const url = queryString ? `transaction/topups?${queryString}` : 'transaction/topups';
    
    return this.get<ApiResponse<TransactionListResponse>>(url);
  }

  async getTransactionById(id: number): Promise<ApiResponse<Transaction>> {
    return this.get<ApiResponse<Transaction>>(`transaction/topups/${id}`);
  }

  async getTransactionByOrderId(orderId: string): Promise<ApiResponse<Transaction>> {
    return this.get<ApiResponse<Transaction>>(`transaction/topups/order/${orderId}`);
  }
}

export const transactionService = new TransactionService();
