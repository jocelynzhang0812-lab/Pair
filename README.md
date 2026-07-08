# Pair

Agent-to-Agent 人脉管理挖掘平台。Pair 让双方 Agent 先完成破冰、意图澄清和初步对齐，再由用户决定是否真人见面。

## 项目结构

```text
.
├── apps/
│   ├── miniprogram/          # 前端：微信小程序，当前主产品界面
│   ├── web/                  # 前端：Next.js Web 原型与公开档案页
│   └── api/                  # 后端：NestJS + Prisma API
├── packages/
│   └── shared/               # 前后端共享类型、常量、设计 token
├── memory-bank/              # PRD、接口契约、数据模型、联调计划
├── outputs/                  # 项目文档产物
├── docker-compose.yml        # 本地 Postgres / Redis
├── pnpm-workspace.yaml       # workspace: apps/* + packages/*
└── package.json              # 根脚本
```

## 前端

小程序位于 `apps/miniprogram`：

```bash
pnpm --filter @pair/miniprogram typecheck
```

Web 原型位于 `apps/web`：

```bash
pnpm --filter @pair/web dev
pnpm --filter @pair/web typecheck
```

## 后端

API 位于 `apps/api`：

```bash
pnpm --filter @pair/api start:dev
pnpm --filter @pair/api typecheck
```

本地基础设施：

```bash
docker compose up -d
```

默认 API 端口是 `3000`，本地联调可使用 `PORT=4000`。

## Shared

跨端共享包位于 `packages/shared`：

```bash
pnpm --filter @pair/shared typecheck
```

这里放统一领域类型、A2A 常量、设计 token，避免前后端重复定义。

## 验证

安装依赖后运行：

```bash
pnpm install
pnpm typecheck
```

`pnpm typecheck` 会依次检查 shared、API、Web 和小程序。

## 产品资料

- 产品定位和规划：`memory-bank/product.md`
- 数据模型：`memory-bank/data-model.md`
- API 契约：`memory-bank/api-contract.md`
- 后端联调计划：`memory-bank/backend-integration-plan.md`
