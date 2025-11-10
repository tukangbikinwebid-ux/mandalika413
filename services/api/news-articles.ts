import BaseApiService from './base';
import { ApiResponse } from '@/lib/types';
import {
  NewsArticle,
  CreateNewsArticleRequest,
  UpdateNewsArticleRequest,
  NewsArticlePaginationParams,
  NewsArticlePaginatedResponse
} from '@/lib/types';

// Re-export types
export type {
  NewsArticle,
  CreateNewsArticleRequest,
  UpdateNewsArticleRequest,
  NewsArticlePaginationParams,
  NewsArticlePaginatedResponse
};

class NewsArticlesService extends BaseApiService {
  getNewsArticles = async (params?: NewsArticlePaginationParams): Promise<ApiResponse<NewsArticlePaginatedResponse>> => {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.paginate) query.append('paginate', params.paginate.toString());
    if (params?.search) query.append('search', params.search);
    if (params?.status !== undefined) query.append('status', params.status.toString());
    if (params?.news_category_id !== undefined) query.append('news_category_id', params.news_category_id.toString());
    
    const url = `news/news?${query.toString()}`;
    // console.log('NewsArticlesService: Making request to:', url);
    // console.log('NewsArticlesService: Params received:', params);
    
    return this.get<ApiResponse<NewsArticlePaginatedResponse>>(url);
  }

  getNewsArticle = async (slug: string): Promise<ApiResponse<NewsArticle>> => {
    return this.get<ApiResponse<NewsArticle>>(`news/news/${slug}`);
  }

  createNewsArticle = async (data: CreateNewsArticleRequest): Promise<ApiResponse<NewsArticle>> => {
    const formData = new FormData();

    formData.append('news_category_id', data.news_category_id.toString());
    formData.append('title', data.title);
    if (data.sub_title) formData.append('sub_title', data.sub_title);
    formData.append('content', data.content);
    formData.append('published_at', data.published_at);
    formData.append('status', data.status.toString());

    // Add tag_ids if provided
    if (data.tag_ids && data.tag_ids.length > 0) {
      data.tag_ids.forEach((tagId, index) => {
        formData.append(`tag_ids[${index}]`, tagId.toString());
      });
    }

    if (data.image) {
      formData.append('image', data.image);
    }

    return this.request<ApiResponse<NewsArticle>>('news/news', {
      method: 'POST',
      body: formData,
      headers: {
        // Don't set Content-Type for FormData, let browser set it with boundary
      },
    });
  }

  updateNewsArticle = async (slug: string, data: UpdateNewsArticleRequest): Promise<ApiResponse<NewsArticle>> => {
    const formData = new FormData();

    // Add _method=PUT for Laravel
    formData.append('_method', 'PUT');

    if (data.news_category_id !== undefined) formData.append('news_category_id', data.news_category_id.toString());
    if (data.title) formData.append('title', data.title);
    if (data.sub_title !== undefined) formData.append('sub_title', data.sub_title || '');
    if (data.content) formData.append('content', data.content);
    if (data.published_at) formData.append('published_at', data.published_at);
    if (data.status !== undefined) formData.append('status', data.status.toString());

    // Add tag_ids if provided
    if (data.tag_ids && data.tag_ids.length > 0) {
      data.tag_ids.forEach((tagId, index) => {
        formData.append(`tag_ids[${index}]`, tagId.toString());
      });
    }

    if (data.image) {
      formData.append('image', data.image);
    }

    return this.request<ApiResponse<NewsArticle>>(`news/news/${slug}`, {
      method: 'POST', // Use POST with _method=PUT for Laravel
      body: formData,
      headers: {
        // Don't set Content-Type for FormData
      },
    });
  }

  deleteNewsArticle = async (slug: string): Promise<ApiResponse<null>> => {
    return this.request<ApiResponse<null>>(`news/news/${slug}`, {
      method: 'DELETE',
    });
  }
}

export const newsArticlesService = new NewsArticlesService();
