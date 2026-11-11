import { useEffect, type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Button, Result, Typography } from 'antd';
import { isLoginRequired, useAuthStore } from '@/stores/useAuthStore';
import { LoadingBlock } from '@/components/feedback/LoadingBlock';

/**
 * 나(로그인 사용자) 확인 관문 — 앱 시작 때 `GET /api/me` 를 한 번 읽는다(계약 §1).
 *  - 읽는 중: 로딩
 *  - 로그인 필요(401 ME_002 세션 없음·만료, ME_001 인사정보 없음): 로그인 화면으로 보낸다. 원래 주소는 state.from 으로 넘겨
 *    로그인 뒤 그 화면으로 돌아온다(LoginPage). 쓰는 중에 세션이 끊겨도 같은 길(useAuthStore 의 bindUnauthorized).
 *  - 그 밖의 실패(DB 오류 등): 서버 문구를 화면 전체에 그대로 보여 준다
 *  - 성공: children(앱 셸)
 */
export const MeGate = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const status = useAuthStore((s) => s.status);
  const error = useAuthStore((s) => s.error);
  const loadMe = useAuthStore((s) => s.loadMe);

  useEffect(() => {
    if (status === 'idle') void loadMe();
  }, [status, loadMe]);

  if (status === 'ready') return <>{children}</>;
  if (status === 'error' && isLoginRequired(error?.code)) {
    return <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}` }} />;
  }
  if (status === 'error') {
    return (
      <div className="me-gate" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-page)' }}>
        <Result
          status="warning"
          title="사용자 정보를 확인할 수 없습니다"
          subTitle={
            <>
              <div role="alert" data-testid="me-error">{error?.message}</div>
              {error?.code && <Typography.Text type="secondary" style={{ fontSize: 12 }}>응답코드 {error.code}</Typography.Text>}
            </>
          }
          extra={<Button type="primary" onClick={() => void loadMe(true)}>다시 시도</Button>}
        />
      </div>
    );
  }
  return <LoadingBlock tip="사용자 정보를 확인하는 중…" height={400} />;
};
