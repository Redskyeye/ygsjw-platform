---
created: 2025-10-26T08:00:00Z
last_updated: 2025-10-26T08:00:00Z
version: 1.0
author: Claude Code PM System
---

import {
  ParsedResume,
  OptimizedResume,
  CareerChangeConfig,
  OptimizationMetadata
} from '../../types/optimizer';

/**
 * 转行优化器
 * 专为职业转换人士设计的简历优化策略
 */
export class CareerChangeOptimizer {
  private transferableSkillsMap = {
    // 管理能力（通用）
    management: [
      '项目管理', '团队协作', '资源协调', '时间管理',
      '目标设定', '决策能力', '风险评估', '战略规划'
    ],
    // 沟通能力（通用）
    communication: [
      '跨部门沟通', '客户沟通', '演讲展示', '谈判技巧',
      '文档撰写', '汇报能力', '冲突解决', '关系维护'
    ],
    // 分析能力（可转移）
    analysis: [
      '数据分析', '问题分析', '市场分析', '用户研究',
      '需求分析', '竞品分析', '趋势预测', '报告撰写'
    ],
    // 技术能力（部分转移）
    technical: [
      '软件应用', '系统操作', '基础编程', '数据管理',
      '网络基础', '安全意识', '新技术学习', '文档编写'
    ]
  };

  private industryBridges = {
    // 传统行业 -> 科技行业
    'manufacturing-tech': [
      '生产管理经验', '流程优化能力', '质量管理经验',
      '供应链理解', '精益生产理念', '效率提升思维'
    ],
    // 销售 -> 产品
    'sales-product': [
      '客户需求理解', '市场洞察力', '用户思维',
      '商业敏感度', '价值主张设计', '客户成功经验'
    ],
    // 教育 -> 培训/技术写作
    'education-tech': [
      '知识传授能力', '课程设计经验', '学习能力',
      '耐心和责任心', '逻辑思维', '结构化表达'
    ],
    // 财务 -> 数据分析
    'finance-data': [
      '数据敏感度', '分析思维', '报表制作',
      '商业理解', '风险意识', '合规意识'
    ]
  };

  async optimizeResume(
    resume: ParsedResume,
    config: CareerChangeConfig
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

    // 1. 识别并突出可转移技能
    const transferableSkills = this.identifyTransferableSkills(resume, config);
    optimizedResume.transferableSkills = transferableSkills;
    optimizedResume.optimization.appliedStrategies.push('transferable_skills');
    optimizedResume.optimization.improvements.push('识别并突出了可转移技能');

    // 2. 优化工作经历（关联目标行业）
    if (resume.experience && resume.experience.length > 0) {
      optimizedResume.experience = await this.optimizeExperienceForCareerChange(
        resume.experience,
        config
      );
      optimizedResume.optimization.appliedStrategies.push('experience_reframing');
      optimizedResume.optimization.improvements.push('重新梳理了工作经历，突出相关经验');
    }

    // 3. 隐藏或弱化不相关经历
    if (config.hideIrrelevantExperience) {
      optimizedResume.experience = this.filterRelevantExperience(
        optimizedResume.experience,
        config
      );
      optimizedResume.optimization.appliedStrategies.push('irrelevant_filter');
    }

    // 4. 优化技能展示（突出桥接技能）
    if (resume.skills) {
      optimizedResume.skills = await this.optimizeSkillsForCareerChange(
        resume.skills,
        config
      );
      optimizedResume.optimization.appliedStrategies.push('bridge_skills');
      optimizedResume.optimization.improvements.push('优化了技能展示，突出桥接技能');
    }

    // 5. 生成转行说明
    if (config.explainCareerChange) {
      optimizedResume.careerChangeStatement = this.generateCareerChangeStatement(
        resume,
        config
      );
      optimizedResume.optimization.appliedStrategies.push('career_narrative');
      optimizedResume.optimization.improvements.push('添加了转行说明');
    }

    // 6. 优化个人总结
    optimizedResume.personalInfo = await this.optimizePersonalSummary(
      resume.personalInfo || {},
      resume,
      config
    );
    optimizedResume.optimization.appliedStrategies.push('summary_refocus');

    // 7. 添加学习能力和适应性证明
    optimizedResume.learningCapabilities = this.identifyLearningCapabilities(resume);
    optimizedResume.optimization.appliedStrategies.push('learning_demonstration');

    // 8. 计算优化分数
    optimizedResume.optimization.score = await this.calculateOptimizationScore(
      optimizedResume,
      config
    );

    return optimizedResume;
  }

  private identifyTransferableSkills(
    resume: ParsedResume,
    config: CareerChangeConfig
  ): {
    skills: string[];
    evidence: Array<{ skill: string; evidence: string; source: string }>;
  } {
    const transferable = {
      skills: [...config.transferableSkills],
      evidence: [] as Array<{ skill: string; evidence: string; source: string }>
    };

    // 从工作经历中提取证据
    resume.experience?.forEach(exp => {
      exp.responsibilities.forEach(resp => {
        Object.entries(this.transferableSkillsMap).forEach(([category, skills]) => {
          skills.forEach(skill => {
            if (resp.includes(skill) || this.relatedKeywords(resp, skill)) {
              transferable.evidence.push({
                skill,
                evidence: resp,
                source: `${exp.company} - ${exp.position}`
              });
            }
          });
        });
      });
    });

    // 从项目经验中提取
    resume.projects?.forEach(project => {
      if (project.description) {
        Object.values(this.transferableSkillsMap).flat().forEach(skill => {
          if (project.description.includes(skill)) {
            transferable.evidence.push({
              skill,
              evidence: project.description,
              source: `项目：${project.name}`
            });
          }
        });
      }
    });

    return transferable;
  }

  private async optimizeExperienceForCareerChange(
    experience: any[],
    config: CareerChangeConfig
  ): Promise<any[]> {
    return experience.map(exp => {
      const optimized = { ...exp };

      // 1. 重新包装职位描述
      optimized.position = this.reframePosition(exp.position, config);

      // 2. 突出相关职责
      optimized.responsibilities = this.highlightRelevantResponsibilities(
        exp.responsibilities,
        config
      );

      // 3. 转化成就表述
      optimized.achievements = this.reframeAchievements(
        exp.achievements || [],
        config
      );

      // 4. 添加行业洞察
      optimized.industryInsights = this.extractIndustryInsights(exp, config);

      // 5. 关联目标领域
      optimized.relevanceToTarget = this.assessRelevanceToTargetField(exp, config);

      return optimized;
    });
  }

  private filterRelevantExperience(
    experience: any[],
    config: CareerChangeConfig
  ): any[] {
    return experience
      .map(exp => ({
        ...exp,
        relevanceScore: this.calculateExperienceRelevance(exp, config)
      }))
      .filter(exp => exp.relevanceScore > 30) // 保留相关性大于30%的经历
      .sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  private async optimizeSkillsForCareerChange(
    skills: any,
    config: CareerChangeConfig
  ): Promise<any> {
    const optimized = { ...skills };

    // 1. 技能分类和优先级
    optimized.categorizedSkills = this.categorizeSkillsForCareerChange(skills, config);

    // 2. 突出桥接技能
    optimized.bridgeSkills = this.identifyBridgeSkills(skills, config);

    // 3. 学习能力证明
    optimized.learningEvidence = this.extractLearningEvidence(skills);

    // 4. 目标领域相关技能
    optimized.targetFieldSkills = this.mapToTargetFieldSkills(skills, config);

    return optimized;
  }

  private generateCareerChangeStatement(
    resume: ParsedResume,
    config: CareerChangeConfig
  ): string {
    const totalYears = this.calculateTotalExperience(resume);
    const currentField = resume.experience?.[0]?.industry || '当前行业';
    const targetField = config.targetRole || '目标领域';
    const transferableCount = config.transferableSkills.length;

    return `
      拥有${totalYears}年${currentField}工作经验，积累了丰富的${config.transferableSkills.slice(0, 3).join('、')}等核心能力。
      通过持续学习和项目实践，已掌握${config.bridgeSkills.slice(0, 3).join('、')}等${targetField}所需技能。
      职业转型是基于对${targetField}的深入理解和长期职业规划，相信过往经验能够为新的职业发展提供独特价值。
      期待在${targetField}领域发挥综合优势，创造更大价值。
    `.replace(/\s+/g, ' ').trim();
  }

  private async optimizePersonalSummary(
    personalInfo: any,
    resume: ParsedResume,
    config: CareerChangeConfig
  ): Promise<any> {
    const summary = this.generateCareerChangeSummary(resume, config);

    return {
      ...personalInfo,
      summary,
      careerObjective: this.generateCareerObjective(config),
      valueProposition: this.generateValueProposition(resume, config)
    };
  }

  private identifyLearningCapabilities(resume: ParsedResume): any {
    return {
      quickLearner: this.assessQuickLearning(resume),
      adaptive: this.assessAdaptability(resume),
      continuousLearning: this.extractContinuousLearningEvidence(resume),
      certifications: resume.certificates?.map(cert => ({
        name: cert.name,
        relevance: this.assessCertificationRelevance(cert),
        date: cert.date
      })) || []
    };
  }

  private relatedKeywords(text: string, skill: string): boolean {
    const keywordMap: Record<string, string[]> = {
      '项目管理': ['项目', '管理', '协调', '计划', '进度'],
      '团队协作': ['团队', '合作', '协作', '配合', '沟通'],
      '数据分析': ['数据', '分析', '统计', '报表', '图表'],
      '客户沟通': ['客户', '沟通', '交流', '谈判', '服务']
    };

    const keywords = keywordMap[skill] || [];
    return keywords.some(keyword => text.includes(keyword));
  }

  private reframePosition(position: string, config: CareerChangeConfig): string {
    // 根据目标领域重新包装职位名称
    const positionMap: Record<string, Record<string, string>> = {
      '技术': {
        '销售经理': '技术客户经理',
        '产品经理': '技术产品经理',
        '项目经理': '技术项目经理'
      },
      '产品': {
        '销售代表': '产品专员',
        '客服主管': '用户运营专员',
        '市场经理': '产品市场经理'
      },
      '数据分析': {
        '财务分析师': '数据分析师',
        '运营专员': '运营数据分析师',
        '市场分析': '市场数据分析师'
      }
    };

    const targetPositions = positionMap[config.targetRole] || {};
    return targetPositions[position] || position;
  }

  private highlightRelevantResponsibilities(
    responsibilities: string[],
    config: CareerChangeConfig
  ): string[] {
    return responsibilities.map(resp => {
      // 检查是否包含可转移技能
      const hasTransferableSkill = config.transferableSkills.some(skill =>
        resp.includes(skill) || this.relatedKeywords(resp, skill)
      );

      if (hasTransferableSkill) {
        // 增强表述
        return this.enhanceResponsibility(resp, config);
      }

      return resp;
    }).filter((_, index) => index < 5); // 最多保留5条
  }

  private reframeAchievements(
    achievements: string[],
    config: CareerChangeConfig
  ): string[] {
    return achievements.map(ach => {
      // 尝试将成就与目标领域关联
      if (config.targetRole === '技术') {
        return this.reframeForTech(ach);
      } else if (config.targetRole === '产品') {
        return this.reframeForProduct(ach);
      } else if (config.targetRole === '数据分析') {
        return this.reframeForData(ach);
      }

      return ach;
    });
  }

  private extractIndustryInsights(exp: any, config: CareerChangeConfig): string[] {
    const insights = [];

    // 提取行业见解
    if (exp.description) {
      // 简化实现，实际需要更复杂的NLP
      insights.push('深刻理解业务流程');
      insights.push('具备行业洞察力');
    }

    return insights;
  }

  private assessRelevanceToTargetField(exp: any, config: CareerChangeConfig): {
    score: number;
    reasons: string[];
  } {
    let score = 0;
    const reasons = [];

    // 检查技能相关性
    config.transferableSkills.forEach(skill => {
      if (exp.responsibilities.some((r: string) => r.includes(skill))) {
        score += 20;
        reasons.push(`具备${skill}经验`);
      }
    });

    // 检查行业相关性
    if (exp.industry === config.targetRole) {
      score += 30;
      reasons.push('行业相关');
    }

    return { score: Math.min(score, 100), reasons };
  }

  private calculateExperienceRelevance(exp: any, config: CareerChangeConfig): number {
    const relevance = this.assessRelevanceToTargetField(exp, config);
    return relevance.score;
  }

  private categorizeSkillsForCareerChange(
    skills: any,
    config: CareerChangeConfig
  ): any {
    return {
      transferable: this.filterTransferableSkills(skills, config),
      bridge: config.bridgeSkills,
      target: this.mapToTargetFieldSkills(skills, config),
      learning: this.identifyLearningSkills(skills)
    };
  }

  private identifyBridgeSkills(skills: any, config: CareerChangeConfig): string[] {
    return config.bridgeSkills.map(skill => ({
      name: skill,
      source: '识别',
      evidence: this.findSkillEvidence(skills, skill)
    }));
  }

  private extractLearningEvidence(skills: any): any[] {
    // 提取学习能力的证据
    return [
      {
        type: '快速学习',
        evidence: '短时间内掌握多项新技能'
      },
      {
        type: '自主学习',
        evidence: '通过在线课程持续提升'
      }
    ];
  }

  private mapToTargetFieldSkills(skills: any, config: CareerChangeConfig): string[] {
    const mapping: Record<string, string[]> = {
      '技术': ['逻辑思维', '问题解决', '系统思维'],
      '产品': ['用户思维', '需求分析', '商业敏感度'],
      '数据分析': ['数据敏感度', '统计分析', '逻辑推理']
    };

    return mapping[config.targetRole] || [];
  }

  private generateCareerChangeSummary(
    resume: ParsedResume,
    config: CareerChangeConfig
  ): string {
    const totalYears = this.calculateTotalExperience(resume);
    const keySkills = config.transferableSkills.slice(0, 4).join('、');

    return `
      ${totalYears}年职场经验，在${keySkills}等方面积累扎实基础。
      通过系统学习和实践，成功转型至${config.targetRole}领域。
      具备强大的学习能力和适应性，能够快速融入新环境并创造价值。
    `.replace(/\s+/g, ' ').trim();
  }

  private generateCareerObjective(config: CareerChangeConfig): string {
    return `在${config.targetRole}领域发挥过往经验优势，通过持续学习和实践，成为该领域的专业人才。`;
  }

  private generateValueProposition(
    resume: ParsedResume,
    config: CareerChangeConfig
  ): string {
    return `独特的跨领域背景，能够带来不同视角的创新解决方案。结合${config.relevantExperience[0] || '过往经验'}与${config.targetRole}专业技能，为团队创造独特价值。`;
  }

  private assessQuickLearning(resume: ParsedResume): {
    score: number;
    evidence: string[];
  } {
    return {
      score: 85,
      evidence: ['快速掌握新技能', '成功完成转型']
    };
  }

  private assessAdaptability(resume: ParsedResume): {
    score: number;
    evidence: string[];
  } {
    return {
      score: 80,
      evidence: ['适应不同环境', '灵活调整策略']
    };
  }

  private extractContinuousLearningEvidence(resume: ParsedResume): any[] {
    return resume.certificates?.map(cert => ({
      type: '证书',
      name: cert.name,
      date: cert.date
    })) || [];
  }

  private assessCertificationRelevance(cert: any): number {
    // 简化实现
    return 80;
  }

  private enhanceResponsibility(resp: string, config: CareerChangeConfig): string {
    // 根据目标领域增强职责描述
    if (config.targetRole === '技术') {
      if (resp.includes('沟通')) {
        return `${resp}，与技术团队高效协作`;
      }
    }

    return resp;
  }

  private reframeForTech(ach: string): string {
    const techKeywords = ['系统', '平台', '技术', '数字化'];
    const hasTechKeyword = techKeywords.some(kw => ach.includes(kw));

    if (!hasTechKeyword) {
      return `通过技术手段${ach}`;
    }

    return ach;
  }

  private reframeForProduct(ach: string): string {
    const productKeywords = ['用户', '产品', '需求', '体验'];
    const hasProductKeyword = productKeywords.some(kw => ach.includes(kw));

    if (!hasProductKeyword) {
      return `从产品角度${ach}，提升用户价值`;
    }

    return ach;
  }

  private reframeForData(ach: string): string {
    const dataKeywords = ['数据', '分析', '指标', '洞察'];
    const hasDataKeyword = dataKeywords.some(kw => ach.includes(kw));

    if (!hasDataKeyword) {
      return `基于数据分析${ach}，提供决策支持`;
    }

    return ach;
  }

  private filterTransferableSkills(skills: any, config: CareerChangeConfig): string[] {
    return skills.technical?.filter((skill: string) =>
      config.transferableSkills.some(transferable =>
        skill.includes(transferable) || this.relatedKeywords(skill, transferable)
      )
    ) || [];
  }

  private findSkillEvidence(skills: any, skill: string): string {
    // 查找技能证据
    return '相关工作经历中体现';
  }

  private identifyLearningSkills(skills: any): string[] {
    return ['快速学习', '持续改进', '知识分享'];
  }

  private calculateTotalExperience(resume: ParsedResume): number {
    if (!resume.experience || resume.experience.length === 0) return 0;

    return resume.experience.reduce((total, exp) => {
      const years = this.parseYearsFromDuration(exp.duration);
      return total + years;
    }, 0);
  }

  private parseYearsFromDuration(duration: string): number {
    const match = duration.match(/(\d+)/);
    return match ? parseInt(match[0]) : 0;
  }

  private async calculateOptimizationScore(
    resume: OptimizedResume,
    config: CareerChangeConfig
  ): Promise<number> {
    let score = 50;

    // 可转移技能突出程度
    if (resume.transferableSkills && resume.transferableSkills.skills.length > 0) {
      score += 20;
    }

    // 转行说明
    if (resume.careerChangeStatement) {
      score += 10;
    }

    // 学习能力证明
    if (resume.learningCapabilities) {
      score += 10;
    }

    // 经历相关性
    if (resume.experience && resume.experience.length > 0) {
      const avgRelevance = resume.experience.reduce((sum, exp) => {
        return sum + (exp.relevanceToTarget?.score || 0);
      }, 0) / resume.experience.length;
      score += avgRelevance * 0.1;
    }

    return Math.min(score, 100);
  }
}