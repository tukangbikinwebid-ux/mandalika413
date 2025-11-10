export interface Deposit {
  id: string;
  bank: 'BCA' | 'MANDIRI' | 'BRI' | 'BNI';
  payment_method: string;
  owner_name: string;
  account_number: string;
  amount: number;
  notes: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  created_at: string;
  updated_at: string;
}

export interface CreateDepositRequest {
  bank: 'BCA' | 'MANDIRI' | 'BRI' | 'BNI';
  owner_name: string;
  amount: number;
  notes?: string;
}

export interface UpdateDepositRequest {
  bank?: 'BCA' | 'MANDIRI' | 'BRI' | 'BNI';
  owner_name?: string;
  amount?: number;
  notes?: string;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface DepositPaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface DepositPaginatedResponse {
  data: Deposit[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
