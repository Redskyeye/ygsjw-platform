# 更新日志

本文档记录了史诗AI项目的所有重要变更。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，
并且本项目遵循 [语义化版本](https://semver.org/lang/zh-CN/) 规范。

## [未发布]

### 计划中

- AI职业咨询功能
- 用户技能评估系统
- 个性化学习路径推荐
- 实时聊天界面
- 数据可视化仪表板

## [0.1.0] - 2024-XX-XX

### 新增

- 🎉 项目初始化和基础架构
- 📦 Next.js 14 + TypeScript 配置
- 🎨 Tailwind CSS 样式系统
- 🔧 ESLint + Prettier 代码质量工具
- 🚀 CI/CD GitHub Actions 工作流
- 📝 项目文档和贡献指南
- 🧪 Jest 测试框架配置
- 🔐 NextAuth.js 认证基础
- 🗄️ Prisma ORM 数据库配置
- 🎯 基础UI组件库（Button, Input, Card, Loading）

### 技术栈

- **前端**: Next.js 14, React 18, TypeScript 5.4
- **样式**: Tailwind CSS 3.4
- **状态管理**: React Hook Form, React Query
- **数据库**: PostgreSQL + Prisma ORM
- **认证**: NextAuth.js
- **测试**: Jest + Testing Library
- **代码质量**: ESLint, Prettier, Husky
- **CI/CD**: GitHub Actions

### 开发工具

- 🔧 完整的开发环境配置
- 📋 Git hooks 和提交规范
- 🎨 VS Code 工作区配置
- 📊 代码覆盖率报告
- 🚀 自动化部署流程

### 项目结构

```
src/
├── app/              # Next.js App Router
├── components/       # React组件
│   ├── ui/          # 基础UI组件
│   ├── common/      # 通用组件
│   └── forms/       # 表单组件
├── lib/             # 工具库和配置
├── types/           # TypeScript类型定义
└── styles/          # 样式文件
```

### 文档

- 📖 详细的项目README
- 🤝 贡献指南
- 📋 更新日志
- 🔧 开发环境设置说明

## [0.0.1] - 项目规划

### 概念设计

- 🎯 AI驱动的职业规划概念
- 👥 目标用户群体分析
- 🔧 技术架构设计
- 📊 功能模块规划

---

## 版本说明

### 版本号格式

我们使用语义化版本号：`主版本号.次版本号.修订号`

- **主版本号**：不兼容的API修改
- **次版本号**：向下兼容的功能性新增
- **修订号**：向下兼容的问题修正

### 变更类型

- `新增` - 新功能
- `变更` - 对现有功能的变更
- `弃用` - 即将移除的功能
- `移除` - 已移除的功能
- `修复` - 问题修复
- `安全` - 安全相关的修复

### 发布周期

- **主版本**: 根据需要发布
- **次版本**: 每月发布
- **修订版本**: 根据需要随时发布

---

**注意**: 对于 v0.x.x 版本，破坏性变更可能会在没有警告的情况下发布。请谨慎在生产环境中使用。
