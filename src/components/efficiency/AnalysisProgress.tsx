import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { AnalysisPhase, AnalysisFlowManager } from '@/lib/efficiency/analysisFlow';
import { Loader2, Brain, Search, Target, CheckCircle, AlertCircle } from 'lucide-react';

interface AnalysisProgressProps {
  flowManager: AnalysisFlowManager;
  className?: string;
  compact?: boolean;
}

// 步骤图标映射
const STEP_ICONS = {
  '数据扫描': Search,
  '基础分析': Brain,
  '生成初步报告': CheckCircle,
  '详细数据处理': Search,
  '深度模式识别': Brain,
  '专业建议生成': Target,
  '报告完善': CheckCircle
};

export function AnalysisProgress({ flowManager, className, compact = false }: AnalysisProgressProps) {
  const [currentStep, setCurrentStep] = useState<string>('');
  const [isPaused, setIsPaused] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const state = flowManager.getCurrentState();
    if (state) {
      setIsPaused(state.isPaused);
      setError(state.error || '');
    }
  }, [flowManager]);

  const currentState = flowManager.getCurrentState();
  if (!currentState || currentState.phase === AnalysisPhase.INITIAL) {
    return null;
  }

  const isCompleted = currentState.phase === AnalysisPhase.COMPLETED;
  const progress = currentState.progress;

  // 获取当前阶段的步骤
  const getCurrentPhaseSteps = () => {
    const config = AnalysisFlowManager.getPhaseConfig(currentState.phase);
    return config?.steps || [];
  };

  // 计算当前步骤索引
  const getCurrentStepIndex = () => {
    if (isCompleted) return -1;
    if (isPaused) return getCurrentPhaseSteps().length;

    const steps = getCurrentPhaseSteps();
    const progressRange = currentState.phase === AnalysisPhase.PRELIMINARY ? 30 : 70;
    const startProgress = currentState.phase === AnalysisPhase.PRELIMINARY ? 0 : 30;
    const relativeProgress = (progress - startProgress) / progressRange;

    return Math.min(Math.floor(relativeProgress * steps.length), steps.length - 1);
  };

  const stepIndex = getCurrentStepIndex();
  const steps = getCurrentPhaseSteps();
  const currentStepName = steps[stepIndex];

  if (compact) {
    return (
      <div className={cn('flex items-center space-x-3', className)}>
        <div className="relative">
          {isCompleted ? (
            <CheckCircle className="w-5 h-5 text-green-500" />
          ) : (
            <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-gray-700">
              {isCompleted ? '分析完成' : (currentStepName || '准备中...')}
            </span>
            <span className="text-sm text-gray-500">{progress}%</span>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={cn(
                'h-2 rounded-full transition-all duration-300 ease-out',
                isCompleted ? 'bg-green-500' : 'bg-blue-500'
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {error && (
          <AlertCircle className="w-5 h-5 text-red-500" />
        )}
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* 进度条 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {isCompleted ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
            )}
            <span className="text-lg font-semibold text-gray-900">
              {isCompleted ? '分析已完成' : '正在分析...'}
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-2xl font-bold text-blue-600">{progress}%</span>
            {isPaused && (
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                已暂停
              </span>
            )}
          </div>
        </div>

        {/* 主进度条 */}
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className={cn(
              'h-3 rounded-full transition-all duration-500 ease-out relative',
              isCompleted ? 'bg-green-500' : 'bg-gradient-to-r from-blue-500 to-purple-500'
            )}
            style={{ width: `${progress}%` }}
          >
            {!isCompleted && (
              <div className="absolute inset-0 bg-white opacity-25 animate-pulse" />
            )}
          </div>
        </div>
      </div>

      {/* 步骤详情 */}
      {!isCompleted && steps.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">当前阶段步骤</h4>

          <div className="space-y-2">
            {steps.map((step, index) => {
              const isActive = index === stepIndex;
              const isCompleted = index < stepIndex || (isPaused && index === stepIndex);
              const Icon = STEP_ICONS[step as keyof typeof STEP_ICONS] || Search;

              return (
                <div
                  key={step}
                  className={cn(
                    'flex items-center space-x-3 p-3 rounded-lg transition-all duration-200',
                    isActive && 'bg-blue-50 border border-blue-200',
                    isCompleted && !isActive && 'bg-green-50 border border-green-200',
                    !isActive && !isCompleted && 'bg-gray-50 border border-gray-200'
                  )}
                >
                  <div className="flex-shrink-0">
                    <Icon className={cn(
                      'w-5 h-5',
                      isActive && 'text-blue-600',
                      isCompleted && 'text-green-600',
                      !isActive && !isCompleted && 'text-gray-400'
                    )} />
                  </div>

                  <div className="flex-1">
                    <p className={cn(
                      'font-medium',
                      isActive && 'text-blue-900',
                      isCompleted && 'text-green-900',
                      !isActive && !isCompleted && 'text-gray-600'
                    )}>
                      {step}
                    </p>
                    {isActive && (
                      <p className="text-sm text-blue-600 mt-1">
                        正在处理中...
                      </p>
                    )}
                    {isCompleted && !isActive && (
                      <p className="text-sm text-green-600 mt-1">
                        已完成
                      </p>
                    )}
                  </div>

                  <div className="flex-shrink-0">
                    {isActive && (
                      <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                    )}
                    {isCompleted && !isActive && (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    )}
                    {!isActive && !isCompleted && (
                      <Circle className="w-4 h-4 text-gray-300" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 阶段说明 */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
        <div className="flex items-start space-x-3">
          <Brain className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-blue-900 mb-1">
              {currentState.phase === AnalysisPhase.PRELIMINARY ? '初步分析' : '深度分析'}
            </h4>
            <p className="text-sm text-blue-700">
              {currentState.phase === AnalysisPhase.PRELIMINARY
                ? '正在进行快速扫描和基础分析，这将为您提供初步的洞察和建议。'
                : '正在进行深度分析，将为您生成详细的洞察、具体的建议和行动计划。'}
            </p>
          </div>
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-red-900 mb-1">分析出错</h4>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* 完成状态 */}
      {isCompleted && (
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-green-900 mb-1">分析完成</h4>
              <p className="text-sm text-green-700">
                恭喜！您的分析已经完成。现在您可以查看详细的分析结果和建议。
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 进度状态指示器，用于显示当前状态
export function ProgressStatus({
  flowManager,
  className
}: {
  flowManager: AnalysisFlowManager;
  className?: string;
}) {
  const [status, setStatus] = useState<{
    phase: AnalysisPhase;
    progress: number;
    isPaused: boolean;
    error?: string;
  } | null>(null);

  useEffect(() => {
    const updateStatus = () => {
      const state = flowManager.getCurrentState();
      if (state) {
        setStatus({
          phase: state.phase,
          progress: state.progress,
          isPaused: state.isPaused,
          error: state.error
        });
      }
    };

    updateStatus();
    const interval = setInterval(updateStatus, 1000);
    return () => clearInterval(interval);
  }, [flowManager]);

  if (!status) return null;

  const { phase, progress, isPaused, error } = status;

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <div className={cn(
        'w-2 h-2 rounded-full',
        phase === AnalysisPhase.COMPLETED ? 'bg-green-500' :
        phase === AnalysisPhase.DEEP ? 'bg-purple-500' :
        'bg-blue-500'
      )} />

      <span className="text-sm font-medium text-gray-700">
        {phase === AnalysisPhase.COMPLETED && '已完成'}
        {phase === AnalysisPhase.DEEP && '深度分析中'}
        {phase === AnalysisPhase.PRELIMINARY && '初步分析中'}
        {isPaused && ' (已暂停)'}
      </span>

      {error && (
        <AlertCircle className="w-4 h-4 text-red-500" />
      )}
    </div>
  );
}