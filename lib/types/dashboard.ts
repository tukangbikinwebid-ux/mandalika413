// --- Params ---
export interface DashboardParams {
  from_date?: string; // Format: YYYY-MM-DD
  to_date?: string; // Format: YYYY-MM-DD
}

// --- Response Data ---

// Total ECL
export type TotalEclData = number;

// ECL per Stage
export interface EclPerStageData {
  stage: number | string;
  total_ecl: number;
}

// ECL per Segment
export interface EclPerSegmentData {
  segment: string;
  total_ecl: number;
}

// ECL per Product
export interface EclPerProductData {
  product: string;
  total_ecl: number;
}

export interface TotalEclPerBranch {
  cab: string;
  total_ecl: string;
}

export interface TotalEclPerAkad {
  akad: string;
  total_ecl: string;
}