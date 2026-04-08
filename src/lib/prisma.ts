import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

function hasPrismaSchema(dir: string): boolean {
  return existsSync(path.join(dir, "prisma", "schema.prisma"));
}

/**
 * `process.cwd()` en dev a veces es el monorepo o la carpeta del workspace, no este proyecto.
 * Subimos directorios desde este archivo y desde cwd hasta encontrar `prisma/schema.prisma`.
 */
function resolveProjectRoot(): string {
  const starts = new Set<string>();

  try {
    starts.add(process.cwd());
  } catch {
    /* ignore */
  }

  try {
    starts.add(path.dirname(fileURLToPath(import.meta.url)));
  } catch {
    /* ignore */
  }

  for (const start of starts) {
    let dir = path.resolve(start);
    for (let i = 0; i < 24; i++) {
      if (hasPrismaSchema(dir)) return dir;
      const parent = path.dirname(dir);
      if (parent === dir) break;
      dir = parent;
    }
  }

  throw new Error(
    "No se encontró prisma/schema.prisma. Ejecutá `npm run dev` desde la carpeta padel-americano (donde está package.json).",
  );
}

function sqliteFileUrl(): string {
  const root = resolveProjectRoot();
  const prismaDir = path.join(root, "prisma");
  if (!existsSync(prismaDir)) {
    mkdirSync(prismaDir, { recursive: true });
  }
  const file = path.join(prismaDir, "dev.db");
  return pathToFileURL(file).href;
}

function resolvedDatabaseUrl(): string {
  const env = process.env.DATABASE_URL;
  if (
    env &&
    (env.startsWith("postgres") ||
      env.startsWith("postgresql:") ||
      env.startsWith("mysql:") ||
      env.startsWith("mongodb"))
  ) {
    return env;
  }
  if (env?.startsWith("file:")) {
    const rest = env.replace(/^file:/, "").replace(/^\/+/, "");
    if (path.isAbsolute(rest)) {
      return pathToFileURL(rest).href;
    }
  }
  return sqliteFileUrl();
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: resolvedDatabaseUrl(),
      },
    },
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
