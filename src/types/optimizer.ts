---
created: 2025-10-26T08:00:00Z
last_updated: 2025-10-26T08:00:00Z
version: 1.0
author: Claude Code PM System
---

// 优化器相关的类型定义

import { ParsedResume, SkillsData, Project, Experience, Education } from './ai';

// 优化模式枚举
export enum OptimizationMode {
  FRESH_GRADUATE = 'fresh_graduate', // 应届生模式
  EXPERIENCED = 'experienced',       // 有经验模式
  CAREER_CHANGE = 'career_change',   // 转行模式
  ENGLISH = 'english',               // 英文简历
  CONTENT_BEAUTIFY = 'content_beautify' // 内容美化
}

// 优化配置基础接口
export interface BaseOptimizationConfig {
  mode: OptimizationMode;
  targetJob?: JobDescription;
  targetRole?: string;
  industry?: string;
  experienceLevel?: 'entry' | 'mid' | 'senior' | 'executive';
  language?: 'zh' | 'en';
}

// 应届生优化配置
export interface FreshGraduateConfig extends BaseOptimizationConfig {
  mode: OptimizationMode.FRESH_GRADUATE;
  focusInternships: boolean;        // 是否突出实习经历
  highlightProjects: boolean;       // 是否强调项目经验
  showGPA: boolean;                 // 是否显示GPA
  includeRelevantCourses: boolean;  // 是否包含相关课程
  emphasisSkills: string[];         // 重点突出的技能
}

// 有经验优化配置
export interface ExperiencedConfig extends BaseOptimizationConfig {
  mode: OptimizationMode.EXPERIENCED;
  focusOnAchievements: boolean;     // 是否突出成就
  quantifyResults: boolean;         // 是否量化结果
  emphasizeLeadership: boolean;     // 是否强调领导力
  highlightExpertise: string[];     // 重点突出的专业领域
  yearsOfExperience: number;        // 工作年限
}

// 转行优化配置
export interface CareerChangeConfig extends BaseOptimizationConfig {
  mode: OptimizationMode.CAREER_CHANGE;
  transferableSkills: string[];     // 可转移技能
  relevantExperience: string[];     // 相关经验
  bridgeSkills: string[];           // 桥接技能
  hideIrrelevantExperience: boolean; // 是否隐藏不相关经验
  explainCareerChange: boolean;     // 是否解释转行原因
}

// 英文简历配置
export interface EnglishConfig extends BaseOptimizationConfig {
  mode: OptimizationMode.ENGLISH;
  translationStyle: 'formal' | 'professional' | 'casual';
  adaptToWesternCulture: boolean;   // 是否适配西方文化
  useImperialUnits: boolean;        // 是否使用英制单位
  formatDateStyle: 'mm/dd/yyyy' | 'Month Year' | 'YYYY';
}

// 内容美化配置
export interface BeautifyConfig extends BaseOptimizationConfig {
  mode: OptimizationMode.CONTENT_BEAUTIFY;
  tone: 'professional' | 'dynamic' | 'conservative';
  impactLevel: 'quantitative' | 'qualitative' | 'balanced';
  detailLevel: 'concise' | 'standard' | 'detailed';
  useActionVerbs: boolean;
  includeMetrics: boolean;
}

// 关键词配置
export interface KeywordConfig {
  targetKeywords?: string[];        // 目标关键词
  keywordDensity: number;           // 关键词密度 (0-1)
  semanticVariations: boolean;      // 是否使用语义变体
  longTailKeywords: boolean;        // 是否使用长尾关键词
  skillEmphasis: 'balanced' | 'technical' | 'comprehensive';
  experienceDepth: 'summary' | 'detailed' | 'comprehensive';
  projectDetail: 'overview' | 'detailed' | 'comprehensive';
}

// ATS配置
export interface ATSConfig {
  optimizeForATS: boolean;          // 是否优化ATS
  useStandardSections: boolean;     // 是否使用标准章节
  avoidTablesColumns: boolean;      // 是否避免表格和列
  useSimpleFormatting: boolean;     // 是否使用简单格式
  includeKeywords: boolean;         // 是否包含关键词
  maxPages: number;                 // 最大页数
}

// 职位描述
export interface JobDescription {
  id: string;
  title: string;
  company: string;
  description: string;
  requirements: string[];
  qualifications: string[];
  skills: {
    technical: string[];
    soft: string[];
  };
  experience: {
    min?: number;
    preferred?: number;
  };
  salary?: {
    min?: number;
    max?: number;
    currency?: string;
  };
  location?: string;
  industry?: string;
  postedAt: Date;
}

// 关键词集合
export interface KeywordSet {
  technical: string[];
  soft: string[];
  tools: string[];
  qualifications: string[];
  industry: string[];
}

// 关键词密度
export interface KeywordDensity {
  [keyword: string]: {
    count: number;
    density: number;
    sections: string[];
  };
}

// 优化结果
export interface OptimizedResume extends ParsedResume {
  optimization: OptimizationMetadata;
  keywordSummary?: KeywordSummary;
  atsScore?: ATSScore;
  suggestions?: OptimizationSuggestion[];
}

// 优化元数据
export interface OptimizationMetadata {
  mode: OptimizationMode;
  appliedStrategies: string[];
  score: number;
  improvements: string[];
  timestamp: Date;
  config: BaseOptimizationConfig;
}

// 关键词摘要
export interface KeywordSummary {
  totalKeywords: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  densityScore: number;
  recommendations: string[];
}

// ATS评分
export interface ATSScore {
  overall: number;                  // 总分 (0-100)
  parseability: number;             // 可解析性 (0-100)
  keywordMatch: number;             // 关键词匹配 (0-100)
  structure: number;                // 结构评分 (0-100)
  formatting: number;               // 格式评分 (0-100)
  issues: ATSIssue[];
  recommendations: string[];
}

// ATS问题
export interface ATSIssue {
  type: 'error' | 'warning' | 'info';
  category: 'formatting' | 'structure' | 'content' | 'keyword';
  message: string;
  suggestion: string;
  location?: string;
}

// 优化建议
export interface OptimizationSuggestion {
  id: string;
  type: 'content' | 'structure' | 'formatting' | 'keyword';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  example?: {
    before: string;
    after: string;
  };
  impact: string;
  actionText: string;
}

// 增强的教育信息
export interface EnhancedEducation extends Education {
  relevantCourses?: string[];
  achievements?: string[];
  gpaHighlight?: string;
  leadership?: string[];
  honors?: string[];
}

// 增强的项目信息
export interface EnhancedProject extends Project {
  impact?: string;
  learningOutcomes?: string[];
  challenges?: string[];
  technologies?: EnhancedSkill[];
}

// 增强的技能信息
export interface EnhancedSkill {
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  category: string;
  yearsOfExperience?: number;
  lastUsed?: Date;
  certified?: boolean;
}

// 增强的工作经历
export interface EnhancedExperience extends Experience {
  achievements?: Achievement[];
  impact?: string;
  keyResponsibilities?: string[];
  teamSize?: number;
  budgetManaged?: number;
}

// 成就
export interface Achievement {
  title: string;
  description: string;
  metrics?: {
    value: number;
    unit: string;
    improvement?: number;
  };
  date?: Date;
  recognition?: string;
}

// 优化记录
export interface OptimizationRecord {
  id: string;
  originalId: string;
  timestamp: Date;
  config: BaseOptimizationConfig;
  result: OptimizedResume;
  evaluation: EvaluationReport;
  version: number;
}

// 评估报告
export interface EvaluationReport {
  overallScore: number;
  dimensions: {
    contentQuality: ContentQualityScore;
    keywordMatch: KeywordMatchScore;
    readability: ReadabilityScore;
    professionalism: ProfessionalismScore;
  };
  comparison: ComparisonReport;
  recommendations: string[];
  improvementAreas: string[];
}

// 内容质量评分
export interface ContentQualityScore {
  score: number;
  metrics: {
    completeness: number;
    clarity: number;
    impact: number;
    relevance: number;
    structure: number;
  };
  strengths: string[];
  weaknesses: string[];
}

// 关键词匹配评分
export interface KeywordMatchScore {
  score: number;
  details: {
    exact: number;
    semantic: number;
    contextual: number;
  };
  missingKeywords: string[];
  overrepresentedKeywords: string[];
}

// 可读性评分
export interface ReadabilityScore {
  score: number;
  metrics: {
    averageSentenceLength: number;
    averageWordLength: number;
    readabilityIndex: number;
    complexity: number;
  };
  improvements: string[];
}

// 专业性评分
export interface ProfessionalismScore {
  score: number;
  metrics: {
    tone: number;
    grammar: number;
    formatting: number;
    completeness: number;
  };
  feedback: string[];
}

// 对比报告
export interface ComparisonReport {
  contentChanges: ContentChange[];
  structuralChanges: StructuralChange[];
  linguisticImprovements: string[];
  keywordEnhancements: KeywordEnhancement[];
  readabilityImprovement: number;
}

// 内容变更
export interface ContentChange {
  section: string;
  type: 'addition' | 'deletion' | 'modification';
  description: string;
  impact: 'positive' | 'negative' | 'neutral';
}

// 结构变更
export interface StructuralChange {
  type: 'reorder' | 'merge' | 'split' | 'add' | 'remove';
  sections: string[];
  reason: string;
}

// 关键词增强
export interface KeywordEnhancement {
  keyword: string;
  before: string;
  after: string;
  impact: string;
}

// 版本对比
export interface VersionComparison {
  version1: {
    id: string;
    timestamp: Date;
    score: number;
  };
  version2: {
    id: string;
    timestamp: Date;
    score: number;
  };
  differences: any[];
  improvements: string[];
  regressions: string[];
}

// 优化器API请求/响应
export interface OptimizeRequest {
  resumeId: string;
  config: BaseOptimizationConfig;
  jobDescription?: JobDescription;
  customPrompt?: string;
}

export interface OptimizeResponse {
  success: boolean;
  data?: {
    optimizedResume: OptimizedResume;
    evaluation: EvaluationReport;
    suggestions: OptimizationSuggestion[];
  };
  error?: string;
  metadata?: {
    processingTime: number;
    tokensUsed: number;
    cost?: number;
  };
}

// 实时优化建议请求
export interface RealtimeSuggestionRequest {
  resumeId: string;
  section: string;
  content: string;
  context?: {
    targetJob?: JobDescription;
    mode?: OptimizationMode;
    previousSuggestions?: string[];
  };
}

export interface RealtimeSuggestionResponse {
  suggestions: OptimizationSuggestion[];
  optimizedContent?: string;
  confidence: number;
}

// 批量优化请求
export interface BatchOptimizeRequest {
  resumeIds: string[];
  configs: BaseOptimizationConfig[];
  jobDescription?: JobDescription;
}

export interface BatchOptimizeResponse {
  results: {
    resumeId: string;
    success: boolean;
    data?: OptimizeResponse;
    error?: string;
  }[];
  summary: {
    total: number;
    successful: number;
    failed: number;
    totalTime: number;
  };
}