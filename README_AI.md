# 史诗AI - 职业规划师平台

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14.2.3-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4.5-blue)](https://www.typescriptlang.org/)

> AI驱动的职业规划与指导平台，帮助用户发现职业潜能，制定个性化发展路径。

## 🌟 项目简介

史诗AI是一个基于人工智能的职业规划平台，通过先进的AI技术为用户提供：

- **智能职业评估** - 基于用户技能、兴趣和经验进行全方位分析
- **个性化发展路径** - 为用户量身定制职业发展计划
- **实时AI咨询** - 7x24小时AI职业导师服务
- **技能差距分析** - 识别目标职位所需的技能差距
- **学习资源推荐** - 智能推荐课程、项目和学习材料

## 🚀 技术栈

### 前端技术

- **Next.js 14** - React全栈框架
- **TypeScript** - 类型安全的JavaScript
- **Tailwind CSS** - 实用优先的CSS框架
- **React Hook Form** - 高性能表单库

### 后端技术

- **Next.js API Routes** - 服务端API
- **Prisma** - 现代数据库ORM
- **PostgreSQL** - 主数据库
- **NextAuth.js** - 身份验证

### AI集成

- **OpenAI API** - GPT模型集成
- **Anthropic Claude** - 高级AI分析

### 开发工具

- **ESLint** - 代码质量检查
- **Prettier** - 代码格式化
- **Husky** - Git hooks
- **Jest** - 单元测试

## 📦 项目结构

```
epic-ai/
├── src/
│   ├── app/                # Next.js App Router
│   │   ├── layout.tsx      # 根布局
│   │   ├── page.tsx        # 首页
│   │   ├── api/            # API路由
│   │   └── globals.css     # 全局样式
│   ├── components/         # React组件
│   │   ├── ui/             # 基础UI组件
│   │   ├── common/         # 通用组件
│   │   └── forms/          # 表单组件
│   ├── lib/                # 工具库
│   │   ├── utils/          # 通用工具函数
│   │   ├── api/            # API配置
│   │   └── constants/      # 常量定义
│   ├── types/              # TypeScript类型定义
│   └── styles/             # 样式文件
├── public/                 # 静态资源
├── docs/                   # 项目文档
├── tests/                  # 测试文件
├── .github/                # GitHub配置
│   └── workflows/          # CI/CD工作流
└── .claude/                # Claude Code PM配置
```

## 🛠️ 开发环境设置

### 系统要求

- Node.js >= 18.0.0
- npm 或 pnpm
- PostgreSQL 数据库

### 安装步骤

1. **克隆项目**

```bash
git clone https://github.com/your-org/epic-ai.git
cd epic-ai
```

2. **安装依赖**

```bash
npm install
# 或
pnpm install
```

3. **环境配置**

```bash
cp .env.example .env.local
# 编辑 .env.local 文件，填入必要的环境变量
```

4. **数据库设置**

```bash
# 生成Prisma客户端
npx prisma generate

# 运行数据库迁移
npx prisma db push
```

5. **启动开发服务器**

```bash
npm run dev
# 或
pnpm dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 📋 可用脚本

```bash
# 开发
npm run dev          # 启动开发服务器
npm run build        # 构建生产版本
npm run start        # 启动生产服务器

# 代码质量
npm run lint         # 运行ESLint检查
npm run lint:fix     # 自动修复ESLint错误
npm run format       # 格式化代码
npm run type-check   # TypeScript类型检查

# 测试
npm run test         # 运行单元测试
npm run test:watch   # 监视模式运行测试
npm run test:coverage # 生成测试覆盖率报告

# 数据库
npx prisma studio    # 打开数据库管理界面
npx prisma db push   # 推送数据库模式更改
```

## 🔧 环境变量配置

创建 `.env.local` 文件并配置以下变量：

```env
# 应用配置
NODE_ENV=development
NEXT_PUBLIC_APP_NAME=史诗AI
NEXT_PUBLIC_APP_VERSION=0.1.0
NEXT_PUBLIC_APP_URL=http://localhost:3000

# 数据库
DATABASE_URL="postgresql://username:password@localhost:5432/epic_ai"

# 认证
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# AI服务
OPENAI_API_KEY=your-openai-api-key
ANTHROPIC_API_KEY=your-anthropic-api-key

# 其他服务
REDIS_URL=redis://localhost:6379
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## 🤝 贡献指南

我们欢迎所有形式的贡献！

### 开发流程

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

### 代码规范

- 使用 TypeScript 编写代码
- 遵循 ESLint 和 Prettier 配置
- 编写单元测试覆盖新功能
- 提交信息遵循 [Conventional Commits](https://conventionalcommits.org/) 规范

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- [Next.js](https://nextjs.org/) - React全栈框架
- [Tailwind CSS](https://tailwindcss.com/) - CSS框架
- [Prisma](https://www.prisma.io/) - 数据库ORM
- [OpenAI](https://openai.com/) - AI技术支持

## 📞 联系我们

- 项目主页: [https://github.com/your-org/epic-ai](https://github.com/your-org/epic-ai)
- 问题反馈: [Issues](https://github.com/your-org/epic-ai/issues)
- 邮箱: team@epic-ai.com

---

⭐ 如果这个项目对你有帮助，请给我们一个星标！
