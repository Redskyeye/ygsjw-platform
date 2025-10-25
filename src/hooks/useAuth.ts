import { useState, useEffect } from 'react';
import { User } from '../types';
import { STORAGE_KEYS } from '../constants';

/**
 * 认证状态Hook
 */
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // 初始化认证状态
  useEffect(() => {
    const initAuth = () => {
      if (typeof window === 'undefined') {
        setLoading(false);
        return;
      }

      try {
        const storedUser = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
        const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);

        if (storedUser && token) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // 登录函数
  const login = (userData: User, token: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(userData));
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    }
    setUser(userData);
    setIsAuthenticated(true);
  };

  // 登出函数
  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    }
    setUser(null);
    setIsAuthenticated(false);
  };

  return {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
  };
}
