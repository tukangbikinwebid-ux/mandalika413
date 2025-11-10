import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string | null;
      email: string | null;
      roles: string[]; // dari /me
    } & DefaultSession["user"];
    accessToken?: string;
  }

  interface User {
    id: string;
    name: string | null;
    email: string | null;
    roles: string[];
    token: string; // access token dari /login
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    name?: string | null;
    email?: string | null;
    roles?: string[];
    accessToken?: string;
  }
}