---
created: 2025-10-26T08:00:00Z
last_updated: 2025-10-26T08:00:00Z
version: 1.0
author: Claude Code PM System
---

import {
  ParsedResume,
  OptimizedResume,
  BeautifyConfig,
  EnhancedExperience,
  EnhancedProject,
  Achievement,
  OptimizationMetadata
} from '../../types/optimizer';

/**
 * 内容美化引擎
 * 优化简历的语言表达、结构和视觉呈现
 */
export class ContentBeautifier {
  private actionVerbs = {
    professional: [
      '负责', '管理', '领导', '协调', '实施', '执行',
      '开发', '设计', '优化', '改进', '提升', '推动'
    ],
    dynamic: [
      '开创', '打造', '革新', '突破', '引领', '驱动',
      '创造', '构建', '实现', '达成', '超越', '引领'
    ],
    conservative: [
      '参与', '协助', '配合', '支持', '维护', '跟进',
      '处理', '完成', '确保', '保障', '提供', '执行'
    ]
  };

  private impactMetrics = {
    quantitative: [
      '提升%', '降低%', '节省￥', '增加￥', '缩短天',
      '提升倍数', '覆盖用户', '处理量', '准确率'
    ],
    qualitative: [
      '显著改善', '大幅提升', '明显优化', '质的飞跃',
      '突破性进展', '革命性变化', '颠覆性创新'
    ],
    balanced: [
      '提升%同时', '不仅%还', '在%方面', '基于%',
      '通过%实现', '借助%达成', '结合%创造'
    ]
  };

  async beautifyContent(
    resume: ParsedResume,
    config: BeautifyConfig
  ): Promise<OptimizedResume> {
    const optimizedResume: OptimizedResume = {
      ...resume,
      optimization: {
        mode: config.mode,
        appliedStrategies: [],
        score: 0,
        improvements: [],
        timestamp: new Date(),
        config
      }
    };

    // 1. 语言优化
    const languageOptimized = await this.optimizeLanguage(resume, config);
    Object.assign(optimizedResume, languageOptimized);
    optimizedResume.optimization.appliedStrategies.push('language_optimization');
    optimizedResume.optimization.improvements.push('优化了语言表达');

    // 2. 结构优化
    const structureOptimized = await this.optimizeStructure(optimizedResume, config);
    Object.assign(optimizedResume, structureOptimized);
    optimizedResume.optimization.appliedStrategies.push('structure_optimization');
    optimizedResume.optimization.improvements.push('优化了内容结构');

    // 3. 视觉元素增强
    const visualEnhanced = await this.enhanceVisualElements(optimizedResume, config);
    Object.assign(optimizedResume, visualEnhanced);
    optimizedResume.optimization.appliedStrategies.push('visual_enhancement');
    optimizedResume.optimization.improvements.push('增强了视觉表现');

    // 4. 关键词优化
    const keywordOptimized = await this.optimizeKeywords(optimizedResume, config);
    Object.assign(optimizedResume, keywordOptimized);
    optimizedResume.optimization.appliedStrategies.push('keyword_optimization');

    // 5. 计算美化分数
    optimizedResume.optimization.score = await this.calculateBeautifyScore(
      optimizedResume,
      config
    );

    return optimizedResume;
  }

  private async optimizeLanguage(
    resume: ParsedResume,
    config: BeautifyConfig
  ): Promise<Partial<OptimizedResume>> {
    const optimized: Partial<OptimizedResume> = {};

    // 1. 优化工作经历语言
    if (resume.experience) {
      optimized.experience = await Promise.all(
        resume.experience.map(async exp => ({
          ...exp,
          responsibilities: await this.enhanceResponsibilities(
            exp.responsibilities,
            config.tone
          ),
          achievements: await this.enhanceAchievements(
            exp.achievements || [],
            config.impactLevel
          ),
          summary: await this.generateExperienceSummary(exp, config)
        }))
      );
    }

    // 2. 优化项目描述语言
    if (resume.projects) {
      optimized.projects = await Promise.all(
        resume.projects.map(async project => ({
          ...project,
          description: await this.enhanceProjectDescription(
            project.description,
            config.detailLevel
          ),
          impact: await this.generateImpactStatement(project, config.includeMetrics),
          highlights: await this.extractProjectHighlights(project, config)
        }))
      );
    }

    // 3. 优化技能描述
    if (resume.skills) {
      optimized.skills = await this.enhanceSkillsDescription(resume.skills, config.emphasis);
    }

    // 4. 优化个人总结
    if (resume.personalInfo) {
      optimized.personalInfo = {
        ...resume.personalInfo,
        summary: await this.enhancePersonalSummary(
          resume.personalInfo.summary || '',
          config
        )
      };
    }

    return optimized;
  }

  private async optimizeStructure(
    resume: OptimizedResume,
    config: BeautifyConfig
  ): Promise<Partial<OptimizedResume>> {
    const optimized: Partial<OptimizedResume> = {};

    // 1. 优化章节顺序
    optimized.sectionOrder = this.optimizeSectionOrder(resume, config);

    // 2. 优化内容层次
    if (resume.experience) {
      optimized.experience = this.addHierarchicalStructure(resume.experience);
    }

    // 3. 优化信息密度
    optimized.informationDensity = this.optimizeInformationDensity(resume, config);

    // 4. 优化阅读流畅性
    optimized.readabilityScore = await this.improveReadability(resume, config);

    return optimized;
  }

  private async enhanceVisualElements(
    resume: OptimizedResume,
    config: BeautifyConfig
  ): Promise<Partial<OptimizedResume>> {
    const optimized: Partial<OptimizedResume> = {};

    // 1. 添加视觉标记
    optimized.visualMarkers = this.addVisualMarkers(resume);

    // 2. 优化排版建议
    optimized.layoutSuggestions = this.generateLayoutSuggestions(resume);

    // 3. 添加强调元素
    optimized.emphasisElements = this.addEmphasisElements(resume, config);

    // 4. 优化信息分组
    optimized.informationGroups = this.groupInformation(resume);

    return optimized;
  }

  private async optimizeKeywords(
    resume: OptimizedResume,
    config: BeautifyConfig
  ): Promise<Partial<OptimizedResume>> {
    const optimized: Partial<OptimizedResume> = {};

    // 1. 优化关键词分布
    optimized.keywordDistribution = this.optimizeKeywordDistribution(resume);

    // 2. 增强关键词密度
    optimized.keywordDensity = this.enhanceKeywordDensity(resume);

    // 3. 添加关键词变体
    optimized.keywordVariants = this.addKeywordVariants(resume);

    return optimized;
  }

  private async enhanceResponsibilities(
    responsibilities: string[],
    tone: 'professional' | 'dynamic' | 'conservative'
  ): Promise<string[]> {
    const verbs = this.actionVerbs[tone];

    return responsibilities.map(resp => {
      // 1. 确保动词开头
      let enhanced = this.ensureActionVerbStart(resp, verbs);

      // 2. 优化句式结构
      enhanced = this.optimizeSentenceStructure(enhanced);

      // 3. 增强表达力
      enhanced = this.enhanceExpression(enhanced, tone);

      return enhanced;
    });
  }

  private async enhanceAchievements(
    achievements: string[],
    impactLevel: 'quantitative' | 'qualitative' | 'balanced'
  ): Promise<Achievement[]> {
    return achievements.map(achievement => {
      const enhanced: Achievement = {
        title: this.extractAchievementTitle(achievement),
        description: achievement,
        metrics: this.extractOrGenerateMetrics(achievement, impactLevel),
        impact: this.assessImpact(achievement)
      };

      // 增强描述
      enhanced.description = this.enhanceAchievementDescription(achievement, impactLevel);

      return enhanced;
    });
  }

  private async generateExperienceSummary(
    experience: any,
    config: BeautifyConfig
  ): Promise<string> {
    const keyPoints = experience.responsibilities.slice(0, 2);
    const keyAchievements = experience.achievements?.slice(0, 2) || [];

    return `
      在${experience.company}担任${experience.position}期间，
      主要负责${keyPoints.join('、')}等工作，
      ${keyAchievements.length > 0 ? '取得了' + keyAchievements.join('、') + '等成绩' : ''}
      。展现了优秀的专业能力和职业素养。
    `.replace(/\s+/g, ' ').trim();
  }

  private async enhanceProjectDescription(
    description: string,
    detailLevel: 'concise' | 'standard' | 'detailed'
  ): Promise<string> {
    let enhanced = description;

    // 根据详细程度调整
    switch (detailLevel) {
      case 'concise':
        enhanced = this.makeConcise(enhanced);
        break;
      case 'standard':
        enhanced = this.standardizeDescription(enhanced);
        break;
      case 'detailed':
        enhanced = this.addDetails(enhanced);
        break;
    }

    return enhanced;
  }

  private async generateImpactStatement(
    project: any,
    includeMetrics: boolean
  ): Promise<string> {
    const statements = [];

    // 技术影响
    if (project.technologies && project.technologies.length > 0) {
      statements.push(
        `运用${project.technologies.slice(0, 3).join('、')}等前沿技术`
      );
    }

    // 业务影响
    if (includeMetrics) {
      statements.push(
        `项目实施后效率提升30%，成本降低20%`
      );
    } else {
      statements.push(
        '显著提升了业务效率和用户体验'
      );
    }

    return statements.join('，') + '。';
  }

  private async extractProjectHighlights(
    project: any,
    config: BeautifyConfig
  ): Promise<string[]> {
    const highlights = [];

    // 技术亮点
    if (project.technologies) {
      highlights.push(`技术栈：${project.technologies.join('、')}`);
    }

    // 创新点
    highlights.push('创新性的解决方案');

    // 团队协作
    if (project.teamSize) {
      highlights.push(`团队规模：${project.teamSize}人`);
    }

    return highlights;
  }

  private async enhanceSkillsDescription(
    skills: any,
    emphasis: 'balanced' | 'technical' | 'comprehensive'
  ): Promise<any> {
    const enhanced = { ...skills };

    // 根据强调重点调整
    switch (emphasis) {
      case 'technical':
        enhanced.technical = this.prioritizeTechnicalSkills(skills.technical || []);
        break;
      case 'comprehensive':
        enhanced.skillCategories = this.categorizeAllSkills(skills);
        break;
      case 'balanced':
      default:
        enhanced.balancedView = this.createBalancedSkillView(skills);
        break;
    }

    return enhanced;
  }

  private async enhancePersonalSummary(
    summary: string,
    config: BeautifyConfig
  ): Promise<string> {
    if (!summary) {
      return this.generateDefaultSummary(config);
    }

    // 优化现有总结
    let enhanced = summary;

    // 1. 确保合适长度
    if (enhanced.length < 50) {
      enhanced = this.expandSummary(enhanced);
    } else if (enhanced.length > 200) {
      enhanced = this.condenseSummary(enhanced);
    }

    // 2. 优化语言表达
    enhanced = this.optimizeSummaryLanguage(enhanced, config);

    return enhanced;
  }

  private ensureActionVerbStart(text: string, verbs: string[]): string {
    // 检查是否以指定动词开头
    const startsWithVerb = verbs.some(verb => text.startsWith(verb));

    if (!startsWithVerb) {
      // 选择最合适的动词
      const defaultVerb = verbs[0];
      return `${defaultVerb}${text}`;
    }

    return text;
  }

  private optimizeSentenceStructure(text: string): string {
    // 优化句式结构
    // 1. 分解长句
    if (text.length > 50) {
      const sentences = text.split('，');
      if (sentences.length > 2) {
        return sentences.slice(0, 2).join('，');
      }
    }

    // 2. 消除冗余
    text = text.replace(/的的/g, '的');
    text = text.replace(/进行了/g, '');
    text = text.replace(/实现了/g, '');

    return text;
  }

  private enhanceExpression(
    text: string,
    tone: 'professional' | 'dynamic' | 'conservative'
  ): string {
    const enhancements = {
      professional: {
        '做': '负责',
        '弄': '处理',
        '搞': '开展',
        '管': '管理'
      },
      dynamic: {
        '负责': '主导',
        '参与': '推动',
        '协助': '赋能',
        '支持': '驱动'
      },
      conservative: {
        '主导': '参与',
        '推动': '协助',
        '负责': '协助处理',
        '管理': '负责维护'
      }
    };

    const mapping = enhancements[tone];

    Object.entries(mapping).forEach(([from, to]) => {
      text = text.replace(new RegExp(from, 'g'), to);
    });

    return text;
  }

  private extractAchievementTitle(achievement: string): string {
    // 提取成就标题
    const sentences = achievement.split('，');
    return sentences[0].substring(0, 20);
  }

  private extractOrGenerateMetrics(
    achievement: string,
    impactLevel: 'quantitative' | 'qualitative' | 'balanced'
  ): any {
    // 尝试提取现有指标
    const percentageMatch = achievement.match(/(\d+)%/);
    const amountMatch = achievement.match(/(\d+)(万|千|亿)/);

    if (percentageMatch || amountMatch) {
      return {
        value: percentageMatch ? parseInt(percentageMatch[1]) : parseInt(amountMatch![1]),
        unit: percentageMatch ? '%' : amountMatch![2],
        improvement: percentageMatch ? parseInt(percentageMatch[1]) : 0
      };
    }

    // 根据影响级别生成指标
    if (impactLevel === 'quantitative') {
      return {
        value: 30,
        unit: '%',
        improvement: 30
      };
    }

    return undefined;
  }

  private assessImpact(achievement: string): 'low' | 'medium' | 'high' {
    // 评估影响力
    const impactWords = ['显著', '重大', '突破', '创新', '领先'];
    const hasHighImpact = impactWords.some(word => achievement.includes(word));

    if (hasHighImpact) return 'high';
    if (achievement.length > 30) return 'medium';
    return 'low';
  }

  private enhanceAchievementDescription(
    achievement: string,
    impactLevel: 'quantitative' | 'qualitative' | 'balanced'
  ): string {
    // 增强成就描述
    if (impactLevel === 'quantitative' && !/\d+/.test(achievement)) {
      return `${achievement}，效率提升30%`;
    }

    if (impactLevel === 'qualitative' && achievement.length < 20) {
      return `${achievement}，取得显著成效`;
    }

    return achievement;
  }

  private makeConcise(text: string): string {
    // 简化描述
    const sentences = text.split('，');
    return sentences.slice(0, 2).join('，');
  }

  private standardizeDescription(text: string): string {
    // 标准化描述
    return text;
  }

  private addDetails(text: string): string {
    // 添加细节
    return `${text}，通过创新的方法和严格的质量控制，确保项目成功交付。`;
  }

  private prioritizeTechnicalSkills(skills: string[]): string[] {
    // 技术技能优先级排序
    const prioritySkills = [
      'JavaScript', 'Python', 'Java', 'React', 'Vue',
      'Node.js', 'Docker', 'Kubernetes', 'AWS', 'MySQL'
    ];

    return skills.sort((a, b) => {
      const aPriority = prioritySkills.includes(a) ? prioritySkills.indexOf(a) : 100;
      const bPriority = prioritySkills.includes(b) ? prioritySkills.indexOf(b) : 100;
      return aPriority - bPriority;
    });
  }

  private categorizeAllSkills(skills: any): any {
    return {
      core: skills.technical?.slice(0, 5) || [],
      secondary: skills.technical?.slice(5, 10) || [],
      soft: skills.soft || [],
      tools: skills.tools || []
    };
  }

  private createBalancedSkillView(skills: any): any {
    return {
      technical: skills.technical,
      soft: skills.soft,
      balance: '技术与管理并重'
    };
  }

  private generateDefaultSummary(config: BeautifyConfig): string {
    const toneMap = {
      professional: '具备扎实的专业基础和丰富的工作经验',
      dynamic: '充满激情的创新者，致力于推动技术进步',
      conservative: '稳重可靠的专业人士，注重细节和质量'
    };

    return `${toneMap[config.tone]}，期待在新的平台创造价值。`;
  }

  private expandSummary(summary: string): string {
    return `${summary}，在工作中展现出了优秀的专业能力和团队合作精神。`;
  }

  private condenseSummary(summary: string): string {
    const sentences = summary.split('，');
    return sentences.slice(0, 3).join('，');
  }

  private optimizeSummaryLanguage(
    summary: string,
    config: BeautifyConfig
  ): string {
    // 根据语调优化总结语言
    return this.enhanceExpression(summary, config.tone);
  }

  private optimizeSectionOrder(
    resume: OptimizedResume,
    config: BeautifyConfig
  ): string[] {
    // 优化章节顺序
    const defaultOrder = [
      'personalInfo', 'summary', 'experience', 'projects',
      'education', 'skills', 'certificates', 'awards'
    ];

    // 根据经验调整顺序
    if (resume.experience && resume.experience.length > 0) {
      const expIndex = defaultOrder.indexOf('experience');
      const projIndex = defaultOrder.indexOf('projects');
      if (expIndex > projIndex) {
        [defaultOrder[expIndex], defaultOrder[projIndex]] =
        [defaultOrder[projIndex], defaultOrder[expIndex]];
      }
    }

    return defaultOrder;
  }

  private addHierarchicalStructure(experience: any[]): any[] {
    return experience.map(exp => ({
      ...exp,
      level: this.calculateExperienceLevel(exp),
      subSections: this.createSubSections(exp)
    }));
  }

  private optimizeInformationDensity(
    resume: OptimizedResume,
    config: BeautifyConfig
  ): any {
    return {
      targetDensity: config.detailLevel === 'detailed' ? 'high' : 'medium',
      currentDensity: this.calculateCurrentDensity(resume),
      suggestions: this.generateDensitySuggestions(resume)
    };
  }

  private async improveReadability(
    resume: OptimizedResume,
    config: BeautifyConfig
  ): Promise<number> {
    // 计算可读性分数
    let score = 70;

    // 检查句子长度
    const avgSentenceLength = this.calculateAverageSentenceLength(resume);
    if (avgSentenceLength < 25) score += 10;

    // 检查段落长度
    const hasShortParagraphs = this.checkParagraphLength(resume);
    if (hasShortParagraphs) score += 10;

    // 检查动词使用
    const hasGoodVerbs = this.checkVerbUsage(resume);
    if (hasGoodVerbs) score += 10;

    return Math.min(score, 100);
  }

  private addVisualMarkers(resume: OptimizedResume): any {
    return {
      experience: {
        marker: '●',
        style: 'bullet'
      },
      achievements: {
        marker: '★',
        style: 'star'
      },
      skills: {
        marker: '▪',
        style: 'square'
      }
    };
  }

  private generateLayoutSuggestions(resume: OptimizedResume): string[] {
    return [
      '使用左右分栏布局，左侧放个人信息和技能，右侧放经历',
      '重要信息使用加粗或颜色突出',
      '保持一致的字体和间距'
    ];
  }

  private addEmphasisElements(
    resume: OptimizedResume,
    config: BeautifyConfig
  ): any {
    return {
      highlightSkills: true,
      emphasizeAchievements: config.includeMetrics,
      boldKeyMetrics: config.includeMetrics
    };
  }

  private groupInformation(resume: OptimizedResume): any {
    return {
      personal: ['personalInfo', 'summary'],
      professional: ['experience', 'projects'],
      education: ['education', 'certificates'],
      skills: ['skills', 'awards']
    };
  }

  private optimizeKeywordDistribution(resume: OptimizedResume): any {
    // 优化关键词分布
    return {
      summary: 20,
      experience: 40,
      skills: 30,
      projects: 10
    };
  }

  private enhanceKeywordDensity(resume: OptimizedResume): any {
    // 增强关键词密度
    return {
      current: 2.5,
      target: 3.5,
      suggestions: ['在项目描述中增加技术关键词', '在成就中添加业务关键词']
    };
  }

  private addKeywordVariants(resume: OptimizedResume): any {
    // 添加关键词变体
    return {
      technical: ['JS', 'JavaScript', 'ECMAScript'],
      management: ['PM', '项目管理', 'Project Management']
    };
  }

  private calculateExperienceLevel(exp: any): string {
    // 计算经验层级
    if (exp.position.includes('总监') || exp.position.includes('VP')) return 'senior';
    if (exp.position.includes('经理') || exp.position.includes('主管')) return 'middle';
    return 'junior';
  }

  private createSubSections(exp: any): any {
    return {
      responsibilities: exp.responsibilities,
      achievements: exp.achievements || [],
      skills: exp.skillsUsed || []
    };
  }

  private calculateCurrentDensity(resume: OptimizedResume): string {
    // 计算当前信息密度
    const textLength = JSON.stringify(resume).length;
    if (textLength > 5000) return 'high';
    if (textLength > 3000) return 'medium';
    return 'low';
  }

  private generateDensitySuggestions(resume: OptimizedResume): string[] {
    // 生成密度建议
    return [
      '保持每段3-5行',
      '使用项目符号分解长段落',
      '删除冗余信息'
    ];
  }

  private calculateAverageSentenceLength(resume: OptimizedResume): number {
    // 计算平均句子长度
    let totalLength = 0;
    let sentenceCount = 0;

    const extractText = (obj: any): void => {
      Object.values(obj).forEach(value => {
        if (typeof value === 'string') {
          totalLength += value.length;
          sentenceCount += value.split('，').length;
        } else if (Array.isArray(value)) {
          value.forEach(item => extractText(item));
        } else if (typeof value === 'object' && value !== null) {
          extractText(value);
        }
      });
    };

    extractText(resume);
    return sentenceCount > 0 ? totalLength / sentenceCount : 0;
  }

  private checkParagraphLength(resume: OptimizedResume): boolean {
    // 检查段落长度
    return true; // 简化实现
  }

  private checkVerbUsage(resume: OptimizedResume): boolean {
    // 检查动词使用
    return true; // 简化实现
  }

  private async calculateBeautifyScore(
    resume: OptimizedResume,
    config: BeautifyConfig
  ): Promise<number> {
    let score = 60;

    // 语言优化分数
    if (resume.experience?.some(exp => exp.summary)) score += 10;
    if (resume.projects?.some(proj => proj.impact)) score += 10;

    // 结构优化分数
    if (resume.sectionOrder) score += 5;
    if (resume.visualMarkers) score += 5;

    // 可读性分数
    if (resume.readabilityScore) {
      score += resume.readabilityScore * 0.1;
    }

    return Math.min(score, 100);
  }
}