import BaseApiService from "./base";
import type { ApiResponse } from "./base";

/** --- Interfaces --- */

export interface NotificationData {
  message: string;
  date: string;
  url: string;
  link: string | null;
  type: string;
}

export interface Notification {
  id: string;
  type: string;
  notifiable_type: string;
  notifiable_id: number;
  data: NotificationData;
  read_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface NotificationParams {
  page?: number;
  paginate?: number;
  search?: string;
  orderBy?: string;
  order?: "asc" | "desc";
}

// Interface Response Pagination (Sesuai format laravel/api anda)
export interface PaginatedResult<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from?: number;
  to?: number;
}

/** --- Service Class --- */

class NotificationService extends BaseApiService {
  private resource = "notification";

  /**
   * Get All Notifications
   * Default URL: notification?orderBy=updated_at&order=desc&paginate=10&search=&page=1
   */
  async getAll(
    params?: NotificationParams
  ): Promise<ApiResponse<PaginatedResult<Notification>>> {
    const query = new URLSearchParams();

    // Default values sesuai request
    query.append("page", String(params?.page || 1));
    query.append("paginate", String(params?.paginate || 10));
    query.append("search", params?.search || "");
    query.append("orderBy", params?.orderBy || "updated_at");
    query.append("order", params?.order || "desc");

    return this.get<ApiResponse<PaginatedResult<Notification>>>(
      `${this.resource}?${query.toString()}`
    );
  }

  /**
   * Get Notification By ID
   */
  async getById(id: string): Promise<ApiResponse<Notification>> {
    return this.get<ApiResponse<Notification>>(`${this.resource}/${id}`);
  }

  /**
   * Mark as Read (PUT)
   * URL: /notification/read/{id}
   */
  async markAsRead(id: string): Promise<ApiResponse<null>> {
    return this.put<ApiResponse<null>>(`${this.resource}/read/${id}`);
  }

  /**
   * Mark All as Read (PUT)
   * URL: /notification/read-all
   */
  async markAllAsRead(): Promise<ApiResponse<null>> {
    return this.put<ApiResponse<null>>(`${this.resource}/read-all`);
  }
}

export const notificationService = new NotificationService();