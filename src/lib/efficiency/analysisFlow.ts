import { storage } from '@/lib/utils';

// 分析阶段枚举
export enum AnalysisPhase {
  INITIAL = 'initial',      // 初始状态
  PRELIMINARY = 'preliminary', // 初步分析阶段
  DEEP = 'deep',           // 深度分析阶段
  COMPLETED = 'completed'  // 完成状态
}

// 分析状态接口
export interface AnalysisState {
  id: string;
  phase: AnalysisPhase;
  progress: number; // 0-100
  preliminaryResults?: AnalysisResults;
  deepResults?: AnalysisResults;
  createdAt: string;
  updatedAt: string;
  isPaused: boolean;
  error?: string;
}

// 分析结果接口
export interface AnalysisResults {
  summary: string;
  insights: string[];
  recommendations: string[];
  scores?: {
    overall: number;
    categories: Record<string, number>;
  };
  data?: Record<string, any>;
}

// 分析配置接口
export interface AnalysisConfig {
  userId?: string;
  dataType: string;
  options: Record<string, any>;
  autoSave: boolean;
  onPhaseChange?: (phase: AnalysisPhase) => void;
  onProgress?: (progress: number) => void;
  onComplete?: (results: AnalysisResults) => void;
  onError?: (error: string) => void;
}

// 阶段配置
const PHASE_CONFIG = {
  [AnalysisPhase.PRELIMINARY]: {
    duration: 3000, // 3秒模拟快速分析
    steps: ['数据扫描', '基础分析', '生成初步报告'],
    progressWeight: 30 // 占总进度的30%
  },
  [AnalysisPhase.DEEP]: {
    duration: 8000, // 8秒模拟深度分析
    steps: ['详细数据处理', '深度模式识别', '专业建议生成', '报告完善'],
    progressWeight: 70 // 占总进度的70%
  }
};

export class AnalysisFlowManager {
  private config: AnalysisConfig;
  private currentState: AnalysisState | null = null;
  private storageKey: string;
  private progressTimer: NodeJS.Timeout | null = null;

  constructor(config: AnalysisConfig) {
    this.config = config;
    this.storageKey = `analysis-flow-${config.dataType}-${config.userId || 'anonymous'}`;
    this.loadState();
  }

  // 获取当前状态
  getCurrentState(): AnalysisState | null {
    return this.currentState;
  }

  // 开始分析
  async startAnalysis(): Promise<void> {
    if (this.currentState?.phase === AnalysisPhase.PRELIMINARY ||
        this.currentState?.phase === AnalysisPhase.DEEP) {
      throw new Error('分析已在进行中');
    }

    this.currentState = {
      id: this.generateId(),
      phase: AnalysisPhase.PRELIMINARY,
      progress: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPaused: false
    };

    this.saveState();
    this.config.onPhaseChange?.(AnalysisPhase.PRELIMINARY);

    await this.runPhase(AnalysisPhase.PRELIMINARY);
  }

  // 继续到下一阶段
  async continueToNextPhase(): Promise<void> {
    if (!this.currentState) {
      throw new Error('没有进行中的分析');
    }

    if (this.currentState.phase === AnalysisPhase.PRELIMINARY) {
      await this.runPhase(AnalysisPhase.DEEP);
    } else {
      throw new Error('无法继续到下一阶段');
    }
  }

  // 暂停分析
  pauseAnalysis(): void {
    if (!this.currentState) return;

    this.currentState.isPaused = true;
    this.currentState.updatedAt = new Date().toISOString();

    if (this.progressTimer) {
      clearTimeout(this.progressTimer);
      this.progressTimer = null;
    }

    this.saveState();
  }

  // 恢复分析
  async resumeAnalysis(): Promise<void> {
    if (!this.currentState || !this.currentState.isPaused) return;

    this.currentState.isPaused = false;
    this.currentState.updatedAt = new Date().toISOString();
    this.saveState();

    // 从当前阶段恢复
    await this.runPhase(this.currentState.phase);
  }

  // 重置分析
  resetAnalysis(): void {
    if (this.progressTimer) {
      clearTimeout(this.progressTimer);
      this.progressTimer = null;
    }

    this.currentState = null;
    storage.remove(this.storageKey);
  }

  // 返回上一阶段（仅在特定情况下允许）
  async goBackToPrevious(): Promise<void> {
    if (!this.currentState) {
      throw new Error('没有进行中的分析');
    }

    if (this.currentState.phase === AnalysisPhase.DEEP && this.currentState.preliminaryResults) {
      // 清除深度分析结果，返回到初步分析完成状态
      this.currentState.phase = AnalysisPhase.PRELIMINARY;
      this.currentState.progress = 30; // 初步分析完成的进度
      this.currentState.deepResults = undefined;
      this.currentState.updatedAt = new Date().toISOString();
      this.saveState();

      this.config.onPhaseChange?.(AnalysisPhase.PRELIMINARY);
      this.config.onProgress?.(30);
    } else {
      throw new Error('无法返回上一阶段');
    }
  }

  // 运行特定阶段
  private async runPhase(phase: AnalysisPhase): Promise<void> {
    if (!this.currentState) return;

    const config = PHASE_CONFIG[phase];
    if (!config) return;

    this.currentState.phase = phase;
    this.currentState.error = undefined;
    this.currentState.isPaused = false;
    this.currentState.updatedAt = new Date().toISOString();
    this.saveState();

    try {
      // 模拟分析进度
      await this.simulateProgress(phase, config);

      // 生成结果
      const results = await this.generateResults(phase);

      // 更新状态
      if (phase === AnalysisPhase.PRELIMINARY) {
        this.currentState.preliminaryResults = results;
        this.currentState.progress = 30;
      } else if (phase === AnalysisPhase.DEEP) {
        this.currentState.deepResults = results;
        this.currentState.phase = AnalysisPhase.COMPLETED;
        this.currentState.progress = 100;
        this.config.onComplete?.(results);
      }

      this.currentState.updatedAt = new Date().toISOString();
      this.saveState();
      this.config.onProgress?.(this.currentState.progress);

    } catch (error) {
      this.currentState.error = error instanceof Error ? error.message : String(error);
      this.currentState.isPaused = true;
      this.saveState();
      this.config.onError?.(this.currentState.error);
    }
  }

  // 模拟分析进度
  private async simulateProgress(phase: AnalysisPhase, config: any): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.currentState) {
        reject(new Error('分析状态不存在'));
        return;
      }

      const stepDuration = config.duration / config.steps.length;
      const startProgress = phase === AnalysisPhase.PRELIMINARY ? 0 : 30;
      const endProgress = phase === AnalysisPhase.PRELIMINARY ? 30 : 100;
      const progressRange = endProgress - startProgress;

      let currentStep = 0;

      const runStep = () => {
        if (this.currentState?.isPaused) {
          return; // 暂停时停止执行
        }

        if (currentStep >= config.steps.length) {
          resolve();
          return;
        }

        const stepProgress = startProgress + (progressRange * (currentStep + 1)) / config.steps.length;
        this.currentState!.progress = Math.round(stepProgress);
        this.currentState!.updatedAt = new Date().toISOString();
        this.saveState();
        this.config.onProgress?.(this.currentState!.progress);

        currentStep++;
        this.progressTimer = setTimeout(runStep, stepDuration);
      };

      runStep();
    });
  }

  // 生成分析结果
  private async generateResults(phase: AnalysisPhase): Promise<AnalysisResults> {
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 500));

    if (phase === AnalysisPhase.PRELIMINARY) {
      return {
        summary: '初步分析已完成。基于快速扫描，发现了几个关键领域需要进一步分析。',
        insights: [
          '数据结构完整，基础信息齐全',
          '识别出2-3个潜在的优势领域',
          '发现一些需要深度分析的关键指标'
        ],
        recommendations: [
          '建议进行深度分析以获得更详细的洞察',
          '重点关注已识别的关键领域'
        ],
        scores: {
          overall: 75,
          categories: {
            '完整性': 85,
            '质量': 70,
            '潜力': 75
          }
        }
      };
    } else {
      return {
        summary: '深度分析已完成。提供了全面的洞察和具体的建议方案。',
        insights: [
          '发现了5个核心竞争优势',
          '识别出3个需要改进的关键领域',
          '分析了市场趋势和匹配度',
          '评估了发展潜力和成长空间'
        ],
        recommendations: [
          '优先加强核心竞争力建设',
          '针对薄弱环节制定改进计划',
          '把握市场机会，制定发展策略',
          '建立长期跟踪和优化机制'
        ],
        scores: {
          overall: 82,
          categories: {
            '完整性': 90,
            '质量': 85,
            '潜力': 78,
            '竞争力': 80,
            '发展性': 85
          }
        },
        data: {
          detailedMetrics: {
            'technical_skills': 85,
            'soft_skills': 78,
            'experience': 82,
            'education': 88
          },
          trends: {
            'improvement_rate': '+15%',
            'market_alignment': 78,
            'growth_potential': 85
          }
        }
      };
    }
  }

  // 保存状态到本地存储
  private saveState(): void {
    if (this.config.autoSave && this.currentState) {
      storage.set(this.storageKey, this.currentState);
    }
  }

  // 从本地存储加载状态
  private loadState(): void {
    if (this.config.autoSave) {
      const savedState = storage.get<AnalysisState>(this.storageKey);
      if (savedState) {
        this.currentState = savedState;
      }
    }
  }

  // 生成唯一ID
  private generateId(): string {
    return `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // 获取阶段配置
  static getPhaseConfig(phase: AnalysisPhase): any {
    return PHASE_CONFIG[phase];
  }

  // 获取所有可用阶段
  static getAllPhases(): AnalysisPhase[] {
    return Object.values(AnalysisPhase);
  }

  // 检查阶段转换是否有效
  static isValidTransition(fromPhase: AnalysisPhase, toPhase: AnalysisPhase): boolean {
    const validTransitions: Record<AnalysisPhase, AnalysisPhase[]> = {
      [AnalysisPhase.INITIAL]: [AnalysisPhase.PRELIMINARY],
      [AnalysisPhase.PRELIMINARY]: [AnalysisPhase.DEEP, AnalysisPhase.INITIAL],
      [AnalysisPhase.DEEP]: [AnalysisPhase.COMPLETED, AnalysisPhase.PRELIMINARY],
      [AnalysisPhase.COMPLETED]: [AnalysisPhase.INITIAL]
    };

    return validTransitions[fromPhase]?.includes(toPhase) || false;
  }
}