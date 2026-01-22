import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { env } from "./env";
import { extractRoleNames } from "./role-utils"

type LoginApi = {
  code: number;
  message: string;
  data: {
    token: string;
    token_type?: string;
    user: {
      id: number | string;
      Name: string;
      Email: string;
      Password?: string;
      RoleUser?: unknown;
      Roles: Array<{
        id: number;
        Name: string;
        created_at?: string;
        updated_at?: string;
        RolePermissions?: unknown;
        Permissions?: unknown;
      }>;
      created_at?: string;
      updated_at?: string;
      [k: string]: unknown;
    };
  };
};

const API = env.API_BASE_URL.replace(/\/?$/, "/"); // pastikan ada trailing slash

export const authOptions: AuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24, // 1 day
  },
  pages: {
    signIn: "/auth/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          // 1) LOGIN → token + user data
          const resLogin = await fetch(`${API}auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          if (!resLogin.ok) {
            const errorData = await resLogin.json().catch(() => null);
            console.error("Login failed:", errorData);
            return null;
          }

          const loginJson = (await resLogin.json()) as LoginApi;
          
          // Check response code
          if (loginJson.code !== 200 || !loginJson.data?.token) {
            console.error("Invalid login response:", loginJson);
            return null;
          }

          const accessToken = loginJson.data.token;
          const userData = loginJson.data.user;

          // Extract user data from login response
          const name = userData.Name || null;
          const email = userData.Email || null;
          const rolesData = userData.Roles || [];

          const roles = extractRoleNames(rolesData);

          return {
            id: String(userData.id),
            name,
            email,
            roles,
            token: accessToken,
          };
        } catch (error) {
          console.error("Login error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Saat login pertama kali
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email ?? null;
        token.roles = user.roles ?? [];
        token.accessToken = user.token; // simpan access token
      }
      return token;
    },

    async session({ session, token }) {
      // Get user data from JWT token (set during login)
      if (session.user) {
        session.user.id = (token.id as string) ?? "";
        session.user.name = (token.name as string) ?? null;
        session.user.email = (token.email as string) ?? null;
        session.user.roles = (token.roles as string[]) ?? [];
        session.accessToken = (token.accessToken as string) ?? undefined;
      }

      return session;
    },
  },
};