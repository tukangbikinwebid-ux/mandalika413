"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { authService } from "@/services/api";

export const useApiClient = () => {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated" && (session as any)?.accessToken) {
      // Set token from session
      authService.setToken((session as any).accessToken as string);
    } else if (status === "unauthenticated") {
      // Clear token when logged out
      authService.setToken(null);
    }
  }, [session, status]);

  return authService;
};
