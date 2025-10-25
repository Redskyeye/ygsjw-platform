# 安装指南

本指南将帮助您在本地环境中完整安装和配置史诗AI项目。

## 📋 系统要求

### 最低要求

- **操作系统**: Windows 10+, macOS 10.15+, Ubuntu 18.04+
- **内存**: 8GB RAM (推荐16GB+)
- **存储**: 10GB可用空间
- **网络**: 稳定的互联网连接（AI API调用）

### 软件依赖

- **Node.js** >= 18.0.0
- **npm** >= 8.0.0 或 **pnpm** >= 7.0.0
- **PostgreSQL** >= 13.0
- **Redis** >= 6.0 (可选，用于缓存)
- **Git** >= 2.30.0

## 🔧 环境准备

### 1. 安装Node.js

#### 使用官方安装包

1. 访问 [Node.js官网](https://nodejs.org/)
2. 下载LTS版本（推荐18.x或更高）
3. 运行安装程序并按提示完成安装

#### 使用版本管理器 (推荐)

**macOS/Linux (使用nvm):**

```bash
# 安装nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# 重新加载shell配置
source ~/.bashrc  # 或 ~/.zshrc

# 安装Node.js LTS
nvm install --lts
nvm use --lts
```

**Windows (使用nvm-windows):**

1. 下载 [nvm-windows](https://github.com/coreybutler/nvm-windows/releases)
2. 运行安装程序
3. 在命令行中执行：

```cmd
nvm install lts
nvm use lts
```

### 2. 安装包管理器

#### pnpm (推荐)

```bash
npm install -g pnpm
```

#### 验证安装

```bash
node --version  # 应该 >= 18.0.0
npm --version   # 应该 >= 8.0.0
pnpm --version  # 如果安装了pnpm
```

### 3. 安装PostgreSQL

#### macOS (使用Homebrew)

```bash
# 安装Homebrew (如果没有)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 安装PostgreSQL
brew install postgresql@14

# 启动PostgreSQL服务
brew services start postgresql@14
```

#### Ubuntu/Debian

```bash
# 更新包列表
sudo apt update

# 安装PostgreSQL
sudo apt install postgresql postgresql-contrib

# 启动PostgreSQL服务
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### Windows

1. 访问 [PostgreSQL官网](https://www.postgresql.org/download/windows/)
2. 下载并运行安装程序
3. 记住安装时设置的密码

### 4. 安装Redis (可选)

#### macOS

```bash
brew install redis
brew services start redis
```

#### Ubuntu/Debian

```bash
sudo apt install redis-server
sudo systemctl start redis-server
```

#### Windows

```bash
# 使用WSL或Windows版本
# 下载地址: https://github.com/microsoftarchive/redis/releases
```

## 🚀 项目安装

### 1. 克隆项目

```bash
# 克隆仓库
git clone https://github.com/Redskyeye/ygsjw-platform.git
cd epic-ai

# 或者使用SSH
git clone git@github.com:Redskyeye/ygsjw-platform.git
cd epic-ai
```

### 2. 安装依赖

```bash
# 使用pnpm (推荐)
pnpm install

# 或使用npm
npm install
```

### 3. 环境配置

#### 复制环境变量模板

```bash
cp .env.example .env.local
```

#### 编辑环境变量

```bash
# 使用nano编辑器
nano .env.local

# 或使用VS Code
code .env.local
```

#### 必需的环境变量配置

```env
# 应用基础配置
NODE_ENV=development
NEXT_PUBLIC_APP_NAME=史诗AI
NEXT_PUBLIC_APP_VERSION=0.1.0
NEXT_PUBLIC_APP_URL=http://localhost:3000

# 数据库配置
DATABASE_URL="postgresql://username:password@localhost:5432/epic_ai"

# 认证配置
NEXTAUTH_SECRET=your-super-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# AI服务配置
OPENAI_API_KEY=your-openai-api-key
ANTHROPIC_API_KEY=your-anthropic-api-key

# 可选服务
REDIS_URL=redis://localhost:6379

# 邮件服务 (可选)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### 4. 获取API密钥

#### OpenAI API密钥

1. 访问 [OpenAI Platform](https://platform.openai.com/)
2. 注册并登录账户
3. 进入API Keys页面
4. 创建新的API密钥
5. 将密钥复制到`.env.local`文件中

#### Anthropic API密钥

1. 访问 [Anthropic Console](https://console.anthropic.com/)
2. 注册并登录账户
3. 进入API Keys页面
4. 创建新的API密钥
5. 将密钥复制到`.env.local`文件中

## 🗄️ 数据库设置

### 1. 创建数据库

#### 使用psql命令行

```bash
# 连接到PostgreSQL
psql -U postgres

# 创建数据库
CREATE DATABASE epic_ai;

# 创建用户 (可选)
CREATE USER epic_ai_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE epic_ai TO epic_ai_user;

# 退出
\q
```

#### 使用pgAdmin

1. 打开pgAdmin
2. 连接到本地PostgreSQL服务器
3. 右键点击"Databases" → "Create" → "Database"
4. 输入数据库名称 `epic_ai`
5. 点击"Save"

### 2. 配置Prisma

```bash
# 生成Prisma客户端
npx prisma generate

# 推送数据库架构
npx prisma db push

# (可选) 运行种子数据
npx prisma db seed
```

### 3. 验证数据库连接

```bash
# 打开Prisma Studio查看数据库
npx prisma studio
```

浏览器会自动打开 `http://localhost:5555`

## 🎯 启动项目

### 1. 开发模式启动

```bash
# 使用pnpm
pnpm dev

# 或使用npm
npm run dev
```

### 2. 验证安装

访问以下URL验证各个组件：

- **主应用**: [http://localhost:3000](http://localhost:3000)
- **API健康检查**: [http://localhost:3000/api/health](http://localhost:3000/api/health)
- **Prisma Studio**: [http://localhost:5555](http://localhost:5555)

### 3. 运行测试

```bash
# 运行所有测试
npm test

# 运行测试并生成覆盖率报告
npm run test:coverage
```

## 🛠️ 开发工具配置

### 1. VS Code扩展

推荐安装以下VS Code扩展：

```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "prisma.prisma",
    "ms-vscode.vscode-json",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "ms-vscode.vscode-jest"
  ]
}
```

### 2. Git配置

```bash
# 配置用户信息
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# 配置默认编辑器
git config --global core.editor "code --wait"

# 配置分支策略
git config --global init.defaultBranch main
```

### 3. ESLint和Prettier配置

项目已预配置ESLint和Prettier，可以通过以下命令使用：

```bash
# 代码检查
npm run lint

# 自动修复
npm run lint:fix

# 代码格式化
npm run format
```

## 🐛 常见问题

### 1. Node.js版本问题

```bash
# 错误: Node.js版本过低
# 解决: 升级到Node.js 18+

# 检查当前版本
node --version

# 使用nvm切换版本
nvm use 18
```

### 2. 数据库连接失败

```bash
# 检查PostgreSQL服务状态
brew services list | grep postgresql  # macOS
sudo systemctl status postgresql      # Linux

# 重启PostgreSQL服务
brew services restart postgresql@14   # macOS
sudo systemctl restart postgresql     # Linux
```

### 3. 端口被占用

```bash
# 查找占用3000端口的进程
lsof -ti:3000

# 杀死进程
kill -9 $(lsof -ti:3000)

# 或使用其他端口
PORT=3001 npm run dev
```

### 4. 依赖安装失败

```bash
# 清理缓存
npm cache clean --force
# 或
pnpm store prune

# 删除node_modules重新安装
rm -rf node_modules package-lock.json
npm install
```

### 5. Prisma生成失败

```bash
# 重新生成Prisma客户端
npx prisma generate

# 检查schema文件
npx prisma validate
```

## 📞 获取帮助

如果您在安装过程中遇到问题：

1. 查看[项目FAQ](faq.md)
2. 搜索[GitHub Issues](https://github.com/Redskyeye/ygsjw-platform/issues)
3. 创建新的Issue描述您的问题
4. 联系开发团队

---

🎉 **恭喜！** 您已成功安装史诗AI项目。现在可以开始探索和开发了。查看[快速上手指南](quick-start.md)了解下一步操作。
