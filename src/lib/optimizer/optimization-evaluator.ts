---
created: 2025-10-26T08:00:00Z
last_updated: 2025-10-26T08:00:00Z
version: 1.0
author: Claude Code PM System
---

import {
  ParsedResume,
  OptimizedResume,
  JobDescription,
  EvaluationReport,
  ContentQualityScore,
  KeywordMatchScore,
  ReadabilityScore,
  ProfessionalismScore,
  ComparisonReport
} from '../../types/optimizer';
import { ATSKeywordMatcher } from '../ats/ats-keyword-matcher';

/**
 * 优化效果评估器
 * 评估简历优化效果，生成详细的评估报告
 */
export class OptimizationEvaluator {
  private keywordMatcher: ATSKeywordMatcher;

  constructor() {
    this.keywordMatcher = new ATSKeywordMatcher();
  }

  async evaluateOptimization(
    originalResume: ParsedResume,
    optimizedResume: OptimizedResume,
    targetJob?: JobDescription
  ): Promise<EvaluationReport> {
    // 1. 内容质量评估
    const contentQuality = await this.assessContentQuality(optimizedResume);

    // 2. 关键词匹配度评估
    const keywordMatch = await this.assessKeywordMatching(optimizedResume, targetJob);

    // 3. 可读性评估
    const readability = await this.assessReadability(optimizedResume);

    // 4. 专业性评估
    const professionalism = await this.assessProfessionalism(optimizedResume);

    // 5. 对比分析
    const comparison = await this.compareWithOriginal(originalResume, optimizedResume);

    // 6. 综合评分
    const overallScore = this.calculateOverallScore({
      contentQuality,
      keywordMatch,
      readability,
      professionalism
    });

    // 7. 生成建议
    const recommendations = await this.generateRecommendations(optimizedResume, targetJob);

    // 8. 识别改进领域
    const improvementAreas = this.identifyImprovementAreas(comparison);

    return {
      overallScore,
      dimensions: {
        contentQuality,
        keywordMatch,
        readability,
        professionalism
      },
      comparison,
      recommendations,
      improvementAreas
    };
  }

  private async assessContentQuality(resume: OptimizedResume): Promise<ContentQualityScore> {
    const metrics = {
      completeness: await this.assessCompleteness(resume),
      clarity: await this.assessClarity(resume),
      impact: await this.assessImpact(resume),
      relevance: await this.assessRelevance(resume),
      structure: await this.assessStructure(resume)
    };

    const score = Object.values(metrics).reduce((sum, score) => sum + score, 0) / Object.keys(metrics).length;

    return {
      score: Math.round(score),
      metrics,
      strengths: this.identifyStrengths(metrics),
      weaknesses: this.identifyWeaknesses(metrics)
    };
  }

  private async assessKeywordMatching(
    resume: OptimizedResume,
    targetJob?: JobDescription
  ): Promise<KeywordMatchScore> {
    if (!targetJob) {
      return {
        score: 50,
        details: {
          exact: 50,
          semantic: 50,
          contextual: 50
        },
        missingKeywords: [],
        overrepresentedKeywords: []
      };
    }

    // 提取职位关键词
    const jobKeywords = await this.keywordMatcher.extractKeywordsFromJob(targetJob);
    const resumeKeywords = await this.keywordMatcher.extractResumeKeywords(resume);

    // 计算匹配度
    const matching = {
      exact: this.calculateExactMatch(jobKeywords, resumeKeywords),
      semantic: await this.calculateSemanticMatch(jobKeywords, resumeKeywords),
      contextual: await this.calculateContextualMatch(jobKeywords, resumeKeywords)
    };

    const score = Math.round((matching.exact + matching.semantic + matching.contextual) / 3);

    return {
      score,
      details: matching,
      missingKeywords: this.findMissingKeywords(jobKeywords, resumeKeywords),
      overrepresentedKeywords: this.findOverrepresentedKeywords(jobKeywords, resumeKeywords)
    };
  }

  private async assessReadability(resume: OptimizedResume): Promise<ReadabilityScore> {
    const text = this.extractText(resume);
    const metrics = {
      averageSentenceLength: this.calculateAverageSentenceLength(text),
      averageWordLength: this.calculateAverageWordLength(text),
      readabilityIndex: this.calculateReadabilityIndex(text),
      complexity: this.assessComplexity(text)
    };

    let score = 100;

    // 根据指标调整分数
    if (metrics.averageSentenceLength > 25) score -= 20;
    if (metrics.averageWordLength > 6) score -= 10;
    if (metrics.readabilityIndex < 30) score -= 30;
    if (metrics.complexity > 0.7) score -= 20;

    const improvements = this.generateReadabilityImprovements(metrics);

    return {
      score: Math.max(0, score),
      metrics,
      improvements
    };
  }

  private async assessProfessionalism(resume: OptimizedResume): Promise<ProfessionalismScore> {
    const metrics = {
      tone: await this.assessTone(resume),
      grammar: await this.assessGrammar(resume),
      formatting: await this.assessFormatting(resume),
      completeness: await this.assessCompleteness(resume)
    };

    const score = Math.round(
      (metrics.tone + metrics.grammar + metrics.formatting + metrics.completeness) / 4
    );

    return {
      score,
      metrics,
      feedback: this.generateProfessionalFeedback(metrics)
    };
  }

  private async compareWithOriginal(
    original: ParsedResume,
    optimized: OptimizedResume
  ): Promise<ComparisonReport> {
    return {
      contentChanges: this.analyzeContentChanges(original, optimized),
      structuralChanges: this.analyzeStructuralChanges(original, optimized),
      linguisticImprovements: await this.analyzeLinguisticImprovements(original, optimized),
      keywordEnhancements: this.analyzeKeywordEnhancements(original, optimized),
      readabilityImprovement: await this.calculateReadabilityImprovement(original, optimized)
    };
  }

  private calculateOverallScore(dimensions: {
    contentQuality: ContentQualityScore;
    keywordMatch: KeywordMatchScore;
    readability: ReadabilityScore;
    professionalism: ProfessionalismScore;
  }): number {
    // 加权计算总分
    const weights = {
      contentQuality: 0.3,
      keywordMatch: 0.3,
      readability: 0.2,
      professionalism: 0.2
    };

    const weightedScore = Object.entries(weights).reduce((sum, [key, weight]) => {
      return sum + dimensions[key as keyof typeof dimensions].score * weight;
    }, 0);

    return Math.round(weightedScore);
  }

  private async assessCompleteness(resume: OptimizedResume): Promise<number> {
    let score = 0;
    const requiredSections = ['personalInfo', 'experience', 'education', 'skills'];

    // 检查必需章节
    requiredSections.forEach(section => {
      if (resume[section as keyof OptimizedResume]) {
        score += 25;
      }
    });

    // 检查详细信息
    if (resume.personalInfo?.summary) score += 10;
    if (resume.experience?.length > 0 && resume.experience[0].achievements?.length > 0) score += 10;
    if (resume.skills?.technical?.length > 5) score += 10;

    return Math.min(score, 100);
  }

  private async assessClarity(resume: OptimizedResume): Promise<number> {
    const text = this.extractText(resume);
    let score = 100;

    // 检查模糊表达
    const vaguePhrases = ['相关', '等', '等等', '左右', '大概', '可能'];
    vaguePhrases.forEach(phrase => {
      const count = (text.match(new RegExp(phrase, 'g')) || []).length;
      score -= count * 5;
    });

    // 检查长句
    const sentences = text.split(/[。！？]/);
    const longSentences = sentences.filter(s => s.length > 50).length;
    score -= longSentences * 10;

    return Math.max(0, score);
  }

  private async assessImpact(resume: OptimizedResume): Promise<number> {
    let score = 0;
    const totalPoints = 100;

    // 检查量化表达
    const text = this.extractText(resume);
    const quantified = (text.match(/\d+[%￥万亿]/g) || []).length;
    score += Math.min(quantified * 10, 40);

    // 检查成就动词
    const impactVerbs = ['提升', '降低', '增加', '减少', '优化', '改进', '创造'];
    const verbCount = impactVerbs.reduce((count, verb) => {
      return count + (text.match(new RegExp(verb, 'g')) || []).length;
    }, 0);
    score += Math.min(verbCount * 15, 40);

    // 检查成果描述
    if (resume.experience?.some(exp => exp.achievements && exp.achievements.length > 0)) {
      score += 20;
    }

    return Math.min(score, totalPoints);
  }

  private async assessRelevance(resume: OptimizedResume): Promise<number> {
    // 简化实现，实际需要根据目标职位评估
    let score = 60;

    // 检查技能相关性
    if (resume.skills?.technical && resume.skills.technical.length > 5) {
      score += 20;
    }

    // 检查经验相关性
    if (resume.experience && resume.experience.length > 0) {
      score += 20;
    }

    return Math.min(score, 100);
  }

  private async assessStructure(resume: OptimizedResume): Promise<number> {
    let score = 100;

    // 检查章节顺序
    const expectedOrder = ['personalInfo', 'summary', 'experience', 'education', 'skills'];
    const actualOrder = Object.keys(resume);

    // 简化检查
    if (actualOrder.indexOf('experience') < actualOrder.indexOf('education')) {
      score -= 10;
    }

    return score;
  }

  private calculateExactMatch(jobKeywords: any, resumeKeywords: any): number {
    // 计算精确匹配度
    const jobWords = [...jobKeywords.technical, ...jobKeywords.soft, ...jobKeywords.tools];
    const resumeWords = [
      ...(resumeKeywords.technical || []),
      ...(resumeKeywords.soft || []),
      ...(resumeKeywords.tools || [])
    ];

    const matches = jobWords.filter(word =>
      resumeWords.some(rw => rw.toLowerCase() === word.toLowerCase())
    );

    return jobWords.length > 0 ? Math.round((matches.length / jobWords.length) * 100) : 0;
  }

  private async calculateSemanticMatch(jobKeywords: any, resumeKeywords: any): Promise<number> {
    // 计算语义匹配度（简化实现）
    const jobWords = [...jobKeywords.technical, ...jobKeywords.soft];
    const resumeWords = [...(resumeKeywords.technical || []), ...(resumeKeywords.soft || [])];

    let matches = 0;
    jobWords.forEach(jobWord => {
      if (resumeWords.some(rw => this.isSemanticMatch(rw, jobWord))) {
        matches++;
      }
    });

    return jobWords.length > 0 ? Math.round((matches / jobWords.length) * 100) : 0;
  }

  private async calculateContextualMatch(jobKeywords: any, resumeKeywords: any): Promise<number> {
    // 计算上下文匹配度（简化实现）
    return 70; // 默认值
  }

  private isSemanticMatch(word1: string, word2: string): boolean {
    // 简单的语义匹配
    const synonyms = {
      'JavaScript': ['JS', 'ECMAScript'],
      'React': ['ReactJS', 'React.js'],
      'Python': ['Python3', 'Py'],
      'Node.js': ['Node', 'NodeJS']
    };

    for (const [term, syns] of Object.entries(synonyms)) {
      if ((word1 === term && syns.includes(word2)) ||
          (word2 === term && syns.includes(word1))) {
        return true;
      }
    }

    return false;
  }

  private findMissingKeywords(jobKeywords: any, resumeKeywords: any): string[] {
    const allJobKeywords = [...jobKeywords.technical, ...jobKeywords.soft, ...jobKeywords.tools];
    const allResumeKeywords = [
      ...(resumeKeywords.technical || []),
      ...(resumeKeywords.soft || []),
      ...(resumeKeywords.tools || [])
    ];

    return allJobKeywords.filter(keyword =>
      !allResumeKeywords.some(rw => rw.toLowerCase() === keyword.toLowerCase())
    );
  }

  private findOverrepresentedKeywords(jobKeywords: any, resumeKeywords: any): string[] {
    // 找出过度使用的关键词
    const overrepresented = [];
    const resumeText = allResumeKeywords.join(' ').toLowerCase();

    allResumeKeywords.forEach(keyword => {
      const count = (resumeText.match(new RegExp(keyword.toLowerCase(), 'g')) || []).length;
      if (count > 3) { // 出现超过3次
        overrepresented.push(keyword);
      }
    });

    return overrepresented;
  }

  private extractText(resume: OptimizedResume): string {
    const texts = [];

    if (resume.personalInfo?.summary) {
      texts.push(resume.personalInfo.summary);
    }

    resume.experience?.forEach(exp => {
      texts.push(...exp.responsibilities);
      if (exp.achievements) {
        texts.push(...exp.achievements);
      }
    });

    resume.projects?.forEach(project => {
      texts.push(project.description);
      if (project.responsibilities) {
        texts.push(...project.responsibilities);
      }
    });

    return texts.join(' ');
  }

  private calculateAverageSentenceLength(text: string): number {
    const sentences = text.split(/[。！？]/).filter(s => s.length > 0);
    const totalLength = sentences.reduce((sum, s) => sum + s.length, 0);
    return sentences.length > 0 ? Math.round(totalLength / sentences.length) : 0;
  }

  private calculateAverageWordLength(text: string): number {
    const words = text.split(/\s+/);
    const totalLength = words.reduce((sum, w) => sum + w.length, 0);
    return words.length > 0 ? Math.round(totalLength / words.length * 10) / 10 : 0;
  }

  private calculateReadabilityIndex(text: string): number {
    // 简化的可读性指数计算
    const avgSentenceLength = this.calculateAverageSentenceLength(text);
    const avgWordLength = this.calculateAverageWordLength(text);
    return Math.round(100 - (avgSentenceLength * 0.5 + avgWordLength * 2));
  }

  private assessComplexity(text: string): number {
    // 评估文本复杂度
    const complexWords = text.match(/[A-Z][a-z]+/g) || [];
    const totalWords = text.split(/\s+/).length;
    return totalWords > 0 ? complexWords.length / totalWords : 0;
  }

  private generateReadabilityImprovements(metrics: any): string[] {
    const improvements = [];

    if (metrics.averageSentenceLength > 25) {
      improvements.push('句子过长，建议拆分为更短的句子');
    }

    if (metrics.averageWordLength > 6) {
      improvements.push('用词过于复杂，建议使用更简单的词汇');
    }

    if (metrics.readabilityIndex < 30) {
      improvements.push('可读性较低，建议优化表达方式');
    }

    if (metrics.complexity > 0.7) {
      improvements.push('专业术语过多，建议适当简化');
    }

    return improvements;
  }

  private async assessTone(resume: OptimizedResume): Promise<number> {
    const text = this.extractText(resume);
    let score = 100;

    // 检查语调一致性
    const formalWords = ['负责', '管理', '实施', '确保'];
    const informalWords = ['搞', '弄', '做', '干'];

    const formalCount = formalWords.reduce((count, word) => {
      return count + (text.match(new RegExp(word, 'g')) || []).length;
    }, 0);

    const informalCount = informalWords.reduce((count, word) => {
      return count + (text.match(new RegExp(word, 'g')) || []).length;
    }, 0);

    if (informalCount > formalCount) {
      score -= 30;
    }

    return score;
  }

  private async assessGrammar(resume: OptimizedResume): Promise<number> {
    // 简化的语法检查
    const text = this.extractText(resume);
    let score = 100;

    // 检查常见错误
    const commonErrors = [
      /的的/g,  // 重复的"的"
      /了了/g,   // 重复的"了"
      /([^。！？])$/,  // 句子结尾缺少标点
    ];

    commonErrors.forEach(error => {
      const matches = text.match(error);
      if (matches) {
        score -= matches.length * 10;
      }
    });

    return Math.max(0, score);
  }

  private async assessFormatting(resume: OptimizedResume): Promise<number> {
    // 评估格式规范性
    let score = 100;

    // 检查日期格式一致性
    const dates = this.extractDates(resume);
    if (!this.areDatesConsistent(dates)) {
      score -= 20;
    }

    return score;
  }

  private extractDates(resume: OptimizedResume): string[] {
    const dates = [];

    resume.experience?.forEach(exp => {
      if (exp.duration) dates.push(exp.duration);
    });

    resume.education?.forEach(edu => {
      if (edu.duration) dates.push(edu.duration);
    });

    return dates;
  }

  private areDatesConsistent(dates: string[]): boolean {
    if (dates.length === 0) return true;

    const patterns = dates.map(date => {
      if (date.includes('-')) return 'YYYY-MM';
      if (date.includes('年')) return 'chinese';
      return 'other';
    });

    return new Set(patterns).size === 1;
  }

  private identifyStrengths(metrics: any): string[] {
    const strengths = [];

    Object.entries(metrics).forEach(([key, value]) => {
      if (value >= 80) {
        strengths.push(this.getMetricName(key));
      }
    });

    return strengths;
  }

  private identifyWeaknesses(metrics: any): string[] {
    const weaknesses = [];

    Object.entries(metrics).forEach(([key, value]) => {
      if (value < 60) {
        weaknesses.push(this.getMetricName(key));
      }
    });

    return weaknesses;
  }

  private getMetricName(metric: string): string {
    const names = {
      completeness: '内容完整性',
      clarity: '表达清晰度',
      impact: '影响力',
      relevance: '相关性',
      structure: '结构组织'
    };
    return names[metric as keyof typeof names] || metric;
  }

  private generateProfessionalFeedback(metrics: any): string[] {
    const feedback = [];

    if (metrics.tone < 80) {
      feedback.push('建议使用更专业的表达方式');
    }

    if (metrics.grammar < 80) {
      feedback.push('请注意语法和标点符号的正确使用');
    }

    if (metrics.formatting < 80) {
      feedback.push('建议统一格式规范');
    }

    if (metrics.completeness < 80) {
      feedback.push('建议补充更多个人信息');
    }

    return feedback;
  }

  private analyzeContentChanges(
    original: ParsedResume,
    optimized: OptimizedResume
  ): any[] {
    const changes = [];

    // 分析个人总结变化
    if (original.personalInfo?.summary !== optimized.personalInfo?.summary) {
      changes.push({
        section: '个人总结',
        type: 'modification',
        description: '优化了个人总结的表达'
      });
    }

    // 分析技能变化
    if (JSON.stringify(original.skills) !== JSON.stringify(optimized.skills)) {
      changes.push({
        section: '技能',
        type: 'enhancement',
        description: '优化了技能分类和展示'
      });
    }

    return changes;
  }

  private analyzeStructuralChanges(
    original: ParsedResume,
    optimized: OptimizedResume
  ): any[] {
    const changes = [];

    // 检查新增章节
    const originalSections = Object.keys(original);
    const optimizedSections = Object.keys(optimized);

    optimizedSections.forEach(section => {
      if (!originalSections.includes(section)) {
        changes.push({
          type: 'add',
          section,
          reason: '新增章节以增强简历完整性'
        });
      }
    });

    return changes;
  }

  private async analyzeLinguisticImprovements(
    original: ParsedResume,
    optimized: OptimizedResume
  ): Promise<string[]> {
    const improvements = [];

    // 对比语言表达
    const originalText = this.extractText(original as any);
    const optimizedText = this.extractText(optimized);

    // 检查动词使用
    const originalVerbs = this.countActionVerbs(originalText);
    const optimizedVerbs = this.countActionVerbs(optimizedText);

    if (optimizedVerbs > originalVerbs) {
      improvements.push('增加了更多行为动词，使表达更有力');
    }

    // 检查量化表达
    const originalMetrics = (originalText.match(/\d+[%￥万亿]/g) || []).length;
    const optimizedMetrics = (optimizedText.match(/\d+[%￥万亿]/g) || []).length;

    if (optimizedMetrics > originalMetrics) {
      improvements.push('增加了更多量化指标，增强说服力');
    }

    return improvements;
  }

  private analyzeKeywordEnhancements(
    original: ParsedResume,
    optimized: OptimizedResume
  ): any[] {
    const enhancements = [];

    // 分析关键词增加
    const originalKeywords = this.extractKeywords(original as any);
    const optimizedKeywords = this.extractKeywords(optimized);

    const added = optimizedKeywords.filter(k => !originalKeywords.includes(k));
    if (added.length > 0) {
      enhancements.push({
        type: 'addition',
        keywords: added.slice(0, 5),
        impact: '提升了ATS匹配度'
      });
    }

    return enhancements;
  }

  private extractKeywords(resume: any): string[] {
    const keywords = new Set<string>();

    if (resume.skills?.technical) {
      resume.skills.technical.forEach((skill: any) => {
        if (typeof skill === 'string') {
          keywords.add(skill);
        } else if (skill.name) {
          keywords.add(skill.name);
        }
      });
    }

    return Array.from(keywords);
  }

  private countActionVerbs(text: string): number {
    const actionVerbs = [
      '负责', '管理', '开发', '设计', '实现', '优化', '改进',
      '提升', '降低', '创建', '推动', '协调', '领导'
    ];

    return actionVerbs.reduce((count, verb) => {
      return count + (text.match(new RegExp(verb, 'g')) || []).length;
    }, 0);
  }

  private async calculateReadabilityImprovement(
    original: ParsedResume,
    optimized: OptimizedResume
  ): Promise<number> {
    const originalText = this.extractText(original as any);
    const optimizedText = this.extractText(optimized);

    const originalIndex = this.calculateReadabilityIndex(originalText);
    const optimizedIndex = this.calculateReadabilityIndex(optimizedText);

    return optimizedIndex - originalIndex;
  }

  private async generateRecommendations(
    resume: OptimizedResume,
    targetJob?: JobDescription
  ): Promise<string[]> {
    const recommendations = [];

    // 基于评估结果生成建议
    if (!resume.personalInfo?.summary || resume.personalInfo.summary.length < 50) {
      recommendations.push('建议扩展个人总结，更好地展示个人优势');
    }

    if (!resume.experience?.some(exp => exp.achievements && exp.achievements.length > 0)) {
      recommendations.push('建议在工作经历中添加具体的成就和成果');
    }

    if (resume.skills?.technical && resume.skills.technical.length < 5) {
      recommendations.push('建议补充更多技能展示');
    }

    if (targetJob) {
      recommendations.push('建议根据目标职位进一步优化关键词');
    }

    return recommendations;
  }

  private identifyImprovementAreas(comparison: ComparisonReport): string[] {
    const areas = [];

    // 基于对比分析识别改进领域
    if (comparison.contentChanges.length > 0) {
      areas.push('内容表达');
    }

    if (comparison.readabilityImprovement < 10) {
      areas.push('可读性优化');
    }

    if (comparison.keywordEnhancements.length === 0) {
      areas.push('关键词优化');
    }

    return areas;
  }
}