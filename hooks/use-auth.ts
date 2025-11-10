"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/api";

export const useAuth = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  const logout = async () => {
    // Clear token from service
    authService.logout();
    
    // Sign out from NextAuth
    await signOut({
      redirect: true,
      callbackUrl: "/auth/login"
    });
  };

  const isAdmin = session?.user?.roles.includes("admin") ?? false;
  const isAuthenticated = status === "authenticated";
  const isLoading = status === "loading";

  return {
    user: session?.user,
    isAuthenticated,
    isAdmin,
    isLoading,
    logout,
  };
};
