export interface Product {
  id: number;
  product_category_id: number;
  name: string;
  code: string;
  description: string;
  status: boolean | number;
  created_at: string;
  updated_at: string;
  product_category_name: string;
  product_category_code: string;
}
