import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { authConfig } from "@/auth.config";
import { prisma } from "@/lib/prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email" },
        password: { label: "Contraseña", type: "password" },
      },
      authorize: async (credentials) => {
        const email = credentials?.email?.toString().trim().toLowerCase();
        const password = credentials?.password?.toString();
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          groupId: user.groupId,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) token.id = user.id;
      if (user && "groupId" in user && typeof (user as { groupId: string }).groupId === "string") {
        token.groupId = (user as { groupId: string }).groupId;
      }
      if (!token.groupId && token.sub) {
        const u = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { groupId: true },
        });
        if (u?.groupId) token.groupId = u.groupId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) session.user.id = token.sub;
      if (session.user && token.groupId) session.user.groupId = token.groupId as string;
      return session;
    },
  },
});
