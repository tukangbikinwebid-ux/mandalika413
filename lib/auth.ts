import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { env } from "./env";
import { extractRoleNames } from "./role-utils"

type LoginApi = {
  code: number;
  message: string;
  data: { token: string; token_type?: string };
};
type MeApi = {
  code: number;
  message: string;
  data: {
    id: number | string;
    name: string | null;
    email: string | null;
    roles?: Array<{ id: number; name: string } | string>;
    [k: string]: unknown;
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

        // 1) LOGIN → token
        const resLogin = await fetch(`${API}login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: credentials.email,
            password: credentials.password,
          }),
        });

        if (!resLogin.ok) return null;
        const loginJson = (await resLogin.json()) as LoginApi;
        const accessToken = loginJson?.data?.token;
        if (!accessToken) return null;

        // 2) ME → profil + roles
        const resMe = await fetch(`${API}me`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          cache: "no-store",
        });

        if (!resMe.ok) return null;
        const meJson = (await resMe.json()) as MeApi;
        const me = meJson?.data;
        if (!me) return null;

        const roles = extractRoleNames(me.roles);

        // 3) return user ke NextAuth
        return {
          id: String(me.id),
          name: me.name ?? null,
          email: me.email ?? null,
          roles,
          token: accessToken,
        };
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
      // Seed dari JWT
      if (session.user) {
        session.user.id = (token.id as string) ?? "";
        session.user.name = (token.name as string) ?? null;
        session.user.email = (token.email as string) ?? null;
        session.user.roles = (token.roles as string[]) ?? [];
        session.accessToken = (token.accessToken as string) ?? undefined;
      }

      // Sinkronkan dengan /me supaya role & user selalu up-to-date
      if (session.accessToken) {
        try {
          const resMe = await fetch(`${API}me`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.accessToken}`,
            },
            cache: "no-store",
          });

          if (resMe.ok) {
            const meJson = (await resMe.json()) as MeApi;
            const me = meJson?.data;
            if (me) {
              session.user.id = String(me.id);
              session.user.name = me.name ?? null;
              session.user.email = me.email ?? null;
              session.user.roles = extractRoleNames(me.roles);
              // opsional: kalau backend kirim token baru di /me, bisa diupdate di sini
            }
          } else if (resMe.status === 401) {
            // token invalid/expired → biarkan client melakukan signOut
          }
        } catch {
          // swallow error agar tidak ngebreak render
        }
      }

      return session;
    },
  },
};