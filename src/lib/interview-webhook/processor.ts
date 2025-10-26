/**
 * 面试Webhook数据处理器
 * 处理面试信息解析和个性化辅导生成的核心逻辑
 */

import {
  InterviewInfoRequest,
  ParsedResumeData,
  InterviewAnalysisResult,
  CoachingRequest,
  CoachingGenerationResult,
  TaskStatus,
  WebhookType
} from '@/types/interview-webhook';
import { n8nClient } from '@/lib/n8n/client';

export class InterviewWebhookProcessor {
  private static instance: InterviewWebhookProcessor;
  private activeTasks: Map<string, AbortController> = new Map();

  private constructor() {}

  static getInstance(): InterviewWebhookProcessor {
    if (!this.instance) {
      this.instance = new InterviewWebhookProcessor();
    }
    return this.instance;
  }

  /**
   * 处理面试信息解析请求（Webhook A）
   */
  async processInterviewParsing(request: InterviewInfoRequest): Promise<InterviewAnalysisResult> {
    const { sessionId, data } = request;
    const controller = new AbortController();
    this.activeTasks.set(sessionId, controller);

    try {
      // 更新状态：开始处理
      await this.updateTaskStatus(sessionId, 'processing', 0, '开始解析面试信息');

      // 步骤1: 解析简历文件（如果有）
      let parsedResume: ParsedResumeData | undefined;
      if (data.resumeFile) {
        await this.updateTaskStatus(sessionId, 'processing', 10, '解析简历文件');
        parsedResume = await this.parseResumeFile(data.resumeFile.url, data.resumeFile.format);
      }

      // 步骤2: 分析职位匹配度
      await this.updateTaskStatus(sessionId, 'processing', 30, '分析职位匹配度');
      const matchAnalysis = await this.analyzeJobMatch(data, parsedResume);

      // 步骤3: 识别技能差距
      await this.updateTaskStatus(sessionId, 'processing', 50, '识别技能差距');
      const skillsGap = await this.identifySkillsGap(data, parsedResume);

      // 步骤4: 生成面试准备建议
      await this.updateTaskStatus(sessionId, 'processing', 70, '生成面试准备建议');
      const preparationGuide = await this.generatePreparationGuide(data, parsedResume, skillsGap);

      // 步骤5: 生成个性化建议
      await this.updateTaskStatus(sessionId, 'processing', 90, '生成个性化建议');
      const personalizedAdvice = await this.generatePersonalizedAdvice(data, parsedResume);

      // 完成分析
      const result: InterviewAnalysisResult = {
        sessionId,
        analyzedAt: new Date().toISOString(),
        analysis: {
          matchAnalysis,
          skillsGap,
          preparationGuide,
          personalizedAdvice
        }
      };

      await this.updateTaskStatus(sessionId, 'completed', 100, '解析完成');

      // 自动触发第二步：生成面试辅导
      this.triggerCoachingGeneration(result).catch(console.error);

      return result;
    } catch (error) {
      await this.updateTaskStatus(sessionId, 'failed', 0, `解析失败: ${error.message}`);
      throw error;
    } finally {
      this.activeTasks.delete(sessionId);
    }
  }

  /**
   * 处理面试辅导生成请求（Webhook B）
   */
  async processCoachingGeneration(request: CoachingRequest): Promise<CoachingGenerationResult> {
    const { sessionId, parsedData, preferences } = request;
    const controller = new AbortController();
    this.activeTasks.set(sessionId, controller);

    try {
      // 更新状态：开始生成
      await this.updateTaskStatus(sessionId, 'processing', 0, '开始生成面试辅导材料');

      // 步骤1: 生成面试指南
      await this.updateTaskStatus(sessionId, 'processing', 20, '生成面试指南');
      const guide = await this.generateInterviewGuide(parsedData, preferences);

      // 步骤2: 构建问题库
      await this.updateTaskStatus(sessionId, 'processing', 40, '构建问题库');
      const questionBank = await this.buildQuestionBank(parsedData, preferences);

      // 步骤3: 设计模拟面试
      await this.updateTaskStatus(sessionId, 'processing', 60, '设计模拟面试');
      const mockInterview = await this.designMockInterview(parsedData, preferences);

      // 步骤4: 制定行动计划
      await this.updateTaskStatus(sessionId, 'processing', 80, '制定行动计划');
      const actionPlan = await this.createActionPlan(parsedData, preferences);

      // 完成生成
      const result: CoachingGenerationResult = {
        sessionId,
        generatedAt: new Date().toISOString(),
        coaching: {
          materials: {
            guide,
            questionBank,
            mockInterview,
            actionPlan
          },
          metadata: {
            wordCount: this.calculateWordCount(guide, questionBank),
            estimatedReadTime: 0, // 将在下面计算
            lastUpdated: new Date().toISOString(),
            version: '1.0.0'
          }
        }
      };

      // 计算阅读时间
      result.coaching.metadata.estimatedReadTime = Math.ceil(
        result.coaching.metadata.wordCount / 200 // 假设每分钟读200字
      );

      await this.updateTaskStatus(sessionId, 'completed', 100, '辅导材料生成完成');

      return result;
    } catch (error) {
      await this.updateTaskStatus(sessionId, 'failed', 0, `生成失败: ${error.message}`);
      throw error;
    } finally {
      this.activeTasks.delete(sessionId);
    }
  }

  /**
   * 触发辅导生成（通过N8N工作流）
   */
  private async triggerCoachingGeneration(analysisResult: InterviewAnalysisResult): Promise<void> {
    try {
      const coachingRequest: CoachingRequest = {
        sessionId: analysisResult.sessionId,
        parsedData: analysisResult,
        coachingType: 'interview-prep',
        preferences: {
          language: 'zh-CN',
          depth: 'comprehensive',
          format: 'slides',
          timeframe: 7
        }
      };

      // 通过N8N触发异步任务
      await n8nClient.triggerCoachingGeneration(
        analysisResult.sessionId,
        coachingRequest
      );
    } catch (error) {
      console.error('Failed to trigger coaching generation:', error);
      // 记录错误但不抛出，避免影响主流程
    }
  }

  /**
   * 解析简历文件
   */
  private async parseResumeFile(fileUrl: string, format: string): Promise<ParsedResumeData> {
    // 这里应该调用实际的简历解析服务
    // 暂时返回模拟数据
    await new Promise(resolve => setTimeout(resolve, 2000)); // 模拟处理时间

    return {
      extractedAt: new Date().toISOString(),
      personalInfo: {
        name: '张三',
        contact: {
          email: 'zhangsan@example.com',
          phone: '13800138000',
          location: '北京'
        },
        summary: '5年经验的前端开发工程师'
      },
      experience: [
        {
          company: '某科技公司',
          position: '高级前端工程师',
          duration: '2020-至今',
          responsibilities: ['负责公司核心产品的前端开发'],
          achievements: ['优化性能50%', '带领3人团队']
        }
      ],
      education: [
        {
          school: '某大学',
          degree: '本科',
          major: '计算机科学与技术',
          duration: '2016-2020'
        }
      ],
      skills: {
        technical: ['React', 'TypeScript', 'Node.js'],
        soft: ['团队合作', '沟通能力'],
        certifications: ['AWS认证']
      }
    };
  }

  /**
   * 分析职位匹配度
   */
  private async analyzeJobMatch(data: any, resume?: ParsedResumeData) {
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 模拟匹配度分析
    return {
      positionMatch: 85,
      industryMatch: 90,
      experienceMatch: 75,
      overallScore: 83
    };
  }

  /**
   * 识别技能差距
   */
  private async identifySkillsGap(data: any, resume?: ParsedResumeData) {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const requiredSkills = ['React', 'TypeScript', 'Node.js', 'Docker'];
    const existingSkills = resume?.skills?.technical || ['React', 'TypeScript'];
    const missingSkills = requiredSkills.filter(s => !existingSkills.includes(s));

    return {
      requiredSkills,
      existingSkills,
      missingSkills,
      improvementSuggestions: missingSkills.map(skill => `学习${skill}基础知识`)
    };
  }

  /**
   * 生成面试准备建议
   */
  private async generatePreparationGuide(data: any, resume?: ParsedResumeData, skillsGap?: any) {
    await new Promise(resolve => setTimeout(resolve, 2000));

    return {
      keyPoints: [
        '准备自我介绍（2-3分钟）',
        '熟悉简历中的项目经历',
        '准备行为问题的STAR回答'
      ],
      potentialQuestions: [
        {
          question: '请介绍一下你自己',
          category: 'self-introduction',
          suggestedAnswer: '简要介绍背景、经验和亮点',
          tips: ['控制在2-3分钟', '突出与职位相关经验']
        }
      ],
      commonChallenges: [
        '紧张情绪管理',
        '技术问题回答',
        '薪资谈判'
      ],
      successFactors: [
        '充分准备',
        '积极沟通',
        '展示解决问题的能力'
      ]
    };
  }

  /**
   * 生成个性化建议
   */
  private async generatePersonalizedAdvice(data: any, resume?: ParsedResumeData) {
    await new Promise(resolve => setTimeout(resolve, 1000));

    return {
      strengths: ['技术扎实', '项目经验丰富'],
      improvementAreas: ['沟通表达', '领导力'],
      talkingPoints: ['强调项目成果', '展示学习能力'],
      redFlags: ['避免抱怨前公司', '不要频繁跳槽']
    };
  }

  /**
   * 生成面试指南
   */
  private async generateInterviewGuide(parsedData: InterviewAnalysisResult, preferences: any) {
    await new Promise(resolve => setTimeout(resolve, 3000));

    return {
      sections: [
        {
          title: '面试前准备',
          content: '详细的面试前准备工作...',
          tips: ['研究公司背景', '了解职位要求', '准备常见问题答案'],
          examples: ['自我介绍示例', '项目描述示例']
        },
        {
          title: '面试中技巧',
          content: '面试过程中的注意事项...',
          tips: ['保持眼神交流', '使用STAR法则回答问题']
        }
      ]
    };
  }

  /**
   * 构建问题库
   */
  private async buildQuestionBank(parsedData: InterviewAnalysisResult, preferences: any) {
    await new Promise(resolve => setTimeout(resolve, 2000));

    return [
      {
        id: 'q001',
        question: '请介绍一下你的项目经验',
        category: 'experience',
        difficulty: 'medium' as const,
        modelAnswer: {
          structure: ['项目背景', '我的角色', '遇到的挑战', '解决方案', '项目成果'],
          keyPoints: ['量化成果', '突出技术难点', '展示团队协作'],
          exampleResponse: '在我负责的XX项目中...',
          pitfalls: ['过于技术化', '没有量化成果']
        },
        followUpQuestions: ['你在项目中遇到的最大挑战是什么？']
      }
    ];
  }

  /**
   * 设计模拟面试
   */
  private async designMockInterview(parsedData: InterviewAnalysisResult, preferences: any) {
    await new Promise(resolve => setTimeout(resolve, 2000));

    return {
      rounds: [
        {
          type: '自我介绍',
          duration: 5,
          questions: ['请简单介绍一下你自己'],
          evaluationCriteria: ['表达清晰度', '经验相关性', '职业规划']
        }
      ],
      scoreCard: [
        {
          criterion: '技术能力',
          weight: 0.4,
          description: '评估技术深度和广度'
        }
      ]
    };
  }

  /**
   * 制定行动计划
   */
  private async createActionPlan(parsedData: InterviewAnalysisResult, preferences: any) {
    await new Promise(resolve => setTimeout(resolve, 1000));

    return {
      dailyTasks: [
        {
          day: 1,
          tasks: ['研究公司信息', '准备自我介绍'],
          estimatedTime: 2,
          resources: ['公司官网', 'LinkedIn']
        }
      ],
      milestones: [
        {
          day: 3,
          goal: '完成所有常见问题准备',
          checkpoints: ['行为问题', '技术问题', '项目介绍']
        }
      ],
      resources: [
        {
          type: 'article',
          title: '面试技巧指南',
          url: 'https://example.com',
          description: '详细的面试技巧文章'
        }
      ]
    };
  }

  /**
   * 计算字数
   */
  private calculateWordCount(guide: any, questionBank: any): number {
    // 简单估算
    return 5000;
  }

  /**
   * 更新任务状态
   */
  private async updateTaskStatus(
    sessionId: string,
    status: TaskStatus,
    progress: number,
    message?: string
  ): Promise<void> {
    // 这里应该更新数据库或缓存
    // 暂时使用日志
    console.log(`[${sessionId}] Status: ${status}, Progress: ${progress}%, Message: ${message}`);
  }

  /**
   * 取消任务
   */
  cancelTask(sessionId: string): boolean {
    const controller = this.activeTasks.get(sessionId);
    if (controller) {
      controller.abort();
      this.activeTasks.delete(sessionId);
      this.updateTaskStatus(sessionId, 'failed', 0, '任务已取消');
      return true;
    }
    return false;
  }

  /**
   * 获取任务状态
   */
  getTaskStatus(sessionId: string): { active: boolean } {
    return {
      active: this.activeTasks.has(sessionId)
    };
  }
}

// 导出单例
export const interviewWebhookProcessor = InterviewWebhookProcessor.getInstance();