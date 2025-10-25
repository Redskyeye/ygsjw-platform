// 用户相关类型
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  COUNSELOR = 'counselor',
}

// 职业规划相关类型
export interface CareerPlan {
  id: string;
  userId: string;
  title: string;
  description: string;
  goals: CareerGoal[];
  timeline: string;
  status: PlanStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CareerGoal {
  id: string;
  title: string;
  description: string;
  category: GoalCategory;
  priority: Priority;
  dueDate?: Date;
  completed: boolean;
  createdAt: Date;
}

export enum GoalCategory {
  SKILL_DEVELOPMENT = 'skill_development',
  EDUCATION = 'education',
  EXPERIENCE = 'experience',
  NETWORKING = 'networking',
  CERTIFICATION = 'certification',
}

export enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum PlanStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  ARCHIVED = 'archived',
}

// AI 咨询相关类型
export interface AIConsultation {
  id: string;
  userId: string;
  type: ConsultationType;
  question: string;
  response: string;
  confidence: number;
  createdAt: Date;
}

export enum ConsultationType {
  CAREER_GUIDANCE = 'career_guidance',
  SKILL_ASSESSMENT = 'skill_assessment',
  JOB_SEARCH = 'job_search',
  INTERVIEW_PREP = 'interview_prep',
  RESUME_REVIEW = 'resume_review',
}

// API 响应类型
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// 表单相关类型
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'textarea' | 'select' | 'checkbox';
  required?: boolean;
  placeholder?: string;
  options?: string[];
  validation?: ValidationRule[];
}

export interface ValidationRule {
  type: 'required' | 'email' | 'minLength' | 'maxLength' | 'pattern';
  value?: string | number;
  message: string;
}
