import { NewsTag } from './news-tags';

export interface NewsArticle {
  id: number;
  news_category_id: number;
  title: string;
  sub_title: string | null;
  slug: string;
  content: string;
  published_at: string;
  read_time: number;
  view_count: number;
  status: 0 | 1; // 0 for inactive, 1 for active
  created_at: string;
  updated_at: string;
  category_name: string;
  image: string;
  tags: NewsTag[];
  media: unknown[];
}

export interface CreateNewsArticleRequest {
  news_category_id: number;
  title: string;
  sub_title?: string | null;
  content: string;
  published_at: string;
  status: 0 | 1;
  tag_ids?: number[];
  image?: File | null;
}

export interface UpdateNewsArticleRequest extends Partial<CreateNewsArticleRequest> {
  _method?: 'PUT'; // For Laravel PUT spoofing
}

export interface NewsArticlePaginationParams {
  page?: number;
  paginate?: number;
  search?: string;
  status?: 0 | 1;
  news_category_id?: number;
}

export interface NewsArticlePaginatedResponse {
  current_page: number;
  data: NewsArticle[];
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
