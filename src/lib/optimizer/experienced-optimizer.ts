---
created: 2025-10-26T08:00:00Z
last_updated: 2025-10-26T08:00:00Z
version: 1.0
author: Claude Code PM System
---

import {
  ParsedResume,
  OptimizedResume,
  ExperiencedConfig,
  EnhancedExperience,
  Achievement,
  OptimizationMetadata
} from '../../types/optimizer';

/**
 * 有经验人士优化器
 * 针对有工作经验的专业人士的简历优化策略
 */
export class ExperiencedOptimizer {
  private actionVerbs = {
    leadership: [
      '领导', '管理', '指导', '协调', '组织', '策划', '决策',
      '带领', '培养', '赋能', '推动', '建立', '创建', '制定'
    ],
    achievement: [
      '实现', '达成', '完成', '获得', '赢得', '创造', '提升',
      '优化', '改进', '增加', '减少', '降低', '加速', '简化'
    ],
    technical: [
      '开发', '设计', '架构', '实现', '部署', '维护', '测试',
      '优化', '重构', '集成', '迁移', '升级', '构建'
    ],
    business: [
      '分析', '评估', '研究', '识别', '发现', '解决', '改进',
      '建议', '推动', '促进', '增强', '扩展', '开拓'
    ]
  };

  private metricsTemplates = {
    revenue: ['提升了营收%', '增加了收入￥', '创造收益￥', '贡献营收%'],
    cost: ['降低成本%', '节省开支￥', '减少支出￥', '优化成本%'],
    efficiency: ['提升效率%', '节省时间小时', '减少人工%', '加快速度%'],
    quality: ['提升质量%', '减少错误%', '提高满意度', '降低投诉率%'],
    scale: ['处理量提升%', '覆盖用户数', '服务客户数', '市场份额%']
  };

  async optimizeResume(
    resume: ParsedResume,
    config: ExperiencedConfig
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

    // 1. 优化工作经历（重点突出成就）
    if (resume.experience && resume.experience.length > 0) {
      optimizedResume.experience = await this.optimizeExperience(
        resume.experience,
        config
      );
      optimizedResume.optimization.improvements.push('突出了工作成就和量化结果');
      optimizedResume.optimization.appliedStrategies.push('achievement_focus');
    }

    // 2. 优化技能展示（突出专业深度）
    if (resume.skills) {
      optimizedResume.skills = await this.optimizeSkills(
        resume.skills,
        config
      );
      optimizedResume.optimization.improvements.push('优化了专业技能展示');
      optimizedResume.optimization.appliedStrategies.push('expertise_highlight');
    }

    // 3. 优化项目经验（关联业务价值）
    if (resume.projects && resume.projects.length > 0) {
      optimizedResume.projects = await this.optimizeProjects(
        resume.projects,
        config
      );
      optimizedResume.optimization.improvements.push('强调了项目业务价值');
      optimizedResume.optimization.appliedStrategies.push('business_value');
    }

    // 4. 优化个人总结（突出职业定位）
    optimizedResume.personalInfo = await this.optimizePersonalInfo(
      resume.personalInfo || {},
      resume,
      config
    );
    optimizedResume.optimization.improvements.push('优化了职业定位展示');
      optimizedResume.optimization.appliedStrategies.push('professional_branding');

    // 5. 优化教育背景（弱化处理）
    if (resume.education && resume.education.length > 0) {
      optimizedResume.education = this.optimizeEducation(resume.education);
      optimizedResume.optimization.appliedStrategies.push('education_deemphasis');
    }

    // 6. 添加职业发展轨迹
    optimizedResume.careerProgression = this.analyzeCareerProgression(resume.experience);
    optimizedResume.optimization.appliedStrategies.push('career_trajectory');

    // 7. 计算优化分数
    optimizedResume.optimization.score = await this.calculateOptimizationScore(
      optimizedResume,
      config
    );

    return optimizedResume;
  }

  private async optimizeExperience(
    experience: any[],
    config: ExperiencedConfig
  ): Promise<EnhancedExperience[]> {
    // 按时间倒序排列（最新的在前）
    const sortedExp = experience.sort((a, b) => {
      const dateA = this.parseDate(a.endDate || '至今');
      const dateB = this.parseDate(b.endDate || '至今');
      return dateB.getTime() - dateA.getTime();
    });

    return sortedExp.map((exp, index) => {
      const enhanced: EnhancedExperience = { ...exp };

      // 1. 优化职位名称（如果有更专业的表达）
      enhanced.position = this.optimizePositionTitle(exp.position, config);

      // 2. 优化职责描述（使用动词开头，突出领导力）
      enhanced.responsibilities = this.optimizeResponsibilities(
        exp.responsibilities,
        config
      );

      // 3. 量化和突出成就
      if (config.quantifyResults) {
        enhanced.achievements = this.quantifyAchievements(
          exp.achievements || [],
          exp
        );
      }

      // 4. 生成影响力陈述
      enhanced.impact = this.generateImpactStatement(exp, config);

      // 5. 提取关键职责
      enhanced.keyResponsibilities = this.extractKeyResponsibilities(exp);

      // 6. 团队规模（如果有）
      enhanced.teamSize = this.extractTeamSize(exp);

      // 7. 预算管理（如果有）
      enhanced.budgetManaged = this.extractBudgetManaged(exp);

      return enhanced;
    });
  }

  private async optimizeSkills(
    skills: any,
    config: ExperiencedConfig
  ): Promise<any> {
    const optimized = { ...skills };

    // 1. 技能深度评估
    if (optimized.technical) {
      optimized.technical = this.assessTechnicalDepth(
        optimized.technical,
        config
      );
    }

    // 2. 突出核心专业领域
    if (optimized.technical && config.highlightExpertise) {
      optimized.coreExpertise = this.identifyCoreExpertise(
        optimized.technical,
        config.highlightExpertise
      );
    }

    // 3. 管理技能
    if (config.emphasizeLeadership) {
      optimized.managementSkills = this.extractManagementSkills(skills);
    }

    // 4. 行业专长
    optimized.industryExpertise = this.identifyIndustryExpertise(skills);

    // 5. 工具和平台熟练度
    if (optimized.tools) {
      optimized.tools = this.categorizeToolProficiency(optimized.tools);
    }

    return optimized;
  }

  private async optimizeProjects(
    projects: any[],
    config: ExperiencedConfig
  ): Promise<any[]> {
    return projects.map(project => {
      const optimized = { ...project };

      // 1. 关联业务价值
      optimized.businessValue = this.identifyBusinessValue(project);

      // 2. 突出技术挑战
      optimized.technicalChallenges = this.identifyTechnicalChallenges(project);

      // 3. 量化项目成果
      optimized.outcomes = this.quantifyProjectOutcomes(project);

      // 4. 团队协作展示
      optimized.collaboration = this.describeCollaboration(project);

      return optimized;
    });
  }

  private async optimizePersonalInfo(
    personalInfo: any,
    resume: ParsedResume,
    config: ExperiencedConfig
  ): Promise<any> {
    // 生成专业化的个人总结
    const summary = this.generateProfessionalSummary(resume, config);

    // 添加职业标签
    const professionalTags = this.generateProfessionalTags(resume, config);

    return {
      ...personalInfo,
      summary,
      professionalTags,
      yearsOfExperience: config.yearsOfExperience
    };
  }

  private optimizeEducation(education: any[]): any[] {
    // 对有经验人士，教育背景简化展示
    return education.map(edu => ({
      ...edu,
      displayMode: 'compact', // 紧凑模式
      omitDetails: true // 省略课程细节
    }));
  }

  private optimizePositionTitle(position: string, config: ExperiencedConfig): string {
    // 优化职位名称，使其更专业
    const positionMap: Record<string, string> = {
      '程序员': '软件工程师',
      '码农': '高级软件工程师',
      '前端': '前端开发工程师',
      '后端': '后端开发工程师',
      '项目经理': '高级项目经理',
      '主管': '团队主管'
    };

    return positionMap[position] || position;
  }

  private optimizeResponsibilities(
    responsibilities: string[],
    config: ExperiencedConfig
  ): string[] {
    return responsibilities.map(resp => {
      // 1. 确保动词开头
      let optimized = this.ensureActionVerbStart(resp, config);

      // 2. 突出领导力（如果配置要求）
      if (config.emphasizeLeadership) {
        optimized = this.emphasizeLeadershipAspect(optimized);
      }

      // 3. 添加业务背景
      optimized = this.addBusinessContext(optimized);

      return optimized;
    });
  }

  private quantifyAchievements(achievements: string[], experience: any): Achievement[] {
    return achievements.map(ach => {
      const quantified: Achievement = {
        title: ach,
        description: ach,
        metrics: this.extractOrInferMetrics(ach, experience)
      };

      // 尝试增强描述
      quantified.description = this.enhanceAchievementDescription(ach);

      return quantified;
    });
  }

  private generateImpactStatement(experience: any, config: ExperiencedConfig): string {
    // 基于职责和成就生成影响力陈述
    const impacts = [];

    // 业务影响
    if (experience.achievements && experience.achievements.length > 0) {
      impacts.push('通过专业能力推动了业务增长');
    }

    // 团队影响
    if (experience.teamSize && experience.teamSize > 1) {
      impacts.push(`带领${experience.teamSize}人团队高效协作`);
    }

    // 技术影响
    if (experience.responsibilities.some((r: string) =>
        r.includes('架构') || r.includes('设计') || r.includes('优化')
      )) {
      impacts.push('通过技术创新提升了系统性能');
    }

    return impacts.join('，') + '。';
  }

  private extractKeyResponsibilities(experience: any): string[] {
    // 从职责中提取关键的3-5项
    return experience.responsibilities
      .slice(0, 5)
      .map((r: string) => r.replace(/^[，、]\s*/, ''));
  }

  private extractTeamSize(experience: any): number | undefined {
    // 从描述中提取团队规模
    const teamMatch = experience.description?.match(/(\d+).*?人/);
    return teamMatch ? parseInt(teamMatch[1]) : undefined;
  }

  private extractBudgetManaged(experience: any): number | undefined {
    // 从描述中提取预算金额
    const budgetMatch = experience.description?.match(/(\d+).*?万/);
    return budgetMatch ? parseInt(budgetMatch[1]) * 10000 : undefined;
  }

  private assessTechnicalDepth(skills: string[], config: ExperiencedConfig): any[] {
    return skills.map(skill => ({
      name: skill,
      level: this.assessSkillLevel(skill, config.yearsOfExperience),
      yearsOfExperience: this.estimateSkillExperience(skill, config.yearsOfExperience),
      projects: this.countSkillProjects(skill),
      expertise: this.categorizeExpertise(skill)
    }));
  }

  private identifyCoreExpertise(skills: any[], highlight: string[]): string[] {
    // 识别核心专业领域
    return skills
      .filter(skill => skill.level === 'advanced' || skill.level === 'expert')
      .filter(skill => highlight.some(h => skill.name.includes(h)))
      .map(skill => skill.name)
      .slice(0, 5);
  }

  private extractManagementSkills(skills: any): string[] {
    const managementKeywords = [
      '团队管理', '项目管理', '人员培训', '绩效管理',
      '战略规划', '资源协调', '风险管理', '客户管理'
    ];

    return managementKeywords.filter(keyword =>
      skills.technical?.some((s: string) => s.includes(keyword)) ||
      skills.soft?.some((s: string) => s.includes(keyword))
    );
  }

  private identifyIndustryExpertise(skills: any): string[] {
    const industries = [
      '金融科技', '电子商务', '医疗健康', '教育', '制造业',
      '物流', '零售', '社交媒体', '游戏', '企业服务'
    ];

    return industries.filter(industry =>
      JSON.stringify(skills).toLowerCase().includes(industry.toLowerCase())
    );
  }

  private categorizeToolProficiency(tools: string[]): any[] {
    return tools.map(tool => ({
      name: tool,
      proficiency: this.assessToolProficiency(tool),
      usageFrequency: this.assessUsageFrequency(tool),
      lastUsed: new Date() // 实际应该从简历中提取
    }));
  }

  private identifyBusinessValue(project: any): string {
    const valueStatements = {
      '成本优化': '降低运营成本，提高盈利能力',
      '效率提升': '优化业务流程，提升运营效率',
      '收入增长': '拓展收入来源，推动业务增长',
      '风险控制': '建立风控体系，保障业务安全',
      '用户体验': '提升用户满意度，增强产品竞争力'
    };

    // 根据项目类型判断业务价值
    for (const [key, value] of Object.entries(valueStatements)) {
      if (project.description?.includes(key)) {
        return value;
      }
    }

    return '创造业务价值，提升企业竞争力';
  }

  private identifyTechnicalChallenges(project: any): string[] {
    const challenges = [];

    if (project.technologies?.includes('微服务')) {
      challenges.push('微服务架构设计与治理');
    }

    if (project.description?.includes('大数据') || project.description?.includes('高并发')) {
      challenges.push('高并发场景下的性能优化');
    }

    if (project.technologies?.includes('AI') || project.technologies?.includes('机器学习')) {
      challenges.push('AI模型训练与部署');
    }

    return challenges.slice(0, 3);
  }

  private quantifyProjectOutcomes(project: any): string[] {
    const outcomes = [];

    // 从项目描述中提取量化信息
    if (project.description) {
      const metrics = project.description.match(/\d+/g);
      if (metrics) {
        outcomes.push(`处理${metrics[0]}+请求/天`);
      }
    }

    // 默认成果
    outcomes.push('成功交付项目');
    outcomes.push('获得客户好评');

    return outcomes;
  }

  private describeCollaboration(project: any): string {
    if (project.teamSize && project.teamSize > 1) {
      return `与${project.teamSize}人团队紧密协作，共同完成项目目标`;
    }
    return '独立完成项目开发与交付';
  }

  private generateProfessionalSummary(
    resume: ParsedResume,
    config: ExperiencedConfig
  ): string {
    const years = config.yearsOfExperience;
    const currentRole = resume.experience?.[0]?.position || '专业人士';
    const keySkills = resume.skills?.technical?.slice(0, 3) || [];
    const coreExpertise = config.highlightExpertise.slice(0, 2);

    return `
      拥有${years}年${currentRole}经验的专业人士，
      精通${keySkills.join('、')}等技术栈，
      在${coreExpertise.join('、')}领域有深入研究和实践。
      具备优秀的团队领导能力和项目管理经验，
      擅长通过技术创新推动业务发展。
      期待在更具挑战性的环境中发挥专业价值。
    `.replace(/\s+/g, ' ').trim();
  }

  private generateProfessionalTags(resume: ParsedResume, config: ExperiencedConfig): string[] {
    const tags = [];

    // 工作年限标签
    if (config.yearsOfExperience >= 10) {
      tags.push('资深专家');
    } else if (config.yearsOfExperience >= 5) {
      tags.push('高级工程师');
    }

    // 领导力标签
    if (config.emphasizeLeadership) {
      tags.push('团队领导');
    }

    // 专业领域标签
    tags.push(...config.highlightExpertise.slice(0, 2));

    return tags;
  }

  private analyzeCareerProgression(experience: any[]): any {
    if (experience.length < 2) return null;

    const progression = {
      trajectory: 'stable', // stable, upward, lateral
      promotions: 0,
      companies: new Set(experience.map(e => e.company)).size,
      totalYears: 0,
      growthAreas: []
    };

    // 分析职位晋升
    for (let i = 1; i < experience.length; i++) {
      if (this.isPromotion(experience[i - 1], experience[i])) {
        progression.promotions++;
      }
    }

    // 判断发展轨迹
    if (progression.promotions > 0) {
      progression.trajectory = 'upward';
    }

    return progression;
  }

  private isPromotion(prevExp: any, currExp: any): boolean {
    const seniorityLevels = ['初级', '中级', '高级', '资深', '专家', '主管', '经理', '总监'];

    const prevLevel = seniorityLevels.findIndex(level =>
      prevExp.position.includes(level)
    );
    const currLevel = seniorityLevels.findIndex(level =>
      currExp.position.includes(level)
    );

    return currLevel > prevLevel;
  }

  private ensureActionVerbStart(text: string, config: ExperiencedConfig): string {
    // 检查是否以动词开头
    const verbs = [...Object.values(this.actionVerbs)].flat();
    const startsWithVerb = verbs.some(verb => text.startsWith(verb));

    if (!startsWithVerb) {
      // 添加合适的动词
      const defaultVerb = config.emphasizeLeadership ? '负责' : '参与';
      return `${defaultVerb}${text}`;
    }

    return text;
  }

  private emphasizeLeadershipAspect(text: string): string {
    const leadershipWords = ['带领', '指导', '管理', '协调', '推动'];

    if (!leadershipWords.some(word => text.includes(word))) {
      return `团队协作${text}`;
    }

    return text;
  }

  private addBusinessContext(text: string): string {
    if (!text.includes('业务') && !text.includes('客户') && !text.includes('价值')) {
      return `${text}，为业务创造价值`;
    }
    return text;
  }

  private extractOrInferMetrics(achievement: string, experience: any): any {
    // 尝试从文本中提取指标
    const percentageMatch = achievement.match(/(\d+)%/);
    const amountMatch = achievement.match(/(\d+)(万|千|亿)/);

    if (percentageMatch) {
      return {
        value: parseInt(percentageMatch[1]),
        unit: '%',
        improvement: parseInt(percentageMatch[1])
      };
    }

    if (amountMatch) {
      return {
        value: parseInt(amountMatch[1]),
        unit: amountMatch[2],
        improvement: 0
      };
    }

    // 如果没有具体数字，根据内容推断
    if (achievement.includes('提升') || achievement.includes('增加')) {
      return {
        value: 20,
        unit: '%',
        improvement: 20
      };
    }

    return undefined;
  }

  private enhanceAchievementDescription(achievement: string): string {
    // 增强成就描述，使其更有力
    if (achievement.length < 20) {
      return `${achievement}，取得显著成效`;
    }
    return achievement;
  }

  private assessSkillLevel(skill: string, yearsOfExperience: number): string {
    if (yearsOfExperience >= 10) return 'expert';
    if (yearsOfExperience >= 5) return 'advanced';
    if (yearsOfExperience >= 3) return 'intermediate';
    return 'beginner';
  }

  private estimateSkillExperience(skill: string, totalYears: number): number {
    // 估算特定技能的经验年限
    return Math.min(totalYears, totalYears * 0.8);
  }

  private countSkillProjects(skill: string): number {
    // 简化实现，实际应该统计相关项目
    return Math.floor(Math.random() * 10) + 1;
  }

  private categorizeExpertise(skill: string): string {
    const categories = {
      '架构': ['架构', '设计', '规划'],
      '开发': ['开发', '编程', '实现'],
      '优化': ['优化', '性能', '调优'],
      '管理': ['管理', '协调', '领导']
    };

    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(kw => skill.includes(kw))) {
        return category;
      }
    }

    return '技术';
  }

  private assessToolProficiency(tool: string): 'basic' | 'intermediate' | 'advanced' {
    // 简化实现
    const advancedTools = ['Docker', 'Kubernetes', 'Jenkins', 'Git'];
    return advancedTools.includes(tool) ? 'advanced' : 'intermediate';
  }

  private assessUsageFrequency(tool: string): 'daily' | 'weekly' | 'monthly' | 'occasionally' {
    const dailyTools = ['Git', 'IDE', 'Docker'];
    if (dailyTools.includes(tool)) return 'daily';
    return 'weekly';
  }

  private parseDate(dateStr: string): Date {
    if (dateStr === '至今') return new Date();
    const match = dateStr.match(/(\d{4})-(\d{1,2})/);
    if (match) {
      return new Date(parseInt(match[1]), parseInt(match[2]) - 1);
    }
    return new Date();
  }

  private async calculateOptimizationScore(
    resume: OptimizedResume,
    config: ExperiencedConfig
  ): Promise<number> {
    let score = 50;

    // 工作经历质量
    if (resume.experience && resume.experience.length > 0) {
      score += 20;

      // 检查是否有量化成就
      const hasQuantified = resume.experience.some(exp =>
        exp.achievements && exp.achievements.some((ach: any) => ach.metrics)
      );
      if (hasQuantified) score += 10;
    }

    // 专业技能展示
    if (resume.skills && resume.skills.coreExpertise) {
      score += 10;
    }

    // 领导力展示
    if (config.emphasizeLeadership && resume.skills?.managementSkills) {
      score += 10;
    }

    return Math.min(score, 100);
  }
}