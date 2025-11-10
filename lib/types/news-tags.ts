export interface NewsTag {
  id: number;
  name: string;
  slug: string;
  description: string;
  status: 0 | 1; // 0 for inactive, 1 for active
  created_at: string;
  updated_at: string;
}

export interface CreateNewsTagRequest {
  name: string;
  description: string;
  status: 0 | 1;
}

export interface UpdateNewsTagRequest extends Partial<CreateNewsTagRequest> {
  slug: string; // Used for identifying the tag to update
}

export interface NewsTagPaginationParams {
  page?: number;
  paginate?: number;
  search?: string;
}

export interface NewsTagPaginatedResponse {
  current_page: number;
  data: NewsTag[];
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
