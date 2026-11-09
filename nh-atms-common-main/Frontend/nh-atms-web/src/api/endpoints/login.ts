import { api } from '../http';
import type { LoginRequest, LoginResult, PublicKeyInfo } from '@/domain/login';

/** 로그인 견본 — API 계약 §7. /api/auth/** 는 사용자 확인 전에 부른다(서버 허용 경로) */
export const loginApi = {
  publicKey: () => api.get<PublicKeyInfo>('/auth/public-key', { quietSuccess: true }),
  /** 성공 문구 S012 "로그인되었습니다." 는 서버가 보내고 자동으로 뜬다 */
  login: (body: LoginRequest) => api.post<LoginResult>('/auth/login', body),
  logout: () => api.post<null>('/auth/logout'),
};

export const loginKeys = {
  all: ['login'] as const,
};
