// Environment variables configuration
export const env = {
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api-topup.naditechno.id/api/v1/',
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
} as const;

// Validation function
export function validateEnv() {
  const missing: string[] = [];
  
  if (!env.NEXTAUTH_SECRET) {
    missing.push('NEXTAUTH_SECRET');
  }
  
  if (missing.length > 0) {
    console.error('Missing required environment variables:', missing);
    return false;
  }
  
  return true;
}

// Environment utilities
export function logEnv() {
  if (typeof window !== 'undefined') {
    console.log('Environment Variables:', {
      NEXTAUTH_URL: env.NEXTAUTH_URL,
      API_BASE_URL: env.API_BASE_URL,
      NEXTAUTH_SECRET: env.NEXTAUTH_SECRET ? 'Set' : 'Not set',
    });
  }
}
