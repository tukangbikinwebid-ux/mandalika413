export interface Product {
  id: number;
  product_category_id: number;
  name: string;
  slug: string;
  sku: string;
  description: string | null;
  buy_price: string;
  sell_price: string;
  status: 0 | 1; // 0 for inactive, 1 for active
  created_at: string;
  updated_at: string;
  category_title: string;
  category_sub_title: string | null;
  parent_category_title: string | null;
  parent_category_sub_title: string | null;
  image: string; // URL to image
  media: unknown[]; // Media array
}

export interface CreateProductRequest {
  product_category_id: number;
  name: string;
  sku: string;
  description?: string | null;
  buy_price: number;
  sell_price: number;
  status: 0 | 1;
  image?: File | null; // For file upload
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {
  slug: string; // Used for identifying the product to update
  _method?: 'PUT'; // For Laravel PUT spoofing
}

export interface ProductPaginationParams {
  page?: number;
  paginate?: number;
  search?: string;
  product_category_id?: number;
}

export interface ProductPaginatedResponse {
  current_page: number;
  data: Product[];
  first_page_url: string;
  from: number;
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
  to: number;
  total: number;
}
