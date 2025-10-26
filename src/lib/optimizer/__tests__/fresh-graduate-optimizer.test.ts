---
created: 2025-10-26T08:00:00Z
last_updated: 2025-10-26T08:00:00Z
version: 1.0
author: Claude Code PM System
---

import { FreshGraduateOptimizer } from '../fresh-graduate-optimizer';
import { ParsedResume, FreshGraduateConfig, OptimizationMode } from '@/types/optimizer';

describe('FreshGraduateOptimizer', () => {
  let optimizer: FreshGraduateOptimizer;
  let mockResume: ParsedResume;
  let mockConfig: FreshGraduateConfig;

  beforeEach(() => {
    optimizer = new FreshGraduateOptimizer();
    mockResume = {
      personalInfo: {
        name: '张三',
        email: 'zhangsan@example.com',
        phone: '13800138000'
      },
      experience: [
        {
          company: 'ABC公司',
          position: '实习生',
          duration: '2023.06-2023.09',
          responsibilities: ['负责前端开发', '参与项目测试'],
          achievements: ['完成了XX功能开发']
        }
      ],
      projects: [
        {
          name: '电商网站',
          description: '使用React开发的电商平台',
          technologies: ['React', 'Node.js'],
          duration: '3个月'
        }
      ],
      education: [
        {
          school: 'XX大学',
          degree: '学士',
          major: '计算机科学与技术',
          duration: '2020.09-2024.06',
          gpa: '3.8/4.0'
        }
      ],
      skills: {
        technical: ['JavaScript', 'React', 'Node.js', 'MySQL'],
        soft: ['团队合作', '学习能力'],
        languages: ['中文（母语）', '英语（CET-4）']
      }
    };

    mockConfig = {
      mode: OptimizationMode.FRESH_GRADUATE,
      focusInternships: true,
      highlightProjects: true,
      showGPA: true,
      includeRelevantCourses: true,
      emphasisSkills: ['React', 'Node.js'],
      targetRole: '前端开发工程师'
    };
  });

  describe('optimizeResume', () => {
    it('应该正确优化应届生简历', async () => {
      const result = await optimizer.optimizeResume(mockResume, mockConfig);

      expect(result).toBeDefined();
      expect(result.optimization.mode).toBe(OptimizationMode.FRESH_GRADUATE);
      expect(result.optimization.appliedStrategies).toContain('education_focus');
      expect(result.optimization.appliedStrategies).toContain('project_emphasis');
      expect(result.optimization.improvements.length).toBeGreaterThan(0);
    });

    it('应该优化教育背景展示', async () => {
      const result = await optimizer.optimizeResume(mockResume, mockConfig);

      expect(result.education).toBeDefined();
      expect(result.education[0]).toHaveProperty('relevantCourses');
      expect(result.education[0]).toHaveProperty('achievements');
      expect(result.education[0]).toHaveProperty('gpaHighlight');
    });

    it('应该突出项目经验', async () => {
      const result = await optimizer.optimizeResume(mockResume, mockConfig);

      expect(result.projects).toBeDefined();
      expect(result.projects[0]).toHaveProperty('impact');
      expect(result.projects[0]).toHaveProperty('learningOutcomes');
      expect(result.projects[0]).toHaveProperty('technologies');
    });

    it('应该优化技能展示', async () => {
      const result = await optimizer.optimizeResume(mockResume, mockConfig);

      expect(result.skills).toBeDefined();
      expect(result.skills.technical).toBeDefined();
    });

    it('应该生成个人总结', async () => {
      const result = await optimizer.optimizeResume(mockResume, mockConfig);

      expect(result.personalInfo).toHaveProperty('summary');
      expect(result.personalInfo.summary).toContain('应届毕业生');
      expect(result.personalInfo.summary).toContain('React');
    });

    it('应该优化实习经历', async () => {
      const result = await optimizer.optimizeResume(mockResume, mockConfig);

      expect(result.experience).toBeDefined();
      expect(result.experience[0].position).toContain('实习');
    });
  });

  describe('optimizeEducation', () => {
    it('应该提取相关课程', async () => {
      const education = mockResume.education;
      const optimized = await optimizer['optimizeEducation'](education, mockConfig);

      expect(optimized[0]).toHaveProperty('relevantCourses');
      expect(optimized[0].relevantCourses).toContain('数据结构与算法');
    });

    it('应该识别学术成就', async () => {
      const education = [
        {
          ...mockResume.education[0],
          rank: '10%',
          scholarship: '国家奖学金'
        }
      ];
      const optimized = await optimizer['optimizeEducation'](education, mockConfig);

      expect(optimized[0].achievements).toContain('GPA 3.8/4.0（优秀）');
      expect(optimized[0].achievements).toContain('专业排名前10%');
    });

    it('应该高亮GPA', async () => {
      const education = mockResume.education;
      const optimized = await optimizer['optimizeEducation'](education, mockConfig);

      expect(optimized[0].gpaHighlight).toBe('3.8/4.0（优秀）');
    });
  });

  describe('optimizeProjects', () => {
    it('应该增强项目描述', async () => {
      const projects = mockResume.projects;
      const optimized = await optimizer['optimizeProjects'](projects, mockConfig);

      expect(optimized[0].description).toContain('使用技术');
      expect(optimized[0]).toHaveProperty('impact');
    });

    it('应该量化项目影响', async () => {
      const projects = mockResume.projects;
      const optimized = await optimizer['optimizeProjects'](projects, mockConfig);

      expect(optimized[0].impact).toContain('项目');
    });

    it('应该提取学习成果', async () => {
      const projects = mockResume.projects;
      const optimized = await optimizer['optimizeProjects'](projects, mockConfig);

      expect(optimized[0]).toHaveProperty('learningOutcomes');
      expect(optimized[0].learningOutcomes).toContain('掌握了');
    });
  });

  describe('generateSummary', () => {
    it('应该生成专业的个人总结', async () => {
      const summary = await optimizer['generateSummary'](mockResume, mockConfig);

      expect(summary).toContain('计算机科学与技术');
      expect(summary).toContain('React');
      expect(summary).toContain('前端开发工程师');
      expect(summary.length).toBeLessThan(200);
    });

    it('应该突出学习能力和潜力', async () => {
      const summary = await optimizer['generateSummary'](mockResume, mockConfig);

      expect(summary).toContain('学习能力');
    });
  });

  describe('calculateOptimizationScore', () => {
    it('应该计算正确的优化分数', async () => {
      const result = await optimizer.optimizeResume(mockResume, mockConfig);
      const score = await optimizer['calculateOptimizationScore'](result, mockConfig);

      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('应该根据优化内容调整分数', async () => {
      const result1 = await optimizer.optimizeResume(mockResume, mockConfig);
      const result2 = await optimizer.optimizeResume(
        { ...mockResume, projects: [] },
        mockConfig
      );

      expect(result1.optimization.score).toBeGreaterThan(result2.optimization.score);
    });
  });
});