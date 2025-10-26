/**
 * 面试Webhook错误处理和重试机制
 * 提供统一的错误处理、重试策略和降级方案
 */

import { WebhookType, TaskStatus } from '@/types/interview-webhook';
import { interviewWebhookStatusManager } from './status-manager';

export interface RetryConfig {
  maxRetries: number;
  baseDelay: number; // 基础延迟（毫秒）
  maxDelay: number; // 最大延迟（毫秒）
  backoffStrategy: 'linear' | 'exponential' | 'fixed';
  retryableErrors: string[];
}

export interface ErrorContext {
  sessionId: string;
  webhookType: WebhookType;
  requestId?: string;
  attempt: number;
  error: Error;
  timestamp: string;
}

export class InterviewWebhookErrorHandler {
  private static instance: InterviewWebhookErrorHandler;
  private retryConfigs: Map<WebhookType, RetryConfig> = new Map();
  private retryQueue: Map<string, NodeJS.Timeout> = new Map();
  private errorCallbacks: Map<string, (context: ErrorContext) => void> = new Map();

  private constructor() {
    this.initializeRetryConfigs();
  }

  static getInstance(): InterviewWebhookErrorHandler {
    if (!this.instance) {
      this.instance = new InterviewWebhookErrorHandler();
    }
    return this.instance;
  }

  /**
   * 初始化重试配置
   */
  private initializeRetryConfigs(): void {
    // 面试信息解析的配置
    this.retryConfigs.set('interview-parse', {
      maxRetries: 3,
      baseDelay: 2000,
      maxDelay: 30000,
      backoffStrategy: 'exponential',
      retryableErrors: [
        'NETWORK_ERROR',
        'TIMEOUT_ERROR',
        'SERVICE_UNAVAILABLE',
        'RATE_LIMITED',
        'TEMPORARY_FAILURE'
      ]
    });

    // 面试辅导生成的配置
    this.retryConfigs.set('coaching-generate', {
      maxRetries: 2,
      baseDelay: 5000,
      maxDelay: 60000,
      backoffStrategy: 'exponential',
      retryableErrors: [
        'NETWORK_ERROR',
        'TIMEOUT_ERROR',
        'SERVICE_UNAVAILABLE',
        'AI_SERVICE_ERROR',
        'GENERATION_FAILURE'
      ]
    });
  }

  /**
   * 处理错误
   */
  async handleError(
    context: ErrorContext,
    retryFunction?: () => Promise<void>
  ): Promise<void> {
    const { sessionId, webhookType, error, attempt } = context;

    // 记录错误
    await this.logError(context);

    // 判断是否应该重试
    const shouldRetry = await this.shouldRetry(context);

    if (shouldRetry && retryFunction) {
      await this.scheduleRetry(context, retryFunction);
    } else {
      // 标记任务失败
      await interviewWebhookStatusManager.failTask(
        sessionId,
        error,
        false
      );

      // 执行错误回调
      this.executeErrorCallbacks(context);

      // 尝试降级处理
      await this.attemptFallback(context);
    }
  }

  /**
   * 判断是否应该重试
   */
  private async shouldRetry(context: ErrorContext): Promise<boolean> {
    const { webhookType, error, attempt } = context;
    const config = this.retryConfigs.get(webhookType);

    if (!config || attempt >= config.maxRetries) {
      return false;
    }

    // 检查错误类型是否可重试
    const errorCode = this.getErrorCode(error);
    return config.retryableErrors.includes(errorCode);
  }

  /**
   * 安排重试
   */
  private async scheduleRetry(
    context: ErrorContext,
    retryFunction: () => Promise<void>
  ): Promise<void> {
    const { sessionId, webhookType, attempt } = context;
    const config = this.retryConfigs.get(webhookType);

    if (!config) {
      return;
    }

    // 计算延迟时间
    const delay = this.calculateDelay(attempt, config);

    // 更新任务状态为重试中
    await interviewWebhookStatusManager.updateTaskStatus(sessionId, {
      status: 'retrying',
      errorDetails: {
        code: this.getErrorCode(context.error),
        message: context.error.message,
        retryable: true
      }
    });

    // 安排重试
    const timeoutId = setTimeout(async () => {
      try {
        console.log(`[Retry] Attempting retry for session ${sessionId}, attempt ${attempt + 1}`);
        await retryFunction();
        // 清除定时器
        this.retryQueue.delete(sessionId);
      } catch (error) {
        // 递归处理重试失败
        const newContext: ErrorContext = {
          ...context,
          attempt: attempt + 1,
          error: error as Error,
          timestamp: new Date().toISOString()
        };
        await this.handleError(newContext, retryFunction);
      }
    }, delay);

    this.retryQueue.set(sessionId, timeoutId);
  }

  /**
   * 计算延迟时间
   */
  private calculateDelay(attempt: number, config: RetryConfig): number {
    let delay: number;

    switch (config.backoffStrategy) {
      case 'linear':
        delay = config.baseDelay * attempt;
        break;
      case 'exponential':
        delay = config.baseDelay * Math.pow(2, attempt - 1);
        break;
      case 'fixed':
      default:
        delay = config.baseDelay;
        break;
    }

    // 添加随机抖动（±25%）
    const jitter = delay * 0.25 * (Math.random() * 2 - 1);
    delay = delay + jitter;

    return Math.min(delay, config.maxDelay);
  }

  /**
   * 获取错误代码
   */
  private getErrorCode(error: Error): string {
    // 从错误消息中提取错误代码
    const message = error.message.toUpperCase();

    if (message.includes('NETWORK') || message.includes('ECONNREFUSED')) {
      return 'NETWORK_ERROR';
    }
    if (message.includes('TIMEOUT')) {
      return 'TIMEOUT_ERROR';
    }
    if (message.includes('RATE LIMIT') || message.includes('429')) {
      return 'RATE_LIMITED';
    }
    if (message.includes('SERVICE UNAVAILABLE') || message.includes('503')) {
      return 'SERVICE_UNAVAILABLE';
    }
    if (message.includes('AI') || message.includes('GENERATION')) {
      return 'AI_SERVICE_ERROR';
    }

    return 'UNKNOWN_ERROR';
  }

  /**
   * 记录错误
   */
  private async logError(context: ErrorContext): Promise<void> {
    const { sessionId, webhookType, requestId, attempt, error, timestamp } = context;

    console.error(`[WebhookError] ${webhookType} - Session: ${sessionId}, Attempt: ${attempt}`, {
      requestId,
      error: error.message,
      stack: error.stack,
      timestamp
    });

    // 这里可以添加到日志服务（如ELK、Sentry等）
  }

  /**
   * 执行错误回调
   */
  private executeErrorCallbacks(context: ErrorContext): void {
    this.errorCallbacks.forEach((callback, key) => {
      try {
        callback(context);
      } catch (callbackError) {
        console.error(`Error in callback ${key}:`, callbackError);
      }
    });
  }

  /**
   * 尝试降级处理
   */
  private async attemptFallback(context: ErrorContext): Promise<void> {
    const { sessionId, webhookType, error } = context;

    try {
      console.log(`[Fallback] Attempting fallback for ${webhookType}, session ${sessionId}`);

      switch (webhookType) {
        case 'interview-parse':
          await this.interviewParseFallback(sessionId, error);
          break;
        case 'coaching-generate':
          await this.coachingGenerationFallback(sessionId, error);
          break;
        default:
          console.warn(`No fallback strategy for webhook type: ${webhookType}`);
      }
    } catch (fallbackError) {
      console.error(`Fallback failed for session ${sessionId}:`, fallbackError);
    }
  }

  /**
   * 面试信息解析降级方案
   */
  private async interviewParseFallback(sessionId: string, originalError: Error): Promise<void> {
    // 提供基本的解析结果
    const fallbackResult = {
      sessionId,
      analyzedAt: new Date().toISOString(),
      analysis: {
        matchAnalysis: {
          positionMatch: 50,
          industryMatch: 50,
          experienceMatch: 50,
          overallScore: 50
        },
        skillsGap: {
          requiredSkills: [],
          existingSkills: [],
          missingSkills: [],
          improvementSuggestions: ['请提供更多职位信息以获得准确分析']
        },
        preparationGuide: {
          keyPoints: ['准备自我介绍', '了解公司背景', '准备常见问题'],
          potentialQuestions: [],
          commonChallenges: [],
          successFactors: []
        },
        personalizedAdvice: {
          strengths: [],
          improvementAreas: [],
          talkingPoints: [],
          redFlags: []
        }
      },
      fallback: true,
      originalError: originalError.message
    };

    await interviewWebhookStatusManager.completeTask(sessionId, fallbackResult);
    console.log(`[Fallback] Applied fallback for interview parse, session ${sessionId}`);
  }

  /**
   * 面试辅导生成降级方案
   */
  private async coachingGenerationFallback(sessionId: string, originalError: Error): Promise<void> {
    // 提供基本的辅导材料
    const fallbackResult = {
      sessionId,
      generatedAt: new Date().toISOString(),
      coaching: {
        materials: {
          guide: {
            sections: [
              {
                title: '面试基础准备',
                content: '由于系统繁忙，请稍后重试以获取个性化辅导材料。以下是基本建议：1. 准备2-3分钟的自我介绍 2. 研究公司和职位 3. 准备3-5个项目案例',
                tips: ['保持自信', '诚实回答', '提前准备']
              }
            ]
          },
          questionBank: [],
          mockInterview: {
            rounds: [],
            scoreCard: []
          },
          actionPlan: {
            dailyTasks: [],
            milestones: [],
            resources: []
          }
        },
        metadata: {
          wordCount: 100,
          estimatedReadTime: 1,
          lastUpdated: new Date().toISOString(),
          version: '1.0.0-fallback'
        }
      },
      fallback: true,
      originalError: originalError.message
    };

    await interviewWebhookStatusManager.completeTask(sessionId, fallbackResult);
    console.log(`[Fallback] Applied fallback for coaching generation, session ${sessionId}`);
  }

  /**
   * 取消重试
   */
  cancelRetry(sessionId: string): boolean {
    const timeoutId = this.retryQueue.get(sessionId);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.retryQueue.delete(sessionId);
      return true;
    }
    return false;
  }

  /**
   * 注册错误回调
   */
  onError(name: string, callback: (context: ErrorContext) => void): void {
    this.errorCallbacks.set(name, callback);
  }

  /**
   * 移除错误回调
   */
  offError(name: string): void {
    this.errorCallbacks.delete(name);
  }

  /**
   * 更新重试配置
   */
  updateRetryConfig(webhookType: WebhookType, config: Partial<RetryConfig>): void {
    const existing = this.retryConfigs.get(webhookType);
    if (existing) {
      this.retryConfigs.set(webhookType, { ...existing, ...config });
    }
  }

  /**
   * 获取重试配置
   */
  getRetryConfig(webhookType: WebhookType): RetryConfig | undefined {
    return this.retryConfigs.get(webhookType);
  }

  /**
   * 清理过期的重试任务
   */
  cleanup(): void {
    const now = Date.now();
    const maxAge = 3600000; // 1小时

    this.retryQueue.forEach((timeoutId, sessionId) => {
      // 这里无法直接获取定时器的创建时间，所以需要另外记录
      // 简化处理：定期清理所有定时器
      clearTimeout(timeoutId);
      this.retryQueue.delete(sessionId);
    });

    console.log('[ErrorHandler] Cleaned up expired retry tasks');
  }
}

// 导出单例
export const interviewWebhookErrorHandler = InterviewWebhookErrorHandler.getInstance();

/**
 * 装饰器：自动重试
 */
export function withRetry(webhookType: WebhookType, config?: Partial<RetryConfig>) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const sessionId = args[0]?.sessionId || 'unknown';
      let attempt = 0;
      const maxAttempts = config?.maxRetries || 3;

      while (attempt < maxAttempts) {
        try {
          return await method.apply(this, args);
        } catch (error) {
          attempt++;

          const errorContext: ErrorContext = {
            sessionId,
            webhookType,
            attempt,
            error: error as Error,
            timestamp: new Date().toISOString()
          };

          if (attempt < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
          } else {
            await interviewWebhookErrorHandler.handleError(errorContext);
            throw error;
          }
        }
      }
    };

    return descriptor;
  };
}