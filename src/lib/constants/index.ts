// 应用配置常量
export const APP_CONFIG = {
  NAME: '史诗AI',
  VERSION: '0.1.0',
  DESCRIPTION: 'AI驱动的职业规划与指导平台',
  AUTHOR: 'Epic AI Team',
} as const;

// API 端点常量
export const API_ENDPOINTS = {
  // 认证相关
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    PROFILE: '/auth/profile',
  },
  // 用户相关
  USERS: {
    BASE: '/users',
    PROFILE: '/users/profile',
    SETTINGS: '/users/settings',
  },
  // 职业规划相关
  CAREER: {
    PLANS: '/career/plans',
    GOALS: '/career/goals',
    ASSESSMENTS: '/career/assessments',
  },
  // AI 咨询相关
  AI: {
    CONSULT: '/ai/consult',
    ASSESS: '/ai/assess',
    RECOMMEND: '/ai/recommend',
  },
} as const;

// 本地存储键名常量
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_PROFILE: 'user_profile',
  CAREER_PLAN: 'career_plan',
  APP_SETTINGS: 'app_settings',
} as const;

// 分页常量
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
} as const;

// 状态常量
export const STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending',
  COMPLETED: 'completed',
  ARCHIVED: 'archived',
} as const;

// 优先级常量
export const PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
} as const;

// 用户角色常量
export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  COUNSELOR: 'counselor',
} as const;

// 咨询类型常量
export const CONSULTATION_TYPES = {
  CAREER_GUIDANCE: 'career_guidance',
  SKILL_ASSESSMENT: 'skill_assessment',
  JOB_SEARCH: 'job_search',
  INTERVIEW_PREP: 'interview_prep',
  RESUME_REVIEW: 'resume_review',
} as const;

// 错误消息常量
export const ERROR_MESSAGES = {
  NETWORK_ERROR: '网络连接错误，请检查网络设置',
  UNAUTHORIZED: '未授权，请重新登录',
  FORBIDDEN: '权限不足',
  NOT_FOUND: '请求的资源不存在',
  SERVER_ERROR: '服务器内部错误',
  VALIDATION_ERROR: '输入数据验证失败',
  UNKNOWN_ERROR: '未知错误，请稍后重试',
} as const;

// 成功消息常量
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: '登录成功',
  REGISTER_SUCCESS: '注册成功',
  LOGOUT_SUCCESS: '退出成功',
  SAVE_SUCCESS: '保存成功',
  DELETE_SUCCESS: '删除成功',
  UPDATE_SUCCESS: '更新成功',
} as const;

// 正则表达式常量
export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^1[3-9]\d{9}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
  USERNAME: /^[a-zA-Z0-9_]{3,20}$/,
} as const;

// 日期格式常量
export const DATE_FORMATS = {
  DATE: 'YYYY-MM-DD',
  DATETIME: 'YYYY-MM-DD HH:mm:ss',
  TIME: 'HH:mm:ss',
  MONTH: 'YYYY-MM',
  YEAR: 'YYYY',
} as const;
