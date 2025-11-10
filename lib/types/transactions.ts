import { User } from "./auth";
import { Media } from "./media";

export interface TransactionResponse {
  ref_id: string;
  customer_no: string;
  buyer_sku_code: string;
  message: string;
  status: string;
  rc: string;
  buyer_last_saldo: number;
  sn: string;
  price: number;
  tele: string | null;
  wa: string | null;
}

export interface Transaction {
  id: number;
  user_id: number | null;
  product_id: number;
  provider: string;
  reference: string;
  ref_number: number;
  order_id: string;
  product_details: {
    id: number;
    sku: string;
    name: string;
    slug: string;
    status: number;
    buy_price: string;
    created_at: string;
    sell_price: string;
    updated_at: string;
    description: string;
    product_category_id: number;
  };
  response: unknown;
  customer_no: string;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string;
  sn: string | null;
  amount: number;
  payment_link: string;
  expires_at: string | null;
  paid_at: string | null;
  status_payment: number;
  status: number;
  created_at: string;
  updated_at: string;
  user: unknown;
  product: {
    id: number;
    product_category_id: number;
    name: string;
    slug: string;
    sku: string;
    description: string;
    buy_price: string;
    sell_price: string;
    status: number;
    created_at: string;
    updated_at: string;
    image: string;
    media: unknown[];
  };
}

export interface TransactionListResponse {
  current_page: number;
  data: Transaction[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: Array<{
    url: string | null;
    label: string;
    page: number | null;
    active: boolean;
  }>;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

export interface TransactionFilters {
  page?: number;
  paginate?: number;
  started_at?: string;
  ended_at?: string;
  status?: number;
  status_payment?: number;
}

export interface TransactionStats {
  totalRevenue: number;
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
}
