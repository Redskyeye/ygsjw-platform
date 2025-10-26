/**
 * 面试Webhook状态查询端点
 * GET /api/webhook/interview/status?sessionId=<sessionId>
 */

import { NextRequest, NextResponse } from 'next/server';
import { interviewWebhookStatusManager } from '@/lib/interview-webhook/status-manager';
import { StatusResponse } from '@/types/interview-webhook';

export async function GET(request: NextRequest): Promise<NextResponse<StatusResponse>> {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('sessionId');

  if (!sessionId) {
    return NextResponse.json({
      sessionId: '',
      status: 'failed',
      progress: 0,
      currentStep: '',
      error: 'Session ID is required',
      timestamp: new Date().toISOString()
    }, { status: 400 });
  }

  try {
    // 获取任务状态
    const task = await interviewWebhookStatusManager.getTaskStatus(sessionId);

    if (!task) {
      return NextResponse.json({
        sessionId,
        status: 'failed',
        progress: 0,
        currentStep: '',
        error: 'Session not found',
        timestamp: new Date().toISOString()
      }, { status: 404 });
    }

    // 构建响应
    const response: StatusResponse = {
      sessionId,
      status: task.status,
      progress: task.progress,
      currentStep: task.currentStep,
      message: task.errorDetails?.message || undefined,
      result: task.resultData || undefined,
      error: task.status === 'failed' ? task.errorDetails?.message : undefined,
      estimatedTimeRemaining: task.estimatedCompletion ?
        Math.max(0, new Date(task.estimatedCompletion).getTime() - Date.now()) : undefined,
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('[Status API] Error:', error);
    return NextResponse.json({
      sessionId,
      status: 'failed',
      progress: 0,
      currentStep: '',
      error: 'Failed to get status',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}