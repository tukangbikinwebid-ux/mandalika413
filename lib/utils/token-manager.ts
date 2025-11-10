// Token management utilities
export class TokenManager {
  private static readonly TOKEN_KEY = 'admin_token';
  private static readonly TOKEN_TYPE_KEY = 'admin_token_type';

  static setToken(token: string, tokenType: string = 'bearer'): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.TOKEN_KEY, token);
      localStorage.setItem(this.TOKEN_TYPE_KEY, tokenType);
    }
  }

  static getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(this.TOKEN_KEY);
    }
    return null;
  }

  static getTokenType(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(this.TOKEN_TYPE_KEY);
    }
    return null;
  }

  static getAuthHeader(): string | null {
    const token = this.getToken();
    const tokenType = this.getTokenType();
    
    if (token && tokenType) {
      return `${tokenType} ${token}`;
    }
    
    return null;
  }

  static clearToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.TOKEN_TYPE_KEY);
    }
  }

  static isTokenValid(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      // Basic token validation - check if it's not expired
      // In a real app, you might want to decode JWT and check expiration
      return token.length > 0;
    } catch {
      return false;
    }
  }
}
