import { NextRequest, NextResponse } from 'next/server';
import { reportService } from '@/lib/efficiency/reportService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { taskId, reportUrl, status, error } = body;

    console.log('收到N8N webhook回调:', { taskId, reportUrl, status, error });

    // 这里可以：
    // 1. 更新数据库中的报告状态
    // 2. 通过WebSocket或SSE通知前端
    // 3. 发送邮件通知用户
    // 4. 将报告URL存储到缓存中

    // 模拟存储报告URL
    if (reportUrl) {
      // 存储到Redis或其他缓存服务
      // await redis.setex(`report:${taskId}`, 3600, reportUrl);
    }

    return NextResponse.json({
      success: true,
      message: 'Webhook接收成功',
      taskId
    });
  } catch (error) {
    console.error('处理webhook失败:', error);
    return NextResponse.json(
      { error: '处理webhook失败' },
      { status: 500 }
    );
  }
}