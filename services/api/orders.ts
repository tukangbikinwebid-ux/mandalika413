import BaseApiService from './base';
import { ApiResponse, PaginatedResponse } from '@/lib/types';

export interface Order {
  id: string;
  userId: string;
  products: OrderItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  shippingAddress: Address;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface CreateOrderRequest {
  products: Omit<OrderItem, 'productName'>[];
  shippingAddress: Address;
}

export interface UpdateOrderStatusRequest {
  id: string;
  status: Order['status'];
}

class OrdersService extends BaseApiService {
  async getOrders(params?: {
    page?: number;
    limit?: number;
    status?: string;
    userId?: string;
  }): Promise<ApiResponse<PaginatedResponse<Order>>> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.userId) queryParams.append('userId', params.userId);
    
    const endpoint = `orders${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.get<ApiResponse<PaginatedResponse<Order>>>(endpoint);
  }

  async getOrder(id: string): Promise<ApiResponse<Order>> {
    return this.get<ApiResponse<Order>>(`orders/${id}`);
  }

  async createOrder(data: CreateOrderRequest): Promise<ApiResponse<Order>> {
    return this.post<ApiResponse<Order>>('orders', data);
  }

  async updateOrderStatus(data: UpdateOrderStatusRequest): Promise<ApiResponse<Order>> {
    return this.put<ApiResponse<Order>>(`orders/${data.id}/status`, { status: data.status });
  }

  async cancelOrder(id: string): Promise<ApiResponse<Order>> {
    return this.put<ApiResponse<Order>>(`orders/${id}/cancel`);
  }
}

export const ordersService = new OrdersService();
