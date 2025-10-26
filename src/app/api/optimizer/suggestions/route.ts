---
created: 2025-10-26T08:00:00Z
last_updated: 2025-10-26T08:00:00Z
version: 1.0
author: Claude Code PM System
---

import { NextRequest, NextResponse } from 'next/server';
import { ResumeOptimizer } from '@/lib/optimizer';

const optimizer = new ResumeOptimizer();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 验证参数
    if (!body.resumeId || !body.section || !body.content) {
      return NextResponse.json(
        { success: false, error: '参数不完整' },
        { status: 400 }
      );
    }

    // 获取实时建议
    const suggestions = await optimizer.getRealtimeSuggestions({
      resumeId: body.resumeId,
      section: body.section,
      content: body.content,
      context: body.context
    });

    return NextResponse.json({
      success: true,
      data: {
        suggestions,
        optimizedContent: suggestions[0]?.example?.after,
        confidence: calculateConfidence(suggestions)
      }
    });
  } catch (error) {
    console.error('建议API错误:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '获取建议失败'
      },
      { status: 500 }
    );
  }
}

// 批量优化建议
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.resumeIds || !Array.isArray(body.resumeIds)) {
      return NextResponse.json(
        { success: false, error: '简历ID列表不能为空' },
        { status: 400 }
      );
    }

    if (!body.config) {
      return NextResponse.json(
        { success: false, error: '优化配置不能为空' },
        { status: 400 }
      );
    }

    // 批量优化
    const result = await optimizer.batchOptimize({
      resumeIds: body.resumeIds,
      config: body.config,
      jobDescription: body.jobDescription
    });

    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('批量优化API错误:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '批量优化失败'
      },
      { status: 500 }
    );
  }
}

function calculateConfidence(suggestions: any[]): number {
  if (!suggestions || suggestions.length === 0) return 0;

  // 基于建议数量和优先级计算置信度
  const highPriorityCount = suggestions.filter(s => s.priority === 'high').length;
  const mediumPriorityCount = suggestions.filter(s => s.priority === 'medium').length;

  return Math.min(100, (highPriorityCount * 30 + mediumPriorityCount * 20 + suggestions.length * 10));
}