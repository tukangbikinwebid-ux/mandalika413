export interface ProductCategory {
  id: number;
  parent_id: number | null;
  title: string;
  sub_title: string | null;
  slug: string;
  digiflazz_code: string | null;
  must_fill_game_id: boolean;
  must_fill_zone_id: boolean;
  description: string;
  status: number;
  created_at: string;
  updated_at: string;
  parent_title: string | null;
  parent_sub_title: string | null;
  image: string;
  media: unknown[];
}

export interface CreateProductCategoryRequest {
  parent_id?: number | null;
  title: string;
  sub_title?: string | null;
  description?: string | null;
  status: number;
  image?: File | null;
  digiflazz_code?: string | null;
  must_fill_game_id?: boolean;
  must_fill_zone_id?: boolean;
}

export interface UpdateProductCategoryRequest extends Partial<CreateProductCategoryRequest> {
  slug: string;
}

export interface ProductCategoryPaginationParams {
  page?: number;
  paginate?: number;
  search?: string;
  status?: number;
  is_parent?: number;
  parent_id?: number;
}

export interface ProductCategoryPaginatedResponse {
  current_page: number;
  data: ProductCategory[];
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
