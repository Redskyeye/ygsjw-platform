import React from 'react';
import { cn } from '@/lib/utils';
import { AnalysisPhase } from '@/lib/efficiency/analysisFlow';
import { CheckCircle2, Circle, Clock, PlayCircle, Target, Zap } from 'lucide-react';

interface PhaseIndicatorProps {
  currentPhase: AnalysisPhase;
  className?: string;
}

// 阶段配置
const PHASES = [
  {
    phase: AnalysisPhase.PRELIMINARY,
    name: '初步分析',
    description: '快速扫描和基础分析',
    icon: Zap,
    color: 'blue'
  },
  {
    phase: AnalysisPhase.DEEP,
    name: '深度分析',
    description: '详细分析和专业建议',
    icon: Target,
    color: 'purple'
  },
  {
    phase: AnalysisPhase.COMPLETED,
    name: '分析完成',
    description: '获得完整分析报告',
    icon: CheckCircle2,
    color: 'green'
  }
];

// 颜色映射
const COLOR_CLASSES = {
  blue: {
    active: 'bg-blue-500 border-blue-500 text-blue-500',
    completed: 'bg-blue-100 border-blue-500 text-blue-700',
    pending: 'bg-gray-100 border-gray-300 text-gray-500'
  },
  purple: {
    active: 'bg-purple-500 border-purple-500 text-purple-500',
    completed: 'bg-purple-100 border-purple-500 text-purple-700',
    pending: 'bg-gray-100 border-gray-300 text-gray-500'
  },
  green: {
    active: 'bg-green-500 border-green-500 text-green-500',
    completed: 'bg-green-100 border-green-500 text-green-700',
    pending: 'bg-gray-100 border-gray-300 text-gray-500'
  }
};

// 获取阶段状态
function getPhaseStatus(currentPhase: AnalysisPhase, targetPhase: AnalysisPhase): 'completed' | 'active' | 'pending' {
  const phaseOrder = [AnalysisPhase.PRELIMINARY, AnalysisPhase.DEEP, AnalysisPhase.COMPLETED];
  const currentIndex = phaseOrder.indexOf(currentPhase);
  const targetIndex = phaseOrder.indexOf(targetPhase);

  if (targetIndex < currentIndex) return 'completed';
  if (targetIndex === currentIndex) return 'active';
  return 'pending';
}

export function PhaseIndicator({ currentPhase, className }: PhaseIndicatorProps) {
  return (
    <div className={cn('w-full', className)}>
      {/* 阶段标题 */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">分析流程</h2>
        <p className="text-gray-600">
          {currentPhase === AnalysisPhase.COMPLETED
            ? '分析已完成，您可以查看详细报告'
            : '正在为您进行分析，请稍候...'}
        </p>
      </div>

      {/* 阶段指示器 */}
      <div className="relative">
        {/* 连接线 */}
        <div className="absolute top-8 left-0 right-0 h-0.5 bg-gray-200 hidden md:block">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
            style={{
              width: currentPhase === AnalysisPhase.COMPLETED ? '100%' :
                     currentPhase === AnalysisPhase.DEEP ? '50%' : '25%'
            }}
          />
        </div>

        {/* 阶段节点 */}
        <div className="flex flex-col md:flex-row justify-between relative">
          {PHASES.map((phaseConfig, index) => {
            const status = getPhaseStatus(currentPhase, phaseConfig.phase);
            const Icon = phaseConfig.icon;
            const colorClasses = COLOR_CLASSES[phaseConfig.color as keyof typeof COLOR_CLASSES];

            return (
              <div
                key={phaseConfig.phase}
                className="flex flex-col items-center mb-8 md:mb-0 flex-1"
              >
                {/* 圆形指示器 */}
                <div className="relative mb-4">
                  <div className={cn(
                    'w-16 h-16 rounded-full border-4 flex items-center justify-center transition-all duration-300',
                    status === 'active' && `${colorClasses.active} shadow-lg scale-110`,
                    status === 'completed' && `${colorClasses.completed}`,
                    status === 'pending' && `${colorClasses.pending}`
                  )}>
                    <Icon className="w-8 h-8" />
                  </div>

                  {/* 状态指示器 */}
                  {status === 'active' && (
                    <div className="absolute -top-1 -right-1">
                      <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse" />
                    </div>
                  )}

                  {status === 'completed' && (
                    <div className="absolute -top-1 -right-1">
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    </div>
                  )}
                </div>

                {/* 阶段信息 */}
                <div className="text-center">
                  <h3 className={cn(
                    'font-semibold text-lg mb-1',
                    status === 'active' && 'text-gray-900',
                    status === 'completed' && 'text-gray-700',
                    status === 'pending' && 'text-gray-500'
                  )}>
                    {phaseConfig.name}
                  </h3>
                  <p className={cn(
                    'text-sm max-w-[200px]',
                    status === 'active' && 'text-gray-600',
                    status === 'completed' && 'text-gray-600',
                    status === 'pending' && 'text-gray-400'
                  )}>
                    {phaseConfig.description}
                  </p>
                </div>

                {/* 当前状态额外信息 */}
                {status === 'active' && (
                  <div className="mt-3 flex items-center text-blue-600">
                    <Clock className="w-4 h-4 mr-1 animate-pulse" />
                    <span className="text-sm font-medium">进行中</span>
                  </div>
                )}

                {status === 'completed' && (
                  <div className="mt-3 flex items-center text-green-600">
                    <CheckCircle2 className="w-4 h-4 mr-1" />
                    <span className="text-sm font-medium">已完成</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 阶段切换提示 */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-start">
          <PlayCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-blue-900 mb-1">当前阶段说明</h4>
            <p className="text-sm text-blue-700">
              {currentPhase === AnalysisPhase.PRELIMINARY &&
                '正在进行初步分析，快速扫描您的基本信息并生成基础报告。完成后您可以选择继续深度分析。'}
              {currentPhase === AnalysisPhase.DEEP &&
                '正在进行深度分析，将为您生成详细的洞察和专业建议。这可能需要几分钟时间。'}
              {currentPhase === AnalysisPhase.COMPLETED &&
                '分析已完成！您可以查看详细的分析结果，包括具体的建议和行动计划。'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// 简化版本，用于空间有限的场景
export function CompactPhaseIndicator({ currentPhase, className }: PhaseIndicatorProps) {
  const activePhaseIndex = PHASES.findIndex(p => p.phase === currentPhase);

  return (
    <div className={cn('flex items-center space-x-4', className)}>
      {PHASES.map((phaseConfig, index) => {
        const isActive = index === activePhaseIndex;
        const isCompleted = index < activePhaseIndex;
        const Icon = phaseConfig.icon;

        return (
          <div key={phaseConfig.phase} className="flex items-center">
            <div className="flex items-center">
              <div className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center transition-colors',
                isActive && 'bg-blue-500 text-white',
                isCompleted && 'bg-green-100 text-green-600',
                !isActive && !isCompleted && 'bg-gray-100 text-gray-400'
              )}>
                <Icon className="w-4 h-4" />
              </div>
              <span className={cn(
                'ml-2 text-sm font-medium',
                isActive && 'text-blue-600',
                isCompleted && 'text-green-600',
                !isActive && !isCompleted && 'text-gray-400'
              )}>
                {phaseConfig.name}
              </span>
            </div>

            {/* 连接线 */}
            {index < PHASES.length - 1 && (
              <div className={cn(
                'w-8 h-0.5 mx-2',
                isCompleted ? 'bg-green-400' : 'bg-gray-200'
              )} />
            )}
          </div>
        );
      })}
    </div>
  );
}