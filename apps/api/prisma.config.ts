import "dotenv/config";

import { defineConfig, env } from "prisma/config";

/**
 * Prisma 7 CLI / Migrate 配置。
 *
 * Prisma 7 不再支持在 schema 的 datasource 中写 `url`：连接串移到这里供
 * `prisma migrate` / `prisma generate` 使用（classic schema engine）。
 * 运行时的 PrismaClient 通过 driver adapter（@prisma/adapter-pg）连接，
 * 见 src/prisma/prisma.service.ts。
 */
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "ts-node prisma/seed.ts",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
