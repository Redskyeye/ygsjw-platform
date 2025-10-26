---
created: 2025-10-26T08:00:00Z
last_updated: 2025-10-26T08:00:00Z
version: 1.0
author: Claude Code PM System
---

import {
  ParsedResume,
  OptimizedResume,
  FreshGraduateConfig,
  EnhancedEducation,
  EnhancedProject,
  EnhancedSkill,
  OptimizationMetadata
} from '../../types/optimizer';

/**
 * 应届生优化器
 * 专门为应届生设计的简历优化策略
 */
export class FreshGraduateOptimizer {
  private relevantCourses = {
    '计算机科学': [
      '数据结构与算法', '操作系统', '计算机网络', '数据库系统',
      '软件工程', '编译原理', '人工智能', '机器学习'
    ],
    '软件工程': [
      '软件项目管理', '软件测试', '需求工程', '系统分析与设计',
      '敏捷开发', 'DevOps实践', '持续集成', '代码质量'
    ],
    '数据科学': [
      '统计学', '数据分析', '数据挖掘', '大数据技术',
      'Python编程', 'R语言', 'SQL', '数据可视化'
    ]
  };

  private projectKeywords = {
    '前端开发': ['React', 'Vue', 'Angular', 'TypeScript', 'Webpack', 'CSS3', 'HTML5'],
    '后端开发': ['Node.js', 'Spring Boot', 'Django', 'Flask', 'Express', 'RESTful API'],
    '全栈开发': ['MERN', 'MEAN', 'LAMP', '前后端分离', '微服务'],
    '移动开发': ['iOS', 'Android', 'React Native', 'Flutter', 'Swift', 'Kotlin'],
    '人工智能': ['机器学习', '深度学习', 'TensorFlow', 'PyTorch', 'NLP', 'CV'],
    '数据分析': ['Python', 'Pandas', 'NumPy', 'Excel', 'Tableau', 'Power BI']
  };

  async optimizeResume(
    resume: ParsedResume,
    config: FreshGraduateConfig
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

    // 1. 优化教育背景（突出显示）
    if (resume.education && resume.education.length > 0) {
      optimizedResume.education = await this.optimizeEducation(
        resume.education,
        config
      );
      optimizedResume.optimization.improvements.push('优化了教育背景展示');
      optimizedResume.optimization.appliedStrategies.push('education_focus');
    }

    // 2. 优化项目经验（重点突出）
    if (resume.projects && resume.projects.length > 0) {
      optimizedResume.projects = await this.optimizeProjects(
        resume.projects,
        config
      );
      optimizedResume.optimization.improvements.push('突出了项目经验');
      optimizedResume.optimization.appliedStrategies.push('project_emphasis');
    }

    // 3. 优化技能展示
    if (resume.skills) {
      optimizedResume.skills = await this.optimizeSkills(
        resume.skills,
        config
      );
      optimizedResume.optimization.improvements.push('优化了技能分类');
      optimizedResume.optimization.appliedStrategies.push('skill_highlighting');
    }

    // 4. 优化实习/工作经历
    if (resume.experience && resume.experience.length > 0) {
      optimizedResume.experience = await this.optimizeExperience(
        resume.experience,
        config
      );
      optimizedResume.optimization.improvements.push('优化了实习经历');
      optimizedResume.optimization.appliedStrategies.push('internship_focus');
    }

    // 5. 生成或优化个人总结
    optimizedResume.personalInfo = await this.generateOrOptimizeSummary(
      resume.personalInfo || {},
      resume,
      config
    );
    optimizedResume.optimization.improvements.push('生成了专业的个人总结');
    optimizedResume.optimization.appliedStrategies.push('summary_generation');

    // 6. 优化证书和奖项
    if (resume.certificates || resume.awards) {
      optimizedResume.certificates = await this.optimizeCertificates(
        resume.certificates || [],
        config
      );
      optimizedResume.awards = await this.optimizeAwards(
        resume.awards || [],
        config
      );
      optimizedResume.optimization.improvements.push('优化了证书和奖项展示');
    }

    // 7. 计算优化分数
    optimizedResume.optimization.score = await this.calculateOptimizationScore(
      optimizedResume,
      config
    );

    return optimizedResume;
  }

  private async optimizeEducation(
    education: any[],
    config: FreshGraduateConfig
  ): Promise<EnhancedEducation[]> {
    return education.map(edu => {
      const enhanced: EnhancedEducation = { ...edu };

      // 1. 添加相关课程
      if (config.includeRelevantCourses) {
        enhanced.relevantCourses = this.extractRelevantCourses(edu);
      }

      // 2. 突出学术成就
      enhanced.achievements = this.identifyAcademicAchievements(edu);

      // 3. GPA高亮
      if (config.showGPA && edu.gpa) {
        enhanced.gpaHighlight = this.highlightGPA(edu.gpa);
      }

      // 4. 提取领导经历
      enhanced.leadership = this.extractLeadershipRoles(edu);

      // 5. 荣誉和奖项
      enhanced.honors = this.extractHonors(edu);

      return enhanced;
    });
  }

  private async optimizeProjects(
    projects: any[],
    config: FreshGraduateConfig
  ): Promise<EnhancedProject[]> {
    // 按相关性排序
    const sortedProjects = this.sortProjectsByRelevance(projects, config);

    return sortedProjects.map((project, index) => {
      const enhanced: EnhancedProject = { ...project };

      // 1. 增强项目描述
      enhanced.description = this.enhanceProjectDescription(project, config);

      // 2. 技术栈优化
      enhanced.technologies = this.categorizeTechnologies(project.technologies || []);

      // 3. 量化项目影响
      enhanced.impact = this.quantifyProjectImpact(project);

      // 4. 学习成果
      enhanced.learningOutcomes = this.extractLearningOutcomes(project);

      // 5. 挑战和解决方案
      enhanced.challenges = this.identifyChallenges(project);

      return enhanced;
    });
  }

  private async optimizeSkills(
    skills: any,
    config: FreshGraduateConfig
  ): Promise<any> {
    const optimized = { ...skills };

    // 1. 技能优先级排序
    if (optimized.technical) {
      optimized.technical = this.prioritizeSkills(
        optimized.technical,
        config.emphasisSkills
      );
    }

    // 2. 技能分类展示
    optimized.technical = this.categorizeTechnicalSkills(optimized.technical || []);

    // 3. 添加熟练度
    if (optimized.technical) {
      optimized.technical = optimized.technical.map((skill: string) => ({
        name: skill,
        level: this.assessSkillLevel(skill),
        category: this.categorizeSkill(skill),
        projects: this.findRelatedProjects(skill, [])
      }));
    }

    // 4. 软技能优化
    if (optimized.soft) {
      optimized.soft = this.optimizeSoftSkills(optimized.soft);
    }

    return optimized;
  }

  private async optimizeExperience(
    experience: any[],
    config: FreshGraduateConfig
  ): Promise<any[]> {
    return experience.map(exp => {
      const optimized = { ...exp };

      // 1. 突出实习性质
      if (config.focusInternships) {
        optimized.position = this.highlightInternshipNature(exp.position);
      }

      // 2. 优化职责描述
      optimized.responsibilities = this.enhanceResponsibilities(
        exp.responsibilities,
        config
      );

      // 3. 强调学习和成长
      optimized.achievements = this.emphasizeLearning(exp.achievements || []);

      return optimized;
    });
  }

  private async generateOrOptimizeSummary(
    personalInfo: any,
    resume: ParsedResume,
    config: FreshGraduateConfig
  ): Promise<any> {
    const summary = await this.generateSummary(resume, config);
    return {
      ...personalInfo,
      summary
    };
  }

  private async generateSummary(
    resume: ParsedResume,
    config: FreshGraduateConfig
  ): Promise<string> {
    // 提取关键信息
    const education = resume.education?.[0];
    const keySkills = resume.skills?.technical?.slice(0, 5) || [];
    const topProjects = resume.projects?.slice(0, 2) || [];

    // 构建总结
    const summary = `
      ${education?.degree ? education.degree + '毕业生' : '应届毕业生'}，
      擅长${keySkills.join('、')}等技术。
      ${topProjects.length > 0 ? `参与过${topProjects.length}个重要项目，` : ''}
      具备良好的学习能力和团队协作精神。
      ${config.targetRole ? `期望在${config.targetRole}领域发挥所学，` : ''}
      为公司创造价值。
    `.replace(/\s+/g, ' ').trim();

    return summary;
  }

  private async optimizeCertificates(
    certificates: any[],
    config: FreshGraduateConfig
  ): Promise<any[]> {
    return certificates.map(cert => ({
      ...cert,
      relevance: this.assessCertificateRelevance(cert, config),
      displayPriority: this.calculateCertificatePriority(cert)
    })).sort((a, b) => b.displayPriority - a.displayPriority);
  }

  private async optimizeAwards(
    awards: any[],
    config: FreshGraduateConfig
  ): Promise<any[]> {
    return awards.map(award => ({
      ...award,
      category: this.categorizeAward(award),
      significance: this.assessAwardSignificance(award)
    })).sort((a, b) => b.significance - a.significance);
  }

  private extractRelevantCourses(edu: any): string[] {
    const major = edu.major || '';
    const courses: string[] = [];

    // 根据专业提取相关课程
    Object.entries(this.relevantCourses).forEach(([field, courseList]) => {
      if (major.includes(field)) {
        courses.push(...courseList);
      }
    });

    return courses.slice(0, 8); // 最多显示8门
  }

  private identifyAcademicAchievements(edu: any): string[] {
    const achievements: string[] = [];

    if (edu.gpa && edu.gpa >= 3.5) {
      achievements.push(`GPA ${edu.gpa}（成绩优异）`);
    }

    if (edu.rank && edu.rank <= '10%') {
      achievements.push(`专业排名前${edu.rank}`);
    }

    if (edu.scholarship) {
      achievements.push(`获得${edu.scholarship}奖学金`);
    }

    return achievements;
  }

  private highlightGPA(gpa: number): string {
    if (gpa >= 3.8) return `${gpa}/4.0（优秀）`;
    if (gpa >= 3.5) return `${gpa}/4.0（良好）`;
    return `${gpa}/4.0`;
  }

  private extractLeadershipRoles(edu: any): string[] {
    const roles: string[] = [];

    // 社团经历
    if (edu.clubs) {
      edu.clubs.forEach((club: any) => {
        if (club.position && club.position !== '成员') {
          roles.push(`${club.name} ${club.position}`);
        }
      });
    }

    // 班干部
    if (edu.classPosition) {
      roles.push(edu.classPosition);
    }

    return roles;
  }

  private extractHonors(edu: any): string[] {
    const honors: string[] = [];

    if (edu.honors) {
      honors.push(...edu.honors);
    }

    // 三好学生、优秀毕业生等
    if (edu.meritStudent) {
      honors.push('三好学生');
    }

    if (edu.outstandingGraduate) {
      honors.push('优秀毕业生');
    }

    return honors;
  }

  private sortProjectsByRelevance(projects: any[], config: FreshGraduateConfig): any[] {
    return projects.sort((a, b) => {
      const scoreA = this.calculateProjectRelevance(a, config);
      const scoreB = this.calculateProjectRelevance(b, config);
      return scoreB - scoreA;
    });
  }

  private calculateProjectRelevance(project: any, config: FreshGraduateConfig): number {
    let score = 0;

    // 技术匹配度
    if (project.technologies) {
      project.technologies.forEach((tech: string) => {
        if (config.emphasisSkills.includes(tech)) {
          score += 10;
        }
      });
    }

    // 项目复杂度
    if (project.description && project.description.length > 100) {
      score += 5;
    }

    // 团队协作
    if (project.teamSize && project.teamSize > 1) {
      score += 3;
    }

    // 时间长度
    if (project.duration) {
      const months = this.parseMonths(project.duration);
      score += Math.min(months, 10);
    }

    return score;
  }

  private enhanceProjectDescription(project: any, config: FreshGraduateConfig): string {
    let description = project.description || '';

    // 添加技术关键词
    if (project.technologies && project.technologies.length > 0) {
      description += `\n使用技术：${project.technologies.join('、')}`;
    }

    // 添加项目成果
    if (project.achievements && project.achievements.length > 0) {
      description += `\n主要成果：${project.achievements[0]}`;
    }

    return description;
  }

  private categorizeTechnologies(technologies: string[]): EnhancedSkill[] {
    return technologies.map(tech => ({
      name: tech,
      level: this.assessSkillLevel(tech),
      category: this.categorizeSkill(tech),
      yearsOfExperience: 0,
      certified: false
    }));
  }

  private quantifyProjectImpact(project: any): string {
    // 尝试从描述中提取量化信息
    if (project.description) {
      const metrics = project.description.match(/\d+/g);
      if (metrics && metrics.length > 0) {
        return `项目涉及${metrics[0]}个模块/功能`;
      }
    }

    return '项目提升了技术实践能力和团队协作经验';
  }

  private extractLearningOutcomes(project: any): string[] {
    const outcomes: string[] = [];

    // 技术收获
    if (project.technologies) {
      outcomes.push(`掌握了${project.technologies.join('、')}等技术的应用`);
    }

    // 能力提升
    outcomes.push('提升了解决问题的能力');
    if (project.teamSize && project.teamSize > 1) {
      outcomes.push('增强了团队协作能力');
    }

    return outcomes;
  }

  private identifyChallenges(project: any): string[] {
    return [
      '技术选型与实现',
      '项目时间管理',
      '团队沟通协调'
    ].slice(0, 2);
  }

  private prioritizeSkills(skills: string[], emphasis: string[]): string[] {
    return skills.sort((a, b) => {
      const aEmphasized = emphasis.includes(a);
      const bEmphasized = emphasis.includes(b);

      if (aEmphasized && !bEmphasized) return -1;
      if (!aEmphasized && bEmphasized) return 1;
      return 0;
    });
  }

  private categorizeTechnicalSkills(skills: string[]): EnhancedSkill[] {
    return skills.map(skill => ({
      name: skill,
      level: this.assessSkillLevel(skill),
      category: this.categorizeSkill(skill),
      yearsOfExperience: 0,
      certified: false,
      lastUsed: new Date()
    }));
  }

  private assessSkillLevel(skill: string): 'beginner' | 'intermediate' | 'advanced' | 'expert' {
    // 简化实现，实际应该根据项目经验评估
    const commonSkills = ['JavaScript', 'Python', 'Java', 'C++'];
    const advancedSkills = ['TensorFlow', 'PyTorch', 'Kubernetes', 'Docker'];

    if (advancedSkills.includes(skill)) return 'intermediate';
    if (commonSkills.includes(skill)) return 'intermediate';
    return 'beginner';
  }

  private categorizeSkill(skill: string): string {
    const categories = {
      'frontend': ['React', 'Vue', 'Angular', 'HTML', 'CSS', 'JavaScript', 'TypeScript'],
      'backend': ['Node.js', 'Python', 'Java', 'Spring', 'Express', 'Django', 'Flask'],
      'database': ['MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'SQL'],
      'mobile': ['iOS', 'Android', 'React Native', 'Flutter', 'Swift', 'Kotlin'],
      'ai': ['TensorFlow', 'PyTorch', 'Scikit-learn', '机器学习', '深度学习'],
      'tools': ['Git', 'Docker', 'Kubernetes', 'Jenkins', 'Linux']
    };

    for (const [category, skills] of Object.entries(categories)) {
      if (skills.some(s => skill.toLowerCase().includes(s.toLowerCase()))) {
        return category;
      }
    }

    return 'other';
  }

  private findRelatedProjects(skill: string, projects: any[]): string[] {
    return projects
      .filter(p => p.technologies?.includes(skill))
      .map(p => p.name)
      .slice(0, 3);
  }

  private optimizeSoftSkills(skills: string[]): string[] {
    const prioritizedSkills = [
      '学习能力', '团队协作', '沟通能力', '解决问题',
      '创新思维', '责任心', '执行力', '适应能力'
    ];

    return prioritizedSkills.filter(skill => skills.includes(skill)).slice(0, 5);
  }

  private highlightInternshipNature(position: string): string {
    if (!position.includes('实习')) {
      return `${position}（实习）`;
    }
    return position;
  }

  private enhanceResponsibilities(
    responsibilities: string[],
    config: FreshGraduateConfig
  ): string[] {
    return responsibilities.map(resp => {
      // 添加学习和成长元素
      if (!resp.includes('学习') && !resp.includes('掌握')) {
        return `${resp}，在实践中学习和成长`;
      }
      return resp;
    });
  }

  private emphasizeLearning(achievements: string[]): string[] {
    return achievements.map(ach => {
      if (!ach.includes('学习') && !ach.includes('提升')) {
        return `${ach}，提升了专业技能`;
      }
      return ach;
    });
  }

  private assessCertificateRelevance(cert: any, config: FreshGraduateConfig): number {
    let relevance = 5;

    // 根据目标职位评估相关性
    if (config.targetRole) {
      if (cert.name?.includes(config.targetRole)) {
        relevance += 10;
      }
    }

    // 根据技能相关性
    if (cert.skills) {
      cert.skills.forEach((skill: string) => {
        if (config.emphasisSkills.includes(skill)) {
          relevance += 5;
        }
      });
    }

    return relevance;
  }

  private calculateCertificatePriority(cert: any): number {
    let priority = 5;

    // 国际认证优先
    if (cert.name?.includes('AWS') || cert.name?.includes('Microsoft')) {
      priority += 10;
    }

    // 权威机构认证
    if (cert.issuer?.includes('教育部') || cert.issuer?.includes('工信部')) {
      priority += 8;
    }

    return priority;
  }

  private categorizeAward(award: any): string {
    if (award.name?.includes('奖学金')) return 'scholarship';
    if (award.name?.includes('竞赛')) return 'competition';
    if (award.name?.includes('优秀')) return 'excellence';
    return 'other';
  }

  private assessAwardSignificance(award: any): number {
    let significance = 5;

    // 国家级奖项
    if (award.level === '国家级') significance += 20;
    // 省级奖项
    if (award.level === '省级') significance += 15;
    // 校级奖项
    if (award.level === '校级') significance += 10;

    return significance;
  }

  private parseMonths(duration: string): number {
    const match = duration.match(/(\d+)/g);
    if (!match) return 0;
    return parseInt(match[0]);
  }

  private async calculateOptimizationScore(
    resume: OptimizedResume,
    config: FreshGraduateConfig
  ): Promise<number> {
    let score = 50; // 基础分

    // 教育背景优化
    if (resume.education && resume.education.length > 0) {
      score += 15;
    }

    // 项目经验
    if (resume.projects && resume.projects.length >= 2) {
      score += 15;
    }

    // 技能展示
    if (resume.skills && resume.skills.technical && resume.skills.technical.length >= 5) {
      score += 10;
    }

    // 个人总结
    if (resume.personalInfo?.summary && resume.personalInfo.summary.length > 50) {
      score += 10;
    }

    return Math.min(score, 100);
  }
}