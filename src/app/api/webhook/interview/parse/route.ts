/**
 * Webhook A: 面试信息解析端点
 * POST /api/webhook/interview/parse
 */

import { NextRequest, NextResponse } from 'next/server';
import { InterviewInfoRequest, InterviewAnalysisResult, WebhookResponse } from '@/types/interview-webhook';
import { interviewWebhookProcessor } from '@/lib/interview-webhook/processor';
import { interviewWebhookStatusManager } from '@/lib/interview-webhook/status-manager';
import { interviewWebhookErrorHandler } from '@/lib/interview-webhook/error-handler';
import { validateRequest, authenticateRequest } from '@/lib/webhook/utils';

export async function POST(request: NextRequest): Promise<NextResponse<WebhookResponse<InterviewAnalysisResult>>> {
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
    const body: InterviewInfoRequest = await request.json();
    sessionId = body.sessionId;
    requestId = generateRequestId();

    // 3. 验证请求数据
    const validation = validateRequest(body);
    if (!validation.valid) {
      return NextResponse.json({
        success: false,
        sessionId: sessionId || '',
        status: 'failed',
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request data',
          details: validation.errors
        },
        timestamp: new Date().toISOString(),
        requestId
      }, { status: 400 });
    }

    // 4. 记录Webhook请求
    await interviewWebhookStatusManager.recordWebhookRequest(
      'interview-parse',
      requestId,
      sessionId,
      body
    );

    // 5. 创建任务状态
    await interviewWebhookStatusManager.createTask(
      sessionId,
      'interview-parse',
      'parsing-interview-info'
    );

    // 6. 异步处理请求
    processInterviewParsingAsync(body, requestId);

    // 7. 立即返回响应
    return NextResponse.json({
      success: true,
      sessionId,
      status: 'processing',
      data: {
        message: 'Interview parsing started',
        estimatedDuration: '30-60 seconds'
      },
      timestamp: new Date().toISOString(),
      requestId
    });

  } catch (error) {
    console.error('[Webhook A] Unexpected error:', error);

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
 * 异步处理面试信息解析
 */
async function processInterviewParsingAsync(request: InterviewInfoRequest, requestId: string): Promise<void> {
  const { sessionId } = request;

  try {
    // 更新状态：开始处理
    await interviewWebhookStatusManager.updateProgress(sessionId, 10, 'validating-data');

    // 执行解析
    const result = await interviewWebhookProcessor.processInterviewParsing(request);

    // 更新状态：完成
    await interviewWebhookStatusManager.completeTask(sessionId, result);

    // 更新Webhook请求记录
    await interviewWebhookStatusManager.updateWebhookRequest(requestId, {
      status: 'completed',
      responseData: result
    });

    console.log(`[Webhook A] Successfully processed session ${sessionId}`);

  } catch (error) {
    console.error(`[Webhook A] Failed to process session ${sessionId}:`, error);

    // 处理错误和重试
    await interviewWebhookErrorHandler.handleError({
      sessionId,
      webhookType: 'interview-parse',
      requestId,
      attempt: 1,
      error: error as Error,
      timestamp: new Date().toISOString()
    }, () => processInterviewParsingAsync(request, requestId));

    // 更新Webhook请求记录
    await interviewWebhookStatusManager.updateWebhookRequest(requestId, {
      status: 'failed',
      errorMessage: (error as Error).message
    });
  }
}

/**
 * 生成请求ID
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * GET方法：获取处理状态
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
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
    console.error('[Webhook A GET] Error:', error);
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