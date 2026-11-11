import { Suspense } from 'react';
import { BrowserRouter, HashRouter, Route, Routes } from 'react-router-dom';
import { env } from '@/config/env';
import { AppShell } from '@/components/layout/AppShell';
import { LoadingBlock } from '@/components/feedback/LoadingBlock';
import { MeGate } from './MeGate';
import { LoginPage } from '@/screens/login/LoginPage';

/**
 * 로그인 필수(2026-11-11 사용자 결정). 앱을 열면 MeGate 가 `/api/me` 를 먼저 읽고, 로그인 세션이 없으면(ME_002) `/login` 으로 보낸다.
 * `/login` 은 로그인 화면(비밀번호 암호화, 계약 §7) — 앱 셸·MeGate 밖이라 사용자 확인 없이 열린다.
 */
const AppRoutes = () => (
  <Suspense fallback={<LoadingBlock height={400} />}>
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/*"
        element={
          <MeGate>
            <AppShell />
          </MeGate>
        }
      />
    </Routes>
  </Suspense>
);

/** vite base(예: '/atms/')를 라우터 basename('/atms')으로. 기본 '/' 는 basename 없음 */
const basename = /^\/.+/.test(import.meta.env.BASE_URL) ? import.meta.env.BASE_URL.replace(/\/+$/, '') : undefined;

/**
 * 기본은 주소창 라우팅(BrowserRouter, 하위 경로 배포 시 basename 적용).
 * hash: `/#/home` 형태 — 웹서버(WebtoB)에 SPA 새로고침(404→index.html) 설정을 넣을 수 없을 때.
 */
export const AppRouter = () =>
  env.routerMode === 'hash' ? (
    <HashRouter>
      <AppRoutes />
    </HashRouter>
  ) : (
    <BrowserRouter basename={basename}>
      <AppRoutes />
    </BrowserRouter>
  );
