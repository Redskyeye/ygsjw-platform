---
created: 2025-10-26T08:00:00Z
last_updated: 2025-10-26T08:00:00Z
version: 1.0
author: Claude Code PM System
---

import {
  ParsedResume,
  OptimizedResume,
  EnglishConfig,
  OptimizationMetadata
} from '../../types/optimizer';

/**
 * 英文简历生成器
 * 将中文简历转换为符合西方文化和表达习惯的英文简历
 */
export class EnglishResumeGenerator {
  private actionVerbs = {
    leadership: [
      'Led', 'Managed', 'Directed', 'Supervised', 'Coordinated',
      'Mentored', 'Guided', 'Oversaw', 'Headed', 'Chaired'
    ],
    achievement: [
      'Achieved', 'Delivered', 'Completed', 'Accomplished', 'Secured',
      'Generated', 'Produced', 'Attained', 'Obtained', 'Reached'
    ],
    technical: [
      'Developed', 'Designed', 'Implemented', 'Built', 'Created',
      'Engineered', 'Architected', 'Constructed', 'Programmed', 'Coded'
    ],
    business: [
      'Analyzed', 'Evaluated', 'Assessed', 'Researched', 'Investigated',
      'Identified', 'Discovered', 'Examined', 'Studied', 'Reviewed'
    ],
    improvement: [
      'Improved', 'Enhanced', 'Optimized', 'Streamlined', 'Increased',
      'Reduced', 'Decreased', 'Accelerated', 'Boosted', 'Elevated'
    ]
  };

  private technicalTerms = {
    translations: {
      '前端开发': 'Frontend Development',
      '后端开发': 'Backend Development',
      '全栈开发': 'Full-Stack Development',
      '移动开发': 'Mobile Development',
      '数据分析': 'Data Analysis',
      '人工智能': 'Artificial Intelligence',
      '机器学习': 'Machine Learning',
      '深度学习': 'Deep Learning',
      '云计算': 'Cloud Computing',
      '微服务': 'Microservices',
      '敏捷开发': 'Agile Development',
      '持续集成': 'Continuous Integration',
      '持续部署': 'Continuous Deployment',
      '用户体验': 'User Experience',
      '用户界面': 'User Interface',
      '数据库': 'Database',
      '操作系统': 'Operating System',
      '计算机网络': 'Computer Networks',
      '软件工程': 'Software Engineering'
    }
  };

  private educationLevels = {
    '学士': 'Bachelor',
    '硕士': 'Master',
    '博士': 'PhD',
    '本科': 'Bachelor',
    '研究生': 'Graduate',
    '专科': 'Associate',
    '大专': 'Associate'
  };

  async generateEnglishResume(
    chineseResume: ParsedResume,
    config: EnglishConfig
  ): Promise<OptimizedResume> {
    const optimizedResume: OptimizedResume = {
      ...chineseResume,
      optimization: {
        mode: config.mode,
        appliedStrategies: [],
        score: 0,
        improvements: [],
        timestamp: new Date(),
        config
      }
    };

    // 1. 翻译核心内容
    const translatedData = await this.translateResume(chineseResume, config.translationStyle);
    Object.assign(optimizedResume, translatedData);
    optimizedResume.optimization.appliedStrategies.push('translation');
    optimizedResume.optimization.improvements.push('完成了简历内容的英文翻译');

    // 2. 适配英文表达习惯
    const adaptedData = await this.adaptToEnglishStyle(optimizedResume, config);
    Object.assign(optimizedResume, adaptedData);
    optimizedResume.optimization.appliedStrategies.push('style_adaptation');
    optimizedResume.optimization.improvements.push('适配了英文表达习惯');

    // 3. 优化专业术语
    const optimizedData = await this.optimizeTechnicalTerms(optimizedResume);
    Object.assign(optimizedResume, optimizedData);
    optimizedResume.optimization.appliedStrategies.push('terminology_optimization');
    optimizedResume.optimization.improvements.push('优化了专业术语表达');

    // 4. 调整格式和结构
    const formattedResume = await this.formatForEnglishStandards(optimizedResume, config);
    Object.assign(optimizedResume, formattedResume);
    optimizedResume.optimization.appliedStrategies.push('format_adjustment');

    // 5. 语法和表达优化
    const polishedResume = await this.polishEnglishExpression(optimizedResume, config);
    Object.assign(optimizedResume, polishedResume);
    optimizedResume.optimization.appliedStrategies.push('expression_polish');

    // 6. 添加英文简历特有元素
    await this.addEnglishSpecificElements(optimizedResume, config);
    optimizedResume.optimization.appliedStrategies.push('english_elements');

    // 7. 计算生成分数
    optimizedResume.optimization.score = await this.calculateGenerationScore(
      optimizedResume,
      config
    );

    return optimizedResume;
  }

  private async translateResume(
    resume: ParsedResume,
    style: 'formal' | 'professional' | 'casual'
  ): Promise<Partial<OptimizedResume>> {
    const translated: Partial<OptimizedResume> = {};

    // 翻译个人信息
    if (resume.personalInfo) {
      translated.personalInfo = await this.translatePersonalInfo(resume.personalInfo, style);
    }

    // 翻译工作经历
    if (resume.experience) {
      translated.experience = await Promise.all(
        resume.experience.map(exp => this.translateExperience(exp, style))
      );
    }

    // 翻译项目经验
    if (resume.projects) {
      translated.projects = await Promise.all(
        resume.projects.map(proj => this.translateProject(proj, style))
      );
    }

    // 翻译教育背景
    if (resume.education) {
      translated.education = await Promise.all(
        resume.education.map(edu => this.translateEducation(edu, style))
      );
    }

    // 翻译技能
    if (resume.skills) {
      translated.skills = await this.translateSkills(resume.skills, style);
    }

    // 翻译证书
    if (resume.certificates) {
      translated.certificates = await this.translateCertificates(resume.certificates, style);
    }

    return translated;
  }

  private async adaptToEnglishStyle(
    resume: OptimizedResume,
    config: EnglishConfig
  ): Promise<Partial<OptimizedResume>> {
    const adapted: Partial<OptimizedResume> = {};

    // 调整日期格式
    if (resume.experience) {
      adapted.experience = resume.experience.map(exp => ({
        ...exp,
        duration: this.formatDateForEnglish(exp.duration, config.formatDateStyle),
        responsibilities: await this.convertToActionVerbs(exp.responsibilities),
        achievements: await this.quantifyAchievements(exp.achievements || [])
      }));
    }

    // 优化技能描述
    if (resume.skills) {
      adapted.skills = {
        technical: await this.categorizeSkillsByProficiency(resume.skills.technical || []),
        soft: await this.adaptSoftSkillsForWesternCulture(resume.skills.soft || []),
        languages: this.formatLanguageProficiency(resume.skills.languages || []),
        tools: resume.skills.tools || []
      };
    }

    return adapted;
  }

  private async optimizeTechnicalTerms(
    resume: OptimizedResume
  ): Promise<Partial<OptimizedResume>> {
    const optimized: Partial<OptimizedResume> = {};

    // 优化技能术语
    if (resume.skills?.technical) {
      optimized.skills = {
        ...resume.skills,
        technical: resume.skills.technical.map(skill =>
          this.standardizeTechnicalTerm(skill)
        )
      };
    }

    // 优化项目技术栈
    if (resume.projects) {
      optimized.projects = resume.projects.map(project => ({
        ...project,
        technologies: project.technologies?.map(tech =>
          this.standardizeTechnicalTerm(tech)
        )
      }));
    }

    return optimized;
  }

  private async formatForEnglishStandards(
    resume: OptimizedResume,
    config: EnglishConfig
  ): Promise<Partial<OptimizedResume>> {
    const formatted: Partial<OptimizedResume> = {};

    // 调整个人总结长度
    if (resume.personalInfo?.summary) {
      formatted.personalInfo = {
        ...resume.personalInfo,
        summary: this.adjustSummaryLength(resume.personalInfo.summary)
      };
    }

    // 添加联系方式格式
    if (resume.personalInfo) {
      formatted.personalInfo = {
        ...formatted.personalInfo || resume.personalInfo,
        formattedContact: this.formatContactInfo(resume.personalInfo)
      };
    }

    // 调整教育背景显示
    if (resume.education) {
      formatted.education = resume.education.map(edu => ({
        ...edu,
        degree: this.translateDegree(edu.degree),
        gpa: edu.gpa ? this.formatGPA(edu.gpa) : undefined
      }));
    }

    return formatted;
  }

  private async polishEnglishExpression(
    resume: OptimizedResume,
    config: EnglishConfig
  ): Promise<Partial<OptimizedResume>> {
    const polished: Partial<OptimizedResume> = {};

    // 优化工作描述表达
    if (resume.experience) {
      polished.experience = resume.experience.map(exp => ({
        ...exp,
        responsibilities: await this.enhanceResponsibilityLanguage(
          exp.responsibilities,
          config.translationStyle
        ),
        achievements: await this.enhanceAchievementLanguage(
          exp.achievements || [],
          config.translationStyle
        )
      }));
    }

    // 优化项目描述
    if (resume.projects) {
      polished.projects = resume.projects.map(project => ({
        ...project,
        description: await this.enhanceProjectDescription(
          project.description,
          config.translationStyle
        )
      }));
    }

    return polished;
  }

  private async addEnglishSpecificElements(
    resume: OptimizedResume,
    config: EnglishConfig
  ): Promise<void> {
    // 添加LinkedIn
    if (!resume.personalInfo.linkedin && config.adaptToWesternCulture) {
      resume.personalInfo.linkedin = 'LinkedIn URL (Optional)';
    }

    // 添加Portfolio
    if (!resume.personalInfo.portfolio && config.adaptToWesternCulture) {
      resume.personalInfo.portfolio = 'Portfolio URL (Optional)';
    }

    // 添加英文特有的技能分类
    if (!resume.skills.interpersonal) {
      resume.skills.interpersonal = [
        'Cross-cultural Communication',
        'Team Collaboration',
        'Problem-Solving'
      ];
    }

    // 添加参考信息
    if (!resume.references) {
      resume.references = {
        available: true,
        note: 'Available upon request'
      };
    }
  }

  private async translatePersonalInfo(
    personalInfo: any,
    style: 'formal' | 'professional' | 'casual'
  ): Promise<any> {
    return {
      ...personalInfo,
      name: this.translateName(personalInfo.name),
      title: this.translateTitle(personalInfo.title, style),
      summary: await this.translateText(personalInfo.summary || '', style)
    };
  }

  private translateName(name: string): string {
    // 保持中文名或使用拼音
    return name;
  }

  private translateTitle(title: string, style: 'formal' | 'professional' | 'casual'): string {
    const translations = {
      '软件工程师': 'Software Engineer',
      '高级工程师': 'Senior Software Engineer',
      '技术经理': 'Technical Manager',
      '项目经理': 'Project Manager',
      '产品经理': 'Product Manager',
      '数据分析师': 'Data Analyst',
      '前端开发工程师': 'Frontend Developer',
      '全栈工程师': 'Full-Stack Developer',
      '架构师': 'Architect'
    };

    return translations[title] || title;
  }

  private async translateExperience(
    experience: any,
    style: 'formal' | 'professional' | 'casual'
  ): Promise<any> {
    return {
      ...experience,
      company: this.translateCompany(experience.company),
      position: this.translateTitle(experience.position, style),
      responsibilities: await Promise.all(
        experience.responsibilities.map((resp: string) =>
          this.translateText(resp, style)
        )
      ),
      achievements: await Promise.all(
        (experience.achievements || []).map((ach: string) =>
          this.translateText(ach, style)
        )
      )
    };
  }

  private translateCompany(company: string): string {
    // 保持公司原名或添加英文翻译
    return company;
  }

  private async translateProject(
    project: any,
    style: 'formal' | 'professional' | 'casual'
  ): Promise<any> {
    return {
      ...project,
      name: await this.translateText(project.name, style),
      description: await this.translateText(project.description, style),
      responsibilities: project.responsibilities
        ? await Promise.all(
            project.responsibilities.map((resp: string) =>
              this.translateText(resp, style)
            )
          )
        : undefined
    };
  }

  private async translateEducation(
    education: any,
    style: 'formal' | 'professional' | 'casual'
  ): Promise<any> {
    return {
      ...education,
      school: education.school, // 保持原名
      degree: this.translateDegree(education.degree),
      major: await this.translateText(education.major, style),
      description: await this.translateText(education.description, style)
    };
  }

  private translateDegree(degree: string): string {
    for (const [chinese, english] of Object.entries(this.educationLevels)) {
      if (degree.includes(chinese)) {
        return degree.replace(chinese, english);
      }
    }
    return degree;
  }

  private async translateSkills(
    skills: any,
    style: 'formal' | 'professional' | 'casual'
  ): Promise<any> {
    return {
      technical: await Promise.all(
        (skills.technical || []).map((skill: string) =>
          this.translateTechnicalTerm(skill)
        )
      ),
      soft: await Promise.all(
        (skills.soft || []).map((skill: string) =>
          this.translateSoftSkill(skill)
        )
      ),
      languages: this.formatLanguageProficiency(skills.languages || []),
      tools: skills.tools || []
    };
  }

  private async translateCertificates(
    certificates: any[],
    style: 'formal' | 'professional' | 'casual'
  ): Promise<any[]> {
    return certificates.map(cert => ({
      ...cert,
      name: this.translateCertificateName(cert.name),
      issuer: cert.issuer // 保持原名
    }));
  }

  private translateCertificateName(name: string): string {
    const translations = {
      '大学英语四级': 'CET-4',
      '大学英语六级': 'CET-6',
      '计算机等级考试': 'NCRE',
      '软件设计师': 'Software Designer',
      '系统架构设计师': 'System Architect Designer'
    };

    return translations[name] || name;
  }

  private async translateText(
    text: string,
    style: 'formal' | 'professional' | 'casual'
  ): Promise<string> {
    // 简化实现，实际应该使用翻译API
    let translated = text;

    // 翻译技术术语
    Object.entries(this.technicalTerms.translations).forEach(([chinese, english]) => {
      translated = translated.replace(new RegExp(chinese, 'g'), english);
    });

    // 根据风格调整
    switch (style) {
      case 'formal':
        translated = translated.replace(/负责/g, 'Responsible for');
        translated = translated.replace(/参与/g, 'Participated in');
        break;
      case 'professional':
        translated = translated.replace(/负责/g, 'Managed');
        translated = translated.replace(/参与/g, 'Contributed to');
        break;
      case 'casual':
        translated = translated.replace(/负责/g, 'Worked on');
        translated = translated.replace(/参与/g, 'Helped with');
        break;
    }

    return translated;
  }

  private formatDateForEnglish(
    dateStr: string,
    format: 'mm/dd/yyyy' | 'Month Year' | 'YYYY'
  ): string {
    // 解析中文日期
    const match = dateStr.match(/(\d{4})年(\d{1,2})月/);
    if (!match) return dateStr;

    const year = match[1];
    const month = match[2];

    switch (format) {
      case 'mm/dd/yyyy':
        return `${month}/01/${year}`;
      case 'Month Year':
        const monthNames = [
          'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
          'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
        ];
        return `${monthNames[parseInt(month) - 1]} ${year}`;
      case 'YYYY':
        return year;
      default:
        return `${month}/${year}`;
    }
  }

  private async convertToActionVerbs(responsibilities: string[]): Promise<string[]> {
    return responsibilities.map(resp => {
      // 转换为英文动词开头
      let converted = resp;

      // 替换常见的中文表达
      if (converted.startsWith('负责')) {
        converted = converted.replace('负责', 'Managed');
      } else if (converted.startsWith('参与')) {
        converted = converted.replace('参与', 'Participated in');
      } else if (converted.startsWith('开发')) {
        converted = converted.replace('开发', 'Developed');
      } else if (converted.startsWith('设计')) {
        converted = converted.replace('设计', 'Designed');
      } else {
        converted = `• ${converted}`;
      }

      return converted;
    });
  }

  private async quantifyAchievements(achievements: string[]): Promise<string[]> {
    return achievements.map(ach => {
      // 尝试量化成就
      let quantified = ach;

      // 添加数字指标
      if (!/\d+/.test(quantified)) {
        quantified = `Resulted in ${quantified}`;
      }

      return quantified;
    });
  }

  private async categorizeSkillsByProficiency(skills: string[]): Promise<any[]> {
    return skills.map(skill => ({
      name: skill,
      proficiency: this.assessProficiency(skill),
      category: this.categorizeSkill(skill)
    }));
  }

  private assessProficiency(skill: string): 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert' {
    const advancedSkills = ['AWS', 'Kubernetes', 'TensorFlow', 'PyTorch'];
    if (advancedSkills.includes(skill)) return 'Advanced';
    return 'Intermediate';
  }

  private categorizeSkill(skill: string): string {
    const categories = {
      'Languages': ['JavaScript', 'Python', 'Java', 'C++', 'TypeScript'],
      'Frameworks': ['React', 'Vue', 'Angular', 'Django', 'Spring'],
      'Databases': ['MySQL', 'PostgreSQL', 'MongoDB', 'Redis'],
      'Cloud': ['AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes'],
      'Tools': ['Git', 'Jenkins', 'Webpack', 'Linux']
    };

    for (const [category, items] of Object.entries(categories)) {
      if (items.some(item => skill.includes(item))) {
        return category;
      }
    }

    return 'Other';
  }

  private async adaptSoftSkillsForWesternCulture(skills: string[]): Promise<string[]> {
    const adaptations = {
      '团队合作': 'Teamwork',
      '沟通能力': 'Communication Skills',
      '学习能力': 'Quick Learner',
      '责任心': 'Responsible',
      '积极主动': 'Proactive',
      '创新思维': 'Creative Thinking',
      '解决问题': 'Problem-Solving',
      '抗压能力': 'Work Well Under Pressure'
    };

    return skills.map(skill => adaptations[skill] || skill);
  }

  private formatLanguageProficiency(languages: any[]): any[] {
    return languages.map(lang => ({
      ...lang,
      proficiency: this.translateProficiency(lang.proficiency)
    }));
  }

  private translateProficiency(proficiency: string): string {
    const translations = {
      '母语': 'Native',
      '精通': 'Fluent',
      '熟练': 'Proficient',
      '良好': 'Good',
      '一般': 'Basic'
    };

    return translations[proficiency] || proficiency;
  }

  private standardizeTechnicalTerm(term: string): string {
    // 标准化技术术语
    const standardizations = {
      'js': 'JavaScript',
      'ts': 'TypeScript',
      'node': 'Node.js',
      'reactjs': 'React',
      'vuejs': 'Vue',
      'mysql': 'MySQL',
      'postgresql': 'PostgreSQL'
    };

    const lower = term.toLowerCase();
    return standardizations[lower] || term;
  }

  private adjustSummaryLength(summary: string): string {
    // 英文简历总结通常2-4句
    const sentences = summary.split(/[.!?]/).filter(s => s.trim());
    if (sentences.length > 4) {
      return sentences.slice(0, 4).join('. ') + '.';
    }
    return summary;
  }

  private formatContactInfo(personalInfo: any): any {
    return {
      email: personalInfo.email,
      phone: this.formatPhoneNumber(personalInfo.phone),
      location: personalInfo.location,
      linkedin: personalInfo.linkedin,
      portfolio: personalInfo.portfolio
    };
  }

  private formatPhoneNumber(phone: string): string {
    // 简化实现
    return phone;
  }

  private formatGPA(gpa: string): string {
    // 转换为4.0制
    const match = gpa.match(/(\d+\.?\d*)/);
    if (match) {
      const value = parseFloat(match[1]);
      if (value > 4) {
        return (value / 5 * 4).toFixed(2) + '/4.0';
      }
      return `${value}/4.0`;
    }
    return gpa;
  }

  private translateTechnicalTerm(term: string): string {
    return this.technicalTerms.translations[term] || term;
  }

  private translateSoftSkill(skill: string): string {
    const translations = {
      '领导力': 'Leadership',
      '沟通': 'Communication',
      '协作': 'Collaboration',
      '创新': 'Innovation',
      '分析': 'Analytical Skills'
    };

    return translations[skill] || skill;
  }

  private async enhanceResponsibilityLanguage(
    responsibilities: string[],
    style: 'formal' | 'professional' | 'casual'
  ): Promise<string[]> {
    return responsibilities.map(resp => {
      // 增强表达
      if (!resp.startsWith('•') && !resp.match(/^[A-Z][a-z]/)) {
        resp = `• ${resp}`;
      }

      // 确保使用过去时态
      if (!resp.match(/\b(ed|d)\b/)) {
        resp = resp.replace(/\b(\w+)(?=[^e]|e$)/g, '$1ed');
      }

      return resp;
    });
  }

  private async enhanceAchievementLanguage(
    achievements: string[],
    style: 'formal' | 'professional' | 'casual'
  ): Promise<string[]> {
    return achievements.map(ach => {
      // 增强成就表达
      if (!ach.includes('%') && !ach.includes('$')) {
        ach = `• ${ach}`;
      }
      return ach;
    });
  }

  private async enhanceProjectDescription(
    description: string,
    style: 'formal' | 'professional' | 'casual'
  ): Promise<string> {
    // 增强项目描述
    return description;
  }

  private async calculateGenerationScore(
    resume: OptimizedResume,
    config: EnglishConfig
  ): Promise<number> {
    let score = 60;

    // 检查完整性
    if (resume.personalInfo?.summary) score += 10;
    if (resume.experience?.length > 0) score += 10;
    if (resume.skills?.technical?.length > 0) score += 10;
    if (resume.education?.length > 0) score += 10;

    return Math.min(score, 100);
  }
}