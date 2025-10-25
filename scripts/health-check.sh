#!/bin/bash

# 史诗AI项目健康检查脚本
# 使用方法: ./scripts/health-check.sh

set -e

echo "🏥 史诗AI项目健康检查"
echo "===================="

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查函数
check_status() {
    if [ $? -eq 0 ]; then
        echo -e "  ${GREEN}✅ $1${NC}"
        return 0
    else
        echo -e "  ${RED}❌ $1${NC}"
        return 1
    fi
}

warning_status() {
    echo -e "  ${YELLOW}⚠️  $1${NC}"
}

# 检查Node.js版本
echo "📋 检查运行环境..."
node_version=$(node -v)
check_status "Node.js版本: $node_version"

# 检查npm/pnpm
if command -v pnpm &> /dev/null; then
    pnpm_version=$(pnpm -v)
    check_status "pnpm版本: $pnpm_version"
    npm_cmd="pnpm"
elif command -v npm &> /dev/null; then
    npm_version=$(npm -v)
    check_status "npm版本: $npm_version"
    npm_cmd="npm"
else
    check_status "包管理器未安装"
    exit 1
fi

# 检查依赖
echo ""
echo "📦 检查项目依赖..."
if [ -d "node_modules" ]; then
    check_status "node_modules目录存在"
else
    warning_status "node_modules目录不存在，运行 '$npm_cmd install'"
fi

# 检查环境变量
echo ""
echo "🔧 检查环境配置..."
if [ -f ".env.local" ]; then
    check_status "环境变量文件存在"

    # 检查关键环境变量
    if grep -q "NODE_ENV" .env.local; then
        check_status "NODE_ENV已设置"
    else
        warning_status "NODE_ENV未设置"
    fi

    if grep -q "DATABASE_URL" .env.local; then
        check_status "DATABASE_URL已设置"
    else
        warning_status "DATABASE_URL未设置"
    fi
else
    warning_status "环境变量文件不存在，复制.env.example到.env.local"
fi

# 检查TypeScript配置
echo ""
echo "🔍 检查代码质量..."
if [ -f "tsconfig.json" ]; then
    check_status "TypeScript配置存在"
else
    check_status "TypeScript配置不存在"
fi

# 运行类型检查
echo ""
echo "🏗️  运行构建检查..."
if $npm_cmd run type-check > /dev/null 2>&1; then
    check_status "TypeScript类型检查通过"
else
    check_status "TypeScript类型检查失败"
    echo "  运行 '$npm_cmd run type-check' 查看详细错误"
fi

# 检查ESLint配置
if [ -f ".eslintrc.json" ] || [ -f ".eslintrc.js" ]; then
    check_status "ESLint配置存在"

    if $npm_cmd run lint > /dev/null 2>&1; then
        check_status "ESLint检查通过"
    else
        warning_status "ESLint检查存在问题"
        echo "  运行 '$npm_cmd run lint' 查看详细错误"
    fi
else
    warning_status "ESLint配置不存在"
fi

# 检查Prettier配置
if [ -f ".prettierrc.json" ] || [ -f ".prettierrc.js" ]; then
    check_status "Prettier配置存在"
else
    warning_status "Prettier配置不存在"
fi

# 检查数据库连接（如果Prisma存在）
if [ -d "prisma" ] && [ -f "prisma/schema.prisma" ]; then
    echo ""
    echo "🗄️  检查数据库配置..."
    check_status "Prisma配置存在"

    # 尝试生成Prisma客户端
    if $npm_cmd run db:generate > /dev/null 2>&1; then
        check_status "Prisma客户端生成成功"
    else
        warning_status "Prisma客户端生成失败"
    fi
fi

# 检查Git状态
echo ""
echo "📝 检查版本控制..."
if [ -d ".git" ]; then
    check_status "Git仓库存在"

    if git diff-index --quiet HEAD --; then
        check_status "工作目录干净"
    else
        warning_status "存在未提交的更改"
    fi
else
    warning_status "不是Git仓库"
fi

# 检查Docker配置
echo ""
echo "🐳 检查容器化配置..."
if [ -f "Dockerfile" ]; then
    check_status "Dockerfile存在"
else
    warning_status "Dockerfile不存在"
fi

if [ -f "docker-compose.yml" ]; then
    check_status "Docker Compose配置存在"
else
    warning_status "Docker Compose配置不存在"
fi

# 总结
echo ""
echo "📊 健康检查完成"
echo "=================="
echo ""
echo "💡 建议："
echo "  • 如果看到警告，请根据提示进行修复"
echo "  • 定期运行此脚本以确保项目健康"
echo "  • 在部署前运行完整检查"
echo ""
echo "🚀 项目状态良好，可以开始开发！"