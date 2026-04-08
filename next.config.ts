import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prisma Query Engine (.node) debe ir al bundle serverless de Vercel
  outputFileTracingIncludes: {
    "/**": ["./node_modules/.prisma/client/**/*"],
    "/": ["./node_modules/.prisma/client/**/*"],
  },
  serverExternalPackages: ["@prisma/client", "prisma"],
};

export default nextConfig;
