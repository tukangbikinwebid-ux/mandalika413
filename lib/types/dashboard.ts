// --- Params ---
export interface DashboardParams {
  from_date?: string; // Format: YYYY-MM-DD
  to_date?: string; // Format: YYYY-MM-DD
}

// --- Response Data ---

// Total ECL Response
export interface TotalEclData {
  total: number;
}

// ECL per Stage Response
export interface EclPerStageResponse {
  ecl_per_stage: EclPerStageData[];
}

export interface EclPerStageData {
  stage: string;
  total_ecl: number;
}

// ECL per Segment Response
export interface EclPerSegmentResponse {
  ecl_per_segment: EclPerSegmentData[];
}

export interface EclPerSegmentData {
  segment: string;
  total_ecl: number;
}

// ECL per Product Response
export interface EclPerProductResponse {
  ecl_per_product: EclPerProductData[];
}

export interface EclPerProductData {
  product: string;
  total_ecl: number;
}

// ECL per Branch Response
export interface EclPerBranchResponse {
  ecl_per_branch: TotalEclPerBranch[];
}

export interface TotalEclPerBranch {
  branch: string;
  total_ecl: number;
}

// ECL per Akad Response
export interface EclPerAkadResponse {
  ecl_per_akad: TotalEclPerAkad[];
}

export interface TotalEclPerAkad {
  akad: string;
  total_ecl: number;
}

// Dashboard All (Single Endpoint) Response
export interface DashboardAllData {
  total_ecl: number;
  ecl_per_stage: EclPerStageData[];
  ecl_per_segment: EclPerSegmentData[];
  ecl_per_product: EclPerProductData[];
  ecl_per_branch: TotalEclPerBranch[];
  ecl_per_akad: TotalEclPerAkad[];
}