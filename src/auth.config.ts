import type { NextAuthConfig } from "next-auth";

/**
 * Configuración sin Prisma: sirve para el middleware (Edge) y debe coincidir con sesión/JWT de `auth.ts`.
 */
export const authConfig = {
  trustHost: true,
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: {
    signIn: "/login",
  },
  providers: [],
} satisfies NextAuthConfig;
