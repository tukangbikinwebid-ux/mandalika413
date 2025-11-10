"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export const useTokenSync = () => {
  const { data: session, status } = useSession();
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    if (status === "authenticated" && (session as any)?.accessToken) {
      // Sync token from session to localStorage
      const token = (session as any).accessToken as string;
      localStorage.setItem('admin_token', token);
      setHasToken(true);
    } else if (status === "unauthenticated") {
      // Clear token when logged out
      localStorage.removeItem('admin_token');
      setHasToken(false);
    }
  }, [session, status]);

  // Check token on mount
  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    setHasToken(!!token);
  }, []);

  return {
    isAuthenticated: status === "authenticated",
    hasToken,
  };
};
