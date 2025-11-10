export interface Media {
  id: number;
  model_type: string;
  model_id: number;
  collection_name: string;
  name: string;
  file_name: string;
  mime_type: string;
  disk: string;
  conversions_disk: string;
  size: number;
  manipulations: string[];
  custom_properties: string[];
  responsive_images: string[];
  order_column: number;
  created_at: string;
  updated_at: string;
  url: string;
  original_url: string;
}
