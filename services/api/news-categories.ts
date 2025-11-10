import BaseApiService from './base';
import { ApiResponse } from '@/lib/types';
import {
  NewsCategory,
  CreateNewsCategoryRequest,
  UpdateNewsCategoryRequest,
  NewsCategoryPaginationParams,
  NewsCategoryPaginatedResponse
} from '@/lib/types';

// Re-export types
export type {
  NewsCategory,
  CreateNewsCategoryRequest,
  UpdateNewsCategoryRequest,
  NewsCategoryPaginationParams,
  NewsCategoryPaginatedResponse
};

class NewsCategoriesService extends BaseApiService {
  getNewsCategories = async (params?: NewsCategoryPaginationParams): Promise<ApiResponse<NewsCategoryPaginatedResponse>> => {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.paginate) query.append('paginate', params.paginate.toString());
    if (params?.search) query.append('search', params.search);
    return this.get<ApiResponse<NewsCategoryPaginatedResponse>>(`news/categories?${query.toString()}`);
  }

  getNewsCategory = async (slug: string): Promise<ApiResponse<NewsCategory>> => {
    return this.get<ApiResponse<NewsCategory>>(`news/categories/${slug}`);
  }

  createNewsCategory = async (data: CreateNewsCategoryRequest): Promise<ApiResponse<NewsCategory>> => {
    return this.post<ApiResponse<NewsCategory>>('news/categories', data);
  }

  updateNewsCategory = async (slug: string, data: UpdateNewsCategoryRequest): Promise<ApiResponse<NewsCategory>> => {
    return this.put<ApiResponse<NewsCategory>>(`news/categories/${slug}`, data);
  }

  deleteNewsCategory = async (slug: string): Promise<ApiResponse<null>> => {
    return this.delete<ApiResponse<null>>(`news/categories/${slug}`);
  }
}

export const newsCategoriesService = new NewsCategoriesService();
