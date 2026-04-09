import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & { id: string; groupId: string };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    groupId?: string;
  }
}
