/**
 * Webhook B: 个性化面试辅导生成端点
 * POST /api/webhook/interview/coach
 */

import { NextRequest, NextResponse } from 'next/server';
import { CoachingRequest, CoachingGenerationResult, WebhookResponse } from '@/types/interview-webhook';
import { interviewWebhookProcessor } from '@/lib/interview-webhook/processor';
import { interviewWebhookStatusManager } from '@/lib/interview-webhook/status-manager';
import { interviewWebhookErrorHandler } from '@/lib/interview-webhook/error-handler';
import { validateCoachingRequest, authenticateRequest } from '@/lib/webhook/utils';

export async function POST(request: NextRequest): Promise<NextResponse<WebhookResponse<CoachingGenerationResult>>> {
  const startTime = Date.now();
  let sessionId: string;
  let requestId: string;

  try {
    // 1. 身份验证
    const authResult = await authenticateRequest(request);
    if (!authResult.valid) {
      return NextResponse.json({
        success: false,
        sessionId: '',
        status: 'failed',
        error: {
          code: 'UNAUTHORIZED',
          message: authResult.error || 'Authentication failed'
        },
        timestamp: new Date().toISOString(),
        requestId: ''
      }, { status: 401 });
    }

    // 2. 解析请求数据
    const body: CoachingRequest = await request.json();
    sessionId = body.sessionId;
    requestId = generateRequestId();

    // 3. 验证请求数据
    const validation = validateCoachingRequest(body);
    if (!validation.valid) {
      return NextResponse.json({
        success: false,
        sessionId: sessionId || '',
        status: 'failed',
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid coaching request data',
          details: validation.errors
        },
        timestamp: new Date().toISOString(),
        requestId
      }, { status: 400 });
    }

    // 4. 记录Webhook请求
    await interviewWebhookStatusManager.recordWebhookRequest(
      'coaching-generate',
      requestId,
      sessionId,
      body
    );

    // 5. 创建任务状态
    await interviewWebhookStatusManager.createTask(
      sessionId,
      'coaching-generate',
      'generating-coaching-materials'
    );

    // 6. 异步处理请求
    processCoachingGenerationAsync(body, requestId);

    // 7. 立即返回响应
    return NextResponse.json({
      success: true,
      sessionId,
      status: 'processing',
      data: {
        message: 'Coaching generation started',
        estimatedDuration: '60-120 seconds'
      },
      timestamp: new Date().toISOString(),
      requestId
    });

  } catch (error) {
    console.error('[Webhook B] Unexpected error:', error);

    return NextResponse.json({
      success: false,
      sessionId: sessionId || '',
      status: 'failed',
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error'
      },
      timestamp: new Date().toISOString(),
      requestId: requestId || ''
    }, { status: 500 });
  }
}

/**
 * 异步处理面试辅导生成
 */
async function processCoachingGenerationAsync(request: CoachingRequest, requestId: string): Promise<void> {
  const { sessionId } = request;

  try {
    // 更新状态：开始处理
    await interviewWebhookStatusManager.updateProgress(sessionId, 10, 'preparing-generation');

    // 执行生成
    const result = await interviewWebhookProcessor.processCoachingGeneration(request);

    // 更新状态：完成
    await interviewWebhookStatusManager.completeTask(sessionId, result);

    // 更新Webhook请求记录
    await interviewWebhookStatusManager.updateWebhookRequest(requestId, {
      status: 'completed',
      responseData: result
    });

    console.log(`[Webhook B] Successfully generated coaching for session ${sessionId}`);

    // 可选：发送通知给用户
    await sendCompletionNotification(sessionId, result);

  } catch (error) {
    console.error(`[Webhook B] Failed to generate coaching for session ${sessionId}:`, error);

    // 处理错误和重试
    await interviewWebhookErrorHandler.handleError({
      sessionId,
      webhookType: 'coaching-generate',
      requestId,
      attempt: 1,
      error: error as Error,
      timestamp: new Date().toISOString()
    }, () => processCoachingGenerationAsync(request, requestId));

    // 更新Webhook请求记录
    await interviewWebhookStatusManager.updateWebhookRequest(requestId, {
      status: 'failed',
      errorMessage: (error as Error).message
    });
  }
}

/**
 * 发送完成通知
 */
async function sendCompletionNotification(sessionId: string, result: CoachingGenerationResult): Promise<void> {
  try {
    // 这里可以集成邮件、短信或推送通知服务
    console.log(`[Notification] Coaching materials ready for session ${sessionId}`);

    // 示例：发送到外部通知服务
    // await notificationService.send({
    //   type: 'webhook-completed',
    //   sessionId,
    //   message: '您的面试辅导材料已准备完成',
    //   data: result
    // });
  } catch (error) {
    console.error('Failed to send notification:', error);
    // 不抛出错误，避免影响主流程
  }
}

/**
 * 生成请求ID
 */
function generateRequestId(): string {
  return `coach_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * GET方法：获取处理状态
 */
export async function GET(
  request: NextRequest
): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('sessionId');

  if (!sessionId) {
    return NextResponse.json({
      success: false,
      sessionId: '',
      status: 'failed',
      error: {
        code: 'MISSING_SESSION_ID',
        message: 'Session ID is required'
      },
      timestamp: new Date().toISOString(),
      requestId: ''
    }, { status: 400 });
  }

  try {
    const task = await interviewWebhookStatusManager.getTaskStatus(sessionId);

    if (!task) {
      return NextResponse.json({
        success: false,
        sessionId,
        status: 'failed',
        error: {
          code: 'SESSION_NOT_FOUND',
          message: 'Session not found'
        },
        timestamp: new Date().toISOString(),
        requestId: ''
      }, { status: 404 });
    }

    return NextResponse.json({
      success: task.status === 'completed',
      sessionId,
      status: task.status,
      data: task.resultData,
      error: task.errorDetails?.message,
      timestamp: new Date().toISOString(),
      requestId: ''
    });

  } catch (error) {
    console.error('[Webhook B GET] Error:', error);
    return NextResponse.json({
      success: false,
      sessionId,
      status: 'failed',
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to get status'
      },
      timestamp: new Date().toISOString(),
      requestId: ''
    }, { status: 500 });
  }
}

/**
 * DELETE方法：取消处理
 */
export async function DELETE(
  request: NextRequest
): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('sessionId');

  if (!sessionId) {
    return NextResponse.json({
      success: false,
      sessionId: '',
      status: 'failed',
      error: {
        code: 'MISSING_SESSION_ID',
        message: 'Session ID is required'
      },
      timestamp: new Date().toISOString(),
      requestId: ''
    }, { status: 400 });
  }

  try {
    // 取消处理器中的任务
    const cancelled = interviewWebhookProcessor.cancelTask(sessionId);

    // 取消重试
    interviewWebhookErrorHandler.cancelRetry(sessionId);

    // 更新状态
    await interviewWebhookStatusManager.failTask(
      sessionId,
      new Error('Task cancelled by user'),
      false
    );

    return NextResponse.json({
      success: true,
      sessionId,
      status: 'failed',
      data: {
        message: cancelled ? 'Task cancelled successfully' : 'Task was not active'
      },
      timestamp: new Date().toISOString(),
      requestId: ''
    });

  } catch (error) {
    console.error('[Webhook B DELETE] Error:', error);
    return NextResponse.json({
      success: false,
      sessionId,
      status: 'failed',
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to cancel task'
      },
      timestamp: new Date().toISOString(),
      requestId: ''
    }, { status: 500 });
  }
}