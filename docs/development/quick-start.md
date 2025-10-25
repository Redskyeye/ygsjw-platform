# 快速上手指南

欢迎使用史诗AI平台！本指南将帮助您在5分钟内快速体验项目的核心功能。

## 🚀 快速体验

### 前置条件

确保您已经完成以下准备工作：

- ✅ 已安装 [Node.js 18+](installation.md#安装nodejs)
- ✅ 已安装 [PostgreSQL](installation.md#安装postgresql)
- ✅ 已获取 [AI API密钥](installation.md#获取api密钥)

### 1. 启动项目

```bash
# 进入项目目录
cd epic-ai

# 启动开发服务器
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

### 2. 注册账户

1. 点击页面右上角的"注册"按钮
2. 填写邮箱、密码和基本信息
3. 验证邮箱（如果配置了邮件服务）
4. 完成个人资料填写

### 3. 体验AI职业分析

#### 步骤1: 创建技能档案

1. 进入"技能评估"页面
2. 添加您的技能（如：JavaScript、React、Node.js）
3. 设置技能熟练度（初级、中级、高级）
4. 添加工作经历和教育背景

#### 步骤2: 获取职业建议

1. 点击"开始分析"按钮
2. 等待AI分析完成（通常需要10-30秒）
3. 查看详细的职业发展建议

#### 步骤3: AI咨询服务

1. 进入"AI咨询"页面
2. 输入您的职业相关问题
3. 与AI职业规划师进行对话
4. 获取个性化的建议

## 🎯 核心功能演示

### 1. 技能评估

```typescript
// 示例：评估用户技能
const skillAssessment = await fetch('/api/career/assessment', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({
    skills: [
      { name: 'JavaScript', level: 'advanced' },
      { name: 'React', level: 'intermediate' },
      { name: 'Node.js', level: 'intermediate' },
    ],
    experience: 3,
    goals: ['全栈开发', '技术管理'],
  }),
});
```

**预期输出：**

```json
{
  "success": true,
  "data": {
    "skillScore": 8.5,
    "recommendedRoles": ["高级前端工程师", "全栈工程师"],
    "skillGaps": ["系统设计", "团队管理"],
    "marketDemand": "高",
    "salaryRange": "25-35K"
  }
}
```

### 2. AI职业咨询

```typescript
// 示例：AI咨询对话
const consultation = await fetch('/api/ai/consultation', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({
    message: '我想从前端转向全栈开发，应该学习哪些技术？',
    context: {
      currentSkills: ['JavaScript', 'React', 'CSS'],
      experience: 2,
    },
  }),
});
```

**预期AI回复：**

```
根据您的前端背景，我建议您按以下路径学习全栈开发：

1. **后端基础** (2-3个月)
   - Node.js 和 Express.js
   - RESTful API 设计
   - 数据库基础 (SQL)

2. **数据库技能** (1-2个月)
   - PostgreSQL 或 MySQL
   - ORM 框架 (Prisma/Sequelize)
   - 数据建模

3. **部署和运维** (1个月)
   - Docker 基础
   - 云平台部署 (AWS/阿里云)
   - CI/CD 基础

4. **进阶技能** (持续学习)
   - 微服务架构
   - 消息队列
   - 系统设计

建议您先从Node.js开始，因为它与您已有的JavaScript知识最接近...
```

## 🔧 开发者快速开始

### 1. 运行测试

```bash
# 运行所有测试
npm test

# 运行特定测试
npm test -- --testNamePattern="CareerAnalysis"

# 生成覆盖率报告
npm run test:coverage
```

### 2. 查看API文档

启动服务后，访问以下地址：

- API文档: [http://localhost:3000/api/docs](http://localhost:3000/api/docs)
- GraphQL Playground: [http://localhost:3000/api/graphql](http://localhost:3000/api/graphql)

### 3. 数据库管理

```bash
# 打开Prisma Studio
npx prisma studio

# 查看数据库状态
npx prisma db pull

# 重置数据库
npx prisma db push --force-reset
```

## 🎨 自定义配置

### 1. 修改AI模型配置

```env
# .env.local
# 使用不同的AI模型
OPENAI_MODEL=gpt-4
ANTHROPIC_MODEL=claude-3-sonnet

# 调整AI参数
AI_TEMPERATURE=0.7
AI_MAX_TOKENS=1000
```

### 2. 自定义提示词

```typescript
// lib/ai/prompts/custom.ts
export const CUSTOM_PROMPTS = {
  career_analysis: `
    你是一位资深的职业规划师，专注于互联网行业。
    请基于用户的技能和背景，提供专业的职业发展建议。
    要求：
    1. 分析要具体、可执行
    2. 推荐学习资源
    3. 预估学习时间
  `,
};
```

### 3. 添加新的评估维度

```typescript
// lib/career/dimensions.ts
export const ASSESSMENT_DIMENSIONS = {
  technical: {
    weight: 0.4,
    factors: ['编程能力', '系统设计', '工具使用'],
  },
  soft_skills: {
    weight: 0.3,
    factors: ['沟通能力', '团队合作', '领导力'],
  },
  market_fit: {
    weight: 0.3,
    factors: ['市场需求', '薪资水平', '发展前景'],
  },
};
```

## 📱 移动端体验

史诗AI平台支持响应式设计，您可以在移动设备上：

1. **手机浏览器访问**
   - 打开手机浏览器
   - 访问 `http://your-domain.com`
   - 体验移动端优化的界面

2. **PWA安装**
   - 在浏览器中点击"添加到主屏幕"
   - 享受类似原生应用的体验

## 🔍 常见问题

### Q: AI分析结果不准确怎么办？

A:

1. 检查技能信息是否完整
2. 尝试添加更多工作经历细节
3. 可以重新分析多次获得不同建议

### Q: API调用失败怎么办？

A:

1. 检查网络连接
2. 确认API密钥配置正确
3. 查看控制台错误信息
4. 参考[错误处理文档](../api/error-handling.md)

### Q: 如何提高分析准确性？

A:

1. 提供详细的技能信息
2. 包含真实的工作经历
3. 明确职业发展目标
4. 多次使用并积累数据

## 📞 获取帮助

如果您在快速上手过程中遇到问题：

1. **查看文档**: [完整文档](../README.md)
2. **搜索FAQ**: [常见问题](faq.md)
3. **GitHub Issues**: [提交问题](https://github.com/Redskyeye/ygsjw-platform/issues)
4. **联系支持**: support@epic-ai.com

## 🎉 下一步

恭喜您完成了快速上手！接下来您可以：

1. **深入学习**: 阅读[开发指南](README.md)
2. **查看API**: 浏览[API文档](../api/README.md)
3. **贡献代码**: 查看[贡献指南](../../CONTRIBUTING.md)
4. **部署应用**: 阅读[部署指南](../deployment/README.md)

---

💡 **提示**: 史诗AI平台正在持续改进中，欢迎您的反馈和建议！
