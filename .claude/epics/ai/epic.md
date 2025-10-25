---
name: ai
status: backlog
created: 2025-10-25T14:59:49Z
updated: 2025-10-25T15:59:00Z
progress: 0%
prd: .claude/prds/ai.md
github: https://github.com/Redskyeye/ygsjw-platform/issues/1
---

# Epic: AI赋能职业规划师平台（月光石）

## 概述

基于Next.js全栈架构构建的AI赋能职业规划师平台，通过四大核心功能（简历优化、面试辅导、效率工具、帮助中心）为职业规划师提供专业、高效的数字化工具。平台采用异步处理模式，所有AI功能通过N8N工作流实现，确保系统解耦和可扩展性。

## 架构决策

### 核心技术决策
1. **Next.js全栈架构**：采用App Router，支持SSR/SSG混合模式，提升SEO和首屏加载速度
2. **N8N工作流集成**：所有AI处理通过Webhook异步执行，前端不直接处理AI逻辑
3. **SQLite数据库**：轻量级部署，配合Prisma ORM实现类型安全的数据访问
4. **组件化设计**：基于shadcn/ui构建可复用的组件库，保持设计一致性
5. **订阅制模式**：集成Stripe实现付费订阅，控制用户使用权限

### 技术栈选择
- **前端框架**：Next.js 15 + React 19 + TypeScript
- **UI库**：Tailwind CSS v4 + shadcn/ui
- **状态管理**：Zustand（轻量级状态管理）
- **数据验证**：Zod schema（运行时类型验证）
- **认证系统**：NextAuth.js（支持邮箱密码登录）
- **数据库**：SQLite + Prisma ORM
- **文件处理**：本地存储 + Base64编码传输

### 设计模式应用
- **Repository Pattern**：数据访问层抽象，便于切换数据库
- **Service Pattern**：业务逻辑封装，保持代码整洁
- **Command Pattern**：N8N工作流调用，支持异步处理
- **Observer Pattern**：进度状态更新，实时反馈用户

## 技术方案

### 前端组件架构

#### 核心页面组件
```typescript
// 主要页面组件
- LandingPage: 首页展示（创始人故事、品牌价值、功能介绍）
- Dashboard: 用户仪表板（使用统计、快速入口、订阅状态）
- ResumeOptimizer: 简历优化（四步流程：上传→解析→配置→提交）
- InterviewCoach: 面试辅导（三步流程：上传→配置→生成）
- EfficiencyTool: 效率工具（两阶段分析：初步→深度）
- HelpCenter: 帮助中心（知识库、搜索、客服）
```

#### 通用UI组件库
```typescript
// 基础组件
- FileUploader: 文件上传组件（支持多格式、进度显示、错误处理）
- ProgressStepper: 步骤指示器（支持跳转和状态保存）
- DataForm: 动态表单组件（基于Zod schema验证）
- StatusCard: 任务状态展示卡片
- LoadingSpinner: 加载动画组件
- ErrorBoundary: 错误捕获和友好展示
```

### 后端服务架构

#### API路由设计
```typescript
// API路由组织
/app/api/
  /auth/           # NextAuth认证配置
  /resume/         # 简历优化相关
    /upload        # 文件上传接口
    /parse         # AI解析接口
    /optimize      # 提交优化接口
    /status        # 状态查询接口
  /interview/      # 面试辅导相关
    /upload        # 多文件上传
    /analyze       # 信息解析
    /generate      # PPT生成
    /status        # 状态查询
  /efficiency/     # 效率工具相关
    /analyze       # 初步分析
    /deep-analyze  # 深度分析
    /status        # 状态查询
  /help/           # 帮助中心相关
    /search        # 知识库搜索
    /faq           # FAQ接口
    /ticket        # 工单提交
  /user/           # 用户管理
    /profile       # 用户资料
    /usage         # 使用统计
    /subscription  # 订阅管理
```

#### 数据模型设计
```sql
-- 用户表
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT,
  subscription_tier TEXT DEFAULT 'free',
  subscription_expires_at DATETIME,
  daily_usage_limit INTEGER DEFAULT 5,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 简历任务表
CREATE TABLE resume_jobs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  original_filename TEXT,
  file_path TEXT,
  ai_extracted_data JSON,
  optimization_config JSON,
  status TEXT DEFAULT 'pending',
  result_path TEXT,
  webhook_job_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 面试任务表
CREATE TABLE interview_jobs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  resume_filename TEXT,
  resume_path TEXT,
  interview_files JSON,
  interview_data JSON,
  template_style TEXT,
  analysis_id TEXT,
  status TEXT DEFAULT 'pending',
  ppt_path TEXT,
  webhook_job_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 效率工具任务表
CREATE TABLE efficiency_jobs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  service_category TEXT,
  files JSON,
  text_content TEXT,
  analysis_4d JSON,
  confirmed_info JSON,
  user_answers JSON,
  additional_notes TEXT,
  analysis_id TEXT,
  status TEXT DEFAULT 'pending',
  report_path TEXT,
  webhook_job_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### 基础设施设计

#### 部署架构
- **容器化**：Docker + Docker Compose
- **反向代理**：Nginx（静态文件 + API代理）
- **进程管理**：PM2（生产环境）
- **监控**：自定义健康检查 + 日志聚合
- **备份**：SQLite自动备份策略

#### 监控可观测性
```typescript
// 监控指标
- 业务指标：任务完成率、AI成功率、用户活跃度
- 技术指标：API响应时间、错误率、资源使用
- 自定义监控：N8N工作流状态、队列积压
- 告警机制：失败任务自动重试 + 邮件通知
```

## 实施策略

### 开发阶段（12周）

#### Phase 1: 基础架构（3周）
1. **项目初始化**
   - 创建Next.js项目结构
   - 配置TypeScript + ESLint
   - 集成Tailwind CSS v4 + shadcn/ui
   - 实现品牌主题系统

2. **认证与用户系统**
   - 集成NextAuth.js
   - 实现用户注册/登录/登出
   - 创建用户资料管理
   - 实现基础订阅系统

3. **数据库与核心服务**
   - 配置Prisma + SQLite
   - 创建基础数据模型
   - 实现API基础架构
   - 配置N8N集成客户端

#### Phase 2: 简历优化模块（3周）
1. **文件处理系统**
   - 实现FileUploader组件
   - 添加文件格式验证
   - 实现Base64编码转换
   - 添加进度追踪

2. **AI解析与配置**
   - 集成N8N解析Webhook
   - 实现数据映射和字段转换
   - 创建参数配置界面
   - 实现智能信息提取

3. **优化流程**
   - 实现工作经历配置
   - 添加核心项目选择
   - 实现模式开关
   - 完成优化提交流程

#### Phase 3: 面试辅导模块（2周）
1. **多文件管理**
   - 扩展文件上传支持
   - 实现文本粘贴功能
   - 添加文件预览和管理

2. **面试信息配置**
   - 创建多步骤表单
   - 实现面试官类型选择
   - 添加PPT模板系统
   - 实现模板预览功能

3. **PPT生成集成**
   - 集成双Webhook流程
   - 实现两步数据处理
   - 添加生成进度跟踪
   - 完善错误处理机制

#### Phase 4: 效率工具模块（2周）
1. **4D分析系统**
   - 实现7大服务类别
   - 创建批量文件处理
   - 实现数据可视化
   - 添加问题确认机制

2. **两阶段分析流程**
   - 实现初步分析展示
   - 创建信息确认界面
   - 实现问题回答系统
   - 完成深度分析提交

#### Phase 5: 帮助中心模块（1周）
1. **知识库系统**
   - 实现Markdown内容管理
   - 创建分类系统
   - 实现全文搜索功能
   - 添加内容标签系统

2. **用户支持系统**
   - 集成在线客服
   - 实现工单提交系统
   - 创建FAQ管理界面
   - 添加新手引导流程

#### Phase 6: 优化与测试（1周）
1. **性能优化**
   - 实现代码分割和懒加载
   - 优化图片和静态资源
   - 实现缓存策略
   - 完成Bundle优化

2. **测试与质量保证**
   - 编写单元测试
   - 实现集成测试
   - 进行E2E测试
   - 修复关键Bug

### 风险缓解

#### 技术风险
1. **N8N稳定性**
   - 实现重试机制（指数退避）
   - 建立降级策略
   - 添加状态监控
   - 准备备选方案

2. **文件处理**
   - 多格式验证和转换
   - 大文件分块上传
   - 实现安全扫描
   - 添加自动清理机制

3. **数据安全**
   - 输入验证和清理
   - 数据加密存储
   - 实现访问控制
   - 遵循数据保护法规

## Tasks Created

### Phase 1: 基础架构（8个任务）
- [ ] #3 - 项目初始化与环境配置 (parallel: true) - 8小时
- [ ] #4 - Next.js + TypeScript + Tailwind CSS设置 (parallel: false) - 12小时
- [ ] #5 - shadcn/ui组件库集成 (parallel: false) - 10小时
- [ ] #6 - 品牌主题系统实现 (parallel: false) - 16小时
- [ ] #7 - NextAuth.js认证系统 (parallel: false) - 14小时
- [ ] #8 - Prisma + SQLite数据库 (parallel: false) - 12小时
- [ ] #8 - 基础API架构 (parallel: false) - 16小时
- [ ] #9 - N8N集成客户端 (parallel: false) - 16小时

### Phase 2: 简历优化（6个任务）- 旗舰功能
- [ ] #9 - 文件上传组件 (parallel: true) - 16小时
- [ ] #10 - AI解析集成 (parallel: true) - 20小时
- [ ] #11 - 数据映射与转换 (parallel: true) - 18小时
- [ ] #12 - 参数配置界面 (parallel: true) - 14小时
- [ ] #13 - 优化模式实现 (parallel: true) - 16小时
- [ ] #14 - 两步提交流程 (parallel: false) - 12小时

### Phase 3: 面试辅导（6个任务）
- [ ] #15 - 多文件上传扩展 (parallel: true) - 16小时
- [ ] #16 - 面试信息表单系统 (parallel: true) - 14小时
- [ ] #17 - PPT模板设计 (parallel: true) - 18小时
- [ ] #18 - 双Webhook数据流 (parallel: true) - 16小时
- [ ] #19 - 模板预览系统 (parallel: true) - 14小时
- [ ] #20 - 进度追踪完善 (parallel: false) - 12小时

### Phase 4: 效率工具（6个任务）
- [ ] #21 - 服务类别系统 (parallel: true) - 14小时
- [ ] #22 - 批量文件处理 (parallel: true) - 16小时
- [ ] #23 - 4D分析可视化 (parallel: true) - 20小时
- [ ] #24 - 两阶段分析流程 (parallel: true) - 18小时
- [ ] #25 - 问题确认系统 (parallel: true) - 16小时
- [ ] #26 - 报告生成集成 (parallel: false) - 16小时

### Phase 5: 帮助中心（4个任务）
- [ ] #27 - 知识库管理系统 (parallel: true) - 16小时
- [ ] #28 - 搜索功能实现 (parallel: true) - 18小时
- [ ] #29 - 客服集成 (parallel: true) - 16小时
- [ ] #30 - 工单系统 (parallel: false) - 14小时

### Phase 6: 优化测试（5个任务）
- [ ] #31 - 性能优化实施 (parallel: true) - 24小时
- [ ] #32 - 单元测试覆盖 (parallel: true) - 20小时
- [ ] #33 - 集成测试套件 (parallel: true) - 16小时
- [ ] #34 - E2E测试场景 (parallel: true) - 16小时
- [ ] #35 - 生产环境配置 (parallel: false) - 12小时

**任务统计**：
- 总任务数：35个
- 可并行任务：28个
- 串行任务：7个
- 预估总工时：518小时
- 平均任务时长：14.8小时

## 依赖关系

### 外部依赖
- **N8N平台**：AI处理核心
- **AI模型API**：已集成在N8N工作流
- **邮件服务**：通过N8N实现
- **云存储**：可选（用于文件备份）
- **客服系统**：第三方集成

### 内部依赖
- **前端开发团队**：UI/UX实现
- **N8N工作流团队**：AI流程维护
- **创始人刘坦**：产品方向和专业指导
- **运维支持**：部署和监控
- **客服团队**：用户支持

## 成功标准（技术）

### 性能基准
- 页面加载时间 < 2秒
- API响应时间 < 500ms（95th percentile）
- 文件上传速度 < 3秒（10MB）
- AI处理成功率 > 98%
- 系统可用性 > 99.5%

### 质量标准
- 代码覆盖率 > 80%
- 自动化测试覆盖核心流程
- 零严重安全漏洞
- 100% API文档覆盖
- 错误率 < 0.1%

### 用户体验
- 任务完成时间 < 15分钟
- 表单数据自动保存率 100%
- 错误信息友好度评分 > 4.5/5
- 移动端适配度评分 > 90/100

### 业务目标
- 简历优化转化率 > 95%
- AI分析准确度 > 90%
- 用户满意度 > 4.5/5
- 月活跃用户增长率 > 20%

## 预估工作量

### 总体时间线
- **MVP版本**：12周
- **正式版本**：16周（含优化期）
- **持续迭代**：每2周一个迭代

### 资源需求
- **前端开发**：2人
- **后端开发**：1人
- **UI/UX设计**：1人
- **测试**：1人（兼职）
- **DevOps**：1人（兼职）

### 关键路径
1. **第1-3周**：基础架构搭建
2. **第4-6周**：简历优化（旗舰功能）
3. **第7-8周**：面试辅导功能
4. **第9-10周**：效率工具实现
5. **第11周**：帮助中心上线
6. **第12周**：测试优化

## 总结

本Epic提供了月光石平台的完整技术实施路径，将刘坦20年的职业咨询经验与AI技术深度融合。通过模块化设计、渐进式开发和严格的质量保证，确保平台不仅能满足当前需求，更能支撑未来的扩展。

**核心价值**：
1. **专业性**：真正理解职业规划师需求
2. **智能化**：AI赋能而非替代
3. **易用性**：简洁直观的用户体验
4. **可靠性**：稳健的技术架构

**创新亮点**：
- 4D分析框架
- 两阶段智能处理流程
- 自动化进度追踪
- 品牌故事融入产品

月光石将成为职业规划师得力的AI助手，让每一位职业规划师都能更好地服务客户，成就更多人的职业梦想。