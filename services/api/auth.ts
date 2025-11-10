import BaseApiService from "./base";
import type { ApiResponse } from "./base";

/** --- Auth API types --- */
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  token_type: string;
}

export interface User {
  id: string;
  email: string | null;
  name: string | null;
  roles: string[]; // normalized role names
}

/** --- /me response types (sesuai contoh) --- */
interface RolePivot {
  model_type: string;
  model_id: number;
  role_id: number;
}

interface RoleObject {
  id: number;
  name: string;
  guard_name?: string;
  created_at?: string;
  updated_at?: string;
  pivot?: RolePivot;
}

type RoleApi = string | RoleObject;

interface MeRawUser {
  id: number | string;
  name: string | null;
  email: string | null;
  email_verified_at?: string | null;
  created_at?: string;
  updated_at?: string;
  roles?: RoleApi[];
}

/** Helper: normalisasi nama role dari API */
function roleNamesFromApi(input?: RoleApi[]): string[] {
  if (!input || input.length === 0) return [];
  return input
    .map((r) => (typeof r === "string" ? r : r.name))
    .filter((v): v is string => typeof v === "string" && v.length > 0);
}

class AuthService extends BaseApiService {
  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    const response = await this.post<ApiResponse<LoginResponse>>(
      "login",
      credentials
    );
    if (response.code === 200 && response.data.token) {
      this.setToken(response.data.token);
    }
    return response;
  }

  /** PANGGIL backend /logout + selalu bersihkan token lokal */
  async logout(): Promise<void> {
    try {
      // BaseApiService diasumsikan otomatis menyisipkan Authorization Bearer
      await this.post<ApiResponse<unknown>>("logout", {});
    } catch {
      // swallow error, tetap lanjut clear token lokal
    } finally {
      this.setToken(null);
    }
  }

  // GANTI: profile -> me (strict-typed)
  async getProfile(): Promise<ApiResponse<User>> {
    const res = await this.get<ApiResponse<MeRawUser>>("me");
    const me = res.data;

    const roles = roleNamesFromApi(me.roles);

    const shaped: ApiResponse<User> = {
      code: res.code,
      message: res.message,
      data: {
        id: String(me.id),
        email: me.email ?? null,
        name: me.name ?? null,
        roles,
      },
    };

    return shaped;
  }

  async refreshToken(): Promise<ApiResponse<LoginResponse>> {
    return this.post<ApiResponse<LoginResponse>>("refresh", {});
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

export const authService = new AuthService();