import { create } from 'zustand';
import type { Me } from '@/types/auth';
import { meApi } from '@/api/endpoints/me';
import { loginApi } from '@/api/endpoints/login';
import { toAppError } from '@/api/errors';
import { bindUnauthorized } from '@/api/http';
import { queryClient } from '@/api/queryClient';
import { useTabStore } from './useTabStore';

/**
 * 나(로그인 사용자) 스토어 — 로그인(`POST /api/auth/login`, 서버 세션) 뒤 `GET /api/me` 결과를 담는다.
 * 실패하면 status='error' 와 서버 문구를 담는다. 코드가 ME_001·ME_002(로그인 필요)면 MeGate 가 로그인 화면으로 보낸다.
 * 쓰는 중에 세션이 끊겨도(다른 API 의 401 ME_00x) 같은 상태가 되어 로그인 화면으로 간다(http.ts bindUnauthorized).
 * 세션 타이머·무조작 자동 로그아웃은 없다(서버 세션 만료에 맡김). SSO 를 붙일 때 바꿀 곳: 서버 SessionUserFilter + 이 스토어.
 * 이름은 원본(nh-atms)과 같은 `useAuthStore` 로 두어 복사해 온 부품이 그대로 쓰게 했다.
 */
export type MeStatus = 'idle' | 'loading' | 'ready' | 'error';

interface AuthState {
  me: Me | null;
  status: MeStatus;
  /** 실패 시 서버 응답코드(예: ME_002)·문구 */
  error: { code?: string; message: string } | null;
  /** /api/me 를 읽는다. 이미 읽었으면(force 아님) 건너뛴다 */
  loadMe: (force?: boolean) => Promise<void>;
  /** 로그인 성공 직후 — 이전 사용자의 조회 캐시·열린 탭을 버리고 나를 다시 읽는다 */
  startSession: () => Promise<void>;
  /** 로그아웃 — 서버 세션을 끊고(실패해도) 화면 상태를 비운다. 이동은 부른 쪽이 한다 */
  signOut: () => Promise<void>;
  /** 테스트·미리보기용으로 직접 넣기 */
  setMe: (me: Me | null) => void;
}

/** 이전 사용자의 흔적(조회 캐시·열린 탭) 지우기 — 다른 계정으로 바꿔 들어올 때 권한·메뉴가 섞이지 않게 */
const clearUserData = () => {
  // 조회 캐시만 지운다(진행 중인 로그인 mutation 은 건드리지 않게 queryClient.clear 는 쓰지 않음)
  queryClient.removeQueries();
  useTabStore.getState().reset();
};

export const useAuthStore = create<AuthState>()((set, get) => ({
  me: null,
  status: 'idle',
  error: null,
  loadMe: async (force = false) => {
    const { status } = get();
    if (status === 'loading' || (status === 'ready' && !force)) return;
    set({ status: 'loading', error: null });
    try {
      const me = await meApi.get();
      set({ me, status: 'ready', error: null });
    } catch (e) {
      const err = toAppError(e);
      set({ me: null, status: 'error', error: { code: err.code, message: err.userMessage } });
    }
  },
  startSession: async () => {
    clearUserData();
    set({ me: null, status: 'idle', error: null });
    await get().loadMe(true);
  },
  signOut: async () => {
    try {
      await loginApi.logout();
    } catch {
      // 서버 세션이 이미 없어도 화면은 로그아웃 상태로 만든다(오류 문구는 전역 처리)
    }
    clearUserData();
    set({ me: null, status: 'idle', error: null });
  },
  setMe: (me) => set({ me, status: me ? 'ready' : 'idle', error: null }),
}));

// 쓰는 중에 세션이 끊기면(401 ME_001·ME_002) 오류 상태로 → MeGate 가 로그인 화면으로 보낸다
bindUnauthorized((e) => {
  if (useAuthStore.getState().status === 'error') return;
  useAuthStore.setState({ me: null, status: 'error', error: { code: e.code, message: e.userMessage } });
});

/** 로그인 화면으로 보낼 응답코드인지 (MeGate) */
export const isLoginRequired = (code?: string): boolean => code === 'ME_001' || code === 'ME_002';

/** 내 사무소 코드 (조회조건 기본값). 없으면 '' */
export const selectOfficeCd = (s: AuthState): string => s.me?.ofcCode ?? '';
/** 관리자 여부 — 서버가 정한 adminYn(잠정: AUTH='A') 그대로 */
export const selectIsAdmin = (s: AuthState): boolean => s.me?.adminYn === 'Y';
