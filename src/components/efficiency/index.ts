// 主要组件
export { default as TwoPhaseAnalysis } from './TwoPhaseAnalysis';

// 子组件
export { PhaseIndicator, CompactPhaseIndicator } from './PhaseIndicator';
export { AnalysisProgress, ProgressStatus } from './AnalysisProgress';
export { ResultDisplay, ResultOverview } from './ResultDisplay';

// 类型导出
export type {
  AnalysisState,
  AnalysisResults,
  AnalysisConfig
} from '@/lib/efficiency/analysisFlow';

export {
  AnalysisPhase,
  AnalysisFlowManager
} from '@/lib/efficiency/analysisFlow';