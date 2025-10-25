#!/bin/bash

# 史诗AI项目开发环境设置脚本
# 使用方法: ./scripts/dev-setup.sh

set -e

echo "🚀 史诗AI项目开发环境设置"
echo "=============================="

# 检查Node.js版本
echo "📋 检查环境要求..."
node_version=$(node -v | cut -d'v' -f2)
required_version="18.0.0"

if [ "$(printf '%s\n' "$required_version" "$node_version" | sort -V | head -n1)" != "$required_version" ]; then
    echo "❌ Node.js版本过低。需要 >= $required_version，当前版本: $node_version"
    exit 1
fi

echo "✅ Node.js版本检查通过: $node_version"

# 检查pnpm是否安装
if ! command -v pnpm &> /dev/null; then
    echo "⚠️  pnpm未安装，使用npm..."
    npm_cmd="npm"
else
    echo "✅ pnpm已安装"
    npm_cmd="pnpm"
fi

# 安装依赖
echo "📦 安装项目依赖..."
if [ "$npm_cmd" = "pnpm" ]; then
    pnpm install
else
    npm install
fi

# 生成Prisma客户端
echo "🗄️  生成Prisma客户端..."
npm run db:generate

# 复制环境变量文件
if [ ! -f .env.local ]; then
    echo "📝 创建环境变量文件..."
    cp .env.example .env.local
    echo "⚠️  请编辑 .env.local 文件配置您的环境变量"
fi

# 运行类型检查
echo "🔍 运行类型检查..."
npm run type-check

# 运行linting
echo "✨ 运行代码检查..."
npm run lint

echo ""
echo "🎉 开发环境设置完成！"
echo ""
echo "📖 可用命令："
echo "  npm run dev              - 启动开发服务器"
echo "  npm run dev:debug        - 启动调试模式开发服务器"
echo "  npm run build            - 构建生产版本"
echo "  npm run test             - 运行测试"
echo "  npm run lint             - 代码检查"
echo "  npm run format           - 代码格式化"
echo "  npm run db:studio        - 打开Prisma Studio"
echo "  npm run docker:dev       - 启动开发环境Docker容器"
echo ""
echo "🚀 开始开发吧！运行 'npm run dev'"