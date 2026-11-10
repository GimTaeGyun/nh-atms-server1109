import { sessionStore } from '@/utils/storage';

/**
 * 첫 화면(로그인) 통과 표시 — 브라우저 탭 범위(sessionStorage).
 *  - 탭을 처음 열면 표시가 없어 /login 이 먼저 뜬다(EntryGate).
 *  - [로그인] 성공 또는 [비로그인 진입] 을 누르면 표시를 남긴다 → 같은 탭에서는 새로고침해도 다시 묻지 않는다.
 *  - 탭을 닫으면 지워진다. 저장소를 못 쓰는 환경이면 표시가 안 남아 매번 로그인 화면부터 보인다.
 */
const KEY = 'entered';

export type EntryMode = 'login' | 'guest';

export const entryModeOf = (): EntryMode | null => sessionStore.get<EntryMode | null>(KEY, null);
export const hasEntered = (): boolean => entryModeOf() !== null;
export const markEntered = (mode: EntryMode): void => sessionStore.set(KEY, mode);
export const clearEntered = (): void => sessionStore.remove(KEY);

/** 로그인 화면이 끝난 뒤 돌아갈 주소 — 처음 치려던 주소(EntryGate 가 state.from 으로 넘김), 없거나 /login 이면 '/' */
export const returnPathOf = (state: unknown): string => {
  const from = (state as { from?: unknown } | null)?.from;
  return typeof from === 'string' && from.startsWith('/') && !from.startsWith('/login') ? from : '/';
};
