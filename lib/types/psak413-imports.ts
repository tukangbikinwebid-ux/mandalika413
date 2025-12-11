export interface PSAK413Import {
  id: string;
  name: string;
  filename: string;
  filepath: string;
  mime_type: string;
  disk: string;
  size: number;
  imported_at: string | null;
  processed_at: string | null;
  finished_at: string | null;
  rows: number;
  successful_rows: number;
  failed_rows: number;
  errors: string | null;
  progress: number;
  total_psak413_amount: number;
  created_at: string;
  updated_at: string;
}

export interface PSAK413ImportParams {
  page?: number;
  paginate?: number;
  search?: string;
  orderBy?: string;
  order?: "asc" | "desc";
  is_processing?: 0 | 1;
  is_finished?: 0 | 1;
  imported_at_from?: string;
  imported_at_to?: string;
  processed_at_from?: string;
  processed_at_to?: string;
  finished_at_from?: string;
  finished_at_to?: string;
}

export interface CreateImportRequest {
  file: File;
}

export interface PaginatedResult<T> {
  current_page: number;
  data: T[];
  first_page_url: string;
  from: number | null;
  last_page: number;
  last_page_url: string;
  links: {
    url: string | null;
    label: string;
    active: boolean;
  }[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number | null;
  total: number;
}