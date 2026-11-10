import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { hasEntered } from './entry';

/**
 * 첫 화면 관문 — 이 탭에서 아직 [로그인]·[비로그인 진입] 을 안 했으면 /login 으로 보낸다.
 * 치려던 주소는 state.from 으로 넘겨, 로그인 화면이 끝나면 그 화면으로 돌아간다.
 * 통과 표시는 탭 범위(entry.ts). 그 뒤는 MeGate(/api/me 확인) → 앱 셸.
 */
export const EntryGate = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  if (!hasEntered()) {
    return <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}` }} />;
  }
  return <>{children}</>;
};
