import React, { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { AnalysisFlowManager, AnalysisPhase, AnalysisConfig } from '@/lib/efficiency/analysisFlow';
import { PhaseIndicator } from './PhaseIndicator';
import { AnalysisProgress } from './AnalysisProgress';
import { ResultDisplay } from './ResultDisplay';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Play,
  Pause,
  RotateCcw,
  ChevronLeft,
  Download,
  Share2,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

interface TwoPhaseAnalysisProps {
  dataType: string;
  userId?: string;
  initialData?: any;
  options?: Record<string, any>;
  className?: string;
  onStart?: () => void;
  onComplete?: (results: any) => void;
  onError?: (error: string) => void;
}

export function TwoPhaseAnalysis({
  dataType,
  userId,
  initialData,
  options = {},
  className,
  onStart,
  onComplete,
  onError
}: TwoPhaseAnalysisProps) {
  // 状态管理
  const [flowManager, setFlowManager] = useState<AnalysisFlowManager | null>(null);
  const [currentPhase, setCurrentPhase] = useState<AnalysisPhase>(AnalysisPhase.INITIAL);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [showResults, setShowResults] = useState(false);

  // 初始化流程管理器
  useEffect(() => {
    const config: AnalysisConfig = {
      userId,
      dataType,
      options: { ...options, initialData },
      autoSave: true,
      onPhaseChange: (phase) => {
        setCurrentPhase(phase);
        if (phase === AnalysisPhase.COMPLETED) {
          setShowResults(true);
        }
      },
      onProgress: (progress) => {
        // 可以在这里添加全局进度处理
      },
      onComplete: (results) => {
        setIsLoading(false);
        onComplete?.(results);
      },
      onError: (error) => {
        setIsLoading(false);
        setError(error);
        onError?.(error);
      }
    };

    const manager = new AnalysisFlowManager(config);
    setFlowManager(manager);

    // 检查是否有已保存的分析
    const savedState = manager.getCurrentState();
    if (savedState) {
      setCurrentPhase(savedState.phase);
      if (savedState.phase === AnalysisPhase.COMPLETED) {
        setShowResults(true);
      }
    }

    return () => {
      manager.resetAnalysis();
    };
  }, [dataType, userId, options, initialData, onComplete, onError]);

  // 开始分析
  const handleStart = useCallback(async () => {
    if (!flowManager) return;

    setIsLoading(true);
    setError('');
    setShowResults(false);

    try {
      onStart?.();
      await flowManager.startAnalysis();
    } catch (error) {
      setError(error instanceof Error ? error.message : '开始分析失败');
      setIsLoading(false);
    }
  }, [flowManager, onStart]);

  // 继续深度分析
  const handleContinue = useCallback(async () => {
    if (!flowManager) return;

    setIsLoading(true);
    setError('');
    setShowResults(false);

    try {
      await flowManager.continueToNextPhase();
    } catch (error) {
      setError(error instanceof Error ? error.message : '继续分析失败');
      setIsLoading(false);
    }
  }, [flowManager]);

  // 暂停分析
  const handlePause = useCallback(() => {
    if (!flowManager) return;
    flowManager.pauseAnalysis();
    setIsLoading(false);
  }, [flowManager]);

  // 恢复分析
  const handleResume = useCallback(async () => {
    if (!flowManager) return;

    setIsLoading(true);
    setError('');
    try {
      await flowManager.resumeAnalysis();
    } catch (error) {
      setError(error instanceof Error ? error.message : '恢复分析失败');
      setIsLoading(false);
    }
  }, [flowManager]);

  // 返回上一阶段
  const handleGoBack = useCallback(async () => {
    if (!flowManager) return;

    setIsLoading(true);
    setError('');
    setShowResults(false);

    try {
      await flowManager.goBackToPrevious();
    } catch (error) {
      setError(error instanceof Error ? error.message : '返回失败');
      setIsLoading(false);
    }
  }, [flowManager]);

  // 重置分析
  const handleReset = useCallback(() => {
    if (!flowManager) return;

    flowManager.resetAnalysis();
    setCurrentPhase(AnalysisPhase.INITIAL);
    setIsLoading(false);
    setError('');
    setShowResults(false);
  }, [flowManager]);

  // 导出结果
  const handleExport = useCallback(() => {
    const state = flowManager?.getCurrentState();
    if (!state) return;

    const data = {
      phase: state.phase,
      preliminaryResults: state.preliminaryResults,
      deepResults: state.deepResults,
      createdAt: state.createdAt,
      updatedAt: state.updatedAt
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analysis-results-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [flowManager]);

  // 分享结果
  const handleShare = useCallback(() => {
    const state = flowManager?.getCurrentState();
    if (!state) return;

    const shareData = {
      title: '分析结果',
      text: '查看我的分析结果',
      url: window.location.href
    };

    if (navigator.share) {
      navigator.share(shareData);
    } else {
      // 降级到复制链接
      navigator.clipboard.writeText(window.location.href);
    }
  }, [flowManager]);

  const state = flowManager?.getCurrentState();
  const isAnalyzing = currentPhase === AnalysisPhase.PRELIMINARY || currentPhase === AnalysisPhase.DEEP;
  const isPaused = state?.isPaused;
  const hasResults = state?.preliminaryResults || state?.deepResults;

  return (
    <div className={cn('w-full max-w-4xl mx-auto', className)}>
      {/* 阶段指示器 */}
      <PhaseIndicator currentPhase={currentPhase} className="mb-8" />

      {/* 错误提示 */}
      {error && (
        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-700">{error}</AlertDescription>
        </Alert>
      )}

      {/* 主要内容区域 */}
      <div className="space-y-6">
        {/* 初始状态 */}
        {currentPhase === AnalysisPhase.INITIAL && !isLoading && (
          <div className="text-center space-y-6 py-12">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-gray-900">开始分析</h2>
              <p className="text-gray-600 max-w-md mx-auto">
                通过两阶段分析流程，快速获得初步洞察，然后进行深度分析获得详细建议。
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <div className="p-6 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-blue-600 font-semibold mb-2">初步分析</div>
                <div className="text-sm text-blue-700">
                  快速扫描基础信息，生成初步洞察和建议
                </div>
              </div>

              <div className="p-6 bg-purple-50 rounded-lg border border-purple-200">
                <div className="text-purple-600 font-semibold mb-2">深度分析</div>
                <div className="text-sm text-purple-700">
                  详细分析数据，提供专业建议和行动计划
                </div>
              </div>
            </div>

            <Button onClick={handleStart} className="px-8 py-3 text-lg" disabled={isLoading}>
              <Play className="w-5 h-5 mr-2" />
              开始分析
            </Button>
          </div>
        )}

        {/* 分析进行中 */}
        {isAnalyzing && (
          <div className="space-y-6">
            <AnalysisProgress flowManager={flowManager!} className="mb-6" />

            {/* 控制按钮 */}
            <div className="flex flex-wrap gap-3 justify-center">
              {!isPaused ? (
                <Button onClick={handlePause} variant="outline">
                  <Pause className="w-4 h-4 mr-2" />
                  暂停
                </Button>
              ) : (
                <Button onClick={handleResume}>
                  <Play className="w-4 h-4 mr-2" />
                  继续
                </Button>
              )}

              <Button onClick={handleReset} variant="outline">
                <RotateCcw className="w-4 h-4 mr-2" />
                重置
              </Button>
            </div>
          </div>
        )}

        {/* 初步分析结果 */}
        {currentPhase === AnalysisPhase.PRELIMINARY && state?.preliminaryResults && !isLoading && (
          <div className="space-y-6">
            <ResultDisplay
              results={state.preliminaryResults}
              phase={AnalysisPhase.PRELIMINARY}
              onContinue={handleContinue}
              onExport={handleExport}
              onShare={handleShare}
            />

            {/* 导航按钮 */}
            <div className="flex justify-center space-x-4">
              <Button onClick={handleGoBack} variant="outline">
                <ChevronLeft className="w-4 h-4 mr-2" />
                返回修改
              </Button>

              <Button onClick={handleContinue} size="lg">
                继续深度分析
                <Play className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* 深度分析结果 */}
        {(currentPhase === AnalysisPhase.COMPLETED || showResults) && state?.deepResults && !isLoading && (
          <div className="space-y-6">
            <div className="text-center space-y-2 mb-6">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
              <h2 className="text-2xl font-bold text-gray-900">分析完成</h2>
              <p className="text-gray-600">
                您的深度分析已完成，可以查看详细结果和建议
              </p>
            </div>

            <ResultDisplay
              results={state.deepResults}
              phase={AnalysisPhase.COMPLETED}
              onExport={handleExport}
              onShare={handleShare}
            />

            {/* 操作按钮 */}
            <div className="flex justify-center space-x-4 pt-6">
              <Button onClick={handleReset} variant="outline">
                <RotateCcw className="w-4 h-4 mr-2" />
                重新分析
              </Button>

              <Button onClick={handleExport} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                导出报告
              </Button>

              <Button onClick={handleShare} variant="outline">
                <Share2 className="w-4 h-4 mr-2" />
                分享结果
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* 帮助信息 */}
      <div className="mt-12 p-6 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-3">使用说明</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <p>• 两阶段分析流程为您提供渐进式的分析体验</p>
          <p>• 初步分析快速生成基础洞察，通常需要1-2分钟</p>
          <p>• 深度分析提供详细建议，通常需要3-5分钟</p>
          <p>• 您可以随时暂停和恢复分析过程</p>
          <p>• 分析结果会自动保存，可以随时查看</p>
        </div>
      </div>
    </div>
  );
}

// 默认导出
export default TwoPhaseAnalysis;