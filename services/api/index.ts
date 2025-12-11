export { authService } from "./auth";
export { default as BaseApiService } from "./base";
export type { ApiResponse, ApiError } from "./base";
export type { LoginRequest, LoginResponse, User } from "./auth";

export type {
  ProductCategory,
  ProductCategoryParams,
  CreateProductCategoryRequest,
} from "@/services/api/master/product-categories";

export type {
  Product,
  ProductParams,
  CreateProductRequest,
  UpdateProductRequest,
} from "@/services/api/master/product";

export type {
  Segment,
  SegmentParams,
  CreateSegmentRequest,
  UpdateSegmentRequest,
} from "@/services/api/master/segment";

export type {
  Stage,
  StageParams,
  CreateStageRequest,
  UpdateStageRequest,
} from "@/services/api/master/stages";

export type {
  Notification,
  NotificationData,
  NotificationParams,
} from "@/services/api/notification";

export type {
  PSAK413Import,
  PSAK413ImportParams,
  CreateImportRequest,
} from "@/lib/types/psak413-imports";

export type {
  PSAK413Detail,
  PSAK413DetailParams,
} from "@/lib/types/psak413-details";

export type {
  DashboardParams,
  TotalEclData,
  EclPerStageData,
  EclPerSegmentData,
  EclPerProductData,
} from "@/lib/types/dashboard";

// 3. Import & Export Service Instances
import { authService } from "./auth";
import { productCategoryService } from "@/services/api/master/product-categories";
import { productService } from "@/services/api/master/product";
import { segmentService } from "@/services/api/master/segment";
import { stageService } from "@/services/api/master/stages";
import { notificationService } from "@/services/api/notification";
import { psak413ImportService } from "./psak413-imports";
import { psak413DetailService } from "@/services/api/psak413-details";
import { dashboardService } from "@/services/api/dashboard";

export const api = {
  auth: authService,
  productCategory: productCategoryService,
  product: productService,
  segment: segmentService,
  stage: stageService,
  notification: notificationService,
  psak413Import: psak413ImportService,
  psak413Detail: psak413DetailService,
  dashboard: dashboardService,
};