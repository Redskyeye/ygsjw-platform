/**
 * Webhook通用工具函数
 * 提供身份验证、数据验证等功能
 */

import { NextRequest } from 'next/server';
import { InterviewInfoRequest, CoachingRequest } from '@/types/interview-webhook';
import crypto from 'crypto';

/**
 * 身份验证结果
 */
interface AuthResult {
  valid: boolean;
  error?: string;
}

/**
 * 验证结果
 */
interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * 验证Webhook请求的身份
 */
export async function authenticateRequest(request: NextRequest): Promise<AuthResult> {
  try {
    // 1. 检查Authorization头
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { valid: false, error: 'Missing or invalid authorization header' };
    }

    const token = authHeader.substring(7);
    const expectedToken = process.env.WEBHOOK_SECRET_TOKEN;

    if (!expectedToken) {
      console.error('[Webhook Auth] WEBHOOK_SECRET_TOKEN not configured');
      return { valid: false, error: 'Server configuration error' };
    }

    if (token !== expectedToken) {
      return { valid: false, error: 'Invalid token' };
    }

    // 2. 检查签名（如果有）
    const signature = request.headers.get('x-webhook-signature');
    if (signature) {
      const body = await request.text();
      const expectedSignature = crypto
        .createHmac('sha256', expectedToken)
        .update(body)
        .digest('hex');

      if (!crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(`sha256=${expectedSignature}`)
      )) {
        return { valid: false, error: 'Invalid signature' };
      }
    }

    // 3. 检查IP白名单（如果配置）
    const clientIP = request.ip ||
      request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip');

    if (clientIP && process.env.WEBHOOK_ALLOWED_IPS) {
      const allowedIPs = process.env.WEBHOOK_ALLOWED_IPS.split(',');
      if (!allowedIPs.includes(clientIP)) {
        return { valid: false, error: `IP ${clientIP} not allowed` };
      }
    }

    // 4. 检查速率限制
    const rateLimitResult = await checkRateLimit(clientIP || 'unknown');
    if (!rateLimitResult.allowed) {
      return { valid: false, error: 'Rate limit exceeded' };
    }

    return { valid: true };

  } catch (error) {
    console.error('[Webhook Auth] Error:', error);
    return { valid: false, error: 'Authentication failed' };
  }
}

/**
 * 验证面试信息请求
 */
export function validateRequest(request: InterviewInfoRequest): ValidationResult {
  const errors: string[] = [];

  // 检查必需字段
  if (!request.sessionId) {
    errors.push('sessionId is required');
  }

  if (!request.data) {
    errors.push('data is required');
    return { valid: false, errors };
  }

  // 验证个人信息
  const { personalInfo } = request.data;
  if (!personalInfo) {
    errors.push('personalInfo is required');
  } else {
    if (!personalInfo.name || personalInfo.name.trim().length === 0) {
      errors.push('personalInfo.name is required');
    }
    if (!personalInfo.email || !isValidEmail(personalInfo.email)) {
      errors.push('personalInfo.email is required and must be valid');
    }
    if (!personalInfo.phone || !isValidPhone(personalInfo.phone)) {
      errors.push('personalInfo.phone is required and must be valid');
    }
  }

  // 验证求职信息
  const { jobInfo } = request.data;
  if (!jobInfo) {
    errors.push('jobInfo is required');
  } else {
    if (!jobInfo.targetPosition || jobInfo.targetPosition.trim().length === 0) {
      errors.push('jobInfo.targetPosition is required');
    }
    if (!jobInfo.industry || jobInfo.industry.trim().length === 0) {
      errors.push('jobInfo.industry is required');
    }
    if (typeof jobInfo.experience !== 'number' || jobInfo.experience < 0) {
      errors.push('jobInfo.experience must be a non-negative number');
    }
    if (!['full-time', 'part-time', 'intern', 'contract'].includes(jobInfo.jobType)) {
      errors.push('jobInfo.jobType must be one of: full-time, part-time, intern, contract');
    }
  }

  // 验证面试信息
  const { interviewInfo } = request.data;
  if (!interviewInfo) {
    errors.push('interviewInfo is required');
  } else {
    if (!interviewInfo.company || interviewInfo.company.trim().length === 0) {
      errors.push('interviewInfo.company is required');
    }
    if (!interviewInfo.position || interviewInfo.position.trim().length === 0) {
      errors.push('interviewInfo.position is required');
    }
    if (!['phone', 'video', 'onsite', 'technical', 'behavioral', 'case', 'panel'].includes(interviewInfo.interviewType)) {
      errors.push('interviewInfo.interviewType must be valid');
    }
    if (!interviewInfo.interviewDate || !isValidDate(interviewInfo.interviewDate)) {
      errors.push('interviewInfo.interviewDate is required and must be valid');
    }
    if (typeof interviewInfo.interviewDuration !== 'number' || interviewInfo.interviewDuration <= 0) {
      errors.push('interviewInfo.interviewDuration must be a positive number');
    }
  }

  // 验证简历文件（如果有）
  if (request.data.resumeFile) {
    const { resumeFile } = request.data;
    if (!resumeFile.url || resumeFile.url.trim().length === 0) {
      errors.push('resumeFile.url is required');
    }
    if (!['pdf', 'docx', 'txt'].includes(resumeFile.format)) {
      errors.push('resumeFile.format must be one of: pdf, docx, txt');
    }
    if (typeof resumeFile.size !== 'number' || resumeFile.size <= 0) {
      errors.push('resumeFile.size must be a positive number');
    }
    if (resumeFile.size > 10 * 1024 * 1024) { // 10MB
      errors.push('resumeFile.size must not exceed 10MB');
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * 验证辅导请求
 */
export function validateCoachingRequest(request: CoachingRequest): ValidationResult {
  const errors: string[] = [];

  // 检查必需字段
  if (!request.sessionId) {
    errors.push('sessionId is required');
  }

  if (!request.parsedData) {
    errors.push('parsedData is required');
  }

  if (!request.coachingType) {
    errors.push('coachingType is required');
  } else if (!['interview-prep', 'technical', 'behavioral', 'case-study', 'salary-negotiation'].includes(request.coachingType)) {
    errors.push('coachingType must be one of: interview-prep, technical, behavioral, case-study, salary-negotiation');
  }

  // 验证偏好设置
  if (!request.preferences) {
    errors.push('preferences is required');
  } else {
    const { preferences } = request;
    if (!['zh-CN', 'en-US'].includes(preferences.language)) {
      errors.push('preferences.language must be zh-CN or en-US');
    }
    if (!['basic', 'comprehensive', 'advanced'].includes(preferences.depth)) {
      errors.push('preferences.depth must be basic, comprehensive, or advanced');
    }
    if (!['text', 'slides', 'interactive'].includes(preferences.format)) {
      errors.push('preferences.format must be text, slides, or interactive');
    }
    if (typeof preferences.timeframe !== 'number' || preferences.timeframe <= 0) {
      errors.push('preferences.timeframe must be a positive number');
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * 验证邮箱格式
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * 验证手机号格式
 */
function isValidPhone(phone: string): boolean {
  // 简单的手机号验证，根据需要调整
  const phoneRegex = /^1[3-9]\d{9}$/; // 中国手机号
  return phoneRegex.test(phone.replace(/\D/g, ''));
}

/**
 * 验证日期格式
 */
function isValidDate(dateString: string): boolean {
  const date = new Date(dateString);
  return !isNaN(date.getTime()) && date > new Date();
}

/**
 * 检查速率限制
 */
async function checkRateLimit(identifier: string): Promise<{ allowed: boolean; remaining?: number }> {
  // 这里应该使用Redis或其他缓存系统实现速率限制
  // 暂时返回允许
  return { allowed: true };
}

/**
 * 创建Webhook响应
 */
export function createWebhookResponse<T = any>(
  success: boolean,
  sessionId: string,
  status: string,
  data?: T,
  error?: { code: string; message: string; details?: any }
): {
  success: boolean;
  sessionId: string;
  status: string;
  data?: T;
  error?: { code: string; message: string; details?: any };
  timestamp: string;
  requestId: string;
} {
  return {
    success,
    sessionId,
    status,
    data,
    error,
    timestamp: new Date().toISOString(),
    requestId: generateRequestId()
  };
}

/**
 * 生成请求ID
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 格式化错误消息
 */
export function formatErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unknown error occurred';
}

/**
 * 安全地解析JSON
 */
export function safeJsonParse<T>(str: string, fallback: T): T {
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}

/**
 * 清理敏感数据
 */
export function sanitizeData(data: any): any {
  if (typeof data !== 'object' || data === null) {
    return data;
  }

  const sensitiveFields = [
    'password',
    'token',
    'secret',
    'key',
    'authorization',
    'cookie',
    'session'
  ];

  const sanitized = Array.isArray(data) ? [...data] : { ...data };

  for (const key in sanitized) {
    if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof sanitized[key] === 'object') {
      sanitized[key] = sanitizeData(sanitized[key]);
    }
  }

  return sanitized;
}