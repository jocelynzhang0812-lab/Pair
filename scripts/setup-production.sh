#!/usr/bin/env bash
set -euo pipefail

# Pair 生产环境一键启动脚本
# 用法：在服务器上 clone 代码后，填好 env-production-template，然后运行
#   bash scripts/setup-production.sh

REPO_URL="https://github.com/jocelynzhang0812-lab/Pair.git"
INSTALL_DIR="${INSTALL_DIR:-/opt/pair}"
ENV_FILE="${INSTALL_DIR}/env-production-template"

echo "=== Pair 生产环境部署脚本 ==="

if [ "$EUID" -ne 0 ]; then
  echo "建议用 root 运行，或确保当前用户有 docker 权限"
fi

# 1. 克隆/更新代码
if [ -d "$INSTALL_DIR/.git" ]; then
  echo "→ 更新代码..."
  cd "$INSTALL_DIR"
  git pull origin main
else
  echo "→ 克隆代码到 $INSTALL_DIR ..."
  git clone "$REPO_URL" "$INSTALL_DIR"
  cd "$INSTALL_DIR"
fi

# 2. 检查环境变量
if [ ! -f "$ENV_FILE" ]; then
  echo "❌ 找不到环境变量文件：$ENV_FILE"
  echo "请复制 env-production-template 填入真实值后再运行"
  exit 1
fi

# 3. 安装依赖并构建
if ! command -v pnpm &> /dev/null; then
  echo "→ 安装 pnpm..."
  corepack enable
  corepack prepare pnpm@9.0.0 --activate
fi

echo "→ 安装依赖..."
pnpm install --frozen-lockfile

echo "→ 构建后端..."
pnpm --filter @pair/api build

echo "→ 生成 Prisma Client..."
cd apps/api
pnpm prisma generate
cd ../..

# 4. 启动服务
echo "→ 启动/更新容器..."
docker compose -f apps/api/docker-compose.prod.yml up -d --build

# 5. 执行数据库迁移
echo "→ 执行数据库迁移..."
docker exec pair-api sh -c "cd /app/apps/api && pnpm prisma migrate deploy"

# 6. 健康检查
echo "→ 健康检查..."
sleep 5
if curl -sf http://localhost:3000/health; then
  echo "✅ 后端健康检查通过"
else
  echo "⚠️ 健康检查失败，请查看日志：docker logs pair-api"
  exit 1
fi

echo "✅ 部署完成"
echo ""
echo "下一步："
echo "  1. 配置 Nginx：sudo cp apps/api/nginx.conf /etc/nginx/sites-available/pair"
echo "  2. 申请 HTTPS 证书：sudo certbot --nginx -d api.pairapp.cn -d pairapp.cn"
echo "  3. 重启 Nginx：sudo systemctl reload nginx"
