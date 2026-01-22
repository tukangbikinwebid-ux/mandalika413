import { env } from "@/lib/env";
import { getSession } from "next-auth/react"; // 1. Import getSession

export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T;
}

export interface ApiError {
  code: number;
  message: string;
  errors?: Record<string, string[]>;
}

class BaseApiService {
  protected baseURL: string;

  constructor() {
    this.baseURL = env.API_BASE_URL;
  }

  protected async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const headers: Record<string, string> = {
      Accept: "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (!(options.body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }

    // --- PERBAIKAN UTAMA DISINI ---

    // 1. Coba ambil dari LocalStorage (jika ada)
    let token = this.getTokenFromStorage();

    // 2. Jika di LocalStorage kosong, coba ambil dari Session NextAuth
    if (!token && typeof window !== "undefined") {
      const session = await getSession();
      token = session?.accessToken || null;
    }

    // 3. Debugging: Lihat di console browser apa tokennya
    if (process.env.NODE_ENV === "development") {
      console.log(
        `[API] ${endpoint} | Token:`,
        token ? "Bearer " + token.substring(0, 10) + "..." : "NULL"
      );
    }

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    // -----------------------------

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      // Log URL in development
      if (process.env.NODE_ENV === "development") {
        console.log(`[API Request] ${options.method || "GET"} ${url}`);
      }

      const response = await fetch(url, config);

      if (!response.ok) {
        // Handle token expired (opsional)
        if (response.status === 401) {
          console.error("Unauthorized: Token kosong atau expired.");
          throw new Error("Unauthorized: Please login again.");
        }

        if (response.status === 404) {
          console.error(`Not Found: ${url}`);
          throw new Error(`API endpoint not found: ${endpoint}`);
        }

        if (response.status >= 500) {
          console.error(`Server Error: ${url}`);
          throw new Error("Server error. Please try again later.");
        }

        const errorData: ApiError = await response.json().catch(() => ({
          code: response.status,
          message: `HTTP ${response.status}: ${response.statusText}`,
        }));
        throw new Error(errorData.message || "Request failed");
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        // Log error details in development
        if (process.env.NODE_ENV === "development") {
          console.error(`[API Error] ${url}:`, error.message);
        }
        throw error;
      }
      throw new Error("Network error. Please check your connection.");
    }
  }

  // Rename agar jelas ini hanya cek localStorage
  protected getTokenFromStorage(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("admin_token");
    }
    return null;
  }

  // ... (Method setToken, get, post, dll tetap sama)
  public setToken(token: string | null): void {
    if (typeof window !== "undefined") {
      if (token) {
        localStorage.setItem("admin_token", token);
      } else {
        localStorage.removeItem("admin_token");
      }
    }
  }

  public async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  public async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  public async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  public async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }
}

export default BaseApiService;