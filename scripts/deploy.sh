#!/bin/bash

# 史诗AI项目部署脚本
# 使用方法: ./scripts/deploy.sh [environment]

set -e

ENVIRONMENT=${1:-production}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "🚀 史诗AI项目部署 - $ENVIRONMENT 环境"
echo "======================================"

# 进入项目目录
cd "$PROJECT_ROOT"

# 运行预部署检查
echo "🔍 运行预部署检查..."

echo "  • 运行类型检查..."
npm run type-check

echo "  • 运行代码检查..."
npm run lint

echo "  • 运行测试..."
npm run test:ci

echo "  • 构建项目..."
if [ "$ENVIRONMENT" = "production" ]; then
    NODE_ENV=production npm run build
else
    NODE_ENV=staging npm run build
fi

echo "✅ 预部署检查通过"

# 根据环境选择部署方式
case $ENVIRONMENT in
    "production")
        echo "🏭 部署到生产环境..."
        # 这里可以添加生产环境部署逻辑
        # 例如：docker、k8s、vercel等
        if command -v docker &> /dev/null; then
            echo "  • 使用Docker部署..."
            npm run docker:prod:build
        else
            echo "  • 使用传统部署方式..."
            npm run start:prod
        fi
        ;;
    "staging")
        echo "🧪 部署到预发布环境..."
        if command -v docker &> /dev/null; then
            echo "  • 使用Docker部署..."
            npm run docker:dev:build
        else
            echo "  • 使用传统部署方式..."
            npm run build && npm run start
        fi
        ;;
    "docker")
        echo "🐳 Docker部署..."
        npm run docker:prod:build
        ;;
    *)
        echo "❌ 未知环境: $ENVIRONMENT"
        echo "支持的环境: production, staging, docker"
        exit 1
        ;;
esac

echo ""
echo "🎉 部署完成！"
echo ""
echo "📊 部署信息："
echo "  环境: $ENVIRONMENT"
echo "  时间: $(date)"
echo "  版本: $(git rev-parse --short HEAD 2>/dev/null || echo 'unknown')"
echo ""
echo "🌐 如果部署成功，您的应用现在应该可以访问了。"