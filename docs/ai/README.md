# AI集成指南

史诗AI平台集成了多个先进的AI模型，为用户提供智能化的职业规划服务。本文档详细介绍AI系统的架构、集成方法和最佳实践。

## 📋 目录

- [AI架构概览](#ai架构概览)
- [支持的AI模型](#支持的ai模型)
- [集成方式](#集成方式)
- [API使用指南](#api使用指南)
- [提示词工程](#提示词工程)
- [性能优化](#性能优化)
- [错误处理](#错误处理)
- [成本控制](#成本控制)

## 🏗️ AI架构概览

### 系统架构图

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   前端应用      │    │   API网关       │    │   AI服务层      │
│                 │    │                 │    │                 │
│ - React组件     │◄──►│ - 请求路由      │◄──►│ - 模型适配器    │
│ - 用户界面      │    │ - 认证授权      │    │ - 提示词管理    │
│ - 交互逻辑      │    │ - 限流控制      │    │ - 响应缓存      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                       │
                       ┌─────────────────┐             │
                       │   数据存储层    │             ▼
                       │                 │    ┌─────────────────┐
                       │ - 用户数据      │    │   外部AI服务    │
                       │ - 分析结果      │    │                 │
                       │ - 缓存数据      │    │ - OpenAI GPT    │
                       │ - 日志记录      │    │ - Claude        │
                       └─────────────────┘    │ - 其他模型      │
                                              └─────────────────┘
```

### 核心组件

#### 1. AI服务管理器 (`lib/ai/manager.ts`)

- 统一管理多个AI模型
- 智能路由和负载均衡
- 错误重试和降级处理

#### 2. 提示词模板引擎 (`lib/ai/prompts/`)

- 动态提示词生成
- 多语言支持
- 个性化定制

#### 3. 响应处理器 (`lib/ai/processors/`)

- 响应格式标准化
- 内容过滤和安全检查
- 结果缓存管理

#### 4. 监控和分析 (`lib/ai/monitoring/`)

- API调用统计
- 成本跟踪
- 性能监控

## 🤖 支持的AI模型

### 1. OpenAI GPT系列

| 模型          | 用途               | 优势                   | 成本 |
| ------------- | ------------------ | ---------------------- | ---- |
| GPT-4         | 复杂推理、专业咨询 | 高质量输出、强理解能力 | 高   |
| GPT-4 Turbo   | 平衡性能和成本     | 快速响应、成本适中     | 中   |
| GPT-3.5 Turbo | 简单对话、快速响应 | 低延迟、低成本         | 低   |

### 2. Anthropic Claude

| 模型            | 用途                 | 优势                 | 成本 |
| --------------- | -------------------- | -------------------- | ---- |
| Claude-3 Opus   | 复杂分析、长文本处理 | 强分析能力、大上下文 | 高   |
| Claude-3 Sonnet | 通用对话、内容生成   | 平衡性能和质量       | 中   |
| Claude-3 Haiku  | 快速响应、简单任务   | 低延迟、低成本       | 低   |

### 3. 专用模型

| 类型     | 模型                   | 用途           |
| -------- | ---------------------- | -------------- |
| 嵌入模型 | text-embedding-ada-002 | 文本相似度计算 |
| 图像分析 | GPT-4 Vision           | 简历图像解析   |
| 语音识别 | Whisper                | 语音转文本     |

## 🔌 集成方式

### 1. 直接API集成

```typescript
import { openai } from '@/lib/ai/providers/openai';

export class OpenAIService {
  async generateCareerAdvice(profile: UserProfile): Promise<string> {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: '你是一位专业的职业规划师...',
        },
        {
          role: 'user',
          content: this.formatProfileForAI(profile),
        },
      ],
      max_tokens: 1000,
      temperature: 0.7,
      presence_penalty: 0.1,
      frequency_penalty: 0.1,
    });

    return response.choices[0]?.message?.content || '';
  }
}
```

### 2. 统一AI服务接口

```typescript
import { AIServiceManager } from '@/lib/ai/manager';

const aiManager = new AIServiceManager();

// 自动选择最适合的模型
const advice = await aiManager.generateCareerAdvice({
  profile: userProfile,
  complexity: 'medium', // low, medium, high
  language: 'zh-CN',
  maxTokens: 1000,
});
```

### 3. 流式响应处理

```typescript
export async function* streamCareerAdvice(
  profile: UserProfile
): AsyncGenerator<string, void, unknown> {
  const stream = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: formatProfile(profile) }],
    stream: true,
    max_tokens: 1000,
  });

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content;
    if (content) {
      yield content;
    }
  }
}
```

## 📝 API使用指南

### 基础配置

```typescript
// lib/ai/config.ts
export const AI_CONFIG = {
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_BASE_URL,
    maxRetries: 3,
    timeout: 30000,
  },
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY,
    maxRetries: 3,
    timeout: 30000,
  },
  cache: {
    ttl: 3600, // 1小时
    maxSize: 1000, // 最大缓存条目
  },
};
```

### 职业分析服务

```typescript
// lib/ai/services/career-analysis.ts
export class CareerAnalysisService {
  private aiManager: AIServiceManager;
  private cache: CacheService;

  constructor() {
    this.aiManager = new AIServiceManager();
    this.cache = new CacheService();
  }

  async analyzeSkills(skills: string[]): Promise<SkillAnalysis> {
    const cacheKey = `skill_analysis:${skills.join(',')}`;

    // 检查缓存
    const cached = await this.cache.get(cacheKey);
    if (cached) return cached;

    // 生成分析
    const analysis = await this.aiManager.generate({
      prompt: this.buildSkillAnalysisPrompt(skills),
      model: 'gpt-4',
      temperature: 0.3,
      maxTokens: 1500,
    });

    // 解析响应
    const result = this.parseSkillAnalysis(analysis);

    // 缓存结果
    await this.cache.set(cacheKey, result, 3600);

    return result;
  }

  private buildSkillAnalysisPrompt(skills: string[]): string {
    return `
作为专业的职业分析师，请分析以下技能组合：

技能列表：${skills.join(', ')}

请提供：
1. 技能匹配度评分 (1-10分)
2. 推荐的职业方向
3. 技能提升建议
4. 市场需求分析

请以JSON格式返回结果。
`;
  }
}
```

### AI咨询服务

```typescript
// lib/ai/services/consultation.ts
export class AIConsultationService {
  async startConsultation(
    userId: string,
    initialQuery: string
  ): Promise<ConsultationSession> {
    // 创建会话
    const session = await this.createSession(userId);

    // 获取用户上下文
    const userContext = await this.getUserContext(userId);

    // 生成初始回复
    const response = await this.aiManager.generate({
      prompt: this.buildConsultationPrompt(initialQuery, userContext),
      model: 'gpt-4',
      temperature: 0.7,
      maxTokens: 800,
    });

    // 保存对话
    await this.saveMessage(session.id, 'user', initialQuery);
    await this.saveMessage(session.id, 'assistant', response);

    return {
      sessionId: session.id,
      initialResponse: response,
    };
  }

  async continueConsultation(
    sessionId: string,
    message: string
  ): Promise<string> {
    // 获取对话历史
    const history = await this.getConversationHistory(sessionId);

    // 生成回复
    const response = await this.aiManager.generate({
      messages: [...history, { role: 'user', content: message }],
      model: 'gpt-4',
      temperature: 0.7,
      maxTokens: 800,
    });

    // 保存对话
    await this.saveMessage(sessionId, 'user', message);
    await this.saveMessage(sessionId, 'assistant', response);

    return response;
  }
}
```

## 🎯 提示词工程

### 提示词模板系统

```typescript
// lib/ai/prompts/templates.ts
export class PromptTemplate {
  private static templates = new Map<string, string>();

  static register(name: string, template: string): void {
    this.templates.set(name, template);
  }

  static render(name: string, variables: Record<string, any>): string {
    const template = this.templates.get(name);
    if (!template) throw new Error(`Template ${name} not found`);

    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return variables[key] || match;
    });
  }
}

// 注册提示词模板
PromptTemplate.register(
  'career_analysis',
  `
你是一位专业的职业规划师，拥有10年以上的行业经验。

用户信息：
- 姓名：{{name}}
- 技能：{{skills}}
- 工作经验：{{experience}}年
- 教育背景：{{education}}
- 职业目标：{{goals}}

请基于以上信息，为用户提供个性化的职业发展建议，包括：
1. 当前技能评估
2. 职业发展路径
3. 技能提升建议
4. 市场机会分析

请以友好、专业的语气回复，字数控制在800字以内。
`
);
```

### 动态提示词生成

```typescript
// lib/ai/prompts/dynamic.ts
export class DynamicPromptGenerator {
  generatePersonalizedPrompt(userId: string, context: RequestContext): string {
    const userProfile = this.getUserProfile(userId);
    const conversationHistory = this.getRecentHistory(userId);

    let prompt = this.getBasePrompt(context.type);

    // 添加用户上下文
    prompt += `\n\n用户背景：${this.formatUserProfile(userProfile)}`;

    // 添加最近对话历史
    if (conversationHistory.length > 0) {
      prompt += `\n\n最近对话：${this.formatHistory(conversationHistory)}`;
    }

    // 添加特定指令
    prompt += this.getSpecificInstructions(context);

    return prompt;
  }

  private getSpecificInstructions(context: RequestContext): string {
    const instructions = {
      career_advice: '请提供具体、可执行的职业建议。',
      skill_assessment: '请客观评估用户的技能水平。',
      interview_prep: '请提供实用的面试技巧和建议。',
    };

    return instructions[context.type] || '';
  }
}
```

## ⚡ 性能优化

### 1. 响应缓存

```typescript
// lib/ai/cache/response-cache.ts
export class ResponseCache {
  private redis: Redis;
  private localCache = new Map<string, CacheEntry>();

  async get(key: string): Promise<string | null> {
    // 先检查本地缓存
    const local = this.localCache.get(key);
    if (local && !this.isExpired(local)) {
      return local.value;
    }

    // 检查Redis缓存
    const cached = await this.redis.get(key);
    if (cached) {
      // 更新本地缓存
      this.localCache.set(key, {
        value: cached,
        timestamp: Date.now(),
        ttl: 3600,
      });
      return cached;
    }

    return null;
  }

  async set(key: string, value: string, ttl: number = 3600): Promise<void> {
    // 设置本地缓存
    this.localCache.set(key, {
      value,
      timestamp: Date.now(),
      ttl,
    });

    // 设置Redis缓存
    await this.redis.setex(key, ttl, value);
  }
}
```

### 2. 请求批处理

```typescript
// lib/ai/batch/processor.ts
export class BatchRequestProcessor {
  private queue: Array<{
    request: AIRequest;
    resolve: (response: AIResponse) => void;
    reject: (error: Error) => void;
  }> = [];

  private processing = false;

  async addRequest(request: AIRequest): Promise<AIResponse> {
    return new Promise((resolve, reject) => {
      this.queue.push({ request, resolve, reject });
      this.processBatch();
    });
  }

  private async processBatch(): Promise<void> {
    if (this.processing || this.queue.length < 5) return;

    this.processing = true;
    const batch = this.queue.splice(0, 10); // 最多10个请求

    try {
      const responses = await this.callBatchAPI(
        batch.map(item => item.request)
      );

      batch.forEach((item, index) => {
        item.resolve(responses[index]);
      });
    } catch (error) {
      batch.forEach(item => {
        item.reject(error as Error);
      });
    } finally {
      this.processing = false;

      // 处理剩余请求
      if (this.queue.length > 0) {
        setTimeout(() => this.processBatch(), 100);
      }
    }
  }
}
```

### 3. 模型选择策略

```typescript
// lib/ai/selection/model-selector.ts
export class ModelSelector {
  selectBestModel(
    taskType: string,
    complexity: 'low' | 'medium' | 'high',
    budget: number,
    latency: number
  ): AIModel {
    const models = this.getAvailableModels();

    // 根据任务类型筛选
    const taskModels = models.filter(model =>
      model.capabilities.includes(taskType)
    );

    // 根据复杂度筛选
    const complexityModels = taskModels.filter(
      model => model.maxComplexity >= this.getComplexityLevel(complexity)
    );

    // 根据预算和延迟选择最优模型
    return this.findOptimalModel(complexityModels, budget, latency);
  }

  private findOptimalModel(
    models: AIModel[],
    budget: number,
    maxLatency: number
  ): AIModel {
    // 评分算法
    return models
      .filter(model => model.costPerRequest <= budget)
      .filter(model => model.averageLatency <= maxLatency)
      .sort((a, b) => {
        const scoreA = this.calculateScore(a, budget, maxLatency);
        const scoreB = this.calculateScore(b, budget, maxLatency);
        return scoreB - scoreA;
      })[0];
  }
}
```

## 🚨 错误处理

### 统一错误处理

```typescript
// lib/ai/error/handler.ts
export class AIErrorHandler {
  async handleAIError(
    error: any,
    context: RequestContext
  ): Promise<AIResponse> {
    if (error.code === 'rate_limit_exceeded') {
      return this.handleRateLimit(context);
    }

    if (error.code === 'insufficient_quota') {
      return this.handleQuotaExceeded(context);
    }

    if (error.code === 'model_overloaded') {
      return this.handleModelOverload(context);
    }

    // 默认错误处理
    return {
      content: '抱歉，AI服务暂时不可用，请稍后再试。',
      error: true,
      errorType: 'service_unavailable',
    };
  }

  private async handleRateLimit(context: RequestContext): Promise<AIResponse> {
    // 尝试使用备用模型
    const fallbackModel = this.selectFallbackModel(context);

    if (fallbackModel) {
      return this.retryWithModel(context, fallbackModel);
    }

    return {
      content: '请求过于频繁，请稍后再试。',
      error: true,
      errorType: 'rate_limit',
      retryAfter: 60, // 60秒后重试
    };
  }
}
```

### 重试机制

```typescript
// lib/ai/retry/retry-policy.ts
export class RetryPolicy {
  async executeWithRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;

        if (attempt === maxRetries || !this.isRetryableError(error)) {
          throw lastError;
        }

        const delay = this.calculateDelay(attempt, baseDelay);
        await this.sleep(delay);
      }
    }

    throw lastError!;
  }

  private isRetryableError(error: any): boolean {
    const retryableCodes = [
      'rate_limit_exceeded',
      'model_overloaded',
      'timeout',
      'connection_error',
    ];

    return retryableCodes.includes(error.code);
  }

  private calculateDelay(attempt: number, baseDelay: number): number {
    // 指数退避策略
    return baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
  }
}
```

## 💰 成本控制

### 使用量监控

```typescript
// lib/ai/monitoring/usage-tracker.ts
export class UsageTracker {
  async trackUsage(
    userId: string,
    model: string,
    tokens: number,
    cost: number
  ): Promise<void> {
    // 记录使用量
    await this.database.usage.create({
      data: {
        userId,
        model,
        tokens,
        cost,
        timestamp: new Date(),
      },
    });

    // 更新用户配额
    await this.updateUserQuota(userId, cost);

    // 检查预算警告
    await this.checkBudgetWarning(userId);
  }

  async getUsageStats(
    userId: string,
    period: 'day' | 'week' | 'month'
  ): Promise<UsageStats> {
    const startDate = this.getStartDate(period);

    const usage = await this.database.usage.aggregate({
      where: {
        userId,
        timestamp: { gte: startDate },
      },
      _sum: {
        tokens: true,
        cost: true,
      },
      _count: true,
    });

    return {
      totalTokens: usage._sum.tokens || 0,
      totalCost: usage._sum.cost || 0,
      requestCount: usage._count,
      period,
    };
  }
}
```

### 成本优化策略

```typescript
// lib/ai/optimization/cost-optimizer.ts
export class CostOptimizer {
  optimizeRequest(request: AIRequest): OptimizedRequest {
    const optimizations = [];

    // 1. 模型选择优化
    const optimalModel = this.selectCostEffectiveModel(request);
    if (optimalModel !== request.model) {
      optimizations.push({
        type: 'model_change',
        from: request.model,
        to: optimalModel,
        savings: this.calculateSavings(request.model, optimalModel),
      });
    }

    // 2. Token使用优化
    const optimizedPrompt = this.optimizePrompt(request.prompt);
    if (optimizedPrompt.length < request.prompt.length) {
      optimizations.push({
        type: 'prompt_optimization',
        tokensSaved:
          this.countTokens(request.prompt) - this.countTokens(optimizedPrompt),
      });
    }

    // 3. 缓存检查
    const cacheKey = this.generateCacheKey(request);
    if (this.isCached(cacheKey)) {
      optimizations.push({
        type: 'cache_hit',
        savings: this.calculateRequestCost(request),
      });
    }

    return {
      ...request,
      model: optimalModel,
      prompt: optimizedPrompt,
      optimizations,
    };
  }
}
```

## 📊 监控和分析

### 性能指标

```typescript
// lib/ai/monitoring/metrics.ts
export class AIMetrics {
  private prometheus: PrometheusRegistry;

  recordAPICall(model: string, latency: number, success: boolean): void {
    this.prometheus
      .histogram('ai_api_call_duration')
      .labels(model)
      .observe(latency);

    this.prometheus
      .counter('ai_api_calls_total')
      .labels(model, success ? 'success' : 'error')
      .inc();
  }

  recordTokenUsage(
    model: string,
    inputTokens: number,
    outputTokens: number
  ): void {
    this.prometheus
      .counter('ai_tokens_used_total')
      .labels(model, 'input')
      .inc(inputTokens);

    this.prometheus
      .counter('ai_tokens_used_total')
      .labels(model, 'output')
      .inc(outputTokens);
  }

  recordCost(model: string, cost: number): void {
    this.prometheus.counter('ai_cost_total').labels(model).inc(cost);
  }
}
```

## 🔗 相关资源

- [API文档](../api/README.md)
- [开发指南](../development/README.md)
- [错误码参考](../api/error-codes.md)
- [性能调优指南](performance.md)

---

💡 **提示**: 在使用AI功能时，请始终关注成本控制和用户体验。定期监控API使用情况和性能指标，及时优化策略。
