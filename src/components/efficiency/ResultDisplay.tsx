import React from 'react';
import { cn } from '@/lib/utils';
import { AnalysisResults, AnalysisPhase } from '@/lib/efficiency/analysisFlow';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  CheckCircle,
  Lightbulb,
  TrendingUp,
  Star,
  Download,
  Share2,
  ArrowRight,
  AlertTriangle,
  Info
} from 'lucide-react';

interface ResultDisplayProps {
  results: AnalysisResults;
  phase: AnalysisPhase;
  className?: string;
  compact?: boolean;
  showActions?: boolean;
  onContinue?: () => void;
  onExport?: () => void;
  onShare?: () => void;
}

export function ResultDisplay({
  results,
  phase,
  className,
  compact = false,
  showActions = true,
  onContinue,
  onExport,
  onShare
}: ResultDisplayProps) {
  const isPreliminary = phase === AnalysisPhase.PRELIMINARY;
  const isDeep = phase === AnalysisPhase.DEEP || phase === AnalysisPhase.COMPLETED;

  if (compact) {
    return (
      <div className={cn('space-y-4', className)}>
        {/* 简化版摘要 */}
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start space-x-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-semibold text-blue-900 mb-1">
                {isPreliminary ? '初步分析结果' : '深度分析结果'}
              </h4>
              <p className="text-sm text-blue-700">{results.summary}</p>
            </div>
          </div>
        </div>

        {/* 分数展示 */}
        {results.scores && (
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Star className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium">总分: {results.scores.overall}</span>
            </div>
            {showActions && isPreliminary && onContinue && (
              <button
                onClick={onContinue}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center"
              >
                继续深度分析
                <ArrowRight className="w-3 h-3 ml-1" />
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* 结果头部 */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center space-x-2">
          <CheckCircle className="w-6 h-6 text-green-500" />
          <h2 className="text-2xl font-bold text-gray-900">
            {isPreliminary ? '初步分析完成' : '深度分析完成'}
          </h2>
        </div>
        <p className="text-gray-600">
          {isPreliminary
            ? '已为您生成初步分析报告，可以选择继续深度分析获得更详细的洞察'
            : '已为您生成完整的分析报告，包含详细的洞察和具体的建议'
          }
        </p>
      </div>

      {/* 总分卡片 */}
      {results.scores && (
        <Card className="border-2 border-blue-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
            <CardTitle className="text-center text-blue-900">综合评分</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center space-x-3">
                <div className="text-5xl font-bold text-blue-600">
                  {results.scores.overall}
                </div>
                <div className="text-2xl text-gray-500">/100</div>
              </div>

              {/* 分类分数 */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
                {Object.entries(results.scores.categories).map(([category, score]) => (
                  <div key={category} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">{category}</span>
                      <span className="text-sm font-bold text-gray-900">{score}</span>
                    </div>
                    <Progress value={score} className="h-2" />
                  </div>
                ))}
              </div>

              {/* 分数解读 */}
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">
                  {results.scores.overall >= 90 && '优秀！您的表现非常出色。'}
                  {results.scores.overall >= 80 && results.scores.overall < 90 && '良好！有不错的表现。'}
                  {results.scores.overall >= 70 && results.scores.overall < 80 && '中等，还有提升空间。'}
                  {results.scores.overall < 70 && '需要改进，建议重点关注提升建议。'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 分析摘要 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Info className="w-5 h-5 text-blue-600" />
            <span>分析摘要</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 leading-relaxed">{results.summary}</p>
        </CardContent>
      </Card>

      {/* 关键洞察 */}
      {results.insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Lightbulb className="w-5 h-5 text-yellow-500" />
              <span>关键洞察</span>
              <Badge variant="secondary">{results.insights.length} 项</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {results.insights.map((insight, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200"
                >
                  <div className="flex-shrink-0 w-6 h-6 bg-yellow-200 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-yellow-800">{index + 1}</span>
                  </div>
                  <p className="text-sm text-gray-700 flex-1">{insight}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 改进建议 */}
      {results.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <span>改进建议</span>
              <Badge variant="secondary">{results.recommendations.length} 项</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {results.recommendations.map((recommendation, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg border border-green-200"
                >
                  <div className="flex-shrink-0 w-6 h-6 bg-green-200 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-green-800">{index + 1}</span>
                  </div>
                  <p className="text-sm text-gray-700 flex-1">{recommendation}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 详细数据 */}
      {results.data && isDeep && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-purple-600" />
              <span>详细数据</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {Object.entries(results.data).map(([key, value]) => (
                <div key={key} className="space-y-2">
                  <h4 className="font-semibold text-gray-900 capitalize">
                    {key.replace(/_/g, ' ')}
                  </h4>
                  {typeof value === 'object' && value !== null ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(value).map(([subKey, subValue]) => (
                        <div
                          key={subKey}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded"
                        >
                          <span className="text-sm text-gray-600">
                            {subKey.replace(/_/g, ' ')}
                          </span>
                          <span className="text-sm font-medium text-gray-900">
                            {typeof subValue === 'number' ? subValue : String(subValue)}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-700">{String(value)}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 操作按钮 */}
      {showActions && (
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
          {isPreliminary && onContinue && (
            <button
              onClick={onContinue}
              className="flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <span>继续深度分析</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {onExport && (
            <button
              onClick={onExport}
              className="flex items-center justify-center space-x-2 px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              <Download className="w-4 h-4" />
              <span>导出报告</span>
            </button>
          )}

          {onShare && (
            <button
              onClick={onShare}
              className="flex items-center justify-center space-x-2 px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              <Share2 className="w-4 h-4" />
              <span>分享结果</span>
            </button>
          )}
        </div>
      )}

      {/* 初步分析提示 */}
      {isPreliminary && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start space-x-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-blue-900 mb-1}>深度分析可用</h4>
              <p className="text-sm text-blue-700">
                这是初步分析结果。继续进行深度分析可以获得更详细的洞察、具体的改进建议和专业的行动计划。
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 结果概览组件，用于在侧边栏或小空间中显示
export function ResultOverview({
  results,
  phase,
  className
}: {
  results: AnalysisResults;
  phase: AnalysisPhase;
  className?: string;
}) {
  const insightsCount = results.insights.length;
  const recommendationsCount = results.recommendations.length;
  const overallScore = results.scores?.overall || 0;

  return (
    <div className={cn('space-y-4', className)}>
      <div className="text-center space-y-2">
        <div className="text-3xl font-bold text-blue-600">{overallScore}</div>
        <div className="text-sm text-gray-600">综合评分</div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">关键洞察</span>
          <Badge variant="secondary">{insightsCount}</Badge>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">改进建议</span>
          <Badge variant="secondary">{recommendationsCount}</Badge>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">分析类型</span>
          <Badge variant={phase === AnalysisPhase.PRELIMINARY ? 'outline' : 'default'}>
            {phase === AnalysisPhase.PRELIMINARY ? '初步' : '深度'}
          </Badge>
        </div>
      </div>

      <div className="pt-3 border-t border-gray-200">
        <p className="text-xs text-gray-600 line-clamp-3">{results.summary}</p>
      </div>
    </div>
  );
}