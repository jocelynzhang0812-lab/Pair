FROM node:22-slim
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

WORKDIR /app

# 先复制 workspace 配置和 lockfile，利用缓存层
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/api/package.json ./apps/api/package.json
COPY packages/shared/package.json ./packages/shared/package.json

# 安装依赖（包含 devDeps 以便构建；部署平台可在此基础上优化）
RUN pnpm install --frozen-lockfile

# 复制源码并构建
COPY apps/api ./apps/api
COPY packages/shared ./packages/shared
RUN pnpm --filter @pair/api build

# 生成 Prisma Client（构建后需要，因为 schema 在 apps/api 里）
RUN cd apps/api && pnpm prisma generate

WORKDIR /app/apps/api

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

# 生产启动：先 migrate deploy，再启动服务
CMD ["sh", "-c", "pnpm prisma migrate deploy && node dist/main.js"]
