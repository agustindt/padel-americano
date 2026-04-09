"use server";

import bcrypt from "bcryptjs";
import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { prisma } from "@/lib/prisma";

export type AuthFormState = { error?: string };

export async function registerUser(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (name.length < 2) return { error: "El nombre debe tener al menos 2 caracteres." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Email inválido." };
  }
  if (password.length < 6) {
    return { error: "La contraseña debe tener al menos 6 caracteres." };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: "Ese email ya está registrado." };

  const defaultGroup =
    (await prisma.group.findFirst({ orderBy: { createdAt: "asc" } })) ??
    (await prisma.group.create({ data: { name: "Grupo" } }));

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.create({
    data: { name, email, passwordHash, groupId: defaultGroup.id },
  });

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/",
    });
  } catch (e) {
    if (e instanceof AuthError) return { error: "No se pudo iniciar sesión automáticamente." };
    throw e;
  }

  return {};
}

export async function loginUser(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) return { error: "Completá email y contraseña." };

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/",
    });
  } catch (e) {
    if (e instanceof AuthError) {
      return { error: "Email o contraseña incorrectos." };
    }
    throw e;
  }
  return {};
}
