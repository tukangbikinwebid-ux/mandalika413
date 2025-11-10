import BaseApiService from './base';
import { ApiResponse } from '@/lib/types';
import {
  NewsTag,
  CreateNewsTagRequest,
  UpdateNewsTagRequest,
  NewsTagPaginationParams,
  NewsTagPaginatedResponse
} from '@/lib/types';

// Re-export types
export type {
  NewsTag,
  CreateNewsTagRequest,
  UpdateNewsTagRequest,
  NewsTagPaginationParams,
  NewsTagPaginatedResponse
};

class NewsTagsService extends BaseApiService {
  getNewsTags = async (params?: NewsTagPaginationParams): Promise<ApiResponse<NewsTagPaginatedResponse>> => {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.paginate) query.append('paginate', params.paginate.toString());
    if (params?.search) query.append('search', params.search);
    return this.get<ApiResponse<NewsTagPaginatedResponse>>(`news/tags?${query.toString()}`);
  }

  getNewsTag = async (slug: string): Promise<ApiResponse<NewsTag>> => {
    return this.get<ApiResponse<NewsTag>>(`news/tags/${slug}`);
  }

  createNewsTag = async (data: CreateNewsTagRequest): Promise<ApiResponse<NewsTag>> => {
    return this.post<ApiResponse<NewsTag>>('news/tags', data);
  }

  updateNewsTag = async (slug: string, data: UpdateNewsTagRequest): Promise<ApiResponse<NewsTag>> => {
    return this.put<ApiResponse<NewsTag>>(`news/tags/${slug}`, data);
  }

  deleteNewsTag = async (slug: string): Promise<ApiResponse<null>> => {
    return this.delete<ApiResponse<null>>(`news/tags/${slug}`);
  }
}

export const newsTagsService = new NewsTagsService();
