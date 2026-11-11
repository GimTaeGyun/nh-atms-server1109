import { api } from '../http';
import type { Me } from '@/types/auth';

/** 나(로그인 사용자) — API 계약 §1. 세션이 없으면 401 ME_002, 인사정보에 없으면 401 ME_001 → 로그인 화면으로 */
export const meApi = {
  get: () => api.get<Me>('/me'),
};

export const meKeys = {
  all: ['me'] as const,
};
