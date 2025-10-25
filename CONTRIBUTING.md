# 贡献指南

感谢您对史诗AI项目的关注！我们欢迎所有形式的贡献，包括但不限于：

- 🐛 报告Bug
- 💡 提出新功能建议
- 📝 改进文档
- 🔧 提交代码修复
- ✨ 开发新功能
- 🧪 编写测试用例
- 🤖 AI模型优化和算法改进
- 📊 数据集扩充和质量提升
- 🎨 用户体验和界面优化
- 🔍 性能分析和优化

## 🚀 开始之前

在开始贡献之前，请确保：

1. **阅读项目文档** - 了解项目结构和技术栈
2. **查看现有Issues** - 避免重复工作
3. **了解开发规范** - 遵循项目的代码风格和工作流程

## 📋 开发环境设置

### 1. Fork和克隆

```bash
# Fork项目到您的GitHub账户
# 然后克隆到本地
git clone https://github.com/YOUR_USERNAME/epic-ai.git
cd epic-ai

# 添加上游仓库
git remote add upstream https://github.com/ORIGINAL_OWNER/epic-ai.git
```

### 2. 安装依赖

```bash
# 使用npm
npm install

# 或使用pnpm（推荐）
pnpm install
```

### 3. 环境配置

```bash
# 复制环境变量模板
cp .env.example .env.local

# 编辑环境变量
# 填入必要的API密钥和配置
```

### 4. 启动开发服务器

```bash
npm run dev
```

## 🌟 分支策略

我们使用Git Flow工作流：

### 主要分支

- `main` - 生产环境代码
- `develop` - 开发环境代码

### 功能分支

- `feature/功能名称` - 新功能开发
- `bugfix/问题描述` - Bug修复
- `hotfix/紧急修复` - 生产环境紧急修复
- `docs/文档更新` - 文档更新

### 分支命名规范

```bash
feature/user-authentication
feature/ai-consultation-service
bugfix/login-validation-error
hotfix/security-patch
docs/api-documentation-update
```

## 📝 提交规范

我们遵循 [Conventional Commits](https://conventionalcommits.org/) 规范：

### 提交格式

```
<类型>[可选的作用域]: <描述>

[可选的正文]

[可选的脚注]
```

### 提交类型

- `feat`: 新功能
- `fix`: Bug修复
- `docs`: 文档更新
- `style`: 代码格式化（不影响功能）
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建过程或辅助工具的变动
- `perf`: 性能优化
- `ci`: CI配置相关
- `build`: 构建系统相关

### 示例

```bash
feat(auth): add user registration with email verification

fix: resolve login validation error for special characters

docs: update API documentation for consultation endpoints

test: add unit tests for user service utilities
```

## 🔍 代码审查流程

### 1. 创建Pull Request

```bash
# 确保分支是最新的
git checkout develop
git pull upstream develop
git checkout your-feature-branch
git rebase develop

# 推送到您的Fork
git push origin your-feature-branch

# 在GitHub上创建Pull Request
```

### 2. PR描述模板

```markdown
## 📝 变更描述

简要描述此PR的内容和目的。

## 🔄 变更类型

- [ ] Bug修复
- [ ] 新功能
- [ ] 文档更新
- [ ] 代码重构
- [ ] 性能优化
- [ ] 其他: \***\*\_\_\_\*\***

## 🧪 测试

- [ ] 已添加新的测试用例
- [ ] 所有现有测试通过
- [ ] 已在本地手动测试

## 📸 截图（如适用）

如果涉及UI变更，请提供前后对比截图。

## 📋 检查清单

- [ ] 代码遵循项目规范
- [ ] 已运行linter和格式化工具
- [ ] 提交信息符合规范
- [ ] 已更新相关文档
- [ ] 无合并冲突

## 🔗 相关Issue

关联的Issue编号：#xxx
```

### 3. 审查要求

- **至少一位维护者批准**
- **通过所有CI检查**
- **代码覆盖率不降低**
- **文档及时更新**

## 📐 代码规范

### TypeScript/JavaScript

- 使用TypeScript编写新代码
- 优先使用函数式编程
- 避免使用`any`类型
- 使用有意义的变量和函数名

### React组件

- 使用函数组件和Hooks
- 遵循单一职责原则
- 为组件添加PropTypes或TypeScript接口
- 使用memo优化性能

### CSS/Styling

- 优先使用Tailwind CSS
- 保持样式的一致性
- 使用响应式设计
- 遵循移动优先原则

### 命名约定

- **文件名**: kebab-case (`user-profile.tsx`)
- **组件名**: PascalCase (`UserProfile`)
- **变量名**: camelCase (`userName`)
- **常量名**: UPPER_SNAKE_CASE (`API_BASE_URL`)

## 🤖 AI开发规范

### AI模型集成

- **API密钥管理**: 永远不要在代码中硬编码API密钥
- **错误处理**: 优雅处理AI API限制和错误
- **响应缓存**: 合理缓存AI响应以减少成本
- **用户隐私**: 确保用户数据安全，遵循隐私保护原则

### AI功能开发

```typescript
// 示例：AI服务调用
import { openai } from '@/lib/ai';

export class CareerConsultantService {
  async generateCareerAdvice(profile: UserProfile): Promise<string> {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: '你是一位专业的职业规划师...' },
          { role: 'user', content: this.formatProfileForAI(profile) },
        ],
        max_tokens: 1000,
        temperature: 0.7,
      });

      return (
        response.choices[0]?.message?.content || '抱歉，暂时无法生成建议。'
      );
    } catch (error) {
      console.error('AI服务调用失败:', error);
      throw new Error('AI服务暂时不可用，请稍后再试。');
    }
  }
}
```

### 数据隐私和伦理

- **数据最小化**: 只收集必要的用户信息
- **透明度**: 向用户说明AI如何使用他们的数据
- **偏见控制**: 定期检查和减少AI模型中的偏见
- **用户控制**: 允许用户控制和删除他们的数据

### 性能优化

- **异步处理**: 使用异步调用避免阻塞用户界面
- **结果缓存**: 缓存常见的AI分析结果
- **批处理**: 合并多个小请求以减少API调用
- **降级策略**: 在AI服务不可用时提供备选方案

## 🧪 测试指南

### 测试类型

- **单元测试**: 测试单个函数或组件
- **集成测试**: 测试模块间的交互
- **端到端测试**: 测试完整的用户流程

### 编写测试

```typescript
// 示例：工具函数测试
import { formatDate, isValidEmail } from '@/lib/utils';

describe('Utils', () => {
  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date('2024-01-15');
      expect(formatDate(date)).toBe('2024年1月15日');
    });
  });

  describe('isValidEmail', () => {
    it('should validate email format', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('invalid-email')).toBe(false);
    });
  });
});
```

### AI功能测试

```typescript
// 示例：AI服务测试
import { CareerConsultantService } from '@/lib/services/career-consultant';
import { mockOpenAIResponse } from '@/__mocks__/openai';

jest.mock('@/lib/ai/openai');

describe('CareerConsultantService', () => {
  let service: CareerConsultantService;

  beforeEach(() => {
    service = new CareerConsultantService();
  });

  it('should generate career advice successfully', async () => {
    const mockProfile = {
      name: '张三',
      skills: ['JavaScript', 'React'],
      experience: 2,
    };

    mockOpenAIResponse.mockResolvedValue({
      choices: [
        {
          message: { content: '基于您的技能，建议您向全栈开发方向发展...' },
        },
      ],
    });

    const advice = await service.generateCareerAdvice(mockProfile);
    expect(advice).toContain('全栈开发');
  });

  it('should handle API errors gracefully', async () => {
    mockOpenAIResponse.mockRejectedValue(new Error('API limit exceeded'));

    await expect(service.generateCareerAdvice({})).rejects.toThrow(
      'AI服务暂时不可用'
    );
  });
});
```

### Mock和测试数据

- 使用Mock服务替代真实的AI API调用
- 准备多样化的测试数据集
- 测试边界情况和错误处理
- 验证响应格式和数据结构

### 运行测试

```bash
# 运行所有测试
npm test

# 监视模式
npm run test:watch

# 生成覆盖率报告
npm run test:coverage
```

## 🐛 报告Bug

### Bug报告模板

```markdown
## 🐛 Bug描述

简要描述遇到的问题。

## 🔄 复现步骤

1. 进入 '...'
2. 点击 '....'
3. 滚动到 '....'
4. 看到错误

## 🌐 期望行为

描述您期望发生的情况。

## 📸 截图

如果适用，请添加截图来帮助解释问题。

## 🖥️ 环境信息

- 操作系统: [例如 iOS]
- 浏览器: [例如 chrome, safari]
- 版本: [例如 22]

## 📋 附加信息

添加任何其他关于问题的信息。
```

## 💡 功能建议

### 功能建议模板

```markdown
## 🚀 功能描述

简要描述您希望添加的功能。

## 💡 动机

为什么这个功能对您或其他用户有用？

## 📝 详细描述

提供功能的详细描述，包括：

- 用户界面设计
- 交互流程
- 技术实现考虑

## 🎨 替代方案

描述您考虑过的任何替代解决方案或功能。

## 📋 附加信息

添加任何其他关于功能请求的信息。
```

## 📚 文档贡献

### 文档类型

- **API文档**: 接口说明和使用示例
- **用户指南**: 功能使用说明
- **开发文档**: 技术实现细节
- **部署文档**: 环境配置和部署指南

### 文档规范

- 使用清晰简洁的语言
- 提供代码示例
- 包含相关的截图和图表
- 保持文档的及时更新

## 🏆 贡献者认可

我们重视每一位贡献者的努力：

- 在项目README中列出主要贡献者
- 在发布说明中感谢贡献者
- 为重要贡献提供项目维护者权限

## 📞 获取帮助

如果您有任何问题或需要帮助：

1. **查看文档**: 阅读项目文档和FAQ
2. **搜索Issues**: 查看是否有类似问题已被讨论
3. **创建Issue**: 在GitHub上创建新的Issue
4. **联系维护者**: 通过邮件或Discord联系项目维护者

## 📜 行为准则

请阅读并遵守我们的[行为准则](CODE_OF_CONDUCT.md)，确保为所有参与者创造一个友好和包容的环境。

---

再次感谢您的贡献！🎉
