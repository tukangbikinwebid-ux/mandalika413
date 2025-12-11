export interface Segment {
  id: number;
  name: string;
  product_id: number;
  pd: number; // bisa desimal
  lgd: number; // bisa desimal
  description: string;
  status: boolean | number;
  created_at: string;
  updated_at: string;
  product_name: string;
  product_code: string;
  product_category_name: string;
  product_category_code: string;
}
