import { Suspense } from 'react';
import { BrowserRouter, HashRouter, Route, Routes } from 'react-router-dom';
import { env } from '@/config/env';
import { AppShell } from '@/components/layout/AppShell';
import { LoadingBlock } from '@/components/feedback/LoadingBlock';
import { MeGate } from './MeGate';
import { EntryGate } from './EntryGate';
import { LoginPage } from '@/screens/login/LoginPage';

/**
 * 첫 화면은 `/login`(비밀번호 암호화 견본 로그인, 계약 §7) — 탭마다 처음 한 번. EntryGate 가 보낸다.
 *  - [로그인] 성공 또는 [비로그인 진입] → 앱. 같은 탭에서는 새로고침해도 다시 묻지 않는다(entry.ts).
 *  - 앱에 들어가면 MeGate 가 `/api/me` 를 먼저 읽고, 실패하면 서버 문구를 화면 전체에 보여 준다.
 *  - 기본 사용자는 고정 사용자(설계 Q1). 서버 설정 atms.login.enabled=true 일 때만 로그인 세션이 화면 사용자가 된다
 *    (그때 비로그인 진입은 MeGate 의 ME_002 화면에서 막히고, [로그인 화면으로] 로 안내된다).
 */
const AppRoutes = () => (
  <Suspense fallback={<LoadingBlock height={400} />}>
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/*"
        element={
          <EntryGate>
            <MeGate>
              <AppShell />
            </MeGate>
          </EntryGate>
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
