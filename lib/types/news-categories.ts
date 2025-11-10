export interface NewsCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  status: 0 | 1; // 0 for inactive, 1 for active
  created_at: string;
  updated_at: string;
}

export interface CreateNewsCategoryRequest {
  name: string;
  description: string;
  status: 0 | 1;
}

export interface UpdateNewsCategoryRequest extends Partial<CreateNewsCategoryRequest> {
  slug: string; // Used for identifying the category to update
}

export interface NewsCategoryPaginationParams {
  page?: number;
  paginate?: number;
  search?: string;
}

export interface NewsCategoryPaginatedResponse {
  current_page: number;
  data: NewsCategory[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: {
    url: string | null;
    label: string;
    page: number | null;
    active: boolean;
  }[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}
