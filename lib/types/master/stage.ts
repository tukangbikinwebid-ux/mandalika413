export interface Stage {
  id: number;
  product_id: number;
  description: string;
  stage: number;
  range_from: number;
  range_to: number;
  status: boolean;
  created_at: string; 
  updated_at: string;
  product_name: string;
  product_code: string;
  product_category_name: string;
  product_category_code: string;
}