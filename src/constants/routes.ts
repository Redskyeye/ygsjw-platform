/**
 * 路由常量
 */

// 公共路由
export const PUBLIC_ROUTES = {
  HOME: '/',
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
} as const;

// 受保护的路由
export const PROTECTED_ROUTES = {
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  SETTINGS: '/settings',
} as const;

// 职业规划相关路由
export const CAREER_ROUTES = {
  PLANS: '/career/plans',
  PLAN_DETAIL: '/career/plans/:id',
  CREATE_PLAN: '/career/plans/new',
  GOALS: '/career/goals',
  ASSESSMENTS: '/career/assessments',
} as const;

// AI咨询相关路由
export const AI_ROUTES = {
  CONSULT: '/ai/consult',
  CONSULT_HISTORY: '/ai/consult/history',
  ASSESSMENT: '/ai/assessment',
  RECOMMENDATIONS: '/ai/recommendations',
} as const;

// 管理员路由
export const ADMIN_ROUTES = {
  DASHBOARD: '/admin',
  USERS: '/admin/users',
  USER_DETAIL: '/admin/users/:id',
  SETTINGS: '/admin/settings',
  ANALYTICS: '/admin/analytics',
} as const;

// 所有路由映射
export const ROUTES = {
  ...PUBLIC_ROUTES,
  ...PROTECTED_ROUTES,
  ...CAREER_ROUTES,
  ...AI_ROUTES,
  ...ADMIN_ROUTES,
} as const;

// 路由权限级别
export const ROUTE_PERMISSIONS = {
  PUBLIC: 'public',
  USER: 'user',
  COUNSELOR: 'counselor',
  ADMIN: 'admin',
} as const;
