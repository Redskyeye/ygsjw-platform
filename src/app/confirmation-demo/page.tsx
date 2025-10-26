'use client';

import React, { useState } from 'react';
import QuestionConfirmation from '@/components/efficiency/QuestionConfirmation';
import { AnalysisResult, ConfirmationState } from '@/types/confirmation';

// 示例数据
const mockAnalysisResult: AnalysisResult = {
  id: 'analysis-001',
  title: '职业发展路径分析',
  summary: '基于您的背景和目标，我们为您提供了个性化的职业发展建议',
  confidence: 85,
  keyFindings: [
    '您在技术领域有较强的潜力',
    '建议加强项目管理和沟通能力',
    '考虑向技术管理方向发展'
  ],
  suggestedActions: [
    '参加项目管理培训',
    '寻求更多领导机会',
    '扩展技术栈深度和广度'
  ],
  questions: [
    {
      id: 'q1',
      content: '您目前的技术栈是否与我们的分析一致？',
      category: 'accuracy',
      aiSuggestion: '基于您的简历，您主要掌握 React、TypeScript 和 Node.js',
      confirmed: false,
      priority: 'high'
    },
    {
      id: 'q2',
      content: '您是否有兴趣转向技术管理岗位？',
      category: 'clarification',
      aiSuggestion: '根据您的经验，技术管理可能是很好的发展方向',
      confirmed: false,
      priority: 'high'
    },
    {
      id: 'q3',
      content: '您希望在未来1-2年内提升哪些关键技能？',
      category: 'additional',
      confirmed: false,
      priority: 'medium'
    },
    {
      id: 'q4',
      content: '您的工作经历中是否有遗漏的重要项目？',
      category: 'completeness',
      confirmed: false,
      priority: 'medium'
    },
    {
      id: 'q5',
      content: '您对当前的薪资水平满意吗？',
      category: 'additional',
      confirmed: false,
      priority: 'low'
    }
  ]
};

export default function ConfirmationDemoPage() {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationState | null>(null);

  const handleConfirmationComplete = (result: ConfirmationState) => {
    setConfirmationResult(result);
    setShowConfirmation(false);
  };

  const handleReset = () => {
    setConfirmationResult(null);
    setShowConfirmation(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            问题确认系统演示
          </h1>
          <p className="text-lg text-gray-600">
            这是一个智能问题确认系统，帮助用户确认AI分析的准确性并提供补充信息。
          </p>
        </div>

        {/* 功能介绍 */}
        {!showConfirmation && !confirmationResult && (
          <div className="bg-white rounded-lg border border-gray-200 p-8 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">系统功能特点</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-4xl mb-3">✅</div>
                <h3 className="font-medium text-gray-900 mb-2">智能确认</h3>
                <p className="text-sm text-gray-600">
                  逐项确认AI分析结果，支持修正和补充
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-3">⌨️</div>
                <h3 className="font-medium text-gray-900 mb-2">键盘快捷键</h3>
                <p className="text-sm text-gray-600">
                  支持快捷操作，提高确认效率
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-3">💾</div>
                <h3 className="font-medium text-gray-900 mb-2">自动保存</h3>
                <p className="text-sm text-gray-600">
                  实时保存草稿，防止数据丢失
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-3">📊</div>
                <h3 className="font-medium text-gray-900 mb-2">进度追踪</h3>
                <p className="text-sm text-gray-600">
                  可视化进度显示，掌握完成情况
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-3">📱</div>
                <h3 className="font-medium text-gray-900 mb-2">响应式设计</h3>
                <p className="text-sm text-gray-600">
                  适配各种设备，随时随地操作
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-3">📤</div>
                <h3 className="font-medium text-gray-900 mb-2">数据导出</h3>
                <p className="text-sm text-gray-600">
                  支持多种格式导出，便于分享存档
                </p>
              </div>
            </div>

            <div className="mt-8 text-center">
              <button
                onClick={() => setShowConfirmation(true)}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                开始演示
              </button>
            </div>
          </div>
        )}

        {/* 问题确认系统 */}
        {showConfirmation && (
          <div>
            <div className="mb-6 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  正在确认: {mockAnalysisResult.title}
                </h2>
                <p className="text-gray-600">
                  AI置信度: {mockAnalysisResult.confidence}% |
                  待确认问题: {mockAnalysisResult.questions.length}个
                </p>
              </div>
              <button
                onClick={() => setShowConfirmation(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                返回演示
              </button>
            </div>

            <QuestionConfirmation
              analysisResult={mockAnalysisResult}
              onConfirmationComplete={handleConfirmationComplete}
            />
          </div>
        )}

        {/* 确认结果 */}
        {confirmationResult && (
          <div className="bg-white rounded-lg border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-green-600 mb-6">
              ✓ 确认已完成
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {confirmationResult.questions.length}
                </div>
                <div className="text-sm text-gray-600">总问题数</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {confirmationResult.questions.filter(q => q.confirmed).length}
                </div>
                <div className="text-sm text-gray-600">已确认</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">
                  {confirmationResult.overallProgress.toFixed(0)}%
                </div>
                <div className="text-sm text-gray-600">完成进度</div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">确认详情</h3>
              <div className="space-y-3">
                {confirmationResult.questions.map((question) => (
                  <div
                    key={question.id}
                    className={`border rounded-lg p-4 ${
                      question.confirmed
                        ? 'border-green-200 bg-green-50'
                        : 'border-red-200 bg-red-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{question.content}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        question.confirmed
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {question.confirmed ? '已确认' : '需要修正'}
                      </span>
                    </div>
                    {question.userAnswer && (
                      <p className="text-sm text-gray-700">
                        <strong>回答:</strong> {question.userAnswer}
                      </p>
                    )}
                    {question.notes && (
                      <p className="text-sm text-gray-600 mt-1">
                        <strong>备注:</strong> {question.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleReset}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                重新演示
              </button>
              <button
                onClick={() => {
                  const dataStr = JSON.stringify(confirmationResult, null, 2);
                  const blob = new Blob([dataStr], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `confirmation-result-${Date.now()}.json`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                }}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                导出结果
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}