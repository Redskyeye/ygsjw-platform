/**
 * 服务类别系统类型定义
 * 定义了AI服务的七大类别及相关接口
 */

export interface ServiceCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  features: string[];
  examples: string[];
  popular: boolean;
}

export interface CategorySelectorState {
  selectedCategory: ServiceCategory | null;
  isExpanded: boolean;
  searchQuery: string;
  recommendedCategories: ServiceCategory[];
}

export interface CategoryCardProps {
  category: ServiceCategory;
  isSelected: boolean;
  isRecommended: boolean;
  onSelect: (category: ServiceCategory) => void;
  onLearnMore?: (category: ServiceCategory) => void;
  variant?: 'default' | 'compact' | 'detailed';
}

export interface ServiceCategorySelectorProps {
  onCategorySelect?: (category: ServiceCategory) => void;
  initialCategory?: string;
  showRecommended?: boolean;
  allowSearch?: boolean;
  maxRecommended?: number;
  variant?: 'grid' | 'list' | 'carousel';
  className?: string;
}

export type ServiceCategoryType =
  | 'data-analysis'
  | 'content-creation'
  | 'image-processing'
  | 'voice-processing'
  | 'code-generation'
  | 'translation'
  | 'qa';

export const SERVICE_CATEGORIES: Record<ServiceCategoryType, ServiceCategory> = {
  'data-analysis': {
    id: 'data-analysis',
    name: '数据分析服务',
    description: '提供智能数据处理、统计分析、预测建模等服务，帮助用户从数据中获取洞察',
    icon: 'BarChart3',
    color: 'blue',
    features: [
      '数据清洗与预处理',
      '统计分析与可视化',
      '机器学习建模',
      '预测分析',
      '报告生成'
    ],
    examples: [
      '销售数据分析',
      '用户行为分析',
      '财务报表分析',
      '市场趋势预测'
    ],
    popular: true
  },
  'content-creation': {
    id: 'content-creation',
    name: '内容创作服务',
    description: '智能文本生成、编辑和优化服务，包括文章写作、广告文案、创意写作等',
    icon: 'PenTool',
    color: 'purple',
    features: [
      '智能文本生成',
      '内容编辑优化',
      '多语言创作',
      'SEO优化',
      '格式排版'
    ],
    examples: [
      '博客文章写作',
      '广告文案创作',
      '产品描述生成',
      '社交媒体内容'
    ],
    popular: true
  },
  'image-processing': {
    id: 'image-processing',
    name: '图像处理服务',
    description: 'AI驱动的图像生成、编辑、分析和识别服务，满足各种视觉创作需求',
    icon: 'Image',
    color: 'green',
    features: [
      'AI图像生成',
      '图像编辑优化',
      '风格转换',
      '对象识别',
      '图像增强'
    ],
    examples: [
      '产品图片生成',
      '艺术创作',
      '照片修复增强',
      '设计素材制作'
    ],
    popular: true
  },
  'voice-processing': {
    id: 'voice-processing',
    name: '语音处理服务',
    description: '语音识别、合成、转换和分析服务，提供完整的语音交互解决方案',
    icon: 'Mic',
    color: 'orange',
    features: [
      '语音转文字',
      '文字转语音',
      '语音识别',
      '语音合成',
      '情感分析'
    ],
    examples: [
      '会议记录转录',
      '有声书制作',
      '语音助手开发',
      '客服语音分析'
    ],
    popular: false
  },
  'code-generation': {
    id: 'code-generation',
    name: '代码生成服务',
    description: '智能代码生成、优化、调试和解释服务，支持多种编程语言和框架',
    icon: 'Code2',
    color: 'red',
    features: [
      '代码自动生成',
      '代码优化重构',
      '错误检测修复',
      '代码解释说明',
      '单元测试生成'
    ],
    examples: [
      'API接口开发',
      '算法实现',
      '前端组件生成',
      '数据库查询优化'
    ],
    popular: true
  },
  'translation': {
    id: 'translation',
    name: '翻译服务',
    description: '多语言智能翻译服务，支持文本、文档、网页等多种格式的高质量翻译',
    icon: 'Languages',
    color: 'indigo',
    features: [
      '多语言互译',
      '专业术语翻译',
      '语境理解',
      '格式保持',
      '批量翻译'
    ],
    examples: [
      '商务文档翻译',
      '技术手册翻译',
      '网站本地化',
      '实时对话翻译'
    ],
    popular: false
  },
  'qa': {
    id: 'qa',
    name: '智能问答服务',
    description: '基于知识库的智能问答系统，提供准确、快速的问题解答和知识查询',
    icon: 'MessageCircleQuestion',
    color: 'teal',
    features: [
      '智能问答',
      '知识检索',
      '上下文理解',
      '多轮对话',
      '答案验证'
    ],
    examples: [
      '产品咨询解答',
      '技术支持问答',
      '学习辅导',
      '客服自动回复'
    ],
    popular: true
  }
};

export const getCategoryById = (id: string): ServiceCategory | null => {
  return SERVICE_CATEGORIES[id as ServiceCategoryType] || null;
};

export const getPopularCategories = (): ServiceCategory[] => {
  return Object.values(SERVICE_CATEGORIES).filter(category => category.popular);
};

export const searchCategories = (query: string): ServiceCategory[] => {
  const searchTerm = query.toLowerCase();
  return Object.values(SERVICE_CATEGORIES).filter(category =>
    category.name.toLowerCase().includes(searchTerm) ||
    category.description.toLowerCase().includes(searchTerm) ||
    category.features.some(feature => feature.toLowerCase().includes(searchTerm)) ||
    category.examples.some(example => example.toLowerCase().includes(searchTerm))
  );
};

export const getRecommendedCategories = (userInput?: string): ServiceCategory[] => {
  if (!userInput) {
    return getPopularCategories().slice(0, 3);
  }

  const searchResults = searchCategories(userInput);
  return searchResults.length > 0 ? searchResults.slice(0, 3) : getPopularCategories().slice(0, 3);
};

// 报告系统类型定义
export interface ReportData {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  serviceCategory: ServiceCategory;
  analysisData: AnalysisData;
  diagnosisData: DiagnosisData;
  recommendations: Recommendation[];
  executiveSummary: string;
}

export interface AnalysisData {
  fourDAnalysis: FourDAnalysisResult;
  detailedAnalysis: DetailedAnalysis;
  metrics: PerformanceMetrics;
  trends: TrendData[];
}

export interface FourDAnalysisResult {
  domain: string;
  diagnosis: string;
  direction: string;
  development: string;
  overallScore: number;
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

export interface DetailedAnalysis {
  efficiency: number;
  effectiveness: number;
  quality: number;
  speed: number;
  costOptimization: number;
  resourceUtilization: number;
  innovation: number;
  customerSatisfaction: number;
}

export interface PerformanceMetrics {
  productivity: number;
  qualityScore: number;
  timeEfficiency: number;
  costEfficiency: number;
  errorRate: number;
  satisfactionScore: number;
  utilizationRate: number;
}

export interface TrendData {
  period: string;
  value: number;
  category: string;
  change?: number;
}

export interface DiagnosisData {
  problems: IdentifiedProblem[];
  rootCauses: RootCause[];
  impact: ImpactAssessment;
  priority: PriorityMatrix;
}

export interface IdentifiedProblem {
  id: string;
  name: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  frequency: number;
  impact: number;
}

export interface RootCause {
  problemId: string;
  cause: string;
  contributingFactors: string[];
  evidence: string[];
}

export interface ImpactAssessment {
  financial: number;
  operational: number;
  customer: number;
  strategic: number;
  overall: number;
}

export interface PriorityMatrix {
  urgent: string[];
  important: string[];
  medium: string[];
  low: string[];
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  effort: 'high' | 'medium' | 'low';
  impact: 'high' | 'medium' | 'low';
  timeline: string;
  resources: string[];
  expectedOutcome: string;
  status: 'pending' | 'in_progress' | 'completed';
}

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  sections: ReportSection[];
  layout: 'standard' | 'detailed' | 'summary' | 'custom';
  styling: TemplateStyling;
}

export interface ReportSection {
  id: string;
  name: string;
  type: 'summary' | 'chart' | 'table' | 'text' | 'custom';
  order: number;
  visible: boolean;
  config: SectionConfig;
}

export interface SectionConfig {
  title?: string;
  description?: string;
  showCharts?: boolean;
  chartType?: 'bar' | 'line' | 'pie' | 'radar';
  data?: any;
  customContent?: string;
}

export interface TemplateStyling {
  theme: 'light' | 'dark' | 'professional' | 'modern';
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  logo?: string;
  header?: {
    title?: string;
    subtitle?: string;
    showDate?: boolean;
    showAuthor?: boolean;
  };
  footer?: {
    text?: string;
    showPageNumbers?: boolean;
    showSignature?: boolean;
  };
}

export interface ReportGenerationOptions {
  templateId: string;
  format: 'pdf' | 'docx' | 'html' | 'json';
  includeRawData: boolean;
  includeCharts: boolean;
  includeRecommendations: boolean;
  includeActionPlan: boolean;
  customSections?: ReportSection[];
}

export interface ReportGenerationState {
  isGenerating: boolean;
  progress: number;
  currentStep: string;
  error?: string;
  reportUrl?: string;
  taskId?: string;
}

export interface ReportPreviewData {
  sections: PreviewSection[];
  metadata: PreviewMetadata;
}

export interface PreviewSection {
  id: string;
  name: string;
  content: string;
  type: string;
  order: number;
}

export interface PreviewMetadata {
  title: string;
  author: string;
  createdAt: Date;
  totalPages: number;
  version: string;
}