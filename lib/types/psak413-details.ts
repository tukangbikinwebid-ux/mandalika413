export interface PSAK413Detail {
  id: number;
  psak413_import_id: string;
  product_id: number;
  segment_id: number | null;
  stage_id: number | null;
  cab: string;
  no_rekening: string;
  akad: string;
  nama_nasabah: string;
  alamat_nasabah: string;
  start_date: string;
  maturity_date: string;
  plafond: number;
  os_pokok: number;
  os_margin: number;
  os_total: number;
  past_due_total: number;
  past_due_day: number;
  no_cif: number;
  margin: number;
  pd: number;
  lgd: number;
  ead: number;
  forward_looking: number;
  stage: number;
  accrued: boolean;
  psak413_amount: number;
  created_at: string;
  updated_at: string;
  product_name: string;
  product_code: string;
  segment_name: string | null;
}

export interface PSAK413DetailParams {
  page?: number;
  paginate?: number;
  search?: string;
  orderBy?: string;
  order?: "asc" | "desc";
  psak413_import_id?: string;
}