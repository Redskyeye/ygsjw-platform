---
created: 2025-10-26T08:00:00Z
last_updated: 2025-10-26T08:00:00Z
version: 1.0
author: Claude Code PM System
---

import { NextRequest, NextResponse } from 'next/server';
import { OptimizationHistory } from '@/lib/optimizer/optimization-history';

const history = new OptimizationHistory();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 验证参数
    if (!body.version1Id || !body.version2Id) {
      return NextResponse.json(
        { success: false, error: '版本ID不能为空' },
        { status: 400 }
      );
    }

    // 执行对比
    const comparison = await history.compareVersions(
      body.version1Id,
      body.version2Id
    );

    return NextResponse.json({
      success: true,
      data: comparison
    });
  } catch (error) {
    console.error('对比API错误:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '版本对比失败'
      },
      { status: 500 }
    );
  }
}