'use client';

import React from 'react';
import TwoPhaseAnalysis from '@/components/efficiency/TwoPhaseAnalysis';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TwoPhaseAnalysisDemo() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            两阶段分析流程系统
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            体验智能的两阶段分析流程，从初步分析到深度洞察，为您提供渐进式的分析体验。
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* 侧边栏 */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">功能特性</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">两阶段渐进式分析</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">实时进度追踪</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-sm">智能暂停恢复</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm">本地数据持久化</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-sm">详细分析报告</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">使用说明</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <p>1. 点击"开始分析"按钮</p>
                <p>2. 等待初步分析完成</p>
                <p>3. 查看初步结果</p>
                <p>4. 选择继续深度分析</p>
                <p>5. 获得完整分析报告</p>
              </CardContent>
            </Card>
          </div>

          {/* 主要内容 */}
          <div className="lg:col-span-3">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl">分析演示</CardTitle>
              </CardHeader>
              <CardContent>
                <TwoPhaseAnalysis
                  dataType="career-planning"
                  userId="demo-user"
                  options={{
                    analysisType: "comprehensive",
                    includeRecommendations: true,
                    detailedInsights: true
                  }}
                  onStart={() => {
                    console.log('分析开始');
                  }}
                  onComplete={(results) => {
                    console.log('分析完成:', results);
                  }}
                  onError={(error) => {
                    console.error('分析错误:', error);
                  }}
                />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 底部信息 */}
        <div className="mt-12 text-center text-sm text-gray-500">
          <p>这是两阶段分析流程系统的演示页面。实际使用时可以根据具体需求调整配置。</p>
        </div>
      </div>
    </div>
  );
}