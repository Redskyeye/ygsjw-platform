import axios from 'axios';
import { ApiResponse } from '@/types';

// 创建 axios 实例
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
api.interceptors.request.use(
  config => {
    // 从 localStorage 获取 token
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  response => {
    return response.data;
  },
  error => {
    // 统一错误处理
    if (error.response?.status === 401) {
      // 未授权，跳转到登录页
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// API 请求方法
export const apiRequest = {
  get: <T>(url: string): Promise<ApiResponse<T>> => api.get(url),
  post: <T>(url: string, data?: unknown): Promise<ApiResponse<T>> =>
    api.post(url, data),
  put: <T>(url: string, data?: unknown): Promise<ApiResponse<T>> =>
    api.put(url, data),
  delete: <T>(url: string): Promise<ApiResponse<T>> => api.delete(url),
  patch: <T>(url: string, data?: unknown): Promise<ApiResponse<T>> =>
    api.patch(url, data),
};

// 面试Webhook API
export const interviewWebhookApi = {
  // 提交面试信息解析请求
  parseInterview: (data: any) =>
    api.post('/webhook/interview/parse', data),

  // 提交辅导生成请求
  generateCoaching: (data: any) =>
    api.post('/webhook/interview/coach', data),

  // 查询处理状态
  getStatus: (sessionId: string) =>
    api.get(`/webhook/interview/status?sessionId=${sessionId}`),

  // 取消处理
  cancelTask: (sessionId: string) =>
    api.delete(`/webhook/interview/coach?sessionId=${sessionId}`)
};

export default api;
