---
created: 2025-10-26T08:00:00Z
last_updated: 2025-10-26T08:00:00Z
version: 1.0
author: Claude Code PM System
---

import { NextRequest, NextResponse } from 'next/server';
import { OptimizationHistory } from '@/lib/optimizer/optimization-history';

const history = new OptimizationHistory();

// 获取优化历史
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const resumeId = searchParams.get('resumeId');

    if (!resumeId) {
      return NextResponse.json(
        { success: false, error: '简历ID不能为空' },
        { status: 400 }
      );
    }

    const records = await history.getOptimizationHistory(resumeId);
    const statistics = await history.getOptimizationStatistics(resumeId);
    const timeline = await history.getOptimizationTimeline(resumeId);

    return NextResponse.json({
      success: true,
      data: {
        records,
        statistics,
        timeline
      }
    });
  } catch (error) {
    console.error('历史API错误:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '获取历史失败'
      },
      { status: 500 }
    );
  }
}

// 恢复版本
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.originalId || !body.versionId) {
      return NextResponse.json(
        { success: false, error: '参数不完整' },
        { status: 400 }
      );
    }

    const restoredResume = await history.restoreVersion(
      body.originalId,
      body.versionId
    );

    return NextResponse.json({
      success: true,
      data: {
        resume: restoredResume,
        message: '版本恢复成功'
      }
    });
  } catch (error) {
    console.error('恢复版本API错误:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '恢复版本失败'
      },
      { status: 500 }
    );
  }
}

// 删除版本
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const originalId = searchParams.get('originalId');
    const versionId = searchParams.get('versionId');

    if (!originalId || !versionId) {
      return NextResponse.json(
        { success: false, error: '参数不完整' },
        { status: 400 }
      );
    }

    await history.deleteVersion(originalId, versionId);

    return NextResponse.json({
      success: true,
      message: '版本删除成功'
    });
  } catch (error) {
    console.error('删除版本API错误:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '删除版本失败'
      },
      { status: 500 }
    );
  }
}