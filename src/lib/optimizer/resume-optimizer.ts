---
created: 2025-10-26T08:00:00Z
last_updated: 2025-10-26T08:00:00Z
version: 1.0
author: Claude Code PM System
---

import {
  ParsedResume,
  OptimizedResume,
  OptimizationMode,
  BaseOptimizationConfig,
  FreshGraduateConfig,
  ExperiencedConfig,
  CareerChangeConfig,
  EnglishConfig,
  BeautifyConfig,
  OptimizeRequest,
  OptimizeResponse,
  OptimizationSuggestion,
  EvaluationReport
} from '../../types/optimizer';

import { FreshGraduateOptimizer } from './fresh-graduate-optimizer';
import { ExperiencedOptimizer } from './experienced-optimizer';
import { CareerChangeOptimizer } from './career-change-optimizer';
import { EnglishResumeGenerator } from './english-resume-generator';
import { ContentBeautifier } from './content-beautifier';
import { KeywordOptimizer } from './keyword-optimizer';
import { OptimizationEvaluator } from './optimization-evaluator';
import { ATSOptimizer } from '../ats/ats-optimizer';

/**
 * 简历优化器主引擎
 * 协调各种优化模式，提供统一的优化接口
 */
export class ResumeOptimizer {
  private freshGraduateOptimizer: FreshGraduateOptimizer;
  private experiencedOptimizer: ExperiencedOptimizer;
  private careerChangeOptimizer: CareerChangeOptimizer;
  private englishGenerator: EnglishResumeGenerator;
  private contentBeautifier: ContentBeautifier;
  private keywordOptimizer: KeywordOptimizer;
  private evaluator: OptimizationEvaluator;
  private atsOptimizer: ATSOptimizer;

  constructor() {
    this.freshGraduateOptimizer = new FreshGraduateOptimizer();
    this.experiencedOptimizer = new ExperiencedOptimizer();
    this.careerChangeOptimizer = new CareerChangeOptimizer();
    this.englishGenerator = new EnglishResumeGenerator();
    this.contentBeautifier = new ContentBeautifier();
    this.keywordOptimizer = new KeywordOptimizer();
    this.evaluator = new OptimizationEvaluator();
    this.atsOptimizer = new ATSOptimizer();
  }

  /**
   * 优化简历主入口
   */
  async optimize(request: OptimizeRequest): Promise<OptimizeResponse> {
    const startTime = Date.now();

    try {
      // 1. 获取原始简历数据
      const resume = await this.loadResume(request.resumeId);
      if (!resume) {
        return {
          success: false,
          error: '简历不存在'
        };
      }

      // 2. 根据配置选择优化策略
      const config = request.config;
      let optimizedResume: OptimizedResume;

      switch (config.mode) {
        case OptimizationMode.FRESH_GRADUATE:
          optimizedResume = await this.freshGraduateOptimizer.optimizeResume(
            resume,
            config as FreshGraduateConfig
          );
          break;

        case OptimizationMode.EXPERIENCED:
          optimizedResume = await this.experiencedOptimizer.optimizeResume(
            resume,
            config as ExperiencedConfig
          );
          break;

        case OptimizationMode.CAREER_CHANGE:
          optimizedResume = await this.careerChangeOptimizer.optimizeResume(
            resume,
            config as CareerChangeConfig
          );
          break;

        case OptimizationMode.ENGLISH:
          optimizedResume = await this.englishGenerator.generateEnglishResume(
            resume,
            config as EnglishConfig
          );
          break;

        case OptimizationMode.CONTENT_BEAUTIFY:
          optimizedResume = await this.contentBeautifier.beautifyContent(
            resume,
            config as BeautifyConfig
          );
          break;

        default:
          return {
            success: false,
            error: `不支持的优化模式: ${config.mode}`
          };
      }

      // 3. 应用通用优化
      optimizedResume = await this.applyCommonOptimizations(
        optimizedResume,
        config,
        request.jobDescription
      );

      // 4. 生成优化建议
      const suggestions = await this.generateSuggestions(
        resume,
        optimizedResume,
        config,
        request.jobDescription
      );

      // 5. 评估优化效果
      const evaluation = await this.evaluator.evaluateOptimization(
        resume,
        optimizedResume,
        request.jobDescription
      );

      // 6. 更新优化元数据
      optimizedResume.optimization = {
        ...optimizedResume.optimization,
        score: evaluation.overallScore,
        timestamp: new Date()
      };

      // 7. 保存优化结果
      await this.saveOptimizedResume(request.resumeId, optimizedResume);

      const processingTime = Date.now() - startTime;

      return {
        success: true,
        data: {
          optimizedResume,
          evaluation,
          suggestions
        },
        metadata: {
          processingTime,
          tokensUsed: this.estimateTokensUsed(resume),
          cost: this.estimateCost(resume)
        }
      };

    } catch (error) {
      console.error('优化失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '优化过程中发生未知错误',
        metadata: {
          processingTime: Date.now() - startTime
        }
      };
    }
  }

  /**
   * 实时优化建议
   */
  async getRealtimeSuggestions(request: {
    resumeId: string;
    section: string;
    content: string;
    context?: any;
  }): Promise<OptimizationSuggestion[]> {
    const resume = await this.loadResume(request.resumeId);
    if (!resume) {
      throw new Error('简历不存在');
    }

    // 根据内容类型生成实时建议
    const suggestions = await this.generateSectionSuggestions(
      request.section,
      request.content,
      resume,
      request.context
    );

    return suggestions;
  }

  /**
   * 预览优化效果
   */
  async previewOptimization(request: OptimizeRequest): Promise<{
    preview: Partial<OptimizedResume>;
    changes: Array<{
      section: string;
      type: 'addition' | 'modification' | 'reorder';
      description: string;
    }>;
    estimatedScore: number;
  }> {
    const resume = await this.loadResume(request.resumeId);
    if (!resume) {
      throw new Error('简历不存在');
    }

    // 执行轻量级优化，生成预览
    const preview = await this.generatePreview(resume, request.config);
    const changes = this.analyzeChanges(resume, preview);
    const estimatedScore = this.estimateScore(resume, request.config, request.jobDescription);

    return {
      preview,
      changes,
      estimatedScore
    };
  }

  /**
   * 批量优化
   */
  async batchOptimize(request: {
    resumeIds: string[];
    config: BaseOptimizationConfig;
    jobDescription?: any;
  }): Promise<{
    results: Array<{
      resumeId: string;
      success: boolean;
      data?: OptimizeResponse;
      error?: string;
    }>;
    summary: {
      total: number;
      successful: number;
      failed: number;
      totalTime: number;
    };
  }> {
    const startTime = Date.now();
    const results = [];

    for (const resumeId of request.resumeIds) {
      try {
        const result = await this.optimize({
          resumeId,
          config: request.config,
          jobDescription: request.jobDescription
        });
        results.push({
          resumeId,
          success: true,
          data: result
        });
      } catch (error) {
        results.push({
          resumeId,
          success: false,
          error: error instanceof Error ? error.message : '优化失败'
        });
      }
    }

    return {
      results,
      summary: {
        total: request.resumeIds.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        totalTime: Date.now() - startTime
      }
    };
  }

  /**
   * 获取优化历史
   */
  async getOptimizationHistory(resumeId: string): Promise<Array<{
    id: string;
    timestamp: Date;
    mode: OptimizationMode;
    score: number;
    improvements: string[];
  }>> {
    // 实现历史记录获取逻辑
    return [];
  }

  /**
   * 恢复到特定版本
   */
  async restoreVersion(resumeId: string, versionId: string): Promise<OptimizedResume> {
    // 实现版本恢复逻辑
    throw new Error('功能开发中');
  }

  // 私有方法

  private async loadResume(resumeId: string): Promise<ParsedResume | null> {
    // 从数据库或文件系统加载简历
    // 这里是模拟实现
    return null;
  }

  private async saveOptimizedResume(
    originalId: string,
    optimized: OptimizedResume
  ): Promise<void> {
    // 保存优化后的简历
    // 实际实现会存储到数据库
  }

  private async applyCommonOptimizations(
    resume: OptimizedResume,
    config: BaseOptimizationConfig,
    jobDescription?: any
  ): Promise<OptimizedResume> {
    let optimized = { ...resume };

    // 1. ATS优化
    if (config.language === 'en' || !config.language) {
      optimized = await this.atsOptimizer.optimizeForATS(
        optimized,
        {
          optimizeForATS: true,
          useStandardSections: true,
          avoidTablesColumns: true,
          useSimpleFormatting: true,
          includeKeywords: true,
          maxPages: 2
        },
        jobDescription
      );
    }

    // 2. 关键词优化
    if (jobDescription) {
      optimized = await this.keywordOptimizer.optimizeKeywords(
        optimized,
        jobDescription,
        {
          keywordDensity: 0.02,
          semanticVariations: true,
          longTailKeywords: false,
          skillEmphasis: 'balanced',
          experienceDepth: 'detailed',
          projectDetail: 'standard'
        }
      );
    }

    return optimized;
  }

  private async generateSuggestions(
    original: ParsedResume,
    optimized: OptimizedResume,
    config: BaseOptimizationConfig,
    jobDescription?: any
  ): Promise<OptimizationSuggestion[]> {
    const suggestions: OptimizationSuggestion[] = [];

    // 1. 根据优化模式生成特定建议
    switch (config.mode) {
      case OptimizationMode.FRESH_GRADUATE:
        suggestions.push(...this.generateFreshGraduateSuggestions(original, optimized));
        break;
      case OptimizationMode.EXPERIENCED:
        suggestions.push(...this.generateExperiencedSuggestions(original, optimized));
        break;
      case OptimizationMode.CAREER_CHANGE:
        suggestions.push(...this.generateCareerChangeSuggestions(original, optimized));
        break;
    }

    // 2. 通用建议
    suggestions.push(...this.generateGeneralSuggestions(original, optimized));

    // 3. 根据ATS评分生成建议
    if (optimized.atsScore && optimized.atsScore.issues.length > 0) {
      suggestions.push(...this.generateATSSuggestions(optimized.atsScore));
    }

    return suggestions.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  private generateFreshGraduateSuggestions(
    original: ParsedResume,
    optimized: OptimizedResume
  ): OptimizationSuggestion[] {
    return [
      {
        id: 'fg-education-highlight',
        type: 'content',
        priority: 'high',
        title: '突出教育背景',
        description: '作为应届生，教育背景是你的重要优势',
        impact: '提高HR关注度',
        actionText: '查看优化建议'
      },
      {
        id: 'fg-project-emphasis',
        type: 'content',
        priority: 'high',
        title: '强调项目经验',
        description: '详细描述项目中的职责和成果',
        impact: '展示实践能力',
        actionText: '优化项目描述'
      }
    ];
  }

  private generateExperiencedSuggestions(
    original: ParsedResume,
    optimized: OptimizedResume
  ): OptimizationSuggestion[] {
    return [
      {
        id: 'ex-achievements-quantify',
        type: 'content',
        priority: 'high',
        title: '量化工作成果',
        description: '使用具体数字展示工作成就',
        impact: '增强说服力',
        actionText: '添加量化指标'
      }
    ];
  }

  private generateCareerChangeSuggestions(
    original: ParsedResume,
    optimized: OptimizedResume
  ): OptimizationSuggestion[] {
    return [
      {
        id: 'cc-transferable-skills',
        type: 'content',
        priority: 'high',
        title: '突出可转移技能',
        description: '强调可以应用到新领域的技能',
        impact: '提高匹配度',
        actionText: '识别可转移技能'
      }
    ];
  }

  private generateGeneralSuggestions(
    original: ParsedResume,
    optimized: OptimizedResume
  ): OptimizationSuggestion[] {
    return [
      {
        id: 'gen-action-verbs',
        type: 'content',
        priority: 'medium',
        title: '使用行为动词',
        description: '用动词开头描述工作职责',
        example: {
          before: '负责项目开发',
          after: '开发了用户管理系统，提升效率30%'
        },
        impact: '使描述更有力',
        actionText: '优化动词使用'
      }
    ];
  }

  private generateATSSuggestions(atsScore: any): OptimizationSuggestion[] {
    return atsScore.issues.map((issue: any, index: number) => ({
      id: `ats-${index}`,
      type: issue.category as any,
      priority: issue.type === 'error' ? 'high' : issue.type === 'warning' ? 'medium' : 'low',
      title: issue.message,
      description: issue.suggestion,
      impact: '提高ATS通过率',
      actionText: '立即修复'
    }));
  }

  private async generateSectionSuggestions(
    section: string,
    content: string,
    resume: ParsedResume,
    context?: any
  ): Promise<OptimizationSuggestion[]> {
    const suggestions: OptimizationSuggestion[] = [];

    // 根据不同部分生成建议
    switch (section) {
      case 'summary':
        suggestions.push(...this.generateSummarySuggestions(content, context));
        break;
      case 'experience':
        suggestions.push(...this.generateExperienceSuggestions(content, context));
        break;
      case 'skills':
        suggestions.push(...this.generateSkillsSuggestions(content, context));
        break;
    }

    return suggestions;
  }

  private generateSummarySuggestions(content: string, context?: any): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = [];

    if (content.length < 50) {
      suggestions.push({
        id: 'summary-too-short',
        type: 'content',
        priority: 'high',
        title: '个人总结过短',
        description: '建议个人总结控制在50-150字之间',
        impact: '更好地展示自己',
        actionText: '扩展个人总结'
      });
    }

    return suggestions;
  }

  private generateExperienceSuggestions(content: string, context?: any): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = [];

    // 检查是否包含量化结果
    if (!/\d+[%¥$元]/.test(content)) {
      suggestions.push({
        id: 'exp-no-metrics',
        type: 'content',
        priority: 'medium',
        title: '缺少量化指标',
        description: '添加具体数字来展示工作成果',
        impact: '增强说服力',
        actionText: '添加量化指标'
      });
    }

    return suggestions;
  }

  private generateSkillsSuggestions(content: string, context?: any): OptimizationSuggestion[] {
    return [];
  }

  private async generatePreview(
    resume: ParsedResume,
    config: BaseOptimizationConfig
  ): Promise<Partial<OptimizedResume>> {
    // 生成轻量级预览
    return {
      ...resume,
      optimization: {
        mode: config.mode,
        appliedStrategies: ['preview'],
        score: 0,
        improvements: [],
        timestamp: new Date(),
        config
      }
    };
  }

  private analyzeChanges(
    original: ParsedResume,
    optimized: Partial<OptimizedResume>
  ): Array<{ section: string; type: string; description: string }> {
    // 分析变更
    return [];
  }

  private estimateScore(
    resume: ParsedResume,
    config: BaseOptimizationConfig,
    jobDescription?: any
  ): number {
    // 估算优化分数
    return 75;
  }

  private estimateTokensUsed(resume: ParsedResume): number {
    // 估算使用的token数量
    const text = JSON.stringify(resume);
    return Math.ceil(text.length / 4);
  }

  private estimateCost(resume: ParsedResume): number {
    // 估算成本
    const tokens = this.estimateTokensUsed(resume);
    return tokens * 0.0001; // 假设每个token $0.0001
  }
}