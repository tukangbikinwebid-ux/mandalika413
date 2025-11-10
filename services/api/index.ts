// Export all API services
export { authService } from './auth';
export { productsService } from './products';
export { ordersService } from './orders';
export { productCategoriesService } from './product-categories';
export { newsCategoriesService } from './news-categories';
export { newsTagsService } from './news-tags';
export { newsArticlesService } from './news-articles';
export { depositsService } from './deposits';
export { transactionService } from './transactions';
export { default as BaseApiService } from './base';
export type { ApiResponse, ApiError } from './base';
export type { LoginRequest, LoginResponse, User } from './auth';
export type { Order, CreateOrderRequest, UpdateOrderStatusRequest } from './orders';
export type { 
  ProductCategory, 
  CreateProductCategoryRequest, 
  UpdateProductCategoryRequest,
  ProductCategoryPaginationParams,
  ProductCategoryPaginatedResponse
} from './product-categories';
export type { 
  Product, 
  CreateProductRequest, 
  UpdateProductRequest,
  ProductPaginationParams,
  ProductPaginatedResponse
} from './products';
export type {
  NewsCategory,
  CreateNewsCategoryRequest,
  UpdateNewsCategoryRequest,
  NewsCategoryPaginationParams,
  NewsCategoryPaginatedResponse
} from './news-categories';
export type {
  NewsTag,
  CreateNewsTagRequest,
  UpdateNewsTagRequest,
  NewsTagPaginationParams,
  NewsTagPaginatedResponse
} from './news-tags';
export type {
  NewsArticle,
  CreateNewsArticleRequest,
  UpdateNewsArticleRequest,
  NewsArticlePaginationParams,
  NewsArticlePaginatedResponse
} from './news-articles';
export type {
  Deposit,
  CreateDepositRequest,
  UpdateDepositRequest,
  DepositPaginationParams,
  DepositPaginatedResponse
} from '@/lib/types/deposits';
export type {
  Transaction,
  TransactionListResponse,
  TransactionFilters,
  TransactionStats
} from '@/lib/types/transactions';

// Main API service instance
import { authService } from './auth';
import { productsService } from './products';
import { ordersService } from './orders';
import { productCategoriesService } from './product-categories';
import { newsCategoriesService } from './news-categories';
import { newsTagsService } from './news-tags';
import { newsArticlesService } from './news-articles';
import { depositsService } from './deposits';
import { transactionService } from './transactions';

export const api = {
  auth: authService,
  products: productsService,
  orders: ordersService,
  productCategories: productCategoriesService,
  newsCategories: newsCategoriesService,
  newsTags: newsTagsService,
  newsArticles: newsArticlesService,
  deposits: depositsService,
  transactions: transactionService,
};
