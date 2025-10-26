/**
 * 面试Webhook状态管理器
 * 负责跟踪和管理所有请求的状态
 */

import { TaskStatusRecord, WebhookRequestRecord, WebhookType, WebhookMetrics, HealthCheckResult } from '@/types/interview-webhook';

interface StatusStorage {
  getTask(sessionId: string): Promise<TaskStatusRecord | null>;
  setTask(task: TaskStatusRecord): Promise<void>;
  deleteTask(sessionId: string): Promise<void>;
  getWebhookRequest(requestId: string): Promise<WebhookRequestRecord | null>;
  setWebhookRequest(request: WebhookRequestRecord): Promise<void>;
  getTasksByStatus(status: TaskStatus): Promise<TaskStatusRecord[]>;
  getMetrics(webhookType: WebhookType, timeRange?: number): Promise<WebhookMetrics>;
}

export class InterviewWebhookStatusManager {
  private static instance: InterviewWebhookStatusManager;
  private storage: StatusStorage;
  private metricsCache: Map<string, { data: WebhookMetrics; timestamp: number }> = new Map();
  private metricsCacheTTL = 60000; // 1分钟缓存

  private constructor(storage: StatusStorage) {
    this.storage = storage;
  }

  static getInstance(storage?: StatusStorage): InterviewWebhookStatusManager {
    if (!this.instance) {
      this.instance = new InterviewWebhookStatusManager(storage || new MemoryStatusStorage());
    }
    return this.instance;
  }

  /**
   * 创建新任务
   */
  async createTask(
    sessionId: string,
    webhookType: WebhookType,
    initialStep: string = 'pending'
  ): Promise<TaskStatusRecord> {
    const task: TaskStatusRecord = {
      id: this.generateId(),
      sessionId,
      currentStep: initialStep,
      status: 'pending',
      progress: 0,
      retryCount: 0,
      maxRetries: 3,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await this.storage.setTask(task);
    return task;
  }

  /**
   * 更新任务状态
   */
  async updateTaskStatus(
    sessionId: string,
    updates: Partial<TaskStatusRecord>
  ): Promise<TaskStatusRecord | null> {
    const task = await this.storage.getTask(sessionId);
    if (!task) {
      return null;
    }

    const updatedTask: TaskStatusRecord = {
      ...task,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    await this.storage.setTask(updatedTask);
    return updatedTask;
  }

  /**
   * 更新任务进度
   */
  async updateProgress(
    sessionId: string,
    progress: number,
    currentStep?: string,
    message?: string
  ): Promise<TaskStatusRecord | null> {
    return this.updateTaskStatus(sessionId, {
      progress: Math.max(0, Math.min(100, progress)),
      ...(currentStep && { currentStep }),
      ...(message && { errorDetails: { code: '', message, retryable: true } })
    });
  }

  /**
   * 标记任务完成
   */
  async completeTask(
    sessionId: string,
    result: any
  ): Promise<TaskStatusRecord | null> {
    return this.updateTaskStatus(sessionId, {
      status: 'completed',
      progress: 100,
      resultData: result
    });
  }

  /**
   * 标记任务失败
   */
  async failTask(
    sessionId: string,
    error: Error | string,
    retryable: boolean = true
  ): Promise<TaskStatusRecord | null> {
    const task = await this.storage.getTask(sessionId);
    if (!task) {
      return null;
    }

    const shouldRetry = retryable && task.retryCount < task.maxRetries;
    const errorMessage = typeof error === 'string' ? error : error.message;

    return this.updateTaskStatus(sessionId, {
      status: shouldRetry ? 'retrying' : 'failed',
      errorDetails: {
        code: 'PROCESSING_ERROR',
        message: errorMessage,
        stack: typeof error === 'object' && error.stack ? error.stack : undefined,
        retryable
      },
      retryCount: task.retryCount + 1
    });
  }

  /**
   * 获取任务状态
   */
  async getTaskStatus(sessionId: string): Promise<TaskStatusRecord | null> {
    return this.storage.getTask(sessionId);
  }

  /**
   * 记录Webhook请求
   */
  async recordWebhookRequest(
    webhookType: WebhookType,
    requestId: string,
    sessionId: string,
    requestData: any
  ): Promise<WebhookRequestRecord> {
    const record: WebhookRequestRecord = {
      id: this.generateId(),
      webhookType,
      requestId,
      sessionId,
      requestData,
      status: 'pending',
      retryCount: 0,
      createdAt: new Date().toISOString()
    };

    await this.storage.setWebhookRequest(record);
    return record;
  }

  /**
   * 更新Webhook请求状态
   */
  async updateWebhookRequest(
    requestId: string,
    updates: Partial<WebhookRequestRecord>
  ): Promise<void> {
    const request = await this.storage.getWebhookRequest(requestId);
    if (!request) {
      return;
    }

    const updatedRequest: WebhookRequestRecord = {
      ...request,
      ...updates
    };

    if (updates.status === 'completed' || updates.status === 'failed') {
      updatedRequest.completedAt = new Date().toISOString();
      if (request.createdAt) {
        updatedRequest.processingTime = Date.now() - new Date(request.createdAt).getTime();
      }
    }

    await this.storage.setWebhookRequest(updatedRequest);
  }

  /**
   * 获取待重试的任务
   */
  async getRetryableTasks(): Promise<TaskStatusRecord[]> {
    // 获取所有失败且可重试的任务
    const failedTasks = await this.storage.getTasksByStatus('failed');
    const retryingTasks = await this.storage.getTasksByStatus('retrying');

    return [...failedTasks, ...retryingTasks].filter(
      task => task.retryCount < task.maxRetries
    );
  }

  /**
   * 获取性能指标
   */
  async getMetrics(
    webhookType: WebhookType,
    timeRange: number = 3600000 // 默认1小时
  ): Promise<WebhookMetrics> {
    const cacheKey = `${webhookType}-${timeRange}`;
    const cached = this.metricsCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.metricsCacheTTL) {
      return cached.data;
    }

    const metrics = await this.storage.getMetrics(webhookType, timeRange);
    this.metricsCache.set(cacheKey, {
      data: metrics,
      timestamp: Date.now()
    });

    return metrics;
  }

  /**
   * 清理过期数据
   */
  async cleanup(retentionDays: number = 7): Promise<void> {
    const cutoffTime = Date.now() - (retentionDays * 24 * 60 * 60 * 1000);

    // 这里应该实现清理逻辑
    // 删除超过保留期的已完成或失败的任务
    console.log(`Cleaning up tasks older than ${new Date(cutoffTime).toISOString()}`);
  }

  /**
   * 健康检查
   */
  async healthCheck(): Promise<HealthCheckResult> {
    const checks = [];
    let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

    try {
      // 检查存储连接
      const startTime = Date.now();
      await this.storage.getTask('health-check');
      const responseTime = Date.now() - startTime;

      checks.push({
        name: 'storage',
        status: responseTime < 100 ? 'pass' : responseTime < 500 ? 'warn' : 'fail',
        message: `Response time: ${responseTime}ms`,
        responseTime
      });

      if (responseTime > 500) {
        overallStatus = 'degraded';
      }

      // 检查活跃任务数
      const activeTasks = await this.storage.getTasksByStatus('processing');
      if (activeTasks.length > 100) {
        checks.push({
          name: 'active-tasks',
          status: 'warn',
          message: `High active tasks: ${activeTasks.length}`
        });
        overallStatus = overallStatus === 'healthy' ? 'degraded' : overallStatus;
      } else {
        checks.push({
          name: 'active-tasks',
          status: 'pass',
          message: `Active tasks: ${activeTasks.length}`
        });
      }

      // 检查失败率
      const recentMetrics = await this.getMetrics('interview-parse', 300000); // 5分钟
      const errorRate = recentMetrics.metrics.requestCount > 0
        ? recentMetrics.metrics.errorCount / recentMetrics.metrics.requestCount
        : 0;

      if (errorRate > 0.5) {
        checks.push({
          name: 'error-rate',
          status: 'fail',
          message: `High error rate: ${(errorRate * 100).toFixed(2)}%`
        });
        overallStatus = 'unhealthy';
      } else if (errorRate > 0.1) {
        checks.push({
          name: 'error-rate',
          status: 'warn',
          message: `Elevated error rate: ${(errorRate * 100).toFixed(2)}%`
        });
        overallStatus = overallStatus === 'healthy' ? 'degraded' : overallStatus;
      } else {
        checks.push({
          name: 'error-rate',
          status: 'pass',
          message: `Error rate: ${(errorRate * 100).toFixed(2)}%`
        });
      }

    } catch (error) {
      checks.push({
        name: 'system',
        status: 'fail',
        message: error.message
      });
      overallStatus = 'unhealthy';
    }

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      checks,
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0'
    };
  }

  /**
   * 生成唯一ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * 内存存储实现（用于开发/测试）
 */
class MemoryStatusStorage implements StatusStorage {
  private tasks: Map<string, TaskStatusRecord> = new Map();
  private requests: Map<string, WebhookRequestRecord> = new Map();

  async getTask(sessionId: string): Promise<TaskStatusRecord | null> {
    return this.tasks.get(sessionId) || null;
  }

  async setTask(task: TaskStatusRecord): Promise<void> {
    this.tasks.set(task.sessionId, task);
  }

  async deleteTask(sessionId: string): Promise<void> {
    this.tasks.delete(sessionId);
  }

  async getWebhookRequest(requestId: string): Promise<WebhookRequestRecord | null> {
    return this.requests.get(requestId) || null;
  }

  async setWebhookRequest(request: WebhookRequestRecord): Promise<void> {
    this.requests.set(request.requestId, request);
  }

  async getTasksByStatus(status: TaskStatus): Promise<TaskStatusRecord[]> {
    return Array.from(this.tasks.values()).filter(task => task.status === status);
  }

  async getMetrics(webhookType: WebhookType, timeRange: number): Promise<WebhookMetrics> {
    const now = Date.now();
    const cutoff = now - timeRange;

    const relevantRequests = Array.from(this.requests.values()).filter(
      req => req.webhookType === webhookType && new Date(req.createdAt).getTime() > cutoff
    );

    const requestCount = relevantRequests.length;
    const successCount = relevantRequests.filter(r => r.status === 'completed').length;
    const errorCount = relevantRequests.filter(r => r.status === 'failed').length;

    const processingTimes = relevantRequests
      .filter(r => r.processingTime !== undefined)
      .map(r => r.processingTime!);

    const averageProcessingTime = processingTimes.length > 0
      ? processingTimes.reduce((a, b) => a + b, 0) / processingTimes.length
      : 0;

    const sortedTimes = processingTimes.sort((a, b) => a - b);
    const p95Index = Math.floor(sortedTimes.length * 0.95);
    const p95ProcessingTime = sortedTimes[p95Index] || 0;

    // 统计错误类型
    const errorMap = new Map<string, { count: number; last: string }>();
    relevantRequests.forEach(req => {
      if (req.status === 'failed' && req.errorMessage) {
        const errorType = req.errorMessage.split(':')[0] || 'unknown';
        const existing = errorMap.get(errorType) || { count: 0, last: '' };
        errorMap.set(errorType, {
          count: existing.count + 1,
          last: req.errorMessage
        });
      }
    });

    const errors = Array.from(errorMap.entries()).map(([type, data]) => ({
      type,
      count: data.count,
      lastOccurred: data.last
    }));

    return {
      timestamp: new Date().toISOString(),
      webhookType,
      metrics: {
        requestCount,
        successCount,
        errorCount,
        averageProcessingTime,
        p95ProcessingTime,
        currentQueueSize: Array.from(this.tasks.values()).filter(t => t.status === 'pending').length,
        throughput: requestCount / (timeRange / 60000) // per minute
      },
      errors
    };
  }
}

// 导出单例
export const interviewWebhookStatusManager = InterviewWebhookStatusManager.getInstance();