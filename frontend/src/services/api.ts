import axios, { AxiosError } from 'axios';
import type { User } from '../types';

// Use environment variable in production, fallback to /api in development
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({ baseURL: API_BASE_URL });

api.interceptors.request.use((config) => {
  const stored = localStorage.getItem('user');
  if (stored) {
    try {
      const user: User = JSON.parse(stored);
      if (user?.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
      }
    } catch {
      // ignore parse errors
    }
  }
  return config;
});

export const getApiError = (err: unknown): string => {
  if (err instanceof AxiosError) {
    return err.response?.data?.message || err.message || 'Unknown error';
  }
  if (err instanceof Error) return err.message;
  return 'Something went wrong';
};

export default api;