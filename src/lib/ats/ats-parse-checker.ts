---
created: 2025-10-26T08:00:00Z
last_updated: 2025-10-26T08:00:00Z
version: 1.0
author: Claude Code PM System
---

import { ParsedResume, ATSIssue } from '../../types/optimizer';

/**
 * ATS解析检查器 - 检查简历ATS友好性
 */
export class ATSParseChecker {
  private problematicPatterns = {
    // 不宜使用的字符
    specialChars: /[^\w\s\u4e00-\u9fa5\-.,!?@#%&*()+=]/g,
    // 表格标记
    tableMarkers: /\|(\s*\|)+/g,
    // 多个空格
    multipleSpaces: /\s{3,}/g,
    // 全角字符
    fullWidthChars: /[\uFF00-\uFFEF]/g,
    // 特殊引号
    specialQuotes: /[""'']/g,
    // 项目符号（非标准）
    bulletPoints: /[•·▪▫‣⁃]/g,
    // 复杂日期格式
    complexDates: /\d{4}年\d{1,2}月\d{1,2}日/g,
  };

  private requiredSections = {
    zh: ['联系方式', '教育背景', '工作经历', '专业技能'],
    en: ['Contact', 'Education', 'Experience', 'Skills']
  };

  async checkParseability(resume: ParsedResume, language: 'zh' | 'en' = 'zh'): Promise<{
    score: number;
    issues: ATSIssue[];
    suggestions: string[];
  }> {
    const issues: ATSIssue[] = [];
    const suggestions: string[] = [];
    let score = 100;

    // 1. 检查特殊字符
    const specialCharIssues = this.checkSpecialCharacters(resume);
    issues.push(...specialCharIssues);
    score -= specialCharIssues.length * 5;

    // 2. 检查表格使用
    const tableIssues = this.checkTables(resume);
    issues.push(...tableIssues);
    score -= tableIssues.length * 10;

    // 3. 检查章节完整性
    const sectionIssues = this.checkRequiredSections(resume, language);
    issues.push(...sectionIssues);
    score -= sectionIssues.length * 15;

    // 4. 检查格式一致性
    const formatIssues = this.checkFormatConsistency(resume);
    issues.push(...formatIssues);
    score -= formatIssues.length * 5;

    // 5. 检查长度
    const lengthIssues = this.checkLength(resume);
    issues.push(...lengthIssues);
    score -= lengthIssues.length * 10;

    // 6. 检查联系方式
    const contactIssues = this.checkContactInfo(resume);
    issues.push(...contactIssues);
    score -= contactIssues.length * 20;

    // 生成建议
    suggestions.push(...this.generateSuggestions(issues));

    return {
      score: Math.max(0, score),
      issues,
      suggestions
    };
  }

  private checkSpecialCharacters(resume: ParsedResume): ATSIssue[] {
    const issues: ATSIssue[] = [];
    const resumeText = this.extractFullText(resume);

    // 检查特殊字符
    const specialChars = resumeText.match(this.problematicPatterns.specialChars);
    if (specialChars) {
      issues.push({
        type: 'warning',
        category: 'formatting',
        message: `检测到${specialChars.length}个可能导致ATS解析错误的特殊字符`,
        suggestion: '使用标准字符替换特殊符号'
      });
    }

    // 检查全角字符
    const fullWidthChars = resumeText.match(this.problematicPatterns.fullWidthChars);
    if (fullWidthChars) {
      issues.push({
        type: 'warning',
        category: 'formatting',
        message: `检测到${fullWidthChars.length}个全角字符`,
        suggestion: '将全角字符转换为半角字符'
      });
    }

    // 检查特殊引号
    const specialQuotes = resumeText.match(this.problematicPatterns.specialQuotes);
    if (specialQuotes) {
      issues.push({
        type: 'info',
        category: 'formatting',
        message: '使用了特殊引号，建议使用标准引号',
        suggestion: '使用标准英文双引号(")或中文引号("")'
      });
    }

    // 检查项目符号
    const bulletPoints = resumeText.match(this.problematicPatterns.bulletPoints);
    if (bulletPoints) {
      issues.push({
        type: 'warning',
        category: 'formatting',
        message: '使用了非标准项目符号',
        suggestion: '使用标准项目符号如 • 或 -'
      });
    }

    return issues;
  }

  private checkTables(resume: ParsedResume): ATSIssue[] {
    const issues: ATSIssue[] = [];
    const resumeText = this.extractFullText(resume);

    // 检查表格标记
    const tableMarkers = resumeText.match(this.problematicPatterns.tableMarkers);
    if (tableMarkers) {
      issues.push({
        type: 'error',
        category: 'formatting',
        message: '检测到表格格式，ATS可能无法正确解析',
        suggestion: '将表格内容转换为列表格式'
      });
    }

    // 检查多列布局（通过内容结构推断）
    const hasComplexLayout = this.detectComplexLayout(resume);
    if (hasComplexLayout) {
      issues.push({
        type: 'error',
        category: 'structure',
        message: '检测到多列布局',
        suggestion: '使用单列布局提高ATS兼容性'
      });
    }

    return issues;
  }

  private checkRequiredSections(resume: ParsedResume, language: 'zh' | 'en'): ATSIssue[] {
    const issues: ATSIssue[] = [];
    const requiredSections = this.requiredSections[language];

    // 检查联系方式
    if (!resume.personalInfo || !this.hasValidContactInfo(resume.personalInfo)) {
      issues.push({
        type: 'error',
        category: 'content',
        message: '缺少或无效的联系方式',
        suggestion: '添加有效的邮箱和电话号码'
      });
    }

    // 检查教育背景
    if (!resume.education || resume.education.length === 0) {
      issues.push({
        type: 'error',
        category: 'content',
        message: '缺少教育背景信息',
        suggestion: '添加最高学历信息'
      });
    }

    // 检查工作经历
    if (!resume.experience || resume.experience.length === 0) {
      if (this.isExperiencedCandidate(resume)) {
        issues.push({
          type: 'error',
          category: 'content',
          message: '缺少工作经历',
          suggestion: '添加相关工作经验'
        });
      } else {
        issues.push({
          type: 'warning',
          category: 'content',
          message: '缺少工作经历（应届生可忽略）',
          suggestion: '添加实习或项目经验'
        });
      }
    }

    // 检查技能
    if (!resume.skills || !resume.skills.technical || resume.skills.technical.length === 0) {
      issues.push({
        type: 'warning',
        category: 'content',
        message: '缺少技能信息',
        suggestion: '添加专业技能列表'
      });
    }

    return issues;
  }

  private checkFormatConsistency(resume: ParsedResume): ATSIssue[] {
    const issues: ATSIssue[] = [];

    // 检查日期格式一致性
    const dateFormats = this.extractDateFormats(resume);
    if (dateFormats.length > 1) {
      issues.push({
        type: 'info',
        category: 'formatting',
        message: '日期格式不一致',
        suggestion: '统一使用 YYYY-MM 或 YYYY年MM月 格式'
      });
    }

    // 检查列表格式一致性
    const listFormats = this.extractListFormats(resume);
    if (listFormats.length > 1) {
      issues.push({
        type: 'info',
        category: 'formatting',
        message: '列表格式不一致',
        suggestion: '统一使用相同的列表符号'
      });
    }

    // 检查标题层级一致性
    const titleInconsistencies = this.checkTitleHierarchy(resume);
    if (titleInconsistencies > 0) {
      issues.push({
        type: 'warning',
        category: 'structure',
        message: '标题层级不一致',
        suggestion: '使用统一的标题格式和层级'
      });
    }

    return issues;
  }

  private checkLength(resume: ParsedResume): ATSIssue[] {
    const issues: ATSIssue[] = [];
    const wordCount = this.countWords(resume);

    // 检查是否过短
    if (wordCount < 200) {
      issues.push({
        type: 'warning',
        category: 'content',
        message: '简历内容过少',
        suggestion: '增加更多详细的工作经历和项目描述'
      });
    }

    // 检查是否过长
    if (wordCount > 800) {
      issues.push({
        type: 'warning',
        category: 'content',
        message: '简历内容过多，建议控制在1-2页',
        suggestion: '精简内容，突出重点'
      });
    }

    return issues;
  }

  private checkContactInfo(resume: ParsedResume): ATSIssue[] {
    const issues: ATSIssue[] = [];

    if (!resume.personalInfo) {
      return issues;
    }

    // 检查邮箱格式
    if (resume.personalInfo.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(resume.personalInfo.email)) {
        issues.push({
          type: 'error',
          category: 'content',
          message: '邮箱格式不正确',
          suggestion: '使用有效的邮箱地址'
        });
      }
    }

    // 检查电话格式
    if (resume.personalInfo.phone) {
      const phoneRegex = /^[\d\s\-\+\(\)]+$/;
      if (!phoneRegex.test(resume.personalInfo.phone)) {
        issues.push({
          type: 'error',
          category: 'content',
          message: '电话格式不正确',
          suggestion: '使用标准电话格式'
        });
      }
    }

    return issues;
  }

  private extractFullText(resume: ParsedResume): string {
    const texts: string[] = [];

    if (resume.personalInfo) {
      texts.push(resume.personalInfo.name || '');
      texts.push(resume.personalInfo.email || '');
      texts.push(resume.personalInfo.phone || '');
      texts.push(resume.personalInfo.summary || '');
    }

    resume.experience.forEach(exp => {
      texts.push(exp.company || '');
      texts.push(exp.position || '');
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
      texts.push(edu.school || '');
      texts.push(edu.degree || '');
      texts.push(edu.description || '');
    });

    if (resume.skills) {
      if (resume.skills.technical) {
        texts.push(...resume.skills.technical);
      }
      if (resume.skills.soft) {
        texts.push(...resume.skills.soft);
      }
    }

    return texts.join(' ');
  }

  private detectComplexLayout(resume: ParsedResume): boolean {
    // 简单检测：如果同一时间段有多个工作，可能是多列布局
    const timeRanges = resume.experience.map(exp => exp.duration);
    const uniqueRanges = new Set(timeRanges);
    return uniqueRanges.size < timeRanges.length;
  }

  private hasValidContactInfo(personalInfo: any): boolean {
    return !!(personalInfo.email || personalInfo.phone);
  }

  private isExperiencedCandidate(resume: ParsedResume): boolean {
    // 简单判断：如果有2年以上工作经验
    const totalExperience = resume.experience.reduce((total, exp) => {
      const years = this.parseYears(exp.duration);
      return total + years;
    }, 0);
    return totalExperience >= 2;
  }

  private parseYears(duration: string): number {
    const match = duration.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
  }

  private extractDateFormats(resume: ParsedResume): string[] {
    const formats = new Set<string>();

    resume.experience.forEach(exp => {
      if (exp.duration.includes('年')) formats.add('chinese');
      if (exp.duration.includes('/')) formats.add('slash');
      if (exp.duration.includes('-')) formats.add('dash');
    });

    return Array.from(formats);
  }

  private extractListFormats(resume: ParsedResume): string[] {
    const formats = new Set<string>();

    const allLists = [
      ...resume.experience.flatMap(exp => exp.responsibilities),
      ...resume.experience.flatMap(exp => exp.achievements || []),
      ...resume.projects.flatMap(proj => proj.responsibilities || [])
    ];

    allLists.forEach(item => {
      if (item.startsWith('•')) formats.add('bullet');
      if (item.startsWith('-')) formats.add('dash');
      if (item.startsWith('·')) formats.add('dot');
    });

    return Array.from(formats);
  }

  private checkTitleHierarchy(resume: ParsedResume): number {
    // 简化实现，实际会更复杂
    return 0;
  }

  private countWords(resume: ParsedResume): number {
    const text = this.extractFullText(resume);
    // 中英文混合计数
    const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
    const englishWords = (text.match(/[a-zA-Z]+/g) || []).length;
    return chineseChars + englishWords;
  }

  private generateSuggestions(issues: ATSIssue[]): string[] {
    const suggestions = new Set<string>();

    // 根据问题类型生成建议
    const hasFormattingIssues = issues.some(i => i.category === 'formatting');
    const hasStructureIssues = issues.some(i => i.category === 'structure');
    const hasContentIssues = issues.some(i => i.category === 'content');

    if (hasFormattingIssues) {
      suggestions.add('使用标准格式：字体大小10-12pt，页边距1英寸');
      suggestions.add('避免使用颜色、图形和复杂排版');
      suggestions.add('保存为.docx格式而非PDF');
    }

    if (hasStructureIssues) {
      suggestions.add('使用单列布局');
      suggestions.add('按时间倒序排列工作经历');
      suggestions.add('使用标准章节标题');
    }

    if (hasContentIssues) {
      suggestions.add('确保包含完整的联系方式');
      suggestions.add('使用动词开头描述工作职责');
      suggestions.add('量化工作成果和成就');
    }

    return Array.from(suggestions);
  }
}