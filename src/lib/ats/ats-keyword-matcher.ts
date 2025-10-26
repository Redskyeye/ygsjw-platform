---
created: 2025-10-26T08:00:00Z
last_updated: 2025-10-26T08:00:00Z
version: 1.0
author: Claude Code PM System
---

import { JobDescription, KeywordSet, KeywordDensity, ParsedResume } from '../../types/optimizer';

/**
 * ATS关键词匹配器 - 分析和优化关键词匹配度
 */
export class ATSKeywordMatcher {
  private synonyms = {
    // 技能同义词库
    technical: {
      'JavaScript': ['JS', 'ECMAScript', 'ES6', 'ES2020'],
      'Python': ['Python3', 'Py', 'Django', 'Flask'],
      'React': ['ReactJS', 'React.js', 'Next.js', 'React Native'],
      'Node.js': ['Node', 'NodeJS', 'Express', 'NestJS'],
      'SQL': ['MySQL', 'PostgreSQL', 'MongoDB', 'NoSQL', 'Database'],
      'AWS': ['Amazon Web Services', 'EC2', 'S3', 'Lambda', 'Cloud'],
      'Docker': ['Container', 'Kubernetes', 'K8s', 'CI/CD'],
      'Git': ['Version Control', 'GitHub', 'GitLab', 'Bitbucket']
    },
    soft: {
      'leadership': ['lead', 'manage', 'supervise', 'mentor', 'guide'],
      'communication': ['present', 'negotiate', 'collaborate', 'coordinate'],
      'problem solving': ['analyze', 'troubleshoot', 'debug', 'optimize'],
      'teamwork': ['collaborate', 'cooperate', 'partner', 'joint'],
      'project management': ['plan', 'schedule', 'coordinate', 'organize']
    }
  };

  private stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should',
    'could', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those'
  ]);

  async extractKeywordsFromJob(job: JobDescription): Promise<KeywordSet> {
    const keywords: KeywordSet = {
      technical: [],
      soft: [],
      tools: [],
      qualifications: [],
      industry: []
    };

    // 1. 从明确列出的技能中提取
    keywords.technical = [...new Set(job.skills.technical)];
    keywords.soft = [...new Set(job.skills.soft)];

    // 2. 从描述文本中提取关键词
    const descriptionText = `
      ${job.title} ${job.description} ${job.requirements.join(' ')}
      ${job.qualifications.join(' ')}
    `.toLowerCase();

    // 3. 提取技术关键词
    keywords.technical.push(...this.extractTechnicalKeywords(descriptionText));

    // 4. 提取工具关键词
    keywords.tools.push(...this.extractToolKeywords(descriptionText));

    // 5. 提取资格要求
    keywords.qualifications.push(...this.extractQualificationKeywords(job));

    // 6. 提取行业关键词
    keywords.industry.push(...this.extractIndustryKeywords(job));

    // 7. 去重并排序
    Object.keys(keywords).forEach(key => {
      keywords[key as keyof KeywordSet] = [...new Set(keywords[key as keyof KeywordSet])];
    });

    return keywords;
  }

  async analyzeKeywordDensity(resume: ParsedResume): Promise<KeywordDensity> {
    const resumeText = this.extractResumeText(resume).toLowerCase();
    const words = this.tokenize(resumeText);
    const totalWords = words.length;

    const density: KeywordDensity = {};

    // 计算每个词的密度
    const wordCount = new Map<string, number>();
    words.forEach(word => {
      if (!this.stopWords.has(word) && word.length > 2) {
        wordCount.set(word, (wordCount.get(word) || 0) + 1);
      }
    });

    // 计算密度和分布
    wordCount.forEach((count, word) => {
      if (count >= 2) { // 只关注出现2次以上的词
        density[word] = {
          count,
          density: count / totalWords,
          sections: this.findWordSections(resume, word)
        };
      }
    });

    return density;
  }

  async calculateMatchScore(
    resume: ParsedResume,
    jobKeywords: KeywordSet
  ): Promise<{
    overall: number;
    technical: number;
    soft: number;
    tools: number;
    qualifications: number;
    details: {
      matched: string[];
      missing: string[];
      partial: string[];
    };
  }> {
    const resumeKeywords = await this.extractResumeKeywords(resume);

    const result = {
      overall: 0,
      technical: 0,
      soft: 0,
      tools: 0,
      qualifications: 0,
      details: {
        matched: [] as string[],
        missing: [] as string[],
        partial: [] as string[]
      }
    };

    // 计算各类别匹配度
    const categories = ['technical', 'soft', 'tools', 'qualifications'] as const;

    categories.forEach(category => {
      const jobWords = jobKeywords[category];
      const resumeWords = resumeKeywords[category] || [];

      const categoryResult = this.calculateCategoryMatch(jobWords, resumeWords);
      result[category] = categoryResult.score;
      result.details.matched.push(...categoryResult.matched.map(w => `${category}:${w}`));
      result.details.missing.push(...categoryResult.missing.map(w => `${category}:${w}`));
      result.details.partial.push(...categoryResult.partial.map(w => `${category}:${w}`));
    });

    // 计算总体得分（加权平均）
    result.overall = Math.round(
      result.technical * 0.4 +
      result.soft * 0.2 +
      result.tools * 0.3 +
      result.qualifications * 0.1
    );

    return result;
  }

  async suggestKeywordImprovements(
    resume: ParsedResume,
    jobKeywords: KeywordSet
  ): Promise<{
    additions: string[];
    replacements: Array<{ original: string; suggested: string }>;
    sections: Array<{ section: string; keywords: string[] }>;
  }> {
    const resumeKeywords = await this.extractResumeKeywords(resume);
    const suggestions = {
      additions: [] as string[],
      replacements: [] as Array<{ original: string; suggested: string }>,
      sections: [] as Array<{ section: string; keywords: string[] }>
    };

    // 1. 找出缺失的关键词
    Object.keys(jobKeywords).forEach(category => {
      const jobWords = jobKeywords[category as keyof KeywordSet];
      const resumeWords = resumeKeywords[category as keyof KeywordSet] || [];

      const missing = jobWords.filter(word => {
        return !resumeWords.some(rw =>
          rw === word || this.isSynonym(rw, word, category as keyof KeywordSet)
        );
      });

      if (missing.length > 0) {
        suggestions.additions.push(...missing);

        // 建议在哪个部分添加
        const targetSection = this.getSuggestedSection(category as keyof KeywordSet);
        if (targetSection && !suggestions.sections.find(s => s.section === targetSection)) {
          suggestions.sections.push({
            section: targetSection,
            keywords: missing
          });
        }
      }
    });

    // 2. 找出可以优化的现有关键词
    suggestions.replacements = this.findOptimizableKeywords(resumeKeywords, jobKeywords);

    return suggestions;
  }

  private extractTechnicalKeywords(text: string): string[] {
    const technicalTerms = [
      // 编程语言
      'javascript', 'python', 'java', 'c++', 'c#', 'php', 'ruby', 'go', 'rust',
      'swift', 'kotlin', 'scala', 'typescript', 'dart', 'r', 'matlab',
      // 框架
      'react', 'angular', 'vue', 'django', 'flask', 'spring', 'express',
      'laravel', 'rails', 'next.js', 'nuxt.js', 'gatsby', 'svelte',
      // 数据库
      'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch', 'cassandra',
      'oracle', 'sqlserver', 'sqlite', 'firebase', 'supabase',
      // 云服务
      'aws', 'azure', 'gcp', 'google cloud', 'heroku', 'vercel', 'netlify',
      'digitalocean', 'alibaba cloud', 'tencent cloud',
      // DevOps工具
      'docker', 'kubernetes', 'jenkins', 'gitlab', 'github', 'bitbucket',
      'terraform', 'ansible', 'puppet', 'chef', 'bamboo', 'circleci',
      // 其他
      'ai', 'machine learning', 'deep learning', 'data science', 'blockchain',
      'iot', 'ar', 'vr', 'microservices', 'api', 'rest', 'graphql', 'websocket'
    ];

    const found = technicalTerms.filter(term =>
      text.includes(term.toLowerCase())
    );

    // 使用正则表达式提取更多技术术语
    const patterns = [
      /\b[A-Z][a-z]+(?:[A-Z][a-z]+)+\b/g, // 驼峰命名
      /\b[a-z]+(?:_[a-z]+)+\b/g,           // 下划线命名
      /\b\w+(?:\.js|\.py|\.java|\.cpp|\.go)\b/g // 文件扩展名
    ];

    patterns.forEach(pattern => {
      const matches = text.match(pattern) || [];
      found.push(...matches.map(m => m.toLowerCase()));
    });

    return [...new Set(found)];
  }

  private extractToolKeywords(text: string): string[] {
    const tools = [
      // 开发工具
      'vs code', 'visual studio', 'intellij', 'eclipse', 'xcode', 'android studio',
      'vim', 'emacs', 'sublime', 'atom', 'webstorm', 'pycharm',
      // 设计工具
      'figma', 'sketch', 'adobe xd', 'photoshop', 'illustrator', 'indesign',
      'canva', 'invision', 'zeplin', 'framer',
      // 办公工具
      'microsoft office', 'excel', 'powerpoint', 'word', 'outlook',
      'google workspace', 'slack', 'teams', 'zoom', 'notion', 'trello',
      'jira', 'asana', 'confluence', 'sharepoint'
    ];

    return tools.filter(tool => text.includes(tool.toLowerCase()));
  }

  private extractQualificationKeywords(job: JobDescription): string[] {
    const qualifications = job.qualifications.join(' ').toLowerCase();

    const patterns = [
      /bachelor|master|phd|degree|diploma|certificate/g,
      /\d+\+?\s*years?/g,
      /certified|certification/g,
      /fluent|proficient|native|bilingual/g
    ];

    const found: string[] = [];
    patterns.forEach(pattern => {
      const matches = qualifications.match(pattern) || [];
      found.push(...matches);
    });

    return [...new Set(found)];
  }

  private extractIndustryKeywords(job: JobDescription): string[] {
    const industryTerms = [
      'fintech', 'healthcare', 'education', 'retail', 'ecommerce',
      'manufacturing', 'logistics', 'transportation', 'media',
      'entertainment', 'gaming', 'social media', 'advertising',
      'consulting', 'finance', 'banking', 'insurance', 'real estate',
      'energy', 'utilities', 'government', 'non-profit', 'startup'
    ];

    const text = `${job.description} ${job.company}`.toLowerCase();
    return industryTerms.filter(term => text.includes(term));
  }

  private extractResumeText(resume: ParsedResume): string {
    const texts: string[] = [];

    if (resume.personalInfo?.summary) {
      texts.push(resume.personalInfo.summary);
    }

    resume.experience.forEach(exp => {
      texts.push(exp.position || '');
      texts.push(exp.company || '');
      texts.push(...exp.responsibilities);
      if (exp.achievements) {
        texts.push(...exp.achievements);
      }
    });

    resume.projects.forEach(proj => {
      texts.push(proj.name || '');
      texts.push(proj.description || '');
      if (proj.responsibilities) {
        texts.push(...proj.responsibilities);
      }
    });

    resume.education.forEach(edu => {
      texts.push(edu.degree || '');
      texts.push(edu.description || '');
    });

    if (resume.skills) {
      if (resume.skills.technical) texts.push(resume.skills.technical.join(' '));
      if (resume.skills.soft) texts.push(resume.skills.soft.join(' '));
    }

    return texts.join(' ');
  }

  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s\u4e00-\u9fa5]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 0);
  }

  private findWordSections(resume: ParsedResume, word: string): string[] {
    const sections: string[] = [];
    const lowerWord = word.toLowerCase();

    // 检查各个部分
    if (resume.personalInfo?.summary?.toLowerCase().includes(lowerWord)) {
      sections.push('summary');
    }

    resume.experience.forEach((exp, index) => {
      const hasWord =
        exp.position?.toLowerCase().includes(lowerWord) ||
        exp.company?.toLowerCase().includes(lowerWord) ||
        exp.responsibilities.some(r => r.toLowerCase().includes(lowerWord)) ||
        exp.achievements?.some(a => a.toLowerCase().includes(lowerWord));

      if (hasWord) {
        sections.push(`experience-${index + 1}`);
      }
    });

    resume.projects.forEach((proj, index) => {
      const hasWord =
        proj.name?.toLowerCase().includes(lowerWord) ||
        proj.description?.toLowerCase().includes(lowerWord) ||
        proj.responsibilities?.some(r => r.toLowerCase().includes(lowerWord));

      if (hasWord) {
        sections.push(`project-${index + 1}`);
      }
    });

    if (resume.skills?.technical?.some(s => s.toLowerCase().includes(lowerWord))) {
      sections.push('skills');
    }

    return sections;
  }

  async extractResumeKeywords(resume: ParsedResume): Promise<Partial<KeywordSet>> {
    const resumeText = this.extractResumeText(resume).toLowerCase();

    return {
      technical: this.extractTechnicalKeywords(resumeText),
      tools: this.extractToolKeywords(resumeText),
      soft: this.extractSoftKeywords(resumeText),
      qualifications: this.extractQualificationKeywordsFromText(resumeText)
    };
  }

  private extractSoftKeywords(text: string): string[] {
    const softSkills = [
      'leadership', 'communication', 'teamwork', 'problem solving',
      'creativity', 'adaptability', 'time management', 'critical thinking',
      'collaboration', 'negotiation', 'presentation', 'analytical',
      'detail-oriented', 'organized', 'proactive', 'self-motivated'
    ];

    return softSkills.filter(skill => text.includes(skill));
  }

  private extractQualificationKeywordsFromText(text: string): string[] {
    const patterns = [
      /bachelor['s]?|master['s]?|phd|degree|diploma|certificate/g,
      /\d+\+?\s*years?/g,
      /certified|certification/g
    ];

    const found: string[] = [];
    patterns.forEach(pattern => {
      const matches = text.match(pattern) || [];
      found.push(...matches);
    });

    return [...new Set(found)];
  }

  private calculateCategoryMatch(jobWords: string[], resumeWords: string[]): {
    score: number;
    matched: string[];
    missing: string[];
    partial: string[];
  } {
    const matched: string[] = [];
    const missing: string[] = [];
    const partial: string[] = [];

    jobWords.forEach(jobWord => {
      const exactMatch = resumeWords.find(rw => rw === jobWord);
      if (exactMatch) {
        matched.push(jobWord);
      } else {
        const synonymMatch = resumeWords.find(rw => this.isSynonym(rw, jobWord));
        if (synonymMatch) {
          partial.push(jobWord);
        } else {
          missing.push(jobWord);
        }
      }
    });

    const score = jobWords.length > 0
      ? Math.round(((matched.length + partial.length * 0.5) / jobWords.length) * 100)
      : 100;

    return { score, matched, missing, partial };
  }

  private isSynonym(word1: string, word2: string, category?: keyof typeof this.synonyms): boolean {
    if (!category) {
      // 搜索所有类别
      for (const cat of Object.keys(this.synonyms) as (keyof typeof this.synonyms)[]) {
        if (this.isSynonym(word1, word2, cat)) {
          return true;
        }
      }
      return false;
    }

    const synonyms = this.synonyms[category];
    const word1Lower = word1.toLowerCase();
    const word2Lower = word2.toLowerCase();

    // 直接匹配
    if (word1Lower === word2Lower) return true;

    // 检查是否在同义词组中
    for (const [term, syns] of Object.entries(synonyms)) {
      const allTerms = [term, ...syns].map(t => t.toLowerCase());
      if (allTerms.includes(word1Lower) && allTerms.includes(word2Lower)) {
        return true;
      }
    }

    // 模糊匹配（包含关系）
    if (word1Lower.includes(word2Lower) || word2Lower.includes(word1Lower)) {
      return Math.abs(word1.length - word2.length) <= 3; // 长度差异不超过3
    }

    return false;
  }

  private getSuggestedSection(category: keyof KeywordSet): string {
    const sectionMap = {
      technical: 'skills',
      soft: 'summary',
      tools: 'skills',
      qualifications: 'education',
      industry: 'summary'
    };

    return sectionMap[category] || 'summary';
  }

  private findOptimizableKeywords(
    resumeKeywords: Partial<KeywordSet>,
    jobKeywords: KeywordSet
  ): Array<{ original: string; suggested: string }> {
    const replacements: Array<{ original: string; suggested: string }> = [];

    Object.keys(jobKeywords).forEach(category => {
      const jobWords = jobKeywords[category as keyof KeywordSet];
      const resumeWords = resumeKeywords[category as keyof KeywordSet] || [];

      resumeWords.forEach(resumeWord => {
        // 找出可以替换为更佳词汇的情况
        const betterMatch = jobWords.find(jobWord => {
          return this.isBetterKeyword(jobWord, resumeWord);
        });

        if (betterMatch && betterMatch !== resumeWord) {
          replacements.push({
            original: resumeWord,
            suggested: betterMatch
          });
        }
      });
    });

    return replacements;
  }

  private isBetterKeyword(candidate: string, current: string): boolean {
    // 判断候选词是否比当前词更好
    // 1. 更具体
    // 2. 更常用
    // 3. 更专业

    if (candidate.length > current.length && current.length < 3) {
      return true; // 当前词太短
    }

    // 检查是否是缩写
    const isAcronym = (word: string) => word.length <= 5 && word === word.toUpperCase();
    if (isAcronym(current) && candidate.length > current.length) {
      return true; // 候选词是完整形式
    }

    return false;
  }
}