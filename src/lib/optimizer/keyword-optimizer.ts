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
  KeywordSet,
  KeywordDensity,
  KeywordConfig,
  EnhancedSkillsData,
  KeywordSummary,
  OptimizationMetadata
} from '../../types/optimizer';
import { ATSKeywordMatcher } from '../ats/ats-keyword-matcher';

/**
 * 关键词优化器
 * 优化简历关键词密度和分布，提高ATS匹配度
 */
export class KeywordOptimizer {
  private keywordMatcher: ATSKeywordMatcher;
  private keywordCategories = {
    technical: {
      programming: ['JavaScript', 'Python', 'Java', 'C++', 'TypeScript', 'Go', 'Rust'],
      frameworks: ['React', 'Vue', 'Angular', 'Django', 'Spring', 'Express', 'Next.js'],
      databases: ['MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Elasticsearch'],
      cloud: ['AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Serverless'],
      tools: ['Git', 'Jenkins', 'CI/CD', 'Webpack', 'Vite', 'Linux']
    },
    business: {
      management: ['项目管理', '团队管理', '产品管理', '敏捷开发', 'Scrum'],
      analytics: ['数据分析', '业务分析', '用户分析', '市场分析', '竞品分析'],
      strategy: ['战略规划', '业务规划', '产品策略', '市场策略', '技术战略']
    },
    soft: {
      communication: ['沟通能力', '表达能力', '演讲能力', '谈判技巧', '文档撰写'],
      leadership: ['领导力', '团队协作', '决策能力', '影响力', '激励能力'],
      learning: ['学习能力', '适应能力', '创新思维', '问题解决', '持续改进']
    }
  };

  constructor() {
    this.keywordMatcher = new ATSKeywordMatcher();
  }

  async optimizeKeywords(
    resume: ParsedResume,
    targetJob?: JobDescription,
    config: KeywordConfig = {}
  ): Promise<OptimizedResume> {
    const optimizedResume: OptimizedResume = {
      ...resume,
      optimization: {
        mode: 'content_beautify' as any,
        appliedStrategies: [],
        score: 0,
        improvements: [],
        timestamp: new Date(),
        config: {} as any
      }
    };

    // 1. 提取目标关键词
    const targetKeywords = targetJob
      ? await this.keywordMatcher.extractKeywordsFromJob(targetJob)
      : await this.getDefaultKeywords(resume.skills);

    // 2. 分析当前关键词密度
    const currentDensity = await this.keywordMatcher.analyzeKeywordDensity(resume);

    // 3. 优化关键词分布
    const optimizedData = await this.optimizeKeywordDistribution(
      resume,
      targetKeywords,
      currentDensity,
      config
    );
    Object.assign(optimizedResume, optimizedData);

    // 4. 生成关键词摘要
    const keywordSummary = await this.generateKeywordSummary(optimizedResume, targetKeywords);
    optimizedResume.keywordSummary = keywordSummary;

    // 5. 优化技能部分
    optimizedResume.skills = await this.optimizeSkillsKeywords(
      resume.skills,
      targetKeywords,
      config.skillEmphasis
    );

    // 6. 添加关键词建议
    optimizedResume.keywordSuggestions = this.generateKeywordSuggestions(
      resume,
      targetKeywords,
      config
    );

    // 更新优化元数据
    optimizedResume.optimization.appliedStrategies.push('keyword_optimization');
    optimizedResume.optimization.improvements.push(`优化了${targetKeywords.technical.length}个技术关键词`);

    return optimizedResume;
  }

  private async optimizeKeywordDistribution(
    resume: ParsedResume,
    targetKeywords: KeywordSet,
    currentDensity: KeywordDensity,
    config: KeywordConfig
  ): Promise<Partial<OptimizedResume>> {
    const optimized: Partial<OptimizedResume> = {};

    // 1. 优化工作经历中的关键词
    if (resume.experience) {
      optimized.experience = await Promise.all(
        resume.experience.map(exp =>
          this.optimizeExperienceKeywords(exp, targetKeywords, config.experienceDepth)
        )
      );
    }

    // 2. 优化项目描述中的关键词
    if (resume.projects) {
      optimized.projects = await Promise.all(
        resume.projects.map(project =>
          this.optimizeProjectKeywords(project, targetKeywords, config.projectDetail)
        )
      );
    }

    // 3. 优化教育背景中的关键词
    if (resume.education) {
      optimized.education = await this.optimizeEducationKeywords(
        resume.education,
        targetKeywords
      );
    }

    // 4. 优化个人总结中的关键词
    if (resume.personalInfo?.summary) {
      optimized.personalInfo = {
        ...resume.personalInfo,
        summary: await this.optimizeSummaryKeywords(
          resume.personalInfo.summary,
          targetKeywords
        )
      };
    }

    return optimized;
  }

  private async optimizeExperienceKeywords(
    experience: any,
    targetKeywords: KeywordSet,
    depth: 'summary' | 'detailed' | 'comprehensive'
  ): Promise<any> {
    const optimized = { ...experience };

    // 1. 优化职责描述
    optimized.responsibilities = await Promise.all(
      experience.responsibilities.map(async (resp: string) =>
        this.injectKeywordsIntoText(resp, targetKeywords, 'responsibility')
      )
    );

    // 2. 优化成就描述
    if (experience.achievements) {
      optimized.achievements = await Promise.all(
        experience.achievements.map(async (ach: string) =>
          this.injectKeywordsIntoText(ach, targetKeywords, 'achievement')
        )
      );
    }

    // 3. 根据深度调整详细程度
    switch (depth) {
      case 'summary':
        optimized.responsibilities = optimized.responsibilities.slice(0, 3);
        break;
      case 'detailed':
        optimized.responsibilities = await this.enhanceWithDetails(
          optimized.responsibilities,
          targetKeywords
        );
        break;
      case 'comprehensive':
        optimized.responsibilities = await this.addComprehensiveDetails(
          optimized.responsibilities,
          targetKeywords
        );
        break;
    }

    return optimized;
  }

  private async optimizeProjectKeywords(
    project: any,
    targetKeywords: KeywordSet,
    detail: 'overview' | 'detailed' | 'comprehensive'
  ): Promise<any> {
    const optimized = { ...project };

    // 1. 优化项目描述
    optimized.description = await this.injectKeywordsIntoText(
      project.description,
      targetKeywords,
      'project'
    );

    // 2. 优化技术栈
    if (project.technologies) {
      optimized.technologies = this.prioritizeTechnologies(
        project.technologies,
        targetKeywords.technical
      );
    }

    // 3. 添加相关关键词
    optimized.relatedKeywords = this.extractRelatedKeywords(project, targetKeywords);

    // 4. 根据详细程度调整
    switch (detail) {
      case 'detailed':
        optimized.businessImpact = this.generateBusinessImpact(project, targetKeywords);
        break;
      case 'comprehensive':
        optimized.businessImpact = this.generateBusinessImpact(project, targetKeywords);
        optimized.technicalChallenges = this.generateTechnicalChallenges(project, targetKeywords);
        break;
    }

    return optimized;
  }

  private async optimizeEducationKeywords(
    education: any[],
    targetKeywords: KeywordSet
  ): Promise<any[]> {
    return education.map(edu => {
      const optimized = { ...edu };

      // 1. 优化专业描述
      if (edu.major) {
        optimized.enhancedMajor = this.enhanceMajorWithKeywords(edu.major, targetKeywords);
      }

      // 2. 添加相关课程
      optimized.relevantCourses = this.suggestRelevantCourses(edu, targetKeywords);

      // 3. 优化成就描述
      if (edu.achievements) {
        optimized.achievements = edu.achievements.map((ach: string) =>
          this.injectKeywordsIntoText(ach, targetKeywords, 'education')
        );
      }

      return optimized;
    });
  }

  private async optimizeSummaryKeywords(
    summary: string,
    targetKeywords: KeywordSet
  ): Promise<string> {
    // 在个人总结中自然地融入关键词
    let optimized = summary;

    // 1. 添加核心技能关键词
    const coreSkills = targetKeywords.technical.slice(0, 3);
    if (!optimized.includes(coreSkills[0])) {
      optimized += `，精通${coreSkills.join('、')}等技术`;
    }

    // 2. 添加业务关键词
    const businessKeywords = targetKeywords.industry.slice(0, 2);
    if (businessKeywords.length > 0 && !optimized.includes(businessKeywords[0])) {
      optimized += `，在${businessKeywords.join('、')}领域有深入理解`;
    }

    return optimized;
  }

  private async optimizeSkillsKeywords(
    skills: any,
    targetKeywords: KeywordSet,
    emphasis: 'balanced' | 'technical' | 'comprehensive'
  ): Promise<EnhancedSkillsData> {
    const optimized: EnhancedSkillsData = {
      technical: [],
      soft: [],
      languages: skills.languages || [],
      certifications: []
    };

    // 1. 优化技术技能
    optimized.technical = await this.optimizeTechnicalSkills(
      skills.technical || [],
      targetKeywords.technical,
      emphasis
    );

    // 2. 优化软技能
    optimized.soft = await this.optimizeSoftSkills(
      skills.soft || [],
      targetKeywords.soft
    );

    // 3. 添加目标关键词
    optimized.targetKeywords = this.organizeTargetKeywords(targetKeywords);

    // 4. 生成技能评分
    optimized.skillProficiency = this.generateSkillProficiency(optimized, targetKeywords);

    return optimized;
  }

  private async optimizeTechnicalSkills(
    technicalSkills: string[],
    targetTechnicalKeywords: string[],
    emphasis: 'balanced' | 'technical' | 'comprehensive'
  ): Promise<any[]> {
    // 1. 优先级排序
    const prioritized = this.prioritizeSkills(technicalSkills, targetTechnicalKeywords);

    // 2. 补充缺失技能
    const enhanced = await this.enhanceSkillList(prioritized, targetTechnicalKeywords);

    // 3. 技能分类
    const categorized = this.categorizeSkills(enhanced);

    // 4. 添加熟练度
    const withProficiency = this.addProficiencyLevels(categorized, emphasis);

    return withProficiency;
  }

  private async optimizeSoftSkills(
    softSkills: string[],
    targetSoftKeywords: string[]
  ): Promise<string[]> {
    // 1. 合并现有技能和目标技能
    const combined = [...new Set([...softSkills, ...targetSoftKeywords])];

    // 2. 优先级排序
    const prioritized = this.prioritizeSoftSkills(combined, targetSoftKeywords);

    // 3. 限制数量
    return prioritized.slice(0, 8);
  }

  private async injectKeywordsIntoText(
    text: string,
    keywords: KeywordSet,
    context: 'responsibility' | 'achievement' | 'project' | 'education'
  ): Promise<string> {
    let enhanced = text;

    // 1. 提取相关关键词
    const relevantKeywords = this.getRelevantKeywords(keywords, context);

    // 2. 自然融入关键词
    relevantKeywords.forEach(keyword => {
      if (!enhanced.toLowerCase().includes(keyword.toLowerCase())) {
        enhanced = this.naturallyInjectKeyword(enhanced, keyword, context);
      }
    });

    // 3. 优化表达
    enhanced = this.optimizeKeywordExpression(enhanced);

    return enhanced;
  }

  private getRelevantKeywords(keywords: KeywordSet, context: string): string[] {
    switch (context) {
      case 'responsibility':
      case 'project':
        return [...keywords.technical.slice(0, 5), ...keywords.tools.slice(0, 3)];
      case 'achievement':
        return [...keywords.technical.slice(0, 3), ...keywords.industry.slice(0, 2)];
      case 'education':
        return keywords.technical.slice(0, 4);
      default:
        return keywords.technical;
    }
  }

  private naturallyInjectKeyword(text: string, keyword: string, context: string): string {
    const injectionPoints = {
      responsibility: ['负责', '参与', '开发', '实现', '优化'],
      achievement: ['提升', '降低', '实现', '创造', '完成'],
      project: ['使用', '采用', '基于', '通过', '运用'],
      education: ['学习', '掌握', '研究', '完成', '获得']
    };

    const points = injectionPoints[context as keyof typeof injectionPoints] || [];

    for (const point of points) {
      if (text.includes(point)) {
        return text.replace(point, `${point}${keyword}相关的`);
      }
    }

    // 如果没有合适的注入点，在句末添加
    return `${text}，涉及${keyword}技术`;
  }

  private optimizeKeywordExpression(text: string): string {
    // 优化关键词表达
    return text
      .replace(/的/g, '') // 减少冗余的"的"
      .replace(/进行了/g, '') // 删除无意义的词
      .replace(/实现了/g, '实现'); // 优化表达
  }

  private prioritizeSkills(
    currentSkills: string[],
    targetKeywords: string[]
  ): string[] {
    return currentSkills.sort((a, b) => {
      const aInTarget = targetKeywords.some(k =>
        a.toLowerCase().includes(k.toLowerCase()) ||
        k.toLowerCase().includes(a.toLowerCase())
      );
      const bInTarget = targetKeywords.some(k =>
        b.toLowerCase().includes(k.toLowerCase()) ||
        k.toLowerCase().includes(b.toLowerCase())
      );

      if (aInTarget && !bInTarget) return -1;
      if (!aInTarget && bInTarget) return 1;
      return 0;
    });
  }

  private async enhanceSkillList(
    skills: string[],
    targetKeywords: string[]
  ): Promise<string[]> {
    // 补充缺失的关键技能
    const missing = targetKeywords.filter(keyword =>
      !skills.some(s =>
        s.toLowerCase().includes(keyword.toLowerCase()) ||
        keyword.toLowerCase().includes(s.toLowerCase())
      )
    );

    // 添加部分缺失技能（不要全部添加）
    const toAdd = missing.slice(0, Math.min(3, missing.length));
    return [...skills, ...toAdd];
  }

  private categorizeSkills(skills: string[]): any[] {
    const categorized = {
      frontend: [],
      backend: [],
      database: [],
      devops: [],
      mobile: [],
      other: []
    };

    skills.forEach(skill => {
      const category = this.categorizeSingleSkill(skill);
      categorized[category].push(skill);
    });

    return Object.entries(categorized)
      .filter(([_, list]) => list.length > 0)
      .map(([category, list]) => ({ category, skills: list }));
  }

  private categorizeSingleSkill(skill: string): string {
    const categories = {
      frontend: ['React', 'Vue', 'Angular', 'JavaScript', 'TypeScript', 'HTML', 'CSS'],
      backend: ['Node.js', 'Python', 'Java', 'Go', 'Express', 'Django', 'Spring'],
      database: ['MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'SQL'],
      devops: ['Docker', 'Kubernetes', 'Jenkins', 'CI/CD', 'AWS', 'Azure'],
      mobile: ['iOS', 'Android', 'React Native', 'Flutter', 'Swift', 'Kotlin']
    };

    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(k => skill.toLowerCase().includes(k.toLowerCase()))) {
        return category;
      }
    }

    return 'other';
  }

  private addProficiencyLevels(
    categorizedSkills: any[],
    emphasis: 'balanced' | 'technical' | 'comprehensive'
  ): any[] {
    return categorizedSkills.map(category => ({
      ...category,
      skills: category.skills.map(skill => ({
        name: skill,
        proficiency: this.assessProficiency(skill, emphasis),
        relevance: this.calculateRelevance(skill)
      }))
    }));
  }

  private assessProficiency(
    skill: string,
    emphasis: 'balanced' | 'technical' | 'comprehensive'
  ): 'beginner' | 'intermediate' | 'advanced' | 'expert' {
    // 根据技能类型和强调重点评估熟练度
    const commonSkills = ['JavaScript', 'Python', 'Git'];
    const advancedSkills = ['Kubernetes', 'TensorFlow', 'AWS'];

    if (commonSkills.includes(skill)) return 'intermediate';
    if (advancedSkills.includes(skill)) return 'advanced';
    if (emphasis === 'technical') return 'intermediate';
    return 'beginner';
  }

  private calculateRelevance(skill: string): number {
    // 计算技能相关性
    const highDemandSkills = ['React', 'Node.js', 'Python', 'AWS', 'Docker'];
    if (highDemandSkills.includes(skill)) return 90;
    return 70;
  }

  private prioritizeSoftSkills(skills: string[], targetKeywords: string[]): string[] {
    return skills.sort((a, b) => {
      const aScore = targetKeywords.includes(a) ? 1 : 0;
      const bScore = targetKeywords.includes(b) ? 1 : 0;
      return bScore - aScore;
    });
  }

  private organizeTargetKeywords(keywords: KeywordSet): any {
    return {
      technical: keywords.technical.slice(0, 10),
      business: keywords.soft.slice(0, 5),
      tools: keywords.tools.slice(0, 5),
      industry: keywords.industry.slice(0, 3)
    };
  }

  private generateSkillProficiency(
    skills: EnhancedSkillsData,
    targetKeywords: KeywordSet
  ): any {
    const technical = skills.technical || [];
    const matchingSkills = technical.filter(category =>
      category.skills.some((skill: any) =>
        targetKeywords.technical.includes(skill.name)
      )
    );

    return {
      overall: matchingSkills.length > 0 ? 80 : 60,
      technical: this.calculateTechnicalScore(technical, targetKeywords),
      coverage: this.calculateKeywordCoverage(skills, targetKeywords)
    };
  }

  private calculateTechnicalScore(technical: any[], targetKeywords: KeywordSet): number {
    let score = 0;
    let total = 0;

    technical.forEach(category => {
      category.skills.forEach((skill: any) => {
        total++;
        if (targetKeywords.technical.includes(skill.name)) {
          score += skill.proficiency === 'expert' ? 100 : 80;
        } else {
          score += 60;
        }
      });
    });

    return total > 0 ? Math.round(score / total) : 0;
  }

  private calculateKeywordCoverage(
    skills: EnhancedSkillsData,
    targetKeywords: KeywordSet
  ): number {
    const allSkills = [
      ...(skills.technical || []).flatMap((cat: any) => cat.skills.map((s: any) => s.name)),
      ...(skills.soft || [])
    ];

    const covered = targetKeywords.technical.filter(keyword =>
      allSkills.some(skill => skill.toLowerCase().includes(keyword.toLowerCase()))
    );

    return targetKeywords.technical.length > 0
      ? Math.round((covered.length / targetKeywords.technical.length) * 100)
      : 0;
  }

  private prioritizeTechnologies(
    technologies: string[],
    targetKeywords: string[]
  ): string[] {
    return technologies.sort((a, b) => {
      const aPriority = targetKeywords.includes(a) ? 1 : 0;
      const bPriority = targetKeywords.includes(b) ? 1 : 0;
      return bPriority - aPriority;
    });
  }

  private extractRelatedKeywords(project: any, targetKeywords: KeywordSet): string[] {
    const related = new Set<string>();

    // 从项目名称和描述中提取相关关键词
    const projectText = `${project.name} ${project.description}`.toLowerCase();

    targetKeywords.technical.forEach(keyword => {
      if (projectText.includes(keyword.toLowerCase())) {
        related.add(keyword);
      }
    });

    return Array.from(related);
  }

  private generateBusinessImpact(project: any, targetKeywords: KeywordSet): string {
    const impacts = [
      '提升了业务效率',
      '降低了运营成本',
      '改善了用户体验',
      '增强了系统稳定性'
    ];

    // 根据目标关键词选择最合适的业务影响
    const businessKeywords = targetKeywords.industry;
    if (businessKeywords.length > 0) {
      return `在${businessKeywords[0]}领域${impacts[0]}`;
    }

    return impacts[0];
  }

  private generateTechnicalChallenges(project: any, targetKeywords: KeywordSet): string[] {
    const challenges = [];

    // 基于技术栈生成挑战
    if (project.technologies?.includes('微服务')) {
      challenges.push('解决微服务架构中的服务治理问题');
    }
    if (project.technologies?.includes('高并发')) {
      challenges.push('处理高并发场景下的性能优化');
    }

    return challenges.slice(0, 2);
  }

  private enhanceMajorWithKeywords(major: string, targetKeywords: KeywordSet): string {
    // 增强专业描述
    const relevantKeywords = targetKeywords.technical.filter(k =>
      major.toLowerCase().includes('computer') || major.toLowerCase().includes('software')
    );

    if (relevantKeywords.length > 0) {
      return `${major}（主修${relevantKeywords.slice(0, 2).join('、')}相关课程）`;
    }

    return major;
  }

  private suggestRelevantCourses(edu: any, targetKeywords: KeywordSet): string[] {
    // 建议相关课程
    const courses = [
      '数据结构与算法',
      '计算机网络',
      '操作系统',
      '数据库系统',
      '软件工程'
    ];

    return courses.filter(course => {
      const courseKeywords = course.split(/[与和]/);
      return courseKeywords.some(kw =>
        targetKeywords.technical.some(tech =>
          kw.toLowerCase().includes(tech.toLowerCase()) ||
          tech.toLowerCase().includes(kw.toLowerCase())
        )
      );
    });
  }

  private async enhanceWithDetails(
    responsibilities: string[],
    targetKeywords: KeywordSet
  ): Promise<string[]> {
    // 增加细节
    return responsibilities.map(resp => {
      if (resp.length < 20) {
        return `${resp}，确保项目按时高质量交付`;
      }
      return resp;
    });
  }

  private async addComprehensiveDetails(
    responsibilities: string[],
    targetKeywords: KeywordSet
  ): Promise<string[]> {
    // 添加全面细节
    return responsibilities.map(resp => {
      const detail = [
        '并与团队紧密协作',
        '持续优化流程和方法',
        '确保最佳实践的实施'
      ][Math.floor(Math.random() * 3)];

      return `${resp}，${detail}`;
    });
  }

  private async generateKeywordSummary(
    resume: OptimizedResume,
    targetKeywords: KeywordSet
  ): Promise<KeywordSummary> {
    const totalKeywords = Object.values(targetKeywords).flat().length;
    const resumeKeywords = this.extractResumeKeywords(resume);

    const matched = this.findMatchedKeywords(resumeKeywords, targetKeywords);
    const missing = this.findMissingKeywords(targetKeywords, matched);

    return {
      totalKeywords,
      matchedKeywords: matched,
      missingKeywords: missing,
      densityScore: this.calculateDensityScore(resume, targetKeywords),
      recommendations: this.generateKeywordRecommendations(missing, matched)
    };
  }

  private extractResumeKeywords(resume: OptimizedResume): string[] {
    const keywords = new Set<string>();

    // 从各个部分提取关键词
    if (resume.skills?.technical) {
      resume.skills.technical.forEach((cat: any) => {
        cat.skills.forEach((skill: any) => keywords.add(skill.name));
      });
    }

    if (resume.experience) {
      resume.experience.forEach(exp => {
        exp.responsibilities.forEach((resp: string) => {
          const words = resp.split(/\s+/);
          words.forEach(word => {
            if (word.length > 3) keywords.add(word);
          });
        });
      });
    }

    return Array.from(keywords);
  }

  private findMatchedKeywords(
    resumeKeywords: string[],
    targetKeywords: KeywordSet
  ): string[] {
    const matched = new Set<string>();

    Object.values(targetKeywords).flat().forEach(target => {
      if (resumeKeywords.some(resume =>
        resume.toLowerCase().includes(target.toLowerCase()) ||
        target.toLowerCase().includes(resume.toLowerCase())
      )) {
        matched.add(target);
      }
    });

    return Array.from(matched);
  }

  private findMissingKeywords(
    targetKeywords: KeywordSet,
    matched: string[]
  ): string[] {
    const allTarget = Object.values(targetKeywords).flat();
    return allTarget.filter(keyword => !matched.includes(keyword));
  }

  private calculateDensityScore(
    resume: OptimizedResume,
    targetKeywords: KeywordSet
  ): number {
    const totalWords = this.countWords(resume);
    const matchedKeywords = this.findMatchedKeywords(
      this.extractResumeKeywords(resume),
      targetKeywords
    );

    // 理想密度是3-5%
    const density = (matchedKeywords.length / totalWords) * 100;
    if (density >= 3 && density <= 5) return 100;
    if (density < 3) return Math.round((density / 3) * 100);
    return Math.round((5 / density) * 100);
  }

  private countWords(resume: OptimizedResume): number {
    const text = JSON.stringify(resume);
    return text.split(/\s+/).length;
  }

  private generateKeywordRecommendations(
    missing: string[],
    matched: string[]
  ): string[] {
    const recommendations = [];

    if (missing.length > 0) {
      recommendations.push(`建议添加以下关键词：${missing.slice(0, 5).join('、')}`);
    }

    if (matched.length < 10) {
      recommendations.push('关键词数量偏少，建议增加更多相关技能和经验描述');
    }

    return recommendations;
  }

  private generateKeywordSuggestions(
    resume: ParsedResume,
    targetKeywords: KeywordSet,
    config: KeywordConfig
  ): any {
    return {
      toAdd: this.findMissingKeywords(targetKeywords, this.extractResumeKeywords(resume)),
      toEmphasize: this.findKeywordsToEmphasize(resume, targetKeywords),
      distribution: this.suggestKeywordDistribution(targetKeywords, config)
    };
  }

  private findKeywordsToEmphasize(
    resume: ParsedResume,
    targetKeywords: KeywordSet
  ): string[] {
    // 找出需要强调的关键词
    return targetKeywords.technical.filter(keyword => {
      const resumeText = JSON.stringify(resume).toLowerCase();
      return resumeText.includes(keyword.toLowerCase()) &&
             resumeText.split(keyword.toLowerCase()).length <= 2; // 出现次数少
    });
  }

  private suggestKeywordDistribution(
    targetKeywords: KeywordSet,
    config: KeywordConfig
  ): any {
    return {
      summary: targetKeywords.technical.slice(0, 3),
      experience: targetKeywords.technical.slice(3, 8),
      skills: targetKeywords.technical.slice(0, 10),
      projects: targetKeywords.tools.slice(0, 5)
    };
  }

  private async getDefaultKeywords(skills: any): Promise<KeywordSet> {
    return {
      technical: skills.technical || [],
      soft: skills.soft || [],
      tools: skills.tools || [],
      qualifications: [],
      industry: []
    };
  }
}