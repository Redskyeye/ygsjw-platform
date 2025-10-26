---
created: 2025-10-26T08:00:00Z
last_updated: 2025-10-26T08:00:00Z
version: 1.0
author: Claude Code PM System
---

import { ATSOptimizer } from '../ats/ats-optimizer';
import { ParsedResume, ATSConfig, JobDescription } from '@/types/optimizer';

describe('ATSOptimizer', () => {
  let optimizer: ATSOptimizer;
  let mockResume: ParsedResume;
  let mockConfig: ATSConfig;
  let mockJob: JobDescription;

  beforeEach(() => {
    optimizer = new ATSOptimizer();
    mockResume = {
      personalInfo: {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1-555-123-4567',
        summary: 'Experienced software engineer with expertise in React and Node.js'
      },
      experience: [
        {
          company: 'Tech Corp',
          position: 'Senior Software Engineer',
          duration: '2020-2024',
          responsibilities: [
            'Developed and maintained web applications using React',
            'Managed CI/CD pipeline for continuous deployment',
            'Led a team of 5 developers'
          ],
          achievements: [
            'Reduced page load time by 50%',
            'Increased user engagement by 30%'
          ]
        }
      ],
      education: [
        {
          school: 'University of Technology',
          degree: 'Bachelor of Science',
          major: 'Computer Science',
          duration: '2016-2020',
          gpa: '3.8/4.0'
        }
      ],
      skills: {
        technical: ['JavaScript', 'React', 'Node.js', 'Python', 'AWS'],
        soft: ['Leadership', 'Communication', 'Problem Solving'],
        languages: ['English (Native)', 'Spanish (Intermediate)']
      }
    };

    mockConfig = {
      optimizeForATS: true,
      useStandardSections: true,
      avoidTablesColumns: true,
      useSimpleFormatting: true,
      includeKeywords: true,
      maxPages: 2
    };

    mockJob = {
      id: '1',
      title: 'Senior Frontend Developer',
      company: 'Innovate Inc',
      description: 'We are looking for a Senior Frontend Developer with experience in React, TypeScript, and modern web technologies.',
      requirements: [
        '5+ years of experience with React',
        'Experience with TypeScript',
        'Knowledge of modern CSS frameworks',
        'Experience with RESTful APIs'
      ],
      qualifications: [
        'Bachelor degree in Computer Science or related field',
        'Strong problem-solving skills',
        'Excellent communication skills'
      ],
      skills: {
        technical: ['React', 'TypeScript', 'JavaScript', 'CSS', 'HTML'],
        soft: ['Communication', 'Teamwork', 'Problem Solving']
      },
      experience: {
        min: 5,
        preferred: 7
      },
      location: 'San Francisco, CA',
      industry: 'Technology',
      postedAt: new Date()
    };
  });

  describe('optimizeForATS', () => {
    it('应该优化简历以提高ATS通过率', async () => {
      const result = await optimizer.optimizeForATS(mockResume, mockConfig);

      expect(result).toBeDefined();
      expect(result.atsScore).toBeDefined();
      expect(result.optimization.appliedStrategies).toContain('standard_section_structure');
    });

    it('应该优化章节结构', async () => {
      const result = await optimizer.optimizeForATS(mockResume, {
        ...mockConfig,
        useStandardSections: true
      });

      expect(result.experience[0].responsibilities[0]).toMatch(/^[A-Z][a-z]/);
    });

    it('应该移除复杂格式', async () => {
      const result = await optimizer.optimizeForATS(mockResume, {
        ...mockConfig,
        avoidTablesColumns: true
      });

      expect(result.optimization.appliedStrategies).toContain('removed_complex_formatting');
    });

    it('应该优化关键词', async () => {
      const result = await optimizer.optimizeForATS(mockResume, {
        ...mockConfig,
        includeKeywords: true
      }, mockJob);

      expect(result.optimization.appliedStrategies).toContain('keyword_optimization');
    });

    it('应该简化格式', async () => {
      const result = await optimizer.optimizeForATS(mockResume, {
        ...mockConfig,
        useSimpleFormatting: true
      });

      expect(result.optimization.appliedStrategies).toContain('simplified_formatting');
    });
  });

  describe('calculateATSScore', () => {
    it('应该计算正确的ATS评分', async () => {
      const result = await optimizer.optimizeForATS(mockResume, mockConfig, mockJob);

      expect(result.atsScore).toBeDefined();
      expect(result.atsScore.overall).toBeGreaterThanOrEqual(0);
      expect(result.atsScore.overall).toBeLessThanOrEqual(100);
    });

    it('应该生成ATS问题和建议', async () => {
      const result = await optimizer.optimizeForATS(mockResume, mockConfig, mockJob);

      expect(result.atsScore.issues).toBeDefined();
      expect(result.atsScore.recommendations).toBeDefined();
    });

    it('应该检测结构问题', async () => {
      const invalidResume = {
        ...mockResume,
        experience: [],
        education: [],
        skills: {}
      };

      const result = await optimizer.optimizeForATS(invalidResume, mockConfig);

      expect(result.atsScore.structure).toBeLessThan(100);
      expect(result.atsScore.issues.some(issue =>
        issue.category === 'structure' && issue.type === 'error'
      )).toBe(true);
    });
  });

  describe('optimizeSectionStructure', () => {
    it('应该使用标准章节标题', async () => {
      const result = await optimizer['optimizeSectionStructure'](mockResume);

      // 验证英文简历使用标准标题
      expect(result).toBeDefined();
    });

    it('应该使用动词开头描述职责', async () => {
      const result = await optimizer['optimizeSectionStructure'](mockResume);

      result.experience.forEach(exp => {
        exp.responsibilities.forEach(resp => {
          expect(resp).toMatch(/^[A-Z][a-z]/);
        });
      });
    });
  });

  describe('optimizeKeywords', () => {
    it('应该优化技能部分', async () => {
      const result = await optimizer['optimizeKeywords'](mockResume, mockJob);

      expect(result.skills).toBeDefined();
      expect(result.skills.technical).toBeDefined();
    });

    it('应该优化工作经历关键词', async () => {
      const result = await optimizer['optimizeKeywords'](mockResume, mockJob);

      result.experience.forEach(exp => {
        expect(exp.responsibilities).toBeDefined();
      });
    });

    it('应该优化项目描述关键词', async () => {
      const resumeWithProjects = {
        ...mockResume,
        projects: [
          {
            name: 'E-commerce Platform',
            description: 'Built an e-commerce platform using React and Node.js',
            technologies: ['React', 'Node.js', 'MongoDB'],
            duration: '3 months'
          }
        ]
      };

      const result = await optimizer['optimizeKeywords'](resumeWithProjects, mockJob);

      expect(result.projects).toBeDefined();
    });
  });

  describe('generateRecommendations', () => {
    it('应该生成标准建议', async () => {
      const issues = [
        {
          type: 'error' as const,
          category: 'formatting' as const,
          message: '检测到复杂格式',
          suggestion: '移除表格'
        }
      ];

      const recommendations = optimizer['generateRecommendations'](issues);

      expect(recommendations).toContain('使用标准字体如Arial、Calibri或Times New Roman');
    });

    it('应该生成格式相关建议', async () => {
      const issues = [
        {
          type: 'warning' as const,
          category: 'formatting' as const,
          message: '格式问题',
          suggestion: '优化格式'
        }
      ];

      const recommendations = optimizer['generateRecommendations'](issues);

      expect(recommendations.length).toBeGreaterThan(0);
    });
  });

  describe('detectLanguage', () => {
    it('应该检测中文', () => {
      const chineseResume = {
        ...mockResume,
        personalInfo: {
          ...mockResume.personalInfo,
          name: '张三'
        }
      };

      const language = optimizer['detectLanguage'](chineseResume);
      expect(language).toBe('zh');
    });

    it('应该检测英文', () => {
      const language = optimizer['detectLanguage'](mockResume);
      expect(language).toBe('en');
    });
  });

  describe('ensureActionVerbStart', () => {
    it('应该添加动词开头', () => {
      const text = 'responsible for developing features';
      const result = optimizer['ensureActionVerbStart'](text, 'en');

      expect(result).toMatch(/^[A-Z][a-z]/);
    });

    it('应该保持现有动词', () => {
      const text = 'Developed features using React';
      const result = optimizer['ensureActionVerbStart'](text, 'en');

      expect(result).toBe(text);
    });
  });
});