# Pair 上线部署指南

> 目标：把 Pair 后端 + Web 端 + 微信小程序部署到公网，可供真实用户访问。

## ✅ AI 已完成的准备工作

以下文件已经创建并推送到 GitHub，你不需要再写：

| 文件 | 用途 |
|---|---|
| `apps/api/Dockerfile` | 后端 Docker 构建 |
| `apps/api/docker-compose.prod.yml` | 生产环境 docker-compose |
| `apps/api/nginx.conf` | Nginx + HTTPS 反向代理模板 |
| `apps/web/vercel.json` | Vercel 部署配置 |
| `.github/workflows/ci.yml` | CI：类型检查 + 构建 |
| `.github/workflows/deploy.yml` | CD：自动部署模板（需你开启） |
| `scripts/setup-production.sh` | 服务器一键部署脚本 |
| `env-production-template` | 生产环境变量模板 |
| `.env.example` | 开发环境变量模板 |

## 👤 必须由你完成的步骤

这些步骤涉及购买资源、注册平台账号、实名认证，AI 无法代替：

1. **购买域名**（如 `pairapp.cn`）
2. **域名备案**（如果使用国内服务器或微信小程序）
3. **注册/登录以下平台**：
   - Vercel（部署 Web）
   - Render / Railway / Fly.io / 阿里云 ECS（部署后端，四选一）
   - 微信公众平台（小程序）
   - OpenAI 或中转 API 平台
4. **申请/获取以下密钥**：
   - 微信小程序 `AppID` + `AppSecret`
   - OpenAI API Key
   - 数据库和 Redis 连接字符串

## 1. 后端部署

### 1.1 配置环境变量

复制 `env-production-template` 为项目根目录的 `.env.production`（不要提交到 Git），填入真实值：

```bash
cp env-production-template .env.production
# 编辑 .env.production 填入所有值
```

### 1.2 方式 A： Render（最简单，推荐）

1. 访问 https://dashboard.render.com，新建 Web Service
2. 选择 GitHub 仓库 `jocelynzhang0812-lab/Pair`
3. 配置：
   - Root Directory: `apps/api`
   - Build Command: `pnpm install --frozen-lockfile && pnpm --filter @pair/api build && pnpm prisma generate`
   - Start Command: `pnpm prisma migrate deploy && node dist/main.js`
4. 在 Environment 里粘贴 `.env.production` 的内容
5. 新建 PostgreSQL 和 Redis 服务，把连接字符串填回环境变量
6. 保存后自动部署

### 1.3 方式 B：自己的服务器（阿里云 ECS / 轻量应用服务器）

```bash
# 1. 服务器上安装 Docker、Docker Compose、git
# 2. 克隆代码
git clone https://github.com/jocelynzhang0812-lab/Pair.git /opt/pair
cd /opt/pair

# 3. 填好环境变量
cp env-production-template .env.production
nano .env.production

# 4. 一键部署
bash scripts/setup-production.sh

# 5. 配置 Nginx + HTTPS
cp apps/api/nginx.conf /etc/nginx/sites-available/pair
ln -s /etc/nginx/sites-available/pair /etc/nginx/sites-enabled/pair
certbot --nginx -d api.pairapp.cn -d pairapp.cn
systemctl reload nginx
```

## 2. Web 端部署（Vercel）

1. 访问 https://vercel.com/new，导入 GitHub 仓库
2. Framework Preset: Next.js
3. Root Directory: `apps/web`
4. 环境变量：
   - `NEXT_PUBLIC_API_BASE_URL=https://api.pairapp.cn`
5. 保存并部署
6. （可选）绑定自定义域名 `pairapp.cn`

## 3. 微信小程序上线

### 3.1 账号与配置

1. 注册微信小程序：https://mp.weixin.qq.com
2. 获取 `AppID` 和 `AppSecret`
3. 在「开发管理 → 开发设置」中配置服务器域名：
   - request 合法域名：`https://api.pairapp.cn`

### 3.2 修改小程序代码里的 AppID

编辑 `apps/miniprogram/project.config.json`：

```json
{
  "appid": "你的 AppID",
  "projectname": "Pair"
}
```

### 3.3 把 AppSecret 填到后端

在 `.env.production` / Render 环境变量里：

```bash
WECHAT_APP_ID=wx...
WECHAT_APP_SECRET=...
```

### 3.4 提交审核

1. 微信开发者工具 → 上传代码
2. 微信公众平台 → 版本管理 → 提交审核
3. 审核通过后点击发布

## 4. 生产检查清单

- [ ] 已购买域名并完成备案（国内必需）
- [ ] 后端服务已成功部署，`https://api.pairapp.cn/health` 返回 `{"ok":true}`
- [ ] Web 端已成功部署，`https://pairapp.cn` 能打开
- [ ] 已执行 `prisma migrate deploy`
- [ ] `JWT_SECRET` 为强随机字符串
- [ ] `OPENAI_API_KEY` 有效且有余额
- [ ] `WECHAT_APP_ID` / `WECHAT_APP_SECRET` 正确
- [ ] `CORS_ORIGINS` 包含 Web 域名
- [ ] 小程序服务器域名白名单已添加 `https://api.pairapp.cn`

## 5. 成本参考

| 资源 | 免费档 | 付费档 |
|---|---|---|
| 后端 Render | $0/月 | $7/月起 |
| Web Vercel | $0/月 | $20/月起 |
| PostgreSQL Supabase | $0/月 | $25/月起 |
| Redis Upstash | $0/月 | $10/月起 |
| 域名 | - | ~60 元/年 |
| 小程序认证 | 免费（个人） | 300 元/年（企业） |

## 6. 下一步

1. 复制 `env-production-template` → `.env.production` 并填入真实值
2. 选一个后端平台部署（推荐 Render）
3. 部署 Web 到 Vercel
4. 注册小程序并把 `AppID` 填入 `apps/miniprogram/project.config.json`
5. 小程序后端域名白名单加 `https://api.pairapp.cn`
6. 提交审核

完成后端或小程序任一步时，告诉我，我可以继续帮你检查配置或改代码。
