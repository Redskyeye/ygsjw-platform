# 开发指南

欢迎来到史诗AI项目的开发指南！本文档将帮助您快速搭建开发环境，了解项目架构，并开始贡献代码。

## 📋 目录

- [环境要求](#环境要求)
- [快速开始](#快速开始)
- [项目架构](#项目架构)
- [开发工作流](#开发工作流)
- [调试技巧](#调试技巧)
- [性能优化](#性能优化)

## 🔧 环境要求

### 必需软件

- **Node.js** >= 18.0.0
- **npm** >= 8.0.0 或 **pnpm** >= 7.0.0 (推荐)
- **PostgreSQL** >= 13.0
- **Git** >= 2.30.0

### 推荐工具

- **VS Code** + 相关扩展
- **Postman** 或 **Insomnia** (API测试)
- **pgAdmin** 或 **DBeaver** (数据库管理)
- **Redis Desktop Manager** (缓存管理)

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/Redskyeye/ygsjw-platform.git
cd epic-ai
```

### 2. 安装依赖

```bash
# 使用npm
npm install

# 或使用pnpm (推荐)
pnpm install
```

### 3. 环境配置

```bash
# 复制环境变量模板
cp .env.example .env.local

# 编辑环境变量
nano .env.local
```

必需的环境变量：

```env
# 应用基础配置
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# 数据库
DATABASE_URL="postgresql://username:password@localhost:5432/epic_ai"

# AI服务API密钥
OPENAI_API_KEY=your-openai-api-key
ANTHROPIC_API_KEY=your-anthropic-api-key

# 认证
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
```

### 4. 数据库初始化

```bash
# 生成Prisma客户端
npx prisma generate

# 运行数据库迁移
npx prisma db push

# (可选) 添加种子数据
npx prisma db seed
```

### 5. 启动开发服务器

```bash
npm run dev
# 或
pnpm dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 🏗️ 项目架构

### 技术栈

- **前端**: Next.js 14 + React 18 + TypeScript
- **样式**: Tailwind CSS + Headless UI
- **后端**: Next.js API Routes
- **数据库**: PostgreSQL + Prisma ORM
- **认证**: NextAuth.js
- **AI**: OpenAI GPT + Anthropic Claude

### 目录结构

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # 认证相关页面
│   ├── (dashboard)/       # 仪表板页面
│   ├── api/               # API路由
│   │   ├── auth/          # 认证API
│   │   ├── users/         # 用户API
│   │   ├── career/        # 职业分析API
│   │   └── ai/            # AI相关API
│   ├── globals.css        # 全局样式
│   ├── layout.tsx         # 根布局
│   └── page.tsx           # 首页
├── components/            # React组件
│   ├── ui/               # 基础UI组件
│   ├── forms/            # 表单组件
│   ├── charts/           # 图表组件
│   └── layout/           # 布局组件
├── lib/                  # 工具库
│   ├── ai/               # AI服务
│   ├── api/              # API配置
│   ├── auth/             # 认证配置
│   ├── db/               # 数据库配置
│   └── utils/            # 工具函数
├── types/                # TypeScript类型
├── hooks/                # 自定义Hooks
└── styles/               # 样式文件
```

### 核心模块

#### 1. 认证模块 (`lib/auth/`)

- 基于NextAuth.js的用户认证
- 支持邮箱/密码和第三方登录
- JWT令牌管理

#### 2. AI服务模块 (`lib/ai/`)

- OpenAI和Claude API封装
- 智能提示词管理
- 响应缓存和错误处理

#### 3. 数据库模块 (`lib/db/`)

- Prisma客户端配置
- 数据库连接管理
- 查询优化

#### 4. API路由 (`app/api/`)

- RESTful API设计
- 请求验证和错误处理
- 速率限制

## 🔄 开发工作流

### 1. 分支策略

```bash
# 主分支
main        # 生产环境代码
develop     # 开发环境代码

# 功能分支
feature/功能名称
bugfix/问题描述
hotfix/紧急修复
```

### 2. 开发流程

```bash
# 1. 从develop创建功能分支
git checkout develop
git pull origin develop
git checkout -b feature/new-feature

# 2. 开发和测试
npm run dev
npm run test
npm run lint

# 3. 提交代码
git add .
git commit -m "feat: add new feature description"

# 4. 推送分支
git push origin feature/new-feature

# 5. 创建Pull Request
```

### 3. 代码规范

#### 提交信息规范

```bash
feat: 新功能
fix: 修复bug
docs: 文档更新
style: 代码格式化
refactor: 重构
test: 测试相关
chore: 构建工具或辅助工具的变动
```

#### 代码风格

- 使用TypeScript编写新代码
- 遵循ESLint和Prettier配置
- 使用有意义的变量和函数名
- 编写单元测试

## 🐛 调试技巧

### 1. 前端调试

```typescript
// 使用React DevTools
// 安装浏览器扩展
// 在组件中添加debugger
debugger;

// 使用console.log
console.log('Debug info:', data);

// 使用React Query DevTools
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
```

### 2. 后端调试

```typescript
// API路由中添加日志
export async function GET(request: Request) {
  console.log('API call received:', request.url);

  try {
    // 业务逻辑
  } catch (error) {
    console.error('API error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

### 3. 数据库调试

```bash
# 使用Prisma Studio
npx prisma studio

# 查看查询日志
npx prisma db pull --print
```

### 4. AI服务调试

```typescript
// 添加AI调用日志
export class AIService {
  async generateResponse(input: string) {
    console.log('AI Input:', input);

    try {
      const response = await openai.chat.completions.create({...});
      console.log('AI Response:', response);
      return response;
    } catch (error) {
      console.error('AI Error:', error);
      throw error;
    }
  }
}
```

## ⚡ 性能优化

### 1. 前端优化

```typescript
// 使用React.memo优化组件
export default React.memo(MyComponent);

// 使用useMemo优化计算
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data);
}, [data]);

// 使用useCallback优化函数
const handleClick = useCallback(() => {
  // 处理点击
}, [dependency]);
```

### 2. API优化

```typescript
// 实现响应缓存
export async function getCachedData(key: string) {
  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached);

  const data = await fetchFreshData();
  await redis.setex(key, 3600, JSON.stringify(data));
  return data;
}
```

### 3. 数据库优化

```typescript
// 使用索引优化查询
const users = await prisma.user.findMany({
  where: {
    email: 'user@example.com',
  },
  // 确保email字段有索引
});

// 使用select减少数据传输
const users = await prisma.user.findMany({
  select: {
    id: true,
    name: true,
    email: true,
  },
});
```

### 4. AI服务优化

```typescript
// 实现请求批处理
class AIRequestBatcher {
  private queue: Array<{ input: string; resolve: Function }> = [];

  async addRequest(input: string): Promise<string> {
    return new Promise(resolve => {
      this.queue.push({ input, resolve });
      this.processBatch();
    });
  }

  private async processBatch() {
    if (this.queue.length < 5) return;

    const batch = this.queue.splice(0, 5);
    const responses = await this.callAIAPI(batch.map(item => item.input));

    batch.forEach((item, index) => {
      item.resolve(responses[index]);
    });
  }
}
```

## 🔗 相关链接

- [API文档](../api/README.md)
- [AI集成指南](../ai/README.md)
- [部署指南](../deployment/README.md)
- [贡献指南](../../CONTRIBUTING.md)

---

💡 **提示**: 如果您在开发过程中遇到问题，请查看[常见问题](faq.md)或联系开发团队。
