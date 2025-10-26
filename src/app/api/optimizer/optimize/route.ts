---
created: 2025-10-26T08:00:00Z
last_updated: 2025-10-26T08:00:00Z
version: 1.0
author: Claude Code PM System
---

import { NextRequest, NextResponse } from 'next/server';
import { ResumeOptimizer } from '@/lib/optimizer';
import { OptimizeRequest } from '@/types/optimizer';

const optimizer = new ResumeOptimizer();

export async function POST(request: NextRequest) {
  try {
    const body: OptimizeRequest = await request.json();

    // 验证请求参数
    if (!body.resumeId) {
      return NextResponse.json(
        { success: false, error: '简历ID不能为空' },
        { status: 400 }
      );
    }

    if (!body.config) {
      return NextResponse.json(
        { success: false, error: '优化配置不能为空' },
        { status: 400 }
      );
    }

    // 执行优化
    const result = await optimizer.optimize(body);

    // 返回结果
    if (result.success) {
      return NextResponse.json(result, { status: 200 });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('优化API错误:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '服务器内部错误'
      },
      { status: 500 }
    );
  }
}

// 预览优化效果
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.resumeId || !body.config) {
      return NextResponse.json(
        { success: false, error: '参数不完整' },
        { status: 400 }
      );
    }

    const preview = await optimizer.previewOptimization(body);

    return NextResponse.json({
      success: true,
      data: preview
    });
  } catch (error) {
    console.error('预览API错误:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '预览失败'
      },
      { status: 500 }
    );
  }
}