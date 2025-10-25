/**
 * 应用常量定义
 */

// 从lib/constants迁移并重新导出
export {
  APP_CONFIG,
  API_ENDPOINTS,
  STORAGE_KEYS,
  PAGINATION,
  STATUS,
  PRIORITY,
  USER_ROLES,
  CONSULTATION_TYPES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  REGEX_PATTERNS,
  DATE_FORMATS,
} from '../lib/constants';

// UI相关常量
export * from './ui';

// 主题相关常量
export * from './theme';

// 路由常量
export * from './routes';
