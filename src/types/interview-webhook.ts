/**
 * 面试Webhook数据流系统类型定义
 * 支持双Webhook架构：信息解析和PPT生成
 */

// ==================== 基础类型 ====================

export type WebhookType = 'interview-parse' | 'coaching-generate';
export type TaskStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'retrying';
export type Priority = 'low' | 'normal' | 'high' | 'urgent';

// ==================== Webhook A: 面试信息解析 ====================

export interface InterviewInfoRequest {
  sessionId: string;
  timestamp: string;
  source: 'web' | 'mobile' | 'api';
  data: {
    // 基本信息
    personalInfo: {
      name: string;
      email: string;
      phone: string;
      location?: string;
      portfolio?: string;
      linkedin?: string;
    };

    // 求职信息
    jobInfo: {
      targetPosition: string;
      industry: string;
      experience: number; // 年数
      expectedSalary?: string;
      jobType: 'full-time' | 'part-time' | 'intern' | 'contract';
    };

    // 简历文件
    resumeFile?: {
      url: string;
      filename: string;
      format: 'pdf' | 'docx' | 'txt';
      size: number;
    };

    // 面试信息
    interviewInfo: {
      company: string;
      position: string;
      interviewType: 'phone' | 'video' | 'onsite' | 'technical' | 'behavioral' | 'case' | 'panel';
      interviewDate: string;
      interviewDuration: number; // 分钟
      interviewerNames?: string[];
      additionalNotes?: string;
    };

    // 自定义请求
    customRequests?: {
      strengthsToHighlight?: string[];
      weaknessesToImprove?: string[];
      specificQuestions?: string[];
      focusAreas?: string[];
    };
  };
}

export interface ParsedResumeData {
  extractedAt: string;
  personalInfo: {
    name: string;
    contact: {
      email: string;
      phone: string;
      location?: string;
    };
    summary?: string;
  };
  experience: Array<{
    company: string;
    position: string;
    duration: string;
    responsibilities: string[];
    achievements?: string[];
  }>;
  education: Array<{
    school: string;
    degree: string;
    major: string;
    duration: string;
    gpa?: string;
  }>;
  skills: {
    technical?: string[];
    soft?: string[];
    languages?: string[];
    certifications?: string[];
  };
  projects?: Array<{
    name: string;
    description: string;
    technologies: string[];
    link?: string;
  }>;
}

export interface InterviewAnalysisResult {
  sessionId: string;
  analyzedAt: string;
  analysis: {
    // 匹配度分析
    matchAnalysis: {
      positionMatch: number; // 0-100
      industryMatch: number;
      experienceMatch: number;
      overallScore: number;
    };

    // 关键技能分析
    skillsGap: {
      requiredSkills: string[];
      existingSkills: string[];
      missingSkills: string[];
      improvementSuggestions: string[];
    };

    // 面试准备建议
    preparationGuide: {
      keyPoints: string[];
      potentialQuestions: Array<{
        question: string;
        category: string;
        suggestedAnswer?: string;
        tips: string[];
      }>;
      commonChallenges: string[];
      successFactors: string[];
    };

    // 个性化建议
    personalizedAdvice: {
      strengths: string[];
      improvementAreas: string[];
      talkingPoints: string[];
      redFlags: string[];
    };
  };
}

// ==================== Webhook B: 个性化辅导生成 ====================

export interface CoachingRequest {
  sessionId: string;
  parsedData: InterviewAnalysisResult;
  coachingType: 'interview-prep' | 'technical' | 'behavioral' | 'case-study' | 'salary-negotiation';
  preferences: {
    language: 'zh-CN' | 'en-US';
    depth: 'basic' | 'comprehensive' | 'advanced';
    format: 'text' | 'slides' | 'interactive';
    timeframe: number; // 准备时间（天）
  };
}

export interface CoachingGenerationResult {
  sessionId: string;
  generatedAt: string;
  coaching: {
    // 面试辅导材料
    materials: {
      guide: {
        sections: Array<{
          title: string;
          content: string;
          tips: string[];
          examples?: string[];
        }>;
      };

      // 常见问题库
      questionBank: Array<{
        id: string;
        question: string;
        category: string;
        difficulty: 'easy' | 'medium' | 'hard';
        modelAnswer: {
          structure: string[];
          keyPoints: string[];
          exampleResponse: string;
          pitfalls: string[];
        };
        followUpQuestions?: string[];
      }>;

      // 模拟面试题
      mockInterview: {
        rounds: Array<{
          type: string;
          duration: number;
          questions: string[];
          evaluationCriteria: string[];
        }>;
        scoreCard: Array<{
          criterion: string;
          weight: number;
          description: string;
        }>;
      };

      // 行动计划
      actionPlan: {
        dailyTasks: Array<{
          day: number;
          tasks: string[];
          estimatedTime: number;
          resources: string[];
        }>;
        milestones: Array<{
          day: number;
          goal: string;
          checkpoints: string[];
        }>;
        resources: Array<{
          type: 'article' | 'video' | 'book' | 'course';
          title: string;
          url?: string;
          description: string;
        }>;
      };
    };

    // 生成元数据
    metadata: {
      wordCount: number;
      estimatedReadTime: number;
      lastUpdated: string;
      version: string;
    };
  };
}

// ==================== 数据流管理 ====================

export interface WebhookRequestRecord {
  id: string;
  webhookType: WebhookType;
  requestId: string;
  sessionId: string;
  requestData: any;
  responseData?: any;
  status: TaskStatus;
  errorMessage?: string;
  processingTime?: number;
  retryCount: number;
  createdAt: string;
  completedAt?: string;
  metadata?: Record<string, any>;
}

export interface TaskStatusRecord {
  id: string;
  sessionId: string;
  currentStep: string;
  status: TaskStatus;
  progress: number; // 0-100
  resultData?: any;
  errorDetails?: {
    code: string;
    message: string;
    stack?: string;
    retryable: boolean;
  };
  retryCount: number;
  maxRetries: number;
  estimatedCompletion?: string;
  createdAt: string;
  updatedAt: string;
}

// ==================== N8N集成 ====================

export interface N8NWorkflowConfig {
  workflowId: string;
  name: string;
  active: boolean;
  settings: {
    timezone: string;
    retryPolicy: {
      enabled: boolean;
      maxAttempts: number;
      backoffType: 'fixed' | 'exponential' | 'linear';
      interval: number;
    };
    timeout: number;
    errorWorkflowId?: string;
  };
  nodes: N8NNode[];
  connections: N8NConnection[];
}

export interface N8NNode {
  id: string;
  name: string;
  type: string;
  typeVersion: number;
  position: [number, number];
  parameters: Record<string, any>;
  credentials?: Record<string, string>;
}

export interface N8NConnection {
  [nodeId: string]: {
    [nodeOutputName: string]: Array<{
      node: string;
      type: string;
      index: number;
    }>;
  };
}

export interface N8NExecutionData {
  executionId: string;
  workflowId: string;
  status: 'running' | 'success' | 'error' | 'canceled';
  startedAt: string;
  stoppedAt?: string;
  data: {
    startData: any;
    resultData: any;
    error?: any;
  };
  mode: 'manual' | 'trigger' | 'webhook';
}

// ==================== 监控和告警 ====================

export interface WebhookMetrics {
  timestamp: string;
  webhookType: WebhookType;
  metrics: {
    requestCount: number;
    successCount: number;
    errorCount: number;
    averageProcessingTime: number;
    p95ProcessingTime: number;
    currentQueueSize: number;
    throughput: number; // requests per minute
  };
  errors: Array<{
    type: string;
    count: number;
    lastOccurred: string;
  }>;
}

export interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  checks: Array<{
    name: string;
    status: 'pass' | 'fail' | 'warn';
    message?: string;
    responseTime?: number;
  }>;
  uptime: number;
  version: string;
}

// ==================== API响应格式 ====================

export interface WebhookResponse<T = any> {
  success: boolean;
  sessionId: string;
  status: TaskStatus;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
  requestId: string;
}

export interface StatusResponse {
  sessionId: string;
  status: TaskStatus;
  progress: number;
  currentStep: string;
  message?: string;
  result?: any;
  error?: string;
  estimatedTimeRemaining?: number;
  timestamp: string;
}

// ==================== 配置类型 ====================

export interface WebhookConfig {
  name: string;
  url: string;
  secret: string;
  allowedIPs: string[];
  rateLimit: {
    requests: number;
    window: number; // seconds
  };
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
  headers?: Record<string, string>;
  active: boolean;
}

// ==================== 事件类型 ====================

export interface WebhookEvent {
  type: 'webhook.received' | 'webhook.processing' | 'webhook.completed' | 'webhook.failed' | 'task.retried';
  sessionId: string;
  webhookType: WebhookType;
  timestamp: string;
  data: any;
  metadata?: Record<string, any>;
}