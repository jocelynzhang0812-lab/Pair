# Pair 上线部署指南

> 目标：把 Pair 后端 + Web 端 + 微信小程序部署到公网，可供真实用户访问。

## 0. 前置资源清单

你需要提前准备以下账号/资源（此步骤无法由 AI 替代）：

| 资源 | 用途 | 推荐平台 |
|---|---|---|
| 域名 | API/Web 访问入口 | 阿里云 / 腾讯云 / Cloudflare |
| 服务器/容器平台 | 运行 NestJS 后端 | Render / Railway / Fly.io / 阿里云 ECS |
| PostgreSQL | 生产数据库 | Supabase / Render Postgres / 阿里云 RDS |
| Redis | 队列/缓存 | Upstash / Render Redis / 阿里云 Redis |
| 静态托管 | Next.js Web 部署 | Vercel |
| 微信小程序账号 | 小程序上线 | 微信公众平台 |
| OpenAI API Key | AI 对话/摘要 | OpenAI / 中转 API |
| 微信开放平台/公众号（可选） | 微信登录 | 微信公众平台 |

## 1. 后端部署

### 1.1 配置环境变量

复制 `apps/api/.env.example` 为 `apps/api/.env`，填入生产值：

```bash
NODE_ENV=production
PORT=3000
CORS_ORIGINS=https://pair-web.vercel.app,https://pairapp.cn
WEB_PUBLIC_BASE_URL=https://pairapp.cn
DATABASE_URL=postgresql://user:pass@host:5432/pair?schema=public
REDIS_URL=rediss://user:pass@host:6379
JWT_SECRET=<随机字符串，至少 32 位>
JWT_EXPIRES_IN=7d
OPENAI_API_KEY=sk-...
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL_MINI=gpt-4o-mini
OPENAI_MODEL_DIALOGUE=gpt-4o
WECHAT_APP_ID=wx...
WECHAT_APP_SECRET=...
THROTTLE_TTL=60
THROTTLE_LIMIT=60
```

### 1.2 执行数据库迁移

```bash
cd apps/api
pnpm install
pnpm prisma migrate deploy
pnpm prisma generate
```

### 1.3 Docker 构建并启动（Render/Fly/ECS 通用）

```bash
cd apps/api
docker build -t pair-api -f Dockerfile ../..
docker run -p 3000:3000 --env-file .env pair-api
```

### 1.4 平台特定部署

#### Render
1. New Web Service → 选择 GitHub 仓库
2. Root Directory: `apps/api`
3. Build Command: `pnpm install --frozen-lockfile && pnpm --filter @pair/api build && pnpm prisma generate`
4. Start Command: `pnpm prisma migrate deploy && node dist/main.js`
5. 在 Environment 里填入 `.env` 所有变量
6. 创建 PostgreSQL 和 Redis 服务，复制连接字符串

#### Fly.io
```bash
cd apps/api
fly launch
cd ..
fly deploy --dockerfile apps/api/Dockerfile
```

#### 阿里云 ECS
1. 安装 Docker
2. 上传代码或构建镜像
3. 用 docker-compose 或 systemd 运行
4. 配置 Nginx 反向代理 + HTTPS

## 2. Web 端部署（Vercel）

1. 访问 https://vercel.com/new，导入 GitHub 仓库
2. Framework Preset: Next.js
3. Root Directory: `apps/web`
4. Build Command: `cd ../.. && pnpm install --frozen-lockfile && pnpm --filter @pair/web build`
5. Output Directory: `apps/web/.next`
6. 环境变量：
   - `NEXT_PUBLIC_API_BASE_URL=https://api.pairapp.cn`
7. 绑定自定义域名

## 3. 微信小程序上线

### 3.1 账号与配置

1. 注册微信小程序（个人/企业）
2. 获取 `AppID` 和 `AppSecret`
3. 在「开发管理 → 开发设置」中配置：
   - request 合法域名：`https://api.pairapp.cn`
   - uploadFile 合法域名（如需要上传图片）
   - downloadFile 合法域名

### 3.2 修改小程序配置

编辑 `apps/miniprogram/project.config.json`：

```json
{
  "appid": "你的 AppID",
  "projectname": "Pair"
}
```

### 3.3 修改后端 CORS

确保 `CORS_ORIGINS` 包含小程序 WebView 域名（如果使用 web-view）或小程序后台配置的域名。

### 3.4 提交审核

1. 微信开发者工具 → 上传代码
2. 微信公众平台 → 版本管理 → 提交审核
3. 审核通过后发布

## 4. 域名与 HTTPS

- API：`https://api.pairapp.cn`
- Web：`https://pairapp.cn`
- 所有与小程序通信的域名必须备案（国内）
- 使用 Cloudflare / 阿里云 CDN 提供 HTTPS 和 DDoS 防护

## 5. 生产检查清单

- [ ] `NODE_ENV=production`
- [ ] 已执行 `prisma migrate deploy`
- [ ] JWT_SECRET 为强随机字符串
- [ ] OpenAI API Key 有效且有余额
- [ ] 微信登录 AppID/AppSecret 正确
- [ ] CORS  origins 配置为真实域名
- [ ] 数据库和 Redis 连接字符串正确
- [ ] `/health` 可访问
- [ ] 小程序服务器域名白名单已加
- [ ] 域名已备案（国内服务器/小程序）

## 6. 常见问题

**Q: 不想备案怎么办？**
A: 后端和 Web 部署在 Render/Vercel/Cloudflare Pages 可以跳过备案，但微信小程序在国内运行，通常需要域名备案才能通过审核。

**Q: 个人开发者能上线小程序吗？**
A: 可以，但部分类目受限，且不能接入微信支付。 Pair 目前不需要支付。

**Q: 成本大概多少？**
A: 最低配置：Render 免费档 + Vercel 免费档 + Supabase 免费 Postgres + Upstash 免费 Redis ≈ $0/月。微信小程序认证费 300 元/年（企业）或免费（个人）。
